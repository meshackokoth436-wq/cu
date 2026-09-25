-- TECUMP / TUMCU security schema consistency repair
-- MySQL-compatible and safe to run against an existing database.

SET NAMES utf8mb4;

-- Add failed_login_attempts when it does not already exist

SET @column_exists = (
SELECT COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'users'
AND COLUMN_NAME = 'failed_login_attempts'
);

SET @sql = IF(
@column_exists = 0,
'ALTER TABLE users ADD COLUMN failed_login_attempts SMALLINT NOT NULL DEFAULT 0 AFTER last_login_at',
'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add locked_until when it does not already exist

SET @column_exists = (
SELECT COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'users'
AND COLUMN_NAME = 'locked_until'
);

SET @sql = IF(
@column_exists = 0,
'ALTER TABLE users ADD COLUMN locked_until DATETIME NULL AFTER failed_login_attempts',
'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add password_changed_at when it does not already exist

SET @column_exists = (
SELECT COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'users'
AND COLUMN_NAME = 'password_changed_at'
);

SET @sql = IF(
@column_exists = 0,
'ALTER TABLE users ADD COLUMN password_changed_at DATETIME NULL AFTER locked_until',
'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add locked_until index when it does not already exist

SET @index_exists = (
SELECT COUNT(*)
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'users'
AND INDEX_NAME = 'idx_users_locked_until'
);

SET @sql = IF(
@index_exists = 0,
'CREATE INDEX idx_users_locked_until ON users (locked_until)',
'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create security_events table if it does not already exist

CREATE TABLE IF NOT EXISTS security_events (
id CHAR(36) NOT NULL PRIMARY KEY,
user_id CHAR(36) NULL,
event_type VARCHAR(50) NOT NULL,
ip_address VARCHAR(45) NULL,
user_agent VARCHAR(255) NULL,
metadata JSON NULL,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT fk_secevt_user_v4
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE SET NULL,

INDEX idx_secevt_user (user_id),
INDEX idx_secevt_type_created (event_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
