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

            $requireMediacion = !$todasAceptadas || $hayNegociacion;
            Database::update('Negociaciones', [
                'requiere_mediacion_manual' => $requireMediacion ? 1 : 0,
            ], 'IdOrden = ?', [$ordenId]);

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

    // CAREGIVER: enviar matriz de decisiones (ID en body, no URL)
    public function enviarRespuestaNegociacionBody(array $body): void
    {
        $user = AuthMiddleware::authenticate();
        $ordenId = (int)($body['ordenId'] ?? 0);
        $respuestas = $body['respuestas'] ?? [];
        if (!$ordenId || empty($respuestas)) {
            Response::error('ordenId y respuestas requeridos');
        }
        $cuidadora = Database::fetchOne('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?', [$user->Id]);
        if (!$cuidadora) Response::error('Cuidadora no encontrada');
        $orden = Database::fetchOne('SELECT * FROM Ordenes WHERE Id = ? AND IdCuidadora = ?', [$ordenId, $cuidadora->Id]);
        if (!$orden) Response::error('Orden no encontrada');

        $todasAceptadas = true;
        $hayRechazo = false;
        Database::getConnection()->beginTransaction();
        try {
            foreach ($respuestas as $r) {
                $tareaId = (int)($r['tareaId'] ?? 0);
                $decision = $r['decision'] ?? 'Pendiente';
                $upd = Database::update('OrdenTareas', ['Decision' => $decision], 'Id = ? AND IdOrden = ?', [$tareaId, $ordenId]);
                if ($upd === 0) {
                    Database::update('OrdenTareasPersonalizadas', ['Decision' => $decision], 'Id = ? AND IdOrden = ?', [$tareaId, $ordenId]);
                }
                if ($decision !== 'Aceptar') $todasAceptadas = false;
                if ($decision === 'Rechazar') $hayRechazo = true;
            }
            $requireMediacion = !$todasAceptadas || $hayRechazo;
            Database::update('Negociaciones', [
                'requiere_mediacion_manual' => $requireMediacion ? 1 : 0,
            ], 'IdOrden = ?', [$ordenId]);
            Database::update('Ordenes', ['EstadoNegociacion' => 'Negociacion'], 'Id = ?', [$ordenId]);
            Response::success(null, 'Respuestas registradas');
        } catch (Exception $e) {
            Database::getConnection()->rollBack();
            Response::error('Error al enviar respuesta: ' . $e->getMessage(), 500);
        }
    }

    // FAMILY: responder a una negociacion (aceptar/rechazar/contrapropuesta)
    public function responderNegociacionFamilia(int $id, array $body): void
    {
        $user = AuthMiddleware::authenticate();
        $accion = $body['accion'] ?? '';
        if (!in_array($accion, ['aceptar', 'rechazar', 'contrapropuesta'])) {
            Response::error('accion debe ser aceptar, rechazar o contrapropuesta');
        }
        $neg = Database::fetchOne('
            SELECT n.*, o.IdCuidadora, o.IdUsuarioFamilia, o.TarifaHora as TarifaOriginal, o.TotalHoras as HorasOriginal,
                   o.HoraInicio as HoraInicioOriginal, o.HoraFin as HoraFinOriginal
            FROM Negociaciones n INNER JOIN Ordenes o ON o.Id = n.IdOrden
            WHERE n.Id = ? AND o.IdUsuarioFamilia = ?
        ', [$id, $user->Id]);
        if (!$neg) Response::notFound('Negociacion no encontrada');
        if ($neg->Estado !== 'activa') Response::error('Esta negociacion ya fue respondida');

        Database::getConnection()->beginTransaction();
        try {
            if ($accion === 'aceptar') {
                Database::update('Negociaciones', ['Estado' => 'aceptada'], 'Id = ?', [$id]);
                Database::update('Ordenes', [
                    'EstadoNegociacion' => 'Reunion',
                    'TarifaHora' => $neg->TarifaHora ?? $neg->TarifaOriginal,
                    'TotalHoras' => $neg->TotalHoras ?? $neg->HorasOriginal,
                    'HoraInicio' => $neg->HoraInicio ?? $neg->HoraInicioOriginal,
                    'HoraFin' => $neg->HoraFin ?? $neg->HoraFinOriginal,
                ], 'Id = ?', [$neg->IdOrden]);
            } elseif ($accion === 'rechazar') {
                Database::update('Negociaciones', ['Estado' => 'rechazada'], 'Id = ?', [$id]);
                Database::update('Ordenes', ['EstadoNegociacion' => 'Pendiente'], 'Id = ?', [$neg->IdOrden]);
            } elseif ($accion === 'contrapropuesta') {
                Database::update('Negociaciones', ['Estado' => 'contrapropuesta'], 'Id = ?', [$id]);
                $tarifa = $body['tarifaHora'] ?? $neg->TarifaHora;
                $horas = $body['totalHoras'] ?? $neg->TotalHoras;
                $horaInicio = $body['horaInicio'] ?? $neg->HoraInicio;
                $horaFin = $body['horaFin'] ?? $neg->HoraFin;
                $mensaje = $body['mensaje'] ?? null;
                Database::insert('Negociaciones', [
                    'IdOrden' => $neg->IdOrden,
                    'IdPropuestoPor' => $user->Id,
                    'MontoPropuesto' => $tarifa && $horas ? $tarifa * $horas : null,
                    'Detalles' => $mensaje,
                    'Estado' => 'activa',
                ]);
            }
            Database::commit();
        } catch (Exception $e) {
            Database::getConnection()->rollBack();
            Response::error('Error: ' . $e->getMessage(), 500);
        }
        Response::success(null, match($accion) {
            'aceptar' => 'Terminos aceptados',
            'rechazar' => 'Propuesta rechazada',
            'contrapropuesta' => 'Contrapropuesta enviada',
        });
    }

    // Ver propuestas de una orden (familia o cuidadora)
    public function getPropuestasOrden(int $ordenId): void
    {
        $user = AuthMiddleware::authenticate();
        $props = Database::fetchAll('
            SELECT n.*, CONCAT(u.Nombres, " ", u.Apellidos) as PropuestoPorNombres
            FROM Negociaciones n INNER JOIN Usuarios u ON u.Id = n.IdPropuestoPor
            WHERE n.IdOrden = ?
            ORDER BY n.FechaCreacion DESC
        ', [$ordenId]);
        Response::success($props);
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
            SELECT n.*, o.IdCuidadora, o.TarifaHora as TarifaOriginal, o.TotalHoras as HorasOriginal,
                   o.HoraInicio as HoraInicioOriginal, o.HoraFin as HoraFinOriginal,
                   o.FechaServicio, o.TipoServicio, o.EstadoNegociacion,
                   CONCAT(uc.Nombres, " ", uc.Apellidos) as CuidadoraNombre,
                   m.Nombre as MenorNombre
            FROM Negociaciones n
            INNER JOIN Ordenes o ON o.Id = n.IdOrden
            INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
            INNER JOIN Usuarios uc ON uc.Id = c.IdUsuario
            LEFT JOIN Menores m ON m.Id = o.IdMenor
            WHERE o.IdUsuarioFamilia = ?
            ORDER BY n.FechaCreacion DESC
        ', [$user->Id]);
        Response::success($neg);
    }

    public function getNegociacionesAdmin(): void
    {
        AuthMiddleware::requireAdmin();
        $rows = Database::fetchAll('
            SELECT o.Id AS OrdenId, o.IdUsuarioFamilia, c.Id AS CuidadoraId,
                   o.FechaServicio, o.TipoServicio, o.EstadoNegociacion,
                   o.TarifaHora, o.TotalHoras, o.HoraInicio, o.HoraFin,
                   uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos,
                   uc.Nombres AS CuidadoraNombres, uc.Apellidos AS CuidadoraApellidos,
                   m.Nombre AS MenorNombre
            FROM Ordenes o
            INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
            INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
            INNER JOIN Usuarios uc ON uc.Id = c.IdUsuario
            LEFT JOIN Menores m ON m.Id = o.IdMenor
            WHERE o.EstadoNegociacion IN (\'Pendiente\', \'Negociacion\', \'Reunion\', \'Acordado\')
            ORDER BY o.FechaCreacion DESC
        ');
        foreach ($rows as &$r) {
            $negCount = Database::fetchOne('SELECT COUNT(*) as c FROM Negociaciones WHERE IdOrden = ? AND Estado = \'activa\'', [$r->OrdenId])->c ?? 0;
            $r->PropuestasActivas = (int)$negCount;
            $negDetalles = Database::fetchAll('
                SELECT n.Id, n.IdPropuestoPor, n.MontoPropuesto, n.Detalles as Mensaje,
                       n.Estado, n.FechaCreacion
                FROM Negociaciones n WHERE n.IdOrden = ? ORDER BY n.FechaCreacion DESC
            ', [$r->OrdenId]);
            $r->Propuestas = $negDetalles;
            $n = Database::fetchOne('SELECT requiere_mediacion_manual FROM Negociaciones WHERE IdOrden = ? LIMIT 1', [$r->OrdenId]);
            $r->MediacionManual = $n ? (bool)$n->requiere_mediacion_manual : true;
            $r->AcuerdoFinal = null;
            $audit = Database::fetchOne("
                SELECT Detalle FROM Auditoria
                WHERE Entidad = 'Ordenes' AND IdEntidad = ? AND Accion = 'GUARDAR_ACUERDO'
                ORDER BY FechaCreacion DESC LIMIT 1
            ", [$r->OrdenId]);
            if ($audit) $r->AcuerdoFinal = $audit->Detalle;
            $tareas = Database::fetchAll('
                SELECT ot.Decision, t.Descripcion
                FROM OrdenTareas ot INNER JOIN Tareas t ON t.Id = ot.IdTarea
                WHERE ot.IdOrden = ?
            ', [$r->OrdenId]);
            $tareasPers = Database::fetchAll('
                SELECT Decision, Descripcion FROM OrdenTareasPersonalizadas WHERE IdOrden = ?
            ', [$r->OrdenId]);
            $allTareas = array_merge(
                array_map(fn($t) => ['tarea' => $t->Descripcion, 'estado' => $t->Decision], $tareas),
                array_map(fn($t) => ['tarea' => $t->Descripcion, 'estado' => $t->Decision], $tareasPers)
            );
            $r->Tareas = $allTareas;
            $r->FechaNegociacion = $r->FechaServicio;
            $r->GoogleMeetLink = null;
        }
        Response::success($rows);
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
