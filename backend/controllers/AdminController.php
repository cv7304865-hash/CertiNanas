<?php
require_once __DIR__ . '/../helpers/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminController
{
    private function requireAdmin(): object
    {
        return AuthMiddleware::requireAdmin();
    }

    public function getStats(): void
    {
        $this->requireAdmin();
        $stats = Database::fetchOne("
            SELECT
                (SELECT COUNT(*) FROM Usuarios WHERE Activo = 1) as totalUsers,
                (SELECT COUNT(*) FROM Usuarios u JOIN Roles r ON u.IdRol = r.Id WHERE r.Nombre = 'cuidadora' AND u.Activo = 1) as totalCuidadoras,
                (SELECT COUNT(*) FROM Usuarios u JOIN Roles r ON u.IdRol = r.Id WHERE r.Nombre = 'familia' AND u.Activo = 1) as totalFamilias,
                (SELECT COUNT(*) FROM Usuarios u JOIN Roles r ON u.IdRol = r.Id WHERE r.Nombre = 'admin' AND u.Activo = 1) as totalAdmins
        ");
        Response::success($stats);
    }

    public function getDashboard(): void
    {
        $this->requireAdmin();
        $recentPosts = Database::fetchAll(
            'SELECT p.*, u.Nombres, u.Apellidos, u.Email FROM Postulaciones p JOIN Usuarios u ON p.IdUsuario = u.Id ORDER BY p.FechaCreacion DESC LIMIT 10'
        );
        $incidents = Database::fetchAll(
            'SELECT i.*, o.TipoServicio FROM Incidencias i LEFT JOIN Ordenes o ON i.IdOrden = o.Id ORDER BY i.FechaCreacion DESC LIMIT 10'
        );
        Response::success([
            'recentPostsulaciones' => $recentPosts,
            'recentIncidencias'    => $incidents,
        ]);
    }

    public function getUsuarios(): void
    {
        $this->requireAdmin();
        $usuarios = Database::fetchAll('
            SELECT u.Id, u.Email, u.Nombres, u.Apellidos, r.Nombre as Rol, u.Activo, u.FechaCreacion
            FROM Usuarios u JOIN Roles r ON u.IdRol = r.Id
            ORDER BY u.FechaCreacion DESC
        ');
        Response::success($usuarios);
    }

    public function getCasos(): void
    {
        $this->requireAdmin();
        $tipo = $_GET['tipo'] ?? '';
        $casos = Database::fetchAll(
            'SELECT c.*, u.Nombres, u.Apellidos FROM Casos c LEFT JOIN Usuarios u ON c.IdUsuarioReporta = u.Id' . ($tipo ? ' WHERE c.Tipo = ?' : '') . ' ORDER BY c.FechaCreacion DESC',
            $tipo ? [$tipo] : []
        );
        Response::success($casos);
    }

    public function getPostulaciones(): void
    {
        $this->requireAdmin();
        $posts = Database::fetchAll('
            SELECT p.*, u.Nombres, u.Apellidos, u.Email,
                (SELECT COUNT(*) FROM DocumentosPostulacion d WHERE d.IdPostulacion = p.Id) as TotalDocumentos
            FROM Postulaciones p JOIN Usuarios u ON p.IdUsuario = u.Id
            ORDER BY p.FechaCreacion DESC
        ');
        Response::success($posts);
    }

    public function getPostulacionDocumentos(int $id): void
    {
        $this->requireAdmin();
        $docs = Database::fetchAll('SELECT * FROM DocumentosPostulacion WHERE IdPostulacion = ?', [$id]);
        Response::success($docs);
    }

    public function aprobarPostulacion(int $id, array $body): void
    {
        $this->requireAdmin();
        $post = Database::fetchOne('SELECT * FROM Postulaciones WHERE Id = ?', [$id]);
        if (!$post) {
            Response::notFound('Postulación no encontrada');
        }

        $specialties = $body['specialties'] ?? [];
        Database::update('Postulaciones', ['Estado' => 'Aprobada'], 'Id = ?', [$id]);
        Database::update('Usuarios', ['Activo' => 1], 'Id = ?', [$post->IdUsuario]);
        Database::update('Cuidadoras', ['Disponible' => 1], 'IdUsuario = ?', [$post->IdUsuario]);

        $cuidadora = Database::fetchOne('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?', [$post->IdUsuario]);
        if ($cuidadora) {
            Database::delete('CuidadoraEspecialidades', 'IdCuidadora = ?', [$cuidadora->Id]);
            foreach ($specialties as $esp) {
                $espRow = Database::fetchOne('SELECT Id FROM Especialidades WHERE Nombre = ?', [$esp]);
                if ($espRow) {
                    Database::insert('CuidadoraEspecialidades', [
                        'IdCuidadora'   => $cuidadora->Id,
                        'IdEspecialidad'=> $espRow->Id,
                    ]);
                }
            }
        }

        Database::insert('Notificaciones', [
            'IdUsuarioDestino' => $post->IdUsuario,
            'Titulo'           => 'Postulación aprobada',
            'Descripcion'      => 'Tu postulación fue aprobada. Ya puedes iniciar sesión.',
            'Tipo'             => 'aprobacion',
        ]);

        Database::insert('Auditoria', [
            'IdUsuario' => $_SERVER['HTTP_X_ADMIN_USER'] ?? null,
            'Accion'    => 'APROBAR_POSTULACION',
            'Entidad'   => 'Postulaciones',
            'IdEntidad' => $id,
        ]);

        Response::success(null, 'Postulación aprobada');
    }

    public function rechazarPostulacion(int $id, array $body): void
    {
        $this->requireAdmin();
        $reason = trim($body['reason'] ?? 'Sin especificar');
        $post = Database::fetchOne('SELECT * FROM Postulaciones WHERE Id = ?', [$id]);
        if (!$post) {
            Response::notFound('Postulación no encontrada');
        }

        Database::update('Postulaciones', ['Estado' => 'Rechazada'], 'Id = ?', [$id]);

        Database::insert('Notificaciones', [
            'IdUsuarioDestino' => $post->IdUsuario,
            'Titulo'           => 'Postulación rechazada',
            'Descripcion'      => $reason,
            'Tipo'             => 'rechazo',
        ]);

        Database::insert('Auditoria', [
            'IdUsuario' => $_SERVER['HTTP_X_ADMIN_USER'] ?? null,
            'Accion'    => 'RECHAZAR_POSTULACION',
            'Entidad'   => 'Postulaciones',
            'IdEntidad' => $id,
            'Detalle'   => $reason,
        ]);

        Response::success(null, 'Postulación rechazada');
    }

    public function getContratos(): void
    {
        $this->requireAdmin();
        $contratos = Database::fetchAll('
            SELECT c.*, o.TipoServicio, o.FechaServicio, o.Total,
                   u.Nombres as FamiliaNombres, u.Apellidos as FamiliaApellidos,
                   cu.Nombres as CuidadoraNombres, cu.Apellidos as CuidadoraApellidos
            FROM Contratos c
            JOIN Ordenes o ON c.IdOrden = o.Id
            JOIN Usuarios u ON o.IdUsuarioFamilia = u.Id
            JOIN Cuidadoras cd ON o.IdCuidadora = cd.Id
            JOIN Usuarios cu ON cd.IdUsuario = cu.Id
            ORDER BY c.FechaCreacion DESC
        ');
        Response::success($contratos);
    }

    public function aprobarContrato(int $id): void
    {
        $this->requireAdmin();
        Database::update('Contratos', ['AceptadoAdmin' => 1], 'Id = ?', [$id]);
        Response::success(null, 'Contrato aprobado');
    }

    public function rechazarContrato(int $id): void
    {
        $this->requireAdmin();
        Database::update('Contratos', ['Estado' => 'Rechazado'], 'Id = ?', [$id]);
        Response::success(null, 'Contrato rechazado');
    }

    public function getIncidencias(): void
    {
        $this->requireAdmin();
        $incidencias = Database::fetchAll('
            SELECT i.*, o.TipoServicio, u.Nombres, u.Apellidos
            FROM Incidencias i
            LEFT JOIN Ordenes o ON i.IdOrden = o.Id
            LEFT JOIN Usuarios u ON o.IdUsuarioFamilia = u.Id
            ORDER BY i.FechaCreacion DESC
        ');
        Response::success($incidencias);
    }

    public function cerrarIncidencia(int $id): void
    {
        $this->requireAdmin();
        Database::update('Incidencias', ['Estado' => 'Cerrada'], 'Id = ?', [$id]);
        Response::success(null, 'Incidencia cerrada');
    }

    public function getPerfilesValidados(): void
    {
        $this->requireAdmin();
        $perfiles = Database::fetchAll('
            SELECT u.Id, u.Nombres, u.Apellidos, u.Email, u.Telefono, u.FotoPerfil,
                   c.AniosExperiencia, c.TarifaHora, c.CalificacionPromedio, c.TotalResenas,
                   GROUP_CONCAT(DISTINCT e.Nombre SEPARATOR ", ") as Especialidades
            FROM Cuidadoras c
            JOIN Usuarios u ON c.IdUsuario = u.Id
            LEFT JOIN CuidadoraEspecialidades ce ON c.Id = ce.IdCuidadora
            LEFT JOIN Especialidades e ON ce.IdEspecialidad = e.Id
            WHERE u.Activo = 1
            GROUP BY u.Id
            ORDER BY c.CalificacionPromedio DESC
        ');
        Response::success($perfiles);
    }

    public function getReportes(): void
    {
        $this->requireAdmin();
        $reportes = [
            'ordenesPorMes' => Database::fetchAll("
                SELECT DATE_FORMAT(FechaCreacion, '%Y-%m') as mes, COUNT(*) as total, SUM(Total) as ingresos
                FROM Ordenes GROUP BY DATE_FORMAT(FechaCreacion, '%Y-%m') ORDER BY mes DESC LIMIT 12
            "),
            'usuariosPorRol' => Database::fetchAll("
                SELECT r.Nombre as rol, COUNT(*) as total FROM Usuarios u JOIN Roles r ON u.IdRol = r.Id GROUP BY r.Nombre
            "),
            'calificaciones' => Database::fetchAll("
                SELECT ROUND(Calificacion) as estrellas, COUNT(*) as total FROM Resenas GROUP BY ROUND(Calificacion) ORDER BY estrellas
            "),
        ];
        Response::success($reportes);
    }

    public function getConversaciones(): void
    {
        $this->requireAdmin();
        $conv = Database::fetchAll('
            SELECT cv.*, u.Nombres, u.Apellidos,
                (SELECT Contenido FROM Mensajes WHERE IdConversacion = cv.Id ORDER BY FechaEnvio DESC LIMIT 1) as UltimoMensaje
            FROM Conversaciones cv
            JOIN Usuarios u ON cv.IdUsuarioFamilia = u.Id
            ORDER BY cv.FechaUltimoMensaje DESC
        ');
        Response::success($conv);
    }
}
