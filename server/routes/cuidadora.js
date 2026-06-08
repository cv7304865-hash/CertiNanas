import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

function isCaregiver(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'No autenticado' });
  const db = getDb();
  const user = db.prepare('SELECT Id, IdRol FROM Usuarios WHERE Id = ?').get(Number(userId));
  if (!user || user.IdRol !== 3) return res.status(403).json({ error: 'Acceso denegado' });
  next();
}

router.get('/perfil', isCaregiver, (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  const user = db.prepare('SELECT Id, Nombres, Apellidos, Email, Telefono FROM Usuarios WHERE Id = ?').get(userId);
  const cuidadora = db.prepare('SELECT * FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
  if (!cuidadora) return res.status(404).json({ error: 'Perfil cuidadora no encontrado' });
  const especialidades = db.prepare(`
    SELECT e.Nombre FROM CuidadoraEspecialidades ce
    INNER JOIN Especialidades e ON e.Id = ce.IdEspecialidad
    WHERE ce.IdCuidadora = ?
  `).all(cuidadora.Id).map(r => r.Nombre);
  const areas = db.prepare(`
    SELECT a.Nombre FROM CuidadoraAreas ca
    INNER JOIN Areas a ON a.Id = ca.IdArea
    WHERE ca.IdCuidadora = ?
  `).all(cuidadora.Id).map(r => r.Nombre);
  const documentos = db.prepare(`
    SELECT TipoRequisito, NombreArchivo, Peso, Estado FROM DocumentosPostulacion
    WHERE IdPostulacion IN (SELECT Id FROM Postulaciones WHERE IdUsuario = ?)
  `).all(userId);
  const stats = db.prepare(`
    SELECT CalificacionPromedio, TotalResenas FROM Cuidadoras WHERE Id = ?
  `).get(cuidadora.Id);
  res.json({ user, cuidadora, especialidades, areas, documentos, stats });
});

router.put('/perfil', isCaregiver, (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  const { bio, tarifaHora, aniosExperiencia } = req.body;
  if (bio !== undefined) db.prepare('UPDATE Cuidadoras SET DescripcionCorta = ? WHERE IdUsuario = ?').run(bio, userId);
  if (tarifaHora !== undefined) db.prepare('UPDATE Cuidadoras SET TarifaHora = ? WHERE IdUsuario = ?').run(tarifaHora, userId);
  if (aniosExperiencia !== undefined) db.prepare('UPDATE Cuidadoras SET AniosExperiencia = ? WHERE IdUsuario = ?').run(aniosExperiencia, userId);
  res.json({ success: true });
});

export default router;
