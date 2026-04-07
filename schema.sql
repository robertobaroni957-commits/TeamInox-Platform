-- SCHEMA SQL PER INOXTEAM 2026 (Versione Integrata con gestioneZRL)

-- 1. UTENTI E ATLETI (Anagrafica Centrale)
CREATE TABLE IF NOT EXISTS athletes (
    zwid INTEGER PRIMARY KEY,        
    name TEXT NOT NULL,
    email TEXT,
    password_hash TEXT,              
    base_category TEXT,              
    is_registered_tour BOOLEAN DEFAULT 0,
    role TEXT DEFAULT 'athlete',     -- 'admin', 'captain', 'athlete'
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. STRUTTURA CAMPIONATI (Series -> Rounds)
CREATE TABLE IF NOT EXISTS series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,              -- es: 'ZRL Spring 2026'
    external_season_id INTEGER,      -- ID WTRL (es: 19)
    scoring_type TEXT DEFAULT 'points',
    is_active BOOLEAN DEFAULT 0,
    start_date DATETIME,
    end_date DATETIME
);

CREATE TABLE IF NOT EXISTS rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id INTEGER REFERENCES series(id),
    name TEXT NOT NULL,              -- es: 'Week 1', 'Round 2'
    date DATETIME,
    world TEXT,
    route TEXT,
    zwift_event_id INTEGER
);

-- 3. GESTIONE SQUADRE (Le tue 20 squadre)
CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,                   -- A, B, C, D
    division TEXT,                   -- Division 1, 2, 3...
    division_number INTEGER,
    captain_id INTEGER REFERENCES athletes(zwid),
    wtrl_team_id INTEGER UNIQUE,     -- ID per sync (es: 75150)
    club_id TEXT
);

-- Tabella di associazione Round-Teams (per definire quali team corrono in quale round e in che slot)
CREATE TABLE IF NOT EXISTS round_teams (
    round_id INTEGER REFERENCES rounds(id),
    team_id INTEGER REFERENCES teams(id),
    timeslot_id TEXT REFERENCES league_times(id),
    PRIMARY KEY (round_id, team_id)
);

-- 3b. ROSTER DEI TEAM (Membri effettivi dei team - Relazione Molti-a-Molti)
CREATE TABLE IF NOT EXISTS team_members (
    team_id INTEGER REFERENCES teams(id),
    athlete_id INTEGER REFERENCES athletes(zwid),
    PRIMARY KEY (team_id, athlete_id)
);

-- 4. LINEUP (Chi corre questa settimana - Un atleta può stare in UNA sola lineup per round)
CREATE TABLE IF NOT EXISTS race_lineup (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    round_id INTEGER REFERENCES rounds(id),
    team_id INTEGER REFERENCES teams(id),
    athlete_id INTEGER REFERENCES athletes(zwid),
    role TEXT DEFAULT 'starter',     -- 'starter', 'reserve'
    status TEXT DEFAULT 'pending',   -- 'pending', 'confirmed', 'rejected'
    UNIQUE(round_id, athlete_id)     -- VINCOLO: Solo una lineup per round per atleta
);

-- 5. RISULTATI (Dati Sauce + ZP)
CREATE TABLE IF NOT EXISTS results (
    round_id INTEGER REFERENCES rounds(id),
    zwid INTEGER REFERENCES athletes(zwid),
    time REAL,
    points_total INTEGER DEFAULT 0,
    data_source TEXT                 -- 'sauce_live', 'zwiftpower'
);

-- 6. DISPONIBILITÀ (RSVP per i Round)
CREATE TABLE IF NOT EXISTS availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    athlete_id INTEGER REFERENCES athletes(zwid),
    round_id INTEGER REFERENCES rounds(id),
    status TEXT DEFAULT 'available', -- 'available', 'unavailable', 'tentative'
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(athlete_id, round_id)
);

-- 7. PREFERENZE ORARIE (Nuovo sistema scheduling)
CREATE TABLE IF NOT EXISTS league_times (
    id TEXT PRIMARY KEY,
    region TEXT NOT NULL,          
    start_time_utc TEXT NOT NULL,  
    display_name TEXT NOT NULL,    
    slot_order INTEGER
);

CREATE TABLE IF NOT EXISTS user_time_preferences (
    zwid INTEGER NOT NULL,
    time_slot_id TEXT NOT NULL,
    preference_level INTEGER DEFAULT 1, -- 0: Impossible, 1: Acceptable, 2: Favorite
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (zwid, time_slot_id),
    FOREIGN KEY (zwid) REFERENCES athletes(zwid),
    FOREIGN KEY (time_slot_id) REFERENCES league_times(id)
);

-- Inizializzazione Slot Orari Standard ZRL (Convertiti in CEST per Parigi/Amsterdam)
INSERT OR REPLACE INTO league_times (id, region, start_time_utc, display_name, slot_order) VALUES
('EMEA_E', 'EMEA', '17:00', 'EMEA East (18:00 CEST)', 1),
('EMEA_C', 'EMEA', '18:30', 'EMEA Central (19:30 CEST)', 2),
('EMEA_W', 'EMEA', '20:00', 'EMEA West (21:00 CEST)', 3),
('AMER_E', 'Americas', '23:00', 'Americas East (00:00+1 CEST)', 4),
('AMER_W', 'Americas', '01:00', 'Americas West (02:00+1 CEST)', 5),
('OCEANIA', 'Oceania', '09:00', 'Oceania (10:00 CEST)', 6);

-- 8. EVENTI SETTIMANALI INOX
CREATE TABLE IF NOT EXISTS inox_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    day_of_week TEXT NOT NULL,       -- Lunedì, Martedì, etc.
    time TEXT NOT NULL,              -- 18:30, 19:20, etc.
    description TEXT,
    zwift_link TEXT,
    category TEXT,                   -- Race, Recon, Social
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- POPOLAMENTO EVENTI REALI TEAM INOX
INSERT OR REPLACE INTO inox_events (name, day_of_week, time, description, category, zwift_link) VALUES
('Stainless Race (**)', 'Lunedì', '18:30', 'Sharable, Public but not listed event. Richiede link diretto.', 'Race', 'https://www.zwift.com/events/tag/inox'),
('Discovering the RECON', 'Lunedì', '18:50', 'Ricognizione ufficiale dei percorsi di gara.', 'Recon', 'https://www.zwift.com/events/tag/inox'),
('Masters Winter Tour', 'Martedì', '19:20', 'Tappa settimanale del tour invernale.', 'MWT', 'https://www.zwift.com/events/tag/inox'),
('ZRL Day', 'Martedì', '20:00', 'Giornata di gare Zwift Racing League.', 'Race', 'https://www.wtrl.racing/zwift-racing-league/'),
('Phenotypes Cup 💨 Sprint (1/3)', 'Mercoledì', '18:45', 'Inox Master Phenotypes Cup - Parte 1: Sprint.', 'Phenotypes Cup', 'https://www.zwift.com/events/tag/inox'),
('Phenotypes Cup ⛰️ Climb (2/3)', 'Mercoledì', '19:05', 'Inox Master Phenotypes Cup - Parte 2: Scalatori.', 'Phenotypes Cup', 'https://www.zwift.com/events/tag/inox'),
('Phenotypes Cup ⏱️ TT (3/3)', 'Mercoledì', '19:25', 'Inox Master Phenotypes Cup - Parte 3: Cronometro.', 'Phenotypes Cup', 'https://www.zwift.com/events/tag/inox'),
('Full Gas Experience', 'Giovedì', '18:45', 'Evento ad alta intensità per testare la condizione.', 'Race', 'https://www.zwift.com/events/tag/inox'),
('Flash Sprint', 'Venerdì', '17:45', 'Gara veloce focalizzata sulla volata.', 'Race', 'https://www.zwift.com/events/tag/inox'),
('Flash Sprint', 'Venerdì', '18:45', 'Gara veloce focalizzata sulla volata (seconda sessione).', 'Race', 'https://www.zwift.com/events/tag/inox'),
('Masters Winter Tour', 'Venerdì', '19:20', 'Recupero o seconda sessione del tour invernale.', 'MWT', 'https://www.zwift.com/events/tag/inox'),
('Saturday Masters Trilogy (1/3)', 'Sabato', '18:00', 'Trilogia del Sabato - Gara 1.', 'Trilogy', 'https://www.zwift.com/events/tag/inox'),
('Saturday Masters Trilogy (2/3)', 'Sabato', '18:20', 'Trilogia del Sabato - Gara 2.', 'Trilogy', 'https://www.zwift.com/events/tag/inox'),
('Saturday Masters Trilogy (3/3)', 'Sabato', '18:40', 'Trilogia del Sabato - Gara 3.', 'Trilogy', 'https://www.zwift.com/events/tag/inox'),
('Sunday Masters Trilogy (1/3)', 'Domenica', '18:00', 'Trilogia della Domenica - Gara 1.', 'Trilogy', 'https://www.zwift.com/events/tag/inox'),
('Sunday Masters Trilogy (2/3)', 'Domenica', '18:20', 'Trilogia della Domenica - Gara 2.', 'Trilogy', 'https://www.zwift.com/events/tag/inox'),
('Sunday Masters Trilogy (3/3)', 'Domenica', '18:40', 'Trilogia della Domenica - Gara 3.', 'Trilogy', 'https://www.zwift.com/events/tag/inox');
