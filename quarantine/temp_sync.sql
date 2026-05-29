INSERT OR IGNORE INTO series (id, name, external_season_id, is_active) VALUES (1, 'Season 2025', 19, 1);
INSERT OR IGNORE INTO rounds (id, series_id, name) VALUES (4, 1, 'Round 4');
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, club_id, member_count)
            VALUES ('Team INOX AAB', 'C', 'Shamrock', 3, 75150, 'cef70cde-9149-43a2-b3ae-187643a44703', 12)
            ON CONFLICT(wtrl_team_id) DO UPDATE SET name=excluded.name, category=excluded.category, division=excluded.division, member_count=excluded.member_count;
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, club_id, member_count)
            VALUES ('Team INOX MADNESS', 'B', 'Emerald', 1, 75145, 'cef70cde-9149-43a2-b3ae-187643a44703', 9)
            ON CONFLICT(wtrl_team_id) DO UPDATE SET name=excluded.name, category=excluded.category, division=excluded.division, member_count=excluded.member_count;
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, club_id, member_count)
            VALUES ('Team INOX FIRE', 'C', 'Lime', 2, 74016, 'cef70cde-9149-43a2-b3ae-187643a44703', 10)
            ON CONFLICT(wtrl_team_id) DO UPDATE SET name=excluded.name, category=excluded.category, division=excluded.division, member_count=excluded.member_count;
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, club_id, member_count)
            VALUES ('TEAM INOX MONSTERS', 'C', 'Emerald', 1, 75151, 'cef70cde-9149-43a2-b3ae-187643a44703', 8)
            ON CONFLICT(wtrl_team_id) DO UPDATE SET name=excluded.name, category=excluded.category, division=excluded.division, member_count=excluded.member_count;
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, club_id, member_count)
            VALUES ('Team INOX Trinacria', 'B', 'Blue', 2, 74930, 'cef70cde-9149-43a2-b3ae-187643a44703', 9)
            ON CONFLICT(wtrl_team_id) DO UPDATE SET name=excluded.name, category=excluded.category, division=excluded.division, member_count=excluded.member_count;
