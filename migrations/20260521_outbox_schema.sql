-- Migrazione: Sistema Outbox e Idempotenza
-- Data: 2026-05-21

CREATE TABLE IF NOT EXISTS zrl_outbox_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    payload TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    retry_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_outbox_pending ON zrl_outbox_events(status) WHERE status = 'PENDING';

-- Nota: zrl_season_events potrebbe già esistere. Aggiungiamo il link all'outbox.
-- Se eseguita su un DB nuovo, assicurarsi che zrl_season_events sia creata.
CREATE TABLE IF NOT EXISTS zrl_season_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    outbox_id INTEGER,
    season_id INTEGER,
    step_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(outbox_id)
);
