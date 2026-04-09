-- 1. Rimuove TUTTI gli utenti con questa email (per evitare duplicati con zwid diversi)
DELETE FROM athletes WHERE email = 'admin@teaminox.it';

-- 2. Rimuove l'utente con ZwiftID 1 (ID standard per admin)
DELETE FROM athletes WHERE zwid = 1;

-- 3. Inserisce l'admin unico con password 'admin123'
-- Hash generato per 'admin123' (bcryptjs compatibile)
INSERT INTO athletes (zwid, name, email, password_hash, role) 
VALUES (1, 'Admin Inox', 'admin@teaminox.it', '$2a$12$0aDurDL548QrlpUXGr/0Oe1RltTyrxwx6Z4uXpIu65g1KTk1AWft6', 'admin');
