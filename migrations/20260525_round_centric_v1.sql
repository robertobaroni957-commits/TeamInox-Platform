-- Phase 1: Round-Centric Refactor
-- Date: 2026-05-25

-- 1. Create the new seasons table (lightweight lookup)
CREATE TABLE IF NOT EXISTS seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

-- 2. Create the new rounds table (operational aggregate root)
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

-- 3. Migrate existing data from zrl_seasons to seasons
-- We use a simple slugification for the code
INSERT OR IGNORE INTO seasons (code, name)
SELECT 
    LOWER(REPLACE(name, ' ', '_')) as code,
    name
FROM zrl_seasons;

-- 4. Migrate existing data from rounds to rounds_v2 if possible
-- Note: wtrl_id is mandatory, so we use zwift_event_id as a temporary surrogate if wtrl_id is not yet available, 
-- or we expect a full sync to populate it.
-- Actually, the user says wtrl_id is the UNIQUE external identity.
-- If we don't have it, we might need to handle it during first sync.

-- 5. Create the round_action_log table for event sourcing
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

CREATE INDEX IF NOT EXISTS idx_round_action_log_round ON round_action_log(round_id);

-- For now, we keep the old tables for compatibility until Phase 2.
