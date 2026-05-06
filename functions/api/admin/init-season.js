
export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { name, external_id, rounds, round_index, round_description } = body;
        
        // Default: Season 2025, Round 4 (ID 19)
        const seasonName = name || "ZRL 2025";
        const wtrlSeasonId = external_id || 19;
        const rIndex = round_index || 4;
        const rDesc = round_description || `Round ${rIndex} (${seasonName})`;

        if (!env.DB) return new Response(JSON.stringify({ error: "DB binding missing" }), { status: 500 });

        // 1. Gestione STAGIONE (zrl_seasons)
        // Archiviamo le altre stagioni e cerchiamo/creiamo quella attuale
        await env.DB.prepare("UPDATE zrl_seasons SET is_active = 0").run();
        
        let season = await env.DB.prepare("SELECT id FROM zrl_seasons WHERE name = ? LIMIT 1").bind(seasonName).first();
        let seasonId;

        if (season) {
            seasonId = season.id;
            await env.DB.prepare("UPDATE zrl_seasons SET is_active = 1 WHERE id = ?").bind(seasonId).run();
        } else {
            const res = await env.DB.prepare("INSERT INTO zrl_seasons (name, is_active) VALUES (?, 1)").bind(seasonName).run();
            seasonId = res.meta.last_row_id;
        }

        // 2. Gestione ROUND GROUP (zrl_round_groups)
        // Eliminiamo eventuali duplicati per lo stesso indice nella stessa stagione per pulizia
        await env.DB.prepare("DELETE FROM zrl_round_groups WHERE series_id = ? AND round_index = ?").bind(seasonId, rIndex).run();
        
        const rgRes = await env.DB.prepare(`
            INSERT INTO zrl_round_groups (series_id, round_index, external_season_id, description)
            VALUES (?, ?, ?, ?)
        `).bind(seasonId, rIndex, wtrlSeasonId, rDesc).run();
        const roundGroupId = rgRes.meta.last_row_id;

        // 3. Inserimento GARE (zrl_races)
        if (rounds && Array.isArray(rounds) && rounds.length > 0) {
            // Pulizia gare vecchie per questo gruppo
            await env.DB.prepare("DELETE FROM zrl_races WHERE zrl_round_group_id = ?").bind(roundGroupId).run();

            const raceStatements = rounds.map(r => {
                return env.DB.prepare(`
                    INSERT INTO zrl_races (zrl_round_group_id, name, date, world, route, category)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).bind(
                    roundGroupId, r.name, r.date, r.world, r.route, r.category || 'ALL'
                );
            });
            await env.DB.batch(raceStatements);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Inizializzazione completata: ${seasonName}, ${rDesc} con ${rounds?.length || 0} gare.`,
            season_id: seasonId,
            round_group_id: roundGroupId
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
