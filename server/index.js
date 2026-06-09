import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { getDb } from './db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import cuidadoraRoutes from './routes/cuidadora.js';
import searchRoutes from './routes/search.js';
import familiaRoutes from './routes/familia.js';
import mensajesRoutes from './routes/mensajes.js';
import { setupDatabase } from './setup.js';
import { seed } from './seed-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cuidadora', cuidadoraRoutes);
app.use('/api', searchRoutes);
app.use('/api/familia', familiaRoutes);
app.use('/api/mensajes', mensajesRoutes);

// Servir archivos subidos
app.use('/uploads', express.static(uploadsDir));

// Endpoint para subir documentos de postulación (cuidadora)
app.post('/api/cuidadora/documentos', upload.single('archivo'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se envió ningún archivo' });
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    const db = getDb();
    const user = db.prepare('SELECT Id, IdRol FROM Usuarios WHERE Id = ?').get(userId);
    if (!user || user.IdRol !== 3) return res.status(403).json({ error: 'Acceso denegado' });

    let post = db.prepare('SELECT Id, Estado FROM Postulaciones WHERE IdUsuario = ?').get(userId);
    if (!post) {
      const r = db.prepare("INSERT INTO Postulaciones (IdUsuario, Estado) VALUES (?, 'Pendiente')").run(userId);
      post = { Id: r.lastInsertRowid, Estado: 'Pendiente' };
    }
    if (post.Estado === 'Aprobada') return res.status(400).json({ error: 'Postulación ya aprobada' });

    const tipoRequisito = req.body.tipo || 'Documento';
    const pesoKB = (req.file.size / 1024).toFixed(0);
    const nombreDB = req.file.filename;

    db.prepare('INSERT INTO DocumentosPostulacion (IdPostulacion, TipoRequisito, NombreArchivo, Peso, Estado) VALUES (?, ?, ?, ?, ?)').run(post.Id, tipoRequisito, nombreDB, `${pesoKB} KB`, 'Pendiente');
    res.json({ success: true, archivo: nombreDB });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para subir foto de perfil (cualquier usuario autenticado)
app.post('/api/usuarios/foto-perfil', upload.single('archivo'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se envió ningún archivo' });
    const userId = Number(req.headers['x-user-id']);
    if (!userId) return res.status(401).json({ error: 'No autenticado' });
    const db = getDb();
    const user = db.prepare('SELECT Id FROM Usuarios WHERE Id = ?').get(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    db.prepare('UPDATE Usuarios SET FotoPerfil = ? WHERE Id = ?').run(req.file.filename, userId);
    res.json({ success: true, fotoPerfil: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
    res.json({ status: 'ok', db: 'conectado' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// En producción, servir el frontend compilado
const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Auto-setup: crear todas las tablas y seed inicial
try {
  const db = getDb();
  setupDatabase(db);
  const adminCount = db.prepare("SELECT COUNT(*) AS c FROM Usuarios WHERE IdRol = 1").get();
  if (adminCount.c === 0) {
    db.prepare(`INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, IdRol, TerminosAceptados) VALUES (?, ?, ?, ?, 1, 1)`).run('admin@certinanas.com', 'admin123', 'Admin', 'CertiNanas');
    console.log('Usuario admin de seed creado (admin@certinanas.com / admin123).');
  }
  // Seed datos demo si no hay familias ni cuidadoras
  const usuariosNoAdmin = db.prepare('SELECT COUNT(*) AS c FROM Usuarios WHERE IdRol IN (2, 3)').get().c;
  if (usuariosNoAdmin === 0) {
    console.log('Poblando base de datos con datos demo...');
    seed(db);
  }

  // Migrar datos de CasosExito/CasosNoAcuerdo viejos a la nueva tabla Casos
  try {
    const oldTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('CasosExito','CasosNoAcuerdo')").all();
    if (oldTables.length > 0 && db.prepare('SELECT COUNT(*) AS c FROM Casos').get().c === 0) {
      for (const name of ['CasosExito', 'CasosNoAcuerdo']) {
        const tipo = name === 'CasosExito' ? 'Exito' : 'NoAcuerdo';
        try {
          const rows = db.prepare(`SELECT Titulo, Descripcion, IdFamilia, IdCuidadora, FechaCreacion FROM ${name}`).all();
          for (const r of rows) {
            db.prepare('INSERT INTO Casos (Titulo, Descripcion, Tipo, IdUsuarioReporta, IdCuidadora, FechaCreacion) VALUES (?, ?, ?, ?, ?, ?)').run(r.Titulo, r.Descripcion, tipo, r.IdFamilia, r.IdCuidadora, r.FechaCreacion);
          }
          if (rows.length > 0) console.log(`${rows.length} ${name} migrados a Casos.`);
        } catch(e) { /* tabla no existe o vacía */ }
      }
    }
  } catch(e) { console.log('Migración Casos omitida:', e.message); }

  // Seed casos si están vacíos
  if (db.prepare('SELECT COUNT(*) AS c FROM Casos').get().c === 0) {
    const casos = [
      ['María encontró a la cuidadora perfecta para su hijo con TEA', 'Después de meses de búsqueda, María contactó con una especialista en TEA a través de CERTINANAS. Hoy su hijo asiste a terapias 3 veces por semana y ha mostrado avances notables en comunicación.', 'Exito', 1, 1, null],
      ['Familia García: "Volvimos a tener tiempo para nosotros"', 'Con el acompañamiento escolar de CERTINANAS, los padres de Mateo pudieron retomar sus actividades laborales con la tranquilidad de que su hijo estaba en buenas manos.', 'Exito', 1, 1, null],
      ['Terapia de estimulación temprana con resultados visibles', 'A los 6 meses de terapias constantes, la pequeña Sofía logró hitos de desarrollo que los médicos no esperaban.', 'Exito', 1, 1, null],
      ['Apoyo escolar que transformó la experiencia educativa', 'Diego, diagnosticado con TDAH, pasó de tener problemas de conducta a ser un estudiante destacado gracias al acompañamiento personalizado.', 'Exito', 1, 1, null],
      ['Atención domiciliaria que cambió la dinámica familiar', 'Los abuelos de Valentina pudieron descansar sabiendo que ella estaba siendo cuidada por una profesional certificada.', 'Exito', 1, 1, null],
      ['Carmen: de cuidadora a parte de la familia', 'Lo que empezó como un servicio temporal de 2 semanas se convirtió en una relación de confianza que ya lleva 8 meses.', 'Exito', 1, 1, null],
      ['Disponibilidad horaria incompatible', 'La familia necesitaba cobertura los fines de semana y la cuidadora solo estaba disponible entre semana.', 'NoAcuerdo', 1, 1, null],
      ['Distancia geográfica', 'La cuidadora vivía muy lejos del domicilio familiar y el tiempo de desplazamiento hacía inviable el servicio diario.', 'NoAcuerdo', 1, 1, null],
      ['Metodología de trabajo diferente', 'La familia prefería un enfoque más estructurado, mientras que la cuidadora promovía un método más libre basado en el juego.', 'NoAcuerdo', 1, 1, null],
      ['Presupuesto no disponible', 'Aunque ambas partes mostraron interés, el costo del servicio superaba el presupuesto mensual de la familia.', 'NoAcuerdo', 1, 1, null],
      ['Cambio de ciudad de la cuidadora', 'Justo cuando estaban por cerrar el acuerdo, la cuidadora recibió una oferta laboral en otra ciudad.', 'NoAcuerdo', 1, 1, null],
      ['Requisitos adicionales no previstos', 'La familia solicitaba disponibilidad para cuidar a dos niños con necesidades distintas, y la cuidadora solo tenía experiencia con un perfil específico.', 'NoAcuerdo', 1, 1, null],
    ];
    for (const c of casos) db.prepare('INSERT INTO Casos (Titulo, Descripcion, Tipo, IdUsuarioReporta, IdCuidadora, IdOrden) VALUES (?, ?, ?, ?, ?, ?)').run(...c);
    console.log('Casos de seed insertados.');
  }

  // Corregir documentos inconsistentes: postulaciones Aprobada deben tener documentos Aprobado
  const docsInconsistentes = db.prepare(`
    SELECT COUNT(*) AS c FROM DocumentosPostulacion dp
    INNER JOIN Postulaciones p ON p.Id = dp.IdPostulacion
    WHERE p.Estado = 'Aprobada' AND dp.Estado != 'Aprobado'
  `).get().c;
  if (docsInconsistentes > 0) {
    db.prepare(`
      UPDATE DocumentosPostulacion SET Estado = 'Aprobado'
      WHERE IdPostulacion IN (SELECT Id FROM Postulaciones WHERE Estado = 'Aprobada')
      AND Estado != 'Aprobado'
    `).run();
    console.log(`${docsInconsistentes} documento(s) corregido(s) al estado Aprobado.`);
  }

  console.log('Esquema de BD verificado.');
} catch (err) {
  console.error('Error en auto-setup:', err.message);
}

// SPA catch-all: servir index.html para rutas del frontend
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
