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

export default router;
