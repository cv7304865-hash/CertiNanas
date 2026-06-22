import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/dashboard', (req, res) => {
  try {
    const db = getDb();

    const serviciosActivos = db.prepare("SELECT COUNT(*) AS c FROM Ordenes WHERE Estado IN ('Pendiente','Confirmada','Pagada','En curso')").get().c;
    const serviciosFinalizados = db.prepare("SELECT COUNT(*) AS c FROM Ordenes WHERE Estado IN ('Completada','Finalizada')").get().c;
    const serviciosCancelados = db.prepare("SELECT COUNT(*) AS c FROM Ordenes WHERE Estado = 'Cancelada'").get().c;

    const ingresos = db.prepare("SELECT COALESCE(SUM(Monto), 0) AS total FROM Pagos WHERE Estado = 'Completado'").get().total;
    const comisiones = db.prepare("SELECT COALESCE(SUM(TarifaPlataforma), 0) AS total FROM Ordenes WHERE Estado NOT IN ('Cancelada','Pendiente')").get().total;

    const fondosEscrow = db.prepare("SELECT COALESCE(SUM(MontoTotal), 0) AS total FROM Escrow WHERE Estado = 'Retenido'").get().total;

    const primeraOrden = db.prepare("SELECT MIN(FechaCreacion) AS fecha FROM Ordenes").get();
    const ordenesTiempo = db.prepare(`
      SELECT o.Id, o.FechaCreacion,
             (SELECT MIN(FechaCreacion) FROM Negociaciones WHERE IdOrden = o.Id) AS FechaNegociacion,
             (SELECT MIN(FechaCreacion) FROM Contratos WHERE IdOrden = o.Id) AS FechaContrato
      FROM Ordenes o
      WHERE o.FechaCreacion IS NOT NULL
    `).all();

    let tiempoRespuestaPromedio = 0;
    let countTiempo = 0;
    for (const o of ordenesTiempo) {
      const fechaRef = o.FechaNegociacion || o.FechaContrato;
      if (fechaRef && o.FechaCreacion) {
        const diffMs = new Date(fechaRef) - new Date(o.FechaCreacion);
        const diffHoras = diffMs / (1000 * 60 * 60);
        if (diffHoras >= 0) {
          tiempoRespuestaPromedio += diffHoras;
          countTiempo++;
        }
      }
    }
    if (countTiempo > 0) tiempoRespuestaPromedio = Math.round((tiempoRespuestaPromedio / countTiempo) * 10) / 10;

    const totalOrdenes = db.prepare("SELECT COUNT(*) AS c FROM Ordenes WHERE Estado NOT IN ('Pendiente')").get().c;
    const tasaCancelaciones = totalOrdenes > 0 ? Math.round((serviciosCancelados / totalOrdenes) * 10000) / 100 : 0;

    const recontrataciones = db.prepare(`
      SELECT COUNT(*) AS c FROM (
        SELECT IdCuidadora, IdUsuarioFamilia, COUNT(*) AS veces
        FROM Ordenes
        WHERE Estado NOT IN ('Cancelada','Pendiente')
        GROUP BY IdCuidadora, IdUsuarioFamilia
        HAVING veces > 1
      )
    `).get().c;

    const ingresosPorMes = db.prepare(`
      SELECT strftime('%Y-%m', p.FechaPago) AS mes, COALESCE(SUM(p.Monto), 0) AS total
      FROM Pagos p WHERE p.Estado = 'Completado'
      GROUP BY mes ORDER BY mes ASC
    `).all();

    const ordenesPorEstado = db.prepare("SELECT Estado, COUNT(*) AS count FROM Ordenes GROUP BY Estado ORDER BY count DESC").all();

    res.json({
      serviciosActivos,
      serviciosFinalizados,
      serviciosCancelados,
      ingresos,
      comisiones,
      fondosEscrow,
      tiempoRespuestaPromedio,
      tasaCancelaciones,
      recontrataciones,
      ingresosPorMes,
      ordenesPorEstado,
      totalTransacciones: db.prepare("SELECT COUNT(*) AS c FROM Pagos WHERE Estado = 'Completado'").get().c,
      cuidadorasActivas: db.prepare("SELECT COUNT(*) AS c FROM Cuidadoras WHERE Disponible = 1").get().c,
      familiasRegistradas: db.prepare("SELECT COUNT(*) AS c FROM Usuarios WHERE IdRol = 2").get().c,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/prediccion-demanda', (req, res) => {
  try {
    const db = getDb();

    const ordenesPorMes = db.prepare(`
      SELECT strftime('%Y-%m', FechaCreacion) AS mes, COUNT(*) AS count
      FROM Ordenes
      WHERE FechaCreacion >= date('now', '-12 months')
      GROUP BY mes ORDER BY mes ASC
    `).all();

    const promedios = db.prepare(`
      SELECT AVG(count) AS promedio FROM (
        SELECT strftime('%Y-%m', FechaCreacion) AS mes, COUNT(*) AS count
        FROM Ordenes
        WHERE FechaCreacion >= date('now', '-6 months')
        GROUP BY mes
      )
    `).get().promedio || 0;

    const tendencia = Math.round(promedios * 1.1);

    const especialidadesDemanda = db.prepare(`
      SELECT e.Nombre, COUNT(*) AS total
      FROM Ordenes o
      INNER JOIN Cuidadoras c ON c.Id = o.IdCuidadora
      INNER JOIN CuidadoraEspecialidades ce ON ce.IdCuidadora = c.Id
      INNER JOIN Especialidades e ON e.Id = ce.IdEspecialidad
      WHERE o.FechaCreacion >= date('now', '-6 months')
      GROUP BY e.Nombre
      ORDER BY total DESC
    `).all();

    res.json({
      ordenesPorMes,
      promedioMensual: Math.round(promedios),
      prediccionProximoMes: Math.round(tendencia),
      tendencia: tendencia > promedios ? 'creciente' : 'decreciente',
      especialidadesDemanda,
      cuidadorasDisponibles: db.prepare("SELECT COUNT(*) AS c FROM Cuidadoras WHERE Disponible = 1").get().c,
      familiasBuscando: db.prepare("SELECT COUNT(DISTINCT IdUsuarioFamilia) AS c FROM Ordenes WHERE Estado = 'Pendiente'").get().c,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
