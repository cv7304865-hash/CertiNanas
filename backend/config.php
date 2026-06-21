<?php
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'certinanas');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'certinanas_secret_key_2026');
define('JWT_EXPIRY', 86400 * 7);
define('COMMISSION_RATE', 0.15);
define('CORS_ORIGIN', getenv('CORS_ORIGIN') ?: '*');
