import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// Obtener conversaciones del usuario (familia o cuidadora)
router.get('/conversaciones', (req, res) => {
  const db = getDb();
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });

  const userIdNum = Number(userId);

  const rows = db.prepare(`
    SELECT cv.Id, cv.FechaCreacion, cv.FechaUltimoMensaje,
           c.Id AS CuidadoraId, u.Nombres, u.Apellidos,
           o.Estado AS OrdenEstado, o.Id AS OrdenId,
           m.Nombre AS MenorNombre
    FROM Conversaciones cv
    INNER JOIN Cuidadoras c ON c.Id = cv.IdCuidadora
    INNER JOIN Usuarios u ON u.Id = c.IdUsuario
    LEFT JOIN Ordenes o ON o.IdCuidadora = c.Id AND o.IdUsuarioFamilia = cv.IdUsuarioFamilia
    LEFT JOIN Menores m ON m.Id = o.IdMenor
    WHERE cv.IdUsuarioFamilia = ? OR cv.IdCuidadora IN (SELECT Id FROM Cuidadoras WHERE IdUsuario = ?)
    GROUP BY cv.Id
    ORDER BY cv.FechaUltimoMensaje DESC
  `).all(userIdNum, userIdNum);

  res.json(rows);
});

// Obtener mensajes de una conversación
router.get('/conversaciones/:id/mensajes', (req, res) => {
  const db = getDb();
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });

  const rows = db.prepare(`
    SELECT m.Id, m.IdRemitente, m.Contenido, m.Leido, m.FechaEnvio
    FROM Mensajes m
    WHERE m.IdConversacion = ?
    ORDER BY m.FechaEnvio ASC
  `).all(Number(req.params.id));

  res.json(rows);
});

// Enviar mensaje
router.post('/conversaciones/:id/mensajes', (req, res) => {
  const db = getDb();
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });
  const { contenido } = req.body;
  if (!contenido?.trim()) return res.status(400).json({ error: 'Contenido requerido' });

  const result = db.prepare(`INSERT INTO Mensajes (IdConversacion, IdRemitente, Contenido, Leido) VALUES (?, ?, ?, 0)`).run(Number(req.params.id), Number(userId), contenido.trim());
  db.prepare(`UPDATE Conversaciones SET FechaUltimoMensaje = datetime('now') WHERE Id = ?`).run(Number(req.params.id));

  res.json({ id: result.lastInsertRowid });
});

// Reportar incidencia (crear cita cancelada como incidencia)
router.post('/reportar-incidencia', (req, res) => {
  const db = getDb();
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });
  const { idConversacion, motivo } = req.body;
  if (!idConversacion) return res.status(400).json({ error: 'idConversacion requerido' });

  // Crear un registro de incidencia como Cita cancelada
  const conv = db.prepare('SELECT IdCuidadora, IdUsuarioFamilia FROM Conversaciones WHERE Id = ?').get(idConversacion);
  if (!conv) return res.status(404).json({ error: 'Conversación no encontrada' });

  db.prepare(`INSERT INTO Citas (IdCuidadora, IdUsuarioFamilia, FechaCita, HoraCita, DuracionMinutos, Modalidad, Estado, FechaCreacion)
    VALUES (?, ?, date('now'), time('now'), 15, 'Virtual', 'Cancelada', datetime('now'))`).run(conv.IdCuidadora, conv.IdUsuarioFamilia);

  res.json({ success: true });
});

export default router;
