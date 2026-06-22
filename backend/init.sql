-- CertiNanas - Esquema Completo de Base de Datos
-- Basado en el diagrama ER de database/DIAGRAMA.md

CREATE DATABASE IF NOT EXISTS certinanas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE certinanas;

-- ============================================================
-- TABLAS CATÁLOGO
-- ============================================================

CREATE TABLE Roles (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE,
    Descripcion VARCHAR(255),
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE Especialidades (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL UNIQUE,
    Descripcion VARCHAR(255),
    Activo BOOLEAN DEFAULT TRUE,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE Areas (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL UNIQUE,
    Descripcion VARCHAR(255),
    Activo BOOLEAN DEFAULT TRUE,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE TiposRequisito (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ============================================================
-- TABLAS PRINCIPALES
-- ============================================================

CREATE TABLE Usuarios (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(180) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    NumeroDocumento VARCHAR(20),
    TipoDocumento VARCHAR(20) DEFAULT 'DNI',
    Telefono VARCHAR(20),
    Direccion VARCHAR(255),
    Ciudad VARCHAR(100),
    Distrito VARCHAR(100),
    IdRol INT NOT NULL,
    EmailConfirmado BOOLEAN DEFAULT FALSE,
    TerminosAceptados BOOLEAN DEFAULT FALSE,
    Activo BOOLEAN DEFAULT TRUE,
    Suspendido BOOLEAN DEFAULT FALSE,
    FotoPerfil VARCHAR(500),
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdRol) REFERENCES Roles(Id)
) ENGINE=InnoDB;

CREATE TABLE Cuidadoras (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdUsuario INT NOT NULL UNIQUE,
    AniosExperiencia INT DEFAULT 0,
    TarifaHora DECIMAL(10,2) DEFAULT 25.00,
    DescripcionCorta VARCHAR(300),
    DescripcionLarga TEXT,
    CalificacionPromedio DECIMAL(3,2) DEFAULT 0.00,
    TotalResenas INT DEFAULT 0,
    Disponible BOOLEAN DEFAULT TRUE,
    Zona VARCHAR(100),
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdUsuario) REFERENCES Usuarios(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLAS RELACIONALES
-- ============================================================

CREATE TABLE CuidadoraEspecialidades (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidadora INT NOT NULL,
    IdEspecialidad INT NOT NULL,
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id) ON DELETE CASCADE,
    FOREIGN KEY (IdEspecialidad) REFERENCES Especialidades(Id) ON DELETE CASCADE,
    UNIQUE KEY uq_cuidadora_especialidad (IdCuidadora, IdEspecialidad)
) ENGINE=InnoDB;

CREATE TABLE CuidadoraAreas (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidadora INT NOT NULL,
    IdArea INT NOT NULL,
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id) ON DELETE CASCADE,
    FOREIGN KEY (IdArea) REFERENCES Areas(Id) ON DELETE CASCADE,
    UNIQUE KEY uq_cuidadora_area (IdCuidadora, IdArea)
) ENGINE=InnoDB;

CREATE TABLE CuidadoraFormacion (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidadora INT NOT NULL,
    Titulo VARCHAR(255) NOT NULL,
    Institucion VARCHAR(255),
    AnioObtencion INT,
    Orden INT DEFAULT 0,
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE CuidadoraCertificaciones (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidadora INT NOT NULL,
    Nombre VARCHAR(255) NOT NULL,
    EntidadEmisora VARCHAR(255),
    FechaObtencion DATE,
    FechaVencimiento DATE,
    Orden INT DEFAULT 0,
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE CuidadoraDocumentos (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidadora INT NOT NULL,
    TipoDocumento VARCHAR(100) NOT NULL,
    NombreArchivo VARCHAR(255) NOT NULL,
    RutaArchivo VARCHAR(500) NOT NULL,
    Verificado BOOLEAN DEFAULT FALSE,
    FechaSubida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLAS TRANSACCIONALES
-- ============================================================

CREATE TABLE Menores (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdUsuarioFamilia INT NOT NULL,
    Nombre VARCHAR(100) NOT NULL,
    Diagnostico VARCHAR(255),
    FechaNacimiento DATE,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdUsuarioFamilia) REFERENCES Usuarios(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Ordenes (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidadora INT NOT NULL,
    IdUsuarioFamilia INT NOT NULL,
    TipoServicio VARCHAR(100),
    FechaServicio DATE NOT NULL,
    TotalHoras DECIMAL(5,2) NOT NULL,
    TarifaHora DECIMAL(10,2) NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    TarifaPlataforma DECIMAL(10,2) DEFAULT 0.00,
    Total DECIMAL(10,2) NOT NULL,
    IdMenor INT,
    HoraInicio TIME,
    HoraFin TIME,
    FechaFinalizacion DATETIME,
    IdEscrow INT,
    ConfirmadaFamilia BOOLEAN DEFAULT FALSE,
    ConfirmadaCuidadora BOOLEAN DEFAULT FALSE,
    FinalizadaFamilia BOOLEAN DEFAULT FALSE,
    FinalizadaCuidadora BOOLEAN DEFAULT FALSE,
    Estado VARCHAR(50) DEFAULT 'Pendiente',
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id),
    FOREIGN KEY (IdUsuarioFamilia) REFERENCES Usuarios(Id),
    FOREIGN KEY (IdMenor) REFERENCES Menores(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE Escrow (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdOrden INT NOT NULL UNIQUE,
    MontoTotal DECIMAL(10,2) NOT NULL,
    MontoCuidadora DECIMAL(10,2) NOT NULL,
    MontoPlataforma DECIMAL(10,2) NOT NULL,
    Estado VARCHAR(50) DEFAULT 'Retenido',
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FechaLiberacion DATETIME,
    FOREIGN KEY (IdOrden) REFERENCES Ordenes(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Contratos (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdOrden INT NOT NULL UNIQUE,
    Terminos TEXT,
    AceptadoFamilia BOOLEAN DEFAULT FALSE,
    AceptadoCuidadora BOOLEAN DEFAULT FALSE,
    FechaAceptacionFamilia DATETIME,
    FechaAceptacionCuidadora DATETIME,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdOrden) REFERENCES Ordenes(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Pagos (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdOrden INT NOT NULL,
    Monto DECIMAL(10,2) NOT NULL,
    MetodoPago VARCHAR(50),
    Estado VARCHAR(50) DEFAULT 'Pendiente',
    FechaPago DATETIME,
    FOREIGN KEY (IdOrden) REFERENCES Ordenes(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Resenas (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidadora INT NOT NULL,
    IdUsuarioFamilia INT NOT NULL,
    Calificacion INT NOT NULL CHECK (Calificacion BETWEEN 1 AND 5),
    Comentario TEXT,
    FechaResena DATE,
    Visible BOOLEAN DEFAULT TRUE,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id) ON DELETE CASCADE,
    FOREIGN KEY (IdUsuarioFamilia) REFERENCES Usuarios(Id)
) ENGINE=InnoDB;

CREATE TABLE Favoritos (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdUsuarioFamilia INT NOT NULL,
    IdCuidadora INT NOT NULL,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdUsuarioFamilia) REFERENCES Usuarios(Id) ON DELETE CASCADE,
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id) ON DELETE CASCADE,
    UNIQUE KEY uq_favorito (IdUsuarioFamilia, IdCuidadora)
) ENGINE=InnoDB;

CREATE TABLE Citas (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidadora INT NOT NULL,
    IdUsuarioFamilia INT NOT NULL,
    FechaCita DATE NOT NULL,
    HoraCita TIME NOT NULL,
    DuracionMinutos INT DEFAULT 15,
    Modalidad VARCHAR(50) DEFAULT 'google-meet',
    Estado VARCHAR(50) DEFAULT 'Programada',
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id),
    FOREIGN KEY (IdUsuarioFamilia) REFERENCES Usuarios(Id)
) ENGINE=InnoDB;

CREATE TABLE Conversaciones (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidadora INT NOT NULL,
    IdUsuarioFamilia INT NOT NULL,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FechaUltimoMensaje DATETIME,
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id),
    FOREIGN KEY (IdUsuarioFamilia) REFERENCES Usuarios(Id)
) ENGINE=InnoDB;

CREATE TABLE Mensajes (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdConversacion INT NOT NULL,
    IdRemitente INT NOT NULL,
    Contenido TEXT NOT NULL,
    Leido BOOLEAN DEFAULT FALSE,
    FechaEnvio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdConversacion) REFERENCES Conversaciones(Id) ON DELETE CASCADE,
    FOREIGN KEY (IdRemitente) REFERENCES Usuarios(Id)
) ENGINE=InnoDB;

CREATE TABLE Postulaciones (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdUsuario INT NOT NULL,
    FechaPostulacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    Estado VARCHAR(50) DEFAULT 'Pendiente',
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdUsuario) REFERENCES Usuarios(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE DocumentosPostulacion (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdPostulacion INT NOT NULL,
    TipoRequisito VARCHAR(100) NOT NULL,
    NombreArchivo VARCHAR(255) NOT NULL,
    Peso VARCHAR(20),
    Estado VARCHAR(50) DEFAULT 'Pendiente',
    FechaSubida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdPostulacion) REFERENCES Postulaciones(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Notificaciones (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdUsuarioDestino INT NOT NULL,
    Titulo VARCHAR(255) NOT NULL,
    Descripcion TEXT,
    Tipo VARCHAR(50),
    Leido BOOLEAN DEFAULT FALSE,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdUsuarioDestino) REFERENCES Usuarios(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Incidencias (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdOrden INT,
    IdCita INT,
    Tipo VARCHAR(50),
    Estado VARCHAR(50) DEFAULT 'Abierta',
    Descripcion TEXT,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdOrden) REFERENCES Ordenes(Id) ON DELETE SET NULL,
    FOREIGN KEY (IdCita) REFERENCES Citas(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE Casos (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Titulo VARCHAR(255) NOT NULL,
    Descripcion TEXT,
    Tipo VARCHAR(50),
    IdUsuarioReporta INT,
    IdCuidadora INT,
    IdOrden INT,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdUsuarioReporta) REFERENCES Usuarios(Id),
    FOREIGN KEY (IdOrden) REFERENCES Ordenes(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE Auditoria (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdUsuario INT,
    Accion VARCHAR(100) NOT NULL,
    Entidad VARCHAR(100),
    IdEntidad INT,
    Detalle TEXT,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdUsuario) REFERENCES Usuarios(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla de sesiones (para tokens JWT o session-based)
CREATE TABLE Sesiones (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdUsuario INT NOT NULL,
    Token VARCHAR(500) NOT NULL,
    FechaExpiracion DATETIME NOT NULL,
    Activo BOOLEAN DEFAULT TRUE,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdUsuario) REFERENCES Usuarios(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- DATOS INICIALES
-- ============================================================

INSERT INTO Roles (Nombre, Descripcion) VALUES
('admin', 'Administrador del sistema'),
('familia', 'Familia que solicita servicios de cuidado'),
('cuidadora', 'Cuidadora registrada y verificada');

INSERT INTO Especialidades (Nombre, Descripcion) VALUES
('TEA', 'Trastorno del Espectro Autista'),
('TDAH', 'Trastorno por Déficit de Atención e Hiperactividad'),
('Síndrome de Down', 'Síndrome de Down'),
('Primeros Auxilios', 'Primeros auxilios pediátricos'),
('Discapacidad Motriz', 'Discapacidad motriz y estimulación física');

INSERT INTO Areas (Nombre, Descripcion) VALUES
('Cuidado domiciliario', 'Cuidado en el hogar'),
('Acompañamiento escolar', 'Acompañamiento en actividades escolares'),
('Terapias de estimulación', 'Terapias de estimulación sensorial y cognitiva');

INSERT INTO TiposRequisito (Nombre) VALUES
('DNI'),
('Certificado de Antecedentes Penales'),
('Certificado de Salud'),
('Certificado de Estudios'),
('Certificado de Trabajo');

-- Cuentas de prueba (password para todas: password)
-- Admin
INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, IdRol, EmailConfirmado, TerminosAceptados, Activo)
VALUES ('admin@certinanas.pe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'CertiNanas', 1, TRUE, TRUE, TRUE);

-- Familia de prueba
INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, Telefono, Direccion, Ciudad, Distrito, IdRol, EmailConfirmado, TerminosAceptados, Activo)
VALUES ('familia@certinanas.pe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'María', 'Pérez López', '999888777', 'Av. Principal 123', 'Lima', 'Miraflores', 2, TRUE, TRUE, TRUE);

INSERT INTO Menores (IdUsuarioFamilia, Nombre, Diagnostico, FechaNacimiento)
VALUES (2, 'Mateo Pérez', 'TEA', '2019-05-12');

INSERT INTO Menores (IdUsuarioFamilia, Nombre, Diagnostico, FechaNacimiento)
VALUES (2, 'Valentina Pérez', 'TDAH', '2021-08-20');

-- Cuidadora de prueba (activa)
INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, Telefono, NumeroDocumento, IdRol, EmailConfirmado, TerminosAceptados, Activo)
VALUES ('cuidadora@certinanas.pe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carmen', 'Rodríguez García', '987654321', '12345678', 3, TRUE, TRUE, TRUE);

INSERT INTO Cuidadoras (IdUsuario, AniosExperiencia, TarifaHora, DescripcionCorta, DescripcionLarga, CalificacionPromedio, TotalResenas, Disponible, Zona)
VALUES (3, 8, 30.00, 'Terapeuta ocupacional enfocada en autonomía y estimulación sensorial.',
        'Con 8 años de experiencia como terapeuta ocupacional, he desarrollado programas de estimulación sensorial y motriz para niños dentro del espectro autista y con discapacidades motoras.',
        4.8, 15, TRUE, 'Lima Moderna');

INSERT INTO CuidadoraEspecialidades (IdCuidadora, IdEspecialidad) VALUES (1, 1); -- TEA
INSERT INTO CuidadoraEspecialidades (IdCuidadora, IdEspecialidad) VALUES (1, 5); -- Disc. Motriz
INSERT INTO CuidadoraAreas (IdCuidadora, IdArea) VALUES (1, 1); -- Cuidado domiciliario
INSERT INTO CuidadoraAreas (IdCuidadora, IdArea) VALUES (1, 3); -- Terapias

INSERT INTO CuidadoraFormacion (IdCuidadora, Titulo, Institucion, AnioObtencion, Orden)
VALUES (1, 'Tecnología Médica en Terapia Ocupacional', 'UPCH', 2015, 1);
INSERT INTO CuidadoraFormacion (IdCuidadora, Titulo, Institucion, AnioObtencion, Orden)
VALUES (1, 'Especialización en Integración Sensorial', 'PUCP', 2018, 2);

INSERT INTO CuidadoraCertificaciones (IdCuidadora, Nombre, EntidadEmisora, FechaObtencion, Orden)
VALUES (1, 'Estimulación Temprana Avanzada', 'MIMP', '2022-03-10', 1);
INSERT INTO CuidadoraCertificaciones (IdCuidadora, Nombre, EntidadEmisora, FechaObtencion, Orden)
VALUES (1, 'Soporte Vital Básico Pediátrico', 'Cruz Roja', '2023-06-15', 2);

-- Cuidadora 2 de prueba (pendiente de aprobación)
INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, Telefono, NumeroDocumento, IdRol, EmailConfirmado, TerminosAceptados, Activo)
VALUES ('cuidadora2@certinanas.pe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ana', 'Torres Mendoza', '987654322', '87654321', 3, TRUE, TRUE, FALSE);

INSERT INTO Cuidadoras (IdUsuario, AniosExperiencia, TarifaHora, DescripcionCorta, Disponible, Zona)
VALUES (4, 2, 25.00, 'Joven pedagoga con enfoque lúdico y acompañamiento escolar.', FALSE, 'Lima Norte');

INSERT INTO Postulaciones (IdUsuario, Estado)
VALUES (4, 'Pendiente');

-- ============================================================
-- NUEVAS TABLAS - MÓDULOS 5-18
-- ============================================================

CREATE TABLE GeolocalizacionRegistros (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdOrden INT NOT NULL,
    IdCuidadora INT NOT NULL,
    Tipo VARCHAR(20) NOT NULL CHECK (Tipo IN ('CheckIn','CheckOut')),
    Latitud DECIMAL(10,7) NOT NULL,
    Longitud DECIMAL(10,7) NOT NULL,
    DistanciaMetros DECIMAL(10,2),
    Validado BOOLEAN DEFAULT FALSE,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdOrden) REFERENCES Ordenes(Id) ON DELETE CASCADE,
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ContratosDigitales (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdOrden INT NOT NULL UNIQUE,
    CodigoContrato VARCHAR(50) NOT NULL UNIQUE,
    FechaEmision DATETIME,
    PdfUrl VARCHAR(500),
    HashCriptografico VARCHAR(255),
    FirmaFamilia TEXT,
    FirmaCuidadora TEXT,
    FirmaAdmin TEXT,
    OTPFamilia VARCHAR(10),
    OTPCuidadora VARCHAR(10),
    OTPVerificadoFamilia BOOLEAN DEFAULT FALSE,
    OTPVerificadoCuidadora BOOLEAN DEFAULT FALSE,
    Estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (Estado IN ('Pendiente','PendienteFirma','Completado','Cancelado')),
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdOrden) REFERENCES Ordenes(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Incidentes (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdOrden INT NOT NULL,
    IdUsuarioReporta INT NOT NULL,
    Latitud DECIMAL(10,7),
    Longitud DECIMAL(10,7),
    Tipo VARCHAR(20) DEFAULT 'Panico' CHECK (Tipo IN ('Panico','Emergencia','Incidente')),
    Estado VARCHAR(20) DEFAULT 'Activo' CHECK (Estado IN ('Activo','EnAtencion','Resuelto','Cerrado')),
    Descripcion TEXT,
    FechaActivacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FechaResolucion DATETIME,
    FOREIGN KEY (IdOrden) REFERENCES Ordenes(Id) ON DELETE CASCADE,
    FOREIGN KEY (IdUsuarioReporta) REFERENCES Usuarios(Id)
) ENGINE=InnoDB;

CREATE TABLE HistorialSalud (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdMenor INT NOT NULL,
    IdCuidadora INT NOT NULL,
    IdOrden INT NOT NULL,
    DatosCifrados TEXT NOT NULL,
    VectorInicializacion VARCHAR(255) NOT NULL,
    HashVerificacion VARCHAR(255) NOT NULL,
    Activo BOOLEAN DEFAULT TRUE,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FechaRevocacion DATETIME,
    FOREIGN KEY (IdMenor) REFERENCES Menores(Id) ON DELETE CASCADE,
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id),
    FOREIGN KEY (IdOrden) REFERENCES Ordenes(Id)
) ENGINE=InnoDB;

CREATE TABLE ReemplazoEmergencia (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdOrden INT NOT NULL,
    IdCuidadoraOriginal INT NOT NULL,
    IdCuidadoraReemplazo INT,
    Motivo TEXT NOT NULL,
    Estado VARCHAR(20) DEFAULT 'Buscando' CHECK (Estado IN ('Buscando','Encontrado','Asignado','Fallido','Cancelado')),
    TiempoBusquedaSegundos INT DEFAULT 0,
    NivelCompatibilidad DECIMAL(5,2),
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FechaAsignacion DATETIME,
    FOREIGN KEY (IdOrden) REFERENCES Ordenes(Id) ON DELETE CASCADE,
    FOREIGN KEY (IdCuidadoraOriginal) REFERENCES Cuidadoras(Id),
    FOREIGN KEY (IdCuidadoraReemplazo) REFERENCES Cuidadoras(Id)
) ENGINE=InnoDB;

CREATE TABLE ReportesDiarios (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdOrden INT NOT NULL,
    IdCuidadora INT NOT NULL,
    IdMenor INT NOT NULL,
    EstadoGeneral VARCHAR(30) CHECK (EstadoGeneral IN ('Excelente','Bueno','Regular','Requiere Observacion')),
    Alimentacion TEXT,
    Medicamentos TEXT,
    ActividadesRealizadas TEXT,
    Observaciones TEXT,
    FechaReporte DATE NOT NULL DEFAULT (CURRENT_DATE),
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdOrden) REFERENCES Ordenes(Id) ON DELETE CASCADE,
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id),
    FOREIGN KEY (IdMenor) REFERENCES Menores(Id)
) ENGINE=InnoDB;

CREATE TABLE ReportesDiariosEvidencias (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdReporte INT NOT NULL,
    TipoArchivo VARCHAR(20) NOT NULL,
    NombreArchivo VARCHAR(255) NOT NULL,
    RutaArchivo VARCHAR(500) NOT NULL,
    FechaSubida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdReporte) REFERENCES ReportesDiarios(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ReservasCalendario (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdOrden INT NOT NULL,
    IdUsuarioFamilia INT NOT NULL,
    IdCuidadora INT NOT NULL,
    FechaInicio DATETIME NOT NULL,
    FechaFin DATETIME NOT NULL,
    TipoRecurrencia VARCHAR(20) DEFAULT 'Unico' CHECK (TipoRecurrencia IN ('Unico','Diario','Semanal','Mensual','Personalizado')),
    Estado VARCHAR(20) DEFAULT 'Programada' CHECK (Estado IN ('Programada','EnCurso','Completada','Cancelada')),
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdOrden) REFERENCES Ordenes(Id) ON DELETE CASCADE,
    FOREIGN KEY (IdUsuarioFamilia) REFERENCES Usuarios(Id),
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id)
) ENGINE=InnoDB;

CREATE TABLE Capacitaciones (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Titulo VARCHAR(255) NOT NULL,
    Descripcion TEXT,
    TipoContenido VARCHAR(20) DEFAULT 'Video' CHECK (TipoContenido IN ('Video','PDF','Manual','CasoPractico')),
    UrlContenido VARCHAR(500),
    DuracionMinutos INT,
    Categoria VARCHAR(100),
    Activo BOOLEAN DEFAULT TRUE,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE EvaluacionesCapacitacion (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdCapacitacion INT NOT NULL,
    Pregunta TEXT NOT NULL,
    TipoRespuesta VARCHAR(30) DEFAULT 'MultipleChoice' CHECK (TipoRespuesta IN ('MultipleChoice','VerdaderoFalso','CasoPractico')),
    Opciones TEXT,
    RespuestaCorrecta TEXT NOT NULL,
    Orden INT DEFAULT 0,
    FOREIGN KEY (IdCapacitacion) REFERENCES Capacitaciones(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ProgresoCapacitacion (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidadora INT NOT NULL,
    IdCapacitacion INT NOT NULL,
    PuntajeObtenido DECIMAL(5,2),
    Aprobado BOOLEAN DEFAULT FALSE,
    CertificadoGenerado BOOLEAN DEFAULT FALSE,
    CertificadoUrl VARCHAR(500),
    FechaCompletado DATETIME,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_progreso (IdCuidadora, IdCapacitacion),
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id) ON DELETE CASCADE,
    FOREIGN KEY (IdCapacitacion) REFERENCES Capacitaciones(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE MetricasAnalytics (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Tipo VARCHAR(50) NOT NULL,
    Clave VARCHAR(100) NOT NULL,
    Valor DECIMAL(12,2) NOT NULL,
    Periodo VARCHAR(20) NOT NULL,
    FechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE PrediccionRiesgos (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdOrden INT NOT NULL,
    NivelRiesgo VARCHAR(10) NOT NULL CHECK (NivelRiesgo IN ('Bajo','Medio','Alto')),
    PuntajeRiesgo DECIMAL(5,2) DEFAULT 0,
    VariablesAnalizadas TEXT,
    AlertaGenerada BOOLEAN DEFAULT FALSE,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdOrden) REFERENCES Ordenes(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE FamiliaMiembros (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdUsuarioFamiliaPrincipal INT NOT NULL,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(180),
    Telefono VARCHAR(20),
    Rol VARCHAR(20) DEFAULT 'Observador' CHECK (Rol IN ('Administrador','Observador')),
    Activo BOOLEAN DEFAULT TRUE,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdUsuarioFamiliaPrincipal) REFERENCES Usuarios(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE NivelesReputacion (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE,
    PuntajeMinimo INT NOT NULL,
    PuntajeMaximo INT NOT NULL,
    Color VARCHAR(20),
    Orden INT DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE ReputacionCuidadora (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidadora INT NOT NULL UNIQUE,
    PuntajeTotal INT DEFAULT 0,
    IdNivelActual INT,
    ServiciosCompletados INT DEFAULT 0,
    Recontrataciones INT DEFAULT 0,
    PuntualidadPromedio DECIMAL(5,2) DEFAULT 0,
    FechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id) ON DELETE CASCADE,
    FOREIGN KEY (IdNivelActual) REFERENCES NivelesReputacion(Id)
) ENGINE=InnoDB;

CREATE TABLE HistorialReputacion (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidadora INT NOT NULL,
    PuntajeAnterior INT NOT NULL,
    PuntajeNuevo INT NOT NULL,
    Concepto VARCHAR(255) NOT NULL,
    IdReferencia INT,
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdCuidadora) REFERENCES Cuidadoras(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- MIGRACIONES DE COLUMNAS
-- ============================================================
ALTER TABLE Ordenes ADD COLUMN CheckInLatitud DECIMAL(10,7) AFTER FechaFinalizacion;
ALTER TABLE Ordenes ADD COLUMN CheckInLongitud DECIMAL(10,7) AFTER CheckInLatitud;
ALTER TABLE Ordenes ADD COLUMN CheckOutLatitud DECIMAL(10,7) AFTER CheckInLongitud;
ALTER TABLE Ordenes ADD COLUMN CheckOutLongitud DECIMAL(10,7) AFTER CheckOutLatitud;
ALTER TABLE Contratos ADD COLUMN PdfUrl VARCHAR(500) AFTER Terminos;
ALTER TABLE Contratos ADD COLUMN HashCriptografico VARCHAR(255) AFTER PdfUrl;

-- ============================================================
-- DATOS INICIALES ADICIONALES
-- ============================================================

INSERT INTO NivelesReputacion (Nombre, PuntajeMinimo, PuntajeMaximo, Color, Orden) VALUES
('Bronce', 0, 199, '#CD7F32', 1),
('Plata', 200, 399, '#C0C0C0', 2),
('Oro', 400, 599, '#FFD700', 3),
('Platino', 600, 799, '#E5E4E2', 4),
('Élite', 800, 9999, '#F6A5C0', 5);

INSERT INTO Capacitaciones (Titulo, Descripcion, TipoContenido, DuracionMinutos, Categoria) VALUES
('Introducción al Cuidado de Niños con TEA', 'Aprende las bases del Trastorno del Espectro Autista y estrategias de cuidado diario.', 'Video', 45, 'TEA'),
('Manejo de Crisis Conductuales', 'Técnicas probadas para manejar crisis sensoriales y conductuales en niños neurodivergentes.', 'Video', 60, 'Conductual'),
('Primeros Auxilios Pediátricos Avanzados', 'Protocolos completos de RCP, atragantamiento y emergencias pediátricas comunes.', 'Video', 90, 'Salud'),
('Estimulación Temprana en Casa', 'Actividades prácticas de estimulación sensorial, motriz y cognitiva para hacer en el hogar.', 'Manual', 120, 'Estimulación'),
('Comunicación con Familias', 'Habilidades de comunicación efectiva y reportes profesionales para familias.', 'CasoPractico', 45, 'Profesional');
