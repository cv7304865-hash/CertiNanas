import { Router } from 'express';
import { getDb, audit } from '../db.js';

const router = Router();

router.get('/solicitudes', (req, res) => {
  const db = getDb();
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });

  const rows = db.prepare(`
    SELECT o.Id, o.FechaServicio, o.TotalHoras, o.TarifaHora, o.Total, o.Subtotal, o.TarifaPlataforma, o.Estado, o.EstadoNegociacion, o.HoraInicio, o.HoraFin,
           c.Id AS CuidadoraId, u.Nombres AS CuidadoraNombres, u.Apellidos AS CuidadoraApellidos,
           m.Nombre AS MenorNombre, m.Diagnostico AS MenorDiagnostico,
            (SELECT COALESCE(json_group_array(IdTarea), '[]') FROM OrdenTareas WHERE IdOrden = o.Id) AS TareaIds,
            (SELECT COALESCE(json_group_array(json_object('Id', Id, 'Descripcion', Descripcion, 'Decision', Decision)), '[]') FROM OrdenTareasPersonalizadas WHERE IdOrden = o.Id) AS TareasPersonalizadas
     FROM Ordenes o
     INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
     INNER JOIN Usuarios u ON u.Id = c.IdUsuario
     LEFT JOIN Menores m ON m.Id = o.IdMenor
     WHERE o.IdUsuarioFamilia = ?
     ORDER BY o.FechaCreacion DESC
   `).all(Number(userId));

   for (const r of rows) r.TareaIds = JSON.parse(r.TareaIds);
   for (const r of rows) r.TareasPersonalizadas = JSON.parse(r.TareasPersonalizadas);

  res.json(rows);
});

router.get('/solicitudes/:id', (req, res) => {
  const db = getDb();
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });

  const row = db.prepare(`
    SELECT o.Id, o.FechaServicio, o.TotalHoras, o.TarifaHora, o.Subtotal, o.TarifaPlataforma, o.Total, o.Estado, o.HoraInicio, o.HoraFin, o.TipoServicio,
           c.Id AS CuidadoraId, u.Nombres AS CuidadoraNombres, u.Apellidos AS CuidadoraApellidos,
           m.Nombre AS MenorNombre, m.Diagnostico AS MenorDiagnostico, m.FechaNacimiento AS MenorFechaNac,
           uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos,
            (SELECT COALESCE(json_group_array(IdTarea), '[]') FROM OrdenTareas WHERE IdOrden = o.Id) AS TareaIds,
            (SELECT COALESCE(json_group_array(json_object('Id', Id, 'Descripcion', Descripcion, 'Decision', Decision)), '[]') FROM OrdenTareasPersonalizadas WHERE IdOrden = o.Id) AS TareasPersonalizadas
     FROM Ordenes o
     INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
     INNER JOIN Usuarios u ON u.Id = c.IdUsuario
     INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
     LEFT JOIN Menores m ON m.Id = o.IdMenor
     WHERE o.Id = ? AND o.IdUsuarioFamilia = ?
   `).get(Number(req.params.id), Number(userId));

   if (!row) return res.status(404).json({ error: 'Solicitud no encontrada' });
   row.TareaIds = JSON.parse(row.TareaIds);
   row.TareasPersonalizadas = JSON.parse(row.TareasPersonalizadas);

  res.json(row);
});

// La familia acepta el contrato digital (RN-13)
router.post('/orden/:id/aceptar', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });

  const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdUsuarioFamilia = ?').get(Number(req.params.id), userId);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
  if (orden.ConfirmadaFamilia) return res.status(400).json({ error: 'Ya aceptaste el contrato' });

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
    db.prepare("UPDATE Contratos SET AceptadoFamilia = 1, FechaAceptacionFamilia = datetime('now') WHERE Id = ?").run(contrato.Id);
    db.prepare('UPDATE Ordenes SET ConfirmadaFamilia = 1 WHERE Id = ?').run(orden.Id);
    audit(userId, 'aceptar_contrato', 'Contratos', contrato.Id, `Orden #${orden.Id}`);
  })();

  res.json({ success: true });
});

// Endpoint para pagar y crear Escrow (RN-15)
router.post('/pagar/:id', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });

  const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdUsuarioFamilia = ?').get(Number(req.params.id), userId);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
  if (orden.Estado === 'Pagada' || orden.Estado === 'Completada') return res.status(400).json({ error: 'Orden ya pagada' });
  if (!orden.ConfirmadaFamilia) return res.status(400).json({ error: 'Debes aceptar el contrato primero' });
  if (!orden.ConfirmadaCuidadora) return res.status(400).json({ error: 'La cuidadora aún no ha aceptado el contrato' });

  db.transaction(() => {
    db.prepare("UPDATE Ordenes SET Estado = 'Pagada' WHERE Id = ?").run(orden.Id);
    const metodo = (req.body.metodoPago || 'Tarjeta').replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    db.prepare("INSERT INTO Pagos (IdOrden, Monto, MetodoPago, Estado) VALUES (?, ?, ?, 'Completado')").run(orden.Id, orden.Total, metodo);
    // Crear registro Escrow: el subtotal va a la cuidadora, la tarifa plataforma es retenida
    const montoCuidadora = orden.Subtotal;
    const montoPlataforma = orden.TarifaPlataforma;
    const escrowResult = db.prepare("INSERT INTO Escrow (IdOrden, MontoTotal, MontoCuidadora, MontoPlataforma, Estado) VALUES (?, ?, ?, ?, 'Retenido')").run(orden.Id, orden.Total, montoCuidadora, montoPlataforma);
    db.prepare('UPDATE Ordenes SET IdEscrow = ? WHERE Id = ?').run(escrowResult.lastInsertRowid, orden.Id);
    audit(userId, 'pagar_orden', 'Ordenes', orden.Id, `Monto: S/ ${orden.Total}, Escrow #${escrowResult.lastInsertRowid}`);
  })();

  res.json({ success: true });
});

// La familia inicia el servicio (transición de Pagada a En curso)
router.post('/orden/:id/iniciar', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });

  const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdUsuarioFamilia = ?').get(Number(req.params.id), userId);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
  if (orden.Estado !== 'Pagada') return res.status(400).json({ error: 'El servicio debe estar pagado para iniciarlo' });

  db.transaction(() => {
    db.prepare("UPDATE Ordenes SET Estado = 'En curso' WHERE Id = ?").run(orden.Id);
    audit(userId, 'iniciar_servicio', 'Ordenes', orden.Id, null);
  })();

  res.json({ success: true });
});

// La familia confirma que el servicio finalizó sin incidencias (RN-16)
router.post('/orden/:id/confirmar-finalizacion', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });

  const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdUsuarioFamilia = ?').get(Number(req.params.id), userId);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
  if (orden.Estado !== 'Pagada' && orden.Estado !== 'En curso') return res.status(400).json({ error: 'El servicio debe estar en curso o pagado para finalizarlo' });
  if (orden.FinalizadaFamilia) return res.status(400).json({ error: 'Ya confirmaste la finalización' });

  db.transaction(() => {
    db.prepare("UPDATE Ordenes SET FinalizadaFamilia = 1, Estado = 'Completada', FechaFinalizacion = datetime('now') WHERE Id = ?").run(orden.Id);
    // Si ambas partes confirmaron, liberar Escrow automáticamente
    const cuidadoraCerro = db.prepare('SELECT FinalizadaCuidadora FROM Ordenes WHERE Id = ?').get(orden.Id)?.FinalizadaCuidadora;
    let liberado = false;
    if (cuidadoraCerro) {
      db.prepare("UPDATE Escrow SET Estado = 'Liberado', FechaLiberacion = datetime('now') WHERE IdOrden = ?").run(orden.Id);
      liberado = true;
    }
    audit(userId, liberado ? 'confirmar_finalizacion_liberar_escrow' : 'confirmar_finalizacion', 'Ordenes', orden.Id, null);
  })();

  res.json({ success: true });
});

// CRUD de menores (hijos de la familia)
router.get('/menores', (req, res) => {
  const db = getDb();
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });
  const rows = db.prepare('SELECT * FROM Menores WHERE IdUsuarioFamilia = ? ORDER BY FechaCreacion DESC').all(Number(userId));
  res.json(rows);
});

router.post('/menores', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });
  const { nombre, diagnostico, fechaNacimiento } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'Nombre es requerido' });
  const r = db.prepare('INSERT INTO Menores (IdUsuarioFamilia, Nombre, Diagnostico, FechaNacimiento) VALUES (?, ?, ?, ?)').run(userId, nombre.trim(), diagnostico || null, fechaNacimiento || null);
  audit(userId, 'crear_menor', 'Menores', r.lastInsertRowid, nombre.trim());
  const menor = db.prepare('SELECT * FROM Menores WHERE Id = ?').get(r.lastInsertRowid);
  res.status(201).json(menor);
});

router.delete('/menores/:id', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });
  const menor = db.prepare('SELECT * FROM Menores WHERE Id = ? AND IdUsuarioFamilia = ?').get(Number(req.params.id), userId);
  if (!menor) return res.status(404).json({ error: 'Menor no encontrado' });
  db.prepare('DELETE FROM Menores WHERE Id = ?').run(menor.Id);
  audit(userId, 'eliminar_menor', 'Menores', menor.Id, menor.Nombre);
  res.json({ success: true });
});

router.put('/menores/:id', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });
  const menor = db.prepare('SELECT * FROM Menores WHERE Id = ? AND IdUsuarioFamilia = ?').get(Number(req.params.id), userId);
  if (!menor) return res.status(404).json({ error: 'Menor no encontrado' });
  const { nombre, diagnostico, fechaNacimiento } = req.body;
  if (nombre !== undefined) db.prepare('UPDATE Menores SET Nombre = ? WHERE Id = ?').run(nombre.trim(), menor.Id);
  if (diagnostico !== undefined) db.prepare('UPDATE Menores SET Diagnostico = ? WHERE Id = ?').run(diagnostico || null, menor.Id);
  if (fechaNacimiento !== undefined) db.prepare('UPDATE Menores SET FechaNacimiento = ? WHERE Id = ?').run(fechaNacimiento || null, menor.Id);
  audit(userId, 'editar_menor', 'Menores', menor.Id, nombre?.trim() || menor.Nombre);
  res.json({ success: true });
});

// Obtener citas/entrevistas agendadas por la familia
router.get('/citas', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });

  const rows = db.prepare(`
    SELECT c.Id, c.FechaCita, c.HoraCita, c.Modalidad, c.Estado, c.DuracionMinutos,
           cu.Id AS CuidadoraId, u.Nombres AS CuidadoraNombres, u.Apellidos AS CuidadoraApellidos
    FROM Citas c
    INNER JOIN Cuidadoras cu ON cu.Id = c.IdCuidadora
    INNER JOIN Usuarios u ON u.Id = cu.IdUsuario
    WHERE c.IdUsuarioFamilia = ?
    ORDER BY c.FechaCita DESC
  `).all(userId);

  res.json(rows);
});

// Agendar entrevista virtual con cuidadora
router.post('/agendar-entrevista', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });

  const { idCuidadora, fecha, hora, plataforma } = req.body;
  if (!idCuidadora || !fecha || !hora) {
    return res.status(400).json({ error: 'idCuidadora, fecha y hora son requeridos' });
  }

  const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE Id = ?').get(idCuidadora);
  if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

  db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO Citas (IdCuidadora, IdUsuarioFamilia, FechaCita, HoraCita, Modalidad, DuracionMinutos)
      VALUES (?, ?, ?, ?, ?, 30)
    `).run(idCuidadora, userId, fecha, hora, plataforma === 'zoom' ? 'Zoom' : 'Google Meet');

    // Buscar o crear conversacion entre familia y cuidadora
    let conversacion = db.prepare('SELECT Id FROM Conversaciones WHERE IdCuidadora = ? AND IdUsuarioFamilia = ?').get(idCuidadora, userId);
    if (!conversacion) {
      const convResult = db.prepare('INSERT INTO Conversaciones (IdCuidadora, IdUsuarioFamilia) VALUES (?, ?)').run(idCuidadora, userId);
      conversacion = { Id: convResult.lastInsertRowid };
    }

    // Generar enlace de videollamada simulado
    const linkId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const enlace = plataforma === 'zoom'
      ? `https://zoom.us/j/${linkId}`
      : `https://meet.google.com/${linkId}`;

    const contenido = `ENTREVISTA VIRTUAL AGENDADA\n\nFecha: ${fecha}\nHora: ${hora}\nPlataforma: ${plataforma === 'zoom' ? 'Zoom' : 'Google Meet'}\nEnlace: ${enlace}\n\nPresiona el enlace el dia y hora de la entrevista para conectarte.`;

    db.prepare('INSERT INTO Mensajes (IdConversacion, IdRemitente, Contenido) VALUES (?, ?, ?)').run(conversacion.Id, userId, contenido);
    db.prepare("UPDATE Conversaciones SET FechaUltimoMensaje = datetime('now') WHERE Id = ?").run(conversacion.Id);

    audit(userId, 'agendar_entrevista', 'Citas', result.lastInsertRowid, `Cuidadora #${idCuidadora}, ${fecha} ${hora}`);
  })();

  res.json({ success: true, message: 'Entrevista agendada correctamente. El enlace se ha enviado a los mensajes.' });
});

// GET /api/familia/cuidadoras-disponibles — lista de cuidadoras con quienes ya conversó (o todas las disponibles)
router.get('/cuidadoras-disponibles', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });

  const rows = db.prepare(`
    SELECT DISTINCT c.Id, u.Nombres, u.Apellidos, c.TarifaHora, c.CalificacionPromedio, c.TotalResenas,
           (SELECT GROUP_CONCAT(e.Nombre, ' · ') FROM CuidadoraEspecialidades ce INNER JOIN Especialidades e ON e.Id = ce.IdEspecialidad WHERE ce.IdCuidadora = c.Id) AS Especialidades
    FROM Cuidadoras c
    INNER JOIN Usuarios u ON u.Id = c.IdUsuario
    LEFT JOIN Conversaciones cv ON cv.IdCuidadora = c.Id AND cv.IdUsuarioFamilia = ?
    WHERE c.Disponible = 1 AND u.Activo = 1 AND u.Suspendido = 0
    ORDER BY cv.Id IS NOT NULL DESC, c.CalificacionPromedio DESC
  `).all(userId);
  res.json(rows);
});

// POST /api/familia/crear-solicitud — crear orden directamente desde el panel familia
router.post('/crear-solicitud', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });

  const { idCuidadora, idMenor, fechaServicio, horaInicio, horaFin, totalHoras, tareaIds, observaciones, tareasPersonalizadas } = req.body;
  if (!idCuidadora || !fechaServicio) {
    return res.status(400).json({ error: 'idCuidadora y fechaServicio son requeridos' });
  }

  const cuidadora = db.prepare('SELECT TarifaHora FROM Cuidadoras WHERE Id = ?').get(idCuidadora);
  if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

  const tarifa = cuidadora.TarifaHora;
  const horas = totalHoras || 4;
  const subtotal = +(tarifa * horas).toFixed(2);
  const plataforma = +(subtotal * 0.15).toFixed(2);
  const total = +(subtotal + plataforma).toFixed(2);
  const hInicio = horaInicio || '08:00';
  const hFin = horaFin || '12:00';

  const ordenId = db.transaction(() => {
    const r = db.prepare(`INSERT INTO Ordenes (IdCuidadora, IdUsuarioFamilia, TipoServicio, FechaServicio, TotalHoras, TarifaHora, Subtotal, TarifaPlataforma, Total, Estado, FechaCreacion, IdMenor, HoraInicio, HoraFin)
      VALUES (?, ?, 'Cuidado domiciliario', ?, ?, ?, ?, ?, ?, 'Pendiente', datetime('now'), ?, ?, ?)`)
      .run(idCuidadora, userId, fechaServicio, horas, tarifa, subtotal, plataforma, total, idMenor || null, hInicio, hFin);

    const newId = r.lastInsertRowid;

    // Guardar tareas seleccionadas
    if (tareaIds && Array.isArray(tareaIds) && tareaIds.length > 0) {
      const stmt = db.prepare('INSERT INTO OrdenTareas (IdOrden, IdTarea) VALUES (?, ?)');
      for (const id of tareaIds) stmt.run(newId, id);
    }

    // Guardar tareas personalizadas
    if (tareasPersonalizadas && Array.isArray(tareasPersonalizadas) && tareasPersonalizadas.length > 0) {
      const stmt = db.prepare('INSERT INTO OrdenTareasPersonalizadas (IdOrden, Descripcion) VALUES (?, ?)');
      for (const desc of tareasPersonalizadas) {
        if (desc && desc.trim()) stmt.run(newId, desc.trim());
      }
    }

    // Insertar observaciones como notación interna (usando campo Descripcion de Ordenes? No existe, lo guardamos como auditoria)
    if (observaciones) {
      audit(userId, 'observaciones_solicitud', 'Ordenes', newId, observaciones);
    }

    // Buscar o crear conversacion para notificar a la cuidadora
    let conv = db.prepare('SELECT Id FROM Conversaciones WHERE IdCuidadora = ? AND IdUsuarioFamilia = ?').get(idCuidadora, userId);
    if (!conv) {
      const cr = db.prepare('INSERT INTO Conversaciones (IdCuidadora, IdUsuarioFamilia) VALUES (?, ?)').run(idCuidadora, userId);
      conv = { Id: cr.lastInsertRowid };
    }
    const cuidadoraUser = db.prepare('SELECT IdUsuario FROM Cuidadoras WHERE Id = ?').get(idCuidadora);
    db.prepare(`INSERT INTO Mensajes (IdConversacion, IdRemitente, Contenido, Leido) VALUES (?, ?, ?, 0)`)
      .run(conv.Id, userId, `📄 Se ha generado una nueva solicitud de servicio. Revisa la sección Solicitudes para más detalles.`);

    return newId;
  })();

  res.json({ success: true, ordenId });
});

// GET /api/familia/solicitudes/:id/detalle — detalle completo con tareas, negociaciones, cancelación
router.get('/solicitudes/:id/detalle', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });

    const orden = db.prepare(`
      SELECT o.*, u.Nombres AS CuidadoraNombres, u.Apellidos AS CuidadoraApellidos,
             m.Nombre AS MenorNombre, m.Diagnostico AS MenorDiagnostico
      FROM Ordenes o
      INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
      INNER JOIN Usuarios u ON u.Id = c.IdUsuario
      LEFT JOIN Menores m ON m.Id = o.IdMenor
      WHERE o.Id = ? AND o.IdUsuarioFamilia = ?
    `).get(Number(req.params.id), userId);

    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

    // Tareas con decisión
    const tareas = db.prepare(`
      SELECT ot.Id, t.Descripcion, ot.Decision FROM OrdenTareas ot
      INNER JOIN Tareas t ON t.Id = ot.IdTarea
      WHERE ot.IdOrden = ?
    `).all(orden.Id);
    const tareasPersonalizadas = db.prepare(`
      SELECT Id, Descripcion, Decision FROM OrdenTareasPersonalizadas WHERE IdOrden = ?
    `).all(orden.Id);

    // Contrato
    const contrato = db.prepare('SELECT * FROM Contratos WHERE IdOrden = ?').get(orden.Id);

    // Negociaciones
    const negociaciones = db.prepare(`
      SELECT n.*, u.Nombres AS PropuestoPorNombres, u.Apellidos AS PropuestoPorApellidos
      FROM Negociaciones n
      INNER JOIN Usuarios u ON u.Id = n.IdPropuestoPor
      WHERE n.IdOrden = ?
      ORDER BY n.FechaCreacion DESC
    `).all(orden.Id);

    // Motivo cancelación
    const cancelReason = db.prepare(`
      SELECT Detalle FROM Auditoria
      WHERE IdEntidad = ? AND (Accion LIKE '%cancel%' OR Accion LIKE '%rechaz%')
      ORDER BY FechaCreacion DESC LIMIT 1
    `).get(orden.Id);

    // Reseñas (match por cuidadora + familia de la orden)
    const resenas = db.prepare(`
      SELECT r.Calificacion, r.Comentario, r.FechaCreacion FROM Resenas r
      INNER JOIN Ordenes o ON o.IdCuidadora = r.IdCuidadora AND o.IdUsuarioFamilia = r.IdUsuarioFamilia
      WHERE o.Id = ?
    `).all(orden.Id);

    res.json({
      ...orden,
      tareas: [
        ...tareas.map(t => ({ ...t, EsPersonalizada: false })),
        ...tareasPersonalizadas.map(t => ({ ...t, EsPersonalizada: true })),
      ],
      contrato,
      negociaciones,
      motivoCancelacion: cancelReason?.Detalle || null,
      resenas,
    });
  } catch (e) {
    console.error('DETALLE ERROR:', e);
    res.status(500).json({ error: e.message || 'Error interno' });
  }
});

// Liberar pago (finalizar sin incidencia)
router.post('/orden/:id/liberar-pago', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });

  const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdUsuarioFamilia = ?').get(Number(req.params.id), userId);
  if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
  if (orden.Estado !== 'Completada' && orden.Estado !== 'Finalizada') {
    return res.status(400).json({ error: 'El servicio debe estar completado' });
  }

  db.transaction(() => {
    db.prepare("UPDATE Escrow SET Estado = 'Liberado', FechaLiberacion = datetime('now') WHERE IdOrden = ?").run(orden.Id);
    db.prepare("UPDATE Ordenes SET Estado = 'Finalizada' WHERE Id = ?").run(orden.Id);
    // Notificar a la cuidadora
    const cuidadora = db.prepare('SELECT IdUsuario FROM Cuidadoras WHERE Id = ?').get(orden.IdCuidadora);
    if (cuidadora) {
      db.prepare("INSERT INTO Notificaciones (IdUsuarioDestino, Titulo, Descripcion, Tipo) VALUES (?, ?, ?, 'pago')").run(
        cuidadora.IdUsuario, 'Pago liberado',
        `El pago del servicio #${orden.Id} ha sido liberado.`
      );
    }
    // Notificar al admin
    const admins = db.prepare('SELECT Id FROM Usuarios WHERE IdRol = 1').all();
    for (const a of admins) {
      db.prepare("INSERT INTO Notificaciones (IdUsuarioDestino, Titulo, Descripcion, Tipo) VALUES (?, ?, ?, 'pago')").run(
        a.Id, 'Pago liberado sin incidencias',
        `Pago de orden #${orden.Id} liberado sin incidencias.`
      );
    }
    audit(userId, 'liberar_pago', 'Ordenes', orden.Id, 'Pago liberado sin incidencias');
  })();

  res.json({ success: true });
});

// Reportar incidencia + finalizar con incidencia
router.post('/reportar-incidencia', (req, res) => {
  const db = getDb();
  const userId = Number(req.headers['x-user-id']);
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });

  const { ordenId, categoria, descripcion, finalizar } = req.body;

  db.transaction(() => {
    const r = db.prepare(`INSERT INTO Incidencias (IdReporto, IdOrden, Tipo, Descripcion, Estado)
      VALUES (?, ?, ?, ?, 'Abierta')`).run(userId, ordenId || null, categoria || 'General', descripcion);
    if (finalizar && ordenId) {
      db.prepare("UPDATE Ordenes SET FinalizadaFamilia = 1, FechaFinalizacion = datetime('now'), Estado = 'Finalizada' WHERE Id = ?").run(ordenId);
    }
    audit(userId, 'reportar_incidencia', 'Incidencias', r.lastInsertRowid, descripcion?.slice(0, 200));
  })();

  res.json({ success: true });
});

export default router;
