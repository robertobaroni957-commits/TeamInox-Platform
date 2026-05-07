-- ============================================
-- ZRL MIGRATION - CLOUDFLARE D1 COMPATIBLE
-- ============================================

PRAGMA foreign_keys = OFF;

-- ============================================
-- 1. TABLE: zrl_seasons
-- ============================================
CREATE TABLE IF NOT EXISTS zrl_seasons (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    external_season_id INTEGER,
    scoring_type TEXT DEFAULT 'points',
    is_active BOOLEAN DEFAULT 0,
    start_date DATETIME,
    end_date DATETIME
);

-- ============================================
-- 2. TABLE: zrl_round_groups
-- ============================================
CREATE TABLE IF NOT EXISTS zrl_round_groups (
    id INTEGER PRIMARY KEY,
    series_id INTEGER NOT NULL,
    round_index_in_season INTEGER NOT NULL,
    custom_round_group_id INTEGER NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (series_id) REFERENCES zrl_seasons(id),

    UNIQUE(series_id, round_index_in_season),
    UNIQUE(series_id, custom_round_group_id)
);

-- ============================================
-- 3. TABLE: zrl_races
-- ============================================
CREATE TABLE IF NOT EXISTS zrl_races (
    id INTEGER PRIMARY KEY,
    series_id INTEGER NOT NULL,
    zrl_round_group_id INTEGER,
    name TEXT NOT NULL,
    date DATETIME,
    world TEXT,
    route TEXT,
    zwift_event_id INTEGER,
    format TEXT DEFAULT 'Scratch',
    distance REAL DEFAULT 0,
    elevation REAL DEFAULT 0,
    powerups TEXT,
    strategy_details TEXT,
    category TEXT DEFAULT 'ALL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (series_id) REFERENCES zrl_seasons(id),
    FOREIGN KEY (zrl_round_group_id) REFERENCES zrl_round_groups(id)
);

-- ============================================
-- 4. MIGRATION: series → zrl_seasons
-- ============================================
INSERT OR IGNORE INTO zrl_seasons (
    id,
    name,
    external_season_id,
    scoring_type,
    is_active,
    start_date,
    end_date
)
SELECT
    id,
    name,
    external_season_id,
    scoring_type,
    is_active,
    start_date,
    end_date
FROM series;

-- ============================================
-- 5. MIGRATION: rounds → zrl_races
-- ============================================
INSERT OR IGNORE INTO zrl_races (
    id,
    series_id,
    name,
    date,
    world,
    route,
    zwift_event_id,
    format,
    distance,
    elevation,
    powerups,
    strategy_details,
    category
)
SELECT
    id,
    series_id,
    name,
    date,
    world,
    route,
    zwift_event_id,
    format,
    distance,
    elevation,
    powerups,
    strategy_details,
    category
FROM rounds;

-- ============================================
-- 6. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_zrl_races_series_id
ON zrl_races(series_id);

CREATE INDEX IF NOT EXISTS idx_zrl_races_zrl_round_group_id
ON zrl_races(zrl_round_group_id);

CREATE INDEX IF NOT EXISTS idx_zrl_round_groups_series_id
ON zrl_round_groups(series_id);

-- ============================================
-- END MIGRATION
-- ============================================