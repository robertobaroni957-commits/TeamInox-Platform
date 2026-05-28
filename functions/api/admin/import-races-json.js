export async function onRequestPost({ request, env }) {
    const errorRes = (msg, status = 500) => new Response(
        JSON.stringify({ success: false, error: msg }), 
        { status, headers: { "Content-Type": "application/json" } }
    );

    try {
        const body = await request.json();
        let { data, season_code, wtrl_id } = body;

        if (!data || !wtrl_id) return errorRes("Dati o WTRL ID mancanti", 400);

        // Se i dati sono incapsulati in .payload (come fa JsonIngestor.tsx), li estraiamo
        const actualData = data.payload ? data.payload : data;

        // 1. Identifichiamo o creiamo la serie
        const wtrlIdInt = parseInt(wtrl_id, 10);
        let series = await env.ZRL_DB.prepare("SELECT id FROM series WHERE external_season_id = ?").bind(wtrlIdInt).first();
        
        let seriesId;
        if (!series) {
            const ins = await env.ZRL_DB.prepare("INSERT INTO series (name, external_season_id, is_active) VALUES (?, ?, 1) RETURNING id")
                .bind(`ZRL Season ${wtrlIdInt}`, wtrlIdInt).first();
            seriesId = ins.id;
        } else {
            seriesId = series.id;
        }

        const updates = [];
        // Pulizia gare precedenti
        updates.push(env.ZRL_DB.prepare("DELETE FROM rounds WHERE series_id = ?").bind(seriesId));

        let minDate = null;
        let maxDate = null;

        for (const cat of Object.keys(actualData)) {
            const races = actualData[cat];
            if (!Array.isArray(races)) continue;

            for (const race of races) {
                const d = race.eventDate;
                if (cat === 'A' || !minDate) {
                    if (!minDate || d < minDate) minDate = d;
                    if (!maxDate || d > maxDate) maxDate = d;
                }

                const world = race.courseWorld?.toUpperCase() || "UNKNOWN";
                const route = race.courseName || "UNKNOWN";
                const distance = race.lapDistanceInMeters ? (race.lapDistanceInMeters / 1000).toFixed(1) : 0;
                const elevation = race.lapAscentInMeters || 0;
                const laps = race.duration || 1;

                // Query esplicita senza ambiguità di posizionamento
                updates.push(env.ZRL_DB.prepare(`
                    INSERT INTO rounds (
                        series_id, name, date, world, route, 
                        status, category, distance, elevation, laps, raw_json
                    ) VALUES (
                        ?, ?, ?, ?, ?, 
                        'planned', ?, ?, ?, ?, ?
                    )
                `).bind(
                    seriesId, 
                    `Race ${race.race}`, 
                    d, 
                    world, 
                    route, 
                    cat, 
                    distance, 
                    elevation, 
                    laps, 
                    JSON.stringify(race)
                ));
            }
        }

        // Aggiorniamo rounds_v2
        updates.push(env.ZRL_DB.prepare(`
            UPDATE rounds_v2 
            SET starts_at = ?, ends_at = ?, sync_state = 'COMPLETED', updated_at = CURRENT_TIMESTAMP
            WHERE wtrl_id = ?
        `).bind(minDate, maxDate, wtrlIdInt));

        if (updates.length > 0) {
            await env.ZRL_DB.batch(updates);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Sincronizzazione completata per ${Object.keys(actualData).length} categorie.` 
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return errorRes(err.message, 500);
    }
}
