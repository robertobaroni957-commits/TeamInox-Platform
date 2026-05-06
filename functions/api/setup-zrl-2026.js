
export async function onRequestGet({ env }) {
    if (!env.DB) return new Response("DB non trovato", { status: 500 });

    const sql = [
        // Assicuriamoci che la colonna esista in zrl_seasons
        `ALTER TABLE zrl_seasons ADD COLUMN external_season_id INTEGER`,
        // Assicuriamoci che la colonna esista in zrl_round_groups
        `ALTER TABLE zrl_round_groups ADD COLUMN external_season_id INTEGER`,
        // Se le tabelle non esistono proprio, le creiamo
        `CREATE TABLE IF NOT EXISTS zrl_seasons (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, external_season_id INTEGER, is_active BOOLEAN DEFAULT 0)`,
        `CREATE TABLE IF NOT EXISTS zrl_round_groups (id INTEGER PRIMARY KEY AUTOINCREMENT, series_id INTEGER NOT NULL, round_index INTEGER NOT NULL, external_season_id INTEGER, description TEXT, is_closed BOOLEAN DEFAULT 0, FOREIGN KEY (series_id) REFERENCES zrl_seasons(id), UNIQUE(series_id, round_index))`,
        `CREATE TABLE IF NOT EXISTS zrl_team_standings (id INTEGER PRIMARY KEY AUTOINCREMENT, round_group_id INTEGER NOT NULL, league_key TEXT NOT NULL, team_name TEXT NOT NULL, rank INTEGER, league_points INTEGER, pts_fal INTEGER, pts_fts INTEGER, pts_finish INTEGER, r1 TEXT, r2 TEXT, r3 TEXT, r4 TEXT, r5 TEXT, r6 TEXT, r7 TEXT, r8 TEXT, is_inox BOOLEAN DEFAULT 0, FOREIGN KEY (round_group_id) REFERENCES zrl_round_groups(id), UNIQUE(round_group_id, league_key, team_name))`
    ];

    const results = [];
    for (const query of sql) {
        try {
            await env.DB.prepare(query).run();
            results.push({ query: query.substring(0, 30) + "...", status: "Success" });
        } catch (e) {
            results.push({ query: query.substring(0, 30) + "...", status: "Skipped/Error", error: e.message });
        }
    }

    return new Response(JSON.stringify({ 
        success: true, 
        message: "Manutenzione schema completata.",
        details: results
    }), { headers: { "Content-Type": "application/json" } });
}
