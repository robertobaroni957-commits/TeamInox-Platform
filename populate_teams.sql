PRAGMA foreign_keys = OFF;
-- Processing Team INOX AAB
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, tttid, league, member_count, is_dev) 
VALUES ('Team INOX AAB', 'C', 'Open Shamrock League Division C3', 3, 75150, 13732, '237', 12, 0)
ON CONFLICT(wtrl_team_id) DO UPDATE SET 
    name = excluded.name,
    category = excluded.category,
    division = excluded.division,
    division_number = excluded.division_number,
    tttid = excluded.tttid,
    league = excluded.league,
    member_count = excluded.member_count,
    is_dev = excluded.is_dev;
UPDATE teams SET 
    category = 'C', 
    division = 'Open Shamrock League Division C3', 
    division_number = 3, 
    wtrl_team_id = 75150, 
    tttid = 13732, 
    league = '237', 
    member_count = 12, 
    is_dev = 0
WHERE name = 'Team INOX AAB' AND wtrl_team_id IS NULL;

-- Processing Team INOX DEV
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, tttid, league, member_count, is_dev) 
VALUES ('Team INOX DEV', 'B', 'Open Lime League Division B1', 1, 75148, 13704, '235', 12, 0)
ON CONFLICT(wtrl_team_id) DO UPDATE SET 
    name = excluded.name,
    category = excluded.category,
    division = excluded.division,
    division_number = excluded.division_number,
    tttid = excluded.tttid,
    league = excluded.league,
    member_count = excluded.member_count,
    is_dev = excluded.is_dev;
UPDATE teams SET 
    category = 'B', 
    division = 'Open Lime League Division B1', 
    division_number = 1, 
    wtrl_team_id = 75148, 
    tttid = 13704, 
    league = '235', 
    member_count = 12, 
    is_dev = 0
WHERE name = 'Team INOX DEV' AND wtrl_team_id IS NULL;

-- Processing TEAM INOX ELITE
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, tttid, league, member_count, is_dev) 
VALUES ('TEAM INOX ELITE', 'A', 'WITHDRAWN - UNDER MIN MEMBERS (2410A0)', 0, 75144, 14386, '241', 1, 0)
ON CONFLICT(wtrl_team_id) DO UPDATE SET 
    name = excluded.name,
    category = excluded.category,
    division = excluded.division,
    division_number = excluded.division_number,
    tttid = excluded.tttid,
    league = excluded.league,
    member_count = excluded.member_count,
    is_dev = excluded.is_dev;
UPDATE teams SET 
    category = 'A', 
    division = 'WITHDRAWN - UNDER MIN MEMBERS (2410A0)', 
    division_number = 0, 
    wtrl_team_id = 75144, 
    tttid = 14386, 
    league = '241', 
    member_count = 1, 
    is_dev = 0
WHERE name = 'TEAM INOX ELITE' AND wtrl_team_id IS NULL;

-- Processing Team INOX FIRE
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, tttid, league, member_count, is_dev) 
VALUES ('Team INOX FIRE', 'C', 'Open Lime League Division C2', 2, 74016, 16604, '235', 11, 0)
ON CONFLICT(wtrl_team_id) DO UPDATE SET 
    name = excluded.name,
    category = excluded.category,
    division = excluded.division,
    division_number = excluded.division_number,
    tttid = excluded.tttid,
    league = excluded.league,
    member_count = excluded.member_count,
    is_dev = excluded.is_dev;
UPDATE teams SET 
    category = 'C', 
    division = 'Open Lime League Division C2', 
    division_number = 2, 
    wtrl_team_id = 74016, 
    tttid = 16604, 
    league = '235', 
    member_count = 11, 
    is_dev = 0
WHERE name = 'Team INOX FIRE' AND wtrl_team_id IS NULL;

-- Processing TEAM INOX LOL
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, tttid, league, member_count, is_dev) 
VALUES ('TEAM INOX LOL', 'D', 'Open Lime League Division D1', 1, 75258, 13973, '235', 11, 0)
ON CONFLICT(wtrl_team_id) DO UPDATE SET 
    name = excluded.name,
    category = excluded.category,
    division = excluded.division,
    division_number = excluded.division_number,
    tttid = excluded.tttid,
    league = excluded.league,
    member_count = excluded.member_count,
    is_dev = excluded.is_dev;
UPDATE teams SET 
    category = 'D', 
    division = 'Open Lime League Division D1', 
    division_number = 1, 
    wtrl_team_id = 75258, 
    tttid = 13973, 
    league = '235', 
    member_count = 11, 
    is_dev = 0
WHERE name = 'TEAM INOX LOL' AND wtrl_team_id IS NULL;

-- Processing Team INOX MADNESS
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, tttid, league, member_count, is_dev) 
VALUES ('Team INOX MADNESS', 'B', 'Open Emerald League Division B1', 1, 75145, 15021, '233', 10, 0)
ON CONFLICT(wtrl_team_id) DO UPDATE SET 
    name = excluded.name,
    category = excluded.category,
    division = excluded.division,
    division_number = excluded.division_number,
    tttid = excluded.tttid,
    league = excluded.league,
    member_count = excluded.member_count,
    is_dev = excluded.is_dev;
UPDATE teams SET 
    category = 'B', 
    division = 'Open Emerald League Division B1', 
    division_number = 1, 
    wtrl_team_id = 75145, 
    tttid = 15021, 
    league = '233', 
    member_count = 10, 
    is_dev = 0
WHERE name = 'Team INOX MADNESS' AND wtrl_team_id IS NULL;

-- Processing TEAM INOX MONSTERS
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, tttid, league, member_count, is_dev) 
VALUES ('TEAM INOX MONSTERS', 'C', 'Open Emerald League Division C1', 1, 75151, 16868, '233', 10, 0)
ON CONFLICT(wtrl_team_id) DO UPDATE SET 
    name = excluded.name,
    category = excluded.category,
    division = excluded.division,
    division_number = excluded.division_number,
    tttid = excluded.tttid,
    league = excluded.league,
    member_count = excluded.member_count,
    is_dev = excluded.is_dev;
UPDATE teams SET 
    category = 'C', 
    division = 'Open Emerald League Division C1', 
    division_number = 1, 
    wtrl_team_id = 75151, 
    tttid = 16868, 
    league = '233', 
    member_count = 10, 
    is_dev = 0
WHERE name = 'TEAM INOX MONSTERS' AND wtrl_team_id IS NULL;

-- Processing Team INOX NIGHTMARE
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, tttid, league, member_count, is_dev) 
VALUES ('Team INOX NIGHTMARE', 'B', 'WITHDRAWN - UNDER MIN MEMBERS (2350B0)', 0, 75152, 14596, '235', 0, 0)
ON CONFLICT(wtrl_team_id) DO UPDATE SET 
    name = excluded.name,
    category = excluded.category,
    division = excluded.division,
    division_number = excluded.division_number,
    tttid = excluded.tttid,
    league = excluded.league,
    member_count = excluded.member_count,
    is_dev = excluded.is_dev;
UPDATE teams SET 
    category = 'B', 
    division = 'WITHDRAWN - UNDER MIN MEMBERS (2350B0)', 
    division_number = 0, 
    wtrl_team_id = 75152, 
    tttid = 14596, 
    league = '235', 
    member_count = 0, 
    is_dev = 0
WHERE name = 'Team INOX NIGHTMARE' AND wtrl_team_id IS NULL;

-- Processing Team INOX PRO
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, tttid, league, member_count, is_dev) 
VALUES ('Team INOX PRO', 'C', 'SUSPENDED - TEAM NO-SHOW (2350C0)(TEAM NO-SHOW)', 2, 75149, 13730, '235', 12, 0)
ON CONFLICT(wtrl_team_id) DO UPDATE SET 
    name = excluded.name,
    category = excluded.category,
    division = excluded.division,
    division_number = excluded.division_number,
    tttid = excluded.tttid,
    league = excluded.league,
    member_count = excluded.member_count,
    is_dev = excluded.is_dev;
UPDATE teams SET 
    category = 'C', 
    division = 'SUSPENDED - TEAM NO-SHOW (2350C0)(TEAM NO-SHOW)', 
    division_number = 2, 
    wtrl_team_id = 75149, 
    tttid = 13730, 
    league = '235', 
    member_count = 12, 
    is_dev = 0
WHERE name = 'Team INOX PRO' AND wtrl_team_id IS NULL;

-- Processing Team INOX Trinacria
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, tttid, league, member_count, is_dev) 
VALUES ('Team INOX Trinacria', 'B', 'Open Blue League Division B2', 2, 74930, 18013, '241', 10, 0)
ON CONFLICT(wtrl_team_id) DO UPDATE SET 
    name = excluded.name,
    category = excluded.category,
    division = excluded.division,
    division_number = excluded.division_number,
    tttid = excluded.tttid,
    league = excluded.league,
    member_count = excluded.member_count,
    is_dev = excluded.is_dev;
UPDATE teams SET 
    category = 'B', 
    division = 'Open Blue League Division B2', 
    division_number = 2, 
    wtrl_team_id = 74930, 
    tttid = 18013, 
    league = '241', 
    member_count = 10, 
    is_dev = 0
WHERE name = 'Team INOX Trinacria' AND wtrl_team_id IS NULL;

-- Processing Team INOX TURTLES
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, tttid, league, member_count, is_dev) 
VALUES ('Team INOX TURTLES', 'D', 'SUSPENDED - TEAM NO-SHOW (2360D0)(TEAM NO-SHOW)', 1, 75570, 18235, '236', 10, 0)
ON CONFLICT(wtrl_team_id) DO UPDATE SET 
    name = excluded.name,
    category = excluded.category,
    division = excluded.division,
    division_number = excluded.division_number,
    tttid = excluded.tttid,
    league = excluded.league,
    member_count = excluded.member_count,
    is_dev = excluded.is_dev;
UPDATE teams SET 
    category = 'D', 
    division = 'SUSPENDED - TEAM NO-SHOW (2360D0)(TEAM NO-SHOW)', 
    division_number = 1, 
    wtrl_team_id = 75570, 
    tttid = 18235, 
    league = '236', 
    member_count = 10, 
    is_dev = 0
WHERE name = 'Team INOX TURTLES' AND wtrl_team_id IS NULL;

-- Processing Team INOX WARRIORS
INSERT INTO teams (name, category, division, division_number, wtrl_team_id, tttid, league, member_count, is_dev) 
VALUES ('Team INOX WARRIORS', 'B', 'SUSPENDED - TEAM NO-SHOW (2310B0)(TEAM NO-SHOW)', 1, 76139, 17159, '231', 7, 0)
ON CONFLICT(wtrl_team_id) DO UPDATE SET 
    name = excluded.name,
    category = excluded.category,
    division = excluded.division,
    division_number = excluded.division_number,
    tttid = excluded.tttid,
    league = excluded.league,
    member_count = excluded.member_count,
    is_dev = excluded.is_dev;
UPDATE teams SET 
    category = 'B', 
    division = 'SUSPENDED - TEAM NO-SHOW (2310B0)(TEAM NO-SHOW)', 
    division_number = 1, 
    wtrl_team_id = 76139, 
    tttid = 17159, 
    league = '231', 
    member_count = 7, 
    is_dev = 0
WHERE name = 'Team INOX WARRIORS' AND wtrl_team_id IS NULL;

PRAGMA foreign_keys = ON;
