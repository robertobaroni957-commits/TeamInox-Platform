-- Script per inserire l'utente admin nel database D1
-- Utilizza un hash bcrypt pre-generato per la password.

INSERT INTO athletes (name, email, password_hash, role) 
VALUES ('Admin User', 'admin@teaminox.it', '$2a$12$0aDurDL548QrlpUXGr/0Oe1RltTyrxwx6Z4uXpIu65g1KTk1AWft6', 'admin');
