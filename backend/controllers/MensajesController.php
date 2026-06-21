<?php
require_once __DIR__ . '/../helpers/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class MensajesController
{
    public function getConversaciones(): void
    {
        $user = AuthMiddleware::authenticate();
        $conv = Database::fetchAll('
            SELECT cv.*,
                   u.Nombres, u.Apellidos, u.FotoPerfil,
                   (SELECT Contenido FROM Mensajes WHERE IdConversacion = cv.Id ORDER BY FechaEnvio DESC LIMIT 1) as UltimoMensaje,
                   (SELECT FechaEnvio FROM Mensajes WHERE IdConversacion = cv.Id ORDER BY FechaEnvio DESC LIMIT 1) as UltimaFecha,
                   (SELECT COUNT(*) FROM Mensajes WHERE IdConversacion = cv.Id AND Leido = 0 AND IdRemitente != ?) as NoLeidos
            FROM Conversaciones cv
            JOIN Usuarios u ON (u.Id = cv.IdUsuarioFamilia OR u.Id = cv.IdCuidadora)
            WHERE cv.IdUsuarioFamilia = ? OR cv.IdCuidadora = (SELECT Id FROM Cuidadoras WHERE IdUsuario = ?)
            ORDER BY cv.FechaUltimoMensaje DESC
        ', [$user->Id, $user->Id, $user->Id]);

        $result = [];
        foreach ($conv as $c) {
            $result[] = [
                'Id'              => $c->Id,
                'FechaCreacion'   => $c->FechaCreacion,
                'FechaUltimoMensaje'=> $c->UltimaFecha ?: $c->FechaCreacion,
                'CuidadoraId'     => $c->IdCuidadora,
                'Nombres'         => $c->Nombres,
                'Apellidos'       => $c->Apellidos,
                'UltimoMensaje'   => $c->UltimoMensaje,
                'NoLeidos'        => $c->NoLeidos,
            ];
        }
        Response::success($result);
    }

    public function getMensajes(int $conversacionId): void
    {
        $user = AuthMiddleware::authenticate();

        $conv = Database::fetchOne('
            SELECT * FROM Conversaciones WHERE Id = ? AND (IdUsuarioFamilia = ? OR IdCuidadora = (SELECT Id FROM Cuidadoras WHERE IdUsuario = ?))
        ', [$conversacionId, $user->Id, $user->Id]);

        if (!$conv) {
            Response::notFound('Conversación no encontrada');
        }

        $mensajes = Database::fetchAll('
            SELECT m.*, u.Nombres, u.Apellidos
            FROM Mensajes m JOIN Usuarios u ON m.IdRemitente = u.Id
            WHERE m.IdConversacion = ?
            ORDER BY m.FechaEnvio ASC
        ', [$conversacionId]);

        Database::update('Mensajes', ['Leido' => 1], 'IdConversacion = ? AND IdRemitente != ?', [$conversacionId, $user->Id]);

        Response::success($mensajes);
    }

    public function enviarMensaje(int $conversacionId, array $body): void
    {
        $user = AuthMiddleware::authenticate();
        $contenido = trim($body['contenido'] ?? '');

        if (!$contenido) {
            Response::error('El contenido del mensaje es requerido');
        }

        $conv = Database::fetchOne('
            SELECT * FROM Conversaciones WHERE Id = ? AND (IdUsuarioFamilia = ? OR IdCuidadora = (SELECT Id FROM Cuidadoras WHERE IdUsuario = ?))
        ', [$conversacionId, $user->Id, $user->Id]);

        if (!$conv) {
            Response::notFound('Conversación no encontrada');
        }

        Database::insert('Mensajes', [
            'IdConversacion' => $conversacionId,
            'IdRemitente'    => $user->Id,
            'Contenido'      => $contenido,
        ]);

        Database::update('Conversaciones', [
            'FechaUltimoMensaje' => date('Y-m-d H:i:s'),
        ], 'Id = ?', [$conversacionId]);

        Response::success(null, 'Mensaje enviado');
    }

    public function reportarIncidencia(array $body): void
    {
        $user = AuthMiddleware::authenticate();
        $descripcion = trim($body['descripcion'] ?? '');
        $idOrden     = (int) ($body['idOrden'] ?? 0);

        if (!$descripcion) {
            Response::error('La descripción de la incidencia es requerida');
        }

        Database::insert('Incidencias', [
            'IdOrden'     => $idOrden ?: null,
            'Tipo'        => $body['tipo'] ?? 'General',
            'Estado'      => 'Abierta',
            'Descripcion' => $descripcion,
        ]);

        Response::success(null, 'Incidencia reportada. El administrador la revisará pronto.');
    }

    public function solicitarContrato(array $body): void
    {
        $user = AuthMiddleware::authenticate();
        $idCuidadora = (int) ($body['idCuidadora'] ?? 0);
        $fecha       = trim($body['fecha'] ?? '');
        $horas       = (float) ($body['horas'] ?? 0);

        if (!$idCuidadora || !$fecha || !$horas) {
            Response::error('idCuidadora, fecha y horas son requeridos');
        }

        $cuidadora = Database::fetchOne('SELECT * FROM Cuidadoras WHERE Id = ?', [$idCuidadora]);
        if (!$cuidadora) {
            Response::notFound('Cuidadora no encontrada');
        }

        $subtotal = $cuidadora->TarifaHora * $horas;
        $comision = $subtotal * COMMISSION_RATE;
        $total    = $subtotal + $comision;

        $ordenId = Database::insert('Ordenes', [
            'IdCuidadora'     => $idCuidadora,
            'IdUsuarioFamilia'=> $user->Id,
            'TipoServicio'    => 'Cuidado domiciliario',
            'FechaServicio'   => $fecha,
            'TotalHoras'      => $horas,
            'TarifaHora'      => $cuidadora->TarifaHora,
            'Subtotal'        => $subtotal,
            'TarifaPlataforma'=> $comision,
            'Total'           => $total,
            'Estado'          => 'Pendiente',
        ]);

        Database::insert('Conversaciones', [
            'IdCuidadora'     => $idCuidadora,
            'IdUsuarioFamilia'=> $user->Id,
            'FechaUltimoMensaje'=> date('Y-m-d H:i:s'),
        ]);

        Database::insert('Notificaciones', [
            'IdUsuarioDestino' => $cuidadora->IdUsuario,
            'Titulo'           => 'Nueva solicitud de servicio',
            'Descripcion'      => "Una familia ha solicitado un servicio para el {$fecha}",
            'Tipo'             => 'solicitud',
        ]);

        Response::success(['ordenId' => $ordenId], 'Solicitud enviada. La cuidadora la revisará.');
    }
}
