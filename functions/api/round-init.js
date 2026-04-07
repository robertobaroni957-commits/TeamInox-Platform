// functions/api/round-init.js

export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        const body = await request.json();
        const { year, round_index, default_timeslot_id } = body;

        if (!year || !round_index) {
            return new Response(JSON.stringify({ success: false, error: "Dati mancanti (Anno/Round)." }), { 
                status: 200, headers: { "Content-Type": "application/json" } 
            });
        }

        // Calcolo ID Stagione WTRL
        let wtrlSeasonId;
        const y = parseInt(year);
        const r = parseInt(round_index);
        if (y === 2025) {
            wtrlSeasonId = 19 + (r - 4);
        } else {
            wtrlSeasonId = (y - 2026) * 4 + 20 + (r - 1);
        }

        const seriesName = `ZRL ${year} Round ${round_index}`;
        const slotId = default_timeslot_id || 'EMEA_C';

        // 1. Fetch da WTRL
        const wtrlUrl = `https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${wtrlSeasonId}&category=A&action=schedule&test=c2NoZWR1bGU%3D`;
        const wtrlRes = await fetch(wtrlUrl, {
            headers: { 
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json"
            }
        });

        if (!wtrlRes.ok) throw new Error(`WTRL API error: ${wtrlRes.status}`);
        const wtrlData = await wtrlRes.json();
        const rawRounds = wtrlData.payload || (Array.isArray(wtrlData) ? wtrlData : []);
        if (rawRounds.length === 0) throw new Error("WTRL non ha restituito gare per questa stagione.");

        // 2. Upsert Serie
        let series = await env.DB.prepare("SELECT id FROM series WHERE external_season_id = ?").bind(wtrlSeasonId).first();
        let seriesId;
        if (!series) {
            const ins = await env.DB.prepare("INSERT INTO series (name, external_season_id, is_active) VALUES (?, ?, 1) RETURNING id")
                .bind(seriesName, wtrlSeasonId).first();
            seriesId = ins.id;
        } else {
            seriesId = series.id;
            await env.DB.prepare("UPDATE series SET name = ?, is_active = 1 WHERE id = ?").bind(seriesName, seriesId).run();
        }
        await env.DB.prepare("UPDATE series SET is_active = 0 WHERE id != ?").bind(seriesId).run();

        // 3. Pulizia a cascata
        const sub = "SELECT id FROM rounds WHERE series_id = ?";
        await env.DB.batch([
            env.DB.prepare(`DELETE FROM race_lineup WHERE round_id IN (${sub})`).bind(seriesId),
            env.DB.prepare(`DELETE FROM availability WHERE round_id IN (${sub})`).bind(seriesId),
            env.DB.prepare(`DELETE FROM results WHERE round_id IN (${sub})`).bind(seriesId),
            env.DB.prepare(`DELETE FROM round_teams WHERE round_id IN (${sub})`).bind(seriesId),
            env.DB.prepare(`DELETE FROM rounds WHERE series_id = ?`).bind(seriesId)
        ]);

        // 4. Inserimento Round con protezione NULL
        const validRounds = rawRounds.filter(item => item.eventDate || item.date);
        for (const item of validRounds) {
            const rName = `Week ${item.race || item.round || '?'}`;
            const rDate = item.eventDate || item.date;
            const rWorld = (item.courseWorld || item.world || "TBD").toString().toUpperCase();
            const rRoute = (item.courseName || item.route || "TBD").toString();

            const round = await env.DB.prepare(
                "INSERT INTO rounds (series_id, name, date, world, route, status) VALUES (?, ?, ?, ?, ?, 'planned') RETURNING id"
            ).bind(seriesId, rName, rDate, rWorld, rRoute).first();

            // Associazione Team massiva via SQL per ogni round
            await env.DB.prepare(`
                INSERT INTO round_teams (round_id, team_id, timeslot_id)
                SELECT ?, id, ? FROM teams
            `).bind(round.id, slotId).run();
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Importati ${validRounds.length} round con successo.`
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: "Errore Import: " + err.message 
        }), { 
            status: 200, 
            headers: { "Content-Type": "application/json" }
        });
    }
}
