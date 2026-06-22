import { Router } from 'express';
import crypto from 'crypto';
import { getDb } from '../db.js';

const ALGORITHM = 'aes-256-gcm';
const KEY = crypto.scryptSync('CertiNanas-Salud-Key-2026-Segura', 'salt', 32);

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag,
    hash: crypto.createHash('sha256').update(text).digest('hex'),
  };
}

function decrypt(encryptedData, ivHex, authTagHex) {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const router = Router();

router.post('/registrar', (req, res) => {
  try {
    const db = getDb();
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    const user = db.prepare('SELECT Id, IdRol FROM Usuarios WHERE Id = ?').get(userId);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      const { IdMenor, IdOrden, datosSalud } = req.body;
      if (!IdMenor || !IdOrden || !datosSalud) {
        return res.status(400).json({ error: 'IdMenor, IdOrden y datosSalud son requeridos' });
      }

      // Verify the order belongs to this cuidadora or familia
      const orden = db.prepare('SELECT Id, IdCuidadora, IdUsuarioFamilia FROM Ordenes WHERE Id = ?').get(IdOrden);
      if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

      const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
      const isCuidadora = cuidadora && orden.IdCuidadora === cuidadora.Id;
      const isFamilia = orden.IdUsuarioFamilia === userId;

      if (!isCuidadora && !isFamilia) {
        return res.status(403).json({ error: 'No tienes acceso a esta orden' });
      }

      // Encrypt the health data
      const { encryptedData, iv, authTag, hash } = encrypt(JSON.stringify(datosSalud));

      const cuidadoraId = cuidadora?.Id || 0;

      const stmt = db.prepare(`
        INSERT INTO HistorialSalud (IdMenor, IdCuidadora, IdOrden, DatosCifrados, VectorInicializacion, HashVerificacion)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(IdMenor, cuidadoraId, IdOrden, JSON.stringify({ data: encryptedData, authTag }), iv, hash);

      res.json({ success: true, id: result.lastInsertRowid, message: 'Registro de salud guardado de forma segura' });
    } catch (error) {
      console.error('Error al registrar salud:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // GET /api/salud/menor/:idMenor - Obtener registros de salud de un menor
  router.get('/menor/:idMenor', (req, res) => {
    try {
      const db = getDb();
      const userId = Number(req.headers['x-user-id']);
      if (!userId) return res.status(401).json({ error: 'No autenticado' });

      const user = db.prepare('SELECT Id, IdRol FROM Usuarios WHERE Id = ?').get(userId);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      const { idMenor } = req.params;

      // Verify access: cuidadora should have active order for this minor, familia owns the minor
      const menor = db.prepare('SELECT * FROM Menores WHERE Id = ?').get(idMenor);
      if (!menor) return res.status(404).json({ error: 'Menor no encontrado' });

      let hasAccess = false;
      if (user.IdRol === 2) { // Familia
        hasAccess = menor.IdUsuarioFamilia === userId;
      } else if (user.IdRol === 3) { // Cuidadora
        const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
        if (cuidadora) {
          const activeOrder = db.prepare(
            'SELECT Id FROM Ordenes WHERE IdCuidadora = ? AND IdMenor = ? AND Estado IN ("Confirmada","En Curso","Pagada")'
          ).get(cuidadora.Id, idMenor);
          hasAccess = !!activeOrder;
        }
      }

      if (!hasAccess) {
        return res.status(403).json({ error: 'No tienes acceso al historial de salud de este menor' });
      }

      const registros = db.prepare(
        'SELECT * FROM HistorialSalud WHERE IdMenor = ? AND Activo = 1 ORDER BY FechaCreacion DESC'
      ).all(idMenor);

      // Decrypt each record
      const decrypted = registros.map(r => {
        try {
          const parsed = JSON.parse(r.DatosCifrados);
          const decryptedData = decrypt(parsed.data, r.VectorInicializacion, parsed.authTag);
          return {
            id: r.Id,
            idMenor: r.IdMenor,
            idOrden: r.IdOrden,
            datosSalud: JSON.parse(decryptedData),
            fechaCreacion: r.FechaCreacion,
          };
        } catch {
          return {
            id: r.Id,
            idMenor: r.IdMenor,
            idOrden: r.IdOrden,
            datosSalud: { error: 'No se pudieron descifrar los datos' },
            fechaCreacion: r.FechaCreacion,
          };
        }
      });

      res.json({ registros: decrypted, menor: { id: menor.Id, nombre: menor.Nombre } });
    } catch (error) {
      console.error('Error al obtener historial salud:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // GET /api/salud/orden/:idOrden - Verificar acceso y obtener menores asociados
  router.get('/orden/:idOrden', (req, res) => {
    try {
      const db = getDb();
      const userId = Number(req.headers['x-user-id']);
      if (!userId) return res.status(401).json({ error: 'No autenticado' });

      const { idOrden } = req.params;
      const orden = db.prepare('SELECT * FROM Ordenes WHERE Id = ?').get(idOrden);
      if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

      const cuidadora = db.prepare('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?').get(userId);
      const isCuidadora = cuidadora && orden.IdCuidadora === cuidadora.Id;
      const isFamilia = orden.IdUsuarioFamilia === userId;

      if (!isCuidadora && !isFamilia) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      if (isCuidadora && !['Confirmada', 'En Curso', 'Pagada'].includes(orden.Estado)) {
        return res.status(403).json({ error: 'No tienes un servicio activo con esta familia' });
      }

      const menores = db.prepare('SELECT Id, Nombre, Diagnostico FROM Menores WHERE IdUsuarioFamilia = ?').all(orden.IdUsuarioFamilia);

      res.json({ orden: { id: orden.Id, estado: orden.Estado }, menores });
    } catch (error) {
      console.error('Error al verificar acceso salud:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

export default router;
