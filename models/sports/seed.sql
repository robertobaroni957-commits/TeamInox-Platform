-- Sample Data for Sports Event Graph Model
INSERT INTO seasons (code, name) VALUES ('zrl_s19', 'ZRL Season 19');
INSERT INTO rounds (season_id, name) VALUES (1, 'Round 1: Watopia');
INSERT INTO races (round_id, name, race_type) VALUES (1, 'TTT', 'Team Time Trial');
INSERT INTO teams (name, category) VALUES ('Team INOX AAB', 'C');
INSERT INTO riders (zwid, name) VALUES (1001, 'Roberto'), (1002, 'Marco');

INSERT INTO team_race_results (race_id, team_id, position, points) VALUES (1, 1, 3, 45);
INSERT INTO rider_race_results (race_id, rider_id, team_id, position, time, points) 
VALUES (1, 1, 1, 5, 1200.5, 10), (1, 2, 1, 7, 1205.2, 8);
