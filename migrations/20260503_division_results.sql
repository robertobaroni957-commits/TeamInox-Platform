-- Migrazione: Aggiunta tabella per i risultati completi delle divisioni
-- Data: 2026-05-03

CREATE TABLE IF NOT EXISTS division_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER NOT NULL,
    league_key TEXT NOT NULL,
    team_name TEXT,
    rider_name TEXT,
    zwid INTEGER, 
    position INTEGER,
    time REAL,
    points_finish INTEGER DEFAULT 0,
    points_fal INTEGER DEFAULT 0,
    points_fts INTEGER DEFAULT 0,
    points_total INTEGER DEFAULT 0,
    is_inox BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (round_id) REFERENCES rounds(id)
);

-- Indice per velocizzare il recupero dei risultati di un round/divisione
CREATE INDEX IF NOT EXISTS idx_div_res_round_key ON division_results(round_id, league_key);
CREATE INDEX IF NOT EXISTS idx_div_res_inox ON division_results(is_inox);

-- Aggiornamento tabella results esistente (se necessario per coerenza)
-- Aggiungiamo colonne di dettaglio anche alla tabella principale dei nostri atleti
ALTER TABLE results ADD COLUMN points_finish INTEGER DEFAULT 0;
ALTER TABLE results ADD COLUMN points_fal INTEGER DEFAULT 0;
ALTER TABLE results ADD COLUMN points_fts INTEGER DEFAULT 0;
ALTER TABLE results ADD COLUMN position INTEGER;
