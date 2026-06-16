CREATE TABLE IF NOT EXISTS races (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  race_type TEXT,
  scheduled_at TEXT
);

CREATE TABLE IF NOT EXISTS riders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  zwid INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS team_race_results (
  race_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  position INTEGER,
  points INTEGER,
  PRIMARY KEY (race_id, team_id)
);

CREATE TABLE IF NOT EXISTS rider_race_results (
  race_id INTEGER NOT NULL,
  rider_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  position INTEGER,
  time REAL,
  points INTEGER,
  PRIMARY KEY (race_id, rider_id)
);

CREATE TABLE IF NOT EXISTS graph_edges (
  source_type TEXT,
  source_id INTEGER,
  target_type TEXT,
  target_id INTEGER,
  edge_type TEXT,
  PRIMARY KEY (source_type, source_id, target_type, target_id, edge_type)
);