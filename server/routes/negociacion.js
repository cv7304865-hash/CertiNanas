import { Router } from 'express';
import { getDb, audit } from '../db.js';

const router = Router();

function getUserRole(userId) {
  const db = getDb();
  const u = db.prepare('SELECT IdRol FROM Usuarios WHERE Id = ?').get(Number(userId));
  return u ? u.IdRol : null;
}

// ── CAREGIVER: enviar matriz de decisiones sobre tareas ──
router.post('/negociacion', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'No autenticado' });
  if (getUserRole(userId) !== 3) return res.status(403).json({ error: 'Solo cuidadoras' });

  const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
  if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

  const { ordenId, respuestas } = req.body;
  if (!ordenId || !Array.isArray(respuestas)) {
    return res.status(400).json({ error: 'ordenId y respuestas son requeridos' });
  }

  const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdCuidadora = ?').get(ordenId, cuidadora.Id);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
  if (orden.EstadoNegociacion !== 'Pendiente') return res.status(400).json({ error: 'La orden ya no está pendiente' });

  db.transaction(() => {
    for (const r of respuestas) {
      // Intentar actualizar en OrdenTareas primero
      const updated = db.prepare('UPDATE OrdenTareas SET Decision = ? WHERE Id = ? AND IdOrden = ?').run(r.decision, r.tareaId, ordenId);
      if (updated.changes === 0) {
        // Si no afectó OrdenTareas, probar en OrdenTareasPersonalizadas
        db.prepare('UPDATE OrdenTareasPersonalizadas SET Decision = ? WHERE Id = ? AND IdOrden = ?').run(r.decision, r.tareaId, ordenId);
      }
    }
    db.prepare("UPDATE Ordenes SET EstadoNegociacion = 'Negociacion' WHERE Id = ?").run(ordenId);
    audit(userId, 'responder_tareas', 'Ordenes', ordenId, 'Respuestas a tareas enviadas');
  })();

  res.json({ success: true, message: 'Respuestas registradas' });
});

// ── CAREGIVER: proponer cambio a una orden ──
router.post('/cuidadora/orden/:id/proponer', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'No autenticado' });
  if (getUserRole(userId) !== 3) return res.status(403).json({ error: 'Solo cuidadoras' });

  const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
  if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

  const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdCuidadora = ?').get(Number(req.params.id), cuidadora.Id);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
  if (orden.EstadoNegociacion !== 'Pendiente') return res.status(400).json({ error: 'La orden ya no está pendiente de respuesta' });

  const { tarifaHora, totalHoras, horaInicio, horaFin, mensaje } = req.body;

  db.transaction(() => {
    // Registrar la contrapropuesta
    db.prepare(`INSERT INTO Negociaciones (IdOrden, IdPropuestoPor, TarifaHora, TotalHoras, HoraInicio, HoraFin, Mensaje, Estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'activa')`).run(
      orden.Id, userId,
      tarifaHora ?? orden.TarifaHora,
      totalHoras ?? orden.TotalHoras,
      horaInicio ?? orden.HoraInicio,
      horaFin ?? orden.HoraFin,
      mensaje || null
    );
    db.prepare("UPDATE Ordenes SET EstadoNegociacion = 'Negociacion' WHERE Id = ?").run(orden.Id);
    // Notificar al admin
    const admins = db.prepare('SELECT Id FROM Usuarios WHERE IdRol = 1').all();
    for (const a of admins) {
      db.prepare("INSERT INTO Notificaciones (IdUsuarioDestino, Titulo, Descripcion, Tipo) VALUES (?, ?, ?, 'negociacion')").run(
        a.Id,
        'Nueva contrapropuesta',
        `La cuidadora ha propuesto cambios en la orden #${orden.Id}`
      );
    }
    audit(userId, 'proponer_cambio', 'Ordenes', orden.Id, `Contrapropuesta a orden #${orden.Id}`);
  })();

  res.json({ success: true, message: 'Contrapropuesta enviada' });
});

// ── CAREGIVER: aceptar orden directamente ──
router.post('/cuidadora/orden/:id/aceptar-negociacion', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'No autenticado' });
  if (getUserRole(userId) !== 3) return res.status(403).json({ error: 'Solo cuidadoras' });

  const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
  if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

  const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdCuidadora = ?').get(Number(req.params.id), cuidadora.Id);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
  if (orden.EstadoNegociacion !== 'Pendiente') return res.status(400).json({ error: 'La orden ya no está pendiente' });

  db.transaction(() => {
    db.prepare("UPDATE Ordenes SET EstadoNegociacion = 'Aceptada', ConfirmadaCuidadora = 1 WHERE Id = ?").run(orden.Id);
    audit(userId, 'aceptar_orden', 'Ordenes', orden.Id, 'Aceptada directamente por la cuidadora');
  })();

  res.json({ success: true, message: 'Orden aceptada' });
});

// ── CAREGIVER: rechazar orden ──
router.post('/cuidadora/orden/:id/rechazar-negociacion', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'No autenticado' });
  if (getUserRole(userId) !== 3) return res.status(403).json({ error: 'Solo cuidadoras' });

  const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
  if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

  const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdCuidadora = ?').get(Number(req.params.id), cuidadora.Id);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
  if (orden.EstadoNegociacion !== 'Pendiente') return res.status(400).json({ error: 'La orden ya no está pendiente' });

  db.transaction(() => {
    db.prepare("UPDATE Ordenes SET EstadoNegociacion = 'Cancelada', Estado = 'Cancelada' WHERE Id = ?").run(orden.Id);
    audit(userId, 'rechazar_orden', 'Ordenes', orden.Id, 'Rechazada por la cuidadora');
  })();

  res.json({ success: true, message: 'Orden rechazada' });
});

// ── FAMILY: responder a una negociacion ──
router.post('/familia/negociacion/:id/responder', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'No autenticado' });
  if (getUserRole(userId) !== 2) return res.status(403).json({ error: 'Solo familia' });

  const { accion, tarifaHora, totalHoras, horaInicio, horaFin, mensaje } = req.body;
  if (!accion || !['aceptar', 'rechazar', 'contrapropuesta'].includes(accion)) {
    return res.status(400).json({ error: 'accion debe ser aceptar, rechazar o contrapropuesta' });
  }

  const negociacion = db.prepare(`
    SELECT n.*, o.IdCuidadora, o.IdUsuarioFamilia, o.TarifaHora AS TarifaOriginal, o.TotalHoras AS HorasOriginal,
           o.HoraInicio AS HoraInicioOriginal, o.HoraFin AS HoraFinOriginal
    FROM Negociaciones n
    INNER JOIN Ordenes o ON o.Id = n.IdOrden
    WHERE n.Id = ? AND o.IdUsuarioFamilia = ?
  `).get(Number(req.params.id), userId);

  if (!negociacion) return res.status(404).json({ error: 'Negociación no encontrada' });
  if (negociacion.Estado !== 'activa') return res.status(400).json({ error: 'Esta negociación ya fue respondida' });

  db.transaction(() => {
    if (accion === 'aceptar') {
      db.prepare("UPDATE Negociaciones SET Estado = 'aceptada' WHERE Id = ?").run(negociacion.Id);
      db.prepare("UPDATE Ordenes SET EstadoNegociacion = 'Reunion', TarifaHora = ?, TotalHoras = ?, HoraInicio = ?, HoraFin = ? WHERE Id = ?").run(
        negociacion.TarifaHora ?? negociacion.TarifaOriginal,
        negociacion.TotalHoras ?? negociacion.HorasOriginal,
        negociacion.HoraInicio ?? negociacion.HoraInicioOriginal,
        negociacion.HoraFin ?? negociacion.HoraFinOriginal,
        negociacion.IdOrden
      );
      // Notificar a la cuidadora
      const cuidadora = db.prepare('SELECT IdUsuario FROM Cuidadoras WHERE Id = ?').get(negociacion.IdCuidadora);
      if (cuidadora) {
        db.prepare("INSERT INTO Notificaciones (IdUsuarioDestino, Titulo, Descripcion, Tipo) VALUES (?, ?, ?, 'negociacion')").run(
          cuidadora.IdUsuario, 'Propuesta aceptada', `La familia aceptó los términos para la orden #${negociacion.IdOrden}`
        );
      }
      audit(userId, 'aceptar_negociacion', 'Negociaciones', negociacion.Id, `Orden #${negociacion.IdOrden}`);

    } else if (accion === 'rechazar') {
      db.prepare("UPDATE Negociaciones SET Estado = 'rechazada' WHERE Id = ?").run(negociacion.Id);
      db.prepare("UPDATE Ordenes SET EstadoNegociacion = 'Pendiente' WHERE Id = ?").run(negociacion.IdOrden);
      audit(userId, 'rechazar_negociacion', 'Negociaciones', negociacion.Id, `Orden #${negociacion.IdOrden}`);

    } else if (accion === 'contrapropuesta') {
      db.prepare("UPDATE Negociaciones SET Estado = 'contrapropuesta' WHERE Id = ?").run(negociacion.Id);
      // Registrar nueva contrapropuesta de la familia
      db.prepare(`INSERT INTO Negociaciones (IdOrden, IdPropuestoPor, TarifaHora, TotalHoras, HoraInicio, HoraFin, Mensaje, Estado)
                  VALUES (?, ?, ?, ?, ?, ?, ?, 'activa')`).run(
        negociacion.IdOrden, userId,
        tarifaHora ?? negociacion.TarifaHora,
        totalHoras ?? negociacion.TotalHoras,
        horaInicio ?? negociacion.HoraInicio,
        horaFin ?? negociacion.HoraFin,
        mensaje || null
      );
      // Notificar admin
      const admins = db.prepare('SELECT Id FROM Usuarios WHERE IdRol = 1').all();
      for (const a of admins) {
        db.prepare("INSERT INTO Notificaciones (IdUsuarioDestino, Titulo, Descripcion, Tipo) VALUES (?, ?, ?, 'negociacion')").run(
          a.Id, 'Nueva contrapropuesta de familia', `La familia ha respondido con una contrapropuesta en orden #${negociacion.IdOrden}`
        );
      }
      audit(userId, 'contrapropuesta_negociacion', 'Negociaciones', negociacion.Id, `Orden #${negociacion.IdOrden}`);
    }
  })();

  res.json({ success: true, message: accion === 'aceptar' ? 'Términos aceptados' : accion === 'rechazar' ? 'Propuesta rechazada' : 'Contrapropuesta enviada' });
});

// ── FAMILY: ver negociaciones activas ──
router.get('/familia/negociaciones', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'No autenticado' });
  if (getUserRole(userId) !== 2) return res.status(403).json({ error: 'Solo familia' });

  const rows = db.prepare(`
    SELECT n.*, o.IdCuidadora, o.TarifaHora AS TarifaOriginal, o.TotalHoras AS HorasOriginal,
           o.HoraInicio AS HoraInicioOriginal, o.HoraFin AS HoraFinOriginal,
           o.FechaServicio, o.TipoServicio, o.EstadoNegociacion,
           u.Nombres AS CuidadoraNombres, u.Apellidos AS CuidadoraApellidos,
           m.Nombre AS MenorNombre
    FROM Negociaciones n
    INNER JOIN Ordenes o ON o.Id = n.IdOrden
    INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
    INNER JOIN Usuarios u ON u.Id = c.IdUsuario
    LEFT JOIN Menores m ON m.Id = o.IdMenor
    WHERE o.IdUsuarioFamilia = ?
    ORDER BY n.FechaCreacion DESC
  `).all(userId);
  res.json(rows);
});

// ── ADMIN: ver todas las negociaciones ──
router.get('/admin/negociaciones', (req, res) => {
  const db = getDb();
  const adminId = Number(req.headers['x-admin-user'] || req.headers['x-user-id']);
  if (!adminId) return res.status(403).json({ error: 'Acceso denegado' });
  if (getUserRole(adminId) !== 1) return res.status(403).json({ error: 'Acceso denegado' });

  const rows = db.prepare(`
    SELECT o.Id AS OrdenId, o.IdUsuarioFamilia, c.Id AS CuidadoraId, o.FechaServicio, o.TipoServicio, o.EstadoNegociacion, o.TarifaHora, o.TotalHoras, o.HoraInicio, o.HoraFin,
           uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos,
           uc.Nombres AS CuidadoraNombres, uc.Apellidos AS CuidadoraApellidos,
           m.Nombre AS MenorNombre,
           (SELECT COUNT(*) FROM Negociaciones WHERE IdOrden = o.Id AND Estado = 'activa') AS PropuestasActivas,
           (SELECT json_group_array(json_object('id', n.Id, 'propuestoPor', n.IdPropuestoPor, 'tarifa', n.TarifaHora, 'horas', n.TotalHoras, 'horaInicio', n.HoraInicio, 'horaFin', n.HoraFin, 'mensaje', n.Mensaje, 'estado', n.Estado, 'fecha', n.FechaCreacion))
            FROM Negociaciones n WHERE n.IdOrden = o.Id ORDER BY n.FechaCreacion DESC
           ) AS Propuestas
    FROM Ordenes o
    INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
    INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
    INNER JOIN Usuarios uc ON uc.Id = c.IdUsuario
    LEFT JOIN Menores m ON m.Id = o.IdMenor
    WHERE o.EstadoNegociacion IN ('Pendiente', 'Negociacion', 'Reunion')
    ORDER BY o.FechaCreacion DESC
  `).all();

  for (const r of rows) {
    if (r.Propuestas) {
      try { r.Propuestas = JSON.parse(r.Propuestas); } catch(e) { r.Propuestas = []; }
    } else {
      r.Propuestas = [];
    }
  }

  res.json(rows);
});

// ── ADMIN: mediar en una negociacion ──
router.post('/admin/negociaciones/:id/mediar', (req, res) => {
  const db = getDb();
  const adminId = Number(req.headers['x-admin-user'] || req.headers['x-user-id']);
  if (!adminId) return res.status(403).json({ error: 'Acceso denegado' });
  if (getUserRole(adminId) !== 1) return res.status(403).json({ error: 'Acceso denegado' });

  const { accion } = req.body;
  if (!accion || !['aprobar', 'rechazar', 'sugerir'].includes(accion)) {
    return res.status(400).json({ error: 'accion debe ser aprobar, rechazar o sugerir' });
  }

  const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ?').get(Number(req.params.id));
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
  if (orden.EstadoNegociacion !== 'Negociacion' && orden.EstadoNegociacion !== 'Reunion') {
    return res.status(400).json({ error: 'La orden no está en negociación' });
  }

  const { tarifaHora, totalHoras, mensaje } = req.body;

  db.transaction(() => {
    if (accion === 'aprobar') {
      db.prepare("UPDATE Ordenes SET EstadoNegociacion = 'Acordado' WHERE Id = ?").run(orden.Id);
      // Notificar a ambas partes
      const cuidadora = db.prepare('SELECT IdUsuario FROM Cuidadoras WHERE Id = ?').get(orden.IdCuidadora);
      const partes = [orden.IdUsuarioFamilia, cuidadora?.IdUsuario].filter(Boolean);
      for (const uid of partes) {
        db.prepare("INSERT INTO Notificaciones (IdUsuarioDestino, Titulo, Descripcion, Tipo) VALUES (?, ?, ?, 'negociacion')").run(
          uid, 'Negociación aprobada por admin',
          `El administrador aprobó la negociación para la orden #${orden.Id}`
        );
      }
      audit(adminId, 'mediar_aprobar', 'Ordenes', orden.Id, 'Admin aprobó negociación');
    } else if (accion === 'rechazar') {
      db.prepare("UPDATE Ordenes SET EstadoNegociacion = 'Cancelada', Estado = 'Cancelada' WHERE Id = ?").run(orden.Id);
      audit(adminId, 'mediar_rechazar', 'Ordenes', orden.Id, 'Admin rechazó negociación');
    } else if (accion === 'sugerir') {
      db.prepare(`INSERT INTO Negociaciones (IdOrden, IdPropuestoPor, TarifaHora, TotalHoras, HoraInicio, HoraFin, Mensaje, Estado)
                  VALUES (?, ?, ?, ?, ?, ?, ?, 'activa')`).run(
        orden.Id, adminId,
        tarifaHora ?? orden.TarifaHora,
        totalHoras ?? orden.TotalHoras,
        orden.HoraInicio, orden.HoraFin,
        mensaje || 'Sugerencia del administrador'
      );
      audit(adminId, 'mediar_sugerir', 'Ordenes', orden.Id, 'Admin sugirió términos');
    }
  })();

  res.json({ success: true });
});

// ── CAREGIVER: ver solicitudes pendientes con negociacion ──
router.get('/cuidadora/solicitudes-pendientes', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'No autenticado' });
  if (getUserRole(userId) !== 3) return res.status(403).json({ error: 'Solo cuidadoras' });

  const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
  if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

  const rows = db.prepare(`
    SELECT o.Id, o.FechaServicio, o.TotalHoras, o.TarifaHora, o.Total, o.Subtotal, o.TarifaPlataforma,
           o.Estado, o.EstadoNegociacion, o.HoraInicio, o.HoraFin, o.TipoServicio, o.FechaCreacion,
           uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos,
           m.Nombre AS MenorNombre, m.Diagnostico AS MenorDiagnostico,
           (SELECT COUNT(*) FROM Negociaciones WHERE IdOrden = o.Id) AS TotalPropuestas
    FROM Ordenes o
    INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
    LEFT JOIN Menores m ON m.Id = o.IdMenor
    WHERE o.IdCuidadora = ? AND o.EstadoNegociacion IN ('Pendiente', 'Negociacion', 'Reunion')
    ORDER BY o.FechaCreacion DESC
  `).all(cuidadora.Id);

  for (const r of rows) {
    const tareas = db.prepare(`
      SELECT ot.Id, t.Descripcion, ot.Decision FROM OrdenTareas ot
      INNER JOIN Tareas t ON t.Id = ot.IdTarea
      WHERE ot.IdOrden = ?
    `).all(r.Id);
    const tareasPersonalizadas = db.prepare(`
      SELECT Id, Descripcion, Decision FROM OrdenTareasPersonalizadas WHERE IdOrden = ?
    `).all(r.Id);
    r.tareas = [
      ...tareas.map(t => ({ Id: t.Id, Descripcion: t.Descripcion, Decision: t.Decision, EsPersonalizada: false })),
      ...tareasPersonalizadas.map(t => ({ Id: t.Id, Descripcion: t.Descripcion, Decision: t.Decision, EsPersonalizada: true })),
    ];
  }

  res.json(rows);
});

// ── CAREGIVER: ver historial de negociaciones de una orden ──
router.get('/cuidadora/orden/:id/propuestas', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'No autenticado' });
  if (getUserRole(userId) !== 3) return res.status(403).json({ error: 'Solo cuidadoras' });

  const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
  if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

  const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdCuidadora = ?').get(Number(req.params.id), cuidadora.Id);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

  const props = db.prepare(`
    SELECT n.*, u.Nombres AS PropuestoPorNombres, u.Apellidos AS PropuestoPorApellidos
    FROM Negociaciones n
    INNER JOIN Usuarios u ON u.Id = n.IdPropuestoPor
    WHERE n.IdOrden = ?
    ORDER BY n.FechaCreacion DESC
  `).all(orden.Id);

  res.json(props);
});

// ── FAMILY: ver historial de negociaciones de una orden ──
router.get('/familia/orden/:id/propuestas', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'No autenticado' });

  const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdUsuarioFamilia = ?').get(Number(req.params.id), userId);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

  const props = db.prepare(`
    SELECT n.*, u.Nombres AS PropuestoPorNombres, u.Apellidos AS PropuestoPorApellidos
    FROM Negociaciones n
    INNER JOIN Usuarios u ON u.Id = n.IdPropuestoPor
    WHERE n.IdOrden = ?
    ORDER BY n.FechaCreacion DESC
  `).all(orden.Id);

  res.json(props);
});

export default router;
