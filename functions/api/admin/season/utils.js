export async function ensureActiveSeason(db) {
    // 0. Assicura infrastruttura critica (Self-healing)
    await db.batch([
        db.prepare(`CREATE TABLE IF NOT EXISTS zrl_seasons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            external_season_id INTEGER,
            is_active BOOLEAN DEFAULT 0,
            status TEXT DEFAULT 'PENDING'
        )`),
        db.prepare(`CREATE TABLE IF NOT EXISTS zrl_outbox_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            payload TEXT NOT NULL,
            status TEXT DEFAULT 'PENDING',
            retry_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            processed_at DATETIME
        )`),
        db.prepare(`CREATE TABLE IF NOT EXISTS zrl_season_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            outbox_id INTEGER,
            season_id INTEGER,
            step_name TEXT NOT NULL,
            event_type TEXT NOT NULL,
            payload TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(outbox_id)
        )`),
        db.prepare(`CREATE TABLE IF NOT EXISTS season_lifecycle_status (
            season_id INTEGER PRIMARY KEY,
            status TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`),
        db.prepare(`CREATE TABLE IF NOT EXISTS series (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            external_season_id INTEGER,
            scoring_type TEXT DEFAULT 'points',
            is_active BOOLEAN DEFAULT 0,
            start_date DATETIME,
            end_date DATETIME
        )`),
        db.prepare(`CREATE TABLE IF NOT EXISTS rounds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            series_id INTEGER REFERENCES series(id),
            name TEXT NOT NULL,
            date DATETIME,
            world TEXT,
            route TEXT,
            distance REAL,
            elevation INTEGER,
            zwift_event_id INTEGER,
            status TEXT DEFAULT 'planned',
            strategy_details TEXT
        )`)
    ]);

    // 1. Verifica esistenza stagione attiva
    let activeSeason = await db.prepare("SELECT id FROM zrl_seasons WHERE is_active = 1 LIMIT 1").first();
    let seasonId = activeSeason?.id;

    // 2. Se non esiste, crea una stagione di default
    if (!seasonId) {
        const insert = await db.prepare("INSERT INTO zrl_seasons (name, is_active) VALUES (?, 1)")
            .bind("Season 2026")
            .run();
        seasonId = insert.meta.last_row_id;
    }

    // 3. Assicura entry in season_lifecycle_status
    await db.prepare(`
        INSERT OR REPLACE INTO season_lifecycle_status (season_id, status, updated_at)
        VALUES (?, 'READY', CURRENT_TIMESTAMP)
    `).bind(seasonId).run();

    return seasonId;
}

export async function requireActiveSeason(db) {
    return await ensureActiveSeason(db);
}
