<?php
// backend/database.php

function env($key, $default = null) {
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
  $host = env('DB_HOST', '127.0.0.1');
  $port = env('DB_PORT', '3306');
  $name = env('DB_NAME', 'oggames2');
  $user = env('DB_USER', 'root');
  $pass = env('DB_PASS', '');
  $charset = 'utf8mb4';

  $dsn = "mysql:host={$host};port={$port};dbname={$name};charset={$charset}";
  $options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
  ];
  return new PDO($dsn, $user, $pass, $options);
}
