-- InoxTeam Platform: Database Schema Definitivo (Idempotente)

-- 1. Tabelle Esistenti
CREATE TABLE IF NOT EXISTS zrl_seasons (
    id INTEGER PRIMARY KEY, 
    name TEXT NOT NULL, 
    external_season_id INTEGER, 
    is_active BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS zrl_round_groups (
    id INTEGER PRIMARY KEY, 
    series_id INTEGER, 
    round_index INTEGER, 
    external_season_id INTEGER, 
    description TEXT, 
    is_closed BOOLEAN DEFAULT 0,
    FOREIGN KEY (series_id) REFERENCES zrl_seasons(id)
);

CREATE TABLE IF NOT EXISTS zrl_races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zrl_round_group_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    date DATETIME,
    world TEXT,
    route TEXT,
    FOREIGN KEY (zrl_round_group_id) REFERENCES zrl_round_groups(id)
);

CREATE TABLE IF NOT EXISTS zrl_team_standings (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    round_group_id INTEGER NOT NULL, 
    league_key TEXT NOT NULL, 
    league_name TEXT,
    team_name TEXT NOT NULL, 
    rank INTEGER, 
    league_points INTEGER, 
    pts_fal INTEGER, 
    pts_fts INTEGER, 
    pts_finish INTEGER, 
    total_race_points INTEGER,
    r1 TEXT, r2 TEXT, r3 TEXT, r4 TEXT, r5 TEXT, r6 TEXT, r7 TEXT, r8 TEXT, 
    is_inox BOOLEAN DEFAULT 0,
    FOREIGN KEY (round_group_id) REFERENCES zrl_round_groups(id)
);

CREATE TABLE IF NOT EXISTS division_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    league_key TEXT NOT NULL,
    team_name TEXT NOT NULL,
    rider_name TEXT NOT NULL,
    zwid INTEGER,
    position INTEGER,
    points_total INTEGER,
    is_inox BOOLEAN DEFAULT 0,
    FOREIGN KEY (round_id) REFERENCES zrl_races(id)
);

-- 2. Tabelle Orchestrator & Event Sourcing (Mancanti)
CREATE TABLE IF NOT EXISTS zrl_season_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    sequence_number INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload TEXT,
    trace_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS zrl_orchestrator_locks (
    season_id INTEGER PRIMARY KEY,
    owner_token TEXT NOT NULL,
    expires_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS zrl_sequence_tracker (
    season_id INTEGER PRIMARY KEY,
    last_sequence_number INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS zrl_idempotency_keys (
    idempotency_key TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    result_payload TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indici per Performance e Consistenza
CREATE INDEX IF NOT EXISTS idx_round_groups_series ON zrl_round_groups(series_id);
CREATE INDEX IF NOT EXISTS idx_races_round_group ON zrl_races(zrl_round_group_id);
CREATE INDEX IF NOT EXISTS idx_team_standings_round ON zrl_team_standings(round_group_id);
CREATE INDEX IF NOT EXISTS idx_division_results_round ON division_results(round_id);

-- Indici specifici per Orchestrator
CREATE INDEX IF NOT EXISTS idx_events_season_seq ON zrl_season_events(season_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_events_trace ON zrl_season_events(trace_id);
CREATE INDEX IF NOT EXISTS idx_locks_owner ON zrl_orchestrator_locks(owner_token);
