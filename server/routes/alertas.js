import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/sla', (req, res) => {
  try {
    const db = getDb();

    const postulacionesPendientes = db.prepare(`
      SELECT p.Id, p.IdUsuario, p.FechaPostulacion,
             u.Nombres, u.Apellidos, u.Email,
             CAST(julianday('now') - julianday(p.FechaPostulacion) AS INTEGER) AS DiasPendiente
      FROM Postulaciones p
      INNER JOIN Usuarios u ON u.Id = p.IdUsuario
      WHERE p.Estado = 'Pendiente'
      ORDER BY p.FechaPostulacion ASC
    `).all();

    const alertas = postulacionesPendientes.map(p => ({
      ...p,
      nivelAlerta: p.DiasPendiente >= 3 ? 'critico' : p.DiasPendiente >= 1 ? 'atencion' : 'normal',
      diasRestantesSLA: Math.max(0, 3 - p.DiasPendiente),
    }));

    const incidenciasSinResolver = db.prepare(`
      SELECT COUNT(*) AS c FROM Incidencias WHERE Estado != 'Cerrada'
    `).get().c;

    const ordenesSinConfirmar = db.prepare(`
      SELECT COUNT(*) AS c FROM Ordenes
      WHERE (ConfirmadaFamilia = 0 OR ConfirmadaCuidadora = 0)
      AND Estado NOT IN ('Cancelada', 'Completada', 'Finalizada')
    `).get().c;

    res.json({
      totalPendientesRevision: postulacionesPendientes.length,
      alertas: alertas.filter(a => a.nivelAlerta !== 'normal'),
      postulaciones: alertas,
      incidenciasSinResolver,
      ordenesSinConfirmar,
      slaCumplimiento: postulacionesPendientes.length > 0
        ? Math.round((postulacionesPendientes.filter(p => p.DiasPendiente <= 3).length / postulacionesPendientes.length) * 100)
        : 100,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/riesgo/calcular', (req, res) => {
  try {
    const db = getDb();

    const ordenesActivas = db.prepare(`
      SELECT o.*, c.CalificacionPromedio, c.AniosExperiencia, c.TotalResenas,
             (SELECT COUNT(*) FROM Incidencias WHERE IdOrden = o.Id) AS TotalIncidencias,
             (SELECT COUNT(*) FROM Incidentes WHERE IdOrden = o.Id AND Estado IN ('Activo','EnAtencion')) AS IncidentesActivos
      FROM Ordenes o
      INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
      WHERE o.Estado NOT IN ('Cancelada', 'Completada', 'Finalizada')
    `).all();

    const resultados = [];

    for (const o of ordenesActivas) {
      let puntajeRiesgo = 0;
      const variables = [];

      if (o.TotalIncidencias > 2) {
        puntajeRiesgo += 30;
        variables.push({ variable: 'Incidencias recurrentes', peso: 30 });
      }

      if (o.IncidentesActivos > 0) {
        puntajeRiesgo += 25;
        variables.push({ variable: 'Incidentes activos', peso: 25 });
      }

      if (o.CalificacionPromedio < 3 && o.TotalResenas > 2) {
        puntajeRiesgo += 20;
        variables.push({ variable: 'Calificacion baja', peso: 20 });
      }

      if (o.AniosExperiencia < 1) {
        puntajeRiesgo += 10;
        variables.push({ variable: 'Poca experiencia', peso: 10 });
      }

      if (o.FechaServicio && new Date(o.FechaServicio) < new Date()) {
        const diasVencida = Math.floor((new Date() - new Date(o.FechaServicio)) / (1000 * 60 * 60 * 24));
        if (diasVencida > 7) {
          puntajeRiesgo += 15;
          variables.push({ variable: 'Servicio vencido', peso: 15 });
        }
      }

      const nivelRiesgo = puntajeRiesgo >= 50 ? 'Alto' : puntajeRiesgo >= 25 ? 'Medio' : 'Bajo';

      const existing = db.prepare('SELECT Id FROM PrediccionRiesgos WHERE IdOrden = ?').get(o.Id);
      const alertaGenerada = nivelRiesgo === 'Alto' ? 1 : 0;

      if (existing) {
        db.prepare("UPDATE PrediccionRiesgos SET NivelRiesgo = ?, PuntajeRiesgo = ?, VariablesAnalizadas = ?, AlertaGenerada = ? WHERE IdOrden = ?").run(
          nivelRiesgo, puntajeRiesgo, JSON.stringify(variables), alertaGenerada, o.Id
        );
      } else {
        db.prepare("INSERT INTO PrediccionRiesgos (IdOrden, NivelRiesgo, PuntajeRiesgo, VariablesAnalizadas, AlertaGenerada) VALUES (?, ?, ?, ?, ?)").run(
          o.Id, nivelRiesgo, puntajeRiesgo, JSON.stringify(variables), alertaGenerada
        );
      }

      if (alertaGenerada) {
        const admins = db.prepare('SELECT Id FROM Usuarios WHERE IdRol = 1').all();
        for (const a of admins) {
          const existingNotif = db.prepare("SELECT Id FROM Notificaciones WHERE IdUsuarioDestino = ? AND Titulo LIKE ? AND FechaCreacion >= datetime('now', '-1 hour')").get(a.Id, '%Riesgo Alto%');
          if (!existingNotif) {
            db.prepare("INSERT INTO Notificaciones (IdUsuarioDestino, Titulo, Descripcion, Tipo) VALUES (?, ?, ?, ?)").run(
              a.Id, 'Riesgo Alto detectado en orden #' + o.Id,
              'El sistema de prediccion ha detectado un nivel de riesgo alto en la orden #' + o.Id + '. Se requiere atencion inmediata.',
              'alerta'
            );
          }
        }
      }

      resultados.push({
        idOrden: o.Id,
        puntajeRiesgo,
        nivelRiesgo,
        variables,
        alertaGenerada: !!alertaGenerada,
      });
    }

    res.json({
      totalAnalizadas: ordenesActivas.length,
      riesgoAlto: resultados.filter(r => r.nivelRiesgo === 'Alto').length,
      riesgoMedio: resultados.filter(r => r.nivelRiesgo === 'Medio').length,
      riesgoBajo: resultados.filter(r => r.nivelRiesgo === 'Bajo').length,
      resultados,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/riesgo', (req, res) => {
  try {
    const db = getDb();

    const predicciones = db.prepare(`
      SELECT pr.*, o.TipoServicio, o.FechaServicio, o.Estado AS OrdenEstado,
             uf.Nombres AS FamiliaNombres, uf.Apellidos AS FamiliaApellidos,
             uc.Nombres AS CuidadoraNombres, uc.Apellidos AS CuidadoraApellidos
      FROM PrediccionRiesgos pr
      INNER JOIN Ordenes o ON o.Id = pr.IdOrden
      INNER JOIN Usuarios uf ON uf.Id = o.IdUsuarioFamilia
      INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
      INNER JOIN Usuarios uc ON uc.Id = c.IdUsuario
      ORDER BY pr.PuntajeRiesgo DESC
    `).all();

    for (const p of predicciones) {
      if (p.VariablesAnalizadas) {
        try { p.VariablesAnalizadas = JSON.parse(p.VariablesAnalizadas); } catch(e) { p.VariablesAnalizadas = []; }
      }
    }

    res.json({
      total: predicciones.length,
      riesgoAlto: predicciones.filter(p => p.NivelRiesgo === 'Alto').length,
      riesgoMedio: predicciones.filter(p => p.NivelRiesgo === 'Medio').length,
      predicciones,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ADMIN: marcar alerta de riesgo como revisada ──
router.post('/riesgo/:id/revisar', (req, res) => {
  try {
    const db = getDb();
    db.prepare("UPDATE PrediccionRiesgos SET AlertaGenerada = 0 WHERE Id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
