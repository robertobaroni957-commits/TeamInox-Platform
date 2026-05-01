-- 9. MASTER WINTER TOUR (Punti e Regolamento)
CREATE TABLE IF NOT EXISTS winter_tour_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id INTEGER REFERENCES series(id),
    position INTEGER,
    points INTEGER,
    UNIQUE(series_id, position)
);

-- 10. RISULTATI STRAVA (Per Eventi Inox e Winter Tour)
CREATE TABLE IF NOT EXISTS strava_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER REFERENCES inox_events(id),
    athlete_id INTEGER REFERENCES athletes(zwid),
    activity_id TEXT,
    segment_id TEXT,
    elapsed_time INTEGER, -- in secondi
    moving_time INTEGER,
    average_watts REAL,
    rank_in_event INTEGER,
    points_awarded INTEGER,
    sync_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, athlete_id)
);

-- 11. TOKEN STRAVA (Per atleti che autorizzano il cronometraggio)
CREATE TABLE IF NOT EXISTS strava_tokens (
    athlete_id INTEGER PRIMARY KEY REFERENCES athletes(zwid),
    access_token TEXT,
    refresh_token TEXT,
    expires_at INTEGER,
    scope TEXT
);
