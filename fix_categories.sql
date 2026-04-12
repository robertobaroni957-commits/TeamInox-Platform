-- Correzione categorie Team INOX da MyTeam.html
UPDATE teams SET category = 'A' WHERE wtrl_team_id IN (75150, 75144, 75149); -- AAB, ELITE, PRO
UPDATE teams SET category = 'B' WHERE wtrl_team_id IN (75148, 75145, 76139); -- DEV, MADNESS, WARRIORS
UPDATE teams SET category = 'C' WHERE wtrl_team_id IN (74016, 75151, 75152, 74930); -- FIRE, MONSTERS, NIGHTMARE, Trinacria
UPDATE teams SET category = 'D' WHERE wtrl_team_id IN (75258, 75570); -- LOL, TURTLES
