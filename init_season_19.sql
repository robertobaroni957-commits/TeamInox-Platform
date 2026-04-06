-- File SQL per inizializzazione ZRL Spring 2026 (Season 19)
-- Archiviazione
UPDATE series SET is_active = 0;

-- Creazione Serie
INSERT INTO series (name, external_season_id, is_active, start_date) 
VALUES ('ZRL Spring 2026', 19, 1, '2026-04-07');

-- Pulizia eventuali round orfani per questa serie (se rilanciato)
DELETE FROM rounds WHERE series_id = (SELECT id FROM series WHERE is_active = 1 LIMIT 1);

-- Inserimento Round con dettagli tecnici completi
INSERT INTO rounds (series_id, name, date, world, route, format, distance, elevation, powerups, strategy_details) 
VALUES 
( (SELECT id FROM series WHERE is_active = 1 LIMIT 1), 'Race 1', '2026-04-07', 'FRANCE', 'Hell of the North', 'TTT', 20.2, 241.3, 'none', '{"fal_segments": [], "fts_segments": [], "powerup_details": "Nessuno"}'),
( (SELECT id FROM series WHERE is_active = 1 LIMIT 1), 'Race 2', '2026-04-14', 'WATOPIA', 'The Classic', 'Points', 33.2, 306.8, '123', '{"fal_segments": ["Jarvis FWD Climb (x6)", "Jarvis FWD Sprint (x6)"], "fts_segments": ["Jarvis FWD Climb (x6)", "Jarvis FWD Sprint (x6)"], "powerup_details": "1, 2, 3"}'),
( (SELECT id FROM series WHERE is_active = 1 LIMIT 1), 'Race 3', '2026-04-21', 'FRANCE', 'Croissant', 'Scratch', 40.3, 220.4, '33%33%34%', '{"fal_segments": [], "fts_segments": [], "powerup_details": "33% Aero, 33% Feather, 34% Ghost"}'),
( (SELECT id FROM series WHERE is_active = 1 LIMIT 1), 'Race 4', '2026-04-28', 'NEW YORK', 'Double Span Spin', 'Points', 40.7, 439.6, '12', '{"fal_segments": ["Manhattan REV Sprint (x6)", "Brooklyn Bridge FWD Climb (x5)"], "fts_segments": ["Manhattan REV Sprint (x6)", "Brooklyn Bridge FWD Climb (x5)"], "powerup_details": "1, 2"}');
