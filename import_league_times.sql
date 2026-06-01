-- Populating ZRL League Times for Season 19 (OPEN)
-- Times provided in Paris/Amsterdam (CEST, UTC+2)

DELETE FROM league_times;

INSERT INTO league_times (id, region, start_time_utc, display_name, slot_order) VALUES
('T1', 'APAC', '04:00', '06:00 (T1)', 1),
('T2', 'APAC', '05:00', '07:00 (T2)', 2),
('T3', 'APAC', '05:30', '07:30 (T3)', 3),
('T4', 'APAC', '07:30', '09:30 (T4)', 4),
('T5', 'APAC', '08:30', '10:30 (T5)', 5),
('T6', 'APAC', '09:30', '11:30 (T6)', 6),
('T7', 'APAC', '10:00', '12:00 (T7)', 7),
('T8', 'APAC', '11:00', '13:00 (T8)', 8),
('T9', 'APAC', '12:00', '14:00 (T9)', 9),
('T10', 'EMEA', '16:00', '18:00 (T10)', 10),
('T11', 'EMEA', '16:30', '18:30 (T11)', 11),
('T12', 'EMEA', '17:00', '19:00 (T12)', 12),
('T13', 'EMEA', '17:15', '19:15 (T13)', 13),
('T14', 'EMEA', '17:30', '19:30 (T14)', 14),
('T15', 'EMEA', '17:45', '19:45 (T15)', 15),
('T16', 'EMEA', '18:00', '20:00 (T16)', 16),
('T17', 'EMEA', '18:15', '20:15 (T17)', 17),
('T18', 'EMEA', '18:30', '20:30 (T18)', 18),
('T19', 'EMEA', '18:45', '20:45 (T19)', 19);
