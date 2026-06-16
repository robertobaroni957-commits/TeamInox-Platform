-- MIGRATION: Fix Season Orchestration Schema (Final Corrected Version)
-- Description: Forces recreation of import tables to ensure season_id column exists.

PRAGMA foreign_keys = OFF;

-- 1. FIX season_lifecycle_status
DROP TABLE IF EXISTS season_lifecycle_status;
CREATE TABLE season_lifecycle_status (
    season_id INTEGER PRIMARY KEY,
    status TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. FIX zrl_sequence_tracker
DROP TABLE IF EXISTS zrl_sequence_tracker;
CREATE TABLE zrl_sequence_tracker (
    season_id INTEGER PRIMARY KEY,
    last_sequence_number INTEGER DEFAULT 0
);

-- 3. FIX season_action_log
DROP TABLE IF EXISTS season_action_log;
CREATE TABLE season_action_log (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    season_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    payload TEXT,
    import_id TEXT,
    sequence_number INTEGER,
    version INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. FIX teams (PK: wtrl_team_id, season_id)
-- Creiamo una tabella temporanea per non perdere i nomi dei team se esistono
CREATE TABLE IF NOT EXISTS teams_temp (wtrl_team_id INTEGER, name TEXT);
INSERT OR IGNORE INTO teams_temp (wtrl_team_id, name) SELECT wtrl_team_id, name FROM teams;

DROP TABLE IF EXISTS teams;
CREATE TABLE teams (
    wtrl_team_id INTEGER NOT NULL,
    season_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    division TEXT,
    division_number INTEGER,
    captain_id INTEGER,
    club_id TEXT,
    tttid INTEGER,
    club_name TEXT,
    gender TEXT,
    league TEXT,
    zrldivision TEXT,
    league_color TEXT,
    rec INTEGER,
    status INTEGER,
    is_dev INTEGER,
    rounds TEXT,
    member_count INTEGER,
    import_id TEXT,
    PRIMARY KEY (wtrl_team_id, season_id)
);

-- Ripopoliamo i team di base per la stagione 19
INSERT OR IGNORE INTO teams (wtrl_team_id, season_id, name)
SELECT wtrl_team_id, 19, name FROM teams_temp WHERE wtrl_team_id IS NOT NULL;
DROP TABLE IF EXISTS teams_temp;


-- 5. FIX team_members
DROP TABLE IF EXISTS team_members;
CREATE TABLE team_members (
    athlete_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    season_id INTEGER NOT NULL,
    wtrl_rider_id INTEGER,
    name TEXT,
    category TEXT,
    is_active INTEGER DEFAULT 1,
    last_import_id TEXT,
    PRIMARY KEY (athlete_id, team_id, season_id)
);


-- 6. FIX import tables (DROP & CREATE)
DROP TABLE IF EXISTS wtrl_import_locks;
CREATE TABLE wtrl_import_locks (
    season_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    import_id TEXT,
    PRIMARY KEY(season_id, type)
);

DROP TABLE IF EXISTS wtrl_import_state;
CREATE TABLE wtrl_import_state (
    import_id TEXT PRIMARY KEY,
    season_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. FIX wtrl_import_logs (DROP & CREATE)
DROP TABLE IF EXISTS wtrl_import_logs;
CREATE TABLE wtrl_import_logs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    season_id INTEGER NOT NULL,
    imported_count INTEGER,
    raw_snapshot TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- 8. FIX availability (Align columns with code)
DROP TABLE IF EXISTS availability_new;
CREATE TABLE availability_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zwid INTEGER NOT NULL,
    round_id INTEGER NOT NULL,
    status TEXT DEFAULT 'available',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zwid) REFERENCES athletes(zwid),
    FOREIGN KEY (round_id) REFERENCES rounds_v2(id)
);
-- Migrazione dati (mappando athlete_id -> zwid)
INSERT OR IGNORE INTO availability_new (zwid, round_id, status)
SELECT athlete_id, round_id, status FROM availability;

DROP TABLE IF EXISTS availability;
ALTER TABLE availability_new RENAME TO availability;


-- 9. FIX user_time_preferences (Align columns with code)
DROP TABLE IF EXISTS user_time_preferences_new;
CREATE TABLE user_time_preferences_new (
    zwid INTEGER NOT NULL,
    time_slot_id TEXT NOT NULL,
    preference_level INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (zwid, time_slot_id),
    FOREIGN KEY (zwid) REFERENCES athletes(zwid),
    FOREIGN KEY (time_slot_id) REFERENCES league_times(id)
);
-- Nota: resettiamo i dati delle preferenze poiché il formato vecchio era incompatibile
DROP TABLE IF EXISTS user_time_preferences;
ALTER TABLE user_time_preferences_new RENAME TO user_time_preferences;

PRAGMA foreign_keys = ON;
