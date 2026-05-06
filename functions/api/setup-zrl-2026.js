
export async function onRequestGet({ env }) {
    if (!env.DB) return new Response("DB non trovato", { status: 500 });

    const maintenance = [
        // Ripariamo zrl_round_groups aggiungendo le colonne che potrebbero mancare
        `ALTER TABLE zrl_round_groups ADD COLUMN series_id INTEGER`,
        `ALTER TABLE zrl_round_groups ADD COLUMN round_index INTEGER`,
        `ALTER TABLE zrl_round_groups ADD COLUMN external_season_id INTEGER`,
        `ALTER TABLE zrl_round_groups ADD COLUMN description TEXT`,
        `ALTER TABLE zrl_round_groups ADD COLUMN is_closed BOOLEAN DEFAULT 0`,
        // Ripariamo zrl_seasons
        `ALTER TABLE zrl_seasons ADD COLUMN external_season_id INTEGER`,
        `ALTER TABLE zrl_seasons ADD COLUMN is_active BOOLEAN DEFAULT 0`
    ];

    const creation = [
        `CREATE TABLE IF NOT EXISTS zrl_seasons (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, external_season_id INTEGER, is_active BOOLEAN DEFAULT 0)`,
        `CREATE TABLE IF NOT EXISTS zrl_round_groups (id INTEGER PRIMARY KEY AUTOINCREMENT, series_id INTEGER NOT NULL, round_index INTEGER NOT NULL, external_season_id INTEGER, description TEXT, is_closed BOOLEAN DEFAULT 0, FOREIGN KEY (series_id) REFERENCES zrl_seasons(id), UNIQUE(series_id, round_index))`,
        `CREATE TABLE IF NOT EXISTS zrl_team_standings (id INTEGER PRIMARY KEY AUTOINCREMENT, round_group_id INTEGER NOT NULL, league_key TEXT NOT NULL, team_name TEXT NOT NULL, rank INTEGER, league_points INTEGER, pts_fal INTEGER, pts_fts INTEGER, pts_finish INTEGER, r1 TEXT, r2 TEXT, r3 TEXT, r4 TEXT, r5 TEXT, r6 TEXT, r7 TEXT, r8 TEXT, is_inox BOOLEAN DEFAULT 0, FOREIGN KEY (round_group_id) REFERENCES zrl_round_groups(id), UNIQUE(round_group_id, league_key, team_name))`
    ];

    const logs = [];

    // 1. Assicuriamoci che le tabelle esistano
    for (const q of creation) {
        try { await env.DB.prepare(q).run(); logs.push({ q: q.substring(0, 30), status: "OK" }); } catch (e) {}
    }

    // 2. Aggiungiamo le colonne mancanti (ignorando errori se già presenti)
    for (const q of maintenance) {
        try { 
            await env.DB.prepare(q).run(); 
            logs.push({ q: q.substring(0, 30), status: "Updated" }); 
        } catch (e) {
            logs.push({ q: q.substring(0, 30), status: "Skipped (exists)" }); 
        }
    }

    // 3. Seed dei dati
    try {
        await env.DB.prepare(`INSERT INTO zrl_seasons (id, name, is_active) SELECT 1, 'ZRL 2025/26', 1 WHERE NOT EXISTS (SELECT 1 FROM zrl_seasons WHERE id = 1)`).run();
        await env.DB.prepare(`INSERT INTO zrl_round_groups (series_id, round_index, external_season_id, description) SELECT 1, 1, 19, 'ZRL Round 1 (Spring)' WHERE NOT EXISTS (SELECT 1 FROM zrl_round_groups WHERE external_season_id = 19)`).run();
        logs.push({ q: "Seed Data", status: "Success" });
    } catch (e) {
        logs.push({ q: "Seed Data", status: "Error", error: e.message });
    }

    return new Response(JSON.stringify({ success: true, message: "Manutenzione e Setup completati.", logs }), { headers: { "Content-Type": "application/json" } });
}
