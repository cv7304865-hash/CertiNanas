import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

function toRad(deg) {
  return deg * (Math.PI / 180);
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

router.post('/checkin', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const { IdOrden, latitud, longitud } = req.body;
    if (!IdOrden || latitud == null || longitud == null) {
      return res.status(400).json({ error: 'IdOrden, latitud y longitud son requeridos' });
    }

    const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
    if (!cuidadora) return res.status(403).json({ error: 'Acceso denegado' });

    const orden = db.prepare('SELECT o.*, u.Direccion FROM Ordenes o INNER JOIN Usuarios u ON u.Id = o.IdUsuarioFamilia WHERE o.Id = ? AND o.IdCuidadora = ?').get(IdOrden, cuidadora.Id);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
    if (orden.Estado !== 'Pagada' && orden.Estado !== 'En curso' && orden.Estado !== 'Pendiente' && orden.Estado !== 'Confirmada') {
      return res.status(400).json({ error: 'La orden no esta en un estado valido para check-in' });
    }

    const existingCheckIn = db.prepare("SELECT Id FROM GeolocalizacionRegistros WHERE IdOrden = ? AND Tipo = 'CheckIn'").get(IdOrden);
    if (existingCheckIn) {
      return res.status(400).json({ error: 'Ya existe un check-in para esta orden' });
    }

    const familiaUser = db.prepare('SELECT Id, Direccion FROM Usuarios WHERE Id = ?').get(orden.IdUsuarioFamilia);
    let distanciaMetros = null;
    let validado = 0;

    if (familiaUser?.Direccion) {
      const dirParts = familiaUser.Direccion.split(',');
      if (dirParts.length >= 2) {
        const dirLat = parseFloat(dirParts[0]);
        const dirLon = parseFloat(dirParts[1]);
        if (!isNaN(dirLat) && !isNaN(dirLon)) {
          distanciaMetros = haversine(latitud, longitud, dirLat, dirLon);
          validado = distanciaMetros <= 50 ? 1 : 0;
        }
      }
    }

    db.transaction(() => {
      db.prepare('INSERT INTO GeolocalizacionRegistros (IdOrden, IdCuidadora, Tipo, Latitud, Longitud, DistanciaMetros, Validado) VALUES (?, ?, ?, ?, ?, ?, ?)').run(IdOrden, cuidadora.Id, 'CheckIn', latitud, longitud, distanciaMetros, validado);
      db.prepare("UPDATE Ordenes SET CheckIn = datetime('now'), CheckInLatitud = ?, CheckInLongitud = ?, Estado = 'En curso' WHERE Id = ?").run(latitud, longitud, IdOrden);
    })();

    res.json({ success: true, validado: !!validado, distanciaMetros });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/checkout', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const { IdOrden, latitud, longitud } = req.body;
    if (!IdOrden || latitud == null || longitud == null) {
      return res.status(400).json({ error: 'IdOrden, latitud y longitud son requeridos' });
    }

    const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
    if (!cuidadora) return res.status(403).json({ error: 'Acceso denegado' });

    const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ? AND IdCuidadora = ?').get(IdOrden, cuidadora.Id);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
    if (orden.Estado !== 'En curso') {
      return res.status(400).json({ error: 'La orden no esta en curso' });
    }

    const existingCheckOut = db.prepare("SELECT Id FROM GeolocalizacionRegistros WHERE IdOrden = ? AND Tipo = 'CheckOut'").get(IdOrden);
    if (existingCheckOut) {
      return res.status(400).json({ error: 'Ya existe un check-out para esta orden' });
    }

    const checkIn = db.prepare("SELECT Latitud, Longitud FROM GeolocalizacionRegistros WHERE IdOrden = ? AND Tipo = 'CheckIn'").get(IdOrden);
    let distanciaMetros = null;
    if (checkIn) {
      distanciaMetros = haversine(latitud, longitud, checkIn.Latitud, checkIn.Longitud);
    }

    db.transaction(() => {
      db.prepare('INSERT INTO GeolocalizacionRegistros (IdOrden, IdCuidadora, Tipo, Latitud, Longitud, DistanciaMetros) VALUES (?, ?, ?, ?, ?, ?)').run(IdOrden, cuidadora.Id, 'CheckOut', latitud, longitud, distanciaMetros);
      db.prepare("UPDATE Ordenes SET CheckOut = datetime('now'), CheckOutLatitud = ?, CheckOutLongitud = ? WHERE Id = ?").run(latitud, longitud, IdOrden);
    })();

    res.json({ success: true, distanciaMetros });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orden/:id', (req, res) => {
  try {
    const db = getDb();
    const ordenId = Number(req.params.id);

    const orden = db.prepare(`
      SELECT Id, IdCuidadora, IdUsuarioFamilia, Estado, CheckIn, CheckOut,
             CheckInLatitud, CheckInLongitud, CheckOutLatitud, CheckOutLongitud
      FROM Ordenes WHERE Id = ?
    `).get(ordenId);

    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

    const registros = db.prepare(`
      SELECT * FROM GeolocalizacionRegistros WHERE IdOrden = ? ORDER BY FechaCreacion ASC
    `).all(ordenId);

    res.json({ orden, registros });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
