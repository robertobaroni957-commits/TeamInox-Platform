-- FULL RESET SCRIPT - REVISED FOR FK CONSTRAINTS AND DATA POPULATION

PRAGMA foreign_keys = OFF;

-- =========================
-- 1. DELETE CHILD TABLES
-- =========================
DELETE FROM team_members;
DELETE FROM race_lineup;
DELETE FROM availability;
DELETE FROM user_time_preferences;
DELETE FROM results;

-- =========================
-- 2. DELETE PARENT TABLES
-- =========================
DELETE FROM teams;
DELETE FROM athletes WHERE zwid != 1;

-- =========================
-- 3. INSERT TEAMS
-- =========================
INSERT OR IGNORE INTO teams (name, wtrl_team_id, division, zrldivision, leagueColor)
VALUES ('TEAM INOX LOL', 75258, 'D', 'Lime', '#BFFF00');

INSERT OR IGNORE INTO teams (name, wtrl_team_id, division, zrldivision, leagueColor)
VALUES ('TEAM INOX MONSTERS', 75151, 'C', 'Emerald', '#50C878');

INSERT OR IGNORE INTO teams (name, wtrl_team_id, division, zrldivision, leagueColor)
VALUES ('Team INOX Trinacria', 74930, 'B', 'Blue', '#0000FF');

INSERT OR IGNORE INTO teams (name, wtrl_team_id, division, zrldivision, leagueColor)
VALUES ('Team INOX TURTLES', 75570, 'D', 'Mint', '#98FF98');

-- =========================
-- 4. INSERT ATHLETES
-- =========================
INSERT OR IGNORE INTO athletes (zwid, name, email, base_category, role)
VALUES (3252657, 'Andrea Cerri', 'a.cerri75@gmail.com', 'B', 'user');

INSERT OR IGNORE INTO athletes (zwid, name, email, base_category, role)
VALUES (1684452, 'BERSERK TEAM MEMBER', 'berserk@example.com', '?', 'user');

INSERT OR IGNORE INTO athletes (zwid, name, email, base_category, role)
VALUES (6922219, 'Nicholas Malvicini', 'nicholas.malvi@yahoo.com', 'B', 'user');

-- =========================
-- 5. TEAM MEMBERS
-- =========================
INSERT OR IGNORE INTO team_members (team_id, athlete_id)
SELECT T.id, 3252657 FROM teams T WHERE T.name = 'TEAM INOX LOL';

INSERT OR IGNORE INTO team_members (team_id, athlete_id)
SELECT T.id, 1684452 FROM teams T WHERE T.name = 'TEAM INOX LOL';

INSERT OR IGNORE INTO team_members (team_id, athlete_id)
SELECT T.id, 6922219 FROM teams T WHERE T.name = 'TEAM INOX LOL';

-- =========================
-- 6. ADMIN USER
-- =========================
INSERT OR REPLACE INTO athletes (zwid, name, email, password_hash, role)
VALUES (
  1,
  'Admin Inox',
  'admin@teaminox.it',
  '$2a$12$0aDurDL548QrlpUXGr/0Oe1RltTyrxwx6Z4uXpIu65g1KTk1AWft6',
  'admin'
);

PRAGMA foreign_keys = ON;