import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.post('/reservar', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const user = db.prepare('SELECT IdRol FROM Usuarios WHERE Id = ?').get(userId);
    if (!user || user.IdRol !== 2) return res.status(403).json({ error: 'Solo familias pueden reservar' });

    const { IdOrden, fechaInicio, fechaFin, tipoRecurrencia } = req.body;
    if (!IdOrden || !fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'IdOrden, fechaInicio y fechaFin son requeridos' });
    }

    const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdUsuarioFamilia = ?').get(IdOrden, userId);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

    const tiposValidos = ['Unico', 'Diario', 'Semanal', 'Mensual', 'Personalizado'];
    if (tipoRecurrencia && !tiposValidos.includes(tipoRecurrencia)) {
      return res.status(400).json({ error: 'TipoRecurrencia invalido' });
    }

    const result = db.prepare('INSERT INTO ReservasCalendario (IdOrden, IdUsuarioFamilia, IdCuidadora, FechaInicio, FechaFin, TipoRecurrencia) VALUES (?, ?, ?, ?, ?, ?)').run(
      IdOrden, userId, orden.IdCuidadora, fechaInicio, fechaFin, tipoRecurrencia || 'Unico'
    );

    res.status(201).json({ success: true, reservaId: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/disponibilidad', (req, res) => {
  try {
    const db = getDb();
    const { IdCuidadora, fecha } = req.query;

    if (!IdCuidadora || !fecha) {
      return res.status(400).json({ error: 'IdCuidadora y fecha son requeridos' });
    }

    const reservas = db.prepare(`
      SELECT FechaInicio, FechaFin FROM ReservasCalendario
      WHERE IdCuidadora = ? AND Estado = 'Programada'
      AND FechaInicio <= ? AND FechaFin >= ?
    `).all(IdCuidadora, fecha, fecha);

    const ordenes = db.prepare(`
      SELECT HoraInicio, HoraFin, FechaServicio FROM Ordenes
      WHERE IdCuidadora = ? AND FechaServicio = ? AND Estado NOT IN ('Cancelada', 'Finalizada')
    `).all(IdCuidadora, fecha);

    res.json({
      disponible: reservas.length === 0 && ordenes.length === 0,
      reservasExistentes: reservas,
      ordenesExistentes: ordenes,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/listar', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const { rol } = req.query;

    let reservas;
    if (rol === 'cuidadora') {
      const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
      if (!cuidadora) return res.status(403).json({ error: 'Cuidadora no encontrada' });
      reservas = db.prepare(`
        SELECT rc.*, o.TipoServicio, u.Nombres AS FamiliaNombres, u.Apellidos AS FamiliaApellidos
        FROM ReservasCalendario rc
        INNER JOIN Ordenes o ON o.Id = rc.IdOrden
        INNER JOIN Usuarios u ON u.Id = rc.IdUsuarioFamilia
        WHERE rc.IdCuidadora = ?
        ORDER BY rc.FechaInicio ASC
      `).all(cuidadora.Id);
    } else {
      reservas = db.prepare(`
        SELECT rc.*, o.TipoServicio,
               cu.Nombres AS CuidadoraNombres, cu.Apellidos AS CuidadoraApellidos
        FROM ReservasCalendario rc
        INNER JOIN Ordenes o ON o.Id = rc.IdOrden
        INNER JOIN Cuidadoras c ON c.Id = rc.IdCuidadora
        INNER JOIN Usuarios cu ON cu.Id = c.IdUsuario
        WHERE rc.IdUsuarioFamilia = ?
        ORDER BY rc.FechaInicio ASC
      `).all(userId);
    }

    res.json(reservas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/cancelar/:id', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const reserva = db.prepare('SELECT * FROM ReservasCalendario WHERE Id = ?').get(Number(req.params.id));
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    if (reserva.IdUsuarioFamilia !== userId) {
      const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
      if (!cuidadora || cuidadora.Id !== reserva.IdCuidadora) {
        return res.status(403).json({ error: 'No tienes permiso para cancelar esta reserva' });
      }
    }

    if (reserva.Estado === 'Cancelada') {
      return res.status(400).json({ error: 'La reserva ya esta cancelada' });
    }

    db.prepare("UPDATE ReservasCalendario SET Estado = 'Cancelada' WHERE Id = ?").run(reserva.Id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
