import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

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
