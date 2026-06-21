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

  const conv = db.prepare('SELECT IdCuidadora, IdUsuarioFamilia FROM Conversaciones WHERE Id = ?').get(Number(req.params.id));
  if (!conv) return res.status(404).json({ error: 'Conversación no encontrada' });
  const c = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
  if (Number(conv.IdUsuarioFamilia) !== Number(userId) && (!c || Number(c.Id) !== Number(conv.IdCuidadora))) {
    return res.status(403).json({ error: 'No tienes acceso a esta conversación' });
  }

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

// Reportar incidencia desde conversación
router.post('/reportar-incidencia', (req, res) => {
  const db = getDb();
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });
  const { idConversacion, motivo } = req.body;
  if (!idConversacion) return res.status(400).json({ error: 'idConversacion requerido' });

  const conv = db.prepare('SELECT IdCuidadora, IdUsuarioFamilia FROM Conversaciones WHERE Id = ?').get(idConversacion);
  if (!conv) return res.status(404).json({ error: 'Conversación no encontrada' });
  if (Number(conv.IdUsuarioFamilia) !== Number(userId)) {
    const c = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
    if (!c || Number(c.Id) !== Number(conv.IdCuidadora)) return res.status(403).json({ error: 'No perteneces a esta conversación' });
  }

  const orden = db.prepare('SELECT Id FROM Ordenes WHERE IdCuidadora = ? AND IdUsuarioFamilia = ? ORDER BY FechaCreacion DESC LIMIT 1').get(conv.IdCuidadora, conv.IdUsuarioFamilia);

  db.prepare('INSERT INTO Incidencias (IdOrden, Tipo, Estado, Descripcion) VALUES (?, ?, ?, ?)').run(orden?.Id || null, 'Moderada', 'Abierta', motivo || 'Reporte desde conversación');

  res.json({ success: true });
});

// Solicitar contrato desde el chat
router.post('/solicitar-contrato', (req, res) => {
  const db = getDb();
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });
  const { idConversacion, idMenor, fechaServicio, horaInicio, horaFin, totalHoras } = req.body;
  if (!idConversacion) return res.status(400).json({ error: 'idConversacion requerido' });

  const conv = db.prepare('SELECT IdCuidadora, IdUsuarioFamilia FROM Conversaciones WHERE Id = ?').get(idConversacion);
  if (!conv) return res.status(404).json({ error: 'Conversación no encontrada' });
  if (Number(conv.IdUsuarioFamilia) !== Number(userId)) return res.status(403).json({ error: 'Solo la familia puede solicitar contratos' });

  const cuidadora = db.prepare('SELECT TarifaHora FROM Cuidadoras WHERE Id = ?').get(conv.IdCuidadora);
  if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

  const tarifa = cuidadora.TarifaHora;
  const horas = totalHoras || 4;
  const subtotal = +(tarifa * horas).toFixed(2);
  const plataforma = +(subtotal * 0.15).toFixed(2);
  const total = +(subtotal + plataforma).toFixed(2);
  const fecha = fechaServicio || new Date().toISOString().slice(0, 10);
  const hInicio = horaInicio || '08:00';
  const hFin = horaFin || '12:00';

  db.prepare(`INSERT INTO Ordenes (IdCuidadora, IdUsuarioFamilia, TipoServicio, FechaServicio, TotalHoras, TarifaHora, Subtotal, TarifaPlataforma, Total, Estado, FechaCreacion, IdMenor, HoraInicio, HoraFin)
    VALUES (?, ?, 'Cuidado domiciliario', ?, ?, ?, ?, ?, ?, 'Pendiente', datetime('now'), ?, ?, ?)`).run(
    conv.IdCuidadora, conv.IdUsuarioFamilia, fecha, horas, tarifa, subtotal, plataforma, total, idMenor || null, hInicio, hFin);

  db.prepare(`INSERT INTO Mensajes (IdConversacion, IdRemitente, Contenido, Leido) VALUES (?, ?, ?, 0)`).run(
    idConversacion, Number(userId), '📄 Se ha generado una solicitud de contrato. Revisa la sección Mis Servicios para confirmar.');

  db.prepare(`UPDATE Conversaciones SET FechaUltimoMensaje = datetime('now') WHERE Id = ?`).run(idConversacion);

  res.json({ success: true });
});

export default router;
