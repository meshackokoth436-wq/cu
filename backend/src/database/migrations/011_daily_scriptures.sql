-- ============================================================================
-- 011 — Daily Scripture Rotation
-- Five database-managed scriptures rotate one per day in a deterministic
-- five-day cycle. No scripture content is bundled in frontend source files.
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_scriptures (
    id           CHAR(36)     NOT NULL PRIMARY KEY,
    day_slot     TINYINT      NOT NULL,
    reference    VARCHAR(120) NOT NULL,
    text         TEXT         NOT NULL,
    theme        VARCHAR(120) NULL,
    reflection   TEXT         NULL,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_by   CHAR(36)     NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_daily_scriptures_slot UNIQUE (day_slot),
    CONSTRAINT fk_daily_scriptures_creator
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_daily_scriptures_slot CHECK (day_slot BETWEEN 1 AND 5),
    INDEX idx_daily_scriptures_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
