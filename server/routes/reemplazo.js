import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.post('/solicitar', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const { IdOrden, Motivo } = req.body;
    if (!IdOrden || !Motivo?.trim()) {
      return res.status(400).json({ error: 'IdOrden y Motivo son requeridos' });
    }

    const user = db.prepare('SELECT IdRol FROM Usuarios WHERE Id = ?').get(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ?').get(IdOrden);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

    if (user.IdRol === 2 && orden.IdUsuarioFamilia !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para solicitar reemplazo en esta orden' });
    }

    const existingReplace = db.prepare('SELECT Id, Estado FROM ReemplazoEmergencia WHERE IdOrden = ? AND Estado IN (\'Buscando\',\'Encontrado\')').get(IdOrden);
    if (existingReplace) {
      return res.status(400).json({ error: 'Ya existe un reemplazo en curso para esta orden', reemplazoId: existingReplace.Id });
    }

    const result = db.prepare('INSERT INTO ReemplazoEmergencia (IdOrden, IdCuidadoraOriginal, Motivo, Estado) VALUES (?, ?, ?, ?)').run(IdOrden, orden.IdCuidadora, Motivo.trim(), 'Buscando');

    const cuidadorasDisponibles = db.prepare(`
      SELECT c.Id, c.CalificacionPromedio, c.AniosExperiencia, c.Zona,
             u.Nombres, u.Apellidos
      FROM Cuidadoras c
      INNER JOIN Usuarios u ON u.Id = c.IdUsuario
      WHERE c.Disponible = 1 AND u.Activo = 1 AND u.Suspendido = 0 AND c.Id != ?
    `).all(orden.IdCuidadora);

    for (const cuid of cuidadorasDisponibles) {
      let compatibilidad = 0;
      if (cuid.Zona && orden.TipoServicio) compatibilidad += 20;
      compatibilidad += Math.min(cuid.CalificacionPromedio / 5 * 40, 40);
      compatibilidad += Math.min(cuid.AniosExperiencia / 15 * 40, 40);
      cuid.NivelCompatibilidad = Math.round(compatibilidad * 100) / 100;
    }

    cuidadorasDisponibles.sort((a, b) => b.NivelCompatibilidad - a.NivelCompatibilidad);

    let autoAssigned = false;
    if (cuidadorasDisponibles.length > 0) {
      const best = cuidadorasDisponibles[0];
      db.transaction(() => {
        db.prepare("UPDATE ReemplazoEmergencia SET IdCuidadoraReemplazo = ?, Estado = 'Asignado', FechaAsignacion = datetime('now'), NivelCompatibilidad = ? WHERE Id = ?").run(best.Id, best.NivelCompatibilidad, result.lastInsertRowid);
        db.prepare('UPDATE Ordenes SET IdCuidadora = ? WHERE Id = ?').run(best.Id, IdOrden);
      })();
      autoAssigned = true;
    }

    res.json({
      success: true,
      reemplazoId: result.lastInsertRowid,
      autoAsignado: autoAssigned,
      candidatas: cuidadorasDisponibles.slice(0, 5).map(c => ({
        id: c.Id,
        nombres: c.Nombres,
        apellidos: c.Apellidos,
        compatibilidad: c.NivelCompatibilidad,
      })),
      totalCandidatas: cuidadorasDisponibles.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/estado/:id', (req, res) => {
  try {
    const db = getDb();
    const reemplazo = db.prepare(`
      SELECT r.*,
             o.TipoServicio, o.FechaServicio, o.Estado AS OrdenEstado,
             cu.Nombres AS CuidadoraOriginalNombres, cu.Apellidos AS CuidadoraOriginalApellidos,
             cru.Nombres AS ReemplazoNombres, cru.Apellidos AS ReemplazoApellidos
      FROM ReemplazoEmergencia r
      INNER JOIN Ordenes o ON o.Id = r.IdOrden
      INNER JOIN Cuidadoras c ON c.Id = r.IdCuidadoraOriginal
      INNER JOIN Usuarios cu ON cu.Id = c.IdUsuario
      LEFT JOIN Cuidadoras cr ON cr.Id = r.IdCuidadoraReemplazo
      LEFT JOIN Usuarios cru ON cru.Id = cr.IdUsuario
      WHERE r.Id = ?
    `).get(Number(req.params.id));

    if (!reemplazo) return res.status(404).json({ error: 'Reemplazo no encontrado' });
    res.json(reemplazo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/asignar/:id', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const user = db.prepare('SELECT IdRol FROM Usuarios WHERE Id = ?').get(userId);
    if (!user || user.IdRol !== 1) return res.status(403).json({ error: 'Solo administradores pueden asignar reemplazos' });

    const { IdCuidadoraReemplazo } = req.body;
    if (!IdCuidadoraReemplazo) return res.status(400).json({ error: 'IdCuidadoraReemplazo es requerido' });

    const reemplazo = db.prepare('SELECT * FROM ReemplazoEmergencia WHERE Id = ?').get(Number(req.params.id));
    if (!reemplazo) return res.status(404).json({ error: 'Reemplazo no encontrado' });
    if (reemplazo.Estado !== 'Buscando' && reemplazo.Estado !== 'Encontrado') {
      return res.status(400).json({ error: 'El reemplazo no esta en estado disponible para asignacion' });
    }

    const nuevaCuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE Id = ?').get(IdCuidadoraReemplazo);
    if (!nuevaCuidadora) return res.status(404).json({ error: 'Cuidadora de reemplazo no encontrada' });

    db.transaction(() => {
      db.prepare("UPDATE ReemplazoEmergencia SET IdCuidadoraReemplazo = ?, Estado = 'Asignado', FechaAsignacion = datetime('now') WHERE Id = ?").run(IdCuidadoraReemplazo, Number(req.params.id));
      db.prepare('UPDATE Ordenes SET IdCuidadora = ? WHERE Id = ?').run(IdCuidadoraReemplazo, reemplazo.IdOrden);
    })();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/verificar-vencidos', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    const user = db.prepare('SELECT IdRol FROM Usuarios WHERE Id = ?').get(userId);
    if (!user || user.IdRol !== 1) return res.status(403).json({ error: 'Solo administradores' });

    const vencidos = db.prepare(`
      SELECT r.*, o.TipoServicio, o.FechaServicio
      FROM ReemplazoEmergencia r
      INNER JOIN Ordenes o ON o.Id = r.IdOrden
      WHERE r.Estado = 'Buscando'
        AND strftime('%s','now') - strftime('%s',r.FechaCreacion) > 1800
    `).all();

    const updated = db.transaction(() => {
      const ids = vencidos.map(r => r.Id);
      if (ids.length > 0) {
        const placeholders = ids.map(() => '?').join(',');
        db.prepare(`UPDATE ReemplazoEmergencia SET Estado = 'Fallido', TiempoBusquedaSegundos = 1800 WHERE Id IN (${placeholders})`).run(...ids);
      }
      return ids.length;
    })();

    res.json({ vencidosMarcados: updated, totalVencidos: vencidos.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
