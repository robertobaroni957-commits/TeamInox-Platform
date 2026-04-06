-- SQL Migration for Round Management System
-- Date: 2026-04-06

-- 1. Ensure series table is robust
CREATE TABLE IF NOT EXISTS series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    external_season_id INTEGER,
    scoring_type TEXT DEFAULT 'points',
    is_active BOOLEAN DEFAULT 0,
    start_date DATETIME,
    end_date DATETIME
);

-- 2. Ensure rounds table is consistent with series_id
CREATE TABLE IF NOT EXISTS rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id INTEGER REFERENCES series(id),
    name TEXT NOT NULL,
    date DATETIME,
    world TEXT,
    route TEXT,
    zwift_event_id INTEGER,
    status TEXT DEFAULT 'planned' -- 'planned', 'active', 'completed'
);

-- 3. Table for team associations per round with timeslots
CREATE TABLE IF NOT EXISTS round_teams (
    round_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    timeslot_id TEXT REFERENCES league_times(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (round_id, team_id),
    FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- 4. Add index for performance
CREATE INDEX IF NOT EXISTS idx_round_teams_round ON round_teams(round_id);
CREATE INDEX IF NOT EXISTS idx_race_lineup_round ON race_lineup(round_id);
CREATE INDEX IF NOT EXISTS idx_availability_round ON availability(round_id);
