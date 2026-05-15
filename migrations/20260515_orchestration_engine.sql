-- EVENT STORE: Immutable log of all operations
CREATE TABLE IF NOT EXISTS zrl_season_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    sequence_number INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    event_type TEXT NOT NULL, -- STARTED, COMPLETED, FAILED, CHECKPOINT
    payload TEXT, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- IDEMPOTENCY: Guaranteed atomic execution gate
CREATE TABLE IF NOT EXISTS zrl_idempotency_keys (
    idempotency_key TEXT PRIMARY KEY,
    season_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- DISTRIBUTED LOCK: Lease-based concurrency control
CREATE TABLE IF NOT EXISTS zrl_orchestrator_locks (
    season_id INTEGER PRIMARY KEY,
    owner_token TEXT NOT NULL,
    expires_at DATETIME NOT NULL
);
