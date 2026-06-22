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
import negociacionRoutes from './routes/negociacion.js';
import tareasRoutes from './routes/tareas.js';
import geolocalizacionRoutes from './routes/geolocalizacion.js';
import reemplazoRoutes from './routes/reemplazo.js';
import reportesRoutes from './routes/reportes.js';
import capacitacionRoutes from './routes/capacitacion.js';
import calendarioRoutes from './routes/calendario.js';
import familiaresRoutes from './routes/familiares.js';
import reputacionRoutes from './routes/reputacion.js';
import matchingRoutes from './routes/matching.js';
import firmasRoutes from './routes/firmas.js';
import analyticsRoutes from './routes/analytics.js';
import incidentesRoutes from './routes/incidentes.js';
import alertasRoutes from './routes/alertas.js';
import saludRoutes from './routes/salud.js';
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
app.use('/api', negociacionRoutes);
app.use('/api', tareasRoutes);
app.use('/api/geolocalizacion', geolocalizacionRoutes);
app.use('/api/reemplazo', reemplazoRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/capacitacion', capacitacionRoutes);
app.use('/api/calendario', calendarioRoutes);
app.use('/api/familiares', familiaresRoutes);
app.use('/api/reputacion', reputacionRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/firmas', firmasRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/incidentes', incidentesRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/salud', saludRoutes);

app.use('/uploads', express.static(uploadsDir));

app.post('/api/cuidadora/documentos', upload.single('archivo'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se envio ningun archivo' });
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
    if (post.Estado === 'Aprobada') return res.status(400).json({ error: 'Postulacion ya aprobada' });

    const tipoRequisito = req.body.tipo || 'Documento';
    const pesoKB = (req.file.size / 1024).toFixed(0);
    const nombreDB = req.file.filename;

    db.prepare('INSERT INTO DocumentosPostulacion (IdPostulacion, TipoRequisito, NombreArchivo, Peso, Estado) VALUES (?, ?, ?, ?, ?)').run(post.Id, tipoRequisito, nombreDB, `${pesoKB} KB`, 'Pendiente');
    res.json({ success: true, archivo: nombreDB });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/usuarios/foto-perfil', upload.single('archivo'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se envio ningun archivo' });
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

app.get('/api/debug/db-check', (req, res) => {
  try {
    const db = getDb();
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    const counts = {};
    for (const t of tables) {
      try { counts[t.name] = db.prepare(`SELECT COUNT(*) AS c FROM "${t.name}"`).get().c; } catch(e) { counts[t.name] = -1; }
    }
    res.json({ tableCount: tables.length, tables: tables.map(t => t.name), counts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));

try {
  const db = getDb();
  setupDatabase(db);
  const adminCount = db.prepare("SELECT COUNT(*) AS c FROM Usuarios WHERE IdRol = 1").get();
  if (adminCount.c === 0) {
    db.prepare(`INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, IdRol, TerminosAceptados) VALUES (?, ?, ?, ?, 1, 1)`).run('admin@certinanas.pe', '123456', 'Admin', 'CertiNanas');
    console.log('Usuario admin de seed creado (admin@certinanas.pe / 123456).');
  }
  const usuariosNoAdmin = db.prepare('SELECT COUNT(*) AS c FROM Usuarios WHERE IdRol IN (2, 3)').get().c;
  if (usuariosNoAdmin === 0) {
    console.log('Poblando base de datos con datos demo...');
    seed(db);
  }

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
        } catch(e) {}
      }
    }
  } catch(e) { console.log('Migracion Casos omitida:', e.message); }

  if (db.prepare('SELECT COUNT(*) AS c FROM Casos').get().c === 0) {
    const casos = [
      ['Maria encontro a la cuidadora perfecta para su hijo con TEA', 'Despues de meses de busqueda, Maria contacto con una especialista en TEA a traves de CERTINANAS. Hoy su hijo asiste a terapias 3 veces por semana y ha mostrado avances notables en comunicacion.', 'Exito', 1, 1, null],
      ['Familia Garcia: "Volvimos a tener tiempo para nosotros"', 'Con el acompanamiento escolar de CERTINANAS, los padres de Mateo pudieron retomar sus actividades laborales con la tranquilidad de que su hijo estaba en buenas manos.', 'Exito', 1, 1, null],
      ['Terapia de estimulacion temprana con resultados visibles', 'A los 6 meses de terapias constantes, la pequena Sofia logro hitos de desarrollo que los medicos no esperaban.', 'Exito', 1, 1, null],
      ['Apoyo escolar que transformo la experiencia educativa', 'Diego, diagnosticado con TDAH, paso de tener problemas de conducta a ser un estudiante destacado gracias al acompanamiento personalizado.', 'Exito', 1, 1, null],
      ['Atencion domiciliaria que cambio la dinamica familiar', 'Los abuelos de Valentina pudieron descansar sabiendo que ella estaba siendo cuidada por una profesional certificada.', 'Exito', 1, 1, null],
      ['Carmen: de cuidadora a parte de la familia', 'Lo que empezo como un servicio temporal de 2 semanas se convirtio en una relacion de confianza que ya lleva 8 meses.', 'Exito', 1, 1, null],
      ['Disponibilidad horaria incompatible', 'La familia necesitaba cobertura los fines de semana y la cuidadora solo estaba disponible entre semana.', 'NoAcuerdo', 1, 1, null],
      ['Distancia geografica', 'La cuidadora vivia muy lejos del domicilio familiar y el tiempo de desplazamiento hacia inviable el servicio diario.', 'NoAcuerdo', 1, 1, null],
      ['Metodologia de trabajo diferente', 'La familia preferia un enfoque mas estructurado, mientras que la cuidadora promovia un metodo mas libre basado en el juego.', 'NoAcuerdo', 1, 1, null],
      ['Presupuesto no disponible', 'Aunque ambas partes mostraron interes, el costo del servicio superaba el presupuesto mensual de la familia.', 'NoAcuerdo', 1, 1, null],
      ['Cambio de ciudad de la cuidadora', 'Justo cuando estaban por cerrar el acuerdo, la cuidadora recibio una oferta laboral en otra ciudad.', 'NoAcuerdo', 1, 1, null],
      ['Requisitos adicionales no previstos', 'La familia solicitaba disponibilidad para cuidar a dos ninos con necesidades distintas, y la cuidadora solo tenia experiencia con un perfil especifico.', 'NoAcuerdo', 1, 1, null],
    ];
    for (const c of casos) db.prepare('INSERT INTO Casos (Titulo, Descripcion, Tipo, IdUsuarioReporta, IdCuidadora, IdOrden) VALUES (?, ?, ?, ?, ?, ?)').run(...c);
    console.log('Casos de seed insertados.');
  }

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

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
