import { Router } from 'express';
import { getDb, audit } from '../db.js';

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
  const tiposRequeridos = ['DNI', 'Antecedentes penales', 'Certificado de salud', 'Titulo profesional', 'Carta de presentacion'];
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

// GET /api/cuidadora/servicios/:id/detalle — detalle completo con tareas, reseñas, cancelación
router.get('/servicios/:id/detalle', isCaregiver, (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
  if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

  const orden = db.prepare(`
    SELECT o.*, uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos,
           m.Nombre AS MenorNombre, m.Diagnostico AS MenorDiagnostico
    FROM Ordenes o
    INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
    LEFT JOIN Menores m ON m.Id = o.IdMenor
    WHERE o.Id = ? AND o.IdCuidadora = ?
  `).get(Number(req.params.id), cuidadora.Id);

  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

  // Tareas estándar con decisión
  const tareas = db.prepare(`
    SELECT ot.Id, t.Descripcion, ot.Decision FROM OrdenTareas ot
    INNER JOIN Tareas t ON t.Id = ot.IdTarea
    WHERE ot.IdOrden = ?
  `).all(orden.Id);

  // Tareas personalizadas con decisión
  const tareasPersonalizadas = db.prepare(`
    SELECT Id, Descripcion, Decision FROM OrdenTareasPersonalizadas WHERE IdOrden = ?
  `).all(orden.Id);

  // Contrato
  const contrato = db.prepare(`
    SELECT Id, Terminos, AceptadoFamilia, AceptadoCuidadora, FechaAceptacionFamilia, FechaAceptacionCuidadora
    FROM Contratos WHERE IdOrden = ?
  `).get(orden.Id);

  // Reseñas (match por cuidadora + familia de la orden)
  const resenas = db.prepare(`
    SELECT r.Calificacion, r.Comentario, r.FechaCreacion,
           u.Nombres, u.Apellidos
    FROM Resenas r
    INNER JOIN Usuarios u ON u.Id = r.IdUsuarioFamilia
    INNER JOIN Ordenes o ON o.IdCuidadora = r.IdCuidadora AND o.IdUsuarioFamilia = r.IdUsuarioFamilia
    WHERE o.Id = ?
    ORDER BY r.FechaCreacion DESC
  `).all(orden.Id);

  // Motivo de cancelación (de notificaciones o auditoría)
  const cancelReason = db.prepare(`
    SELECT Detalle FROM Auditoria WHERE IdEntidad = ? AND Entidad = 'Ordenes' AND (Accion LIKE '%cancel%' OR Accion LIKE '%rechaz%')
    ORDER BY FechaCreacion DESC LIMIT 1
  `).get(orden.Id);
  // También buscar en notificaciones
  const notifCancel = db.prepare(`
    SELECT Descripcion FROM Notificaciones
    WHERE Descripcion LIKE ? ORDER BY FechaCreacion DESC LIMIT 1
  `).get(`%orden #${orden.Id}%cancel%`);

  // Negociaciones
  const negociaciones = db.prepare(`
    SELECT n.*, u.Nombres AS PropuestoPorNombres, u.Apellidos AS PropuestoPorApellidos
    FROM Negociaciones n
    INNER JOIN Usuarios u ON u.Id = n.IdPropuestoPor
    WHERE n.IdOrden = ?
    ORDER BY n.FechaCreacion DESC
  `).all(orden.Id);

  res.json({
    ...orden,
    tareas: [
      ...tareas.map(t => ({ ...t, EsPersonalizada: false })),
      ...tareasPersonalizadas.map(t => ({ ...t, EsPersonalizada: true })),
    ],
    contrato,
    resenas,
    motivoCancelacion: cancelReason?.Detalle || notifCancel?.Descripcion || null,
    negociaciones,
  });
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

  // RN-23: validar que no tenga otro servicio en el mismo horario
  if (orden.HoraInicio && orden.HoraFin) {
    const solapado = db.prepare(`
      SELECT COUNT(*) AS c FROM Ordenes
      WHERE IdCuidadora = ? AND Id != ? AND Estado NOT IN ('Cancelada', 'Pendiente')
      AND FechaServicio = ? AND HoraInicio < ? AND HoraFin > ?
    `).get(cuidadora.Id, orden.Id, orden.FechaServicio, orden.HoraFin, orden.HoraInicio);
    /* solapado si existe orden con HoraInicio < nueva.HoraFin AND HoraFin > nueva.HoraInicio */
    if (solapado.c > 0) return res.status(409).json({ error: 'Ya tienes un servicio agendado en ese horario' });
  }

  db.transaction(() => {
    let contrato = db.prepare('SELECT Id FROM Contratos WHERE IdOrden = ?').get(orden.Id);
    if (!contrato) {
      const horario = orden.HoraInicio && orden.HoraFin ? `${orden.HoraInicio} a ${orden.HoraFin}` : `${orden.TotalHoras} horas`;
      const terminos = [
        `CONTRATO DE SERVICIO - CERTINANAS`,
        `Fecha de servicio: ${orden.FechaServicio}`,
        `Horario: ${horario}`,
        `Tarifa: S/ ${orden.TarifaHora}/hora`,
        `Total horas: ${orden.TotalHoras}`,
        `Subtotal cuidadora: S/ ${orden.Subtotal}`,
        `Comisión plataforma (15%): S/ ${orden.TarifaPlataforma}`,
        `Total pagado: S/ ${orden.Total}`,
        `Tipo de servicio: ${orden.TipoServicio || 'Cuidado especializado'}`,
        ``,
        `RESPONSABILIDADES DE LA CUIDADORA:`,
        `- Brindar cuidado especializado al menor asignado`,
        `- Cumplir con el horario acordado`,
        `- Reportar cualquier incidencia durante el servicio`,
        `- Mantener confidencialidad sobre información familiar`,
        ``,
        `RESPONSABILIDADES DE LA FAMILIA:`,
        `- Proporcionar un entorno seguro para el servicio`,
        `- Pagar el servicio según lo acordado`,
        `- Comunicar cualquier cambio con anticipación`,
        ``,
        `El pago queda retenido en Escrow hasta que ambas partes confirmen la finalización del servicio.`,
        `Al aceptar, ambas partes aceptan los términos y condiciones de CERTINANAS.`,
      ].join('\n');
      const r = db.prepare('INSERT INTO Contratos (IdOrden, Terminos) VALUES (?, ?)').run(orden.Id, terminos);
      contrato = { Id: r.lastInsertRowid };
    }
    db.prepare("UPDATE Contratos SET AceptadoCuidadora = 1, FechaAceptacionCuidadora = datetime('now') WHERE Id = ?").run(contrato.Id);
    db.prepare('UPDATE Ordenes SET ConfirmadaCuidadora = 1 WHERE Id = ?').run(orden.Id);
    audit(userId, 'aceptar_contrato_cuidadora', 'Contratos', contrato.Id, `Orden #${orden.Id}`);
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
  audit(userId, 'rechazar_servicio', 'Ordenes', orden.Id, null);
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
    let liberado = false;
    if (ordenActualizada.FinalizadaFamilia && ordenActualizada.FinalizadaCuidadora) {
      db.prepare("UPDATE Escrow SET Estado = 'Liberado', FechaLiberacion = datetime('now') WHERE IdOrden = ?").run(orden.Id);
      db.prepare("UPDATE Ordenes SET Estado = 'Completada' WHERE Id = ?").run(orden.Id);
      liberado = true;
    }
    audit(userId, liberado ? 'confirmar_finalizacion_cuidadora_liberar_escrow' : 'confirmar_finalizacion_cuidadora', 'Ordenes', orden.Id, null);
  })();

  res.json({ success: true });
});

export default router;
