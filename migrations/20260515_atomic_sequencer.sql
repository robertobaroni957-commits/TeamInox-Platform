-- Migration for atomic sequence generator
CREATE TABLE IF NOT EXISTS zrl_sequence (
  season_id INTEGER PRIMARY KEY,
  current_sequence INTEGER NOT NULL
);

-- Initialize sequences for existing seasons (if any)
INSERT INTO zrl_sequence (season_id, current_sequence)
SELECT season_id, MAX(sequence_number) 
FROM zrl_season_events 
GROUP BY season_id
ON CONFLICT(season_id) DO UPDATE SET current_sequence = excluded.current_sequence;
