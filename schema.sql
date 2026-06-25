PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE IF NOT EXISTS "athletes" (
	"zwid"	INTEGER,
	"name"	TEXT,
	"email"	TEXT,
	"password_hash"	TEXT,
	"role"	TEXT,
	"base_category"	TEXT,
	"gender"	TEXT,
	"created_at"	DATETIME,
	"avatar_url"	TEXT,
	PRIMARY KEY("zwid")
);
CREATE TABLE IF NOT EXISTS "availability" (
	"id"	INTEGER,
	"zwid"	INTEGER,
	"round_id"	INTEGER,
	"status"	TEXT DEFAULT 'available',
	"updated_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("round_id") REFERENCES "rounds_legacy"("id"),
	FOREIGN KEY("zwid") REFERENCES "athletes"("zwid")
);
CREATE TABLE IF NOT EXISTS "d1_migrations" (
	"id"	INTEGER,
	"name"	TEXT UNIQUE,
	"applied_at"	TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "division_results" (
	"id"	INTEGER,
	"round_id"	INTEGER NOT NULL,
	"league_key"	TEXT NOT NULL,
	"team_name"	TEXT NOT NULL,
	"rider_name"	TEXT,
	"zwid"	INTEGER,
	"position"	INTEGER,
	"time"	REAL,
	"points_finish"	INTEGER DEFAULT 0,
	"points_fal"	INTEGER DEFAULT 0,
	"points_fts"	INTEGER DEFAULT 0,
	"points_total"	INTEGER DEFAULT 0,
	"is_inox"	BOOLEAN DEFAULT 0,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("round_id") REFERENCES "zrl_races"("id")
);
CREATE TABLE IF NOT EXISTS "graph_edges" (
	"source_type"	TEXT NOT NULL,
	"source_id"	INTEGER NOT NULL,
	"target_type"	TEXT NOT NULL,
	"target_id"	INTEGER NOT NULL,
	"edge_type"	TEXT NOT NULL,
	PRIMARY KEY("source_type","source_id","target_type","target_id","edge_type")
);
CREATE TABLE IF NOT EXISTS "inox_events" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL,
	"day_of_week"	TEXT NOT NULL,
	"time"	TEXT NOT NULL,
	"description"	TEXT,
	"zwift_link"	TEXT,
	"category"	TEXT,
	"is_active"	BOOLEAN DEFAULT 1,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"strava_segment_id"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "league_times" (
	"id"	TEXT,
	"region"	TEXT NOT NULL,
	"start_time_utc"	TEXT NOT NULL,
	"display_name"	TEXT NOT NULL,
	"slot_order"	INTEGER,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "race_lineup" (
	"id"	INTEGER,
	"round_id"	INTEGER,
	"team_id"	INTEGER,
	"athlete_id"	INTEGER,
	"role"	TEXT DEFAULT 'starter',
	"status"	TEXT DEFAULT 'pending',
	"race_id"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("athlete_id") REFERENCES "athletes"("zwid"),
	FOREIGN KEY("round_id") REFERENCES "rounds_legacy"("id"),
	FOREIGN KEY("team_id") REFERENCES "teams"("wtrl_team_id")
);
CREATE TABLE IF NOT EXISTS "races" (
	"id"	INTEGER,
	"round_id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL,
	"race_type"	TEXT,
	"scheduled_at"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("round_id") REFERENCES "rounds_legacy"("id")
);
CREATE TABLE IF NOT EXISTS "results" (
	"round_id"	INTEGER,
	"zwid"	INTEGER,
	"time"	REAL,
	"points_total"	INTEGER DEFAULT 0,
	"data_source"	TEXT,
	"points_finish"	INTEGER DEFAULT 0,
	"points_fal"	INTEGER DEFAULT 0,
	"points_fts"	INTEGER DEFAULT 0,
	"position"	INTEGER,
	FOREIGN KEY("round_id") REFERENCES "rounds_legacy"("id"),
	FOREIGN KEY("zwid") REFERENCES "athletes"("zwid")
);
CREATE TABLE IF NOT EXISTS "riders" (
	"id"	INTEGER,
	"zwid"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "round_teams" (
	"round_id"	INTEGER,
	"team_id"	INTEGER,
	"timeslot_id"	TEXT,
	PRIMARY KEY("round_id","team_id"),
	FOREIGN KEY("round_id") REFERENCES "rounds_legacy"("id"),
	FOREIGN KEY("team_id") REFERENCES "teams"("wtrl_team_id"),
	FOREIGN KEY("timeslot_id") REFERENCES "league_times"("id")
);
CREATE TABLE IF NOT EXISTS "rounds_legacy" (
	"id"	INTEGER,
	"series_id"	INTEGER,
	"name"	TEXT NOT NULL,
	"date"	DATETIME,
	"world"	TEXT,
	"route"	TEXT,
	"zwift_event_id"	INTEGER,
	"format"	TEXT DEFAULT 'Scratch',
	"distance"	REAL DEFAULT 0,
	"elevation"	REAL DEFAULT 0,
	"powerups"	TEXT,
	"strategy_details"	TEXT,
	"category"	TEXT DEFAULT 'ALL',
	"raw_json"	TEXT,
	"laps"	INTEGER,
	"status"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("series_id") REFERENCES "series"("id")
);
CREATE TABLE IF NOT EXISTS "rounds_table" (
	"id"	TEXT,
	"season_id"	TEXT NOT NULL,
	"name"	TEXT NOT NULL,
	"start_date"	TEXT NOT NULL,
	"end_date"	TEXT NOT NULL,
	"wtrl_id"	INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY("season_id") REFERENCES "season_table"("id")
);
CREATE TABLE IF NOT EXISTS "rounds" (
	"id"	INTEGER,
	"wtrl_id"	INTEGER,
	"season_code"	TEXT,
	"round_number"	INTEGER,
	"name"	TEXT NOT NULL,
	"starts_at"	TEXT,
	"ends_at"	TEXT,
	"sync_state"	TEXT DEFAULT 'PENDING',
	"created_at"	TEXT DEFAULT CURRENT_TIMESTAMP,
	"updated_at"	TEXT DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "season_action_log" (
	"id"	TEXT,
	"action"	TEXT NOT NULL,
	"season_id"	INTEGER NOT NULL,
	"status"	TEXT NOT NULL,
	"payload"	TEXT,
	"import_id"	TEXT,
	"sequence_number"	INTEGER,
	"version"	INTEGER DEFAULT 1,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "season_lifecycle_status" (
	"season_id"	INTEGER,
	"status"	TEXT NOT NULL,
	"updated_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("season_id")
);
CREATE TABLE IF NOT EXISTS "season_table" (
	"id"	TEXT,
	"label"	TEXT NOT NULL,
	"updated_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "series" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL,
	"external_season_id"	INTEGER,
	"scoring_type"	TEXT DEFAULT 'points',
	"is_active"	BOOLEAN DEFAULT 0,
	"start_date"	DATETIME,
	"end_date"	DATETIME,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "team_members" (
	"athlete_id"	INTEGER,
	"wtrl_rider_id"	INTEGER,
	"team_id"	INTEGER,
	"season_id"	TEXT,
	"name"	TEXT,
	"category"	TEXT,
	"is_active"	INTEGER DEFAULT 1,
	"last_import_id"	TEXT,
	PRIMARY KEY("athlete_id","team_id","season_id")
);
CREATE TABLE IF NOT EXISTS "teams" (
	"wtrl_team_id"	INTEGER,
	"name"	TEXT NOT NULL,
	"category"	TEXT,
	"division"	TEXT,
	"division_number"	INTEGER,
	"captain_id"	INTEGER,
	"club_id"	TEXT,
	"tttid"	INTEGER,
	"club_name"	TEXT,
	"gender"	TEXT,
	"league"	TEXT,
	"zrldivision"	TEXT,
	"league_color"	TEXT,
	"rec"	INTEGER,
	"status"	INTEGER,
	"is_dev"	INTEGER,
	"rounds"	TEXT,
	"member_count"	INTEGER,
	"season_code"	TEXT, season_id TEXT,
	PRIMARY KEY("wtrl_team_id"),
	FOREIGN KEY("captain_id") REFERENCES "athletes"("zwid")
);
CREATE TABLE IF NOT EXISTS "user_time_preferences" (
	"zwid"	INTEGER,
	"time_slot_id"	TEXT,
	"preference_level"	INTEGER DEFAULT 1,
	"updated_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("zwid","time_slot_id"),
	FOREIGN KEY("time_slot_id") REFERENCES "league_times"("id"),
	FOREIGN KEY("zwid") REFERENCES "athletes"("zwid")
);
CREATE TABLE IF NOT EXISTS "wtrl_import_locks" (
	"season_id"	INTEGER,
	"type"	TEXT,
	"import_id"	TEXT,
	PRIMARY KEY("season_id","type")
);
CREATE TABLE IF NOT EXISTS "wtrl_import_logs" (
	"id"	TEXT,
	"type"	TEXT,
	"season_id"	INTEGER,
	"imported_count"	INTEGER,
	"raw_snapshot"	TEXT,
	"status"	TEXT,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "wtrl_import_state" (
	"import_id"	TEXT,
	"season_id"	INTEGER,
	"type"	TEXT,
	"status"	TEXT,
	"updated_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("import_id")
);
CREATE TABLE IF NOT EXISTS "zrl_ai_reports" (
	"id"	INTEGER,
	"round_id"	INTEGER NOT NULL,
	"team_id"	INTEGER NOT NULL,
	"report_type"	TEXT NOT NULL CHECK("report_type" IN ('race', 'round', 'season', 'rider')),
	"content"	TEXT NOT NULL,
	"model"	TEXT NOT NULL,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"hash"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "zrl_idempotency_keys" (
	"idempotency_key"	TEXT,
	"status"	TEXT NOT NULL,
	"result_payload"	TEXT,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("idempotency_key")
);
CREATE TABLE IF NOT EXISTS "zrl_orchestrator_locks" (
	"season_id"	INTEGER,
	"owner_token"	TEXT NOT NULL,
	"expires_at"	DATETIME NOT NULL,
	PRIMARY KEY("season_id")
);
CREATE TABLE IF NOT EXISTS "zrl_outbox_events" (
	"id"	INTEGER,
	"event_type"	TEXT NOT NULL,
	"payload"	TEXT NOT NULL,
	"status"	TEXT DEFAULT 'PENDING',
	"retry_count"	INTEGER DEFAULT 0,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	"processed_at"	DATETIME,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "zrl_participation_intent" (
	"zwid"	INTEGER NOT NULL,
	"series_id"	INTEGER NOT NULL,
	"intent"	BOOLEAN NOT NULL,
	"updated_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("zwid","series_id"),
	FOREIGN KEY("series_id") REFERENCES "series"("id"),
	FOREIGN KEY("zwid") REFERENCES "athletes"("zwid")
);
CREATE TABLE IF NOT EXISTS "zrl_races" (
	"id"	INTEGER,
	"zrl_round_group_id"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL,
	"date"	DATETIME,
	"world"	TEXT,
	"route"	TEXT,
	"series_id"	INTEGER, raw_json TEXT, laps TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("zrl_round_group_id") REFERENCES "zrl_round_groups"("id")
);
CREATE TABLE IF NOT EXISTS "zrl_round_groups" (
	"id"	INTEGER,
	"series_id"	INTEGER,
	"round_index"	INTEGER,
	"external_season_id"	INTEGER,
	"description"	TEXT,
	"is_closed"	BOOLEAN DEFAULT 0,
	PRIMARY KEY("id"),
	FOREIGN KEY("series_id") REFERENCES "zrl_seasons"("id")
);
CREATE TABLE IF NOT EXISTS "zrl_season_events" (
	"id"	INTEGER,
	"season_id"	INTEGER NOT NULL,
	"sequence_number"	INTEGER NOT NULL,
	"step_name"	TEXT NOT NULL,
	"event_type"	TEXT NOT NULL,
	"payload"	TEXT,
	"trace_id"	TEXT,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "zrl_seasons" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL,
	"external_season_id"	INTEGER,
	"is_active"	BOOLEAN DEFAULT 0,
	"status"	TEXT,
	"scoring_type"	TEXT DEFAULT 'points',
	"start_date"	DATETIME,
	"end_date"	DATETIME,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "zrl_sequence_tracker" (
	"season_id"	INTEGER,
	"last_sequence_number"	INTEGER DEFAULT 0,
	PRIMARY KEY("season_id")
);
CREATE TABLE IF NOT EXISTS "zrl_team_standings" (
	"id"	INTEGER,
	"round_group_id"	INTEGER NOT NULL,
	"league_key"	TEXT NOT NULL,
	"league_name"	TEXT,
	"team_name"	TEXT NOT NULL,
	"rank"	INTEGER,
	"league_points"	INTEGER,
	"pts_fal"	INTEGER,
	"pts_fts"	INTEGER,
	"pts_finish"	INTEGER,
	"total_race_points"	INTEGER,
	"r1"	TEXT,
	"r2"	TEXT,
	"r3"	TEXT,
	"r4"	TEXT,
	"r5"	TEXT,
	"r6"	TEXT,
	"r7"	TEXT,
	"r8"	TEXT,
	"is_inox"	BOOLEAN DEFAULT 0,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("round_group_id") REFERENCES "zrl_round_groups"("id")
);
CREATE TABLE availability_races (zwid INTEGER, race_id INTEGER, status TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (zwid, race_id), FOREIGN KEY (zwid) REFERENCES athletes(zwid), FOREIGN KEY (race_id) REFERENCES zrl_races(id));
DELETE FROM sqlite_sequence;
CREATE INDEX "idx_availability_round" ON "availability" (
	"round_id"
);
CREATE INDEX "idx_events_season_seq" ON "zrl_season_events" (
	"season_id",
	"sequence_number"
);
CREATE INDEX "idx_events_trace" ON "zrl_season_events" (
	"trace_id"
);
CREATE INDEX "idx_locks_owner" ON "zrl_orchestrator_locks" (
	"owner_token"
);
CREATE INDEX "idx_race_lineup_round" ON "race_lineup" (
	"round_id"
);
CREATE UNIQUE INDEX "idx_race_lineup_unique" ON "race_lineup" (
	"round_id",
	"race_id",
	"athlete_id"
);
CREATE INDEX "idx_round_teams_round" ON "round_teams" (
	"round_id"
);
CREATE UNIQUE INDEX "idx_team_member" ON "team_members" (
	"team_id",
	"athlete_id"
);
CREATE INDEX "idx_zrl_intent_series" ON "zrl_participation_intent" (
	"series_id"
);
CREATE VIEW seasons AS SELECT id, 'zrl_25_26' AS code, name FROM zrl_seasons;
