import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/solicitudes', (req, res) => {
  const db = getDb();
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Se requiere x-user-id' });

  const rows = db.prepare(`
    SELECT o.Id, o.FechaServicio, o.TotalHoras, o.TarifaHora, o.Total, o.Subtotal, o.TarifaPlataforma, o.Estado, o.HoraInicio, o.HoraFin,
           c.Id AS CuidadoraId, u.Nombres AS CuidadoraNombres, u.Apellidos AS CuidadoraApellidos,
           m.Nombre AS MenorNombre, m.Diagnostico AS MenorDiagnostico
    FROM Ordenes o
    INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
    INNER JOIN Usuarios u ON u.Id = c.IdUsuario
    LEFT JOIN Menores m ON m.Id = o.IdMenor
    WHERE o.IdUsuarioFamilia = ?
    ORDER BY o.FechaCreacion DESC
  `).all(Number(userId));

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
           uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos
    FROM Ordenes o
    INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
    INNER JOIN Usuarios u ON u.Id = c.IdUsuario
    INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
    LEFT JOIN Menores m ON m.Id = o.IdMenor
    WHERE o.Id = ? AND o.IdUsuarioFamilia = ?
  `).get(Number(req.params.id), Number(userId));

  if (!row) return res.status(404).json({ error: 'Solicitud no encontrada' });
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
      const terminos = `Servicio de cuidado especializado. Fecha: ${orden.FechaServicio}, Horas: ${orden.TotalHoras}, Tarifa: S/ ${orden.TarifaHora}/h, Total: S/ ${orden.Total}.`;
      const r = db.prepare('INSERT INTO Contratos (IdOrden, Terminos) VALUES (?, ?)').run(orden.Id, terminos);
      contrato = { Id: r.lastInsertRowid };
    }
    db.prepare("UPDATE Contratos SET AceptadoFamilia = 1, FechaAceptacionFamilia = datetime('now') WHERE Id = ?").run(contrato.Id);
    db.prepare('UPDATE Ordenes SET ConfirmadaFamilia = 1 WHERE Id = ?').run(orden.Id);
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

  db.transaction(() => {
    db.prepare("UPDATE Ordenes SET Estado = 'Pagada' WHERE Id = ?").run(orden.Id);
    db.prepare("INSERT INTO Pagos (IdOrden, Monto, MetodoPago, Estado) VALUES (?, ?, 'Tarjeta', 'Completado')").run(orden.Id, orden.Total);
    // Crear registro Escrow: el 92% va a la cuidadora, 8% retenido por la plataforma
    const montoCuidadora = orden.Subtotal;
    const montoPlataforma = orden.TarifaPlataforma;
    const escrowResult = db.prepare("INSERT INTO Escrow (IdOrden, MontoTotal, MontoCuidadora, MontoPlataforma, Estado) VALUES (?, ?, ?, ?, 'Retenido')").run(orden.Id, orden.Total, montoCuidadora, montoPlataforma);
    db.prepare('UPDATE Ordenes SET IdEscrow = ? WHERE Id = ?').run(escrowResult.lastInsertRowid, orden.Id);
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
  if (orden.Estado !== 'Pagada') return res.status(400).json({ error: 'El servicio debe estar pagado para finalizarlo' });
  if (orden.FinalizadaFamilia) return res.status(400).json({ error: 'Ya confirmaste la finalización' });

  db.transaction(() => {
    db.prepare("UPDATE Ordenes SET FinalizadaFamilia = 1, FechaFinalizacion = datetime('now') WHERE Id = ?").run(orden.Id);
    // Si ambas partes confirmaron, liberar Escrow
    const ordenActualizada = db.prepare('SELECT * FROM Ordenes WHERE Id = ?').get(orden.Id);
    if (ordenActualizada.FinalizadaFamilia && ordenActualizada.FinalizadaCuidadora) {
      db.prepare("UPDATE Escrow SET Estado = 'Liberado', FechaLiberacion = datetime('now') WHERE IdOrden = ?").run(orden.Id);
      db.prepare("UPDATE Ordenes SET Estado = 'Completada' WHERE Id = ?").run(orden.Id);
    }
  })();

  res.json({ success: true });
});

export default router;
