-- TECUMP / TUMCU Migration 005
-- MySQL-compatible schema repair.
-- IMPORTANT:
-- This migration deliberately does NOT use:
--   ADD COLUMN IF NOT EXISTS
--   CREATE INDEX IF NOT EXISTS
-------------------------------

-- Those forms are not supported by the MySQL version used by Railway.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. WEEKLY PROGRAMMES
-- ============================================================

SET @exists = (
SELECT COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'weekly_programmes'
AND COLUMN_NAME = 'day'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE weekly_programmes ADD COLUMN day VARCHAR(20) NOT NULL DEFAULT ''Sunday'' AFTER id',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'weekly_programmes'
AND COLUMN_NAME = 'title'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE weekly_programmes ADD COLUMN title VARCHAR(200) NOT NULL DEFAULT ''Fellowship Program'' AFTER day',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'weekly_programmes'
AND COLUMN_NAME = 'time'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE weekly_programmes ADD COLUMN time VARCHAR(100) NOT NULL DEFAULT ''5:00 PM - 7:00 PM'' AFTER programme_type',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'weekly_programmes'
AND COLUMN_NAME = 'leader'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE weekly_programmes ADD COLUMN leader VARCHAR(150) NULL AFTER venue',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'weekly_programmes'
AND COLUMN_NAME = 'description'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE weekly_programmes ADD COLUMN description TEXT NULL AFTER leader',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'weekly_programmes'
AND COLUMN_NAME = 'is_active'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE weekly_programmes ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER description',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'weekly_programmes'
AND COLUMN_NAME = 'display_order'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE weekly_programmes ADD COLUMN display_order SMALLINT NOT NULL DEFAULT 1 AFTER is_active',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'weekly_programmes'
AND COLUMN_NAME = 'alternating_mode'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE weekly_programmes ADD COLUMN alternating_mode ENUM(''none'',''monday_alternate'',''custom'') NOT NULL DEFAULT ''none'' AFTER display_order',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'weekly_programmes'
AND COLUMN_NAME = 'updated_at'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE weekly_programmes ADD COLUMN updated_at DATETIME NULL AFTER created_at',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- 2. MINISTRIES
-- ============================================================

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'ministries'
AND COLUMN_NAME = 'background_image_url'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE ministries ADD COLUMN background_image_url VARCHAR(500) NULL AFTER description',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'ministries'
AND COLUMN_NAME = 'photo_url'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE ministries ADD COLUMN photo_url VARCHAR(500) NULL AFTER background_image_url',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'ministries'
AND COLUMN_NAME = 'leader_id'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE ministries ADD COLUMN leader_id CHAR(36) NULL AFTER photo_url',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'ministries'
AND COLUMN_NAME = 'meeting_time'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE ministries ADD COLUMN meeting_time VARCHAR(100) NULL AFTER leader_id',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'ministries'
AND COLUMN_NAME = 'meeting_venue'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE ministries ADD COLUMN meeting_venue VARCHAR(200) NULL AFTER meeting_time',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'ministries'
AND COLUMN_NAME = 'updated_at'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE ministries ADD COLUMN updated_at DATETIME NULL',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- 3. LIBRARY RESOURCES
-- ============================================================

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_resources'
AND COLUMN_NAME = 'isbn'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_resources ADD COLUMN isbn VARCHAR(50) NULL AFTER category',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_resources'
AND COLUMN_NAME = 'description'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_resources ADD COLUMN description TEXT NULL AFTER isbn',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_resources'
AND COLUMN_NAME = 'cover_image_url'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_resources ADD COLUMN cover_image_url VARCHAR(500) NULL AFTER description',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_resources'
AND COLUMN_NAME = 'shelf_location'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_resources ADD COLUMN shelf_location VARCHAR(100) NULL AFTER cover_image_url',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_resources'
AND COLUMN_NAME = 'condition_status'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_resources ADD COLUMN condition_status ENUM(''excellent'',''good'',''fair'',''needs_repair'') NOT NULL DEFAULT ''good'' AFTER shelf_location',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_resources'
AND COLUMN_NAME = 'borrowed_count'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_resources ADD COLUMN borrowed_count INT NOT NULL DEFAULT 0 AFTER condition_status',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_resources'
AND COLUMN_NAME = 'librarian_notes'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_resources ADD COLUMN librarian_notes TEXT NULL AFTER borrowed_count',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_resources'
AND COLUMN_NAME = 'status'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_resources ADD COLUMN status ENUM(''available'',''maintenance'',''archived'') NOT NULL DEFAULT ''available'' AFTER librarian_notes',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_resources'
AND COLUMN_NAME = 'updated_at'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_resources ADD COLUMN updated_at DATETIME NULL',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- 4. LIBRARY BORROWINGS
-- ============================================================

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_borrowings'
AND COLUMN_NAME = 'status'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_borrowings ADD COLUMN status ENUM(''active'',''returned'',''overdue'') NOT NULL DEFAULT ''active'' AFTER overdue_notice_sent',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_borrowings'
AND COLUMN_NAME = 'notes'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_borrowings ADD COLUMN notes TEXT NULL AFTER status',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_borrowings'
AND COLUMN_NAME = 'issued_by'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_borrowings ADD COLUMN issued_by CHAR(36) NULL AFTER notes',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_borrowings'
AND COLUMN_NAME = 'returned_to'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_borrowings ADD COLUMN returned_to CHAR(36) NULL AFTER issued_by',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_borrowings'
AND COLUMN_NAME = 'created_at'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_borrowings ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_borrowings'
AND COLUMN_NAME = 'updated_at'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_borrowings ADD COLUMN updated_at DATETIME NULL',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- 5. LIBRARY RESERVATIONS
-- ============================================================

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_reservations'
AND COLUMN_NAME = 'needed_date'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_reservations ADD COLUMN needed_date DATE NULL AFTER status',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_reservations'
AND COLUMN_NAME = 'return_period_days'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_reservations ADD COLUMN return_period_days SMALLINT NOT NULL DEFAULT 14 AFTER needed_date',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_reservations'
AND COLUMN_NAME = 'notes'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_reservations ADD COLUMN notes TEXT NULL AFTER return_period_days',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_reservations'
AND COLUMN_NAME = 'approved_by'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_reservations ADD COLUMN approved_by CHAR(36) NULL AFTER notes',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_reservations'
AND COLUMN_NAME = 'approved_at'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_reservations ADD COLUMN approved_at DATETIME NULL AFTER approved_by',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_reservations'
AND COLUMN_NAME = 'rejected_reason'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_reservations ADD COLUMN rejected_reason VARCHAR(255) NULL AFTER approved_at',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'library_reservations'
AND COLUMN_NAME = 'updated_at'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE library_reservations ADD COLUMN updated_at DATETIME NULL',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- 6. LANDING MEDIA
-- ============================================================

CREATE TABLE IF NOT EXISTS landing_media_config (
id VARCHAR(50) NOT NULL PRIMARY KEY,
rotate_interval_ms INT NOT NULL DEFAULT 4000,
background_src VARCHAR(500) NOT NULL DEFAULT '/tum-gate-monument.jpg',
background_opacity DECIMAL(3,2) NOT NULL DEFAULT 0.80,
background_blur_px SMALLINT NOT NULL DEFAULT 1,
background_title VARCHAR(200) NOT NULL DEFAULT 'TUM Main Entrance Gate Monument',
last_updated_by VARCHAR(150) NOT NULL DEFAULT 'System Administrator',
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS landing_media_slides (
id VARCHAR(50) NOT NULL PRIMARY KEY,
src VARCHAR(500) NOT NULL,
caption VARCHAR(255) NOT NULL,
eyebrow VARCHAR(150) NOT NULL,
is_active BOOLEAN NOT NULL DEFAULT TRUE,
display_order SMALLINT NOT NULL DEFAULT 1,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS landing_media_gallery (
id VARCHAR(50) NOT NULL PRIMARY KEY,
src VARCHAR(500) NOT NULL,
alt VARCHAR(255) NOT NULL DEFAULT 'TUMCU Community',
caption VARCHAR(255) NULL,
span VARCHAR(50) NOT NULL DEFAULT 'standard',
display_order SMALLINT NOT NULL DEFAULT 1,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 7. GALLERY ALBUMS
-- ============================================================

CREATE TABLE IF NOT EXISTS gallery_albums (
id CHAR(36) NOT NULL PRIMARY KEY,
title VARCHAR(200) NOT NULL,
category ENUM(
'sunday_services',
'worship_services',
'prayer_meetings',
'conferences',
'retreats',
'evangelism',
'missions',
'fellowships',
'special_events',
'other'
) NOT NULL DEFAULT 'special_events',
event_type VARCHAR(100) NULL,
event_date DATE NOT NULL,
description TEXT NULL,
cover_image_url VARCHAR(500) NOT NULL,
google_photos_url VARCHAR(1000) NULL,
photo_count INT NOT NULL DEFAULT 0,
is_published BOOLEAN NOT NULL DEFAULT TRUE,
display_order SMALLINT NOT NULL DEFAULT 1,
created_by CHAR(36) NULL,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,

INDEX idx_gallery_published (is_published, event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 8. EVANGELISM TEAMS
-- ============================================================

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'evangelism_teams'
AND COLUMN_NAME = 'short_name'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE evangelism_teams ADD COLUMN short_name VARCHAR(50) NULL AFTER name',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'evangelism_teams'
AND COLUMN_NAME = 'region'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE evangelism_teams ADD COLUMN region VARCHAR(100) NULL AFTER short_name',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'evangelism_teams'
AND COLUMN_NAME = 'description'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE evangelism_teams ADD COLUMN description TEXT NULL AFTER region',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'evangelism_teams'
AND COLUMN_NAME = 'mission_purpose'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE evangelism_teams ADD COLUMN mission_purpose TEXT NULL AFTER description',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'evangelism_teams'
AND COLUMN_NAME = 'vision'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE evangelism_teams ADD COLUMN vision TEXT NULL AFTER mission_purpose',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'evangelism_teams'
AND COLUMN_NAME = 'scripture_theme'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE evangelism_teams ADD COLUMN scripture_theme VARCHAR(255) NULL AFTER vision',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'evangelism_teams'
AND COLUMN_NAME = 'cover_image_url'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE evangelism_teams ADD COLUMN cover_image_url VARCHAR(500) NULL AFTER scripture_theme',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'evangelism_teams'
AND COLUMN_NAME = 'logo_url'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE evangelism_teams ADD COLUMN logo_url VARCHAR(500) NULL AFTER cover_image_url',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'evangelism_teams'
AND COLUMN_NAME = 'meeting_schedule'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE evangelism_teams ADD COLUMN meeting_schedule VARCHAR(200) NULL AFTER logo_url',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'evangelism_teams'
AND COLUMN_NAME = 'meeting_venue'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE evangelism_teams ADD COLUMN meeting_venue VARCHAR(200) NULL AFTER meeting_schedule',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'evangelism_teams'
AND COLUMN_NAME = 'is_active'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE evangelism_teams ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER meeting_venue',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists = (
SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'evangelism_teams'
AND COLUMN_NAME = 'updated_at'
);

SET @sql = IF(
@exists = 0,
'ALTER TABLE evangelism_teams ADD COLUMN updated_at DATETIME NULL',
'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- 9. E-TEAM PROGRAMMES
-- ============================================================

CREATE TABLE IF NOT EXISTS eteam_programmes (
id CHAR(36) NOT NULL PRIMARY KEY,
team_id CHAR(36) NOT NULL,
title VARCHAR(200) NOT NULL,
activity_type ENUM(
'fellowship',
'prayer',
'evangelism',
'mission',
'discipleship',
'bible_study',
'training',
'bonding',
'outreach',
'followup',
'special'
) NOT NULL DEFAULT 'fellowship',
scheduled_date DATE NOT NULL,
time_slot VARCHAR(100) NOT NULL DEFAULT '5:00 PM - 7:00 PM',
venue VARCHAR(200) NOT NULL,
description TEXT NULL,
leader_name VARCHAR(150) NULL,
status ENUM(
'scheduled',
'completed',
'cancelled',
'postponed'
) NOT NULL DEFAULT 'scheduled',
cover_image_url VARCHAR(500) NULL,
created_by CHAR(36) NULL,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,

CONSTRAINT fk_ep_team
FOREIGN KEY (team_id)
REFERENCES evangelism_teams(id)
ON DELETE CASCADE,

INDEX idx_ep_team_date (team_id, scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 10. E-TEAM GALLERY
-- ============================================================

CREATE TABLE IF NOT EXISTS eteam_gallery (
id CHAR(36) NOT NULL PRIMARY KEY,
team_id CHAR(36) NOT NULL,
title VARCHAR(200) NOT NULL,
event_date DATE NOT NULL,
caption TEXT NULL,
image_url VARCHAR(500) NOT NULL,
google_photos_url VARCHAR(1000) NULL,
created_by CHAR(36) NULL,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT fk_eg_team
FOREIGN KEY (team_id)
REFERENCES evangelism_teams(id)
ON DELETE CASCADE,

INDEX idx_eg_team_date (team_id, event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 11. E-TEAM REPORTS
-- ============================================================

CREATE TABLE IF NOT EXISTS eteam_reports (
id CHAR(36) NOT NULL PRIMARY KEY,
team_id CHAR(36) NOT NULL,
title VARCHAR(200) NOT NULL,
activity_date DATE NOT NULL,
location VARCHAR(200) NOT NULL,
participants_count INT NOT NULL DEFAULT 0,
souls_reached INT NOT NULL DEFAULT 0,
outreach_type VARCHAR(100) NOT NULL,
summary TEXT NOT NULL,
outcomes TEXT NULL,
follow_up_notes TEXT NULL,
submitted_by CHAR(36) NOT NULL,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT fk_erpt_team
FOREIGN KEY (team_id)
REFERENCES evangelism_teams(id)
ON DELETE CASCADE,

INDEX idx_erpt_team (team_id, activity_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 12. E-TEAM ANNOUNCEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS eteam_announcements (
id CHAR(36) NOT NULL PRIMARY KEY,
team_id CHAR(36) NOT NULL,
title VARCHAR(200) NOT NULL,
content TEXT NOT NULL,
priority ENUM('normal','high','urgent') NOT NULL DEFAULT 'normal',
published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
expires_at DATETIME NULL,
created_by CHAR(36) NOT NULL,

CONSTRAINT fk_eann_team
FOREIGN KEY (team_id)
REFERENCES evangelism_teams(id)
ON DELETE CASCADE,

INDEX idx_eann_team (team_id, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
