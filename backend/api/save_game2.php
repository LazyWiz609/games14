<?php
// backend/api/save_game2.php
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
  if (!$input || !isset($input['session_id']) || !isset($input['player_name']) || !isset($input['timestamp'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid payload']);
    exit;
  }

  $session_id = trim($input['session_id']);
  $player_name = trim($input['player_name']);
  $roll_number = isset($input['roll_number']) ? trim($input['roll_number']) : '';
  $timestamp = trim($input['timestamp']); // ISO string

  $london = isset($input['london_score']) ? (int)$input['london_score'] : null;
  $maze = isset($input['maze_score']) ? (int)$input['maze_score'] : null;
  $plan = isset($input['plan_score']) ? (int)$input['plan_score'] : null;

  $pdo = get_db();

  // Ensure table exists
  $pdo->exec("CREATE TABLE IF NOT EXISTS game2_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    player_name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(255) NOT NULL DEFAULT '',
    session_timestamp DATETIME NOT NULL,
    london TINYINT NULL,
    maze TINYINT NULL,
    plan TINYINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_session (session_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

  // Upsert (MySQL)
  $stmt = $pdo->prepare("INSERT INTO game2_results (
      session_id, player_name, roll_number, session_timestamp, london, maze, plan
    ) VALUES (
      :session_id, :player_name, :roll_number, :session_timestamp, :london, :maze, :plan
    ) ON DUPLICATE KEY UPDATE
      player_name = VALUES(player_name),
      roll_number = VALUES(roll_number),
      session_timestamp = VALUES(session_timestamp),
      london = COALESCE(VALUES(london), london),
      maze = COALESCE(VALUES(maze), maze),
      plan = COALESCE(VALUES(plan), plan)");

  $stmt->execute([
    ':session_id' => $session_id,
    ':player_name' => $player_name,
    ':roll_number' => $roll_number,
    ':session_timestamp' => date('Y-m-d H:i:s', strtotime($timestamp)),
    ':london' => $london,
    ':maze' => $maze,
    ':plan' => $plan,
  ]);

  echo json_encode(['ok' => true]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
}
