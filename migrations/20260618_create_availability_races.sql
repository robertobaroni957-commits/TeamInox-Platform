-- Migration: Create availability_races table
-- This table stores per-race availability for riders in the ZRL.
-- The CanonicalRepository and availability API both reference this table
-- for storing and querying race-level availability status.

CREATE TABLE IF NOT EXISTS availability_races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zwid INTEGER NOT NULL,
    race_id INTEGER NOT NULL,
    status TEXT DEFAULT 'unavailable',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zwid) REFERENCES athletes(zwid),
    FOREIGN KEY (race_id) REFERENCES zrl_races(id),
    UNIQUE(zwid, race_id)
);
