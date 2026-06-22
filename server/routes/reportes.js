import { Router } from 'express';
import { getDb } from '../db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

router.post('/crear', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
    if (!cuidadora) return res.status(403).json({ error: 'Acceso denegado' });

    const { IdOrden, estadoGeneral, alimentacion, medicamentos, actividadesRealizadas, observaciones } = req.body;
    if (!IdOrden) return res.status(400).json({ error: 'IdOrden es requerido' });

    const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdCuidadora = ?').get(IdOrden, cuidadora.Id);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
    if (!orden.IdMenor) return res.status(400).json({ error: 'La orden no tiene un menor asignado' });

    const estadosValidos = ['Excelente', 'Bueno', 'Regular', 'Requiere Observacion'];
    if (estadoGeneral && !estadosValidos.includes(estadoGeneral)) {
      return res.status(400).json({ error: 'EstadoGeneral invalido' });
    }

    const result = db.prepare('INSERT INTO ReportesDiarios (IdOrden, IdCuidadora, IdMenor, EstadoGeneral, Alimentacion, Medicamentos, ActividadesRealizadas, Observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      IdOrden, cuidadora.Id, orden.IdMenor, estadoGeneral || null, alimentacion || null, medicamentos || null, actividadesRealizadas || null, observaciones || null
    );

    const reporte = db.prepare('SELECT * FROM ReportesDiarios WHERE Id = ?').get(result.lastInsertRowid);
    res.status(201).json(reporte);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/evidencia', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const { IdReporte, tipoArchivo, nombreArchivo, rutaArchivo } = req.body;
    if (!IdReporte || !tipoArchivo || !nombreArchivo || !rutaArchivo) {
      return res.status(400).json({ error: 'IdReporte, tipoArchivo, nombreArchivo y rutaArchivo son requeridos' });
    }

    const reporte = db.prepare('SELECT Id, IdCuidadora FROM ReportesDiarios WHERE Id = ?').get(IdReporte);
    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });

    const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
    if (!cuidadora || cuidadora.Id !== reporte.IdCuidadora) return res.status(403).json({ error: 'Acceso denegado' });

    const result = db.prepare('INSERT INTO ReportesDiariosEvidencias (IdReporte, TipoArchivo, NombreArchivo, RutaArchivo) VALUES (?, ?, ?, ?)').run(IdReporte, tipoArchivo, nombreArchivo, rutaArchivo);

    res.status(201).json({ success: true, evidenciaId: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orden/:idOrden', (req, res) => {
  try {
    const db = getDb();
    const reportes = db.prepare(`
      SELECT rd.*,
             m.Nombre AS MenorNombre
      FROM ReportesDiarios rd
      LEFT JOIN Menores m ON m.Id = rd.IdMenor
      WHERE rd.IdOrden = ?
      ORDER BY rd.FechaReporte DESC
    `).all(Number(req.params.idOrden));

    for (const r of reportes) {
      r.evidencias = db.prepare('SELECT * FROM ReportesDiariosEvidencias WHERE IdReporte = ?').all(r.Id);
    }

    res.json(reportes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const reporte = db.prepare(`
      SELECT rd.*,
             m.Nombre AS MenorNombre,
             u.Nombres AS CuidadoraNombres, u.Apellidos AS CuidadoraApellidos
      FROM ReportesDiarios rd
      LEFT JOIN Menores m ON m.Id = rd.IdMenor
      LEFT JOIN Cuidadoras c ON c.Id = rd.IdCuidadora
      LEFT JOIN Usuarios u ON u.Id = c.IdUsuario
      WHERE rd.Id = ?
    `).get(Number(req.params.id));

    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });

    reporte.evidencias = db.prepare('SELECT * FROM ReportesDiariosEvidencias WHERE IdReporte = ?').all(reporte.Id);

    res.json(reporte);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
