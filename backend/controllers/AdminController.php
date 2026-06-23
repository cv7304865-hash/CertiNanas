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

    // ========================================================================
    //  CONTRATO DETALLE
    // ========================================================================
    public function getContratoDetalle(int $id): void
    {
        $this->requireAdmin();
        $contrato = Database::fetchOne('
            SELECT o.*, u.Nombres as FamiliaNombres, u.Apellidos as FamiliaApellidos,
                   uc.Nombres as CuidadoraNombres, uc.Apellidos as CuidadoraApellidos,
                   m.Nombre as MenorNombre, m.Diagnostico as MenorDiagnostico
            FROM Ordenes o
            INNER JOIN Usuarios u ON u.Id = o.IdUsuarioFamilia
            INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
            INNER JOIN Usuarios uc ON uc.Id = c.IdUsuario
            LEFT JOIN Menores m ON m.Id = o.IdMenor
            WHERE o.Id = ?
        ', [$id]);
        if (!$contrato) Response::notFound('Contrato no encontrado');

        $tareas = Database::fetchAll('
            SELECT ot.Id, t.Descripcion, t.IdCategoria, ot.Decision, 0 as EsPersonalizada
            FROM OrdenTareas ot INNER JOIN Tareas t ON t.Id = ot.IdTarea WHERE ot.IdOrden = ?
        ', [$id]);
        $personalizadas = Database::fetchAll('
            SELECT Id, Descripcion, Decision, 1 as EsPersonalizada FROM OrdenTareasPersonalizadas WHERE IdOrden = ?
        ', [$id]);

        $escrow = Database::fetchOne('SELECT * FROM Escrow WHERE IdOrden = ?', [$id]);
        $pago = Database::fetchOne("SELECT * FROM Pagos WHERE IdOrden = ? ORDER BY FechaPago DESC LIMIT 1", [$id]);

        Response::success([
            'contrato' => $contrato,
            'tareas' => array_merge($tareas, $personalizadas),
            'escrow' => $escrow,
            'pago' => $pago,
        ]);
    }

    // ========================================================================
    //  INCIDENCIA DETALLE
    // ========================================================================
    public function getIncidenciaDetalle(int $id): void
    {
        $this->requireAdmin();
        $inc = Database::fetchOne('
            SELECT i.*, ur.Nombres as ReportoNombres, ur.Apellidos as ReportoApellidos, ur.IdRol as ReportoRol,
                   o.TipoServicio, o.Estado as OrdenEstado, o.FechaServicio, o.TotalHoras, o.TarifaHora, o.Total,
                   uf.Nombres as FamiliaNombres, uf.Apellidos as FamiliaApellidos,
                   uc.Nombres as CuidadoraNombres, uc.Apellidos as CuidadoraApellidos,
                   m.Nombre as MenorNombre
            FROM Incidencias i
            LEFT JOIN Usuarios ur ON ur.Id = i.IdReporto
            LEFT JOIN Ordenes o ON o.Id = i.IdOrden
            LEFT JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
            LEFT JOIN Cuidadoras cu ON cu.Id = o.IdCuidadora
            LEFT JOIN Usuarios uc ON uc.Id = cu.IdUsuario
            LEFT JOIN Menores m ON m.Id = o.IdMenor
            WHERE i.Id = ?
        ', [$id]);
        if (!$inc) Response::notFound('Incidencia no encontrada');

        $mediaciones = Database::fetchAll('SELECT * FROM Casos WHERE IdOrden = ? ORDER BY FechaCreacion DESC', [$inc->IdOrden]);
        $auditoria = Database::fetchAll('
            SELECT a.*, CONCAT(u.Nombres, " ", u.Apellidos) as UserNombre
            FROM Auditoria a LEFT JOIN Usuarios u ON u.Id = a.IdUsuario
            WHERE a.Entidad = "Incidencias" AND a.IdEntidad = ?
            ORDER BY a.FechaCreacion DESC
        ', [$id]);

        Response::success([
            'incidencia' => $inc,
            'mediaciones' => $mediaciones,
            'auditoria' => $auditoria,
        ]);
    }

    // ========================================================================
    //  MEDIACIONES
    // ========================================================================
    public function getMediaciones(): void
    {
        $this->requireAdmin();
        $rows = Database::fetchAll('
            SELECT c.Id, c.IdOrden as OrdenId, c.Tipo as Estado, c.FechaCreacion,
                   u.Nombres as FamiliaNombres, u.Apellidos as FamiliaApellidos,
                   uc.Nombres as CuidadoraNombres, uc.Apellidos as CuidadoraApellidos,
                   EXISTS(SELECT 1 FROM Auditoria WHERE Entidad = "Casos" AND IdEntidad = c.Id AND Accion LIKE "%visto%") as TieneVb
            FROM Casos c
            INNER JOIN Ordenes o ON o.Id = c.IdOrden
            INNER JOIN Usuarios u ON u.Id = o.IdUsuarioFamilia
            INNER JOIN Cuidadoras cu ON cu.Id = o.IdCuidadora
            INNER JOIN Usuarios uc ON uc.Id = cu.IdUsuario
            ORDER BY c.FechaCreacion DESC
        ');
        foreach ($rows as &$r) {
            $r->AuditLog = Database::fetchAll('
                SELECT Accion, FechaCreacion, CONCAT(u.Nombres, " ", u.Apellidos) as adminNombre
                FROM Auditoria a LEFT JOIN Usuarios u ON u.Id = a.IdUsuario
                WHERE a.Entidad = "Casos" AND a.IdEntidad = ?
                ORDER BY a.FechaCreacion DESC
            ', [$r->Id]);
        }
        Response::success($rows);
    }

    public function getMediacionDetalle(int $id): void
    {
        $this->requireAdmin();
        $caso = Database::fetchOne('
            SELECT c.*, o.Id as OrdenId, o.FechaServicio, o.TotalHoras, o.TarifaHora, o.Total, o.Estado as OrdenEstado,
                   uf.Nombres as FamiliaNombres, uf.Apellidos as FamiliaApellidos, uf.Email as FamiliaEmail, uf.Telefono as FamiliaTelefono,
                   uc.Nombres as CuidadoraNombres, uc.Apellidos as CuidadoraApellidos, uc.Email as CuidadoraEmail, uc.Telefono as CuidadoraTelefono
            FROM Casos c
            INNER JOIN Ordenes o ON o.Id = c.IdOrden
            INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
            INNER JOIN Cuidadoras cu ON cu.Id = o.IdCuidadora
            INNER JOIN Usuarios uc ON uc.Id = cu.IdUsuario
            WHERE c.Id = ?
        ', [$id]);
        if (!$caso) Response::notFound('Mediación no encontrada');

        $auditoria = Database::fetchAll('
            SELECT a.*, CONCAT(u.Nombres, " ", u.Apellidos) as adminNombre
            FROM Auditoria a LEFT JOIN Usuarios u ON u.Id = a.IdUsuario
            WHERE a.Entidad = "Casos" AND a.IdEntidad = ?
            ORDER BY a.FechaCreacion DESC
        ', [$id]);

        $incidencias = Database::fetchAll('SELECT Id, Tipo, Estado, Descripcion, FechaCreacion FROM Incidencias WHERE IdOrden = ?', [$caso->OrdenId]);

        $mensajes = Database::fetchAll('
            SELECT m.Contenido, m.FechaCreacion, CONCAT(u.Nombres, " ", u.Apellidos) as RemitenteNombre
            FROM Mensajes m
            INNER JOIN Conversaciones cv ON cv.Id = m.IdConversacion
            LEFT JOIN Usuarios u ON u.Id = m.IdRemitente
            WHERE cv.IdCuidadora = (SELECT Id FROM Cuidadoras WHERE IdUsuario = (SELECT IdUsuario FROM Cuidadoras WHERE Id = (SELECT IdCuidadora FROM Ordenes WHERE Id = ?)))
              AND cv.IdUsuarioFamilia = (SELECT IdUsuarioFamilia FROM Ordenes WHERE Id = ?)
            ORDER BY m.FechaCreacion ASC
        ', [$caso->OrdenId, $caso->OrdenId]);

        Response::success([
            'caso' => $caso,
            'auditoria' => $auditoria,
            'incidencias' => $incidencias,
            'mensajes' => $mensajes,
        ]);
    }

    public function agendarMediacion(array $body): void
    {
        $this->requireAdmin();
        $idCuidadora = (int)($body['idCuidadora'] ?? 0);
        $idFamilia = (int)($body['idFamilia'] ?? 0);
        $fecha = trim($body['fecha'] ?? '');
        $hora = trim($body['hora'] ?? '');
        $plataforma = $body['plataforma'] ?? 'google-meet';

        if (!$idCuidadora || !$idFamilia || !$fecha || !$hora) {
            Response::error('idCuidadora, idFamilia, fecha y hora son requeridos');
        }

        Database::getConnection()->beginTransaction();
        try {
            $citaId = Database::insert('Citas', [
                'IdCuidadora' => $idCuidadora,
                'IdUsuarioFamilia' => $idFamilia,
                'FechaCita' => $fecha,
                'HoraCita' => $hora,
                'DuracionMinutos' => 30,
                'Modalidad' => $plataforma === 'zoom' ? 'Zoom' : 'Google Meet',
                'Estado' => 'Programada',
            ]);

            $conv = Database::fetchOne('SELECT Id FROM Conversaciones WHERE IdCuidadora = ? AND IdUsuarioFamilia = ?', [$idCuidadora, $idFamilia]);
            if (!$conv) {
                $convId = Database::insert('Conversaciones', [
                    'IdCuidadora' => $idCuidadora,
                    'IdUsuarioFamilia' => $idFamilia,
                ]);
                $conv = (object)['Id' => $convId];
            }

            $linkId = substr(bin2hex(random_bytes(6)), 0, 10);
            $enlace = $plataforma === 'zoom'
                ? "https://zoom.us/j/{$linkId}"
                : "https://meet.google.com/{$linkId}";

            Database::insert('Mensajes', [
                'IdConversacion' => $conv->Id,
                'IdRemitente' => $idFamilia,
                'Contenido' => "MEDIACIÓN - VIDEOCONFERENCIA\n\nFecha: {$fecha}\nHora: {$hora}\nPlataforma: {$plataforma}\nEnlace: {$enlace}\n\nEl administrador ha programado esta reunión de mediación.",
            ]);
            Database::update('Conversaciones', ['FechaUltimoMensaje' => date('Y-m-d H:i:s')], 'Id = ?', [$conv->Id]);

            Database::commit();
        } catch (Exception $e) {
            Database::getConnection()->rollBack();
            Response::error('Error al agendar mediación: ' . $e->getMessage(), 500);
        }
        Response::success(null, 'Mediación agendada');
    }

    // ========================================================================
    //  ESCROWS / TRANSACCIONES
    // ========================================================================
    public function getEscrows(): void
    {
        $this->requireAdmin();
        $rows = Database::fetchAll('
            SELECT e.*, o.Estado as OrdenEstado, o.FechaServicio, o.HoraInicio, o.HoraFin, o.TotalHoras, o.TarifaHora, o.Total, o.Subtotal, o.TarifaPlataforma,
                   o.ConfirmadaFamilia, o.ConfirmadaCuidadora, o.FinalizadaFamilia, o.FinalizadaCuidadora, o.FechaFinalizacion,
                   uf.Nombres as FamiliaNombres, uf.Apellidos as FamiliaApellidos,
                   uc.Nombres as CuidadoraNombres, uc.Apellidos as CuidadoraApellidos,
                   m.Nombre as MenorNombre
            FROM Escrow e
            INNER JOIN Ordenes o ON o.Id = e.IdOrden
            INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
            INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
            INNER JOIN Usuarios uc ON uc.Id = c.IdUsuario
            LEFT JOIN Menores m ON m.Id = o.IdMenor
            ORDER BY e.FechaCreacion DESC
        ');
        Response::success($rows);
    }

    public function getEscrowDetalle(int $id): void
    {
        $this->requireAdmin();
        $escrow = Database::fetchOne('
            SELECT e.*, o.Estado as OrdenEstado, o.FechaServicio, o.HoraInicio, o.HoraFin, o.TotalHoras, o.TarifaHora, o.Total, o.Subtotal, o.TarifaPlataforma,
                   o.ConfirmadaFamilia, o.ConfirmadaCuidadora, o.FinalizadaFamilia, o.FinalizadaCuidadora, o.FechaFinalizacion,
                   uf.Nombres as FamiliaNombres, uf.Apellidos as FamiliaApellidos,
                   uc.Nombres as CuidadoraNombres, uc.Apellidos as CuidadoraApellidos,
                   m.Nombre as MenorNombre,
                   p.MetodoPago, p.Estado as PagoEstado, p.FechaPago
            FROM Escrow e
            INNER JOIN Ordenes o ON o.Id = e.IdOrden
            INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
            INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
            INNER JOIN Usuarios uc ON uc.Id = c.IdUsuario
            LEFT JOIN Menores m ON m.Id = o.IdMenor
            LEFT JOIN Pagos p ON p.IdOrden = o.Id
            WHERE e.Id = ?
        ', [$id]);
        if (!$escrow) Response::notFound('Escrow no encontrado');

        $auditoria = Database::fetchAll('
            SELECT a.*, CONCAT(u.Nombres, " ", u.Apellidos) as adminNombre
            FROM Auditoria a LEFT JOIN Usuarios u ON u.Id = a.IdUsuario
            WHERE a.Entidad = "Escrow" AND a.IdEntidad = ?
            ORDER BY a.FechaCreacion DESC
        ', [$id]);

        $incidencias = Database::fetchAll('SELECT Id, Tipo, Estado, Descripcion, FechaCreacion FROM Incidencias WHERE IdOrden = ?', [$escrow->IdOrden]);

        Response::success([
            'escrow' => $escrow,
            'auditoria' => $auditoria,
            'incidencias' => $incidencias,
        ]);
    }

    public function getTransacciones(): void
    {
        $this->requireAdmin();
        $rows = Database::fetchAll('
            SELECT e.Id, o.Id as OrdenId,
                   uf.Nombres as FamiliaNombres, uf.Apellidos as FamiliaApellidos,
                   uc.Nombres as CuidadoraNombres, uc.Apellidos as CuidadoraApellidos,
                   e.MontoTotal, e.MontoPlataforma as Comision, e.MontoCuidadora,
                   e.Estado, COALESCE(p.MetodoPago, "Tarjeta") as MetodoPago, e.FechaCreacion
            FROM Escrow e
            INNER JOIN Ordenes o ON o.Id = e.IdOrden
            INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
            INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
            INNER JOIN Usuarios uc ON uc.Id = c.IdUsuario
            LEFT JOIN Pagos p ON p.IdOrden = o.Id
            ORDER BY e.FechaCreacion DESC
        ');
        Response::success($rows);
    }

    // ========================================================================
    //  SUSPENDER / ACTIVAR USUARIO
    // ========================================================================
    public function suspenderUsuario(int $id): void
    {
        $this->requireAdmin();
        $usuario = Database::fetchOne('SELECT * FROM Usuarios WHERE Id = ?', [$id]);
        if (!$usuario) Response::notFound('Usuario no encontrado');

        $nuevoEstado = $usuario->Suspendido ? 0 : 1;
        Database::update('Usuarios', ['Suspendido' => $nuevoEstado, 'Activo' => $nuevoEstado ? 0 : 1], 'Id = ?', [$id]);

        if ($nuevoEstado) {
            Database::update('Ordenes', ['Estado' => 'Cancelada'], "IdCuidadora IN (SELECT Id FROM Cuidadoras WHERE IdUsuario = ?) AND Estado = 'Pendiente'", [$id]);
        }

        Database::insert('Auditoria', [
            'IdUsuario' => $_SERVER['HTTP_X_ADMIN_USER'] ?? null,
            'Accion' => $nuevoEstado ? 'SUSPENDER_USUARIO' : 'ACTIVAR_USUARIO',
            'Entidad' => 'Usuarios',
            'IdEntidad' => $id,
        ]);
        Response::success(['suspendido' => (bool)$nuevoEstado], $nuevoEstado ? 'Usuario suspendido' : 'Usuario activado');
    }

    public function getQuejasUsuario(int $id): void
    {
        $this->requireAdmin();
        $quejas = Database::fetchAll('
            SELECT i.*, o.TipoServicio
            FROM Incidencias i
            LEFT JOIN Ordenes o ON o.Id = i.IdOrden
            WHERE i.IdOrden IN (SELECT Id FROM Ordenes WHERE IdCuidadora IN (SELECT Id FROM Cuidadoras WHERE IdUsuario = ?))
            ORDER BY i.FechaCreacion DESC
        ', [$id]);
        Response::success($quejas);
    }

    // ========================================================================
    //  DOCUMENTOS DE POSTULACION (individual)
    // ========================================================================
    public function aprobarDocumentoPostulacion(int $postId, int $docId): void
    {
        $this->requireAdmin();
        Database::update('DocumentosPostulacion', ['Estado' => 'Aprobado'], 'Id = ? AND IdPostulacion = ?', [$docId, $postId]);
        Database::insert('Auditoria', [
            'IdUsuario' => $_SERVER['HTTP_X_ADMIN_USER'] ?? null,
            'Accion' => 'APROBAR_DOCUMENTO',
            'Entidad' => 'DocumentosPostulacion',
            'IdEntidad' => $docId,
        ]);
        Response::success(null, 'Documento aprobado');
    }

    public function rechazarDocumentoPostulacion(int $postId, int $docId, array $body): void
    {
        $this->requireAdmin();
        $motivo = $body['motivo'] ?? 'Documento no cumple requisitos';
        Database::update('DocumentosPostulacion', ['Estado' => 'Rechazado', 'MotivoRechazo' => $motivo], 'Id = ? AND IdPostulacion = ?', [$docId, $postId]);
        Database::insert('Auditoria', [
            'IdUsuario' => $_SERVER['HTTP_X_ADMIN_USER'] ?? null,
            'Accion' => 'RECHAZAR_DOCUMENTO',
            'Entidad' => 'DocumentosPostulacion',
            'IdEntidad' => $docId,
            'Detalle' => $motivo,
        ]);
        Response::success(null, 'Documento rechazado');
    }

    // ========================================================================
    //  REPORTES mejorados (para dashboard)
    // ========================================================================
    public function getReportesFull(): void
    {
        $this->requireAdmin();
        $totalOrdenes = Database::fetchOne('SELECT COUNT(*) as c FROM Ordenes')->c;
        $totalPagos = Database::fetchOne('SELECT COUNT(*) as c FROM Pagos')->c;
        $totalCompletadas = Database::fetchOne("SELECT COUNT(*) as c FROM Ordenes WHERE Estado = 'Completada'")->c;
        $totalCanceladas = Database::fetchOne("SELECT COUNT(*) as c FROM Ordenes WHERE Estado = 'Cancelada'")->c;
        $ingresos = Database::fetchOne("SELECT COALESCE(SUM(Monto), 0) as total FROM Pagos WHERE Estado = 'Completado'")->total;
        $citasCompletadas = Database::fetchOne("SELECT COUNT(*) as c FROM Citas WHERE Estado = 'Completada'")->c;
        $resenasPromedio = Database::fetchOne('SELECT COALESCE(AVG(Calificacion), 0) as prom FROM Resenas')->prom;

        $ordenesPorEstado = Database::fetchAll("SELECT Estado, COUNT(*) as count FROM Ordenes GROUP BY Estado ORDER BY count DESC");
        $ordenesPorMes = Database::fetchAll("SELECT DATE_FORMAT(FechaCreacion, '%Y-%m') as mes, COUNT(*) as count FROM Ordenes GROUP BY mes ORDER BY mes ASC");
        $ingresosPorMes = Database::fetchAll("
            SELECT DATE_FORMAT(p.FechaPago, '%Y-%m') as mes, COALESCE(SUM(p.Monto), 0) as total
            FROM Pagos p WHERE p.Estado = 'Completado'
            GROUP BY mes ORDER BY mes ASC
        ");
        $topCuidadoras = Database::fetchAll('
            SELECT CONCAT(u.Nombres, " ", u.Apellidos) as nombre, COUNT(o.Id) as total
            FROM Ordenes o
            INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
            INNER JOIN Usuarios u ON u.Id = c.IdUsuario
            GROUP BY c.Id ORDER BY total DESC LIMIT 5
        ');
        $pagosPorEstado = Database::fetchAll("SELECT Estado, COUNT(*) as count FROM Pagos GROUP BY Estado");

        Response::success([
            'totalOrdenes' => $totalOrdenes,
            'totalPagos' => $totalPagos,
            'totalCompletadas' => $totalCompletadas,
            'totalCanceladas' => $totalCanceladas,
            'ingresos' => (float)$ingresos,
            'citasCompletadas' => $citasCompletadas,
            'resenasPromedio' => round((float)$resenasPromedio, 1),
            'ordenesPorEstado' => $ordenesPorEstado,
            'ordenesPorMes' => $ordenesPorMes,
            'ingresosPorMes' => $ingresosPorMes,
            'topCuidadoras' => $topCuidadoras,
            'pagosPorEstado' => $pagosPorEstado,
        ]);
    }
}
