import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import { seed } from './seed-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

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

// Auto-setup: crear tablas si no existen
try {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS Roles (Id INTEGER PRIMARY KEY AUTOINCREMENT, Nombre TEXT NOT NULL UNIQUE, Descripcion TEXT, FechaCreacion TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS Usuarios (Id INTEGER PRIMARY KEY AUTOINCREMENT, Email TEXT NOT NULL UNIQUE, PasswordHash TEXT NOT NULL, Nombres TEXT NOT NULL, Apellidos TEXT NOT NULL, NumeroDocumento TEXT, TipoDocumento TEXT DEFAULT 'DNI', Telefono TEXT, IdRol INTEGER NOT NULL REFERENCES Roles(Id), EmailConfirmado INTEGER NOT NULL DEFAULT 0, TerminosAceptados INTEGER NOT NULL DEFAULT 0, Activo INTEGER NOT NULL DEFAULT 1, FechaCreacion TEXT NOT NULL DEFAULT (datetime('now')));
  `);
  const roleCount = db.prepare('SELECT COUNT(*) AS c FROM Roles').get();
  if (roleCount.c === 0) {
    db.exec(`INSERT INTO Roles (Nombre, Descripcion) VALUES ('Admin', 'Administrador'), ('Familia', 'Usuario familiar'), ('Cuidadora', 'Profesional cuidadora');`);
    console.log('Roles de seed insertados.');
  }
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

  // Crear tablas de CasosExito y CasosNoAcuerdo si no existen
  db.exec(`
    CREATE TABLE IF NOT EXISTS CasosExito (Id INTEGER PRIMARY KEY AUTOINCREMENT, Titulo TEXT NOT NULL, Descripcion TEXT NOT NULL, IdFamilia INTEGER, IdCuidadora INTEGER, FechaCreacion TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS CasosNoAcuerdo (Id INTEGER PRIMARY KEY AUTOINCREMENT, Titulo TEXT NOT NULL, Descripcion TEXT NOT NULL, IdFamilia INTEGER, IdCuidadora INTEGER, FechaCreacion TEXT NOT NULL DEFAULT (datetime('now')));
  `);

  // Seed casos de éxito si están vacíos
  if (db.prepare('SELECT COUNT(*) AS c FROM CasosExito').get().c === 0) {
    const exitos = [
      ['María encontró a la cuidadora perfecta para su hijo con TEA', 'Después de meses de búsqueda, María contactó con una especialista en TEA a través de CERTINANAS. Hoy su hijo asiste a terapias 3 veces por semana y ha mostrado avances notables en comunicación.', 1, 1],
      ['Familia García: "Volvimos a tener tiempo para nosotros"', 'Con el acompañamiento escolar de CERTINANAS, los padres de Mateo pudieron retomar sus actividades laborales con la tranquilidad de que su hijo estaba en buenas manos.', 1, 1],
      ['Terapia de estimulación temprana con resultados visibles', 'A los 6 meses de terapias constantes, la pequeña Sofía logró hitos de desarrollo que los médicos no esperaban.', 1, 1],
      ['Apoyo escolar que transformó la experiencia educativa', 'Diego, diagnosticado con TDAH, pasó de tener problemas de conducta a ser un estudiante destacado gracias al acompañamiento personalizado.', 1, 1],
      ['Atención domiciliaria que cambió la dinámica familiar', 'Los abuelos de Valentina pudieron descansar sabiendo que ella estaba siendo cuidada por una profesional certificada.', 1, 1],
      ['Carmen: de cuidadora a parte de la familia', 'Lo que empezó como un servicio temporal de 2 semanas se convirtió en una relación de confianza que ya lleva 8 meses.', 1, 1],
    ];
    for (const e of exitos) db.prepare('INSERT INTO CasosExito (Titulo, Descripcion, IdFamilia, IdCuidadora) VALUES (?, ?, ?, ?)').run(...e);
    console.log('Casos de éxito de seed insertados.');
  }

  // Seed casos sin acuerdo si están vacíos
  if (db.prepare('SELECT COUNT(*) AS c FROM CasosNoAcuerdo').get().c === 0) {
    const noAcuerdo = [
      ['Disponibilidad horaria incompatible', 'La familia necesitaba cobertura los fines de semana y la cuidadora solo estaba disponible entre semana.', 1, 1],
      ['Distancia geográfica', 'La cuidadora vivía muy lejos del domicilio familiar y el tiempo de desplazamiento hacía inviable el servicio diario.', 1, 1],
      ['Metodología de trabajo diferente', 'La familia prefería un enfoque más estructurado, mientras que la cuidadora promovía un método más libre basado en el juego.', 1, 1],
      ['Presupuesto no disponible', 'Aunque ambas partes mostraron interés, el costo del servicio superaba el presupuesto mensual de la familia.', 1, 1],
      ['Cambio de ciudad de la cuidadora', 'Justo cuando estaban por cerrar el acuerdo, la cuidadora recibió una oferta laboral en otra ciudad.', 1, 1],
      ['Requisitos adicionales no previstos', 'La familia solicitaba disponibilidad para cuidar a dos niños con necesidades distintas, y la cuidadora solo tenía experiencia con un perfil específico.', 1, 1],
    ];
    for (const n of noAcuerdo) db.prepare('INSERT INTO CasosNoAcuerdo (Titulo, Descripcion, IdFamilia, IdCuidadora) VALUES (?, ?, ?, ?)').run(...n);
    console.log('Casos sin acuerdo de seed insertados.');
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
