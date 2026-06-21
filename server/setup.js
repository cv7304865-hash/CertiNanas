import { getDb, closeDb } from './db.js';

export function setupDatabase(db) {
db.exec(`
  CREATE TABLE IF NOT EXISTS Roles (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Nombre TEXT NOT NULL UNIQUE,
    Descripcion TEXT,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Usuarios (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Email TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    Nombres TEXT NOT NULL,
    Apellidos TEXT NOT NULL,
    NumeroDocumento TEXT,
    TipoDocumento TEXT DEFAULT 'DNI',
    Telefono TEXT,
    IdRol INTEGER NOT NULL REFERENCES Roles(Id),
    EmailConfirmado INTEGER NOT NULL DEFAULT 0,
    TerminosAceptados INTEGER NOT NULL DEFAULT 0,
    Activo INTEGER NOT NULL DEFAULT 1,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Especialidades (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Nombre TEXT NOT NULL UNIQUE,
    Descripcion TEXT,
    Activo INTEGER NOT NULL DEFAULT 1,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Areas (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Nombre TEXT NOT NULL UNIQUE,
    Descripcion TEXT,
    Activo INTEGER NOT NULL DEFAULT 1,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Cuidadoras (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdUsuario INTEGER NOT NULL REFERENCES Usuarios(Id),
    AniosExperiencia INTEGER NOT NULL DEFAULT 0,
    TarifaHora REAL NOT NULL,
    DescripcionCorta TEXT,
    DescripcionLarga TEXT,
    CalificacionPromedio REAL NOT NULL DEFAULT 0,
    TotalResenas INTEGER NOT NULL DEFAULT 0,
    Disponible INTEGER NOT NULL DEFAULT 1,
    Zona TEXT,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS CuidadoraEspecialidades (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdCuidadora INTEGER NOT NULL REFERENCES Cuidadoras(Id) ON DELETE CASCADE,
    IdEspecialidad INTEGER NOT NULL REFERENCES Especialidades(Id) ON DELETE CASCADE,
    UNIQUE (IdCuidadora, IdEspecialidad)
  );

  CREATE TABLE IF NOT EXISTS CuidadoraAreas (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdCuidadora INTEGER NOT NULL REFERENCES Cuidadoras(Id) ON DELETE CASCADE,
    IdArea INTEGER NOT NULL REFERENCES Areas(Id) ON DELETE CASCADE,
    UNIQUE (IdCuidadora, IdArea)
  );

  CREATE TABLE IF NOT EXISTS CuidadoraFormacion (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdCuidadora INTEGER NOT NULL REFERENCES Cuidadoras(Id) ON DELETE CASCADE,
    Titulo TEXT NOT NULL,
    Institucion TEXT,
    AnioObtencion INTEGER,
    Orden INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS CuidadoraCertificaciones (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdCuidadora INTEGER NOT NULL REFERENCES Cuidadoras(Id) ON DELETE CASCADE,
    Nombre TEXT NOT NULL,
    EntidadEmisora TEXT,
    FechaObtencion TEXT,
    FechaVencimiento TEXT,
    Orden INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS CuidadoraDocumentos (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdCuidadora INTEGER NOT NULL REFERENCES Cuidadoras(Id) ON DELETE CASCADE,
    TipoDocumento TEXT NOT NULL,
    NombreArchivo TEXT NOT NULL,
    RutaArchivo TEXT NOT NULL,
    Verificado INTEGER NOT NULL DEFAULT 0,
    FechaSubida TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Resenas (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdCuidadora INTEGER NOT NULL REFERENCES Cuidadoras(Id) ON DELETE CASCADE,
    IdUsuarioFamilia INTEGER NOT NULL REFERENCES Usuarios(Id),
    Calificacion INTEGER NOT NULL CHECK (Calificacion BETWEEN 1 AND 5),
    Comentario TEXT,
    FechaResena TEXT NOT NULL,
    Visible INTEGER NOT NULL DEFAULT 1,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Favoritos (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdUsuarioFamilia INTEGER NOT NULL REFERENCES Usuarios(Id) ON DELETE CASCADE,
    IdCuidadora INTEGER NOT NULL REFERENCES Cuidadoras(Id) ON DELETE CASCADE,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Citas (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdCuidadora INTEGER NOT NULL REFERENCES Cuidadoras(Id),
    IdUsuarioFamilia INTEGER NOT NULL REFERENCES Usuarios(Id),
    FechaCita TEXT NOT NULL,
    HoraCita TEXT NOT NULL,
    DuracionMinutos INTEGER NOT NULL DEFAULT 15,
    Modalidad TEXT NOT NULL DEFAULT 'Virtual',
    Estado TEXT NOT NULL DEFAULT 'Pendiente',
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Conversaciones (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdCuidadora INTEGER NOT NULL REFERENCES Cuidadoras(Id),
    IdUsuarioFamilia INTEGER NOT NULL REFERENCES Usuarios(Id),
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now')),
    FechaUltimoMensaje TEXT
  );

  CREATE TABLE IF NOT EXISTS Mensajes (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdConversacion INTEGER NOT NULL REFERENCES Conversaciones(Id) ON DELETE CASCADE,
    IdRemitente INTEGER NOT NULL REFERENCES Usuarios(Id),
    Contenido TEXT NOT NULL,
    Leido INTEGER NOT NULL DEFAULT 0,
    FechaEnvio TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Ordenes (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdCuidadora INTEGER NOT NULL REFERENCES Cuidadoras(Id),
    IdUsuarioFamilia INTEGER NOT NULL REFERENCES Usuarios(Id),
    TipoServicio TEXT NOT NULL,
    FechaServicio TEXT NOT NULL,
    TotalHoras REAL NOT NULL,
    TarifaHora REAL NOT NULL,
    Subtotal REAL NOT NULL,
    TarifaPlataforma REAL NOT NULL,
    Total REAL NOT NULL,
    Estado TEXT NOT NULL DEFAULT 'Pendiente',
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Menores (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdUsuarioFamilia INTEGER NOT NULL REFERENCES Usuarios(Id),
    Nombre TEXT NOT NULL,
    Diagnostico TEXT,
    FechaNacimiento TEXT,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Pagos (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdOrden INTEGER NOT NULL REFERENCES Ordenes(Id),
    Monto REAL NOT NULL,
    MetodoPago TEXT NOT NULL,
    Estado TEXT NOT NULL DEFAULT 'Pendiente',
    FechaPago TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Escrow (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdOrden INTEGER NOT NULL UNIQUE REFERENCES Ordenes(Id),
    MontoTotal REAL NOT NULL,
    MontoCuidadora REAL NOT NULL,
    MontoPlataforma REAL NOT NULL,
    Estado TEXT NOT NULL DEFAULT 'Retenido' CHECK (Estado IN ('Retenido', 'Liberado', 'Reembolsado')),
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now')),
    FechaLiberacion TEXT
  );

  CREATE TABLE IF NOT EXISTS Contratos (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdOrden INTEGER NOT NULL UNIQUE REFERENCES Ordenes(Id),
    Terminos TEXT NOT NULL,
    AceptadoFamilia INTEGER NOT NULL DEFAULT 0,
    AceptadoCuidadora INTEGER NOT NULL DEFAULT 0,
    FechaAceptacionFamilia TEXT,
    FechaAceptacionCuidadora TEXT,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Casos (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Titulo TEXT NOT NULL,
    Descripcion TEXT NOT NULL,
    Tipo TEXT NOT NULL CHECK (Tipo IN ('Exito', 'NoAcuerdo')),
    IdUsuarioReporta INTEGER REFERENCES Usuarios(Id),
    IdCuidadora INTEGER,
    IdOrden INTEGER REFERENCES Ordenes(Id),
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Postulaciones (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdUsuario INTEGER NOT NULL REFERENCES Usuarios(Id),
    FechaPostulacion TEXT NOT NULL DEFAULT (datetime('now')),
    Estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (Estado IN ('Pendiente', 'Aprobada', 'Rechazada')),
    MotivoRechazo TEXT,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS DocumentosPostulacion (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdPostulacion INTEGER NOT NULL REFERENCES Postulaciones(Id) ON DELETE CASCADE,
    TipoRequisito TEXT NOT NULL,
    NombreArchivo TEXT NOT NULL,
    Peso TEXT,
    Estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (Estado IN ('Pendiente', 'Aprobado', 'Rechazado')),
    MotivoRechazo TEXT,
    FechaSubida TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Notificaciones (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdUsuarioDestino INTEGER NOT NULL REFERENCES Usuarios(Id),
    Titulo TEXT NOT NULL,
    Descripcion TEXT,
    Tipo TEXT NOT NULL,
    Leido INTEGER NOT NULL DEFAULT 0,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Incidencias (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdOrden INTEGER REFERENCES Ordenes(Id),
    IdCita INTEGER REFERENCES Citas(Id),
    Tipo TEXT NOT NULL CHECK (Tipo IN ('Leve', 'Moderada', 'Grave')),
    Estado TEXT NOT NULL DEFAULT 'Abierta' CHECK (Estado IN ('Abierta', 'En revisión', 'Cerrada')),
    Descripcion TEXT,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Auditoria (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdUsuario INTEGER REFERENCES Usuarios(Id),
    Accion TEXT NOT NULL,
    Entidad TEXT NOT NULL,
    IdEntidad INTEGER,
    Detalle TEXT,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

`);

  // Seed data
  db.exec(`
  INSERT OR IGNORE INTO Roles (Nombre, Descripcion) VALUES ('Admin', 'Administrador del sistema');
  INSERT OR IGNORE INTO Roles (Nombre, Descripcion) VALUES ('Familia', 'Usuario familiar que busca servicios de cuidado');
  INSERT OR IGNORE INTO Roles (Nombre, Descripcion) VALUES ('Cuidadora', 'Profesional cuidadora que ofrece sus servicios');

  INSERT OR IGNORE INTO Especialidades (Nombre, Descripcion) VALUES ('TEA', 'Trastorno del Espectro Autista');
  INSERT OR IGNORE INTO Especialidades (Nombre, Descripcion) VALUES ('TDAH', 'Trastorno por Deficit de Atencion e Hiperactividad');
  INSERT OR IGNORE INTO Especialidades (Nombre, Descripcion) VALUES ('Sindrome de Down', 'Sindrome de Down');
  INSERT OR IGNORE INTO Especialidades (Nombre, Descripcion) VALUES ('Primeros Auxilios', 'Primeros Auxilios y RCP');
  INSERT OR IGNORE INTO Especialidades (Nombre, Descripcion) VALUES ('Discapacidad Motriz', 'Discapacidad Motriz');

  INSERT OR IGNORE INTO Areas (Nombre, Descripcion) VALUES ('Cuidado domiciliario', 'Cuidado en el hogar de la familia');
  INSERT OR IGNORE INTO Areas (Nombre, Descripcion) VALUES ('Acompaniamiento escolar', 'Acompaniamiento y apoyo en el entorno escolar');
  INSERT OR IGNORE INTO Areas (Nombre, Descripcion) VALUES ('Terapias de estimulacion', 'Terapias de estimulacion sensorial y motriz');
`);

  // Migraciones
  try { db.prepare(`ALTER TABLE Cuidadoras ADD COLUMN Zona TEXT`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Ordenes ADD COLUMN IdMenor INTEGER REFERENCES Menores(Id)`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Ordenes ADD COLUMN HoraInicio TEXT`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Ordenes ADD COLUMN HoraFin TEXT`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Ordenes ADD COLUMN FechaFinalizacion TEXT`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Ordenes ADD COLUMN IdEscrow INTEGER REFERENCES Escrow(Id)`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Ordenes ADD COLUMN ConfirmadaFamilia INTEGER NOT NULL DEFAULT 0`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Ordenes ADD COLUMN ConfirmadaCuidadora INTEGER NOT NULL DEFAULT 0`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Ordenes ADD COLUMN FinalizadaFamilia INTEGER NOT NULL DEFAULT 0`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Ordenes ADD COLUMN FinalizadaCuidadora INTEGER NOT NULL DEFAULT 0`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Usuarios ADD COLUMN FotoPerfil TEXT`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Usuarios ADD COLUMN Suspendido INTEGER NOT NULL DEFAULT 0`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Postulaciones ADD COLUMN MotivoRechazo TEXT`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE DocumentosPostulacion ADD COLUMN MotivoRechazo TEXT`).run(); } catch(e) {}

console.log('Tablas creadas y datos de semilla insertados.');
}

// Ejecutar directamente si es llamado como script
if (process.argv[1] && (process.argv[1].endsWith('setup.js') || process.argv[1].endsWith('setup'))) {
  const db = getDb();
  setupDatabase(db);
  closeDb();
}
