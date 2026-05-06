-- Migrazione: Creazione struttura ZRL focalizzata sulle squadre
-- Data: 2026-05-06

CREATE TABLE IF NOT EXISTS zrl_seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS zrl_round_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id INTEGER NOT NULL,
    round_index INTEGER NOT NULL,
    external_season_id INTEGER,
    description TEXT,
    is_closed BOOLEAN DEFAULT 0,
    FOREIGN KEY (series_id) REFERENCES zrl_seasons(id),
    UNIQUE(series_id, round_index)
);

CREATE TABLE IF NOT EXISTS zrl_team_standings (
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
    is_inox BOOLEAN DEFAULT 0,
    FOREIGN KEY (round_group_id) REFERENCES zrl_round_groups(id),
    UNIQUE(round_group_id, league_key, team_name)
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
