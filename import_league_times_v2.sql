-- Updating ZRL League Times for Season 19 (OPEN)
-- Using Color League names from OCR data
-- Times are for Paris/Amsterdam (CEST, UTC+2)

DELETE FROM league_times;

INSERT INTO league_times (id, region, start_time_utc, display_name, slot_order) VALUES
('T1', 'APAC', '04:00', 'Red League (06:00)', 1),
('T2', 'APAC', '05:00', 'Cherry League (07:00)', 2),
('T3', 'APAC', '05:30', 'Crimson League (07:30)', 3),
('T4', 'APAC', '07:30', 'Yellow League (09:30)', 4),
('T5', 'APAC', '08:30', 'Pink League (10:30)', 5),
('T6', 'APAC', '09:30', 'Orange League (11:30)', 6),
('T7', 'APAC', '10:00', 'Ruby League (12:00)', 7),
('T8', 'APAC', '11:00', 'Topaz League (13:00)', 8),
('T9', 'APAC', '12:00', 'Green League (14:00)', 9),
-- Afternoon / Evening Slots (EMEA)
('T10', 'EMEA', '16:00', 'Emerald League (18:00)', 10),
('T11', 'EMEA', '16:30', 'Lime League (18:30)', 11),
('T12', 'EMEA', '17:00', 'Mint League (19:00)', 12),
('T13', 'EMEA', '17:15', 'Shamrock League (19:15)', 13),
('T14', 'EMEA', '17:30', 'Blue League (19:30)', 14),
('T15', 'EMEA', '17:45', 'Aqua League (19:45)', 15),
('T16', 'EMEA', '18:00', 'Cobalt League (20:00)', 16),
('T17', 'EMEA', '18:15', 'Navy League (20:15)', 17),
('T18', 'EMEA', '18:30', 'Royal League (20:30)', 18),
('T19', 'EMEA', '18:45', 'Teal League (20:45)', 19),
-- Late Night / US Slots
('T20', 'AMER', '20:00', 'Purple League (22:00)', 20),
('T21', 'AMER', '22:30', 'Lavender League (00:30)', 21),
('T22', 'AMER', '23:45', 'Lilac League (01:45)', 22);
