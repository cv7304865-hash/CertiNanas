import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
    }

    const db = getDb();
    const user = db.prepare(`
      SELECT u.Id, u.Email, u.Nombres, u.Apellidos, r.Nombre AS Rol
      FROM Usuarios u
      INNER JOIN Roles r ON r.Id = u.IdRol
      WHERE u.Email = ? AND u.PasswordHash = ? AND u.Activo = 1
    `).get(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    res.json({
      id: user.Id,
      email: user.Email,
      nombres: user.Nombres,
      apellidos: user.Apellidos,
      rol: user.Rol.toLowerCase(),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
});

router.post('/register', (req, res) => {
  try {
    const { nombres, apellidos, email, password, rol, numeroDocumento } = req.body;
    if (!nombres || !apellidos || !email || !password || !rol) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const rolId = rol === 'cuidadora' ? 3 : 2;
    const db = getDb();

    const exists = db.prepare('SELECT 1 FROM Usuarios WHERE Email = ?').get(email);
    if (exists) {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
    }

    const result = db.prepare(`
      INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, NumeroDocumento, IdRol, TerminosAceptados)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(email, password, nombres, apellidos, numeroDocumento || null, rolId);

    res.status(201).json({
      id: result.lastInsertRowid,
      email,
      nombres,
      apellidos,
      rol,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
});
router.post('/resena', (req, res) => {
  const db = getDb();
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });
  const { idOrden, calificacion, comentario } = req.body;
  if (!idOrden || !calificacion) return res.status(400).json({ error: 'idOrden y calificacion requeridos' });

  const orden = db.prepare('SELECT IdCuidadora, IdUsuarioFamilia FROM Ordenes WHERE Id = ?').get(idOrden);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

  db.prepare(`INSERT INTO Resenas (IdCuidadora, IdUsuarioFamilia, Calificacion, Comentario, FechaResena, FechaCreacion)
    VALUES (?, ?, ?, ?, date('now'), datetime('now'))`).run(orden.IdCuidadora, orden.IdUsuarioFamilia, calificacion, comentario || '');

  const avg = db.prepare('SELECT AVG(Calificacion) AS prom, COUNT(*) AS tot FROM Resenas WHERE IdCuidadora = ?').get(orden.IdCuidadora);
  if (avg.prom) db.prepare('UPDATE Cuidadoras SET CalificacionPromedio = ?, TotalResenas = ? WHERE Id = ?').run(+avg.prom.toFixed(1), avg.tot, orden.IdCuidadora);

  res.json({ success: true });
});

export default router;
