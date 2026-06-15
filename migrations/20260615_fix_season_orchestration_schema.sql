-- MIGRATION: Fix Season Orchestration Schema
-- Description: Aligns season_action_log, season_lifecycle_status, team_members and teams with the season-centric model.

PRAGMA foreign_keys = OFF;

-- 1. FIX season_lifecycle_status
CREATE TABLE IF NOT EXISTS season_lifecycle_status_new (
    season_id INTEGER PRIMARY KEY,
    status TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Se esiste la vecchia tabella, proviamo a migrare i dati
-- Nota: 'id' nel baseline era TEXT e poteva contenere il season_id
INSERT OR IGNORE INTO season_lifecycle_status_new (season_id, status, updated_at)
SELECT CAST(id AS INTEGER), status, updated_at FROM season_lifecycle_status WHERE id GLOB '[0-9]*';

DROP TABLE IF EXISTS season_lifecycle_status;
ALTER TABLE season_lifecycle_status_new RENAME TO season_lifecycle_status;


-- 2. FIX zrl_sequence_tracker (Ensure column name consistency)
CREATE TABLE IF NOT EXISTS zrl_sequence_tracker_new (
    season_id INTEGER PRIMARY KEY,
    last_sequence_number INTEGER DEFAULT 0
);

-- Migrazione dati sicura: proviamo a recuperare last_sequence_number. 
-- Se anche questa fallisse, la tabella rimarrà vuota e verrà popolata al primo utilizzo.
INSERT OR IGNORE INTO zrl_sequence_tracker_new (season_id, last_sequence_number)
SELECT season_id, last_sequence_number FROM zrl_sequence_tracker;

DROP TABLE IF EXISTS zrl_sequence_tracker;
ALTER TABLE zrl_sequence_tracker_new RENAME TO zrl_sequence_tracker;


-- 3. FIX season_action_log
CREATE TABLE IF NOT EXISTS season_action_log_new (
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

-- Migrazione parziale dei dati esistenti se possibile
INSERT OR IGNORE INTO season_action_log_new (id, action, season_id, status, payload, created_at)
SELECT id, action, 0, 'legacy', details, created_at FROM season_action_log;

DROP TABLE IF EXISTS season_action_log;
ALTER TABLE season_action_log_new RENAME TO season_action_log;


-- 3. FIX teams (PK: wtrl_team_id, season_id)
CREATE TABLE IF NOT EXISTS teams_new (
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

-- Migrazione dati teams
INSERT OR IGNORE INTO teams_new (
    wtrl_team_id, season_id, name, category, division, division_number, captain_id,
    club_id, tttid, club_name, gender, league, zrldivision,
    league_color, rec, status, is_dev, rounds, member_count, import_id
)
SELECT 
    wtrl_team_id, COALESCE(season_id, 19), name, category, division, division_number, captain_id,
    club_id, tttid, club_name, gender, league, zrldivision,
    league_color, rec, status, is_dev, rounds, member_count, NULL
FROM teams;

DROP TABLE teams;
ALTER TABLE teams_new RENAME TO teams;


-- 4. FIX team_members (Add missing columns and fix PK)
CREATE TABLE IF NOT EXISTS team_members_new (
    athlete_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    season_id INTEGER NOT NULL,
    wtrl_rider_id INTEGER,
    name TEXT,
    category TEXT,
    is_active INTEGER DEFAULT 1,
    last_import_id TEXT,
    PRIMARY KEY (athlete_id, team_id, season_id),
    FOREIGN KEY (athlete_id) REFERENCES athletes(zwid),
    FOREIGN KEY (team_id, season_id) REFERENCES teams(wtrl_team_id, season_id)
);

-- Migrazione dati team_members
INSERT OR IGNORE INTO team_members_new (athlete_id, team_id, season_id)
SELECT athlete_id, team_id, 19 FROM team_members;

DROP TABLE team_members;
ALTER TABLE team_members_new RENAME TO team_members;

PRAGMA foreign_keys = ON;
