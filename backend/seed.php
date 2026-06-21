<?php
/**
 * CertiNanas - Seed Script
 * Ejecutar en Render: php backend/seed.php
 * Crea cuentas de prueba con contraseñas en texto plano (hasheadas con bcrypt)
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers/Database.php';

echo "=== CertiNanas Seed ===\n\n";

try {
    $db = Database::getConnection();

    // Verificar si ya hay datos
    $count = Database::fetchOne('SELECT COUNT(*) as total FROM Usuarios');
    if ($count && $count->total > 1) {
        echo "ℹ️  Ya existen {$count->total} usuarios. Omitiendo seed.\n";
        echo "   Para resetear, ejecuta el init.sql primero.\n";
        exit;
    }

    echo "Creando cuentas de prueba...\n";

    // Hash para contraseñas
    $hash = password_hash('password', PASSWORD_BCRYPT);
    $hash123 = password_hash('test123', PASSWORD_BCRYPT);

    // Admin
    $db->exec("
        INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, IdRol, EmailConfirmado, TerminosAceptados, Activo)
        VALUES ('admin@certinanas.pe', '$hash', 'Admin', 'CertiNanas', 1, TRUE, TRUE, TRUE)
    ");
    echo "  ✅ admin@certinanas.pe / password\n";

    // Familia
    $db->exec("
        INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, Telefono, Direccion, Ciudad, Distrito, IdRol, EmailConfirmado, TerminosAceptados, Activo)
        VALUES ('familia@certinanas.pe', '$hash', 'María', 'Pérez López', '999888777', 'Av. Principal 123', 'Lima', 'Miraflores', 2, TRUE, TRUE, TRUE)
    ");
    echo "  ✅ familia@certinanas.pe / password\n";

    $db->exec("INSERT INTO Menores (IdUsuarioFamilia, Nombre, Diagnostico, FechaNacimiento) VALUES (2, 'Mateo Pérez', 'TEA', '2019-05-12')");
    $db->exec("INSERT INTO Menores (IdUsuarioFamilia, Nombre, Diagnostico, FechaNacimiento) VALUES (2, 'Valentina Pérez', 'TDAH', '2021-08-20')");

    // Cuidadora activa
    $db->exec("
        INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, Telefono, NumeroDocumento, IdRol, EmailConfirmado, TerminosAceptados, Activo)
        VALUES ('cuidadora@certinanas.pe', '$hash', 'Carmen', 'Rodríguez García', '987654321', '12345678', 3, TRUE, TRUE, TRUE)
    ");
    echo "  ✅ cuidadora@certinanas.pe / password\n";

    $db->exec("
        INSERT INTO Cuidadoras (IdUsuario, AniosExperiencia, TarifaHora, DescripcionCorta, DescripcionLarga, CalificacionPromedio, TotalResenas, Disponible, Zona)
        VALUES (3, 8, 30.00, 'Terapeuta ocupacional enfocada en autonomía y estimulación sensorial.',
                'Con 8 años de experiencia como terapeuta ocupacional, he desarrollado programas de estimulación sensorial y motriz para niños dentro del espectro autista y con discapacidades motoras.',
                4.8, 15, TRUE, 'Lima Moderna')
    ");
    $db->exec("INSERT INTO CuidadoraEspecialidades (IdCuidadora, IdEspecialidad) VALUES (1, 1)");
    $db->exec("INSERT INTO CuidadoraEspecialidades (IdCuidadora, IdEspecialidad) VALUES (1, 5)");
    $db->exec("INSERT INTO CuidadoraAreas (IdCuidadora, IdArea) VALUES (1, 1)");
    $db->exec("INSERT INTO CuidadoraAreas (IdCuidadora, IdArea) VALUES (1, 3)");
    $db->exec("INSERT INTO CuidadoraFormacion (IdCuidadora, Titulo, Institucion, AnioObtencion, Orden) VALUES (1, 'Tecnología Médica en Terapia Ocupacional', 'UPCH', 2015, 1)");
    $db->exec("INSERT INTO CuidadoraFormacion (IdCuidadora, Titulo, Institucion, AnioObtencion, Orden) VALUES (1, 'Especialización en Integración Sensorial', 'PUCP', 2018, 2)");
    $db->exec("INSERT INTO CuidadoraCertificaciones (IdCuidadora, Nombre, EntidadEmisora, FechaObtencion, Orden) VALUES (1, 'Estimulación Temprana Avanzada', 'MIMP', '2022-03-10', 1)");
    $db->exec("INSERT INTO CuidadoraCertificaciones (IdCuidadora, Nombre, EntidadEmisora, FechaObtencion, Orden) VALUES (1, 'Soporte Vital Básico Pediátrico', 'Cruz Roja', '2023-06-15', 2)");

    // Cuidadora pendiente
    $db->exec("
        INSERT INTO Usuarios (Email, PasswordHash, Nombres, Apellidos, Telefono, NumeroDocumento, IdRol, EmailConfirmado, TerminosAceptados, Activo)
        VALUES ('cuidadora2@certinanas.pe', '$hash123', 'Ana', 'Torres Mendoza', '987654322', '87654321', 3, TRUE, TRUE, FALSE)
    ");
    echo "  ✅ cuidadora2@certinanas.pe / test123\n";

    $db->exec("INSERT INTO Cuidadoras (IdUsuario, AniosExperiencia, TarifaHora, DescripcionCorta, Disponible, Zona) VALUES (4, 2, 25.00, 'Joven pedagoga con enfoque lúdico.', FALSE, 'Lima Norte')");
    $db->exec("INSERT INTO Postulaciones (IdUsuario, Estado) VALUES (4, 'Pendiente')");

    echo "\n✅ Seed completado exitosamente.\n";
    echo "   Admin:     admin@certinanas.pe / password\n";
    echo "   Familia:   familia@certinanas.pe / password\n";
    echo "   Cuidadora: cuidadora@certinanas.pe / password\n";
    echo "   Pendiente: cuidadora2@certinanas.pe / test123\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
