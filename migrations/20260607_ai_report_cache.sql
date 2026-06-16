-- Migration: AI Report Cache
-- Date: 2026-06-07
-- Description: Table for caching AI generated reports to avoid redundant API calls and costs.

CREATE TABLE IF NOT EXISTS zrl_ai_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL, -- WTRL Team ID
    report_type TEXT NOT NULL CHECK(report_type IN ('race', 'round', 'season', 'rider')),
    content TEXT NOT NULL,
    model TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    hash TEXT UNIQUE NOT NULL
);

-- Index for fast lookup by race and team (primary access pattern)
CREATE INDEX IF NOT EXISTS idx_ai_reports_lookup 
ON zrl_ai_reports (round_id, team_id);

-- Index for filtering by report type if needed for analytics/batching
CREATE INDEX IF NOT EXISTS idx_ai_reports_type 
ON zrl_ai_reports (report_type);
