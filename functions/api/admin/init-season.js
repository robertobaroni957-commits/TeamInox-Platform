// functions/api/admin/init-season.js
export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { name, external_id, rounds } = body;
        const seasonId = external_id || 19;

        if (!env.DB) return new Response(JSON.stringify({ error: "DB binding missing" }), { status: 500 });

        // 1. Reset Serie (archiviamo le precedenti)
        await env.DB.prepare("UPDATE series SET is_active = 0").run();
        
        // 2. Creazione Nuova Serie
        const seriesResult = await env.DB.prepare("INSERT INTO series (name, external_season_id, is_active, start_date) VALUES (?, ?, 1, CURRENT_TIMESTAMP)")
            .bind(name || "Nuova Stagione", seasonId)
            .run();
        const seriesId = seriesResult.meta.last_row_id;

        // 3. Inserimento Round
        if (rounds && Array.isArray(rounds) && rounds.length > 0) {
            const roundStatements = rounds.map(r => {
                const strategyDetails = JSON.stringify({
                    fal_segments: r.fal_segments || [],
                    fts_segments: r.fts_segments || [],
                    powerup_details: r.powerup_details || ""
                });

                return env.DB.prepare(`
                    INSERT INTO rounds (series_id, name, date, world, route, format, distance, elevation, powerups, strategy_details)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    seriesId, r.name, r.date, r.world, r.route,
                    r.format || 'Scratch', r.distance || 0, r.elevation || 0,
                    r.powerups || '', strategyDetails
                );
            });
            await env.DB.batch(roundStatements);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Stagione '${name}' creata con successo nel database.`,
            series_id: seriesId
        }), { 
            status: 200,
            headers: { "Content-Type": "application/json" } 
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" } 
        });
    }
}
