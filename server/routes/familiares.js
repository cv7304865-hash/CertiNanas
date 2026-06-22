import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.post('/miembros', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const user = db.prepare('SELECT IdRol FROM Usuarios WHERE Id = ?').get(userId);
    if (!user || user.IdRol !== 2) return res.status(403).json({ error: 'Solo familias pueden agregar miembros' });

    const { IdUsuarioFamiliaPrincipal, nombre, email, telefono, rol } = req.body;
    if (!IdUsuarioFamiliaPrincipal || !nombre?.trim()) {
      return res.status(400).json({ error: 'IdUsuarioFamiliaPrincipal y nombre son requeridos' });
    }

    if (Number(IdUsuarioFamiliaPrincipal) !== userId) {
      return res.status(403).json({ error: 'No puedes agregar miembros a otra familia' });
    }

    const rolesValidos = ['Administrador', 'Observador'];
    if (rol && !rolesValidos.includes(rol)) {
      return res.status(400).json({ error: 'Rol invalido' });
    }

    const result = db.prepare('INSERT INTO FamiliaMiembros (IdUsuarioFamiliaPrincipal, Nombre, Email, Telefono, Rol) VALUES (?, ?, ?, ?, ?)').run(
      IdUsuarioFamiliaPrincipal, nombre.trim(), email || null, telefono || null, rol || 'Observador'
    );

    const miembro = db.prepare('SELECT * FROM FamiliaMiembros WHERE Id = ?').get(result.lastInsertRowid);
    res.status(201).json(miembro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/miembros/:idFamilia', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const idFamilia = Number(req.params.idFamilia);
    const user = db.prepare('SELECT IdRol FROM Usuarios WHERE Id = ?').get(userId);

    if (user.IdRol !== 1 && userId !== idFamilia) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const miembros = db.prepare('SELECT * FROM FamiliaMiembros WHERE IdUsuarioFamiliaPrincipal = ? AND Activo = 1 ORDER BY FechaCreacion ASC').all(idFamilia);
    res.json(miembros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/miembro/:id', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const miembro = db.prepare('SELECT * FROM FamiliaMiembros WHERE Id = ?').get(Number(req.params.id));
    if (!miembro) return res.status(404).json({ error: 'Miembro no encontrado' });

    if (miembro.IdUsuarioFamiliaPrincipal !== userId) {
      const user = db.prepare('SELECT IdRol FROM Usuarios WHERE Id = ?').get(userId);
      if (!user || user.IdRol !== 1) return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { rol, activo } = req.body;
    if (rol !== undefined) {
      const rolesValidos = ['Administrador', 'Observador'];
      if (!rolesValidos.includes(rol)) return res.status(400).json({ error: 'Rol invalido' });
      db.prepare('UPDATE FamiliaMiembros SET Rol = ? WHERE Id = ?').run(rol, miembro.Id);
    }
    if (activo !== undefined) {
      db.prepare('UPDATE FamiliaMiembros SET Activo = ? WHERE Id = ?').run(activo ? 1 : 0, miembro.Id);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/miembro/:id', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const miembro = db.prepare('SELECT * FROM FamiliaMiembros WHERE Id = ?').get(Number(req.params.id));
    if (!miembro) return res.status(404).json({ error: 'Miembro no encontrado' });

    if (miembro.IdUsuarioFamiliaPrincipal !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este miembro' });
    }

    db.prepare('DELETE FROM FamiliaMiembros WHERE Id = ?').run(miembro.Id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
