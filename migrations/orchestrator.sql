-- Orchestrator SQL Schema
CREATE TABLE IF NOT EXISTS zrl_season_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    sequence_number INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload TEXT,
    trace_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(season_id, sequence_number)
);

CREATE TABLE IF NOT EXISTS zrl_orchestrator_locks (
    season_id INTEGER PRIMARY KEY,
    owner_token TEXT NOT NULL,
    expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS zrl_sequence_tracker (
    season_id INTEGER PRIMARY KEY,
    current_value INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS zrl_idempotency_keys (
    idempotency_key TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    result_payload TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_season_seq ON zrl_season_events(season_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_locks_owner ON zrl_orchestrator_locks(owner_token);
