<?php
// backend/api/register.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

require_once __DIR__ . '/../database.php';

try {
  $input = json_decode(file_get_contents('php://input'), true);
  if (!$input || !isset($input['name']) || !isset($input['roll_number']) || !isset($input['school_name'])) {
    http_response_code(400);
    echo json_encode([ 'message' => 'Invalid payload' ]);
    exit;
  }

  $name = trim($input['name']);
  $roll = trim($input['roll_number']);
  $school = trim($input['school_name']);
  if ($name === '' || $roll === '' || $school === '') {
    http_response_code(422);
    echo json_encode([ 'message' => 'name, roll_number and school_name are required' ]);
    exit;
  }

  $pdo = get_db();

  // Ensure table exists with school_name and unique constraint
  $pdo->exec("CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(255) NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_user (name, roll_number, school_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

  // Try to add column if older schema exists
  try { $pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS school_name VARCHAR(255) NOT NULL DEFAULT ''"); } catch (Throwable $__) {}
  // Remove default and ensure not null for existing rows (optional best-effort)
  try { $pdo->exec("UPDATE users SET school_name = '' WHERE school_name IS NULL"); } catch (Throwable $__) {}

  // Check if user already exists
  $stmt = $pdo->prepare('SELECT id FROM users WHERE name = :name AND roll_number = :roll AND school_name = :school LIMIT 1');
  $stmt->execute([':name' => $name, ':roll' => $roll, ':school' => $school]);
  $existing = $stmt->fetch(PDO::FETCH_ASSOC);
  if ($existing) {
    http_response_code(409);
    echo json_encode([ 'message' => 'User already exists. Please log in.' ]);
    exit;
  }

  // Insert new user
  $ins = $pdo->prepare('INSERT INTO users (name, roll_number, school_name) VALUES (:name, :roll, :school)');
  $ins->execute([':name' => $name, ':roll' => $roll, ':school' => $school]);
  $id = $pdo->lastInsertId();

  http_response_code(201);
  echo json_encode([
    'userId' => (int)$id,
    'name' => $name,
    'roll_number' => $roll,
    'school_name' => $school,
    'created' => true
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([ 'message' => 'Server error', 'error' => $e->getMessage() ]);
}
