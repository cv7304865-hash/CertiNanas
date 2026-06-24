import { Router } from 'express';
import { getDb, audit } from '../db.js';

const router = Router();

function getAdminId(req) {
  const id = Number(req.headers['x-admin-user'] || req.headers['x-user-id']);
  return id;
}

router.get('/supervision', (req, res) => {
  try {
    const db = getDb();
    const adminId = getAdminId(req);
    if (!adminId) return res.status(401).json({ error: 'No autenticado' });
    const user = db.prepare('SELECT IdRol FROM Usuarios WHERE Id = ?').get(adminId);
    if (!user || user.IdRol !== 1) return res.status(403).json({ error: 'Acceso denegado' });

    const rows = db.prepare(`
      SELECT c.*, u.Nombres, u.Apellidos, u.Email,
             cu.Nombres AS CuidadoraNombres, cu.Apellidos AS CuidadoraApellidos
      FROM Citas c
      INNER JOIN Usuarios u ON c.IdUsuarioFamilia = u.Id
      INNER JOIN Cuidadoras cd ON cd.Id = c.IdCuidadora
      INNER JOIN Usuarios cu ON cu.Id = cd.IdUsuario
      WHERE c.FechaCita >= date('now')
      ORDER BY c.FechaCita ASC, c.HoraCita ASC
    `).all();

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/admin-join', (req, res) => {
  try {
    const db = getDb();
    const adminId = getAdminId(req);
    if (!adminId) return res.status(401).json({ error: 'No autenticado' });

    const cita = db.prepare('SELECT * FROM Citas WHERE Id = ?').get(Number(req.params.id));
    if (!cita) return res.status(404).json({ error: 'Entrevista no encontrada' });

    db.prepare("UPDATE Citas SET Estado = 'EnCurso' WHERE Id = ?").run(cita.Id);
    audit(adminId, 'admin_join_entrevista', 'Citas', cita.Id, null);

    res.json({ success: true, url: cita.Modalidad });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/finalizar', (req, res) => {
  try {
    const db = getDb();

    const cita = db.prepare('SELECT * FROM Citas WHERE Id = ?').get(Number(req.params.id));
    if (!cita) return res.status(404).json({ error: 'Entrevista no encontrada' });

    db.prepare("UPDATE Citas SET Estado = 'Completada' WHERE Id = ?").run(cita.Id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/justificar', (req, res) => {
  try {
    const db = getDb();
    const adminId = getAdminId(req);
    if (!adminId) return res.status(401).json({ error: 'No autenticado' });
    const user = db.prepare('SELECT IdRol FROM Usuarios WHERE Id = ?').get(adminId);
    if (!user || user.IdRol !== 1) return res.status(403).json({ error: 'Acceso denegado' });

    const { justificacion } = req.body;
    if (!justificacion || justificacion.trim().length < 10) {
      return res.status(400).json({ error: 'JUSTIFICACION_INSUFICIENTE. Mínimo 10 caracteres.' });
    }

    const cita = db.prepare('SELECT * FROM Citas WHERE Id = ?').get(Number(req.params.id));
    if (!cita) return res.status(404).json({ error: 'Entrevista no encontrada' });

    db.prepare("UPDATE Citas SET Estado = 'Justificada' WHERE Id = ?").run(cita.Id);
    audit(adminId, 'justificar_entrevista', 'Citas', cita.Id, justificacion);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
