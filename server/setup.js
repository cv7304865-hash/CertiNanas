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

  -- Modulo 5: Geolocalizacion (Check-In/Check-Out)
  CREATE TABLE IF NOT EXISTS GeolocalizacionRegistros (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdOrden INTEGER NOT NULL REFERENCES Ordenes(Id),
    IdCuidadora INTEGER NOT NULL REFERENCES Cuidadoras(Id),
    Tipo TEXT NOT NULL CHECK(Tipo IN ('CheckIn','CheckOut')),
    Latitud REAL NOT NULL,
    Longitud REAL NOT NULL,
    DistanciaMetros REAL,
    Validado INTEGER NOT NULL DEFAULT 0,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Modulo 5: Contratos Digitales (PDF storage)
  CREATE TABLE IF NOT EXISTS ContratosDigitales (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdOrden INTEGER NOT NULL UNIQUE REFERENCES Ordenes(Id),
    CodigoContrato TEXT NOT NULL UNIQUE,
    FechaEmision TEXT,
    PdfUrl TEXT,
    HashCriptografico TEXT,
    FirmaFamilia TEXT,
    FirmaCuidadora TEXT,
    FirmaAdmin TEXT,
    OTPFamilia TEXT,
    OTPCuidadora TEXT,
    OTPVerificadoFamilia INTEGER NOT NULL DEFAULT 0,
    OTPVerificadoCuidadora INTEGER NOT NULL DEFAULT 0,
    Estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK(Estado IN ('Pendiente','PendienteFirma','Completado','Cancelado')),
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Modulo 8: Incidentes (Boton de Panico)
  CREATE TABLE IF NOT EXISTS Incidentes (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdOrden INTEGER NOT NULL REFERENCES Ordenes(Id),
    IdUsuarioReporta INTEGER NOT NULL REFERENCES Usuarios(Id),
    Latitud REAL,
    Longitud REAL,
    Tipo TEXT NOT NULL DEFAULT 'Panico' CHECK(Tipo IN ('Panico','Emergencia','Incidente')),
    Estado TEXT NOT NULL DEFAULT 'Activo' CHECK(Estado IN ('Activo','EnAtencion','Resuelto','Cerrado')),
    Descripcion TEXT,
    FechaActivacion TEXT NOT NULL DEFAULT (datetime('now')),
    FechaResolucion TEXT
  );

  -- Modulo 9: Historial Salud Criptografico
  CREATE TABLE IF NOT EXISTS HistorialSalud (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdMenor INTEGER NOT NULL REFERENCES Menores(Id),
    IdCuidadora INTEGER NOT NULL REFERENCES Cuidadoras(Id),
    IdOrden INTEGER NOT NULL REFERENCES Ordenes(Id),
    DatosCifrados TEXT NOT NULL,
    VectorInicializacion TEXT NOT NULL,
    HashVerificacion TEXT NOT NULL,
    Activo INTEGER NOT NULL DEFAULT 1,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now')),
    FechaRevocacion TEXT
  );

  -- Modulo 11: Reemplazo de Emergencia
  CREATE TABLE IF NOT EXISTS ReemplazoEmergencia (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdOrden INTEGER NOT NULL REFERENCES Ordenes(Id),
    IdCuidadoraOriginal INTEGER NOT NULL REFERENCES Cuidadoras(Id),
    IdCuidadoraReemplazo INTEGER REFERENCES Cuidadoras(Id),
    Motivo TEXT NOT NULL,
    Estado TEXT NOT NULL DEFAULT 'Buscando' CHECK(Estado IN ('Buscando','Encontrado','Asignado','Fallido','Cancelado')),
    TiempoBusquedaSegundos INTEGER DEFAULT 0,
    NivelCompatibilidad REAL,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now')),
    FechaAsignacion TEXT
  );

  -- Modulo 12: Reportes Diarios de Atencion
  CREATE TABLE IF NOT EXISTS ReportesDiarios (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdOrden INTEGER NOT NULL REFERENCES Ordenes(Id),
    IdCuidadora INTEGER NOT NULL REFERENCES Cuidadoras(Id),
    IdMenor INTEGER NOT NULL REFERENCES Menores(Id),
    EstadoGeneral TEXT CHECK(EstadoGeneral IN ('Excelente','Bueno','Regular','Requiere Observacion')),
    Alimentacion TEXT,
    Medicamentos TEXT,
    ActividadesRealizadas TEXT,
    Observaciones TEXT,
    FechaReporte TEXT NOT NULL DEFAULT (date('now')),
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ReportesDiariosEvidencias (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdReporte INTEGER NOT NULL REFERENCES ReportesDiarios(Id) ON DELETE CASCADE,
    TipoArchivo TEXT NOT NULL,
    NombreArchivo TEXT NOT NULL,
    RutaArchivo TEXT NOT NULL,
    FechaSubida TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Modulo 13: Calendario Inteligente
  CREATE TABLE IF NOT EXISTS ReservasCalendario (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdOrden INTEGER NOT NULL REFERENCES Ordenes(Id),
    IdUsuarioFamilia INTEGER NOT NULL REFERENCES Usuarios(Id),
    IdCuidadora INTEGER NOT NULL REFERENCES Cuidadoras(Id),
    FechaInicio TEXT NOT NULL,
    FechaFin TEXT NOT NULL,
    TipoRecurrencia TEXT DEFAULT 'Unico' CHECK(TipoRecurrencia IN ('Unico','Diario','Semanal','Mensual','Personalizado')),
    Estado TEXT NOT NULL DEFAULT 'Programada' CHECK(Estado IN ('Programada','EnCurso','Completada','Cancelada')),
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Modulo 14: Capacitaciones y Certificaciones
  CREATE TABLE IF NOT EXISTS Capacitaciones (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Titulo TEXT NOT NULL,
    Descripcion TEXT,
    TipoContenido TEXT DEFAULT 'Video' CHECK(TipoContenido IN ('Video','PDF','Manual','CasoPractico')),
    UrlContenido TEXT,
    DuracionMinutos INTEGER,
    Categoria TEXT,
    Activo INTEGER NOT NULL DEFAULT 1,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS EvaluacionesCapacitacion (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdCapacitacion INTEGER NOT NULL REFERENCES Capacitaciones(Id) ON DELETE CASCADE,
    Pregunta TEXT NOT NULL,
    TipoRespuesta TEXT NOT NULL DEFAULT 'MultipleChoice' CHECK(TipoRespuesta IN ('MultipleChoice','VerdaderoFalso','CasoPractico')),
    Opciones TEXT,
    RespuestaCorrecta TEXT NOT NULL,
    Orden INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS ProgresoCapacitacion (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdCuidadora INTEGER NOT NULL REFERENCES Cuidadoras(Id) ON DELETE CASCADE,
    IdCapacitacion INTEGER NOT NULL REFERENCES Capacitaciones(Id) ON DELETE CASCADE,
    PuntajeObtenido REAL,
    Aprobado INTEGER NOT NULL DEFAULT 0,
    CertificadoGenerado INTEGER NOT NULL DEFAULT 0,
    CertificadoUrl TEXT,
    FechaCompletado TEXT,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(IdCuidadora, IdCapacitacion)
  );

  -- Modulo 15: Centro de Analitica
  CREATE TABLE IF NOT EXISTS MetricasAnalytics (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Tipo TEXT NOT NULL,
    Clave TEXT NOT NULL,
    Valor REAL NOT NULL,
    Periodo TEXT NOT NULL,
    FechaRegistro TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Modulo 16: Prediccion de Riesgos
  CREATE TABLE IF NOT EXISTS PrediccionRiesgos (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdOrden INTEGER NOT NULL REFERENCES Ordenes(Id),
    NivelRiesgo TEXT NOT NULL CHECK(NivelRiesgo IN ('Bajo','Medio','Alto')),
    PuntajeRiesgo REAL NOT NULL DEFAULT 0,
    VariablesAnalizadas TEXT,
    AlertaGenerada INTEGER NOT NULL DEFAULT 0,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Modulo 17: Miembros Familiares
  CREATE TABLE IF NOT EXISTS FamiliaMiembros (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdUsuarioFamiliaPrincipal INTEGER NOT NULL REFERENCES Usuarios(Id) ON DELETE CASCADE,
    Nombre TEXT NOT NULL,
    Email TEXT,
    Telefono TEXT,
    Rol TEXT NOT NULL CHECK(Rol IN ('Administrador','Observador')) DEFAULT 'Observador',
    Activo INTEGER NOT NULL DEFAULT 1,
    FechaCreacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Modulo 18: Reputacion y Gamificacion
  CREATE TABLE IF NOT EXISTS NivelesReputacion (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Nombre TEXT NOT NULL UNIQUE,
    PuntajeMinimo INTEGER NOT NULL,
    PuntajeMaximo INTEGER NOT NULL,
    Color TEXT,
    Orden INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS ReputacionCuidadora (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdCuidadora INTEGER NOT NULL UNIQUE REFERENCES Cuidadoras(Id) ON DELETE CASCADE,
    PuntajeTotal INTEGER NOT NULL DEFAULT 0,
    IdNivelActual INTEGER REFERENCES NivelesReputacion(Id),
    ServiciosCompletados INTEGER NOT NULL DEFAULT 0,
    Recontrataciones INTEGER NOT NULL DEFAULT 0,
    PuntualidadPromedio REAL DEFAULT 0,
    FechaActualizacion TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS HistorialReputacion (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    IdCuidadora INTEGER NOT NULL REFERENCES Cuidadoras(Id) ON DELETE CASCADE,
    PuntajeAnterior INTEGER NOT NULL,
    PuntajeNuevo INTEGER NOT NULL,
    Concepto TEXT NOT NULL,
    IdReferencia INTEGER,
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

  -- Niveles de Reputacion
  INSERT OR IGNORE INTO NivelesReputacion (Nombre, PuntajeMinimo, PuntajeMaximo, Color, Orden) VALUES ('Bronce', 0, 199, '#CD7F32', 1);
  INSERT OR IGNORE INTO NivelesReputacion (Nombre, PuntajeMinimo, PuntajeMaximo, Color, Orden) VALUES ('Plata', 200, 399, '#C0C0C0', 2);
  INSERT OR IGNORE INTO NivelesReputacion (Nombre, PuntajeMinimo, PuntajeMaximo, Color, Orden) VALUES ('Oro', 400, 599, '#FFD700', 3);
  INSERT OR IGNORE INTO NivelesReputacion (Nombre, PuntajeMinimo, PuntajeMaximo, Color, Orden) VALUES ('Platino', 600, 799, '#E5E4E2', 4);
  INSERT OR IGNORE INTO NivelesReputacion (Nombre, PuntajeMinimo, PuntajeMaximo, Color, Orden) VALUES ('Elite', 800, 999999, '#B9F2FF', 5);

  -- Capacitaciones
  INSERT OR IGNORE INTO Capacitaciones (Id, Titulo, Descripcion, TipoContenido, UrlContenido, DuracionMinutos, Categoria) VALUES (1, 'Introduccion al Cuidado de Ninos con TEA', 'Aprende los fundamentos del Trastorno del Espectro Autista y las mejores practicas de cuidado.', 'Video', '/capacitaciones/tea-intro.mp4', 45, 'TEA');
  INSERT OR IGNORE INTO Capacitaciones (Id, Titulo, Descripcion, TipoContenido, UrlContenido, DuracionMinutos, Categoria) VALUES (2, 'Manejo de Crisis Conductuales', 'Tecnicas efectivas para prevenir y manejar crisis conductuales en ninos con necesidades especiales.', 'Video', '/capacitaciones/crisis.mp4', 60, 'Conductual');
  INSERT OR IGNORE INTO Capacitaciones (Id, Titulo, Descripcion, TipoContenido, UrlContenido, DuracionMinutos, Categoria) VALUES (3, 'Primeros Auxilios Pediatricos Avanzados', 'Protocolos completos de primeros auxilios especificos para la poblacion pediatrica.', 'Video', '/capacitaciones/primeros-auxilios.mp4', 90, 'Salud');
  INSERT OR IGNORE INTO Capacitaciones (Id, Titulo, Descripcion, TipoContenido, UrlContenido, DuracionMinutos, Categoria) VALUES (4, 'Estimulacion Temprana en Casa', 'Actividades y ejercicios de estimulacion temprana que pueden realizarse en el hogar.', 'Manual', '/capacitaciones/estimulacion-temprana.pdf', 120, 'Desarrollo');
  INSERT OR IGNORE INTO Capacitaciones (Id, Titulo, Descripcion, TipoContenido, UrlContenido, DuracionMinutos, Categoria) VALUES (5, 'Comunicacion con Familias', 'Estrategias de comunicacion efectiva para construir relaciones de confianza con las familias.', 'CasoPractico', '/capacitaciones/comunicacion-familias.pdf', 45, 'Habilidades');
`);

  // Evaluaciones para Capacitacion 1: TEA
  const evals = [
    [1, 'Cual de las siguientes es una caracteristica comun del TEA?', 'MultipleChoice', '["Dificultades en la comunicacion social","Problemas de vision","Alergias alimentarias","Problemas de audicion"]', 'Dificultades en la comunicacion social', 1],
    [1, 'Que estrategia es mas efectiva para un nino con TEA?', 'MultipleChoice', '["Mantener rutinas predecibles","Cambiar la rutina diariamente","Hablar en voz alta","Ignorar las conductas repetitivas"]', 'Mantener rutinas predecibles', 2],
    [1, 'La sobrecarga sensorial puede provocar crisis en ninos con TEA.', 'VerdaderoFalso', '["Verdadero","Falso"]', 'Verdadero', 3],
    [1, 'Cual es la mejor manera de comunicarse con un nino no verbal con TEA?', 'MultipleChoice', '["Usar apoyos visuales","Hablar mas fuerte","Ignorar al nino","Usar solo lenguaje escrito"]', 'Usar apoyos visuales', 4],
    [2, 'Cual es el primer paso ante una crisis conductual?', 'MultipleChoice', '["Mantener la calma y evaluar la situacion","Sujetar al nino","Llamar a los padres inmediatamente","Ignorar la conducta"]', 'Mantener la calma y evaluar la situacion', 1],
    [2, 'Que debes evitar durante una crisis?', 'MultipleChoice', '["Hablar en tono calmado","Dar instrucciones claras","Elevar la voz","Retirar estimulos sensoriales"]', 'Elevar la voz', 2],
    [2, 'Es recomendable usar tecnicas de contencion fisica como primera opcion.', 'VerdaderoFalso', '["Verdadero","Falso"]', 'Falso', 3],
    [2, 'Despues de una crisis, que es importante hacer?', 'MultipleChoice', '["Reflexionar sobre lo ocurrido y registrar","Ignorar lo sucedido","Castigar al nino","Continuar como si nada"]', 'Reflexionar sobre lo ocurrido y registrar', 4],
    [3, 'Cual es la relacion correcta de compresiones toracicas y ventilaciones en RCP pediatrico?', 'MultipleChoice', '["30:2","15:2","5:1","10:1"]', '30:2', 1],
    [3, 'Que hacer si un nino se esta atragantando y no puede toser?', 'MultipleChoice', '["Maniobra de Heimlich","Dar palmadas en la espalda","Ofrecer agua","Esperar a que pase"]', 'Maniobra de Heimlich', 2],
    [3, 'La posicion de recuperacion se usa cuando el nino esta inconsciente pero respira.', 'VerdaderoFalso', '["Verdadero","Falso"]', 'Verdadero', 3],
    [3, 'Cual es la temperatura corporal que indica fiebre alta en ninos?', 'MultipleChoice', '["38.5°C o mas","37°C","36.5°C","39.5°C o mas"]', '39.5°C o mas', 4],
    [4, 'A que edad se recomienda iniciar la estimulacion temprana?', 'MultipleChoice', '["Desde el nacimiento","A los 2 anos","A los 3 anos","A los 6 meses"]', 'Desde el nacimiento', 1],
    [4, 'Cual de estas actividades favorece la motricidad fina?', 'MultipleChoice', '["Enhebrar cuentas","Correr","Saltar","Nadar"]', 'Enhebrar cuentas', 2],
    [4, 'El juego sensorial solo es benefico para ninos con discapacidades.', 'VerdaderoFalso', '["Verdadero","Falso"]', 'Falso', 3],
    [4, 'Cuantas horas de sueno necesita un nino de 2 anos en promedio?', 'MultipleChoice', '["11-14 horas","6-8 horas","8-10 horas","14-16 horas"]', '11-14 horas', 4],
    [5, 'Cual es la clave para una comunicacion efectiva con la familia?', 'MultipleChoice', '["Escucha activa y empatia","Hablar solo de temas laborales","Evitar el contacto visual","Usar terminos tecnicos"]', 'Escucha activa y empatia', 1],
    [5, 'Como manejar un desacuerdo con una familia sobre el cuidado del nino?', 'MultipleChoice', '["Dialogar respetuosamente y buscar acuerdo","Imponer tu criterio","Ignorar la opinion de la familia","Quejarte con otras cuidadoras"]', 'Dialogar respetuosamente y buscar acuerdo', 2],
    [5, 'Es importante establecer limites claros desde el inicio de la relacion laboral.', 'VerdaderoFalso', '["Verdadero","Falso"]', 'Verdadero', 3],
    [5, 'Que hacer si observas una situacion de riesgo en el hogar de la familia?', 'MultipleChoice', '["Reportarlo al coordinador de CERTINANAS","Ignorarlo","Comentarlo con otros","Publicarlo en redes"]', 'Reportarlo al coordinador de CERTINANAS', 4],
  ];

  const insertEval = db.prepare('INSERT OR IGNORE INTO EvaluacionesCapacitacion (IdCapacitacion, Pregunta, TipoRespuesta, Opciones, RespuestaCorrecta, Orden) VALUES (?, ?, ?, ?, ?, ?)');
  for (const e of evals) {
    const exists = db.prepare('SELECT Id FROM EvaluacionesCapacitacion WHERE IdCapacitacion = ? AND Orden = ?').get(e[0], e[5]);
    if (!exists) {
      insertEval.run(...e);
    }
  }

  // Postulaciones seed data
  const existingPost = db.prepare('SELECT COUNT(*) AS c FROM Postulaciones').get().c;
  if (existingPost === 0) {
    // Postulaciones pendientes
    db.prepare("INSERT INTO Postulaciones (IdUsuario, FechaPostulacion, Estado) VALUES (?, datetime('now', '-2 hours'), 'Pendiente')").run(8);
    db.prepare("INSERT INTO Postulaciones (IdUsuario, FechaPostulacion, Estado) VALUES (?, datetime('now', '-12 hours'), 'Pendiente')").run(9);
    db.prepare("INSERT INTO Postulaciones (IdUsuario, FechaPostulacion, Estado) VALUES (?, datetime('now', '-28 hours'), 'Pendiente')").run(10);
    // Postulaciones aprobadas
    db.prepare("INSERT INTO Postulaciones (IdUsuario, FechaPostulacion, Estado) VALUES (?, datetime('now', '-5 days'), 'Aprobada')").run(11);
    db.prepare("INSERT INTO Postulaciones (IdUsuario, FechaPostulacion, Estado) VALUES (?, datetime('now', '-10 days'), 'Aprobada')").run(12);
    // Postulaciones rechazadas
    db.prepare("INSERT INTO Postulaciones (IdUsuario, FechaPostulacion, Estado, MotivoRechazo) VALUES (?, datetime('now', '-7 days'), 'Rechazada', 'Documentos incompletos: falta certificado de antecedentes penales')").run(13);
    db.prepare("INSERT INTO Postulaciones (IdUsuario, FechaPostulacion, Estado, MotivoRechazo) VALUES (?, datetime('now', '-14 days'), 'Rechazada', 'No cumple con los requisitos minimos de experiencia')").run(14);

    // Documentos for each postulacion
    const postulacionesIds = db.prepare('SELECT Id, Estado FROM Postulaciones ORDER BY Id').all();
    const tiposDoc = ['DNI', 'Antecedentes penales', 'Certificado de salud', 'Titulo profesional', 'Carta de presentacion'];
    for (const p of postulacionesIds) {
      const estadoDoc = p.Estado === 'Aprobada' ? 'Aprobado' : p.Estado === 'Rechazada' ? 'Rechazado' : 'Pendiente';
      for (let i = 0; i < tiposDoc.length; i++) {
        const archivo = tiposDoc[i].toLowerCase().replace(/\s+/g, '_') + '.pdf';
        db.prepare("INSERT INTO DocumentosPostulacion (IdPostulacion, TipoRequisito, NombreArchivo, Peso, Estado, MotivoRechazo) VALUES (?, ?, ?, ?, ?, ?)").run(
          p.Id, tiposDoc[i], archivo, (0.5 + Math.random() * 2).toFixed(1) + ' MB',
          estadoDoc,
          estadoDoc === 'Rechazado' ? 'El documento no es legible o esta incompleto' : null
        );
      }
    }
  }

  // Migraciones
  try { db.prepare(`ALTER TABLE Negociaciones ADD COLUMN Propuestas TEXT`).run(); } catch(e) {}
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
  try { db.prepare(`ALTER TABLE Ordenes ADD COLUMN CheckIn REAL`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Ordenes ADD COLUMN CheckOut REAL`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Ordenes ADD COLUMN CheckInLatitud REAL`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Ordenes ADD COLUMN CheckInLongitud REAL`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Ordenes ADD COLUMN CheckOutLatitud REAL`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Ordenes ADD COLUMN CheckOutLongitud REAL`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Contratos ADD COLUMN PdfUrl TEXT`).run(); } catch(e) {}
  try { db.prepare(`ALTER TABLE Contratos ADD COLUMN HashCriptografico TEXT`).run(); } catch(e) {}
  try { db.prepare("UPDATE Postulaciones SET MotivoRechazo = 'No cumple con los requisitos minimos establecidos.' WHERE Estado = 'Rechazada' AND (MotivoRechazo IS NULL OR MotivoRechazo = '')").run(); } catch(e) {}
  try { db.prepare("UPDATE DocumentosPostulacion SET MotivoRechazo = 'Documento no cumple con los requisitos.' WHERE Estado = 'Rechazado' AND (MotivoRechazo IS NULL OR MotivoRechazo = '')").run(); } catch(e) {}
  try { db.prepare("UPDATE DocumentosPostulacion SET TipoRequisito = 'Antecedentes penales' WHERE TipoRequisito = 'Antecedentes PNP'").run(); } catch(e) {}
  try { db.prepare("UPDATE DocumentosPostulacion SET TipoRequisito = 'Certificado de salud' WHERE TipoRequisito = 'Certificado Salud'").run(); } catch(e) {}
  try { db.prepare("UPDATE DocumentosPostulacion SET TipoRequisito = 'Titulo profesional' WHERE TipoRequisito = 'Certificado Estudios'").run(); } catch(e) {}
  try { db.prepare("UPDATE DocumentosPostulacion SET TipoRequisito = 'Carta de presentacion' WHERE TipoRequisito = 'Carta Presentacion'").run(); } catch(e) {}

console.log('Tablas creadas y datos de semilla insertados.');
}

if (process.argv[1] && (process.argv[1].endsWith('setup.js') || process.argv[1].endsWith('setup'))) {
  const db = getDb();
  setupDatabase(db);
  closeDb();
}
