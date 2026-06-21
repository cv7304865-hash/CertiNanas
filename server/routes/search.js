import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/search/cuidadoras', (req, res) => {
  const db = getDb();
  const { especialidad, zona, experiencia, tarifa_max, tareaIds } = req.query;

  let sql = `
    SELECT DISTINCT c.Id, c.IdUsuario, c.AniosExperiencia, c.TarifaHora, c.CalificacionPromedio, c.TotalResenas,
           u.Nombres, u.Apellidos, u.Email,
           (SELECT GROUP_CONCAT(e.Nombre, ' · ') FROM CuidadoraEspecialidades ce INNER JOIN Especialidades e ON e.Id = ce.IdEspecialidad WHERE ce.IdCuidadora = c.Id) AS Especialidades
    FROM Cuidadoras c
    INNER JOIN Usuarios u ON u.Id = c.IdUsuario
    WHERE c.Disponible = 1 AND u.Activo = 1 AND u.Suspendido = 0
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

  // Matchmaking por tareas: filtrar cuidadoras según especialidades requeridas
  if (tareaIds) {
    const ids = tareaIds.split(',').map(Number).filter(n => !isNaN(n));
    if (ids.length > 0) {
      // Mapear categorías de tareas a nombres de especialidades
      const catToEsp = {
        1: 'TEA', 2: 'TDAH', 3: 'Sindrome de Down', 4: 'Primeros Auxilios',
      };
      const espRequeridas = new Set();
      const rows = db.prepare(
        `SELECT DISTINCT IdCategoria FROM Tareas WHERE Id IN (${ids.map(() => '?').join(',')})`
      ).all(...ids);
      for (const r of rows) {
        const esp = catToEsp[r.IdCategoria];
        if (esp) espRequeridas.add(esp);
      }
      if (espRequeridas.size > 0) {
        const conditions = Array.from(espRequeridas).map(() =>
          `c.Id IN (SELECT ce.IdCuidadora FROM CuidadoraEspecialidades ce INNER JOIN Especialidades e ON e.Id = ce.IdEspecialidad WHERE e.Nombre = ?)`
        );
        sql += ` AND (${conditions.join(' AND ')})`;
        params.push(...Array.from(espRequeridas));
      }
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

// Perfil completo de cuidadora para vista detallada
router.get('/search/cuidadora/:id/perfil', (req, res) => {
  const db = getDb();
  const cuidadoraId = Number(req.params.id);

  const cuidadora = db.prepare(`
    SELECT c.*, u.Nombres, u.Apellidos, u.Email, u.Telefono
    FROM Cuidadoras c
    INNER JOIN Usuarios u ON u.Id = c.IdUsuario
    WHERE c.Id = ?
  `).get(cuidadoraId);
  if (!cuidadora) return res.status(404).json({ error: 'Cuidadora no encontrada' });

  const especialidades = db.prepare(`
    SELECT e.Nombre, e.Descripcion FROM CuidadoraEspecialidades ce
    INNER JOIN Especialidades e ON e.Id = ce.IdEspecialidad
    WHERE ce.IdCuidadora = ?
  `).all(cuidadoraId);

  const areas = db.prepare(`
    SELECT a.Nombre FROM CuidadoraAreas ca
    INNER JOIN Areas a ON a.Id = ca.IdArea
    WHERE ca.IdCuidadora = ?
  `).all(cuidadoraId);

  const formacion = db.prepare(`
    SELECT Titulo, Institucion, AnioObtencion FROM CuidadoraFormacion
    WHERE IdCuidadora = ? ORDER BY Orden ASC
  `).all(cuidadoraId);

  const certificaciones = db.prepare(`
    SELECT Nombre, EntidadEmisora, FechaObtencion, FechaVencimiento FROM CuidadoraCertificaciones
    WHERE IdCuidadora = ? ORDER BY Orden ASC
  `).all(cuidadoraId);

  const documentos = db.prepare(`
    SELECT dp.TipoRequisito, dp.Estado
    FROM DocumentosPostulacion dp
    INNER JOIN Postulaciones p ON p.Id = dp.IdPostulacion
    WHERE p.IdUsuario = (SELECT IdUsuario FROM Cuidadoras WHERE Id = ?)
    ORDER BY dp.TipoRequisito
  `).all(cuidadoraId);

  const serviciosCompletados = db.prepare(`
    SELECT COUNT(*) AS total FROM Ordenes WHERE IdCuidadora = ? AND Estado = 'Completada'
  `).get(cuidadoraId);

  const resenas = db.prepare(`
    SELECT r.Calificacion, r.Comentario, r.FechaResena,
           u.Nombres, u.Apellidos
    FROM Resenas r
    INNER JOIN Usuarios u ON u.Id = r.IdUsuarioFamilia
    WHERE r.IdCuidadora = ?
    ORDER BY r.FechaCreacion DESC
  `).all(cuidadoraId);

  const postulacion = db.prepare(`
    SELECT Estado FROM Postulaciones WHERE IdUsuario = (SELECT IdUsuario FROM Cuidadoras WHERE Id = ?)
  `).get(cuidadoraId);

  res.json({
    cuidadora,
    especialidades,
    areas,
    formacion,
    certificaciones,
    documentos,
    serviciosCompletados: serviciosCompletados.total,
    resenas,
    verificado: postulacion?.Estado === 'Aprobada',
  });
});

export default router;
