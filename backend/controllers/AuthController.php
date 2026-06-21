<?php
require_once __DIR__ . '/../helpers/Database.php';
require_once __DIR__ . '/../helpers/Response.php';

class AuthController
{
    public function login(array $body): void
    {
        $email    = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';

        if (!$email || !$password) {
            Response::error('Email y contraseña son requeridos');
        }

        $user = Database::fetchOne(
            'SELECT u.*, r.Nombre as RolNombre FROM Usuarios u JOIN Roles r ON u.IdRol = r.Id WHERE u.Email = ? AND u.Activo = 1',
            [$email]
        );

        if (!$user || !password_verify($password, $user->PasswordHash)) {
            Response::error('Credenciales inválidas', 401);
        }

        $token = bin2hex(random_bytes(64));
        Database::insert('Sesiones', [
            'IdUsuario'       => $user->Id,
            'Token'           => $token,
            'FechaExpiracion' => date('Y-m-d H:i:s', time() + JWT_EXPIRY),
        ]);

        $cuidadoraId = null;
        if ($user->RolNombre === 'cuidadora') {
            $cuidadora = Database::fetchOne('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?', [$user->Id]);
            $cuidadoraId = $cuidadora ? $cuidadora->Id : null;
        }

        Response::success([
            'token'        => $token,
            'user'         => [
                'id'         => $user->Id,
                'email'      => $user->Email,
                'nombres'    => $user->Nombres,
                'apellidos'  => $user->Apellidos,
                'rol'        => $user->RolNombre,
                'fotoPerfil' => $user->FotoPerfil,
                'telefono'   => $user->Telefono,
            ],
            'cuidadora_id' => $cuidadoraId,
        ], 'Inicio de sesión exitoso');
    }

    public function register(array $body): void
    {
        $email    = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';
        $nombres  = trim($body['nombres'] ?? '');
        $apellidos = trim($body['apellidos'] ?? '');
        $rol       = $body['rol'] ?? '';
        $telefono  = trim($body['telefono'] ?? '');
        $numDoc    = trim($body['numeroDocumento'] ?? '');

        if (!$email || !$password || !$nombres || !$apellidos || !$rol) {
            Response::error('Todos los campos obligatorios deben estar llenos');
        }

        if (!in_array($rol, ['familia', 'cuidadora'])) {
            Response::error('Rol inválido. Debe ser familia o cuidadora');
        }

        if (strlen($password) < 6) {
            Response::error('La contraseña debe tener al menos 6 caracteres');
        }

        $existing = Database::fetchOne('SELECT Id FROM Usuarios WHERE Email = ?', [$email]);
        if ($existing) {
            Response::error('El email ya está registrado', 409);
        }

        $rolRow = Database::fetchOne('SELECT Id FROM Roles WHERE Nombre = ?', [$rol]);
        if (!$rolRow) {
            Response::error('Rol no encontrado en el sistema');
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);

        $userId = Database::insert('Usuarios', [
            'Email'            => $email,
            'PasswordHash'     => $hash,
            'Nombres'          => $nombres,
            'Apellidos'        => $apellidos,
            'NumeroDocumento'  => $numDoc ?: null,
            'Telefono'         => $telefono ?: null,
            'IdRol'            => $rolRow->Id,
            'EmailConfirmado'  => 0,
            'TerminosAceptados'=> 1,
            'Activo'           => 0,
        ]);

        if ($rol === 'cuidadora') {
            $cuidadoraId = Database::insert('Cuidadoras', [
                'IdUsuario'  => $userId,
                'Disponible' => 0,
            ]);
            Database::insert('Postulaciones', [
                'IdUsuario' => $userId,
                'Estado'    => 'Pendiente',
            ]);
        }

        // Registrar en auditoría
        Database::insert('Auditoria', [
            'IdUsuario' => $userId,
            'Accion'    => 'REGISTRO',
            'Entidad'   => 'Usuarios',
            'IdEntidad' => $userId,
            'Detalle'   => "Nuevo registro de {$rol}: {$nombres} {$apellidos}",
        ]);

        Response::success([
            'userId' => $userId,
            'rol'    => $rol,
        ], 'Registro exitoso. Tu cuenta está pendiente de verificación.');
    }

    public function submitReview(array $body): void
    {
        $user = AuthMiddleware::authenticate();

        $idOrden      = (int) ($body['idOrden'] ?? 0);
        $calificacion = (int) ($body['calificacion'] ?? 0);
        $comentario   = trim($body['comentario'] ?? '');

        if (!$idOrden || $calificacion < 1 || $calificacion > 5) {
            Response::error('idOrden y calificacion (1-5) son requeridos');
        }

        $orden = Database::fetchOne(
            'SELECT o.*, o.IdCuidadora FROM Ordenes o WHERE o.Id = ? AND o.IdUsuarioFamilia = ?',
            [$idOrden, $user->Id]
        );

        if (!$orden) {
            Response::notFound('Orden no encontrada');
        }

        if ($orden->Estado !== 'Completada') {
            Response::error('Solo se pueden reseñar órdenes completadas');
        }

        Database::insert('Resenas', [
            'IdCuidadora'     => $orden->IdCuidadora,
            'IdUsuarioFamilia'=> $user->Id,
            'Calificacion'    => $calificacion,
            'Comentario'      => $comentario,
            'FechaResena'     => date('Y-m-d'),
        ]);

        $avg = Database::fetchOne(
            'SELECT AVG(Calificacion) as promedio, COUNT(*) as total FROM Resenas WHERE IdCuidadora = ? AND Visible = 1',
            [$orden->IdCuidadora]
        );

        if ($avg) {
            Database::update('Cuidadoras', [
                'CalificacionPromedio' => round($avg->promedio, 2),
                'TotalResenas'         => (int) $avg->total,
            ], 'Id = ?', [(int) $orden->IdCuidadora]);
        }

        Response::success(null, 'Reseña enviada correctamente');
    }

    public function uploadProfilePhoto(): void
    {
        $user = AuthMiddleware::authenticate();

        if (!isset($_FILES['foto'])) {
            Response::error('No se recibió ningún archivo');
        }

        $file = $_FILES['foto'];
        $ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp'];

        if (!in_array($ext, $allowed)) {
            Response::error('Formato no permitido. Use jpg, png o webp');
        }

        $dir = __DIR__ . '/../uploads/perfiles/';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $filename = 'user_' . $user->Id . '_' . time() . '.' . $ext;
        move_uploaded_file($file['tmp_name'], $dir . $filename);

        $url = '/backend/uploads/perfiles/' . $filename;
        Database::update('Usuarios', ['FotoPerfil' => $url], 'Id = ?', [$user->Id]);

        Response::success(['fotoPerfil' => $url], 'Foto actualizada');
    }
}
