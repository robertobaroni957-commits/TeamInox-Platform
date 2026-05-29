-- Migrazione: Aggiunta trace_id a zrl_season_events
-- Data: 2026-05-22

ALTER TABLE zrl_season_events ADD COLUMN trace_id TEXT;
CREATE INDEX IF NOT EXISTS idx_season_events_trace ON zrl_season_events(trace_id);
