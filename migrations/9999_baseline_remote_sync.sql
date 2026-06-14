-- Baseline migration for remote database structure
-- Extracted: 2026-06-14

CREATE TABLE athletes (zwid INTEGER PRIMARY KEY, name TEXT, email TEXT, password_hash TEXT, role TEXT, base_category TEXT, gender TEXT, created_at DATETIME, avatar_url TEXT, zftp REAL, zftpw INTEGER, zmap REAL, zmapw INTEGER, profile_id INTEGER, wtrl_user_id TEXT);
CREATE TABLE zrl_seasons (id INTEGER PRIMARY KEY, name TEXT NOT NULL, external_season_id INTEGER, is_active BOOLEAN DEFAULT 0, status TEXT, scoring_type TEXT, start_date TEXT, end_date TEXT);
CREATE TABLE series (id INTEGER PRIMARY KEY, name TEXT NOT NULL, external_season_id INTEGER, is_active BOOLEAN DEFAULT 0, start_date TEXT, scoring_type TEXT, end_date TEXT, status TEXT);
CREATE TABLE teams (id INTEGER PRIMARY KEY, series_id INTEGER, name TEXT NOT NULL, wtrl_team_id INTEGER, division TEXT, time_slot TEXT, category TEXT, wtrl_team_url TEXT, tttid INTEGER, club_name TEXT, gender TEXT, league TEXT, zrldivision TEXT, league_color TEXT, rec INTEGER, status INTEGER, is_dev INTEGER, rounds TEXT, member_count INTEGER, season_id INTEGER, season_code TEXT, division_number INTEGER, captain_id INTEGER, club_id TEXT, FOREIGN KEY (series_id) REFERENCES series(id));
CREATE TABLE availability (id INTEGER PRIMARY KEY, athlete_id INTEGER, round_id INTEGER, status TEXT, FOREIGN KEY (athlete_id) REFERENCES athletes(zwid), FOREIGN KEY (round_id) REFERENCES rounds(id));
CREATE TABLE race_lineup (id INTEGER PRIMARY KEY, round_id INTEGER, athlete_id INTEGER, status TEXT, team_id INTEGER, role TEXT, race_id INTEGER, FOREIGN KEY (round_id) REFERENCES rounds(id), FOREIGN KEY (athlete_id) REFERENCES athletes(zwid));
CREATE TABLE team_members (id INTEGER PRIMARY KEY, team_id INTEGER, athlete_id INTEGER, role TEXT, wtrl_rider_id INTEGER, zwift_id INTEGER, season_id INTEGER, name TEXT, category TEXT, is_active INTEGER, last_import_id TEXT, FOREIGN KEY (team_id) REFERENCES teams(id), FOREIGN KEY (athlete_id) REFERENCES athletes(zwid));
CREATE TABLE round_teams (
    round_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    timeslot_id TEXT REFERENCES league_times(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (round_id, team_id),
    FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);
CREATE TABLE results (id INTEGER PRIMARY KEY, round_id INTEGER, athlete_id INTEGER, position INTEGER, points INTEGER, time TEXT, FOREIGN KEY (round_id) REFERENCES rounds(id), FOREIGN KEY (athlete_id) REFERENCES athletes(zwid));
CREATE TABLE user_time_preferences (id INTEGER PRIMARY KEY, athlete_id INTEGER, round_id INTEGER, preference TEXT, FOREIGN KEY (athlete_id) REFERENCES athletes(zwid), FOREIGN KEY (round_id) REFERENCES rounds(id));
CREATE TABLE zrl_round_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id INTEGER NOT NULL,
    round_index INTEGER NOT NULL,
    external_season_id INTEGER,
    description TEXT,
    is_closed BOOLEAN DEFAULT 0,
    FOREIGN KEY (series_id) REFERENCES zrl_seasons(id),
    UNIQUE(series_id, round_index)
);
CREATE TABLE zrl_team_standings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_group_id INTEGER NOT NULL,
    league_key TEXT NOT NULL,
    team_name TEXT NOT NULL,
    rank INTEGER,
    league_points INTEGER,
    pts_fal INTEGER,
    pts_fts INTEGER,
    pts_finish INTEGER,
    r1 TEXT, r2 TEXT, r3 TEXT, r4 TEXT, r5 TEXT, r6 TEXT, r7 TEXT, r8 TEXT,
    is_inox BOOLEAN DEFAULT 0, wtrl_team_id INTEGER, league_name TEXT, total_race_points INTEGER,
    FOREIGN KEY (round_group_id) REFERENCES zrl_round_groups(id),
    UNIQUE(round_group_id, league_key, team_name)
);
CREATE TABLE zrl_races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zrl_round_group_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    date DATETIME,
    world TEXT,
    route TEXT, series_id INTEGER,
    FOREIGN KEY (zrl_round_group_id) REFERENCES zrl_round_groups(id)
);
CREATE TABLE division_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    league_key TEXT NOT NULL,
    team_name TEXT NOT NULL,
    rider_name TEXT,
    zwid INTEGER,
    position INTEGER,
    time REAL,
    points_finish INTEGER DEFAULT 0,
    points_fal INTEGER DEFAULT 0,
    points_fts INTEGER DEFAULT 0,
    points_total INTEGER DEFAULT 0,
    is_inox BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
, wtrl_team_id INTEGER);
CREATE TABLE zrl_season_events (id INTEGER PRIMARY KEY AUTOINCREMENT, season_id INTEGER NOT NULL, sequence_number INTEGER NOT NULL, step_name TEXT NOT NULL, event_type TEXT NOT NULL, payload TEXT, trace_id TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE zrl_orchestrator_locks (season_id INTEGER PRIMARY KEY, owner_token TEXT NOT NULL, expires_at DATETIME NOT NULL);
CREATE TABLE zrl_sequence_tracker (season_id INTEGER PRIMARY KEY, last_sequence_number INTEGER DEFAULT 0);
CREATE TABLE zrl_idempotency_keys (idempotency_key TEXT PRIMARY KEY, status TEXT NOT NULL, result_payload TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE zrl_sequence (
  season_id INTEGER PRIMARY KEY,
  current_sequence INTEGER NOT NULL
);
CREATE TABLE wtrl_import_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    filename TEXT NOT NULL,
    imported_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE zrl_outbox_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    payload TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    retry_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME
);
CREATE TABLE zrl_participation_intent (
    zwid INTEGER NOT NULL,
    series_id INTEGER NOT NULL,
    intent BOOLEAN NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (zwid, series_id),
    FOREIGN KEY (zwid) REFERENCES athletes(zwid),
    FOREIGN KEY (series_id) REFERENCES series(id)
);
CREATE TABLE zrl_ai_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL, 
    report_type TEXT NOT NULL CHECK(report_type IN ('race', 'round', 'season', 'rider')),
    content TEXT NOT NULL,
    model TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    hash TEXT UNIQUE NOT NULL
);
CREATE TABLE races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    race_type TEXT,
    scheduled_at TEXT,
    FOREIGN KEY (round_id) REFERENCES rounds(id)
);
CREATE TABLE riders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zwid INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL
);
CREATE TABLE team_race_results (
    race_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    position INTEGER,
    points INTEGER,
    PRIMARY KEY (race_id, team_id),
    FOREIGN KEY (race_id) REFERENCES races(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);
CREATE TABLE rider_race_results (
    race_id INTEGER NOT NULL,
    rider_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    position INTEGER,
    time REAL,
    points INTEGER,
    PRIMARY KEY (race_id, rider_id),
    FOREIGN KEY (race_id) REFERENCES races(id),
    FOREIGN KEY (rider_id) REFERENCES riders(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);
CREATE TABLE graph_edges (
    source_type TEXT NOT NULL,
    source_id INTEGER NOT NULL,
    target_type TEXT NOT NULL,
    target_id INTEGER NOT NULL,
    edge_type TEXT NOT NULL,
    PRIMARY KEY (source_type, source_id, target_type, target_id, edge_type)
);
CREATE TABLE seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);
CREATE TABLE rounds_v2 (
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
CREATE TABLE round_action_log (
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
CREATE TABLE league_times (id TEXT PRIMARY KEY, region TEXT, start_time_utc TEXT, display_name TEXT, slot_order INTEGER);
CREATE TABLE rounds (id INTEGER PRIMARY KEY);
CREATE TABLE season_lifecycle_status (id TEXT PRIMARY KEY, status TEXT, updated_at DATETIME);
CREATE TABLE season_action_log (id TEXT PRIMARY KEY, action TEXT, details TEXT, created_at DATETIME);
CREATE TABLE wtrl_import_locks (id TEXT PRIMARY KEY, lock_name TEXT);
CREATE TABLE wtrl_import_state (id TEXT PRIMARY KEY, state TEXT);
