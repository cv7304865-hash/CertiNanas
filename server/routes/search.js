import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/search/cuidadoras', (req, res) => {
  const db = getDb();
  const { especialidad, zona, experiencia, tarifa_max } = req.query;

  let sql = `
    SELECT DISTINCT c.Id, c.IdUsuario, c.AniosExperiencia, c.TarifaHora, c.CalificacionPromedio, c.TotalResenas,
           u.Nombres, u.Apellidos, u.Email,
           (SELECT GROUP_CONCAT(e.Nombre, ' · ') FROM CuidadoraEspecialidades ce INNER JOIN Especialidades e ON e.Id = ce.IdEspecialidad WHERE ce.IdCuidadora = c.Id) AS Especialidades
    FROM Cuidadoras c
    INNER JOIN Usuarios u ON u.Id = c.IdUsuario
    WHERE c.Disponible = 1
  `;
  const params = [];

  if (especialidad) {
    sql += ` AND c.Id IN (SELECT ce.IdCuidadora FROM CuidadoraEspecialidades ce INNER JOIN Especialidades e ON e.Id = ce.IdEspecialidad WHERE e.Nombre LIKE ?)`;
    params.push(`%${especialidad}%`);
  }
  if (zona) {
    sql += ` AND c.Zona LIKE ?`;
    params.push(`%${zona}%`);
  }
  if (experiencia) {
    const minExp = parseInt(experiencia);
    if (!isNaN(minExp)) {
      sql += ` AND c.AniosExperiencia >= ?`;
      params.push(minExp);
    }
  }
  if (tarifa_max) {
    const maxTarifa = parseFloat(tarifa_max);
    if (!isNaN(maxTarifa)) {
      sql += ` AND c.TarifaHora <= ?`;
      params.push(maxTarifa);
    }
  }

  sql += ` ORDER BY c.CalificacionPromedio DESC`;

  const cuidadoras = db.prepare(sql).all(...params);
  res.json(cuidadoras);
});

// Endpoint público: casos de éxito visibles para familias
router.get('/casos/exito', (req, res) => {
  const db = getDb();
  const casos = db.prepare(`
    SELECT c.Id, c.Titulo, c.Descripcion, c.FechaCreacion,
           u.Nombres, u.Apellidos
    FROM Casos c
    LEFT JOIN Usuarios u ON u.Id = c.IdUsuarioReporta
    WHERE c.Tipo = 'Exito'
    ORDER BY c.FechaCreacion DESC
  `).all();
  res.json(casos);
});

export default router;
