-- Seed data for ZRL Analytics Snapshot test
PRAGMA foreign_keys = OFF;

-- 1. Create a Round Group for the active season
INSERT OR IGNORE INTO zrl_round_groups (id, series_id, round_index, external_season_id, description, round_index_in_season, custom_round_group_id)
VALUES (1, 1, 4, 19, 'ZRL 2025 Round 4 - Finale', 4, 19);

-- 2. Create some Team Standings
-- league_key format from code: (league || '0' || category || division_number || '0')
-- For example: EMEA Central A1 -> 10A10
INSERT OR IGNORE INTO zrl_team_standings (
    round_group_id, league_key, league_name, team_name, rank, 
    league_points, pts_fal, pts_fts, pts_finish, total_race_points,
    r1, r2, r3, r4, r5, r6, is_inox
) VALUES 
(1, '10A10', 'EMEA Central A1', 'INOXTEAM ELITE', 1, 100, 45, 30, 150, 225, '20', '20', '20', '20', '20', '', 1),
(1, '10A10', 'EMEA Central A1', 'Z-RACING TEAM', 2, 95, 30, 45, 120, 195, '18', '19', '18', '19', '18', '', 0),
(1, '10A10', 'EMEA Central A1', 'CRYO-GEN', 3, 90, 25, 25, 100, 150, '17', '17', '17', '17', '17', '', 0),
(1, '10A10', 'EMEA Central A1', 'WTRL GHOSTS', 4, 85, 20, 20, 80, 120, '16', '16', '16', '16', '16', '', 0);

-- 3. Create some MVPs (Rider results)
-- Needs zrl_races entries first because division_results references round_id
INSERT OR IGNORE INTO zrl_races (id, zrl_round_group_id, name, date, world, route)
VALUES (1, 1, 'Race 1', '2025-04-07', 'FRANCE', 'Hell of the North');

INSERT OR IGNORE INTO division_results (
    round_id, rider_name, team_name, points_total, position, league_key, is_inox
) VALUES 
(1, 'Andrea Cerri', 'INOXTEAM ELITE', 85, 1, '10A10', 1),
(1, 'Cristian Collesei', 'INOXTEAM ELITE', 78, 2, '10A10', 1),
(1, 'Francesco Avesani', 'INOXTEAM ELITE', 72, 3, '10A10', 1),
(1, 'Giovanni Bettega', 'INOXTEAM ELITE', 65, 5, '10A10', 1),
(1, 'Guido Lamet', 'INOXTEAM ELITE', 60, 8, '10A10', 1);

PRAGMA foreign_keys = ON;
