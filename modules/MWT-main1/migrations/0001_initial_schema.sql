-- --------------------------------------------------
-- Migration script to initialize the D1 database.
-- To run: wrangler d1 execute <db-name> --file=migrate_to_d1.sql
-- --------------------------------------------------

-- Drop tables if they exist for a clean slate
DROP TABLE IF EXISTS race_data;
DROP TABLE IF EXISTS app_state;

-- Create a table to hold raw JSON data for each race file
CREATE TABLE race_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    race_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    json_content TEXT NOT NULL,
    UNIQUE(race_id, file_name)
);

-- Create a table for application state, like the cumulative results
CREATE TABLE app_state (
    key TEXT PRIMARY KEY,
    json_value TEXT NOT NULL
);

-- Create a table for users
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT 0
);
