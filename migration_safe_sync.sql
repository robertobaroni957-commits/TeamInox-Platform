-- SAFE MIGRATION (idempotent style)

-- ZRL SEASONS
ALTER TABLE zrl_seasons ADD COLUMN status TEXT;
ALTER TABLE zrl_seasons ADD COLUMN scoring_type TEXT DEFAULT 'points';
ALTER TABLE zrl_seasons ADD COLUMN start_date DATETIME;
ALTER TABLE zrl_seasons ADD COLUMN end_date DATETIME;

-- ZRL RACES
ALTER TABLE zrl_races ADD COLUMN series_id INTEGER;

-- ROUNDS
ALTER TABLE rounds ADD COLUMN raw_json TEXT;
ALTER TABLE rounds ADD COLUMN laps INTEGER;
ALTER TABLE rounds ADD COLUMN status TEXT;

-- TEAMS
ALTER TABLE teams ADD COLUMN season_code TEXT;

-- RACE LINEUP
ALTER TABLE race_lineup ADD COLUMN race_id INTEGER;