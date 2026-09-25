-- TECUMP / TUMCU event schema repair
-- MySQL-compatible repair migration.
-- Does not use ADD COLUMN IF NOT EXISTS or CREATE INDEX IF NOT EXISTS.

SET NAMES utf8mb4;

---

-- Add events.status only when it does not already exist

---

SET @column_exists := (
SELECT COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'events'
AND COLUMN_NAME = 'status'
);

SET @sql := IF(
@column_exists = 0,
'ALTER TABLE events ADD COLUMN status ENUM(''draft'',''budgeted'',''approved'',''registration_open'',''ongoing'',''completed'',''archived'') NOT NULL DEFAULT ''draft'' AFTER organized_by',
'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

---

-- Add events.capacity only when it does not already exist

---

SET @column_exists := (
SELECT COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'events'
AND COLUMN_NAME = 'capacity'
);

SET @sql := IF(
@column_exists = 0,
'ALTER TABLE events ADD COLUMN capacity INT NULL AFTER status',
'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

---

-- Add events.registration_deadline only when it does not already exist

---

SET @column_exists := (
SELECT COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'events'
AND COLUMN_NAME = 'registration_deadline'
);

SET @sql := IF(
@column_exists = 0,
'ALTER TABLE events ADD COLUMN registration_deadline DATETIME NULL AFTER capacity',
'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

---

-- Add indexes only when they do not already exist

---

SET @index_exists := (
SELECT COUNT(*)
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'events'
AND INDEX_NAME = 'idx_events_public_schedule'
);

SET @sql := IF(
@index_exists = 0,
'CREATE INDEX idx_events_public_schedule ON events (status, start_at)',
'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists := (
SELECT COUNT(*)
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'events'
AND INDEX_NAME = 'idx_events_location_date'
);

SET @sql := IF(
@index_exists = 0,
'CREATE INDEX idx_events_location_date ON events (location, start_at)',
'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
