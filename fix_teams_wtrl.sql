-- Aggiornamento Team INOX con ID reali da MyTeam.html
-- Aggiunta colonna race_pass_url se non esiste
ALTER TABLE teams ADD COLUMN race_pass_url TEXT;

INSERT INTO teams (name, category, division, wtrl_team_id, club_id, race_pass_url) VALUES
('Team INOX AAB', 'A', 'N/A', 75150, 'cef70cde-9149-43a2-b3ae-187643a44703', 'https://www.wtrl.racing/RacePass/eG1sbGM1UHhLWVRjK1RPME1GeGNpejBFaGZUNitNMnpod3o3aXl4aGMzND0='),
('Team INOX DEV', 'B', 'N/A', 75148, 'cef70cde-9149-43a2-b3ae-187643a44703', 'https://www.wtrl.racing/RacePass/Y0Rid1U1NUd6VUxTK3RubktjRGxRL3dPOU84aVpVTHBpSHB2VlZoR3VGOD0='),
('TEAM INOX ELITE', 'A', 'N/A', 75144, 'cef70cde-9149-43a2-b3ae-187643a44703', 'https://www.wtrl.racing/RacePass/Y0Rid1U1NUd6VUxTK3RubktjRGxRL3dPOU84aVpVTHBpSHB2VlZoR3VGOD0='),
('Team INOX FIRE', 'C', 'N/A', 74016, 'cef70cde-9149-43a2-b3ae-187643a44703', 'https://www.wtrl.racing/RacePass/ZFJicHBXWUFxdjBuTzd2dGhVS0FkcFdsUDNmWDI0Ky9sWXBod1JoK21DYz0='),
('TEAM INOX LOL', 'D', 'N/A', 75258, 'cef70cde-9149-43a2-b3ae-187643a44703', 'https://www.wtrl.racing/RacePass/RUNvUXcxZk9wSWJVMDJSSkpLc2VTMjRmaW5sZ3IyUnZPS2hmU0RZbHZlaz0='),
('Team INOX MADNESS', 'B', 'N/A', 75145, 'cef70cde-9149-43a2-b3ae-187643a44703', 'https://www.wtrl.racing/RacePass/ODM2ZGhncE94a3MxUGlId2xFVE1WWWpzd2o4clc3QmZpelpmYStxa3E2RT0='),
('TEAM INOX MONSTERS', 'C', 'N/A', 75151, 'cef70cde-9149-43a2-b3ae-187643a44703', 'https://www.wtrl.racing/RacePass/UmY2akdza0c4cnpOYVR2VjhxN1ByT0d1aGZLTGFtYlFqRm84YU9TVEJrTT0='),
('Team INOX NIGHTMARE', 'C', 'N/A', 75152, 'cef70cde-9149-43a2-b3ae-187643a44703', 'https://www.wtrl.racing/RacePass/UmY2akdza0c4cnpOYVR2VjhxN1ByT0d1aGZLTGFtYlFqRm84YU9TVEJrTT0='),
('Team INOX PRO', 'A', 'N/A', 75149, 'cef70cde-9149-43a2-b3ae-187643a44703', 'https://www.wtrl.racing/RacePass/RHdyTVRtN1Bmd293dDI3VmdFSTdoc014cjBGRElqWTNJU3lBamVkd3RXTT0='),
('Team INOX Trinacria', 'C', 'N/A', 74930, 'cef70cde-9149-43a2-b3ae-187643a44703', 'https://www.wtrl.racing/RacePass/SjVNbHBycy80a2Nxemh4NnhwSysrTGpqcThOclRaUzFubXVHR05LM3cyST0='),
('Team INOX TURTLES', 'D', 'N/A', 75570, 'cef70cde-9149-43a2-b3ae-187643a44703', 'https://www.wtrl.racing/RacePass/WE1IUFAvQUg4VGZHMUp3QVhSdURVSlMyNjZQWVdkeksraEtUVjhBcEhSTT0='),
('Team INOX WARRIORS', 'B', 'N/A', 76139, 'cef70cde-9149-43a2-b3ae-187643a44703', 'https://www.wtrl.racing/RacePass/cnZmV3Z1VWJLV1M5K3NDQk5MZnY4VjJiZHE0SGgrUmpTdUpmaTYwSXd1az0=')
ON CONFLICT(wtrl_team_id) DO UPDATE SET
    name = excluded.name,
    category = excluded.category,
    race_pass_url = excluded.race_pass_url;
