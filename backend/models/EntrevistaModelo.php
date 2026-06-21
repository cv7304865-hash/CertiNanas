<?php
require_once __DIR__ . '/../helpers/Database.php';

class EntrevistaModelo
{
    public function crear(array $data): int
    {
        return Database::insert('Citas', [
            'IdCuidadora'    => $data['id_cuidadora'],
            'IdUsuarioFamilia'=> $data['id_familia'],
            'FechaCita'      => $data['fecha_hora'],
            'HoraCita'       => $data['hora'] ?? '10:00',
            'DuracionMinutos'=> 15,
            'Modalidad'      => $data['plataforma'] ?? 'google-meet',
            'Estado'         => $data['estado'] ?? 'Programada',
        ]);
    }

    public function buscar(int $id): ?object
    {
        return Database::fetchOne('SELECT c.*, u.Email as email_admin FROM Citas c LEFT JOIN Usuarios u ON u.Rol = "admin" WHERE c.Id = ?', [$id]);
    }

    public function actualizar(int $id, array $data): void
    {
        $map = [
            'id_familia'      => 'IdUsuarioFamilia',
            'id_cuidadora'    => 'IdCuidadora',
            'fecha_hora'      => 'FechaCita',
            'url_reunion'     => 'Modalidad',
            'email_admin'     => null,
            'estado'          => 'Estado',
            'admin_ingreso_at'=> 'FechaModificacion',
            'escrow_bloqueado'=> null,
            'evaluacion_habilitada' => null,
            'justificacion'   => null,
        ];
        $updates = [];
        foreach ($data as $key => $value) {
            if (isset($map[$key]) && $map[$key] !== null) {
                $updates[$map[$key]] = $value;
            }
        }
        if (!empty($updates)) {
            Database::update('Citas', $updates, 'Id = ?', [$id]);
        }
    }

    public function listarHoyYProximas(): array
    {
        return Database::fetchAll("
            SELECT c.*, u.Nombres, u.Apellidos, u.Email
            FROM Citas c
            JOIN Usuarios u ON c.IdUsuarioFamilia = u.Id
            WHERE c.FechaCita >= CURDATE()
            ORDER BY c.FechaCita ASC, c.HoraCita ASC
        ");
    }

    public function programadasSinAdmin(): array
    {
        return Database::fetchAll("
            SELECT c.* FROM Citas c
            WHERE c.Estado = 'Programada' AND c.FechaCita <= CURDATE()
        ");
    }
}

class UsuarioModelo
{
    public function buscarPorId(int $id): ?object
    {
        return Database::fetchOne('SELECT * FROM Usuarios WHERE Id = ?', [$id]);
    }

    public function emailAdminActivo(): ?string
    {
        $admin = Database::fetchOne("SELECT Email FROM Usuarios u JOIN Roles r ON u.IdRol = r.Id WHERE r.Nombre = 'admin' AND u.Activo = 1 LIMIT 1");
        return $admin ? $admin->Email : null;
    }
}

class VideoApiService
{
    public function crearSala(array $config): object
    {
        $ts = time();
        $room = 'certinanas-' . dechex($ts) . '-' . substr(bin2hex(random_bytes(4)), 0, 6);
        $emails = array_map(fn($p) => $p['email'], $config['participantes']);
        $invite = urlencode(implode(',', $emails));
        $moderator = '';
        foreach ($config['participantes'] as $p) {
            if ($p['rol'] === 'moderator') {
                $moderator = '&moderator=' . urlencode($p['email']);
                break;
            }
        }
        $url = "https://meet.jit.si/{$room}?invitees={$invite}{$moderator}";
        return (object) ['url' => $url];
    }
}

class IncidenciaModelo
{
    public function registrar(array $data): int
    {
        return Database::insert('Incidencias', [
            'IdCita'      => $data['id_entrevista'] ?? null,
            'Tipo'        => $data['tipo'] ?? 'SUPERVISION_OMITIDA',
            'Estado'      => 'Abierta',
            'Descripcion' => $data['mensaje'] ?? '',
        ]);
    }
}

class EscrowService
{
    public function bloquearPorEntrevista(int $citaId): void
    {
        $cita = Database::fetchOne('SELECT * FROM Citas WHERE Id = ?', [$citaId]);
        if ($cita) {
            $cuidadora = Database::fetchOne('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?', [$cita->IdCuidadora]);
            if ($cuidadora) {
                $ordenes = Database::fetchAll(
                    'SELECT o.*, e.Id as EscrowId FROM Ordenes o JOIN Escrow e ON o.IdEscrow = e.Id WHERE o.IdCuidadora = ? AND o.FechaServicio = ? AND e.Estado = ?',
                    [$cuidadora->Id, $cita->FechaCita, 'Retenido']
                );
                foreach ($ordenes as $o) {
                    Database::update('Escrow', ['Estado' => 'Bloqueado'], 'Id = ?', [$o->EscrowId]);
                }
            }
        }
    }

    public function desbloquearPorEntrevista(int $citaId): void
    {
        $cita = Database::fetchOne('SELECT * FROM Citas WHERE Id = ?', [$citaId]);
        if ($cita) {
            $cuidadora = Database::fetchOne('SELECT Id FROM Cuidadoras WHERE IdUsuario = ?', [$cita->IdCuidadora]);
            if ($cuidadora) {
                $ordenes = Database::fetchAll(
                    'SELECT o.*, e.Id as EscrowId FROM Ordenes o JOIN Escrow e ON o.IdEscrow = e.Id WHERE o.IdCuidadora = ? AND o.FechaServicio = ? AND e.Estado = ?',
                    [$cuidadora->Id, $cita->FechaCita, 'Bloqueado']
                );
                foreach ($ordenes as $o) {
                    Database::update('Escrow', ['Estado' => 'Retenido'], 'Id = ?', [$o->EscrowId]);
                }
            }
        }
    }
}
