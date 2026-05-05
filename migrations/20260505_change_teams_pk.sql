-- MIGRATION: Change teams PRIMARY KEY to wtrl_team_id
-- Description: Migrates teams table to use wtrl_team_id as PK and updates all dependent tables.
-- Also cleans up "old names" (teams without wtrl_team_id).

PRAGMA foreign_keys = OFF;

-- 1. CLEANUP: Delete teams that don't have a WTRL ID
DELETE FROM teams WHERE wtrl_team_id IS NULL OR wtrl_team_id = 0;

-- 2. CREATE NEW TEAMS TABLE
CREATE TABLE teams_new (
    wtrl_team_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    division TEXT,
    division_number INTEGER,
    captain_id INTEGER REFERENCES athletes(zwid),
    club_id TEXT,
    tttid INTEGER,
    club_name TEXT,
    gender TEXT,
    league TEXT,
    zrldivision TEXT,
    league_color TEXT,
    rec INTEGER,
    status INTEGER,
    is_dev INTEGER,
    rounds TEXT,
    member_count INTEGER
);

-- 3. MIGRATE DATA TO teams_new
-- Note: We use DISTINCT in case there were duplicates with the same wtrl_team_id
INSERT INTO teams_new (
    wtrl_team_id, name, category, division, division_number, captain_id,
    club_id, tttid, club_name, gender, league, zrldivision,
    league_color, rec, status, is_dev, rounds, member_count
)
SELECT 
    wtrl_team_id, MAX(name), MAX(category), MAX(division), MAX(division_number), MAX(captain_id),
    MAX(club_id), MAX(tttid), MAX(club_name), MAX(gender), MAX(league), MAX(zrldivision),
    MAX(league_color), MAX(rec), MAX(status), MAX(is_dev), MAX(rounds), MAX(member_count)
FROM teams
GROUP BY wtrl_team_id;

-- 4. CREATE NEW team_members TABLE
CREATE TABLE team_members_new (
    team_id INTEGER REFERENCES teams_new(wtrl_team_id),
    athlete_id INTEGER REFERENCES athletes(zwid),
    PRIMARY KEY (team_id, athlete_id)
);

-- 5. MIGRATE team_members
INSERT INTO team_members_new (team_id, athlete_id)
SELECT DISTINCT t.wtrl_team_id, tm.athlete_id
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
WHERE t.wtrl_team_id IS NOT NULL;

-- 6. CREATE NEW round_teams TABLE
CREATE TABLE round_teams_new (
    round_id INTEGER REFERENCES rounds(id),
    team_id INTEGER REFERENCES teams_new(wtrl_team_id),
    timeslot_id TEXT REFERENCES league_times(id),
    PRIMARY KEY (round_id, team_id)
);

-- 7. MIGRATE round_teams
INSERT INTO round_teams_new (round_id, team_id, timeslot_id)
SELECT DISTINCT rt.round_id, t.wtrl_team_id, rt.timeslot_id
FROM round_teams rt
JOIN teams t ON rt.team_id = t.id
WHERE t.wtrl_team_id IS NOT NULL;

-- 8. CREATE NEW race_lineup TABLE
CREATE TABLE race_lineup_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER REFERENCES rounds(id),
    team_id INTEGER REFERENCES teams_new(wtrl_team_id),
    athlete_id INTEGER REFERENCES athletes(zwid),
    role TEXT DEFAULT 'starter',
    status TEXT DEFAULT 'pending',
    UNIQUE(round_id, athlete_id)
);

-- 9. MIGRATE race_lineup
INSERT INTO race_lineup_new (round_id, team_id, athlete_id, role, status)
SELECT DISTINCT rl.round_id, t.wtrl_team_id, rl.athlete_id, rl.role, rl.status
FROM race_lineup rl
JOIN teams t ON rl.team_id = t.id
WHERE t.wtrl_team_id IS NOT NULL;

-- 10. REPLACE TABLES
DROP TABLE team_members;
DROP TABLE round_teams;
DROP TABLE race_lineup;
DROP TABLE teams;

ALTER TABLE teams_new RENAME TO teams;
ALTER TABLE team_members_new RENAME TO team_members;
ALTER TABLE round_teams_new RENAME TO round_teams;
ALTER TABLE race_lineup_new RENAME TO race_lineup;

PRAGMA foreign_keys = ON;
