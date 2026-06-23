import { Router } from 'express';
import { getDb, audit } from '../db.js';

const router = Router();

function isAdmin(req, res, next) {
  const adminHeader = req.headers['x-admin-user'] || req.headers['x-user-id'];
  if (!adminHeader) return res.status(403).json({ error: 'Acceso denegado' });
  const db = getDb();
  const user = db.prepare('SELECT Id, IdRol FROM Usuarios WHERE Id = ?').get(Number(adminHeader));
  if (!user || user.IdRol !== 1) return res.status(403).json({ error: 'Acceso denegado' });
  next();
}

function getAdminId(req) {
  return Number(req.headers['x-admin-user'] || req.headers['x-user-id']);
}

router.get('/stats', isAdmin, (req, res) => {
  const db = getDb();
  const totalUsers = db.prepare('SELECT COUNT(*) AS c FROM Usuarios').get().c;
  const totalCuidadoras = db.prepare('SELECT COUNT(*) AS c FROM Usuarios WHERE IdRol = 3').get().c;
  const totalFamilias = db.prepare('SELECT COUNT(*) AS c FROM Usuarios WHERE IdRol = 2').get().c;
  const totalAdmins = db.prepare('SELECT COUNT(*) AS c FROM Usuarios WHERE IdRol = 1').get().c;
  const postulacionesPendientes = db.prepare("SELECT COUNT(*) AS c FROM Postulaciones WHERE Estado = 'Pendiente'").get().c;
  const serviciosCompletados = db.prepare("SELECT COUNT(*) AS c FROM Ordenes WHERE Estado IN ('Finalizada', 'Completada', 'Pagada')").get().c;
  const incidenciasAbiertas = db.prepare("SELECT COUNT(*) AS c FROM Incidencias WHERE Estado != 'Cerrada'").get().c;
  res.json({ totalUsers, totalCuidadoras, totalFamilias, totalAdmins, postulacionesPendientes, serviciosCompletados, incidenciasAbiertas });
});

router.get('/dashboard', isAdmin, (req, res) => {
  const db = getDb();
  // Postulaciones recientes
  const postulacionesRecientes = db.prepare(`
    SELECT p.Id, p.IdUsuario, p.FechaPostulacion, p.Estado,
           u.Nombres, u.Apellidos
    FROM Postulaciones p
    INNER JOIN Usuarios u ON u.Id = p.IdUsuario
    ORDER BY p.FechaPostulacion DESC
    LIMIT 6
  `).all();
  // Incidencias abiertas
  const incidencias = db.prepare(`
    SELECT i.Id, i.IdOrden AS IdCita, i.Tipo, i.Estado, i.FechaCreacion,
           COALESCE(o.TipoServicio, 'Incidencia general') AS Servicio
    FROM Incidencias i
    LEFT JOIN Ordenes o ON o.Id = i.IdOrden
    ORDER BY i.FechaCreacion DESC
    LIMIT 6
  `).all();
  res.json({ postulacionesRecientes, incidencias });
});

router.get('/casos', isAdmin, (req, res) => {
  const db = getDb();
  const tipo = req.query.tipo;
  let sql = 'SELECT c.*, u.Nombres AS ReporteroNombres, u.Apellidos AS ReporteroApellidos FROM Casos c LEFT JOIN Usuarios u ON u.Id = c.IdUsuarioReporta';
  const params = [];
  if (tipo === 'Exito' || tipo === 'NoAcuerdo') {
    sql += ' WHERE c.Tipo = ?';
    params.push(tipo);
  }
  sql += ' ORDER BY c.FechaCreacion DESC';
  res.json(db.prepare(sql).all(...params));
});

router.get('/postulaciones', isAdmin, (req, res) => {
  const db = getDb();
  const postulaciones = db.prepare(`
     SELECT p.Id, p.IdUsuario, p.FechaPostulacion, p.Estado, p.MotivoRechazo,
            u.Nombres, u.Apellidos, u.Email
    FROM Postulaciones p
    INNER JOIN Usuarios u ON u.Id = p.IdUsuario
    ORDER BY p.FechaPostulacion DESC
  `).all();
  for (const p of postulaciones) {
    p.Documentos = db.prepare('SELECT Id, TipoRequisito, NombreArchivo, Peso, Estado, MotivoRechazo FROM DocumentosPostulacion WHERE IdPostulacion = ? ORDER BY TipoRequisito').all(p.Id);
    p.TotalDocumentos = p.Documentos.length;
  }
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
  if (post) {
    db.prepare("UPDATE Usuarios SET Activo = 1 WHERE Id = ?").run(post.IdUsuario);
    audit(req.headers['x-admin-user'], 'aprobar_postulacion', 'Postulaciones', Number(req.params.id), `Usuario #${post.IdUsuario}`);
  }
  res.json({ success: true });
});

router.post('/postulaciones/:id/rechazar', isAdmin, (req, res) => {
  const db = getDb();
  const { motivo, listaNegra, documentos } = req.body || {};
  db.prepare("UPDATE Postulaciones SET Estado = 'Rechazada', MotivoRechazo = ? WHERE Id = ?").run(motivo || null, req.params.id);
  db.prepare("UPDATE DocumentosPostulacion SET Estado = 'Rechazado' WHERE IdPostulacion = ?").run(req.params.id);
  if (Array.isArray(documentos)) {
    const stmt = db.prepare("UPDATE DocumentosPostulacion SET MotivoRechazo = ? WHERE IdPostulacion = ? AND TipoRequisito = ?");
    for (const doc of documentos) {
      if (doc.motivo) {
        stmt.run(doc.motivo, req.params.id, doc.nombre);
      }
    }
  }
  if (listaNegra) {
    const post = db.prepare("SELECT IdUsuario FROM Postulaciones WHERE Id = ?").get(req.params.id);
    if (post) {
      db.prepare("UPDATE Usuarios SET Activo = 0 WHERE Id = ?").run(post.IdUsuario);
      audit(Number(req.headers['x-admin-user']), 'lista_negra', 'Usuarios', post.IdUsuario, 'Agregado a lista negra por rechazo de postulación');
    }
  }
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
    SELECT i.Id, i.IdOrden, i.IdReporto, i.Tipo, i.Estado, i.Descripcion, i.FechaCreacion,
           COALESCE(o.TipoServicio, 'Incidencia general') AS Servicio,
           ur.Nombres AS ReportoNombres, ur.Apellidos AS ReportoApellidos,
           uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos
    FROM Incidencias i
    LEFT JOIN Ordenes o ON o.Id = i.IdOrden
    LEFT JOIN Usuarios ur ON ur.Id = i.IdReporto
    LEFT JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
    ORDER BY i.FechaCreacion DESC
    LIMIT 50
  `).all();
  res.json(incidencias);
});

// GET /api/admin/incidencias/:id — detalle con orden, mediacion, auditoria
router.get('/incidencias/:id', isAdmin, (req, res) => {
  const db = getDb();
  const incidencia = db.prepare(`
    SELECT i.*, ur.Nombres AS ReportoNombres, ur.Apellidos AS ReportoApellidos, ur.IdRol AS ReportoRol,
           o.TipoServicio, o.Estado AS OrdenEstado, o.FechaServicio, o.TotalHoras, o.TarifaHora, o.Total,
           uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos,
           uc.Nombres AS CuidadoraNombres, uc.Apellidos AS CuidadoraApellidos,
           m.Nombre AS MenorNombre
    FROM Incidencias i
    LEFT JOIN Usuarios ur ON ur.Id = i.IdReporto
    LEFT JOIN Ordenes o ON o.Id = i.IdOrden
    LEFT JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
    LEFT JOIN Cuidadoras cu ON cu.Id = o.IdCuidadora
    LEFT JOIN Usuarios uc ON uc.Id = cu.IdUsuario
    LEFT JOIN Menores m ON m.Id = o.IdMenor
    WHERE i.Id = ?
  `).get(Number(req.params.id));
  if (!incidencia) return res.status(404).json({ error: 'Incidencia no encontrada' });

  const mediaciones = db.prepare(`
    SELECT c.* FROM Casos c WHERE c.IdOrden = ? ORDER BY c.FechaCreacion DESC
  `).all(incidencia.IdOrden);

  const auditoria = db.prepare(`
    SELECT a.*, u.Nombres || ' ' || u.Apellidos AS UserNombre
    FROM Auditoria a LEFT JOIN Usuarios u ON u.Id = a.IdUsuario
    WHERE a.Entidad = 'Incidencias' AND a.IdEntidad = ?
    ORDER BY a.FechaCreacion DESC
  `).all(incidencia.Id);

  res.json({ ...incidencia, mediaciones, auditoria });
});

router.put('/incidencias/:id/cerrar', isAdmin, (req, res) => {
  const db = getDb();
  const result = db.prepare("UPDATE Incidencias SET Estado = 'Cerrada' WHERE Id = ? AND Estado != 'Cerrada'").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Incidencia no encontrada o ya cerrada' });
  res.json({ success: true });
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
  const ordenesPorEstado = db.prepare("SELECT Estado, COUNT(*) AS count FROM Ordenes GROUP BY Estado ORDER BY count DESC").all();
  const ordenesPorMes = db.prepare(`
    SELECT strftime('%Y-%m', FechaCreacion) AS mes, COUNT(*) AS count
    FROM Ordenes GROUP BY mes ORDER BY mes ASC
  `).all();
  const ingresosPorMes = db.prepare(`
    SELECT strftime('%Y-%m', p.FechaPago) AS mes, COALESCE(SUM(p.Monto), 0) AS total
    FROM Pagos p WHERE p.Estado = 'Completado'
    GROUP BY mes ORDER BY mes ASC
  `).all();
  const topCuidadoras = db.prepare(`
    SELECT u.Nombres || ' ' || u.Apellidos AS nombre, COUNT(o.Id) AS total
    FROM Ordenes o
    INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
    INNER JOIN Usuarios u ON u.Id = c.IdUsuario
    GROUP BY c.Id ORDER BY total DESC LIMIT 5
  `).all();
  const pagosPorEstado = db.prepare("SELECT Estado, COUNT(*) AS count FROM Pagos GROUP BY Estado").all();
  res.json({
    totalOrdenes, totalPagos, totalCompletadas, totalCanceladas,
    ingresos: ingresos.total, citasCompletadas,
    resenasPromedio: +resenasPromedio.toFixed(1),
    ordenesPorEstado, ordenesPorMes, ingresosPorMes, topCuidadoras, pagosPorEstado
  });
});

router.get('/usuarios', isAdmin, (req, res) => {
  const db = getDb();
  const usuarios = db.prepare(`
    SELECT u.Id, u.Email, u.Nombres, u.Apellidos, u.Telefono, u.Activo, u.FechaCreacion, r.Nombre AS Rol
    FROM Usuarios u INNER JOIN Roles r ON r.Id = u.IdRol
    ORDER BY u.Id ASC
  `).all();
  res.json(usuarios);
});

router.get('/contratos', isAdmin, (req, res) => {
  const db = getDb();
  const contratos = db.prepare(`
    SELECT o.Id, o.FechaServicio, o.HoraInicio, o.HoraFin, o.Total, o.Estado, o.FechaCreacion,
           u.Nombres AS FamiliaNombres, u.Apellidos AS FamiliaApellidos,
           uc.Nombres AS CuidadoraNombres, uc.Apellidos AS CuidadoraApellidos,
           m.Nombre AS MenorNombre, m.Diagnostico AS MenorDiagnostico,
           o.TipoServicio, o.TotalHoras, o.TarifaHora, o.Subtotal, o.TarifaPlataforma
    FROM Ordenes o
    INNER JOIN Usuarios u ON u.Id = o.IdUsuarioFamilia
    INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
    INNER JOIN Usuarios uc ON uc.Id = c.IdUsuario
    LEFT JOIN Menores m ON m.Id = o.IdMenor
    ORDER BY o.Id ASC
  `).all();
  res.json(contratos);
});

// GET /api/admin/contratos/:id — detalle con tareas, escrow, pagos
router.get('/contratos/:id', isAdmin, (req, res) => {
  const db = getDb();
  const orden = db.prepare(`
    SELECT o.*, u.Nombres AS FamiliaNombres, u.Apellidos AS FamiliaApellidos,
           uc.Nombres AS CuidadoraNombres, uc.Apellidos AS CuidadoraApellidos,
           m.Nombre AS MenorNombre, m.Diagnostico AS MenorDiagnostico
    FROM Ordenes o
    INNER JOIN Usuarios u ON u.Id = o.IdUsuarioFamilia
    INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
    INNER JOIN Usuarios uc ON uc.Id = c.IdUsuario
    LEFT JOIN Menores m ON m.Id = o.IdMenor
    WHERE o.Id = ?
  `).get(Number(req.params.id));
  if (!orden) return res.status(404).json({ error: 'Contrato no encontrado' });

  const tareas = db.prepare(`
    SELECT ot.Id, t.Descripcion, t.Categoria, ot.Decision FROM OrdenTareas ot
    INNER JOIN Tareas t ON t.Id = ot.IdTarea WHERE ot.IdOrden = ?
  `).all(orden.Id);
  const tareasPersonalizadas = db.prepare(`
    SELECT Id, Descripcion, Decision FROM OrdenTareasPersonalizadas WHERE IdOrden = ?
  `).all(orden.Id);

  const escrow = db.prepare('SELECT * FROM Escrow WHERE IdOrden = ?').get(orden.Id);
  const pago = db.prepare("SELECT * FROM Pagos WHERE IdOrden = ? ORDER BY FechaPago DESC LIMIT 1").get(orden.Id);

  res.json({
    ...orden,
    tareas: [
      ...tareas.map(t => ({ ...t, EsPersonalizada: false })),
      ...tareasPersonalizadas.map(t => ({ ...t, EsPersonalizada: true })),
    ],
    escrow,
    pago,
  });
});

router.put('/contratos/:id/aprobar', isAdmin, (req, res) => {
  const db = getDb();
  db.prepare("UPDATE Ordenes SET Estado = 'Confirmada' WHERE Id = ?").run(Number(req.params.id));
  res.json({ success: true });
});

router.put('/contratos/:id/rechazar', isAdmin, (req, res) => {
  const db = getDb();
  db.prepare("UPDATE Ordenes SET Estado = 'Cancelada' WHERE Id = ?").run(Number(req.params.id));
  res.json({ success: true });
});

// Suspender/activar usuario (RN-19)
router.put('/usuarios/:id/suspender', isAdmin, (req, res) => {
  const db = getDb();
  const usuario = db.prepare('SELECT Id, Suspendido FROM Usuarios WHERE Id = ?').get(Number(req.params.id));
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
  const nuevoEstado = usuario.Suspendido ? 0 : 1;
  db.prepare('UPDATE Usuarios SET Suspendido = ?, Activo = ? WHERE Id = ?').run(nuevoEstado, nuevoEstado ? 0 : 1, usuario.Id);
  if (nuevoEstado) {
    db.prepare("UPDATE Ordenes SET Estado = 'Cancelada' WHERE IdCuidadora IN (SELECT Id FROM Cuidadoras WHERE IdUsuario = ?) AND Estado = 'Pendiente'").run(usuario.Id);
  }
  audit(Number(req.headers['x-admin-user']), nuevoEstado ? 'suspender_usuario' : 'activar_usuario', 'Usuarios', usuario.Id, null);
  res.json({ success: true, suspendido: !!nuevoEstado });
});

// Obtener historial de quejas de un usuario (RN-19)
router.get('/usuarios/:id/quejas', isAdmin, (req, res) => {
  const db = getDb();
  const userId = Number(req.params.id);
  const quejas = db.prepare(`
    SELECT i.Id, i.Tipo, i.Estado, i.Descripcion, i.FechaCreacion,
           o.TipoServicio
    FROM Incidencias i
    LEFT JOIN Ordenes o ON o.Id = i.IdOrden
    WHERE i.IdOrden IN (
      SELECT Id FROM Ordenes WHERE IdCuidadora IN (SELECT Id FROM Cuidadoras WHERE IdUsuario = ?)
    )
    ORDER BY i.FechaCreacion DESC
  `).all(userId);
  res.json(quejas);
});

// Admin puede ver todas las conversaciones
router.get('/conversaciones', isAdmin, (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT cv.Id, cv.FechaCreacion, cv.FechaUltimoMensaje,
           c.Id AS CuidadoraId, u.Nombres, u.Apellidos,
           uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos,
           o.Estado AS OrdenEstado, o.Id AS OrdenId,
           m.Nombre AS MenorNombre
    FROM Conversaciones cv
    INNER JOIN Cuidadoras c ON c.Id = cv.IdCuidadora
    INNER JOIN Usuarios u ON u.Id = c.IdUsuario
    INNER JOIN Usuarios uf ON uf.Id = cv.IdUsuarioFamilia
    LEFT JOIN Ordenes o ON o.IdCuidadora = c.Id AND o.IdUsuarioFamilia = cv.IdUsuarioFamilia
    LEFT JOIN Menores m ON m.Id = o.IdMenor
    GROUP BY cv.Id
    ORDER BY cv.FechaUltimoMensaje DESC
  `).all();
  res.json(rows);
});

// Admin envia mensaje en una conversacion
router.post('/conversaciones/:id/mensajes', isAdmin, (req, res) => {
  const db = getDb();
  const { contenido } = req.body;
  if (!contenido?.trim()) return res.status(400).json({ error: 'Contenido requerido' });
  const result = db.prepare(`INSERT INTO Mensajes (IdConversacion, IdRemitente, Contenido, Leido) VALUES (?, ?, ?, 0)`).run(Number(req.params.id), Number(req.headers['x-admin-user']), contenido.trim());
  db.prepare(`UPDATE Conversaciones SET FechaUltimoMensaje = datetime('now') WHERE Id = ?`).run(Number(req.params.id));
  res.json({ id: result.lastInsertRowid });
});

// GET /api/admin/escrows — lista de pagos protegidos con estado Escrow
router.get('/escrows', isAdmin, (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT e.Id, e.MontoTotal, e.MontoCuidadora, e.MontoPlataforma, e.Estado AS EscrowEstado, e.FechaCreacion AS EscrowFecha, e.FechaLiberacion,
           o.Id AS OrdenId, o.Estado AS OrdenEstado, o.Total, o.Subtotal, o.TarifaPlataforma, o.FechaServicio, o.HoraInicio, o.HoraFin, o.TotalHoras, o.TarifaHora,
           o.ConfirmadaFamilia, o.ConfirmadaCuidadora, o.FinalizadaFamilia, o.FinalizadaCuidadora, o.FechaFinalizacion,
           uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos,
           uc.Nombres AS CuidadoraNombres, uc.Apellidos AS CuidadoraApellidos,
           m.Nombre AS MenorNombre
    FROM Escrow e
    INNER JOIN Ordenes o ON o.Id = e.IdOrden
    INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
    INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
    INNER JOIN Usuarios uc ON uc.Id = c.IdUsuario
    LEFT JOIN Menores m ON m.Id = o.IdMenor
    ORDER BY e.FechaCreacion DESC
  `).all();
  res.json(rows);
});

// ── ADMIN: agendar videollamada de mediación ──
router.post('/agendar-mediacion', isAdmin, (req, res) => {
  const db = getDb();
  const { idCuidadora, idFamilia, fecha, hora, plataforma } = req.body;
  if (!idCuidadora || !idFamilia || !fecha || !hora) {
    return res.status(400).json({ error: 'idCuidadora, idFamilia, fecha y hora son requeridos' });
  }
  const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE Id = ?').get(idCuidadora);
  if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

  db.transaction(() => {
    db.prepare('INSERT INTO Citas (IdCuidadora, IdUsuarioFamilia, FechaCita, HoraCita, Modalidad, DuracionMinutos) VALUES (?, ?, ?, ?, ?, 30)')
      .run(idCuidadora, idFamilia, fecha, hora, plataforma === 'zoom' ? 'Zoom' : 'Google Meet');
    let conv = db.prepare('SELECT Id FROM Conversaciones WHERE IdCuidadora = ? AND IdUsuarioFamilia = ?').get(idCuidadora, idFamilia);
    if (!conv) {
      const cr = db.prepare('INSERT INTO Conversaciones (IdCuidadora, IdUsuarioFamilia) VALUES (?, ?)').run(idCuidadora, idFamilia);
      conv = { Id: cr.lastInsertRowid };
    }
    const linkId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const enlace = plataforma === 'zoom'
      ? `https://zoom.us/j/${linkId}` : `https://meet.google.com/${linkId}`;
    db.prepare('INSERT INTO Mensajes (IdConversacion, IdRemitente, Contenido) VALUES (?, ?, ?)').run(conv.Id, idFamilia,
      `MEDIACIÓN - VIDEOCONFERENCIA\n\nFecha: ${fecha}\nHora: ${hora}\nPlataforma: ${plataforma === 'zoom' ? 'Zoom' : 'Google Meet'}\nEnlace: ${enlace}\n\nEl administrador ha programado esta reunión de mediación.`);
    db.prepare("UPDATE Conversaciones SET FechaUltimoMensaje = datetime('now') WHERE Id = ?").run(conv.Id);
  })();
  res.json({ success: true });
});

// ── ADMIN: aprobar documento individual en postulacion ──
router.post('/postulaciones/:id/documentos/:docId/aprobar', isAdmin, (req, res) => {
  const db = getDb();
  db.prepare("UPDATE DocumentosPostulacion SET Estado = 'Aprobado' WHERE Id = ? AND IdPostulacion = ?").run(req.params.docId, req.params.id);
  audit(getAdminId(req), 'aprobar_documento', 'DocumentosPostulacion', Number(req.params.docId), null);
  res.json({ success: true });
});

// ── ADMIN: rechazar documento individual en postulacion ──
router.post('/postulaciones/:id/documentos/:docId/rechazar', isAdmin, (req, res) => {
  const db = getDb();
  const { motivo } = req.body || {};
  db.prepare("UPDATE DocumentosPostulacion SET Estado = 'Rechazado', MotivoRechazo = ? WHERE Id = ? AND IdPostulacion = ?").run(motivo || 'Documento no cumple requisitos', req.params.docId, req.params.id);
  audit(getAdminId(req), 'rechazar_documento', 'DocumentosPostulacion', Number(req.params.docId), motivo);
  res.json({ success: true });
});

// GET /api/admin/escrows/:id — detalle de un pago protegido
router.get('/escrows/:id', isAdmin, (req, res) => {
  const db = getDb();
  const escrow = db.prepare(`
    SELECT e.*, o.Estado AS OrdenEstado, o.FechaServicio, o.HoraInicio, o.HoraFin, o.TotalHoras, o.TarifaHora, o.Total, o.Subtotal, o.TarifaPlataforma,
           o.ConfirmadaFamilia, o.ConfirmadaCuidadora, o.FinalizadaFamilia, o.FinalizadaCuidadora, o.FechaFinalizacion,
           uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos,
           uc.Nombres AS CuidadoraNombres, uc.Apellidos AS CuidadoraApellidos,
           m.Nombre AS MenorNombre,
           p.MetodoPago, p.Estado AS PagoEstado, p.FechaPago
    FROM Escrow e
    INNER JOIN Ordenes o ON o.Id = e.IdOrden
    INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
    INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
    INNER JOIN Usuarios uc ON uc.Id = c.IdUsuario
    LEFT JOIN Menores m ON m.Id = o.IdMenor
    LEFT JOIN Pagos p ON p.IdOrden = o.Id
    WHERE e.Id = ?
  `).get(Number(req.params.id));
  if (!escrow) return res.status(404).json({ error: 'Pago protegido no encontrado' });

  const auditoria = db.prepare(`
    SELECT a.*, u.Nombres || ' ' || u.Apellidos AS adminNombre
    FROM Auditoria a LEFT JOIN Usuarios u ON u.Id = a.IdUsuario
    WHERE a.Entidad = 'Escrow' AND a.IdEntidad = ?
    ORDER BY a.FechaCreacion DESC
  `).all(escrow.Id);

  const incidencias = db.prepare(`
    SELECT Id, Tipo, Estado, Descripcion, FechaCreacion FROM Incidencias WHERE IdOrden = ?
  `).all(escrow.IdOrden);

  res.json({ ...escrow, auditoria, incidencias });
});

// ── ADMIN: lista de transacciones (pagos protegidos / escrow) ──
router.get('/transacciones', isAdmin, (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT e.Id, o.Id AS OrdenId,
           uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos,
           uc.Nombres AS CuidadoraNombres, uc.Apellidos AS CuidadoraApellidos,
           e.MontoTotal, e.MontoPlataforma AS Comision, e.MontoCuidadora,
           e.Estado, COALESCE(p.MetodoPago, 'Tarjeta') AS MetodoPago, e.FechaCreacion
    FROM Escrow e
    INNER JOIN Ordenes o ON o.Id = e.IdOrden
    INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
    INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
    INNER JOIN Usuarios uc ON uc.Id = c.IdUsuario
    LEFT JOIN Pagos p ON p.IdOrden = o.Id
    ORDER BY e.FechaCreacion DESC
  `).all();
  res.json(rows);
});

// ── ADMIN: detalle de una mediacion ──
router.get('/mediaciones/:id', isAdmin, (req, res) => {
  const db = getDb();
  const caso = db.prepare(`
    SELECT c.*, o.Id AS OrdenId, o.FechaServicio, o.TotalHoras, o.TarifaHora, o.Total, o.Estado AS OrdenEstado,
           uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos, uf.Email AS FamiliaEmail, uf.Telefono AS FamiliaTelefono,
           uc.Nombres AS CuidadoraNombres, uc.Apellidos AS CuidadoraApellidos, uc.Email AS CuidadoraEmail, uc.Telefono AS CuidadoraTelefono
    FROM Casos c
    INNER JOIN Ordenes o ON o.Id = c.IdOrden
    INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
    INNER JOIN Cuidadoras cu ON cu.Id = o.IdCuidadora
    INNER JOIN Usuarios uc ON uc.Id = cu.IdUsuario
    WHERE c.Id = ?
  `).get(Number(req.params.id));
  if (!caso) return res.status(404).json({ error: 'Mediación no encontrada' });

  const auditoria = db.prepare(`
    SELECT a.*, u.Nombres || ' ' || u.Apellidos AS adminNombre
    FROM Auditoria a LEFT JOIN Usuarios u ON u.Id = a.IdUsuario
    WHERE a.Entidad = 'Casos' AND a.IdEntidad = ?
    ORDER BY a.FechaCreacion DESC
  `).all(caso.Id);

  const incidencias = db.prepare(`
    SELECT Id, Tipo, Estado, Descripcion, FechaCreacion FROM Incidencias WHERE IdOrden = ?
  `).all(caso.OrdenId);

  const mensajes = db.prepare(`
    SELECT m.Contenido, m.FechaCreacion, u.Nombres || ' ' || u.Apellidos AS RemitenteNombre
    FROM Mensajes m
    INNER JOIN Conversaciones cv ON cv.Id = m.IdConversacion
    LEFT JOIN Usuarios u ON u.Id = m.IdRemitente
    WHERE cv.IdCuidadora = (SELECT Id FROM Cuidadoras WHERE IdUsuario = (SELECT IdUsuario FROM Cuidadoras WHERE Id = (SELECT IdCuidadora FROM Ordenes WHERE Id = ?))) 
      AND cv.IdUsuarioFamilia = (SELECT IdUsuarioFamilia FROM Ordenes WHERE Id = ?)
    ORDER BY m.FechaCreacion ASC
  `).all(caso.OrdenId, caso.OrdenId);

  res.json({ ...caso, auditoria, incidencias, mensajes });
});

// ── ADMIN: lista de mediaciones ──
router.get('/mediaciones', isAdmin, (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT c.Id, c.IdOrden AS OrdenId,
           u.Nombres AS FamiliaNombres, u.Apellidos AS FamiliaApellidos,
           uc.Nombres AS CuidadoraNombres, uc.Apellidos AS CuidadoraApellidos,
           c.Tipo AS Estado, c.FechaCreacion,
           CASE WHEN c.Tipo = 'Exito' THEN 1 ELSE 0 END AS TieneVb
    FROM Casos c
    INNER JOIN Ordenes o ON o.Id = c.IdOrden
    INNER JOIN Usuarios u ON u.Id = o.IdUsuarioFamilia
    INNER JOIN Cuidadoras cu ON cu.Id = o.IdCuidadora
    INNER JOIN Usuarios uc ON uc.Id = cu.IdUsuario
    ORDER BY c.FechaCreacion DESC
  `).all();
  const result = rows.map(r => ({
    ...r,
    AuditLog: db.prepare(`SELECT Accion, FechaCreacion, u.Nombres || ' ' || u.Apellidos AS adminNombre
      FROM Auditoria a LEFT JOIN Usuarios u ON u.Id = a.IdUsuario
      WHERE a.Entidad = 'Casos' AND a.IdEntidad = ? ORDER BY a.FechaCreacion DESC`).all(r.Id),
  }));
  res.json(result);
});

export default router;
