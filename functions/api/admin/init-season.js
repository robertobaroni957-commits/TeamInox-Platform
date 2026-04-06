// functions/api/admin/init-season.js
export async function onRequestPost({ request, env }) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401 });

    try {
        const { name, external_id, rounds } = await request.json();

        if (!env.DB) return new Response(JSON.stringify({ error: "DB binding missing" }), { status: 500 });

        // Batch per l'inizializzazione atomica
        const statements = [
            // 1. Archivio stagioni precedenti
            env.DB.prepare("UPDATE series SET is_active = 0"),
            
            // 2. Creazione Nuova Serie (Season)
            env.DB.prepare("INSERT INTO series (name, external_season_id, is_active, start_date) VALUES (?, ?, 1, CURRENT_TIMESTAMP)")
                .bind(name, external_id)
        ];

        const batchResult = await env.DB.batch(statements);
        const seriesId = batchResult[1].meta.last_row_id;

        // 3. Inserimento Round con dettagli tecnici completi
        if (rounds && Array.isArray(rounds)) {
            const roundStatements = rounds.map(r => {
                // Serializziamo eventuali dettagli extra (FAL/FTS) in JSON
                const strategyDetails = JSON.stringify({
                    fal_segments: r.fal_segments || [],
                    fts_segments: r.fts_segments || [],
                    powerup_details: r.powerup_details || ""
                });

                return env.DB.prepare(`
                    INSERT INTO rounds (
                        series_id, name, date, world, route, 
                        format, distance, elevation, powerups, strategy_details
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    seriesId, 
                    r.name, 
                    r.date, 
                    r.world, 
                    r.route,
                    r.format || 'Scratch',
                    r.distance || 0,
                    r.elevation || 0,
                    r.powerups || '',
                    strategyDetails
                );
            });
            
            if (roundStatements.length > 0) {
                await env.DB.batch(roundStatements);
            }
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Stagione ${name} inizializzata con tutti i parametri tecnici.`,
            series_id: seriesId
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
