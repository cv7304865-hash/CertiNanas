import { Router } from 'express';
import { getDb, audit } from '../db.js';

const router = Router();

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
    }

    const db = getDb();
    const user = db.prepare(`
      SELECT u.Id, u.Email, u.Nombres, u.Apellidos, u.FotoPerfil, r.Nombre AS Rol
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
      fotoPerfil: user.FotoPerfil,
      rol: user.Rol.toLowerCase(),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
});

router.post('/foto-perfil', (req, res) => {
  try {
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    const db = getDb();
    const user = db.prepare('SELECT Id FROM Usuarios WHERE Id = ?').get(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { nombreArchivo } = req.body;
    if (!nombreArchivo) return res.status(400).json({ error: 'nombreArchivo requerido' });

    db.prepare('UPDATE Usuarios SET FotoPerfil = ? WHERE Id = ?').run(nombreArchivo, userId);
    res.json({ success: true, fotoPerfil: nombreArchivo });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

    const userId = result.lastInsertRowid;

    // Si es cuidadora, crear automáticamente registro en Cuidadoras y Postulacion
    if (rol === 'cuidadora') {
      db.prepare(`INSERT INTO Cuidadoras (IdUsuario, TarifaHora) VALUES (?, 0)`).run(userId);
      db.prepare(`INSERT INTO Postulaciones (IdUsuario, Estado) VALUES (?, 'Pendiente')`).run(userId);
    }

    audit(userId, 'registro', 'Usuarios', userId, `Rol: ${rol}`);
    res.status(201).json({
      id: userId,
      email,
      nombres,
      apellidos,
      fotoPerfil: null,
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

  const orden = db.prepare('SELECT IdCuidadora, IdUsuarioFamilia, Estado FROM Ordenes WHERE Id = ?').get(idOrden);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
  if (orden.Estado !== 'Completada') return res.status(400).json({ error: 'Solo puedes calificar después de que el servicio haya sido completado' });

  db.prepare(`INSERT INTO Resenas (IdCuidadora, IdUsuarioFamilia, Calificacion, Comentario, FechaResena, FechaCreacion)
    VALUES (?, ?, ?, ?, date('now'), datetime('now'))`).run(orden.IdCuidadora, orden.IdUsuarioFamilia, calificacion, comentario || '');

  const avg = db.prepare('SELECT AVG(Calificacion) AS prom, COUNT(*) AS tot FROM Resenas WHERE IdCuidadora = ?').get(orden.IdCuidadora);
  if (avg.prom) db.prepare('UPDATE Cuidadoras SET CalificacionPromedio = ?, TotalResenas = ? WHERE Id = ?').run(+avg.prom.toFixed(1), avg.tot, orden.IdCuidadora);

  audit(userId, 'crear_resena', 'Resenas', null, `Orden #${idOrden}, Calif: ${calificacion}`);
  res.json({ success: true });
});

export default router;
