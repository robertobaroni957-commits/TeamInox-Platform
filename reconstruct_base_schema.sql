-- Initial schema reconstruction from remote D1
PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS athletes (
    zwid INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    password_hash TEXT,
    base_category TEXT,
    is_registered_tour BOOLEAN DEFAULT 0,
    role TEXT DEFAULT 'athlete',
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    zftp REAL,
    zftpw INTEGER,
    zmap REAL,
    zmapw INTEGER,
    profile_id INTEGER,
    wtrl_user_id TEXT,
    gender TEXT
);

CREATE TABLE IF NOT EXISTS series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    external_season_id INTEGER,
    scoring_type TEXT DEFAULT 'points',
    is_active BOOLEAN DEFAULT 0,
    start_date DATETIME,
    end_date DATETIME
);

CREATE TABLE IF NOT EXISTS rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id INTEGER REFERENCES series(id),
    name TEXT NOT NULL,
    date DATETIME,
    world TEXT,
    route TEXT,
    zwift_event_id INTEGER,
    format TEXT DEFAULT 'Scratch',
    distance REAL DEFAULT 0,
    elevation REAL DEFAULT 0,
    powerups TEXT,
    strategy_details TEXT,
    category TEXT DEFAULT 'ALL'
);

CREATE TABLE IF NOT EXISTS teams (
    wtrl_team_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    division TEXT,
    division_number INTEGER,
    captain_id INTEGER REFERENCES athletes(zwid),
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
    member_count INTEGER
);

CREATE TABLE IF NOT EXISTS team_members (
    team_id INTEGER REFERENCES teams(wtrl_team_id),
    athlete_id INTEGER REFERENCES athletes(zwid),
    PRIMARY KEY (team_id, athlete_id)
);

CREATE TABLE IF NOT EXISTS results (
    round_id INTEGER REFERENCES rounds(id),
    zwid INTEGER REFERENCES athletes(zwid),
    time REAL,
    points_total INTEGER DEFAULT 0,
    data_source TEXT,
    points_finish INTEGER DEFAULT 0,
    points_fal INTEGER DEFAULT 0,
    points_fts INTEGER DEFAULT 0,
    position INTEGER
);

CREATE TABLE IF NOT EXISTS availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    athlete_id INTEGER REFERENCES athletes(zwid),
    round_id INTEGER REFERENCES rounds(id),
    status TEXT DEFAULT 'available',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS league_times (
    id TEXT PRIMARY KEY,
    region TEXT NOT NULL,
    start_time_utc TEXT NOT NULL,
    display_name TEXT NOT NULL,
    slot_order INTEGER
);

CREATE TABLE IF NOT EXISTS user_time_preferences (
    zwid INTEGER REFERENCES athletes(zwid),
    time_slot_id TEXT REFERENCES league_times(id),
    preference_level INTEGER DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (zwid, time_slot_id)
);

CREATE TABLE IF NOT EXISTS inox_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    time TEXT NOT NULL,
    description TEXT,
    zwift_link TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    strava_segment_id TEXT
);

CREATE TABLE IF NOT EXISTS round_teams (
    round_id INTEGER REFERENCES rounds(id),
    team_id INTEGER REFERENCES teams(wtrl_team_id),
    timeslot_id TEXT REFERENCES league_times(id),
    PRIMARY KEY (round_id, team_id)
);

CREATE TABLE IF NOT EXISTS race_lineup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER REFERENCES rounds(id),
    team_id INTEGER REFERENCES teams(wtrl_team_id),
    athlete_id INTEGER REFERENCES athletes(zwid),
    role TEXT DEFAULT 'starter',
    status TEXT DEFAULT 'pending'
);

PRAGMA foreign_keys = ON;
