import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/cursos', (req, res) => {
  try {
    const db = getDb();
    const cursos = db.prepare('SELECT * FROM Capacitaciones WHERE Activo = 1 ORDER BY Titulo').all();

    for (const c of cursos) {
      c.totalEvaluaciones = db.prepare('SELECT COUNT(*) AS c FROM EvaluacionesCapacitacion WHERE IdCapacitacion = ?').get(c.Id).c;
    }

    res.json(cursos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/curso/:id', (req, res) => {
  try {
    const db = getDb();
    const curso = db.prepare('SELECT * FROM Capacitaciones WHERE Id = ?').get(Number(req.params.id));
    if (!curso) return res.status(404).json({ error: 'Curso no encontrado' });

    const evaluaciones = db.prepare('SELECT * FROM EvaluacionesCapacitacion WHERE IdCapacitacion = ? ORDER BY Orden').all(curso.Id);

    res.json({ ...curso, evaluaciones });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/evaluacion/responder', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
    if (!cuidadora) return res.status(403).json({ error: 'Acceso denegado' });

    const { IdCapacitacion, respuestas } = req.body;
    if (!IdCapacitacion || !Array.isArray(respuestas) || respuestas.length === 0) {
      return res.status(400).json({ error: 'IdCapacitacion y respuestas son requeridos' });
    }

    const evaluaciones = db.prepare('SELECT * FROM EvaluacionesCapacitacion WHERE IdCapacitacion = ? ORDER BY Orden').all(IdCapacitacion);
    if (evaluaciones.length === 0) return res.status(404).json({ error: 'Evaluacion no encontrada' });

    let aciertos = 0;
    for (const ev of evaluaciones) {
      const respuestaUser = respuestas.find(r => r.idPregunta === ev.Id || r.orden === ev.Orden);
      if (respuestaUser && respuestaUser.respuesta === ev.RespuestaCorrecta) {
        aciertos++;
      }
    }

    const puntaje = Math.round((aciertos / evaluaciones.length) * 100);
    const aprobado = puntaje >= 70 ? 1 : 0;

    const existing = db.prepare('SELECT Id FROM ProgresoCapacitacion WHERE IdCuidadora = ? AND IdCapacitacion = ?').get(cuidadora.Id, IdCapacitacion);
    if (existing) {
      return res.status(400).json({ error: 'Ya has completado esta capacitacion' });
    }

    db.prepare('INSERT INTO ProgresoCapacitacion (IdCuidadora, IdCapacitacion, PuntajeObtenido, Aprobado, CertificadoGenerado, FechaCompletado) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))').run(
      cuidadora.Id, IdCapacitacion, puntaje, aprobado, aprobado
    );

    res.json({
      success: true,
      puntaje,
      aciertos,
      total: evaluaciones.length,
      aprobado: !!aprobado,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/progreso/:idCuidadora', (req, res) => {
  try {
    const db = getDb();
    const idCuidadora = Number(req.params.idCuidadora);

    const progreso = db.prepare(`
      SELECT pc.*, c.Titulo, c.Descripcion, c.Categoria
      FROM ProgresoCapacitacion pc
      INNER JOIN Capacitaciones c ON c.Id = pc.IdCapacitacion
      WHERE pc.IdCuidadora = ?
      ORDER BY pc.FechaCompletado DESC
    `).all(idCuidadora);

    const cursosDisponibles = db.prepare(`
      SELECT c.* FROM Capacitaciones c
      WHERE c.Activo = 1 AND c.Id NOT IN (
        SELECT IdCapacitacion FROM ProgresoCapacitacion WHERE IdCuidadora = ?
      )
    `).all(idCuidadora);

    res.json({ progreso, cursosDisponibles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
