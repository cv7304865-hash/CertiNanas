<?php
/**
 * CertiNanas - Router de Producción
 * Sirve archivos estáticos del frontend y enruta peticiones API al backend PHP.
 * Uso: php -S 0.0.0.0:10000 server.php
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/') ?: '/';

// 1. Si es petición API, redirigir al backend
if (str_starts_with($uri, '/api/') || str_starts_with($uri, '/entrevista/')) {
    require __DIR__ . '/backend/index.php';
    return true;
}

// 2. Archivos estáticos del build de Vite (producción)
$staticDir = __DIR__ . '/dist';
$filePath = $staticDir . $uri;

if ($uri !== '/' && file_exists($filePath) && !is_dir($filePath)) {
    $ext = pathinfo($filePath, PATHINFO_EXTENSION);
    $mimeTypes = [
        'js'   => 'application/javascript',
        'css'  => 'text/css',
        'html' => 'text/html',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'webp' => 'image/webp',
        'svg'  => 'image/svg+xml',
        'ico'  => 'image/x-icon',
        'json' => 'application/json',
        'woff' => 'font/woff',
        'woff2'=> 'font/woff2',
    ];
    if (isset($mimeTypes[$ext])) {
        header('Content-Type: ' . $mimeTypes[$ext]);
    }
    readfile($filePath);
    return true;
}

// 3. SPA: cualquier otra ruta -> index.html (para que React Router funcione)
$indexFile = $staticDir . '/index.html';
if (file_exists($indexFile)) {
    readfile($indexFile);
    return true;
}

// 4. Fallback: 404
http_response_code(404);
echo json_encode(['error' => 'Not found']);
