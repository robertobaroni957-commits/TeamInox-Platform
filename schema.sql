-- SCHEMA SQL OTTIMIZZATO (Focus Squadre e Round GC)

-- 1. STAGIONI (Anno/Campionato, es: 2025/26)
CREATE TABLE IF NOT EXISTS zrl_seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 0
);

-- 2. ROUND (I 4 blocchi di WTRL, es: Round 1 = WTRL ID 19)
CREATE TABLE IF NOT EXISTS zrl_round_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id INTEGER NOT NULL,
    round_index INTEGER NOT NULL,    -- 1, 2, 3, 4
    external_season_id INTEGER,      -- L'ID che WTRL chiama "Season" (es: 19)
    description TEXT,
    is_closed BOOLEAN DEFAULT 0,
    FOREIGN KEY (series_id) REFERENCES zrl_seasons(id)
);

-- 3. CLASSIFICA SQUADRE (GC del Round)
CREATE TABLE IF NOT EXISTS zrl_team_standings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_group_id INTEGER NOT NULL,
    league_key TEXT NOT NULL,
    team_name TEXT NOT NULL,
    rank INTEGER,
    league_points INTEGER,
    total_race_points INTEGER,
    r1 TEXT, r2 TEXT, r3 TEXT, r4 TEXT, r5 TEXT, r6 TEXT,
    is_inox BOOLEAN DEFAULT 0,
    FOREIGN KEY (round_group_id) REFERENCES zrl_round_groups(id),
    UNIQUE(round_group_id, league_key, team_name)
);

-- 4. GARE (Dettagli tappe per post-gara)
CREATE TABLE IF NOT EXISTS zrl_races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zrl_round_group_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    date DATETIME,
    world TEXT,
    route TEXT,
    FOREIGN KEY (zrl_round_group_id) REFERENCES zrl_round_groups(id)
);

-- 5. RISULTATI INDIVIDUALI (Per analisi)
CREATE TABLE IF NOT EXISTS division_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    league_key TEXT NOT NULL,
    team_name TEXT NOT NULL,
    rider_name TEXT NOT NULL,
    position INTEGER,
    points_total INTEGER,
    is_inox BOOLEAN DEFAULT 0,
    FOREIGN KEY (round_id) REFERENCES zrl_races(id)
);
