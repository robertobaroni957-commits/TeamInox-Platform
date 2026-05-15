-- Migration script to add new user fields
-- MWT_Cloudflare_App/migrations/0002_add_user_fields.sql

ALTER TABLE users ADD COLUMN email TEXT UNIQUE;
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'team_member';
ALTER TABLE users ADD COLUMN zwift_username TEXT;
ALTER TABLE users ADD COLUMN zwift_password_encrypted TEXT;