export const onRequestPost = async (context) => {
    const { env } = context;
    const db = env.ZRL_DB;

    try {
        // 1. Verifica se esiste già una stagione attiva
        let activeSeason = await db.prepare("SELECT id FROM zrl_seasons WHERE is_active = 1 LIMIT 1").first();
        let seasonId = activeSeason?.id;
        let created = false;

        // 2. Se non esiste, crea una stagione di default
        if (!seasonId) {
            const insert = await db.prepare("INSERT INTO zrl_seasons (name, is_active) VALUES (?, 1)")
                .bind("Season 2026")
                .run();
            seasonId = insert.meta.last_row_id;
            created = true;
        }

        // 3. Assicura entry in season_lifecycle_status (Idempotente)
        await db.prepare(`
            INSERT OR REPLACE INTO season_lifecycle_status (season_id, status, updated_at)
            VALUES (?, 'READY', CURRENT_TIMESTAMP)
        `).bind(seasonId).run();

        return new Response(JSON.stringify({
            success: true,
            seasonId,
            created,
            status: "READY"
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
