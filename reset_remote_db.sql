-- Script to reset remote D1 database by dropping all tables safely
PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS season_table;
DROP TABLE IF EXISTS rounds_table;
DROP TABLE IF EXISTS zrl_season_events;
DROP TABLE IF EXISTS zrl_orchestrator_locks;
DROP TABLE IF EXISTS zrl_sequence_tracker;
DROP TABLE IF EXISTS zrl_idempotency_keys;
DROP TABLE IF EXISTS athletes;
DROP TABLE IF EXISTS series;
DROP TABLE IF EXISTS rounds;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS availability;
DROP TABLE IF EXISTS league_times;
DROP TABLE IF EXISTS user_time_preferences;
DROP TABLE IF EXISTS inox_events;
DROP TABLE IF EXISTS rounds_v2;
DROP TABLE IF EXISTS season_lifecycle_status;
DROP TABLE IF EXISTS season_action_log;
DROP TABLE IF EXISTS wtrl_import_locks;
DROP TABLE IF EXISTS wtrl_import_state;
DROP TABLE IF EXISTS wtrl_import_logs;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS zrl_outbox_events;
DROP TABLE IF EXISTS zrl_seasons;
DROP TABLE IF EXISTS zrl_round_groups;
DROP TABLE IF EXISTS zrl_races;
DROP TABLE IF EXISTS zrl_team_standings;
DROP TABLE IF EXISTS division_results;
DROP TABLE IF EXISTS zrl_participation_intent;
DROP TABLE IF EXISTS zrl_ai_reports;
DROP TABLE IF EXISTS riders;
DROP TABLE IF EXISTS graph_edges;

PRAGMA foreign_keys = ON;
