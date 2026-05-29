CREATE TABLE IF NOT EXISTS athletes (zwid INTEGER PRIMARY KEY, name TEXT, email TEXT, password_hash TEXT, role TEXT);
INSERT OR REPLACE INTO athletes (zwid, name, email, password_hash, role) VALUES (1, 'AdminInox', 'admin@teaminox.it', '$2a$10$T6xP3K9m/tO/N75oKqT2E.zTzM4u/fN4j8zVl5E9K7fB1L6jV1lG6', 'admin');
