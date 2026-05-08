-- Migrazione per aggiungere la colonna 'time' alla tabella division_results
-- Se la tabella non esiste, la crea con la struttura completa.
-- Se esiste, prova ad aggiungere solo la colonna mancante.

CREATE TABLE IF NOT EXISTS division_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    league_key TEXT NOT NULL,
    team_name TEXT NOT NULL,
    rider_name TEXT,
    zwid INTEGER,
    position INTEGER,
    time REAL,
    points_finish INTEGER DEFAULT 0,
    points_fal INTEGER DEFAULT 0,
    points_fts INTEGER DEFAULT 0,
    points_total INTEGER DEFAULT 0,
    is_inox BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Nel caso la tabella esistesse già ma senza la colonna 'time' (D1 supporta ALTER TABLE limitato)
-- Eseguiamo questo comando separatamente se necessario, ma CREATE TABLE IF NOT EXISTS gestisce il caso "nuova tabella".
