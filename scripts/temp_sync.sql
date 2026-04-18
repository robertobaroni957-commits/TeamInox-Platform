BEGIN TRANSACTION;
INSERT OR IGNORE INTO series (id, name, external_season_id, is_active) VALUES (1, 'ZRL Season 19', 19, 1);
INSERT OR IGNORE INTO rounds (id, series_id, name) VALUES (1, 1, 'Round 1');
INSERT OR IGNORE INTO rounds (id, series_id, name) VALUES (2, 1, 'Round 2');
INSERT OR IGNORE INTO rounds (id, series_id, name) VALUES (3, 1, 'Round 3');
INSERT OR IGNORE INTO rounds (id, series_id, name) VALUES (4, 1, 'Round 4');
INSERT OR IGNORE INTO rounds (id, series_id, name) VALUES (5, 1, 'Round 5');
INSERT OR IGNORE INTO rounds (id, series_id, name) VALUES (6, 1, 'Round 6');
INSERT OR IGNORE INTO rounds (id, series_id, name) VALUES (7, 1, 'Round 7');
INSERT OR IGNORE INTO rounds (id, series_id, name) VALUES (8, 1, 'Round 8');
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, club_id, member_count)
            VALUES ('Team INOX DEV', 'B', 'Lime', 1, 75148, 'cef70cde-9149-43a2-b3ae-187643a44703', 8)
            ON CONFLICT(wtrl_team_id) DO UPDATE SET name=excluded.name, category=excluded.category, division=excluded.division, member_count=excluded.member_count;
DELETE FROM team_members WHERE team_id = (SELECT id FROM teams WHERE wtrl_team_id = 75148);
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (1684452, 'Giulio Strazzulla', 'B', 'https://www.wtrl.racing/uploads/profile_picture/1757915477_Capture d’écran 2025-09-15 075013.png')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75148), 1684452);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1684452, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1684452, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1684452, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1684452, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1684452, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1684452, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1684452, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1684452, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (904546, 'giuseppe durante', 'B', 'https://static-cdn.zwift.com/prod/profile/e86590d0-465264')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75148), 904546);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (904546, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (904546, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (904546, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (904546, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (904546, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (904546, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (904546, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (904546, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (6139819, 'Luca Durighel [INOX]', 'B', 'https://www.wtrl.racing/uploads/profile_picture/default.png')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75148), 6139819);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6139819, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6139819, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6139819, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6139819, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6139819, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6139819, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6139819, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6139819, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (4412965, 'Luigi Buso', 'B', 'https://static-cdn.zwift.com/prod/profile/b2d5b70b-2200318')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75148), 4412965);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4412965, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4412965, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4412965, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4412965, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4412965, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4412965, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4412965, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4412965, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (5280007, 'Massimiliano Caccia', 'B', 'https://static-cdn.zwift.com/prod/profile/714d1d39-2598872')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75148), 5280007);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5280007, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5280007, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5280007, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5280007, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5280007, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5280007, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5280007, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5280007, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (6562494, 'Matteo Fumagalli', 'B', 'https://static-cdn.zwift.com/prod/profile/144cb496-3077306')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75148), 6562494);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6562494, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6562494, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6562494, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6562494, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6562494, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6562494, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6562494, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6562494, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (1152951, 'Miky Tedesco', 'B', 'https://www.wtrl.racing/uploads/profile_picture/1636451392_ridotta per profilo wtrl.jpg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75148), 1152951);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1152951, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1152951, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1152951, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1152951, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1152951, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1152951, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1152951, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1152951, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (4686799, 'Roberto Pegoraro', 'B', 'https://static-cdn.zwift.com/prod/profile/c073ee46-2357318')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75148), 4686799);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4686799, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4686799, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4686799, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4686799, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4686799, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4686799, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4686799, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4686799, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (2006706, 'Francesco Salis [INOX]', 'B', 'https://static-cdn.zwift.com/prod/profile/ec66ceb3-1191267')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75148), 2006706);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2006706, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2006706, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2006706, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2006706, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2006706, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2006706, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2006706, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2006706, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (789201, 'Gianmarco Donetti', 'B', 'https://static-cdn.zwift.com/prod/profile/c42548a0-2643185')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75148), 789201);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (789201, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (789201, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (789201, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (789201, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (789201, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (789201, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (789201, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (789201, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (6354912, 'Horse Crazy', 'B', 'https://static-cdn.zwift.com/prod/profile/01afc4f1-2970144')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75148), 6354912);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6354912, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6354912, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6354912, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6354912, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6354912, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6354912, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6354912, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6354912, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (199374, 'Matteo Casadei', 'B', 'https://static-cdn.zwift.com/prod/profile/106f4f01-357606')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75148), 199374);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (199374, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (199374, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (199374, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (199374, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (199374, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (199374, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (199374, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (199374, 8, 'available');
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, club_id, member_count)
            VALUES ('Team INOX AAB', 'C', 'Shamrock', 3, 75150, 'cef70cde-9149-43a2-b3ae-187643a44703', 11)
            ON CONFLICT(wtrl_team_id) DO UPDATE SET name=excluded.name, category=excluded.category, division=excluded.division, member_count=excluded.member_count;
DELETE FROM team_members WHERE team_id = (SELECT id FROM teams WHERE wtrl_team_id = 75150);
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (4622555, 'Alessio Nisini', 'C', 'https://static-cdn.zwift.com/prod/profile/6fb48741-2789587')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75150), 4622555);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4622555, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4622555, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4622555, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4622555, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4622555, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4622555, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4622555, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4622555, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (3059451, 'claudio ubertini', 'C', 'https://static-cdn.zwift.com/prod/profile/b82ee113-1614260')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75150), 3059451);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3059451, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3059451, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3059451, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3059451, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3059451, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3059451, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3059451, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3059451, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (6797127, 'Cristian Pelosi', 'C', 'https://static-cdn.zwift.com/prod/profile/d8504895-3086513')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75150), 6797127);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6797127, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6797127, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6797127, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6797127, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6797127, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6797127, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6797127, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6797127, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (966756, 'Fabio Bertoldi', 'C', 'https://static-cdn.zwift.com/prod/profile/27502d77-495850')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75150), 966756);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (966756, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (966756, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (966756, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (966756, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (966756, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (966756, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (966756, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (966756, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (3617605, 'Francesco Ravasi', 'C', 'https://www.wtrl.racing/uploads/profile_picture/1734338820_38ac560823f041f12a73073a48be7f87 - Copia.jpg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75150), 3617605);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3617605, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3617605, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3617605, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3617605, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3617605, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3617605, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3617605, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3617605, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (6109036, 'Giancarlo Rugolo', 'C', 'https://www.wtrl.racing/uploads/profile_picture/1730991966_IMG_3831.jpeg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75150), 6109036);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6109036, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6109036, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6109036, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6109036, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6109036, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6109036, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6109036, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6109036, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (4369191, 'Luca Adamo', 'C', 'https://static-cdn.zwift.com/prod/profile/addfd74c-3184703')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75150), 4369191);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4369191, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4369191, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4369191, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4369191, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4369191, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4369191, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4369191, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4369191, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (7596532, 'Luca SAMPAOLESI', 'C', 'https://static-cdn.zwift.com/prod/profile/e9ef4a67-3271584')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75150), 7596532);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7596532, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7596532, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7596532, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7596532, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7596532, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7596532, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7596532, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7596532, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (6811945, 'Marco Esposito [INOX]', 'C', 'https://static-cdn.zwift.com/prod/profile/e8626ad5-3120472')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75150), 6811945);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6811945, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6811945, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6811945, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6811945, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6811945, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6811945, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6811945, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6811945, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (1237268, 'Nicola Mancini', 'C', 'https://www.wtrl.racing/uploads/profile_picture/1705991621_dettaglio&nome.jpg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75150), 1237268);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1237268, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1237268, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1237268, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1237268, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1237268, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1237268, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1237268, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1237268, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (1682095, 'Viciu Pacciu', 'C', 'https://www.wtrl.racing/uploads/profile_picture/1757529889_ViciuPacciu.jpeg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75150), 1682095);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1682095, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1682095, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1682095, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1682095, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1682095, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1682095, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1682095, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1682095, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (900612, 'Martino Sabia', 'C', 'https://www.wtrl.racing/uploads/profile_picture/1738105456_ezu-BW.JPG')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75150), 900612);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (900612, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (900612, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (900612, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (900612, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (900612, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (900612, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (900612, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (900612, 8, 'available');
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, club_id, member_count)
            VALUES ('TEAM INOX LOL', 'D', 'Lime', 1, 75258, 'cef70cde-9149-43a2-b3ae-187643a44703', 10)
            ON CONFLICT(wtrl_team_id) DO UPDATE SET name=excluded.name, category=excluded.category, division=excluded.division, member_count=excluded.member_count;
DELETE FROM team_members WHERE team_id = (SELECT id FROM teams WHERE wtrl_team_id = 75258);
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (3165807, 'Andrea Castori', 'D', 'https://static-cdn.zwift.com/prod/profile/7c25f383-1714441')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75258), 3165807);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3165807, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3165807, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3165807, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3165807, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3165807, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3165807, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3165807, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3165807, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (4386482, 'Claudio Fioravanti', 'D', 'https://www.wtrl.racing/uploads/profile_picture/default.png')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75258), 4386482);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4386482, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4386482, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4386482, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4386482, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4386482, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4386482, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4386482, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4386482, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (7735580, 'Cristian Bonafé', 'D', 'https://static-cdn.zwift.com/prod/profile/24e1a065-3389049')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75258), 7735580);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7735580, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7735580, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7735580, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7735580, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7735580, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7735580, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7735580, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7735580, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (2197162, 'Dario Paparella', 'D', 'https://www.wtrl.racing/uploads/profile_picture/1641905657_217c338c-2056385.jpg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75258), 2197162);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2197162, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2197162, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2197162, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2197162, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2197162, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2197162, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2197162, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2197162, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (6063066, 'David Grosso', 'D', 'https://www.wtrl.racing/uploads/profile_picture/1705438504_370137224_302903635998774_2080740969305295614_n.jpg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75258), 6063066);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6063066, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6063066, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6063066, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6063066, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6063066, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6063066, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6063066, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6063066, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (1652663, 'Graziano Gabrieli', 'D', 'https://static-cdn.zwift.com/prod/profile/6c139b79-890458')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75258), 1652663);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1652663, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1652663, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1652663, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1652663, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1652663, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1652663, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1652663, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1652663, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (5577047, 'Mauro Nana', 'D', 'https://static-cdn.zwift.com/prod/profile/f14167eb-2704249')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75258), 5577047);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5577047, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5577047, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5577047, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5577047, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5577047, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5577047, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5577047, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5577047, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (4483917, 'Paulin Z. CJ TT1D', 'D', 'https://static-cdn.zwift.com/prod/profile/a7d07d6f-3265408')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75258), 4483917);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4483917, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4483917, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4483917, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4483917, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4483917, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4483917, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4483917, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4483917, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (2148682, 'Raffaele Santoni', 'D', 'https://static-cdn.zwift.com/prod/profile/6c5cf5f9-1175142')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75258), 2148682);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2148682, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2148682, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2148682, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2148682, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2148682, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2148682, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2148682, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2148682, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (1573619, 'Roberto Regno', 'D', 'https://static-cdn.zwift.com/prod/profile/c7ff7312-2865908')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75258), 1573619);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1573619, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1573619, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1573619, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1573619, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1573619, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1573619, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1573619, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1573619, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (5265039, 'manuel magnotti', 'D', 'https://static-cdn.zwift.com/prod/profile/e03ab9d8-2576434')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75258), 5265039);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5265039, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5265039, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5265039, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5265039, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5265039, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5265039, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5265039, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5265039, 8, 'available');
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, club_id, member_count)
            VALUES ('Team INOX MADNESS', 'B', 'Emerald', 1, 75145, 'cef70cde-9149-43a2-b3ae-187643a44703', 10)
            ON CONFLICT(wtrl_team_id) DO UPDATE SET name=excluded.name, category=excluded.category, division=excluded.division, member_count=excluded.member_count;
DELETE FROM team_members WHERE team_id = (SELECT id FROM teams WHERE wtrl_team_id = 75145);
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (3432509, 'Andrea Falchetti', 'B', 'https://www.wtrl.racing/uploads/profile_picture/1730758950_Screenshot_20241104_211553_Gallery.jpg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75145), 3432509);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3432509, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3432509, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3432509, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3432509, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3432509, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3432509, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3432509, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3432509, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (1120055, 'Andy Jones', 'C', 'https://www.wtrl.racing/uploads/profile_picture/1701113009_IMG_0468.jpeg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75145), 1120055);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1120055, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1120055, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1120055, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1120055, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1120055, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1120055, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1120055, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1120055, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (1141125, 'Anthony Howard', 'B', 'https://www.wtrl.racing/uploads/profile_picture/1757366044_Screenshot_20250805_074711_Messenger.jpg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75145), 1141125);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1141125, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1141125, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1141125, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1141125, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1141125, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1141125, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1141125, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1141125, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (4209127, 'Antonio Bove', 'B', 'https://static-cdn.zwift.com/prod/profile/1047df23-2129379')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75145), 4209127);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4209127, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4209127, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4209127, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4209127, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4209127, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4209127, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4209127, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4209127, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (6139819, 'Luca Durighel [INOX]', 'B', 'https://www.wtrl.racing/uploads/profile_picture/default.png')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75145), 6139819);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6139819, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6139819, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6139819, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6139819, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6139819, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6139819, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6139819, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6139819, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (7121469, 'Massimo Spagnoli', 'B', 'https://static-cdn.zwift.com/prod/profile/5b6e0dc5-3171519')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75145), 7121469);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7121469, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7121469, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7121469, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7121469, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7121469, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7121469, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7121469, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7121469, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (6562494, 'Matteo Fumagalli', 'B', 'https://static-cdn.zwift.com/prod/profile/144cb496-3077306')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75145), 6562494);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6562494, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6562494, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6562494, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6562494, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6562494, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6562494, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6562494, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6562494, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (1520796, 'Mik D''andrea', 'B', 'https://static-cdn.zwift.com/prod/profile/79b46932-1065352')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75145), 1520796);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1520796, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1520796, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1520796, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1520796, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1520796, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1520796, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1520796, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1520796, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (4333414, 'Paolo Spadaro', 'C', 'https://www.wtrl.racing/uploads/profile_picture/1649167028_WhatsApp Image 2022-04-05 at 15.56.34.jpeg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75145), 4333414);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4333414, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4333414, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4333414, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4333414, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4333414, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4333414, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4333414, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4333414, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (475715, 'Simone Oppezzo', 'B', 'https://static-cdn.zwift.com/prod/profile/3d5b66e3-263432')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75145), 475715);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (475715, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (475715, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (475715, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (475715, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (475715, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (475715, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (475715, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (475715, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (931830, 'Gaetano Lo verde', 'B', 'https://static-cdn.zwift.com/prod/profile/6a451d47-1122424')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75145), 931830);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (931830, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (931830, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (931830, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (931830, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (931830, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (931830, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (931830, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (931830, 8, 'available');
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, club_id, member_count)
            VALUES ('Team INOX FIRE', 'C', 'Lime', 2, 74016, 'cef70cde-9149-43a2-b3ae-187643a44703', 10)
            ON CONFLICT(wtrl_team_id) DO UPDATE SET name=excluded.name, category=excluded.category, division=excluded.division, member_count=excluded.member_count;
DELETE FROM team_members WHERE team_id = (SELECT id FROM teams WHERE wtrl_team_id = 74016);
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (397261, 'Chris Musgrove', 'C', 'https://www.wtrl.racing/uploads/profile_picture/1758559446_6ee2e3116d2aff6d992e70a8ac9c90ea64fb5a97.jpg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74016), 397261);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (397261, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (397261, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (397261, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (397261, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (397261, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (397261, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (397261, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (397261, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (6797127, 'Cristian Pelosi', 'C', 'https://static-cdn.zwift.com/prod/profile/d8504895-3086513')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74016), 6797127);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6797127, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6797127, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6797127, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6797127, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6797127, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6797127, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6797127, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6797127, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (3617605, 'Francesco Ravasi', 'C', 'https://www.wtrl.racing/uploads/profile_picture/1734338820_38ac560823f041f12a73073a48be7f87 - Copia.jpg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74016), 3617605);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3617605, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3617605, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3617605, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3617605, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3617605, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3617605, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3617605, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3617605, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (6109036, 'Giancarlo Rugolo', 'C', 'https://www.wtrl.racing/uploads/profile_picture/1730991966_IMG_3831.jpeg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74016), 6109036);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6109036, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6109036, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6109036, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6109036, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6109036, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6109036, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6109036, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6109036, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (7596532, 'Luca SAMPAOLESI', 'C', 'https://static-cdn.zwift.com/prod/profile/e9ef4a67-3271584')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74016), 7596532);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7596532, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7596532, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7596532, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7596532, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7596532, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7596532, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7596532, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7596532, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (6811945, 'Marco Esposito [INOX]', 'C', 'https://static-cdn.zwift.com/prod/profile/e8626ad5-3120472')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74016), 6811945);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6811945, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6811945, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6811945, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6811945, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6811945, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6811945, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6811945, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6811945, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (5372432, 'Maximilian Mione', 'C', 'https://static-cdn.zwift.com/prod/profile/dd987705-2614080')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74016), 5372432);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5372432, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5372432, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5372432, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5372432, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5372432, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5372432, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5372432, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5372432, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (2975361, 'Roberto Baroni', 'C', 'https://www.wtrl.racing/uploads/profile_picture/1641197456_bella-tartaruga-sulla-bici-adesivo.jpg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74016), 2975361);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2975361, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2975361, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2975361, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2975361, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2975361, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2975361, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2975361, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2975361, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (6172044, 'umberto dianzani', 'C', 'https://static-cdn.zwift.com/prod/profile/d801d9a8-2977044')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74016), 6172044);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6172044, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6172044, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6172044, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6172044, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6172044, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6172044, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6172044, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6172044, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (6441343, 'Vincenzo Larocca', 'C', 'https://static-cdn.zwift.com/prod/profile/34dfbabf-3003887')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74016), 6441343);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6441343, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6441343, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6441343, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6441343, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6441343, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6441343, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6441343, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6441343, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (1992085, 'Claudio Varani', 'C', 'https://www.wtrl.racing/uploads/profile_picture/1667507823_ft00000062_26.JPG')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74016), 1992085);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1992085, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1992085, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1992085, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1992085, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1992085, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1992085, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1992085, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1992085, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (5023502, 'Thomas Fischer', 'C', 'https://static-cdn.zwift.com/prod/profile/1060de29-2484729')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74016), 5023502);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5023502, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5023502, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5023502, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5023502, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5023502, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5023502, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5023502, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5023502, 8, 'available');
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, club_id, member_count)
            VALUES ('TEAM INOX MONSTERS', 'C', 'Emerald', 1, 75151, 'cef70cde-9149-43a2-b3ae-187643a44703', 8)
            ON CONFLICT(wtrl_team_id) DO UPDATE SET name=excluded.name, category=excluded.category, division=excluded.division, member_count=excluded.member_count;
DELETE FROM team_members WHERE team_id = (SELECT id FROM teams WHERE wtrl_team_id = 75151);
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (1821578, 'Cesare Pisacane', 'C', 'https://www.wtrl.racing/uploads/profile_picture/1631218040_7462D583-9404-4189-9F75-0E59720F0438.jpeg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75151), 1821578);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1821578, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1821578, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1821578, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1821578, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1821578, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1821578, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1821578, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1821578, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (2336555, 'Davide Bertin', 'C', 'https://static-cdn.zwift.com/prod/profile/15fdb3b1-1257841')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75151), 2336555);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2336555, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2336555, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2336555, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2336555, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2336555, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2336555, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2336555, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2336555, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (2889372, 'Diego Burattini', 'C', 'https://static-cdn.zwift.com/prod/profile/28646f48-1527304')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75151), 2889372);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2889372, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2889372, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2889372, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2889372, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2889372, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2889372, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2889372, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2889372, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (7463714, 'Michael Kirscht INOX', 'C', 'https://static-cdn.zwift.com/prod/profile/c1eb2505-3259865')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75151), 7463714);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7463714, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7463714, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7463714, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7463714, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7463714, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7463714, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7463714, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7463714, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (7371977, 'Roberto Sanna', 'C', 'https://static-cdn.zwift.com/prod/profile/d72b00ef-3228693')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75151), 7371977);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7371977, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7371977, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7371977, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7371977, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7371977, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7371977, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7371977, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (7371977, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (943471, 'Salvatore Matarazzo', 'C', 'https://static-cdn.zwift.com/prod/profile/007a6588-482373')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75151), 943471);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (943471, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (943471, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (943471, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (943471, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (943471, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (943471, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (943471, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (943471, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (4583700, 'Sandro Giusti', 'C', 'https://www.wtrl.racing/uploads/profile_picture/1727186555_FB_IMG_1727186351400.jpg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75151), 4583700);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4583700, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4583700, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4583700, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4583700, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4583700, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4583700, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4583700, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4583700, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (5023502, 'Thomas Fischer', 'C', 'https://static-cdn.zwift.com/prod/profile/1060de29-2484729')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75151), 5023502);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5023502, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5023502, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5023502, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5023502, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5023502, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5023502, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5023502, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (5023502, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (397261, 'Chris Musgrove', 'C', 'https://www.wtrl.racing/uploads/profile_picture/1758559446_6ee2e3116d2aff6d992e70a8ac9c90ea64fb5a97.jpg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75151), 397261);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (397261, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (397261, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (397261, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (397261, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (397261, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (397261, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (397261, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (397261, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (1900916, 'Michele Puri', 'C', 'https://static-cdn.zwift.com/prod/profile/761ef5bc-1650164')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 75151), 1900916);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1900916, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1900916, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1900916, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1900916, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1900916, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1900916, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1900916, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1900916, 8, 'available');
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, club_id, member_count)
            VALUES ('Team INOX Trinacria', 'B', 'Blue', 2, 74930, 'cef70cde-9149-43a2-b3ae-187643a44703', 7)
            ON CONFLICT(wtrl_team_id) DO UPDATE SET name=excluded.name, category=excluded.category, division=excluded.division, member_count=excluded.member_count;
DELETE FROM team_members WHERE team_id = (SELECT id FROM teams WHERE wtrl_team_id = 74930);
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (810115, 'Loris Van de kassteele', 'B', 'https://www.wtrl.racing/uploads/profile_picture/1667772630_5D679C3D-7394-4DDE-B2F8-FDA0BBDB05F7.jpeg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74930), 810115);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (810115, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (810115, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (810115, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (810115, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (810115, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (810115, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (810115, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (810115, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (1842490, 'luca briccoli', 'B', 'https://static-cdn.zwift.com/prod/profile/159c1777-1007518')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74930), 1842490);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1842490, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1842490, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1842490, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1842490, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1842490, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1842490, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1842490, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1842490, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (2690375, 'Mario Cavallaro', 'B', 'https://static-cdn.zwift.com/prod/profile/4d307c5e-1459691')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74930), 2690375);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2690375, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2690375, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2690375, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2690375, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2690375, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2690375, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2690375, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (2690375, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (1152951, 'Miky Tedesco', 'B', 'https://www.wtrl.racing/uploads/profile_picture/1636451392_ridotta per profilo wtrl.jpg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74930), 1152951);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1152951, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1152951, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1152951, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1152951, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1152951, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1152951, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1152951, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (1152951, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (4333414, 'Paolo Spadaro', 'C', 'https://www.wtrl.racing/uploads/profile_picture/1649167028_WhatsApp Image 2022-04-05 at 15.56.34.jpeg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74930), 4333414);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4333414, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4333414, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4333414, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4333414, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4333414, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4333414, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4333414, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (4333414, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (3891733, 'Pierpaolo Varvazzo', 'B', 'https://static-cdn.zwift.com/prod/profile/28061bc8-2020867')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74930), 3891733);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3891733, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3891733, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3891733, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3891733, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3891733, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3891733, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3891733, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3891733, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (164627, 'Ricardo Santos', 'B', 'https://www.wtrl.racing/uploads/profile_picture/1727457203_20240730_080848.jpg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74930), 164627);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (164627, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (164627, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (164627, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (164627, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (164627, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (164627, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (164627, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (164627, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (3432509, 'Andrea Falchetti', 'B', 'https://www.wtrl.racing/uploads/profile_picture/1730758950_Screenshot_20241104_211553_Gallery.jpg')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74930), 3432509);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3432509, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3432509, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3432509, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3432509, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3432509, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3432509, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3432509, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (3432509, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (6059566, 'Antonio Caramia', 'C', 'https://static-cdn.zwift.com/prod/profile/67c40698-3288468')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74930), 6059566);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6059566, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6059566, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6059566, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6059566, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6059566, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6059566, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6059566, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (6059566, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (931830, 'Gaetano Lo verde', 'B', 'https://static-cdn.zwift.com/prod/profile/6a451d47-1122424')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74930), 931830);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (931830, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (931830, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (931830, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (931830, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (931830, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (931830, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (931830, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (931830, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (904546, 'giuseppe durante', 'B', 'https://static-cdn.zwift.com/prod/profile/e86590d0-465264')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74930), 904546);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (904546, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (904546, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (904546, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (904546, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (904546, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (904546, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (904546, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (904546, 8, 'available');
INSERT INTO athletes (zwid, name, base_category, avatar_url)
                        VALUES (475715, 'Simone Oppezzo', 'B', 'https://static-cdn.zwift.com/prod/profile/3d5b66e3-263432')
                        ON CONFLICT(zwid) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url, base_category=excluded.base_category;
                        
                        INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                        VALUES ((SELECT id FROM teams WHERE wtrl_team_id = 74930), 475715);
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (475715, 1, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (475715, 2, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (475715, 3, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (475715, 4, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (475715, 5, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (475715, 6, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (475715, 7, 'available');
INSERT OR IGNORE INTO availability (athlete_id, round_id, status) VALUES (475715, 8, 'available');
COMMIT;