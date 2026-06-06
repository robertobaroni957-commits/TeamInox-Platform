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

        const wtrlIdInt = parseInt(wtrl_id, 10);

        // 1. Cerchiamo o creiamo il Round Group (V2/V3 Bridge)
        let roundGroup = await env.ZRL_DB.prepare("SELECT id FROM zrl_round_groups WHERE external_season_id = ?").bind(wtrlIdInt).first();
        
        let roundGroupId;
        if (!roundGroup) {
            const ins = await env.ZRL_DB.prepare("INSERT INTO zrl_round_groups (series_id, external_season_id, description) VALUES (1, ?, ?) RETURNING id")
                .bind(wtrlIdInt, `ZRL Season ${wtrlIdInt}`).first();
            roundGroupId = ins.id;
        } else {
            roundGroupId = roundGroup.id;
        }

        // 2. Recuperiamo le gare esistenti per questo gruppo per gestire l'UPSERT (evitiamo FK constraint error)
        const existingRaces = await env.ZRL_DB.prepare("SELECT id, name FROM zrl_races WHERE zrl_round_group_id = ?").bind(roundGroupId).all();
        const racesMap = new Map();
        if (existingRaces.results) {
            existingRaces.results.forEach(r => racesMap.set(r.name, r.id));
        }

        // 3. Prepariamo le query di aggiornamento/inserimento
        let minDate = null;
        let maxDate = null;
        const raceQueries = [];

        const categories = Object.keys(actualData);
        if (categories.length === 0) return errorRes("Nessuna categoria trovata nei dati", 400);

        for (const cat of categories) {
            const races = actualData[cat];
            if (!Array.isArray(races)) continue;

            for (const race of races) {
                const d = race.eventDate;
                if (d) {
                    if (!minDate || d < minDate) minDate = d;
                    if (!maxDate || d > maxDate) maxDate = d;
                }

                const world = race.courseWorld?.toUpperCase() || "UNKNOWN";
                const route = race.courseName || "UNKNOWN";
                const raceName = `Race ${race.race} (${cat})`;

                const existingId = racesMap.get(raceName);

                if (existingId) {
                    // UPDATE: Aggiorniamo i dettagli senza distruggere l'ID (sicuro per FK)
                    raceQueries.push(env.ZRL_DB.prepare(`
                        UPDATE zrl_races 
                        SET date = ?, world = ?, route = ?
                        WHERE id = ?
                    `).bind(d || null, world, route, existingId));
                } else {
                    // INSERT: Nuova gara
                    raceQueries.push(env.ZRL_DB.prepare(`
                        INSERT INTO zrl_races (zrl_round_group_id, name, date, world, route)
                        VALUES (?, ?, ?, ?, ?)
                    `).bind(roundGroupId, raceName, d || null, world, route));
                }
            }
        }

        // 4. Aggiorniamo rounds_v2 (SSOT)
        if (minDate && maxDate) {
            raceQueries.push(env.ZRL_DB.prepare(`
                UPDATE rounds_v2 
                SET starts_at = ?, ends_at = ?, sync_state = 'COMPLETED', updated_at = CURRENT_TIMESTAMP
                WHERE wtrl_id = ?
            `).bind(minDate, maxDate, wtrlIdInt));
        }

        // Esecuzione batch
        if (raceQueries.length > 0) {
            await env.ZRL_DB.batch(raceQueries);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Sincronizzazione V3 completata (UPSERT).`,
            count: raceQueries.length - 1
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        console.error("[ImportRaces Error]", err);
        return errorRes("Errore durante l'importazione: " + err.message, 500);
    }
}
