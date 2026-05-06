
export async function onRequestGet({ env }) {
    if (!env.DB) return new Response("DB non trovato", { status: 500 });

    try {
        // 1. Reset e Creazione Pulita (per evitare colonne mancanti)
        // Creiamo le tabelle con la struttura definitiva
        const initSql = [
            `CREATE TABLE IF NOT EXISTS zrl_seasons (
                id INTEGER PRIMARY KEY, 
                name TEXT NOT NULL, 
                external_season_id INTEGER, 
                is_active BOOLEAN DEFAULT 0
            )`,
            `CREATE TABLE IF NOT EXISTS zrl_round_groups (
                id INTEGER PRIMARY KEY, 
                series_id INTEGER, 
                round_index INTEGER, 
                external_season_id INTEGER, 
                description TEXT, 
                is_closed BOOLEAN DEFAULT 0
            )`,
            `CREATE TABLE IF NOT EXISTS zrl_team_standings (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                round_group_id INTEGER NOT NULL, 
                league_key TEXT NOT NULL, 
                team_name TEXT NOT NULL, 
                rank INTEGER, 
                league_points INTEGER, 
                pts_fal INTEGER, 
                pts_fts INTEGER, 
                pts_finish INTEGER, 
                r1 TEXT, r2 TEXT, r3 TEXT, r4 TEXT, r5 TEXT, r6 TEXT, r7 TEXT, r8 TEXT, 
                is_inox BOOLEAN DEFAULT 0
            )`
        ];

        for (const q of initSql) await env.DB.prepare(q).run();

        // 2. Inserimento Stagione
        await env.DB.prepare(`INSERT OR IGNORE INTO zrl_seasons (id, name, is_active) VALUES (1, 'ZRL 2025/26', 1)`).run();

        // 3. Forziamo l'inserimento del Round Group 19 (GC)
        // Usiamo REPLACE per essere sicuri che esista esattamente con questi dati
        await env.DB.prepare(`
            INSERT OR REPLACE INTO zrl_round_groups (id, series_id, round_index, external_season_id, description) 
            VALUES (1, 1, 1, 19, 'ZRL Round 1 (Official GC)')
        `).run();

        const check = await env.DB.prepare(`SELECT * FROM zrl_round_groups WHERE external_season_id = 19`).first();

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Reset Database completato.",
            verified_round_19: check ? "ESISTE" : "NON TROVATO"
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
