-- 1. EVENT STORE: Immutable log of all operations (Append Only)
CREATE TABLE IF NOT EXISTS zrl_season_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    season_id INTEGER NOT NULL,
    sequence_number INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    event_type TEXT NOT NULL, -- INTENT_CREATED, STEP_STARTED, STEP_COMPLETED, STEP_FAILED
    payload TEXT, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(season_id, sequence_number)
);

-- 2. IDEMPOTENCY + INTENT GATE: Atomic execution gate
CREATE TABLE IF NOT EXISTS zrl_idempotency_keys (
    idempotency_key TEXT PRIMARY KEY, -- Hash(seasonId + step)
    status TEXT NOT NULL,             -- PENDING, COMPLETED, FAILED
    result_payload TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. DISTRIBUTED LOCK: Lease-based concurrency control
CREATE TABLE IF NOT EXISTS zrl_orchestrator_locks (
    season_id INTEGER PRIMARY KEY,
    owner_token TEXT NOT NULL,
    expires_at DATETIME NOT NULL
);
