<?php
// backend/api/login.php
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
  if (!$input || !isset($input['name']) || !isset($input['roll_number'])) {
    http_response_code(400);
    echo json_encode([ 'message' => 'Invalid payload' ]);
    exit;
  }

  $name = trim($input['name']);
  $roll = trim($input['roll_number']);
  if ($name === '' || $roll === '') {
    http_response_code(422);
    echo json_encode([ 'message' => 'Both name and roll_number are required' ]);
    exit;
  }

  $pdo = get_db();

  // Make sure table exists (in case register wasn't called before)
  $pdo->exec("CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(255) NOT NULL,
    school_name VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_user (name, roll_number, school_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

  // Try to find user
  $stmt = $pdo->prepare('SELECT id, name, roll_number, school_name FROM users WHERE name = :name AND roll_number = :roll LIMIT 1');
  $stmt->execute([':name' => $name, ':roll' => $roll]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$user) {
    http_response_code(404);
    echo json_encode([ 'message' => 'User not found. Please register first.' ]);
    exit;
  }

  echo json_encode([
    'userId' => (int)$user['id'],
    'name' => $user['name'],
    'roll_number' => $user['roll_number'],
    'school_name' => $user['school_name']
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([ 'message' => 'Server error', 'error' => $e->getMessage() ]);
}
