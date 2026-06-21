<?php
require_once __DIR__ . '/../helpers/Database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class SearchController
{
    public function buscarCuidadoras(): void
    {
        $user = AuthMiddleware::authenticate();

        $especialidad = $_GET['especialidad'] ?? '';
        $experiencia  = $_GET['experiencia'] ?? '';
        $area         = $_GET['area'] ?? '';
        $zona         = $_GET['zona'] ?? '';
        $query        = trim($_GET['q'] ?? '');

        $sql = "
            SELECT DISTINCT
                c.Id, c.IdUsuario, c.AniosExperiencia, c.TarifaHora,
                c.CalificacionPromedio, c.TotalResenas, c.DescripcionCorta,
                u.Nombres, u.Apellidos, u.Email, u.FotoPerfil,
                GROUP_CONCAT(DISTINCT e.Nombre SEPARATOR ', ') as Especialidades,
                GROUP_CONCAT(DISTINCT a.Nombre SEPARATOR ', ') as Areas
            FROM Cuidadoras c
            JOIN Usuarios u ON c.IdUsuario = u.Id
            LEFT JOIN CuidadoraEspecialidades ce ON c.Id = ce.IdCuidadora
            LEFT JOIN Especialidades e ON ce.IdEspecialidad = e.Id
            LEFT JOIN CuidadoraAreas ca ON c.Id = ca.IdCuidadora
            LEFT JOIN Areas a ON ca.IdArea = a.Id
            WHERE u.Activo = 1 AND c.Disponible = 1
        ";

        $params = [];

        if ($especialidad) {
            $sql .= " AND e.Nombre = ?";
            $params[] = $especialidad;
        }

        if ($area) {
            $sql .= " AND a.Nombre = ?";
            $params[] = $area;
        }

        if ($zona) {
            $sql .= " AND c.Zona LIKE ?";
            $params[] = "%{$zona}%";
        }

        if ($query) {
            $sql .= " AND (u.Nombres LIKE ? OR u.Apellidos LIKE ? OR e.Nombre LIKE ?)";
            $params[] = "%{$query}%";
            $params[] = "%{$query}%";
            $params[] = "%{$query}%";
        }

        $sql .= " GROUP BY c.Id";

        if ($experiencia) {
            $parts = explode('-', $experiencia);
            if (count($parts) === 2) {
                $sql .= " HAVING c.AniosExperiencia BETWEEN ? AND ?";
                $params[] = (int) $parts[0];
                $params[] = (int) $parts[1];
            } elseif ($experiencia === '5+') {
                $sql .= " HAVING c.AniosExperiencia >= 5";
            }
        }

        $sql .= " ORDER BY c.CalificacionPromedio DESC, c.TotalResenas DESC";

        $cuidadoras = Database::fetchAll($sql, $params);
        Response::success($cuidadoras);
    }

    public function getPerfilCompleto(int $id): void
    {
        $user = AuthMiddleware::authenticate();

        $cuidadora = Database::fetchOne('
            SELECT c.*, u.Nombres, u.Apellidos, u.Email, u.FotoPerfil, u.Telefono
            FROM Cuidadoras c JOIN Usuarios u ON c.IdUsuario = u.Id WHERE c.Id = ?
        ', [$id]);

        if (!$cuidadora) {
            Response::notFound('Cuidadora no encontrada');
        }

        $especialidades = Database::fetchAll('
            SELECT e.Nombre, e.Descripcion FROM CuidadoraEspecialidades ce
            JOIN Especialidades e ON ce.IdEspecialidad = e.Id WHERE ce.IdCuidadora = ?
        ', [$id]);

        $areas = Database::fetchAll('
            SELECT a.Nombre FROM CuidadoraAreas ca
            JOIN Areas a ON ca.IdArea = a.Id WHERE ca.IdCuidadora = ?
        ', [$id]);

        $formacion = Database::fetchAll('
            SELECT Titulo, Institucion, AnioObtencion FROM CuidadoraFormacion WHERE IdCuidadora = ? ORDER BY Orden ASC
        ', [$id]);

        $certificaciones = Database::fetchAll('
            SELECT Nombre, EntidadEmisora, FechaObtencion, FechaVencimiento FROM CuidadoraCertificaciones WHERE IdCuidadora = ? ORDER BY Orden ASC
        ', [$id]);

        $resenas = Database::fetchAll('
            SELECT r.Calificacion, r.Comentario, r.FechaResena as Fecha,
                   u.Nombres || " " || u.Apellidos as Autor
            FROM Resenas r JOIN Usuarios u ON r.IdUsuarioFamilia = u.Id
            WHERE r.IdCuidadora = ? AND r.Visible = 1 ORDER BY r.FechaCreacion DESC
        ', [$id]);

        Response::success([
            'cuidadora' => [
                'Id'                => $cuidadora->Id,
                'Nombres'           => $cuidadora->Nombres,
                'Apellidos'         => $cuidadora->Apellidos,
                'Email'             => $cuidadora->Email,
                'FotoPerfil'        => $cuidadora->FotoPerfil,
                'Telefono'          => $cuidadora->Telefono,
                'AniosExperiencia'  => $cuidadora->AniosExperiencia,
                'TarifaHora'        => $cuidadora->TarifaHora,
                'DescripcionCorta'  => $cuidadora->DescripcionCorta,
                'DescripcionLarga'  => $cuidadora->DescripcionLarga,
                'CalificacionPromedio' => $cuidadora->CalificacionPromedio,
                'TotalResenas'      => $cuidadora->TotalResenas,
                'Zona'              => $cuidadora->Zona,
                'Disponible'        => $cuidadora->Disponible,
            ],
            'especialidades' => $especialidades,
            'areas'          => array_map(fn($a) => $a->Nombre, $areas),
            'formacion'      => $formacion,
            'certificaciones'=> $certificaciones,
            'resenas'        => $resenas,
        ]);
    }

    public function getCasosExito(): void
    {
        $casos = Database::fetchAll('
            SELECT cs.*, u.Nombres, u.Apellidos
            FROM Casos cs JOIN Usuarios u ON cs.IdUsuarioReporta = u.Id
            WHERE cs.Tipo = "Exito" ORDER BY cs.FechaCreacion DESC
        ');
        Response::success($casos);
    }
}
