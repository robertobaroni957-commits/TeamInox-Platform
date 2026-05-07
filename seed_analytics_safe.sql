-- Safer Seed data for ZRL Analytics
PRAGMA foreign_keys = OFF;

DELETE FROM zrl_team_standings;
DELETE FROM division_results;
DELETE FROM zrl_races;
DELETE FROM zrl_round_groups;

-- 1. Round Group
INSERT INTO zrl_round_groups (series_id, round_index, external_season_id, description, round_index_in_season, custom_round_group_id)
VALUES (1, 4, 19, 'ZRL 2025 Round 4 - Finale', 4, 19);

-- 2. Standings (using last_insert_rowid() if possible, but let's just use ID 1)
INSERT INTO zrl_team_standings (id, round_group_id, league_key, league_name, team_name, rank, league_points, pts_fal, pts_fts, pts_finish, total_race_points, r1, r2, r3, r4, r5, r6, is_inox)
VALUES (1, 1, '10A10', 'EMEA Central A1', 'INOXTEAM ELITE', 1, 100, 45, 30, 150, 225, '20', '20', '20', '20', '20', '', 1);

INSERT INTO zrl_team_standings (id, round_group_id, league_key, league_name, team_name, rank, league_points, pts_fal, pts_fts, pts_finish, total_race_points, r1, r2, r3, r4, r5, r6, is_inox)
VALUES (2, 1, '10A10', 'EMEA Central A1', 'Z-RACING TEAM', 2, 95, 30, 45, 120, 195, '18', '19', '18', '19', '18', '', 0);

-- 3. Races
INSERT INTO zrl_races (id, zrl_round_group_id, name, date, world, route)
VALUES (1, 1, 'Race 1', '2025-04-07', 'FRANCE', 'Hell of the North');

-- 4. MVPs
INSERT INTO division_results (round_id, rider_name, team_name, points_total, position, league_key, is_inox)
VALUES (1, 'Andrea Cerri', 'INOXTEAM ELITE', 85, 1, '10A10', 1);
INSERT INTO division_results (round_id, rider_name, team_name, points_total, position, league_key, is_inox)
VALUES (1, 'Cristian Collesei', 'INOXTEAM ELITE', 78, 2, '10A10', 1);

PRAGMA foreign_keys = ON;
