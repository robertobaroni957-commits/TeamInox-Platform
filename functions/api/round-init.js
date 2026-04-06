// functions/api/round-init.js

export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        const body = await request.json();
        const { year, round_index, default_timeslot_id } = body;

        if (!year || !round_index) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Dati mancanti (anno e numero round sono obbligatori)" 
            }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        let wtrlSeasonId;
        if (parseInt(year) === 2025) {
            wtrlSeasonId = 19 + (parseInt(round_index) - 4);
        } else {
            wtrlSeasonId = (parseInt(year) - 2026) * 4 + 20 + (parseInt(round_index) - 1);
        }

        const seriesName = `ZRL ${year} Round ${round_index}`;

        // 1. Creiamo o recuperiamo la Serie
        let seriesResult = await env.DB.prepare("SELECT id FROM series WHERE external_season_id = ?")
            .bind(wtrlSeasonId).first();
        
        let seriesId;
        if (!seriesResult) {
            const insertSeries = await env.DB.prepare(
                "INSERT INTO series (name, external_season_id, is_active) VALUES (?, ?, 1) RETURNING id"
            ).bind(seriesName, wtrlSeasonId).first();
            seriesId = insertSeries.id;
        } else {
            seriesId = seriesResult.id;
            // Aggiorniamo il nome per sicurezza se è cambiato (es. da test precedenti)
            await env.DB.prepare("UPDATE series SET name = ? WHERE id = ?").bind(seriesName, seriesId).run();
        }

        // Impostiamo questa come l'unica serie attiva
        await env.DB.batch([
            env.DB.prepare("UPDATE series SET is_active = 0"),
            env.DB.prepare("UPDATE series SET is_active = 1 WHERE id = ?").bind(seriesId)
        ]);

        // 2. Fetch Schedule da WTRL
        const wtrlUrl = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${wtrlSeasonId}&category=A&action=schedule`;
        const res = await fetch(wtrlUrl, {
            headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
        });

        if (!res.ok) throw new Error(`WTRL API error: ${res.status}`);
        const data = await res.json();
        const rawRounds = data.payload || (Array.isArray(data) ? data : []);

        if (rawRounds.length === 0) throw new Error(`Nessuna gara trovata per la Season ${wtrlSeasonId} su WTRL.`);

        // 3. Pulizia round esistenti della serie
        await env.DB.prepare("DELETE FROM rounds WHERE series_id = ?").bind(seriesId).run();

        // 4. Preparazione Squadre
        const slotId = default_timeslot_id || 'EMEA_C';
        const teams = await env.DB.prepare(`SELECT id FROM teams`).all();
        const teamIds = teams.results?.map(t => t.id) || [];

        // 5. Inserimento Gare e Associazioni in un unico Batch MASSIVO
        // NOTA: Poiché non conosciamo gli ID dei round finché non li inseriamo, dobbiamo fare un trucco o fare batch per ogni week.
        // Optiamo per un batch per settimana per essere sicuri ma performanti.
        
        const importedWeeks = [];
        for (const item of rawRounds) {
            const raceName = `Week ${item.race || '?'}`;
            const date = item.eventDate || null;
            const rWorld = (item.courseWorld || "TBD").toUpperCase();
            const rRoute = item.courseName || "TBD";

            if (!date) continue;

            // Inseriamo il round e prendiamo l'ID
            const roundRecord = await env.DB.prepare(
                "INSERT INTO rounds (series_id, name, date, world, route, status) VALUES (?, ?, ?, ?, ?, 'planned') RETURNING id"
            ).bind(seriesId, raceName, date, rWorld, rRoute).first();
            
            const roundId = roundRecord.id;

            // Prepariamo le associazioni team in batch per questo round specifico
            if (teamIds.length > 0) {
                const teamStatements = teamIds.map(tid => 
                    env.DB.prepare("INSERT INTO round_teams (round_id, team_id, timeslot_id) VALUES (?, ?, ?)")
                    .bind(roundId, tid, slotId)
                );
                await env.DB.batch(teamStatements);
            }
            importedWeeks.push(raceName);
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Sincronizzazione completata: ${seriesName} con ${importedWeeks.length} settimane.`,
            seriesId
        }), { 
            headers: { 
                "Content-Type": "application/json",
                "Cache-Control": "no-store" 
            } 
        });

    } catch (err) {
        console.error("ERRORE API round-init:", err.message);
        return new Response(JSON.stringify({ success: false, error: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
