-- DB SCHEMA (Cloudflare D1)
CREATE TABLE IF NOT EXISTS season_table (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rounds_table (
    id TEXT PRIMARY KEY,
    season_id TEXT NOT NULL,
    name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    wtrl_id INTEGER NOT NULL,
    FOREIGN KEY (season_id) REFERENCES season_table(id)
);
