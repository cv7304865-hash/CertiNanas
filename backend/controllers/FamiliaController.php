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
