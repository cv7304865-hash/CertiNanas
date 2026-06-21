<?php
class Response
{
    public static function json($data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success($data = null, string $message = 'OK'): void
    {
        self::json(['ok' => true, 'message' => $message, 'data' => $data]);
    }

    public static function error(string $message, int $status = 400, $errors = null): void
    {
        $resp = ['ok' => false, 'error' => $message];
        if ($errors !== null) {
            $resp['errors'] = $errors;
        }
        self::json($resp, $status);
    }

    public static function notFound(string $message = 'Recurso no encontrado'): void
    {
        self::error($message, 404);
    }

    public static function unauthorized(string $message = 'No autorizado'): void
    {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'Acceso denegado'): void
    {
        self::error($message, 403);
    }
}
