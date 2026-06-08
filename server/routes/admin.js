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
  db.prepare("UPDATE DocumentosPostulacion SET Estado = 'Aprobado' WHERE IdPostulacion = ?").run(req.params.id);
  const post = db.prepare('SELECT IdUsuario FROM Postulaciones WHERE Id = ?').get(req.params.id);
  if (post) db.prepare("UPDATE Usuarios SET Activo = 1 WHERE Id = ?").run(post.IdUsuario);
  res.json({ success: true });
});

router.post('/postulaciones/:id/rechazar', isAdmin, (req, res) => {
  const db = getDb();
  db.prepare("UPDATE Postulaciones SET Estado = 'Rechazada' WHERE Id = ?").run(req.params.id);
  db.prepare("UPDATE DocumentosPostulacion SET Estado = 'Rechazado' WHERE IdPostulacion = ?").run(req.params.id);
  res.json({ success: true });
});

router.get('/perfiles-validados', isAdmin, (req, res) => {
  const db = getDb();
  const perfiles = db.prepare(`
    SELECT u.Id, u.Nombres, u.Apellidos, u.Email, u.Telefono, u.FechaCreacion,
           c.AniosExperiencia, c.TarifaHora, c.CalificacionPromedio, c.TotalResenas,
           (SELECT COUNT(*) FROM Postulaciones WHERE IdUsuario = u.Id AND Estado = 'Aprobada') AS PostulacionAprobada
    FROM Usuarios u
    INNER JOIN Cuidadoras c ON c.IdUsuario = u.Id
    WHERE u.IdRol = 3 AND u.Activo = 1
    ORDER BY c.CalificacionPromedio DESC
  `).all();
  res.json(perfiles);
});

router.get('/incidencias', isAdmin, (req, res) => {
  const db = getDb();
  const incidencias = db.prepare(`
    SELECT 'Cita cancelada' AS Tipo, c.Id AS ReferenciaId,
           CONCAT(u.Nombres, ' ', u.Apellidos) AS Usuario,
           c.FechaCreacion AS Fecha, c.Estado
    FROM Citas c INNER JOIN Usuarios u ON u.Id = c.IdUsuarioFamilia
    WHERE c.Estado = 'Cancelada'
    UNION ALL
    SELECT 'Postulacion rechazada' AS Tipo, p.Id,
           CONCAT(u.Nombres, ' ', u.Apellidos),
           p.FechaCreacion, p.Estado
    FROM Postulaciones p INNER JOIN Usuarios u ON u.Id = p.IdUsuario
    WHERE p.Estado = 'Rechazada'
    ORDER BY Fecha DESC
    LIMIT 20
  `).all();
  res.json(incidencias);
});

router.get('/reportes', isAdmin, (req, res) => {
  const db = getDb();
  const totalOrdenes = db.prepare('SELECT COUNT(*) AS c FROM Ordenes').get().c;
  const totalPagos = db.prepare('SELECT COUNT(*) AS c FROM Pagos').get().c;
  const totalCompletadas = db.prepare("SELECT COUNT(*) AS c FROM Ordenes WHERE Estado = 'Completada'").get().c;
  const totalCanceladas = db.prepare("SELECT COUNT(*) AS c FROM Ordenes WHERE Estado = 'Cancelada'").get().c;
  const ingresos = db.prepare('SELECT COALESCE(SUM(Monto), 0) AS total FROM Pagos WHERE Estado = ?').get('Completado');
  const citasCompletadas = db.prepare("SELECT COUNT(*) AS c FROM Citas WHERE Estado = 'Completada'").get().c;
  const resenasPromedio = db.prepare('SELECT COALESCE(AVG(Calificacion), 0) AS prom FROM Resenas').get().prom;
  res.json({ totalOrdenes, totalPagos, totalCompletadas, totalCanceladas, ingresos: ingresos.total, citasCompletadas, resenasPromedio: +resenasPromedio.toFixed(1) });
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
