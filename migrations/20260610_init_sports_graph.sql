-- Sports Event Graph Model Schema
-- Migration: 20260610_init_sports_graph.sql

-- 1. Core Entities
CREATE TABLE IF NOT EXISTS seasons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    starts_at TEXT,
    FOREIGN KEY (season_id) REFERENCES seasons(id)
);

CREATE TABLE IF NOT EXISTS races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    race_type TEXT,
    scheduled_at TEXT,
    FOREIGN KEY (round_id) REFERENCES rounds(id)
);

CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT
);

CREATE TABLE IF NOT EXISTS riders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zwid INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL
);

-- 2. Relationships
CREATE TABLE IF NOT EXISTS team_race_results (
    race_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    position INTEGER,
    points INTEGER,
    PRIMARY KEY (race_id, team_id),
    FOREIGN KEY (race_id) REFERENCES races(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS rider_race_results (
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

-- 3. Graph Edges (Generic relationship table)
CREATE TABLE IF NOT EXISTS graph_edges (
    source_type TEXT NOT NULL,
    source_id INTEGER NOT NULL,
    target_type TEXT NOT NULL,
    target_id INTEGER NOT NULL,
    edge_type TEXT NOT NULL,
    PRIMARY KEY (source_type, source_id, target_type, target_id, edge_type)
);

-- 4. Derived Views (Using D1 Views / Standard SQL)
CREATE VIEW IF NOT EXISTS race_derived_view AS
SELECT 
    r.id as race_id,
    COUNT(rrr.rider_id) as participant_count,
    SUM(rrr.points) as total_team_points
FROM races r
LEFT JOIN rider_race_results rrr ON r.id = rrr.race_id
GROUP BY r.id;
