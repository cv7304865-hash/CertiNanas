import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

function isAdmin(req, res, next) {
  const adminHeader = req.headers['x-admin-user'];
  if (!adminHeader) return res.status(403).json({ error: 'Acceso denegado' });
  const db = getDb();
  const user = db.prepare('SELECT Id, IdRol FROM Usuarios WHERE Id = ?').get(Number(adminHeader));
  if (!user || user.IdRol !== 1) return res.status(403).json({ error: 'Acceso denegado' });
  next();
}

router.get('/stats', isAdmin, (req, res) => {
  const db = getDb();
  const totalUsers = db.prepare('SELECT COUNT(*) AS c FROM Usuarios').get().c;
  const totalCuidadoras = db.prepare('SELECT COUNT(*) AS c FROM Usuarios WHERE IdRol = 3').get().c;
  const totalFamilias = db.prepare('SELECT COUNT(*) AS c FROM Usuarios WHERE IdRol = 2').get().c;
  const totalAdmins = db.prepare('SELECT COUNT(*) AS c FROM Usuarios WHERE IdRol = 1').get().c;
  const postulacionesPendientes = db.prepare("SELECT COUNT(*) AS c FROM Postulaciones WHERE Estado = 'Pendiente'").get().c;
  res.json({ totalUsers, totalCuidadoras, totalFamilias, totalAdmins, postulacionesPendientes });
});

router.get('/exito', isAdmin, (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM CasosExito ORDER BY FechaCreacion DESC').all());
});

router.get('/no-acuerdo', isAdmin, (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM CasosNoAcuerdo ORDER BY FechaCreacion DESC').all());
});

router.get('/postulaciones', isAdmin, (req, res) => {
  const db = getDb();
  const postulaciones = db.prepare(`
    SELECT p.Id, p.IdUsuario, p.FechaPostulacion, p.Estado,
           u.Nombres, u.Apellidos, u.Email,
           (SELECT COUNT(*) FROM DocumentosPostulacion WHERE IdPostulacion = p.Id) AS TotalDocumentos
    FROM Postulaciones p
    INNER JOIN Usuarios u ON u.Id = p.IdUsuario
    ORDER BY p.FechaPostulacion DESC
  `).all();
  res.json(postulaciones);
});

router.get('/postulaciones/:id/documentos', isAdmin, (req, res) => {
  const db = getDb();
  const docs = db.prepare('SELECT * FROM DocumentosPostulacion WHERE IdPostulacion = ? ORDER BY TipoRequisito').all(req.params.id);
  res.json(docs);
});

router.post('/postulaciones/:id/aprobar', isAdmin, (req, res) => {
  const db = getDb();
  db.prepare("UPDATE Postulaciones SET Estado = 'Aprobada' WHERE Id = ?").run(req.params.id);
  const post = db.prepare('SELECT IdUsuario FROM Postulaciones WHERE Id = ?').get(req.params.id);
  if (post) db.prepare("UPDATE Usuarios SET Activo = 1 WHERE Id = ?").run(post.IdUsuario);
  res.json({ success: true });
});

router.post('/postulaciones/:id/rechazar', isAdmin, (req, res) => {
  const db = getDb();
  db.prepare("UPDATE Postulaciones SET Estado = 'Rechazada' WHERE Id = ?").run(req.params.id);
  res.json({ success: true });
});

router.get('/usuarios', isAdmin, (req, res) => {
  const db = getDb();
  const usuarios = db.prepare(`
    SELECT u.Id, u.Email, u.Nombres, u.Apellidos, u.Telefono, u.Activo, u.FechaCreacion, r.Nombre AS Rol
    FROM Usuarios u INNER JOIN Roles r ON r.Id = u.IdRol
    ORDER BY u.FechaCreacion DESC
  `).all();
  res.json(usuarios);
});

export default router;
