
export async function onRequestGet({ env }) {
    if (!env.DB) return new Response("DB non trovato", { status: 500 });

    try {
        // 1. DISABILITIAMO I VINCOLI E RESETTIAMO TUTTO IL COMPARTO ZRL
        // Ordine di eliminazione per evitare conflitti di Foreign Key
        const dropSql = [
            `DROP TABLE IF EXISTS division_results`,
            `DROP TABLE IF EXISTS zrl_team_standings`,
            `DROP TABLE IF EXISTS zrl_races`,
            `DROP TABLE IF EXISTS zrl_round_groups`,
            `DROP TABLE IF EXISTS zrl_seasons`
        ];
        
        for (const q of dropSql) await env.DB.prepare(q).run();

        // 2. RICOSTRUZIONE PULITA (Schema Unificato 2026)
        const createSql = [
            `CREATE TABLE zrl_seasons (
                id INTEGER PRIMARY KEY, 
                name TEXT NOT NULL, 
                external_season_id INTEGER, 
                is_active BOOLEAN DEFAULT 0
            )`,
            `CREATE TABLE zrl_round_groups (
                id INTEGER PRIMARY KEY, 
                series_id INTEGER, 
                round_index INTEGER, 
                external_season_id INTEGER, 
                description TEXT, 
                is_closed BOOLEAN DEFAULT 0,
                FOREIGN KEY (series_id) REFERENCES zrl_seasons(id)
            )`,
            `CREATE TABLE zrl_races (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                zrl_round_group_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                date DATETIME,
                world TEXT,
                route TEXT,
                FOREIGN KEY (zrl_round_group_id) REFERENCES zrl_round_groups(id)
            )`,
            `CREATE TABLE zrl_team_standings (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                round_group_id INTEGER NOT NULL, 
                league_key TEXT NOT NULL, 
                league_name TEXT,
                team_name TEXT NOT NULL, 
                rank INTEGER, 
                league_points INTEGER, 
                pts_fal INTEGER, 
                pts_fts INTEGER, 
                pts_finish INTEGER, 
                total_race_points INTEGER,
                r1 TEXT, r2 TEXT, r3 TEXT, r4 TEXT, r5 TEXT, r6 TEXT, r7 TEXT, r8 TEXT, 
                is_inox BOOLEAN DEFAULT 0,
                FOREIGN KEY (round_group_id) REFERENCES zrl_round_groups(id)
            )`,
            `CREATE TABLE division_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                round_id INTEGER NOT NULL,
                league_key TEXT NOT NULL,
                team_name TEXT NOT NULL,
                rider_name TEXT NOT NULL,
                zwid INTEGER,
                position INTEGER,
                points_total INTEGER,
                is_inox BOOLEAN DEFAULT 0,
                FOREIGN KEY (round_id) REFERENCES zrl_races(id)
            )`
        ];
        
        for (const q of createSql) await env.DB.prepare(q).run();

        // 3. SEED DATI INIZIALI
        await env.DB.prepare(`INSERT INTO zrl_seasons (id, name, is_active) VALUES (1, 'ZRL 2025/26', 1)`).run();
        await env.DB.prepare(`
            INSERT INTO zrl_round_groups (id, series_id, round_index, external_season_id, description) 
            VALUES (1, 1, 1, 19, 'ZRL Round 1 (Spring)')
        `).run();

        const check = await env.DB.prepare(`SELECT * FROM zrl_round_groups WHERE external_season_id = 19`).first();

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Reset Totale ZRL completato con successo.",
            verified_round_19: check ? "ESISTE" : "ERRORE"
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
