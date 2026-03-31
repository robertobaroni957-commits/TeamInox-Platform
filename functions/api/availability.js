export async function onRequest(context) {
    const { request, env } = context;
    const { method } = request;

    // Helper per estrarre ZWID dal token (assumendo middleware JWT attivo)
    // Se non c'è JWT, si può restituire un errore o usare un valore di default per il test
    const getZwid = (req) => {
        // context.data.user dovrebbe essere popolato da un middleware che valida il JWT
        const user = context.data?.user; 
        return user ? user.zwid : null;
    };

    const zwid = getZwid(request);
    // Per testing locale senza JWT, si può rimuovere questo check o impostare un zwid fisso
    if (!zwid) {
        return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid JWT" }), { status: 401 });
    }

    // GET: Recupera orari, preferenze e disponibilità
    if (method === "GET") {
        try {
            const [timeSlotsRes, preferencesRes, roundsRes] = await env.DB.batch([
                env.DB.prepare("SELECT * FROM league_times ORDER BY slot_order").all(),
                env.DB.prepare("SELECT * FROM user_time_preferences WHERE zwid = ?").bind(zwid).all(),
                // Selezioniamo solo i round della stagione corrente (es. ID 19 per ZRL)
                env.DB.prepare(`
                    SELECT 
                        r.id, r.name, r.date, r.world, r.route, r.category,
                        (SELECT status FROM availability WHERE athlete_id = ? AND round_id = r.id) as status
                    FROM rounds r 
                    WHERE r.series_id = (SELECT id FROM series WHERE external_season_id = 19 LIMIT 1) -- ZRL Season 19
                    ORDER BY r.date ASC
                `).bind(zwid).all()
            ]);

            return new Response(JSON.stringify({
                timeSlots: timeSlotsRes.results,
                preferences: preferencesRes.results,
                rounds: roundsRes.results
            }), { headers: { "Content-Type": "application/json" } });

        } catch (e) {
            console.error("API GET Availability Error:", e.message);
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    // POST: Aggiorna Preferenze Orarie o Disponibilità Gara
    if (method === "POST") {
        try {
            const body = await request.json();
            const { type, payload } = body; // type: 'preferences' | 'race'

            if (type === 'preferences') {
                // payload: [{ slotId: 'EMEA_C', level: 2 }, ...]
                if (!Array.isArray(payload) || payload.length === 0) {
                    return new Response(JSON.stringify({ error: "Invalid payload for preferences" }), { status: 400 });
                }
                const statements = payload.map(p => 
                    env.DB.prepare("INSERT OR REPLACE INTO user_time_preferences (zwid, time_slot_id, preference_level) VALUES (?, ?, ?)")
                    .bind(zwid, p.slotId, p.level)
                );
                await env.DB.batch(statements);
                return new Response(JSON.stringify({ success: true, message: "Preferences updated" }));

            } else if (type === 'race') {
                // payload: { roundId: 10, status: 'available' }
                if (!payload || typeof payload.roundId === 'undefined' || typeof payload.status === 'undefined') {
                    return new Response(JSON.stringify({ error: "Invalid payload for race availability" }), { status: 400 });
                }
                await env.DB.prepare("INSERT OR REPLACE INTO availability (athlete_id, round_id, status, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)")
                    .bind(zwid, payload.roundId, payload.status)
                    .run();
                return new Response(JSON.stringify({ success: true, message: "Race availability updated" }));

            } else {
                return new Response(JSON.stringify({ error: "Invalid request type" }), { status: 400 });
            }

        } catch (e) {
            console.error("API POST Availability Error:", e.message);
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    return new Response("Not Found", { status: 404 });
}
