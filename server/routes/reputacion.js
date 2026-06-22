import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/niveles', (req, res) => {
  try {
    const db = getDb();
    const niveles = db.prepare('SELECT * FROM NivelesReputacion ORDER BY Orden').all();
    res.json(niveles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/cuidadora/:id', (req, res) => {
  try {
    const db = getDb();
    const idCuidadora = Number(req.params.id);

    const cuidadora = db.prepare('SELECT Id, IdUsuario FROM Cuidadoras WHERE Id = ?').get(idCuidadora);
    if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

    let reputacion = db.prepare(`
      SELECT rc.*, nr.Nombre AS NivelNombre, nr.Color AS NivelColor, nr.Orden AS NivelOrden
      FROM ReputacionCuidadora rc
      LEFT JOIN NivelesReputacion nr ON nr.Id = rc.IdNivelActual
      WHERE rc.IdCuidadora = ?
    `).get(idCuidadora);

    if (!reputacion) {
      const nivelBronce = db.prepare('SELECT Id FROM NivelesReputacion WHERE Nombre = ?').get('Bronce');
      db.prepare('INSERT INTO ReputacionCuidadora (IdCuidadora, PuntajeTotal, IdNivelActual) VALUES (?, 0, ?)').run(idCuidadora, nivelBronce?.Id || 1);
      reputacion = db.prepare(`
        SELECT rc.*, nr.Nombre AS NivelNombre, nr.Color AS NivelColor, nr.Orden AS NivelOrden
        FROM ReputacionCuidadora rc
        LEFT JOIN NivelesReputacion nr ON nr.Id = rc.IdNivelActual
        WHERE rc.IdCuidadora = ?
      `).get(idCuidadora);
    }

    const user = db.prepare('SELECT Nombres, Apellidos, Email, FotoPerfil FROM Usuarios WHERE Id = ?').get(cuidadora.IdUsuario);

    res.json({ ...reputacion, ...user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/historial/:idCuidadora', (req, res) => {
  try {
    const db = getDb();
    const historial = db.prepare(`
      SELECT * FROM HistorialReputacion
      WHERE IdCuidadora = ?
      ORDER BY FechaCreacion DESC
      LIMIT 50
    `).all(Number(req.params.idCuidadora));

    res.json(historial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
