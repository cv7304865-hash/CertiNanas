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

  CREATE TABLE IF NOT EXISTS Negociaciones (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdOrden INTEGER NOT NULL REFERENCES Ordenes(Id),
    IdPropuestoPor INTEGER NOT NULL REFERENCES Usuarios(Id),
    TarifaHora REAL,
    TotalHoras REAL,
    HoraInicio TEXT,
    HoraFin TEXT,
    Mensaje TEXT,
    Estado TEXT NOT NULL DEFAULT 'activa' CHECK (Estado IN ('activa','aceptada','rechazada','contrapropuesta')),
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

  CREATE TABLE IF NOT EXISTS TareasCategoria (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Nombre TEXT NOT NULL,
    Icono TEXT,
    Orden INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS Tareas (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdCategoria INTEGER NOT NULL REFERENCES TareasCategoria(Id),
    Descripcion TEXT NOT NULL,
    Orden INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS OrdenTareas (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdOrden INTEGER NOT NULL REFERENCES Ordenes(Id),
    IdTarea INTEGER NOT NULL REFERENCES Tareas(Id),
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

  INSERT OR IGNORE INTO TareasCategoria (Id, Nombre, Icono, Orden) VALUES (1, 'Apoyo para niños con TEA', 'brain', 1);
  INSERT OR IGNORE INTO TareasCategoria (Id, Nombre, Icono, Orden) VALUES (2, 'Apoyo para niños con TDAH', 'zap', 2);
  INSERT OR IGNORE INTO TareasCategoria (Id, Nombre, Icono, Orden) VALUES (3, 'Apoyo para niños con Síndrome de Down', 'heart', 3);
  INSERT OR IGNORE INTO TareasCategoria (Id, Nombre, Icono, Orden) VALUES (4, 'Cuidados médicos básicos', 'stethoscope', 4);
  INSERT OR IGNORE INTO TareasCategoria (Id, Nombre, Icono, Orden) VALUES (5, 'Actividades educativas', 'book-open', 5);
  INSERT OR IGNORE INTO TareasCategoria (Id, Nombre, Icono, Orden) VALUES (6, 'Actividades de la vida diaria', 'home', 6);

  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (1, 1, 'Mantener rutinas establecidas', 1);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (2, 1, 'Aplicar cronogramas visuales', 2);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (3, 1, 'Supervisar momentos de crisis sensorial', 3);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (4, 1, 'Acompañar ejercicios de regulación emocional', 4);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (5, 1, 'Realizar actividades de estimulación cognitiva', 5);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (6, 1, 'Apoyar sesiones terapéuticas en casa', 6);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (7, 1, 'Fomentar habilidades sociales', 7);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (8, 1, 'Supervisar alimentación selectiva', 8);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (9, 1, 'Evitar estímulos que generen sobrecarga sensorial', 9);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (10, 1, 'Registrar conductas observadas', 10);

  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (11, 2, 'Supervisar cumplimiento de tareas escolares', 1);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (12, 2, 'Mantener horarios estructurados', 2);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (13, 2, 'Aplicar técnicas de concentración', 3);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (14, 2, 'Supervisar descansos programados', 4);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (15, 2, 'Acompañar actividades recreativas controladas', 5);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (16, 2, 'Monitorear impulsividad y conducta', 6);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (17, 2, 'Reforzar instrucciones paso a paso', 7);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (18, 2, 'Registrar avances diarios', 8);

  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (19, 3, 'Estimular autonomía personal', 1);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (20, 3, 'Apoyar actividades de motricidad fina', 2);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (21, 3, 'Apoyar actividades de motricidad gruesa', 3);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (22, 3, 'Supervisar alimentación', 4);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (23, 3, 'Realizar ejercicios de lenguaje y comunicación', 5);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (24, 3, 'Acompañar actividades educativas', 6);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (25, 3, 'Supervisar higiene personal', 7);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (26, 3, 'Registrar progreso diario', 8);

  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (27, 4, 'Administración de medicamentos autorizados', 1);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (28, 4, 'Supervisión de horarios de medicación', 2);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (29, 4, 'Control de signos de alerta indicados por la familia', 3);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (30, 4, 'Aplicación de protocolos de emergencia', 4);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (31, 4, 'Seguimiento de indicaciones médicas', 5);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (32, 4, 'Registro de incidencias médicas', 6);

  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (33, 5, 'Ayuda con tareas escolares', 1);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (34, 5, 'Refuerzo de lectura', 2);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (35, 5, 'Refuerzo de escritura', 3);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (36, 5, 'Refuerzo matemático', 4);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (37, 5, 'Juegos educativos', 5);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (38, 5, 'Estimulación cognitiva personalizada', 6);

  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (39, 6, 'Alimentación', 1);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (40, 6, 'Higiene personal', 2);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (41, 6, 'Cambio de ropa', 3);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (42, 6, 'Acompañamiento al baño', 4);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (43, 6, 'Supervisión durante el sueño', 5);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (44, 6, 'Preparación de refrigerios', 6);
  INSERT OR IGNORE INTO Tareas (Id, IdCategoria, Descripcion, Orden) VALUES (45, 6, 'Organización de materiales escolares', 7);
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
  try { db.prepare(`ALTER TABLE Ordenes ADD COLUMN EstadoNegociacion TEXT NOT NULL DEFAULT 'Pendiente'`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Usuarios ADD COLUMN FotoPerfil TEXT`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Usuarios ADD COLUMN Suspendido INTEGER NOT NULL DEFAULT 0`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Postulaciones ADD COLUMN MotivoRechazo TEXT`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE DocumentosPostulacion ADD COLUMN MotivoRechazo TEXT`).run(); } catch(e) {}
  // Asignar MotivoRechazo por defecto a postulaciones Rechazadas existentes sin motivo
  try { db.prepare("UPDATE Postulaciones SET MotivoRechazo = 'No cumple con los requisitos mínimos establecidos.' WHERE Estado = 'Rechazada' AND (MotivoRechazo IS NULL OR MotivoRechazo = '')").run(); } catch(e) {}
  try { db.prepare("UPDATE DocumentosPostulacion SET MotivoRechazo = 'Documento no cumple con los requisitos.' WHERE Estado = 'Rechazado' AND (MotivoRechazo IS NULL OR MotivoRechazo = '')").run(); } catch(e) {}
  // Renombrar tipos de documento a nombres legibles para el frontend
  try { db.prepare("UPDATE DocumentosPostulacion SET TipoRequisito = 'Antecedentes penales' WHERE TipoRequisito = 'Antecedentes PNP'").run(); } catch(e) {}
  try { db.prepare("UPDATE DocumentosPostulacion SET TipoRequisito = 'Certificado de salud' WHERE TipoRequisito = 'Certificado Salud'").run(); } catch(e) {}
  try { db.prepare("UPDATE DocumentosPostulacion SET TipoRequisito = 'Titulo profesional' WHERE TipoRequisito = 'Certificado Estudios'").run(); } catch(e) {}
  try { db.prepare("UPDATE DocumentosPostulacion SET TipoRequisito = 'Carta de presentacion' WHERE TipoRequisito = 'Carta Presentacion'").run(); } catch(e) {}

console.log('Tablas creadas y datos de semilla insertados.');
}

// Ejecutar directamente si es llamado como script
if (process.argv[1] && (process.argv[1].endsWith('setup.js') || process.argv[1].endsWith('setup'))) {
  const db = getDb();
  setupDatabase(db);
  closeDb();
}
