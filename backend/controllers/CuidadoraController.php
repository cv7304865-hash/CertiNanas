<?php
require_once __DIR__ . '/../helpers/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class CuidadoraController
{
    public function getPerfil(): void
    {
        $user = AuthMiddleware::authenticate();
        $cuidadora = Database::fetchOne('
            SELECT c.*, u.Nombres, u.Apellidos, u.Email, u.Telefono, u.FotoPerfil, u.NumeroDocumento
            FROM Cuidadoras c JOIN Usuarios u ON c.IdUsuario = u.Id WHERE u.Id = ?
        ', [$user->Id]);
        if (!$cuidadora) {
            Response::notFound('Perfil de cuidadora no encontrado');
        }

        $especialidades = Database::fetchAll('
            SELECT e.Nombre, e.Descripcion FROM CuidadoraEspecialidades ce
            JOIN Especialidades e ON ce.IdEspecialidad = e.Id WHERE ce.IdCuidadora = ?
        ', [$cuidadora->Id]);

        $areas = Database::fetchAll('
            SELECT a.Nombre, a.Descripcion FROM CuidadoraAreas ca
            JOIN Areas a ON ca.IdArea = a.Id WHERE ca.IdCuidadora = ?
        ', [$cuidadora->Id]);

        $formacion = Database::fetchAll('
            SELECT Titulo, Institucion, AnioObtencion FROM CuidadoraFormacion WHERE IdCuidadora = ? ORDER BY Orden ASC
        ', [$cuidadora->Id]);

        $certificaciones = Database::fetchAll('
            SELECT Nombre, EntidadEmisora, FechaObtencion, FechaVencimiento FROM CuidadoraCertificaciones WHERE IdCuidadora = ? ORDER BY Orden ASC
        ', [$cuidadora->Id]);

        $documentos = Database::fetchAll('
            SELECT TipoDocumento, NombreArchivo, Verificado, FechaSubida FROM CuidadoraDocumentos WHERE IdCuidadora = ?
        ', [$cuidadora->Id]);

        $postulacion = Database::fetchOne('SELECT Id, Estado FROM Postulaciones WHERE IdUsuario = ? ORDER BY FechaCreacion DESC LIMIT 1', [$user->Id]);

        $stats = Database::fetchOne('
            SELECT CalificacionPromedio, TotalResenas FROM Cuidadoras WHERE Id = ?
        ', [$cuidadora->Id]);

        $tiposRequeridos = Database::fetchAll('SELECT Nombre FROM TiposRequisito');

        Response::success([
            'user' => [
                'Id'       => $user->Id,
                'Nombres'  => $cuidadora->Nombres,
                'Apellidos'=> $cuidadora->Apellidos,
                'Email'    => $cuidadora->Email,
                'Telefono' => $cuidadora->Telefono,
            ],
            'cuidadora' => [
                'Id'                => $cuidadora->Id,
                'AniosExperiencia'  => $cuidadora->AniosExperiencia,
                'TarifaHora'        => $cuidadora->TarifaHora,
                'DescripcionCorta'  => $cuidadora->DescripcionCorta,
                'DescripcionLarga'  => $cuidadora->DescripcionLarga,
                'CalificacionPromedio' => $cuidadora->CalificacionPromedio,
                'TotalResenas'      => $cuidadora->TotalResenas,
                'Zona'              => $cuidadora->Zona,
                'Disponible'        => $cuidadora->Disponible,
            ],
            'especialidades' => $especialidades,
            'areas'          => $areas,
            'formacion'      => $formacion,
            'certificaciones'=> $certificaciones,
            'documentos'     => $documentos,
            'stats'          => $stats,
            'postulacion'    => $postulacion,
            'tiposRequeridos'=> $tiposRequeridos,
        ]);
    }

    public function updatePerfil(array $body): void
    {
        $user = AuthMiddleware::authenticate();
        $cuidadora = Database::fetchOne('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?', [$user->Id]);
        if (!$cuidadora) {
            Response::notFound('Perfil de cuidadora no encontrado');
        }

        $updates = [];
        if (isset($body['descripcionCorta'])) $updates['DescripcionCorta'] = trim($body['descripcionCorta']);
        if (isset($body['descripcionLarga'])) $updates['DescripcionLarga'] = trim($body['descripcionLarga']);
        if (isset($body['tarifaHora'])) $updates['TarifaHora'] = (float) $body['tarifaHora'];
        if (isset($body['aniosExperiencia'])) $updates['AniosExperiencia'] = (int) $body['aniosExperiencia'];
        if (isset($body['zona'])) $updates['Zona'] = trim($body['zona']);

        if (!empty($updates)) {
            Database::update('Cuidadoras', $updates, 'Id = ?', [$cuidadora->Id]);
        }

        Response::success(null, 'Perfil actualizado');
    }

    public function getServicios(): void
    {
        $user = AuthMiddleware::authenticate();
        $cuidadora = Database::fetchOne('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?', [$user->Id]);
        if (!$cuidadora) {
            Response::notFound('Perfil de cuidadora no encontrado');
        }

        $servicios = Database::fetchAll('
            SELECT o.*, u.Nombres as FamiliaNombres, u.Apellidos as FamiliaApellidos,
                   u.Telefono as FamiliaTelefono, u.Direccion as FamiliaDireccion,
                   m.Nombre as MenorNombre, m.Diagnostico as MenorDiagnostico
            FROM Ordenes o
            JOIN Usuarios u ON o.IdUsuarioFamilia = u.Id
            LEFT JOIN Menores m ON o.IdMenor = m.Id
            WHERE o.IdCuidadora = ?
            ORDER BY o.FechaCreacion DESC
        ', [$cuidadora->Id]);

        Response::success($servicios);
    }

    public function subirDocumento(): void
    {
        $user = AuthMiddleware::authenticate();
        $cuidadora = Database::fetchOne('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?', [$user->Id]);
        if (!$cuidadora) {
            Response::notFound('Perfil de cuidadora no encontrado');
        }

        if (!isset($_FILES['archivo'])) {
            Response::error('No se recibió ningún archivo');
        }

        $tipo = $_POST['tipo'] ?? 'Documento';
        $file = $_FILES['archivo'];
        $ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['pdf', 'jpg', 'jpeg', 'png'];

        if (!in_array($ext, $allowed)) {
            Response::error('Formato no permitido. Use pdf, jpg o png');
        }

        $dir = __DIR__ . '/../uploads/documentos/';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $filename = 'doc_' . $cuidadora->Id . '_' . time() . '.' . $ext;
        move_uploaded_file($file['tmp_name'], $dir . $filename);

        Database::insert('CuidadoraDocumentos', [
            'IdCuidadora'   => $cuidadora->Id,
            'TipoDocumento' => $tipo,
            'NombreArchivo' => $file['name'],
            'RutaArchivo'   => '/backend/uploads/documentos/' . $filename,
        ]);

        Response::success([
            'nombre' => $file['name'],
            'ruta'   => '/backend/uploads/documentos/' . $filename,
        ], 'Documento subido correctamente');
    }
}
