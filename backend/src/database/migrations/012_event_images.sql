-- TECUMP 012 — Event cover images
-- Stores the administrator-selected cover image used by the public events page and homepage.

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL AFTER location;

CREATE INDEX IF NOT EXISTS idx_events_image_schedule
  ON events (start_at, image_url);
