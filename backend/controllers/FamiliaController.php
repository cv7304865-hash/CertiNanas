<?php
require_once __DIR__ . '/../helpers/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class FamiliaController
{
    public function getSolicitudes(): void
    {
        $user = AuthMiddleware::authenticate();
        $solicitudes = Database::fetchAll('
            SELECT o.*, c.AniosExperiencia, c.TarifaHora,
                   u.Nombres as CuidadoraNombres, u.Apellidos as CuidadoraApellidos, u.FotoPerfil as CuidadoraFoto,
                   m.Nombre as MenorNombre, m.Diagnostico as MenorDiagnostico
            FROM Ordenes o
            JOIN Cuidadoras c ON o.IdCuidadora = c.Id
            JOIN Usuarios u ON c.IdUsuario = u.Id
            LEFT JOIN Menores m ON o.IdMenor = m.Id
            WHERE o.IdUsuarioFamilia = ?
            ORDER BY o.FechaCreacion DESC
        ', [$user->Id]);
        Response::success($solicitudes);
    }

    public function getSolicitud(int $id): void
    {
        $user = AuthMiddleware::authenticate();
        $solicitud = Database::fetchOne('
            SELECT o.*, c.AniosExperiencia, c.TarifaHora,
                   u.Nombres as CuidadoraNombres, u.Apellidos as CuidadoraApellidos, u.FotoPerfil as CuidadoraFoto,
                   u.Email as CuidadoraEmail, u.Telefono as CuidadoraTelefono,
                   m.Nombre as MenorNombre, m.Diagnostico as MenorDiagnostico, m.FechaNacimiento as MenorFechaNac
            FROM Ordenes o
            JOIN Cuidadoras c ON o.IdCuidadora = c.Id
            JOIN Usuarios u ON c.IdUsuario = u.Id
            LEFT JOIN Menores m ON o.IdMenor = m.Id
            WHERE o.Id = ? AND o.IdUsuarioFamilia = ?
        ', [$id, $user->Id]);
        if (!$solicitud) {
            Response::notFound('Solicitud no encontrada');
        }
        Response::success($solicitud);
    }

    public function pagar(int $orderId, array $body): void
    {
        $user = AuthMiddleware::authenticate();
        $metodo = $body['metodo'] ?? '';

        if (!in_array($metodo, ['card', 'yape'])) {
            Response::error('Método de pago inválido. Use card o yape');
        }

        $orden = Database::fetchOne(
            'SELECT o.*, e.Id as EscrowId, e.Estado as EscrowEstado FROM Ordenes o LEFT JOIN Escrow e ON o.IdEscrow = e.Id WHERE o.Id = ? AND o.IdUsuarioFamilia = ?',
            [$orderId, $user->Id]
        );

        if (!$orden) {
            Response::notFound('Orden no encontrada');
        }

        if ($orden->Estado !== 'Pendiente') {
            Response::error('Esta orden ya fue pagada o está en proceso');
        }

        $comision = $orden->Total * COMMISSION_RATE;
        $montoCuidadora = $orden->Total - $comision;

        Database::getConnection()->beginTransaction();
        try {
            Database::update('Ordenes', [
                'Estado'   => 'En Proceso',
                'IdEscrow' => null,
            ], 'Id = ?', [$orderId]);

            $escrowId = Database::insert('Escrow', [
                'IdOrden'        => $orderId,
                'MontoTotal'     => $orden->Total,
                'MontoCuidadora' => $montoCuidadora,
                'MontoPlataforma'=> $comision,
                'Estado'         => 'Retenido',
            ]);

            Database::update('Ordenes', ['IdEscrow' => $escrowId], 'Id = ?', [$orderId]);

            Database::insert('Pagos', [
                'IdOrden'  => $orderId,
                'Monto'    => $orden->Total,
                'MetodoPago'=> $metodo,
                'Estado'   => 'Pagado',
                'FechaPago'=> date('Y-m-d H:i:s'),
            ]);

            Database::insert('Contratos', [
                'IdOrden'        => $orderId,
                'Terminos'       => 'Términos y condiciones del servicio CERTINANAS',
                'AceptadoFamilia'=> 1,
                'FechaAceptacionFamilia' => date('Y-m-d H:i:s'),
            ]);

            Database::commit();
        } catch (Exception $e) {
            Database::getConnection()->rollBack();
            Response::error('Error al procesar el pago: ' . $e->getMessage(), 500);
        }

        Response::success([
            'orderId' => $orderId,
            'escrowId' => $escrowId ?? null,
        ], 'Pago exitoso. El monto está retenido en Escrow hasta completar el servicio.');
    }

    public function getDetalleSolicitud(int $id): void
    {
        $user = AuthMiddleware::authenticate();
        $orden = Database::fetchOne('
            SELECT o.*, u.Nombres as CuidadoraNombres, u.Apellidos as CuidadoraApellidos,
                   m.Nombre as MenorNombre, m.Diagnostico as MenorDiagnostico
            FROM Ordenes o
            INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
            INNER JOIN Usuarios u ON u.Id = c.IdUsuario
            LEFT JOIN Menores m ON m.Id = o.IdMenor
            WHERE o.Id = ? AND o.IdUsuarioFamilia = ?
        ', [$id, $user->Id]);
        if (!$orden) Response::notFound('Orden no encontrada');

        $tareas = Database::fetchAll('
            SELECT ot.Id, t.Descripcion, ot.Decision, 0 as EsPersonalizada
            FROM OrdenTareas ot INNER JOIN Tareas t ON t.Id = ot.IdTarea WHERE ot.IdOrden = ?
        ', [$id]);
        $personalizadas = Database::fetchAll('
            SELECT Id, Descripcion, Decision, 1 as EsPersonalizada FROM OrdenTareasPersonalizadas WHERE IdOrden = ?
        ', [$id]);

        $contrato = Database::fetchOne('SELECT * FROM Contratos WHERE IdOrden = ?', [$id]);

        $negociaciones = Database::fetchAll('
            SELECT n.*, u.Nombres as PropuestoPorNombres, u.Apellidos as PropuestoPorApellidos
            FROM Negociaciones n INNER JOIN Usuarios u ON u.Id = n.IdPropuestoPor
            WHERE n.IdOrden = ? ORDER BY n.FechaCreacion DESC
        ', [$id]);

        $cancelReason = Database::fetchOne("
            SELECT Descripcion FROM Auditoria
            WHERE IdEntidad = ? AND (Accion LIKE '%cancel%' OR Accion LIKE '%rechaz%')
            ORDER BY FechaCreacion DESC LIMIT 1
        ", [$id]);

        $resenas = Database::fetchAll('SELECT Calificacion, Comentario, FechaCreacion FROM Resenas WHERE IdOrden = ?', [$id]);

        Response::success([
            'orden' => $orden,
            'tareas' => array_merge($tareas, $personalizadas),
            'contrato' => $contrato,
            'negociaciones' => $negociaciones,
            'motivoCancelacion' => $cancelReason->Descripcion ?? null,
            'resenas' => $resenas,
        ]);
    }

    public function liberarPago(int $ordenId): void
    {
        $user = AuthMiddleware::authenticate();
        $orden = Database::fetchOne('SELECT * FROM Ordenes WHERE Id = ? AND IdUsuarioFamilia = ?', [$ordenId, $user->Id]);
        if (!$orden) Response::notFound('Orden no encontrada');
        if (!in_array($orden->Estado, ['Completada', 'Finalizada'])) {
            Response::error('El servicio debe estar completado');
        }

        Database::getConnection()->beginTransaction();
        try {
            Database::update('Escrow', [
                'Estado' => 'Liberado',
                'FechaLiberacion' => date('Y-m-d H:i:s'),
            ], 'IdOrden = ?', [$ordenId]);
            Database::update('Ordenes', ['Estado' => 'Finalizada'], 'Id = ?', [$ordenId]);

            $cuidadora = Database::fetchOne('SELECT IdUsuario FROM Cuidadoras WHERE Id = ?', [$orden->IdCuidadora]);
            if ($cuidadora) {
                Database::insert('Notificaciones', [
                    'IdUsuarioDestino' => $cuidadora->IdUsuario,
                    'Titulo' => 'Pago liberado',
                    'Descripcion' => "El pago del servicio #{$ordenId} ha sido liberado.",
                    'Tipo' => 'pago',
                ]);
            }
            $admins = Database::fetchAll('SELECT Id FROM Usuarios u INNER JOIN Roles r ON r.Id = u.IdRol WHERE r.Nombre = ?', ['admin']);
            foreach ($admins as $a) {
                Database::insert('Notificaciones', [
                    'IdUsuarioDestino' => $a->Id,
                    'Titulo' => 'Pago liberado sin incidencias',
                    'Descripcion' => "Pago de orden #{$ordenId} liberado sin incidencias.",
                    'Tipo' => 'pago',
                ]);
            }
            Database::insert('Auditoria', [
                'IdUsuario' => $user->Id,
                'Accion' => 'LIBERAR_PAGO',
                'Entidad' => 'Ordenes',
                'IdEntidad' => $ordenId,
                'Detalle' => 'Pago liberado sin incidencias',
            ]);
            Database::commit();
        } catch (Exception $e) {
            Database::getConnection()->rollBack();
            Response::error('Error al liberar pago: ' . $e->getMessage(), 500);
        }
        Response::success(null, 'Pago liberado exitosamente');
    }

    public function reportarIncidencia(array $body): void
    {
        $user = AuthMiddleware::authenticate();
        $ordenId = $body['ordenId'] ?? null;
        $categoria = $body['categoria'] ?? 'General';
        $descripcion = $body['descripcion'] ?? '';
        $finalizar = $body['finalizar'] ?? false;

        if (!$descripcion) Response::error('Descripción requerida');

        Database::getConnection()->beginTransaction();
        try {
            $incId = Database::insert('Incidencias', [
                'IdReporto' => $user->Id,
                'IdOrden' => $ordenId ? (int)$ordenId : null,
                'Tipo' => $categoria,
                'Descripcion' => $descripcion,
                'Estado' => 'Abierta',
                'FechaCreacion' => date('Y-m-d H:i:s'),
            ]);
            if ($finalizar && $ordenId) {
                Database::update('Ordenes', [
                    'FinalizadaFamilia' => 1,
                    'FechaFinalizacion' => date('Y-m-d H:i:s'),
                    'Estado' => 'Finalizada',
                ], 'Id = ?', [(int)$ordenId]);
            }
            Database::insert('Auditoria', [
                'IdUsuario' => $user->Id,
                'Accion' => 'REPORTAR_INCIDENCIA',
                'Entidad' => 'Incidencias',
                'IdEntidad' => $incId,
                'Detalle' => mb_substr($descripcion, 0, 200),
            ]);
            Database::commit();
        } catch (Exception $e) {
            Database::getConnection()->rollBack();
            Response::error('Error al reportar incidencia: ' . $e->getMessage(), 500);
        }
        Response::success(null, 'Incidencia reportada');
    }

    public function agendarEntrevista(array $body): void
    {
        $user = AuthMiddleware::authenticate();

        $idCuidadora = (int) ($body['idCuidadora'] ?? 0);
        $fecha       = trim($body['fecha'] ?? '');
        $hora        = trim($body['hora'] ?? '');
        $plataforma  = $body['plataforma'] ?? 'google-meet';

        if (!$idCuidadora || !$fecha || !$hora) {
            Response::error('idCuidadora, fecha y hora son requeridos');
        }

        $cuidadora = Database::fetchOne('SELECT * FROM Cuidadoras WHERE Id = ?', [$idCuidadora]);
        if (!$cuidadora) {
            Response::notFound('Cuidadora no encontrada');
        }

        if (!in_array($plataforma, ['google-meet', 'zoom'])) {
            $plataforma = 'google-meet';
        }

        $citaId = Database::insert('Citas', [
            'IdCuidadora'    => $idCuidadora,
            'IdUsuarioFamilia'=> $user->Id,
            'FechaCita'      => $fecha,
            'HoraCita'       => $hora,
            'DuracionMinutos'=> 15,
            'Modalidad'      => $plataforma,
            'Estado'         => 'Programada',
        ]);

        Database::insert('Notificaciones', [
            'IdUsuarioDestino' => $cuidadora->IdUsuario,
            'Titulo'           => 'Nueva entrevista agendada',
            'Descripcion'      => "Una familia ha agendado una entrevista para el {$fecha} a las {$hora}",
            'Tipo'             => 'entrevista',
        ]);

        Response::success([
            'id'         => $citaId,
            'fecha'      => $fecha,
            'hora'       => $hora,
            'plataforma' => $plataforma,
        ], 'Entrevista agendada exitosamente');
    }
}
