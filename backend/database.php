<?php
// backend/database.php

function env_file($key, $default = null) {
  static $loaded = false;
  static $vars = [];
  if (!$loaded) {
    $path = __DIR__ . '/.env';
    if (file_exists($path)) {
      $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
      foreach ($lines as $line) {
        if (strpos(ltrim($line), '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
          $k = trim($parts[0]);
          $v = trim($parts[1]);
          $vars[$k] = $v;
        }
      }
    }
    $loaded = true;
  }
  return $vars[$key] ?? $default;
}

function get_db() {
  // Prefer real environment variables first (e.g., set in Hostinger panel),
  // then fallback to .env file, then to local defaults.
  $host = getenv('DB_HOST') ?: env_file('DB_HOST', '127.0.0.1');
  $port = getenv('DB_PORT') ?: env_file('DB_PORT', '3306');
  $name = getenv('DB_NAME') ?: env_file('DB_NAME', 'oggames2');
  $user = getenv('DB_USER') ?: env_file('DB_USER', 'root');
  $pass = getenv('DB_PASS') ?: env_file('DB_PASS', '');
  $charset = 'utf8mb4';

  $dsn = "mysql:host={$host};port={$port};dbname={$name};charset={$charset}";
  $options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
  ];
  return new PDO($dsn, $user, $pass, $options);
}
