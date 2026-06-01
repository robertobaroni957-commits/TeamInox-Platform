-- Final Update: ZRL Color League Times (OPEN Regular)
-- Reference: Paris/Amsterdam (CEST, UTC+2)

DELETE FROM league_times;

INSERT INTO league_times (id, region, start_time_utc, display_name, slot_order) VALUES
('T1',  'APAC', '04:00', 'Red League (06:00)', 1),
('T2',  'APAC', '05:00', 'Cherry League (07:00)', 2),
('T3',  'APAC', '07:30', 'Crimson League (09:30)', 3),
('T4',  'APAC', '08:30', 'Yellow League (10:30)', 4),
('T5',  'APAC', '09:30', 'Pink League (11:30)', 5),
('T6',  'APAC', '10:00', 'Orange League (12:00)', 6),
('T7',  'APAC', '11:00', 'Ruby League (13:00)', 7),
('T8',  'APAC', '12:00', 'Topaz League (14:00)', 8),
('T9',  'EMEA', '16:00', 'Green League (18:00)', 9),
('T10', 'EMEA', '16:30', 'Emerald League (18:30)', 10),
('T11', 'EMEA', '17:00', 'Lime League (19:00)', 11),
('T12', 'EMEA', '17:15', 'Mint League (19:15)', 12),
('T13', 'EMEA', '17:30', 'Shamrock League (19:30)', 13),
('T14', 'EMEA', '17:45', 'Blue League (19:45)', 14),
('T15', 'EMEA', '18:00', 'Aqua League (20:00)', 15),
('T16', 'EMEA', '18:15', 'Cobalt League (20:15)', 16),
('T17', 'EMEA', '18:30', 'Navy League (20:30)', 17),
('T18', 'EMEA', '18:45', 'Royal League (20:45)', 18),
('T19', 'EMEA', '20:00', 'Teal League (22:00)', 19),
('T20', 'AMER', '23:30', 'Purple League (01:30)', 20),
('T21', 'AMER', '00:30', 'Lavender League (02:30)', 21),
('T22', 'AMER', '01:45', 'Lilac League (03:45)', 22);
