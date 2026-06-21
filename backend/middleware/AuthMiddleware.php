<?php
require_once __DIR__ . '/../helpers/Database.php';
require_once __DIR__ . '/../helpers/Response.php';

class AuthMiddleware
{
    public static function authenticate(): object
    {
        $userId = $_SERVER['HTTP_X_USER_ID'] ?? null;
        if (!$userId) {
            Response::unauthorized('Se requiere x-user-id en el header');
        }
        $user = Database::fetchOne(
            'SELECT u.*, r.Nombre as RolNombre FROM Usuarios u JOIN Roles r ON u.IdRol = r.Id WHERE u.Id = ? AND u.Activo = 1',
            [(int) $userId]
        );
        if (!$user) {
            Response::unauthorized('Usuario no encontrado o inactivo');
        }
        return $user;
    }

    public static function requireAdmin(): object
    {
        $user = self::authenticate();
        if ($user->RolNombre !== 'admin') {
            $adminHeader = $_SERVER['HTTP_X_ADMIN_USER'] ?? null;
            if (!$adminHeader) {
                Response::forbidden('Se requiere rol de administrador');
            }
            $admin = Database::fetchOne(
                'SELECT u.*, r.Nombre as RolNombre FROM Usuarios u JOIN Roles r ON u.IdRol = r.Id WHERE u.Id = ? AND u.Activo = 1 AND r.Nombre = ?',
                [(int) $adminHeader, 'admin']
            );
            if (!$admin) {
                Response::forbidden('Credenciales de administrador inválidas');
            }
            return $admin;
        }
        return $user;
    }

    public static function getUserFromToken(): ?object
    {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!preg_match('/^Bearer\s+(.+)$/', $authHeader, $matches)) {
            return null;
        }
        $token = $matches[1];
        $session = Database::fetchOne(
            'SELECT u.*, r.Nombre as RolNombre FROM Sesiones s JOIN Usuarios u ON s.IdUsuario = u.Id JOIN Roles r ON u.IdRol = r.Id WHERE s.Token = ? AND s.Activo = 1 AND s.FechaExpiracion > NOW()',
            [$token]
        );
        return $session ?: null;
    }
}
