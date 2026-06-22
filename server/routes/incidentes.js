import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.post('/reportar', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const { IdOrden, latitud, longitud, descripcion } = req.body;
    if (!IdOrden) return res.status(400).json({ error: 'IdOrden es requerido' });

    const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ?').get(IdOrden);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

    const user = db.prepare('SELECT IdRol FROM Usuarios WHERE Id = ?').get(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (user.IdRol === 3) {
      const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
      if (!cuidadora || cuidadora.Id !== orden.IdCuidadora) {
        return res.status(403).json({ error: 'No eres la cuidadora asignada a esta orden' });
      }
    } else if (user.IdRol === 2 && orden.IdUsuarioFamilia !== userId) {
      return res.status(403).json({ error: 'No eres el familiar de esta orden' });
    }

    const result = db.prepare('INSERT INTO Incidentes (IdOrden, IdUsuarioReporta, Latitud, Longitud, Tipo, Descripcion) VALUES (?, ?, ?, ?, ?, ?)').run(
      IdOrden, userId, latitud || null, longitud || null,
      user.IdRol === 1 ? 'Incidente' : 'Panico',
      descripcion || null
    );

    const incidente = db.prepare('SELECT * FROM Incidentes WHERE Id = ?').get(result.lastInsertRowid);

    const admins = db.prepare('SELECT Id FROM Usuarios WHERE IdRol = 1').all();
    for (const a of admins) {
      db.prepare("INSERT INTO Notificaciones (IdUsuarioDestino, Titulo, Descripcion, Tipo) VALUES (?, ?, ?, ?)").run(
        a.Id,
        user.IdRol === 3 ? 'Alerta: Boton de Panico activado' : 'Nuevo Incidente reportado',
        `Se ha reportado un incidente en la orden #${IdOrden}. ${descripcion ? 'Descripcion: ' + descripcion : ''}`,
        'alerta'
      );
    }

    res.status(201).json(incidente);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/activos', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const user = db.prepare('SELECT IdRol FROM Usuarios WHERE Id = ?').get(userId);
    if (!user || user.IdRol !== 1) return res.status(403).json({ error: 'Acceso denegado' });

    const incidentes = db.prepare(`
      SELECT i.*, o.TipoServicio, o.FechaServicio,
             u.Nombres AS ReportaNombres, u.Apellidos AS ReportaApellidos,
             uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos,
             uc.Nombres AS CuidadoraNombres, uc.Apellidos AS CuidadoraApellidos
      FROM Incidentes i
      INNER JOIN Ordenes o ON o.Id = i.IdOrden
      INNER JOIN Usuarios u ON u.Id = i.IdUsuarioReporta
      INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
      INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
      INNER JOIN Usuarios uc ON uc.Id = c.IdUsuario
      WHERE i.Estado IN ('Activo', 'EnAtencion')
      ORDER BY i.FechaActivacion DESC
    `).all();

    res.json(incidentes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/resolver/:id', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const user = db.prepare('SELECT IdRol FROM Usuarios WHERE Id = ?').get(userId);
    if (!user || user.IdRol !== 1) return res.status(403).json({ error: 'Acceso denegado' });

    const { Estado, descripcion } = req.body;
    if (!Estado || !['EnAtencion', 'Resuelto', 'Cerrado'].includes(Estado)) {
      return res.status(400).json({ error: 'Estado invalido' });
    }

    const incidente = db.prepare('SELECT * FROM Incidentes WHERE Id = ?').get(Number(req.params.id));
    if (!incidente) return res.status(404).json({ error: 'Incidente no encontrado' });

    if (incidente.Estado === 'Cerrado') {
      return res.status(400).json({ error: 'El incidente ya esta cerrado' });
    }

    const updateFields = { Estado };
    if (Estado === 'Resuelto' || Estado === 'Cerrado') {
      updateFields.FechaResolucion = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    const setClauses = Object.keys(updateFields).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updateFields);
    values.push(incidente.Id);

    db.prepare(`UPDATE Incidentes SET ${setClauses} WHERE Id = ?`).run(...values);

    if (descripcion) {
      db.prepare('UPDATE Incidentes SET Descripcion = ? WHERE Id = ?').run(
        incidente.Descripcion ? incidente.Descripcion + '\n---\n' + descripcion : descripcion,
        incidente.Id
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orden/:idOrden', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const idOrden = Number(req.params.idOrden);
    const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ?').get(idOrden);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

    const user = db.prepare('SELECT IdRol FROM Usuarios WHERE Id = ?').get(userId);
    if (user.IdRol !== 1 && user.IdRol !== 2 && user.IdRol !== 3) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    if (user.IdRol === 2 && orden.IdUsuarioFamilia !== userId) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    if (user.IdRol === 3) {
      const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
      if (!cuidadora || cuidadora.Id !== orden.IdCuidadora) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
    }

    const incidentes = db.prepare(`
      SELECT i.*, u.Nombres AS ReportaNombres, u.Apellidos AS ReportaApellidos
      FROM Incidentes i
      INNER JOIN Usuarios u ON u.Id = i.IdUsuarioReporta
      WHERE i.IdOrden = ?
      ORDER BY i.FechaActivacion DESC
    `).all(idOrden);

    res.json(incidentes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
