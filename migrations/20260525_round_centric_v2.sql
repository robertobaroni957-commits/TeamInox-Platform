-- InoxTeam Platform: Round-Centric Architectural Refactor
-- Date: 2026-05-25

-- 1. Create Seasons (Statistical Grouping)
CREATE TABLE IF NOT EXISTS seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

-- 2. Create Rounds (Aggregate Root)
CREATE TABLE IF NOT EXISTS rounds_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wtrl_id INTEGER UNIQUE NOT NULL,
    season_code TEXT,
    round_number INTEGER,
    name TEXT NOT NULL,
    starts_at TEXT,
    ends_at TEXT,
    sync_state TEXT DEFAULT 'PENDING',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (season_code) REFERENCES seasons(code)
);

-- 3. Event Sourcing for Rounds
CREATE TABLE IF NOT EXISTS round_action_log (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    round_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    payload TEXT,
    import_id TEXT,
    sequence_number INTEGER,
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Migrate Existing Seasons
INSERT OR IGNORE INTO seasons (code, name)
SELECT 
    LOWER(REPLACE(name, ' ', '_')) as code,
    name
FROM zrl_seasons;

-- 5. Cleanup Old Lifecycle Tables (Optional, keeping for safety)
-- DROP TABLE IF EXISTS season_lifecycle_status;

-- 6. Add Season Code to Teams
ALTER TABLE teams ADD COLUMN season_code TEXT;

-- 7. Add Round ID to relevant operational tables if missing
-- (Most already have round_id, but ensure they point to rounds_v2 in the future)

-- Indices
CREATE INDEX IF NOT EXISTS idx_rounds_v2_season ON rounds_v2(season_code);
CREATE INDEX IF NOT EXISTS idx_rounds_v2_wtrl ON rounds_v2(wtrl_id);
CREATE INDEX IF NOT EXISTS idx_round_action_log_round ON round_action_log(round_id);
