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
  const postulacion = db.prepare('SELECT Id, Estado FROM Postulaciones WHERE IdUsuario = ?').get(userId);
  const tiposRequeridos = ['DNI', 'Antecedentes PNP', 'Certificado Salud', 'Certificado Estudios', 'Carta Presentacion'];
  res.json({ user, cuidadora, especialidades, areas, documentos, stats, postulacion, tiposRequeridos });
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

router.get('/servicios', isCaregiver, (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
  if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

  const rows = db.prepare(`
    SELECT o.Id, o.FechaServicio, o.TotalHoras, o.TarifaHora, o.Total, o.Subtotal, o.TarifaPlataforma, o.Estado, o.HoraInicio, o.HoraFin, o.TipoServicio,
           uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos,
           m.Nombre AS MenorNombre, m.Diagnostico AS MenorDiagnostico
    FROM Ordenes o
    INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
    LEFT JOIN Menores m ON m.Id = o.IdMenor
    WHERE o.IdCuidadora = ?
    ORDER BY o.FechaCreacion DESC
  `).all(cuidadora.Id);

  res.json(rows);
});

// La cuidadora acepta el contrato digital (RN-13)
router.post('/orden/:id/aceptar', isCaregiver, (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
  if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

  const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdCuidadora = ?').get(Number(req.params.id), cuidadora.Id);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
  if (orden.ConfirmadaCuidadora) return res.status(400).json({ error: 'Ya aceptaste el contrato' });

  db.transaction(() => {
    let contrato = db.prepare('SELECT Id FROM Contratos WHERE IdOrden = ?').get(orden.Id);
    if (!contrato) {
      const terminos = `Servicio de cuidado especializado. Fecha: ${orden.FechaServicio}, Horas: ${orden.TotalHoras}, Tarifa: S/ ${orden.TarifaHora}/h, Total: S/ ${orden.Total}.`;
      const r = db.prepare('INSERT INTO Contratos (IdOrden, Terminos) VALUES (?, ?)').run(orden.Id, terminos);
      contrato = { Id: r.lastInsertRowid };
    }
    db.prepare("UPDATE Contratos SET AceptadoCuidadora = 1, FechaAceptacionCuidadora = datetime('now') WHERE Id = ?").run(contrato.Id);
    db.prepare('UPDATE Ordenes SET ConfirmadaCuidadora = 1 WHERE Id = ?').run(orden.Id);
  })();

  res.json({ success: true });
});

// La cuidadora rechaza una solicitud (RN-12)
router.post('/orden/:id/rechazar', isCaregiver, (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
  if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

  const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdCuidadora = ?').get(Number(req.params.id), cuidadora.Id);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
  if (orden.ConfirmadaCuidadora) return res.status(400).json({ error: 'Ya aceptaste este servicio, no puedes rechazarlo' });
  if (orden.Estado === 'Cancelada') return res.status(400).json({ error: 'Servicio ya cancelado' });

  db.prepare("UPDATE Ordenes SET Estado = 'Cancelada' WHERE Id = ?").run(orden.Id);
  res.json({ success: true, message: 'Servicio rechazado' });
});

// La cuidadora confirma que el servicio finalizó (RN-16)
router.post('/orden/:id/confirmar-finalizacion', isCaregiver, (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
  if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

  const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdCuidadora = ?').get(Number(req.params.id), cuidadora.Id);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
  if (orden.Estado !== 'Pagada') return res.status(400).json({ error: 'El servicio debe estar pagado para finalizarlo' });
  if (orden.FinalizadaCuidadora) return res.status(400).json({ error: 'Ya confirmaste la finalización' });

  db.transaction(() => {
    db.prepare("UPDATE Ordenes SET FinalizadaCuidadora = 1 WHERE Id = ?").run(orden.Id);
    const ordenActualizada = db.prepare('SELECT * FROM Ordenes WHERE Id = ?').get(orden.Id);
    if (ordenActualizada.FinalizadaFamilia && ordenActualizada.FinalizadaCuidadora) {
      db.prepare("UPDATE Escrow SET Estado = 'Liberado', FechaLiberacion = datetime('now') WHERE IdOrden = ?").run(orden.Id);
      db.prepare("UPDATE Ordenes SET Estado = 'Completada' WHERE Id = ?").run(orden.Id);
    }
  })();

  res.json({ success: true });
});

export default router;
