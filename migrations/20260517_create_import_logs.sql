-- Migrazione: Creazione tabella log importazioni WTRL
-- Data: 2026-05-17

CREATE TABLE IF NOT EXISTS wtrl_import_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    filename TEXT NOT NULL,
    imported_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
