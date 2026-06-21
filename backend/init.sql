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

-- Admin por defecto (password: admin123)
INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, IdRol, EmailConfirmado, TerminosAceptados, Activo)
VALUES ('admin@certinanas.pe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'CertiNanas', 1, TRUE, TRUE, TRUE);
