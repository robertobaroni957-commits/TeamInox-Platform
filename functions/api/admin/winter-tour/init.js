// functions/api/admin/winter-tour/init.js
// Endpoint: POST /api/admin/winter-tour/init
// Actions: init_schema | seed_scoring_rules | seed_stages | full_init | status

// ---------------------------------------------------------------------------
// Schema DDL — mirrors winter_tour_schema.sql, idempotent via IF NOT EXISTS
// ---------------------------------------------------------------------------
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS wt_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stage_number INTEGER NOT NULL UNIQUE,
  date TEXT NOT NULL,
  world_it TEXT NOT NULL,
  world_en TEXT NOT NULL,
  route_it TEXT NOT NULL,
  route_en TEXT NOT NULL,
  type_it TEXT NOT NULL,
  type_en TEXT NOT NULL,
  route_link TEXT,
  register_link TEXT,
  zwift_event_id INTEGER NOT NULL DEFAULT 0,
  segments TEXT,
  status TEXT DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS wt_scoring_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  position INTEGER NOT NULL,
  points INTEGER NOT NULL,
  UNIQUE(type, position)
);

CREATE TABLE IF NOT EXISTS wt_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stage_id INTEGER REFERENCES wt_stages(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  tname TEXT,
  zwid INTEGER NOT NULL,
  flag TEXT,
  punti_pos INTEGER,
  punti_fin INTEGER DEFAULT 0,
  punti_fal INTEGER DEFAULT 0,
  punti_fts INTEGER DEFAULT 0,
  punti_total INTEGER DEFAULT 0,
  tempo_time REAL DEFAULT 0,
  tempo_pos INTEGER,
  sprinter_points INTEGER DEFAULT 0,
  climber_points INTEGER DEFAULT 0,
  UNIQUE(stage_id, zwid)
);

CREATE TABLE IF NOT EXISTS wt_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

// ---------------------------------------------------------------------------
// Scoring rules — matches winter_tour_schema.sql default values
// ---------------------------------------------------------------------------
const SCORING_RULES = [
  // FIN
  { type: 'FIN', position: 1,  points: 100 },
  { type: 'FIN', position: 2,  points: 80  },
  { type: 'FIN', position: 3,  points: 70  },
  { type: 'FIN', position: 4,  points: 60  },
  { type: 'FIN', position: 5,  points: 55  },
  { type: 'FIN', position: 6,  points: 50  },
  { type: 'FIN', position: 7,  points: 45  },
  { type: 'FIN', position: 8,  points: 40  },
  { type: 'FIN', position: 9,  points: 36  },
  { type: 'FIN', position: 10, points: 32  },
  { type: 'FIN', position: 11, points: 29  },
  { type: 'FIN', position: 12, points: 26  },
  { type: 'FIN', position: 13, points: 24  },
  { type: 'FIN', position: 14, points: 22  },
  { type: 'FIN', position: 15, points: 20  },
  { type: 'FIN', position: 16, points: 18  },
  { type: 'FIN', position: 17, points: 16  },
  { type: 'FIN', position: 18, points: 14  },
  { type: 'FIN', position: 19, points: 12  },
  { type: 'FIN', position: 20, points: 10  },
  // FAL
  { type: 'FAL', position: 1,  points: 25 },
  { type: 'FAL', position: 2,  points: 21 },
  { type: 'FAL', position: 3,  points: 17 },
  { type: 'FAL', position: 4,  points: 14 },
  { type: 'FAL', position: 5,  points: 11 },
  { type: 'FAL', position: 6,  points: 8  },
  { type: 'FAL', position: 7,  points: 6  },
  { type: 'FAL', position: 8,  points: 4  },
  { type: 'FAL', position: 9,  points: 2  },
  { type: 'FAL', position: 10, points: 1  },
  // FTS
  { type: 'FTS', position: 1,  points: 25 },
  { type: 'FTS', position: 2,  points: 21 },
  { type: 'FTS', position: 3,  points: 17 },
  { type: 'FTS', position: 4,  points: 14 },
  { type: 'FTS', position: 5,  points: 11 },
  { type: 'FTS', position: 6,  points: 8  },
  { type: 'FTS', position: 7,  points: 6  },
  { type: 'FTS', position: 8,  points: 4  },
  { type: 'FTS', position: 9,  points: 2  },
  { type: 'FTS', position: 10, points: 1  },
];

// ---------------------------------------------------------------------------
// Stages — sourced from modules/MWT-main1/stages.json
// zwift_event_id is 0 by default; update via the admin UI after seeding.
// ---------------------------------------------------------------------------
const STAGES_SEED = [
  {
    stage_number: 1,
    date: "2025-12-12T19:20:00",
    world_it: "Scozia - Champion's Sprint per classifica sprinter, Breakaway Brae Rev e The Clyde Kicker per classifica scalatore",
    world_en: "Scotland - Champion's Sprint for sprinter ranking, Breakaway Brae Rev and The Clyde Kicker for climber ranking",
    route_it: "Outer Scotland (2 giri - 22.4 km - D+ 208 m)",
    route_en: "Outer Scotland (2 laps - 22.4 km - D+ 208 m)",
    type_it: "Point Hilly",
    type_en: "Point Hilly",
    route_link: "https://zwiftinsider.com/route/outer-scotland/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247620",
    zwift_event_id: 5247620,
    segments: JSON.stringify([
      { it: "Primo Champion's Sprint solo FTS", en: "First Champion's Sprint only FTS" },
      { it: "Primo Breakaway Brae reverse solo FTS", en: "First Breakaway Brae reverse only FTS" },
      { it: "Primo Clyde Kicker FAL & FTS", en: "First Clyde Kicker FAL & FTS" },
      { it: "Secondo Champion's Sprint FAL & FTS", en: "Second Champion's Sprint FAL & FTS" },
      { it: "Secondo Breakaway Brae reverse solo FAL", en: "Second Breakaway Brae reverse only FAL" },
      { it: "Secondo Clyde Kicker FAL & FTS", en: "Second Clyde Kicker FAL & FTS" },
      { it: "Terzo Champion's Sprint FAL & FTS", en: "Third Champion's Sprint FAL & FTS" }
    ])
  },
  {
    stage_number: 2,
    date: "2025-12-16T19:20:00",
    world_it: "Makuri",
    world_en: "Makuri",
    route_it: "Red Zone Repeats (1 giro - 19.6 km - D+ 87 m)",
    route_en: "Red Zone Repeats (1 lap - 19.6 km - D+ 87 m)",
    type_it: "iTT",
    type_en: "iTT",
    route_link: "https://zwiftinsider.com/route/red-zone-repeats/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247622",
    zwift_event_id: 5247622,
    segments: JSON.stringify([])
  },
  {
    stage_number: 3,
    date: "2025-12-19T19:20:00",
    world_it: "New York - Center Sprint e The Peristyle Sprint per classifica sprinter, The Hill KOM per classifica scalatore",
    world_en: "New York - Center Sprint and The Peristyle Sprint for sprinter ranking, The Hill KOM for climber ranking",
    route_it: "Issendorf Express (3 giri - 21.7 km - D+ 159 m)",
    route_en: "Issendorf Express (3 laps - 21.7 km - D+ 159 m)",
    type_it: "Luna Park",
    type_en: "Luna Park",
    route_link: "https://zwiftinsider.com/route/issendorf-express/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247623",
    zwift_event_id: 5247623,
    segments: JSON.stringify([
      { it: "Primo Center Sprint solo FTS", en: "First Center Sprint only FTS" },
      { it: "Primo The Peristyle Sprint solo FTS", en: "First The Peristyle Sprint only FTS" },
      { it: "Secondo Center Sprint solo FTS", en: "Second Center Sprint only FTS" },
      { it: "Primo The Hill KOM FAL & FTS", en: "First The Hill KOM FAL & FTS" },
      { it: "Terzo Center Sprint solo FAL", en: "Third Center Sprint only FAL" },
      { it: "Secondo The Peristyle Sprint solo FTS", en: "Second The Peristyle Sprint only FTS" },
      { it: "Quarto Center Sprint solo FTS", en: "Fourth Center Sprint only FTS" },
      { it: "Secondo The Hill KOM FAL & FTS", en: "Second The Hill KOM FAL & FTS" },
      { it: "Quinto Center Sprint solo FTS", en: "Fifth Center Sprint only FTS" },
      { it: "Terzo The Peristyle Sprint solo FAL", en: "Third The Peristyle Sprint only FAL" },
      { it: "Sesto Center Sprint solo FAL", en: "Sixth Center Sprint only FAL" },
      { it: "Terzo The Hill KOM FAL & FTS", en: "Third The Hill KOM FAL & FTS" }
    ])
  },
  {
    stage_number: 4,
    date: "2025-12-23T19:20:00",
    world_it: "Scozia - Sgurr Summit Nord e Sud per classifica scalatore",
    world_en: "Scotland - Sgurr Summit North and South for climber ranking",
    route_it: "City and the Sgurr (3 giri - 20.4 km - D+ 372 m)",
    route_en: "City and the Sgurr (3 laps - 20.4 km - D+ 372 m)",
    type_it: "Point Mountain",
    type_en: "Point Mountain",
    route_link: "https://zwiftinsider.com/route/city-and-the-sgurr/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247624",
    zwift_event_id: 5247624,
    segments: JSON.stringify([
      { it: "Lead-in Sgurr Summit North FAL & FTS", en: "Lead-in Sgurr Summit North FAL & FTS" },
      { it: "Primo Sgurr Summit South solo FTS", en: "First Sgurr Summit South only FTS" },
      { it: "Secondo Sgurr Summit North FAL & FTS", en: "Second Sgurr Summit North FAL & FTS" },
      { it: "Secondo Sgurr Summit South solo FAL", en: "Second Sgurr Summit South only FAL" },
      { it: "Terzo Sgurr Summit North solo FAL", en: "Third Sgurr Summit North only FAL" },
      { it: "Terzo Sgurr Summit South solo FTS", en: "Third Sgurr Summit South only FTS" },
      { it: "Quarto Sgurr Summit North solo FTS", en: "Fourth Sgurr Summit North only FTS" }
    ])
  },
  {
    stage_number: 5,
    date: "2025-12-27T19:20:00",
    world_it: "Bologna",
    world_en: "Bologna",
    route_it: "Time Trial Lap (8 km + D+ 263 m)",
    route_en: "Time Trial Lap (8 km + D+ 263 m)",
    type_it: "Chrono Scalata",
    type_en: "Climbing TT",
    route_link: "https://zwiftinsider.com/route/bologna-time-trial-lap/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247628",
    zwift_event_id: 5247628,
    segments: JSON.stringify([])
  },
  {
    stage_number: 6,
    date: "2025-12-30T19:20:00",
    world_it: "Londra - The Mall Sprint Reverse per classifica sprinter",
    world_en: "London - The Mall Sprint Reverse for sprinter ranking",
    route_it: "Classique Reverse (3 giri - 23.8 km - D+ 134 m)",
    route_en: "Classique Reverse (3 laps - 23.8 km - D+ 134 m)",
    type_it: "Point Flat",
    type_en: "Point Flat",
    route_link: "https://zwiftinsider.com/route/classique-reverse/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247630",
    zwift_event_id: 5247630,
    segments: JSON.stringify([])
  },
  {
    stage_number: 7,
    date: "2026-02-13T19:20:00",
    world_it: "Makuri",
    world_en: "Makuri",
    route_it: "Sprinter's Playground",
    route_en: "Sprinter's Playground",
    type_it: "Luna Park",
    type_en: "Luna Park",
    route_link: "https://zwiftinsider.com/route/sprinters-playground/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247687",
    zwift_event_id: 5247687,
    segments: JSON.stringify([])
  },
  {
    stage_number: 8,
    date: "2026-02-17T19:20:00",
    world_it: "Londra",
    world_en: "London",
    route_it: "London Uprising",
    route_en: "London Uprising",
    type_it: "Point Mountain",
    type_en: "Point Mountain",
    route_link: "https://zwiftinsider.com/route/london-uprising/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247689",
    zwift_event_id: 5247689,
    segments: JSON.stringify([])
  },
  {
    stage_number: 9,
    date: "2026-02-20T19:20:00",
    world_it: "Watopia",
    world_en: "Watopia",
    route_it: "Flat Out Fast",
    route_en: "Flat Out Fast",
    type_it: "iTT",
    type_en: "iTT",
    route_link: "https://zwiftinsider.com/route/flat-out-fast/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247692",
    zwift_event_id: 5247692,
    segments: JSON.stringify([])
  },
  {
    stage_number: 10,
    date: "2026-02-24T19:20:00",
    world_it: "Francia",
    world_en: "France",
    route_it: "Bon Voyage",
    route_en: "Bon Voyage",
    type_it: "Point Flat",
    type_en: "Point Flat",
    route_link: "https://zwiftinsider.com/route/bon-voyage/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247696",
    zwift_event_id: 5247696,
    segments: JSON.stringify([])
  },
  {
    stage_number: 11,
    date: "2026-02-27T19:20:00",
    world_it: "Watopia",
    world_en: "Watopia",
    route_it: "Mountain Mash",
    route_en: "Mountain Mash",
    type_it: "Chrono Scalata",
    type_en: "Climbing TT",
    route_link: "https://zwiftinsider.com/route/mountain-mash/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247700",
    zwift_event_id: 5247700,
    segments: JSON.stringify([])
  },
  {
    stage_number: 12,
    date: "2026-03-04T19:20:00",
    world_it: "Richmond",
    world_en: "Richmond",
    route_it: "Cobbled Climbs Reverse",
    route_en: "Cobbled Climbs Reverse",
    type_it: "Point Hilly",
    type_en: "Point Hilly",
    route_link: "https://zwiftinsider.com/route/cobbled-climbs-reverse/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247701",
    zwift_event_id: 5247701,
    segments: JSON.stringify([])
  },
  {
    stage_number: 13,
    date: "2026-03-07T19:20:00",
    world_it: "Londra",
    world_en: "London",
    route_it: "London Flat",
    route_en: "London Flat",
    type_it: "iTT",
    type_en: "iTT",
    route_link: "https://zwiftinsider.com/route/london-flat/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247703",
    zwift_event_id: 5247703,
    segments: JSON.stringify([])
  },
  {
    stage_number: 14,
    date: "2026-03-11T19:20:00",
    world_it: "New York",
    world_en: "New York",
    route_it: "Toefield Tornado",
    route_en: "Toefield Tornado",
    type_it: "Luna Park",
    type_en: "Luna Park",
    route_link: "https://zwiftinsider.com/route/toefield-tormado/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247705",
    zwift_event_id: 5247705,
    segments: JSON.stringify([])
  },
  {
    stage_number: 15,
    date: "2026-03-14T19:20:00",
    world_it: "Watopia",
    world_en: "Watopia",
    route_it: "Power Punches",
    route_en: "Power Punches",
    type_it: "Point Mountain",
    type_en: "Point Mountain",
    route_link: "https://zwiftinsider.com/route/power-punches/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247707",
    zwift_event_id: 5247707,
    segments: JSON.stringify([])
  },
  {
    stage_number: 16,
    date: "2026-03-18T19:20:00",
    world_it: "Makuri",
    world_en: "Makuri",
    route_it: "Electric Loop",
    route_en: "Electric Loop",
    type_it: "Point Flat",
    type_en: "Point Flat",
    route_link: "https://zwiftinsider.com/route/electric-loop/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247709",
    zwift_event_id: 5247709,
    segments: JSON.stringify([])
  },
  {
    stage_number: 17,
    date: "2026-03-21T19:20:00",
    world_it: "Francia",
    world_en: "France",
    route_it: "Ven-10",
    route_en: "Ven-10",
    type_it: "Chrono Scalata",
    type_en: "Climbing TT",
    route_link: "https://zwiftinsider.com/route/ven-10/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247710",
    zwift_event_id: 5247710,
    segments: JSON.stringify([])
  },
  {
    stage_number: 18,
    date: "2026-03-25T19:20:00",
    world_it: "Watopia",
    world_en: "Watopia",
    route_it: "Jarvis Seaside Sprint",
    route_en: "Jarvis Seaside Sprint",
    type_it: "Point Hilly",
    type_en: "Point Hilly",
    route_link: "https://zwiftinsider.com/route/jarvis-seaside-sprint/",
    register_link: "https://www.zwift.com/eu-it/events/tag/inoxwinter/view/5247712",
    zwift_event_id: 5247712,
    segments: JSON.stringify([])
  }
];

// ---------------------------------------------------------------------------
// Action Handlers
// ---------------------------------------------------------------------------

async function handleInitSchema(db) {
  const statements = SCHEMA_SQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => db.prepare(s + ';'));

  for (const stmt of statements) {
    await stmt.run();
  }
  return { done: true, message: 'Schema created/verified successfully.' };
}

async function handleSeedScoringRules(db) {
  const stmts = SCORING_RULES.map(r =>
    db.prepare('INSERT OR IGNORE INTO wt_scoring_rules (type, position, points) VALUES (?, ?, ?)')
      .bind(r.type, r.position, r.points)
  );

  let inserted = 0;
  for (const stmt of stmts) {
    const result = await stmt.run();
    if (result.meta?.changes > 0) inserted++;
  }

  return { done: true, inserted, total: SCORING_RULES.length, message: `Scoring rules seeded: ${inserted} new rows inserted (${SCORING_RULES.length - inserted} already existed).` };
}

async function handleSeedStages(db) {
  const stmts = STAGES_SEED.map(s =>
    db.prepare(`
      INSERT OR IGNORE INTO wt_stages
        (stage_number, date, world_it, world_en, route_it, route_en, type_it, type_en, route_link, register_link, zwift_event_id, segments, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      s.stage_number, s.date,
      s.world_it, s.world_en,
      s.route_it, s.route_en,
      s.type_it, s.type_en,
      s.route_link, s.register_link,
      s.zwift_event_id,
      s.segments,
      'scheduled'
    )
  );

  let inserted = 0;
  for (const stmt of stmts) {
    const result = await stmt.run();
    if (result.meta?.changes > 0) inserted++;
  }

  return { done: true, inserted, total: STAGES_SEED.length, message: `Stages seeded: ${inserted} new rows inserted (${STAGES_SEED.length - inserted} already existed).` };
}

async function handleStatus(db) {
  const [stagesRow, resultsRow, rulesRow, settingsRow] = await Promise.all([
    db.prepare('SELECT COUNT(*) as cnt FROM wt_stages').first().catch(() => ({ cnt: 'N/A (table missing)' })),
    db.prepare('SELECT COUNT(*) as cnt FROM wt_results').first().catch(() => ({ cnt: 'N/A (table missing)' })),
    db.prepare('SELECT COUNT(*) as cnt FROM wt_scoring_rules').first().catch(() => ({ cnt: 'N/A (table missing)' })),
    db.prepare('SELECT COUNT(*) as cnt FROM wt_settings').first().catch(() => ({ cnt: 'N/A (table missing)' })),
  ]);

  let stageDetails = [];
  try {
    const { results } = await db.prepare('SELECT id, stage_number, route_it, date, status FROM wt_stages ORDER BY stage_number').all();
    stageDetails = results;
  } catch {
    stageDetails = [];
  }

  return {
    done: true,
    counts: {
      stages: stagesRow?.cnt ?? 0,
      results: resultsRow?.cnt ?? 0,
      scoring_rules: rulesRow?.cnt ?? 0,
      settings: settingsRow?.cnt ?? 0,
    },
    stages: stageDetails,
  };
}

// ---------------------------------------------------------------------------
// Main Handler
// ---------------------------------------------------------------------------
export async function onRequestPost(context) {
  const { request, env, data } = context;

  const user = data?.user;
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return new Response(JSON.stringify({ error: 'Forbidden: Unauthorized access' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { action } = body;

  if (!action) {
    return new Response(JSON.stringify({ error: "Missing 'action' field. Supported: init_schema, seed_scoring_rules, seed_stages, full_init, status" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const db = env.WINTER_TOUR_DB;

  try {
    let result;

    switch (action) {
      case 'init_schema':
        result = await handleInitSchema(db);
        break;

      case 'seed_scoring_rules':
        result = await handleSeedScoringRules(db);
        break;

      case 'seed_stages':
        result = await handleSeedStages(db);
        break;

      case 'full_init': {
        const schemaResult = await handleInitSchema(db);
        const rulesResult = await handleSeedScoringRules(db);
        const stagesResult = await handleSeedStages(db);
        result = {
          done: true,
          steps: {
            schema: schemaResult,
            scoring_rules: rulesResult,
            stages: stagesResult,
          },
          message: 'Full initialization completed successfully.',
        };
        break;
      }

      case 'status':
        result = await handleStatus(db);
        break;

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ success: true, action, ...result }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(`[init.js] Error during action "${action}":`, err);
    return new Response(JSON.stringify({ error: err.message, action }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
