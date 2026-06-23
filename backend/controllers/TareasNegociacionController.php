<?php
require_once __DIR__ . '/../helpers/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class TareasNegociacionController
{
    public function getCategorias(): void
    {
        AuthMiddleware::authenticate();
        $cats = Database::fetchAll('SELECT * FROM TareasCategoria ORDER BY Nombre ASC');
        Response::success($cats);
    }

    public function getTareasByCategoria(int $catId): void
    {
        AuthMiddleware::authenticate();
        $tareas = Database::fetchAll('SELECT * FROM Tareas WHERE IdCategoria = ? ORDER BY Descripcion ASC', [$catId]);
        Response::success($tareas);
    }

    public function getTareasAll(): void
    {
        AuthMiddleware::authenticate();
        $tareas = Database::fetchAll('
            SELECT t.*, tc.Nombre as CategoriaNombre
            FROM Tareas t
            LEFT JOIN TareasCategoria tc ON tc.Id = t.IdCategoria
            ORDER BY tc.Nombre, t.Descripcion
        ');
        Response::success($tareas);
    }

    public function getOrdenTareas(int $ordenId): void
    {
        $user = AuthMiddleware::authenticate();
        $tareas = Database::fetchAll('
            SELECT ot.Id, t.Descripcion, t.IdCategoria, ot.Decision
            FROM OrdenTareas ot
            INNER JOIN Tareas t ON t.Id = ot.IdTarea
            WHERE ot.IdOrden = ?
        ', [$ordenId]);
        $personalizadas = Database::fetchAll('
            SELECT Id, Descripcion, Decision FROM OrdenTareasPersonalizadas WHERE IdOrden = ?
        ', [$ordenId]);
        Response::success([
            'tareas' => $tareas,
            'personalizadas' => $personalizadas,
        ]);
    }

    public function saveOrdenTareas(int $ordenId, array $body): void
    {
        $user = AuthMiddleware::authenticate();
        $tareaIds = $body['tareaIds'] ?? [];
        $personalizadas = $body['personalizadas'] ?? [];

        Database::getConnection()->beginTransaction();
        try {
            Database::delete('OrdenTareas', 'IdOrden = ?', [$ordenId]);
            Database::delete('OrdenTareasPersonalizadas', 'IdOrden = ?', [$ordenId]);

            foreach ($tareaIds as $tid) {
                Database::insert('OrdenTareas', [
                    'IdOrden' => $ordenId,
                    'IdTarea' => (int)$tid,
                    'Decision' => 'Pendiente',
                ]);
            }
            foreach ($personalizadas as $pd) {
                Database::insert('OrdenTareasPersonalizadas', [
                    'IdOrden' => $ordenId,
                    'Descripcion' => $pd['descripcion'] ?? '',
                    'Decision' => 'Pendiente',
                ]);
            }
            Database::commit();
        } catch (Exception $e) {
            Database::getConnection()->rollBack();
            Response::error('Error al guardar tareas: ' . $e->getMessage(), 500);
        }
        Response::success(null, 'Tareas guardadas');
    }

    public function solicitudesPendientesCuidadora(): void
    {
        $user = AuthMiddleware::authenticate();
        $cuidadora = Database::fetchOne('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?', [$user->Id]);
        if (!$cuidadora) Response::error('Cuidadora no encontrada');

        $solicitudes = Database::fetchAll('
            SELECT o.Id, o.FechaServicio, o.TotalHoras, o.TarifaHora, o.Total, o.Subtotal,
                   o.Estado, o.EstadoNegociacion, o.HoraInicio, o.HoraFin, o.TipoServicio, o.FechaCreacion,
                   u.Nombres as FamiliaNombres, u.Apellidos as FamiliaApellidos,
                   m.Nombre as MenorNombre, m.Diagnostico as MenorDiagnostico
            FROM Ordenes o
            INNER JOIN Usuarios u ON u.Id = o.IdUsuarioFamilia
            LEFT JOIN Menores m ON m.Id = o.IdMenor
            WHERE o.IdCuidadora = ? AND o.Estado IN (\'Pendiente\', \'Negociacion\')
            ORDER BY o.FechaCreacion DESC
        ', [$cuidadora->Id]);

        foreach ($solicitudes as &$s) {
            $s->tareas = Database::fetchAll('
                SELECT ot.Id, t.Descripcion, t.IdCategoria, ot.Decision, 0 as EsPersonalizada
                FROM OrdenTareas ot
                INNER JOIN Tareas t ON t.Id = ot.IdTarea
                WHERE ot.IdOrden = ?
            ', [$s->Id]);
            $pers = Database::fetchAll('
                SELECT Id, Descripcion, Decision, 1 as EsPersonalizada
                FROM OrdenTareasPersonalizadas WHERE IdOrden = ?
            ', [$s->Id]);
            $s->tareas = array_merge($s->tareas, $pers);
            $s->TotalPropuestas = Database::fetchOne('SELECT COUNT(*) as c FROM Negociaciones WHERE IdOrden = ?', [$s->Id])->c ?? 0;
        }

        Response::success($solicitudes);
    }

    public function enviarRespuestaNegociacion(int $ordenId, array $body): void
    {
        $user = AuthMiddleware::authenticate();
        $respuestas = $body['respuestas'] ?? [];

        if (!$ordenId || empty($respuestas)) {
            Response::error('ordenId y respuestas requeridos');
        }

        $cuidadora = Database::fetchOne('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?', [$user->Id]);
        if (!$cuidadora) Response::error('Cuidadora no encontrada');

        $orden = Database::fetchOne('SELECT * FROM Ordenes WHERE Id = ? AND IdCuidadora = ?', [$ordenId, $cuidadora->Id]);
        if (!$orden) Response::error('Orden no encontrada');

        $todasAceptadas = true;
        $todasRechazadas = true;
        $hayNegociacion = false;

        Database::getConnection()->beginTransaction();
        try {
            foreach ($respuestas as $r) {
                $tareaId = (int)($r['tareaId'] ?? 0);
                $decision = $r['decision'] ?? 'Pendiente';

                $upd = Database::update('OrdenTareas', ['Decision' => $decision], 'Id = ? AND IdOrden = ?', [$tareaId, $ordenId]);
                if ($upd === 0) {
                    Database::update('OrdenTareasPersonalizadas', ['Decision' => $decision], 'Id = ? AND IdOrden = ?', [$tareaId, $ordenId]);
                }

                if ($decision === 'Negociar') $hayNegociacion = true;
                if ($decision !== 'Aceptar') $todasAceptadas = false;
                if ($decision !== 'Rechazar') $todasRechazadas = false;
            }

            if ($todasAceptadas) {
                Database::update('Ordenes', ['EstadoNegociacion' => 'Aceptado', 'Estado' => 'Confirmada'], 'Id = ?', [$ordenId]);
            } elseif ($todasRechazadas) {
                Database::update('Ordenes', ['EstadoNegociacion' => 'Rechazado', 'Estado' => 'Cancelada'], 'Id = ?', [$ordenId]);
            } elseif ($hayNegociacion) {
                Database::update('Ordenes', ['EstadoNegociacion' => 'Negociacion'], 'Id = ?', [$ordenId]);
            } else {
                Database::update('Ordenes', ['EstadoNegociacion' => 'Aceptado'], 'Id = ?', [$ordenId]);
            }

            Database::commit();
        } catch (Exception $e) {
            Database::getConnection()->rollBack();
            Response::error('Error al enviar respuesta: ' . $e->getMessage(), 500);
        }
        Response::success(null, 'Respuestas enviadas');
    }

    public function aceptarOrden(int $ordenId): void
    {
        $user = AuthMiddleware::authenticate();
        $cuidadora = Database::fetchOne('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?', [$user->Id]);
        if (!$cuidadora) Response::error('Cuidadora no encontrada');

        Database::update('Ordenes', ['EstadoNegociacion' => 'Aceptado', 'Estado' => 'Confirmada'], 'Id = ? AND IdCuidadora = ?', [$ordenId, $cuidadora->Id]);
        Response::success(null, 'Solicitud aceptada');
    }

    public function rechazarOrden(int $ordenId, array $body): void
    {
        $user = AuthMiddleware::authenticate();
        $cuidadora = Database::fetchOne('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?', [$user->Id]);
        if (!$cuidadora) Response::error('Cuidadora no encontrada');

        $motivo = $body['motivo'] ?? 'Sin motivo';
        Database::update('Ordenes', ['EstadoNegociacion' => 'Rechazado', 'Estado' => 'Cancelada'], 'Id = ? AND IdCuidadora = ?', [$ordenId, $cuidadora->Id]);
        Database::insert('Auditoria', [
            'IdUsuario' => $user->Id,
            'Accion' => 'RECHAZAR_ORDEN',
            'Entidad' => 'Ordenes',
            'IdEntidad' => $ordenId,
            'Detalle' => $motivo,
        ]);
        Response::success(null, 'Solicitud rechazada');
    }

    public function getNegociacionesFamilia(): void
    {
        $user = AuthMiddleware::authenticate();
        $neg = Database::fetchAll('
            SELECT n.*, u.Nombres as PropuestoPorNombres, u.Apellidos as PropuestoPorApellidos,
                   o.TipoServicio, o.Estado as OrdenEstado
            FROM Negociaciones n
            INNER JOIN Ordenes o ON o.Id = n.IdOrden
            INNER JOIN Usuarios u ON u.Id = n.IdPropuestoPor
            WHERE o.IdUsuarioFamilia = ?
            ORDER BY n.FechaCreacion DESC
        ', [$user->Id]);
        Response::success($neg);
    }

    public function getNegociacionesAdmin(): void
    {
        AuthMiddleware::requireAdmin();
        $neg = Database::fetchAll('
            SELECT n.*, u.Nombres as PropuestoPorNombres, u.Apellidos as PropuestoPorApellidos,
                   o.TipoServicio, o.Estado as OrdenEstado
            FROM Negociaciones n
            INNER JOIN Ordenes o ON o.Id = n.IdOrden
            INNER JOIN Usuarios u ON u.Id = n.IdPropuestoPor
            ORDER BY n.FechaCreacion DESC
        ');
        Response::success($neg);
    }

    public function mediarNegociacion(int $id, array $body): void
    {
        AuthMiddleware::requireAdmin();
        $resolucion = $body['resolucion'] ?? 'aceptada';

        Database::getConnection()->beginTransaction();
        try {
            Database::update('Negociaciones', [
                'Estado' => $resolucion,
                'FechaResolucion' => date('Y-m-d H:i:s'),
            ], 'Id = ?', [$id]);

            $neg = Database::fetchOne('SELECT IdOrden FROM Negociaciones WHERE Id = ?', [$id]);
            if ($neg) {
                $nuevoEstado = $resolucion === 'aceptada' ? 'Aceptado' : 'Rechazado';
                Database::update('Ordenes', ['EstadoNegociacion' => $nuevoEstado], 'Id = ?', [$neg->IdOrden]);
            }
            Database::commit();
        } catch (Exception $e) {
            Database::getConnection()->rollBack();
            Response::error('Error al mediar: ' . $e->getMessage(), 500);
        }
        Response::success(null, 'Mediación resuelta como ' . $resolucion);
    }
}
