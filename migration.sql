-- ZRL SEASONS
ALTER TABLE zrl_seasons ADD COLUMN status TEXT;
ALTER TABLE zrl_seasons ADD COLUMN scoring_type TEXT DEFAULT 'points';
ALTER TABLE zrl_seasons ADD COLUMN start_date DATETIME;
ALTER TABLE zrl_seasons ADD COLUMN end_date DATETIME;

-- RACES / SERIES
ALTER TABLE zrl_races ADD COLUMN series_id INTEGER;

-- ROUNDS
-- SAFE CHECK PATTERN (D1 workaround)
-- skip if already exists (manual control required)

-- rounds
-- rounds (safe incremental approach)


-- raw_json already exists in DB → SKIPPED


-- TEAMS


-- RACE LINEUP


-- TEAM MEMBERS






-- AI / EVENTS TABLES
CREATE TABLE IF NOT EXISTS zrl_outbox_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT,
  payload TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME
);

CREATE TABLE IF NOT EXISTS zrl_ai_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round_id INTEGER,
  team_id INTEGER,
  report_type TEXT,
  content TEXT,
  model TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  hash TEXT UNIQUE
);