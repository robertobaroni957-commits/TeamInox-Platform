-- Script per inserire l'utente admin nel database D1 con password hashata corretta.
-- Nota: Questo script sovrascrive un eventuale utente admin esistente con la stessa email.

DELETE FROM athletes WHERE email = 'admin@teaminox.it';

INSERT INTO athletes (name, email, password_hash, role) 
VALUES ('Admin User', 'admin@teaminox.it', '$2a$12$0aDurDL548QrlpUXGr/0Oe1RltTyrxwx6Z4uXpIu65g1KTk1AWft6', 'admin');
