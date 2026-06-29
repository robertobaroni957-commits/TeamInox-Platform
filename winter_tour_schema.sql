-- Create tables for separate WINTER_TOUR_DB database

CREATE TABLE IF NOT EXISTS wt_stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stage_number INTEGER NOT NULL UNIQUE,
    date TEXT NOT NULL,
    world_it TEXT NOT NULL,
    world_en TEXT NOT NULL,
    route_it TEXT NOT NULL,
    route_en TEXT NOT NULL,
    type_it TEXT NOT NULL,
    type_en TEXT NOT NULL,
    route_link TEXT,
    register_link TEXT,
    zwift_event_id INTEGER NOT NULL,
    segments TEXT, -- JSON string array
    status TEXT DEFAULT 'scheduled' -- 'scheduled', 'published'
);

CREATE TABLE IF NOT EXISTS wt_scoring_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'FIN', 'FTS', 'FAL'
    position INTEGER NOT NULL,
    points INTEGER NOT NULL,
    UNIQUE(type, position)
);

CREATE TABLE IF NOT EXISTS wt_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stage_id INTEGER REFERENCES wt_stages(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'A', 'B', 'C', 'D', 'E'
    name TEXT NOT NULL,
    tname TEXT,
    zwid INTEGER NOT NULL,
    flag TEXT,
    punti_pos INTEGER,
    punti_fin INTEGER DEFAULT 0,
    punti_fal INTEGER DEFAULT 0,
    punti_fts INTEGER DEFAULT 0,
    punti_total INTEGER DEFAULT 0,
    tempo_time REAL DEFAULT 0, -- in seconds
    tempo_pos INTEGER,
    sprinter_points INTEGER DEFAULT 0,
    climber_points INTEGER DEFAULT 0,
    UNIQUE(stage_id, zwid)
);

CREATE TABLE IF NOT EXISTS wt_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Prepopulate scoring rules (FIN)
INSERT OR IGNORE INTO wt_scoring_rules (type, position, points) VALUES
('FIN', 1, 100),
('FIN', 2, 80),
('FIN', 3, 70),
('FIN', 4, 60),
('FIN', 5, 55),
('FIN', 6, 50),
('FIN', 7, 45),
('FIN', 8, 40),
('FIN', 9, 36),
('FIN', 10, 32),
('FIN', 11, 29),
('FIN', 12, 26),
('FIN', 13, 24),
('FIN', 14, 22),
('FIN', 15, 20),
('FIN', 16, 18),
('FIN', 17, 16),
('FIN', 18, 14),
('FIN', 19, 12),
('FIN', 20, 10);

-- Prepopulate scoring rules (FAL)
INSERT OR IGNORE INTO wt_scoring_rules (type, position, points) VALUES
('FAL', 1, 25),
('FAL', 2, 21),
('FAL', 3, 17),
('FAL', 4, 14),
('FAL', 5, 11),
('FAL', 6, 8),
('FAL', 7, 6),
('FAL', 8, 4),
('FAL', 9, 2),
('FAL', 10, 1);

-- Prepopulate scoring rules (FTS)
INSERT OR IGNORE INTO wt_scoring_rules (type, position, points) VALUES
('FTS', 1, 25),
('FTS', 2, 21),
('FTS', 3, 17),
('FTS', 4, 14),
('FTS', 5, 11),
('FTS', 6, 8),
('FTS', 7, 6),
('FTS', 8, 4),
('FTS', 9, 2),
('FTS', 10, 1);
