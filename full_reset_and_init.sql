-- Full reset script for InoxTeam Platform ZRL data

-- Disable foreign key checks for the transaction
PRAGMA foreign_keys = OFF;

-- Clear all dynamic data that depends on others
DELETE FROM results;
DELETE FROM race_lineup;
DELETE FROM team_members;
DELETE FROM availability;

-- Clear core season/round/team data
DELETE FROM rounds;
DELETE FROM teams;
DELETE FROM series;

-- Re-enable foreign key checks
PRAGMA foreign_keys = ON;

-- Re-initialize the active season (ZRL Spring 2026)
-- Using ID 1 as it's common for a primary/first entry.
INSERT INTO series (id, name, external_season_id, is_active, start_date) 
VALUES (1, 'ZRL Spring 2026', 19, 1, '2026-04-07');

-- Re-insert the rounds for the new season with all technical details
INSERT INTO rounds (series_id, name, date, world, route, format, distance, elevation, powerups, strategy_details) 
VALUES 
(1, 'Race 1', '2026-04-07', 'FRANCE', 'Hell of the North', 'TTT', 20.2, 241, 'none', '{"fal_segments": [], "fts_segments": [], "powerup_details": "Nessuno"}'),
(1, 'Race 2', '2026-04-14', 'WATOPIA', 'The Classic', 'Points', 33.2, 306, '123', '{"fal_segments": ["Jarvis FWD Climb (x6)", "Jarvis FWD Sprint (x6)"], "fts_segments": ["Jarvis FWD Climb (x6)", "Jarvis FWD Sprint (x6)"], "powerup_details": "1, 2, 3"}'),
(1, 'Race 3', '2026-04-21', 'FRANCE', 'Croissant', 'Scratch', 40.3, 220, '33%33%34%', '{"fal_segments": [], "fts_segments": [], "powerup_details": "33% Aero, 33% Feather, 34% Ghost"}'),
(1, 'Race 4', '2026-04-28', 'NEW YORK', 'Double Span Spin', 'Points', 40.7, 439, '12', '{"fal_segments": ["Manhattan REV Sprint (x6)", "Brooklyn Bridge FWD Climb (x5)"], "fts_segments": ["Manhattan REV Sprint (x6)", "Brooklyn Bridge FWD Climb (x5)"], "powerup_details": "1, 2"}');
