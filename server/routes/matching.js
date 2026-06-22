import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.post('/calcular', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const { IdFamilia } = req.body;
    if (!IdFamilia) return res.status(400).json({ error: 'IdFamilia es requerido' });

    if (Number(IdFamilia) !== userId) {
      const user = db.prepare('SELECT IdRol FROM Usuarios WHERE Id = ?').get(userId);
      if (!user || user.IdRol !== 1) return res.status(403).json({ error: 'Acceso denegado' });
    }

    const menores = db.prepare('SELECT * FROM Menores WHERE IdUsuarioFamilia = ?').all(IdFamilia);
    const diagnosticos = [...new Set(menores.map(m => m.Diagnostico).filter(Boolean))];

    const cuidadoras = db.prepare(`
      SELECT c.Id, c.IdUsuario, c.AniosExperiencia, c.TarifaHora, c.CalificacionPromedio, c.TotalResenas, c.Zona,
             u.Nombres, u.Apellidos
      FROM Cuidadoras c
      INNER JOIN Usuarios u ON u.Id = c.IdUsuario
      WHERE c.Disponible = 1 AND u.Activo = 1 AND u.Suspendido = 0
    `).all();

    const resultados = [];

    for (const c of cuidadoras) {
      let puntaje = 0;
      const maxPuntaje = 100;
      const factores = [];

      const especialidades = db.prepare(`
        SELECT e.Nombre FROM CuidadoraEspecialidades ce
        INNER JOIN Especialidades e ON e.Id = ce.IdEspecialidad
        WHERE ce.IdCuidadora = ?
      `).all(c.Id).map(r => r.Nombre);

      const areas = db.prepare(`
        SELECT a.Nombre FROM CuidadoraAreas ca
        INNER JOIN Areas a ON a.Id = ca.IdArea
        WHERE ca.IdCuidadora = ?
      `).all(c.Id).map(r => r.Nombre);

      const compatibilidadDiagnostico = diagnosticos.length > 0
        ? diagnosticos.filter(d => especialidades.some(e => d && e.toLowerCase().includes(d.toLowerCase()))).length / diagnosticos.length * 30
        : 15;
      puntaje += compatibilidadDiagnostico;
      factores.push({ factor: 'Compatibilidad diagnostico', puntaje: compatibilidadDiagnostico, maximo: 30 });

      const puntajeExperiencia = Math.min(c.AniosExperiencia / 15 * 20, 20);
      puntaje += puntajeExperiencia;
      factores.push({ factor: 'Experiencia', puntaje: puntajeExperiencia, maximo: 20 });

      const puntajeCalificacion = (c.CalificacionPromedio / 5) * 20;
      puntaje += puntajeCalificacion;
      factores.push({ factor: 'Calificacion', puntaje: puntajeCalificacion, maximo: 20 });

      const puntajeResenas = Math.min(c.TotalResenas / 10 * 10, 10);
      puntaje += puntajeResenas;
      factores.push({ factor: 'Resenas', puntaje: puntajeResenas, maximo: 10 });

      const areasDeseadas = ['Cuidado domiciliario', 'Acompaniamiento escolar', 'Terapias de estimulacion'];
      const compatibilidadArea = areas.filter(a => areasDeseadas.includes(a)).length / areasDeseadas.length * 10;
      puntaje += compatibilidadArea;
      factores.push({ factor: 'Compatibilidad areas', puntaje: compatibilidadArea, maximo: 10 });

      if (c.TotalResenas > 0 && c.CalificacionPromedio >= 4) {
        puntaje += 5;
        factores.push({ factor: 'Consistencia calidad', puntaje: 5, maximo: 5 });
      }

      if (c.Zona) {
        puntaje += 5;
        factores.push({ factor: 'Zona definida', puntaje: 5, maximo: 5 });
      }

      resultados.push({
        cuidadoraId: c.Id,
        nombres: c.Nombres,
        apellidos: c.Apellidos,
        aniosExperiencia: c.AniosExperiencia,
        tarifaHora: c.TarifaHora,
        calificacion: c.CalificacionPromedio,
        zona: c.Zona,
        especialidades,
        areas,
        puntajeTotal: Math.round(puntaje * 100) / 100,
        factores,
        nivelCompatibilidad: puntaje >= 80 ? 'Alta' : puntaje >= 50 ? 'Media' : 'Baja',
      });
    }

    resultados.sort((a, b) => b.puntajeTotal - a.puntajeTotal);

    res.json(resultados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/resultados/:idFamilia', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const idFamilia = Number(req.params.idFamilia);
    const user = db.prepare('SELECT IdRol FROM Usuarios WHERE Id = ?').get(userId);
    if (user.IdRol !== 1 && userId !== idFamilia) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const menores = db.prepare('SELECT * FROM Menores WHERE IdUsuarioFamilia = ?').all(idFamilia);
    const diagnosticos = [...new Set(menores.map(m => m.Diagnostico).filter(Boolean))];

    const cuidadoras = db.prepare(`
      SELECT c.Id, c.AniosExperiencia, c.TarifaHora, c.CalificacionPromedio, c.TotalResenas, c.Zona,
             u.Nombres, u.Apellidos, u.FotoPerfil
      FROM Cuidadoras c
      INNER JOIN Usuarios u ON u.Id = c.IdUsuario
      WHERE c.Disponible = 1 AND u.Activo = 1 AND u.Suspendido = 0
      ORDER BY c.CalificacionPromedio DESC
    `).all();

    const resultados = cuidadoras.map(c => {
      let puntaje = 0;
      const especialidades = db.prepare(`
        SELECT e.Nombre FROM CuidadoraEspecialidades ce
        INNER JOIN Especialidades e ON e.Id = ce.IdEspecialidad
        WHERE ce.IdCuidadora = ?
      `).all(c.Id).map(r => r.Nombre);

      const compatibilidadDiag = diagnosticos.length > 0
        ? diagnosticos.filter(d => especialidades.some(e => d && e.toLowerCase().includes(d.toLowerCase()))).length / diagnosticos.length * 30
        : 15;
      puntaje += compatibilidadDiag;
      puntaje += Math.min(c.AniosExperiencia / 15 * 20, 20);
      puntaje += (c.CalificacionPromedio / 5) * 20;
      puntaje += Math.min(c.TotalResenas / 10 * 10, 10);
      if (c.Zona) puntaje += 5;

      return {
        cuidadoraId: c.Id,
        nombres: c.Nombres,
        apellidos: c.Apellidos,
        fotoPerfil: c.FotoPerfil,
        aniosExperiencia: c.AniosExperiencia,
        tarifaHora: c.TarifaHora,
        calificacion: c.CalificacionPromedio,
        totalResenas: c.TotalResenas,
        zona: c.Zona,
        especialidades,
        puntajeTotal: Math.round(puntaje * 100) / 100,
      };
    });

    resultados.sort((a, b) => b.puntajeTotal - a.puntajeTotal);
    res.json(resultados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
