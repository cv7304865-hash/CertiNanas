import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// GET /api/tareas/categorias — todas las categorías con sus tareas
router.get('/tareas/categorias', (_req, res) => {
  try {
    const db = getDb();
    const cats = db.prepare('SELECT * FROM TareasCategoria ORDER BY Orden').all();
    for (const c of cats) {
      c.tareas = db.prepare('SELECT * FROM Tareas WHERE IdCategoria = ? ORDER BY Orden').all(c.Id);
    }
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ordenes/:id/tareas — tareas seleccionadas para una orden
router.get('/ordenes/:id/tareas', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT t.Id, t.Descripcion, tc.Id AS IdCategoria, tc.Nombre AS Categoria
      FROM OrdenTareas ot
      JOIN Tareas t ON t.Id = ot.IdTarea
      JOIN TareasCategoria tc ON tc.Id = t.IdCategoria
      WHERE ot.IdOrden = ?
      ORDER BY tc.Orden, t.Orden
    `).all(req.params.id);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ordenes/:id/tareas — guardar/actualizar tareas seleccionadas para una orden
router.post('/ordenes/:id/tareas', (req, res) => {
  try {
    const db = getDb();
    const ordenId = req.params.id;
    const { tareasIds } = req.body; // array de IDs de tareas
    if (!Array.isArray(tareasIds)) return res.status(400).json({ error: 'tareasIds debe ser un array' });

    const tx = db.transaction(() => {
      db.prepare('DELETE FROM OrdenTareas WHERE IdOrden = ?').run(ordenId);
      const stmt = db.prepare('INSERT INTO OrdenTareas (IdOrden, IdTarea) VALUES (?, ?)');
      for (const id of tareasIds) stmt.run(ordenId, id);
    });
    tx();

    res.json({ success: true, count: tareasIds.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
