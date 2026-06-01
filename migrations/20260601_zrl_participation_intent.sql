-- Migration: Add ZRL Participation Intent
-- Date: 2026-06-01

CREATE TABLE IF NOT EXISTS zrl_participation_intent (
    zwid INTEGER NOT NULL,
    series_id INTEGER NOT NULL,
    intent BOOLEAN NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (zwid, series_id),
    FOREIGN KEY (zwid) REFERENCES athletes(zwid),
    FOREIGN KEY (series_id) REFERENCES series(id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_zrl_intent_series ON zrl_participation_intent(series_id);
