// ================================
// API Availability - Debug avanzato
// ================================
export async function onRequestGet(context) {
    const { env, data, request } = context;
    const user = data?.user;
    const zwid = user?.zwid;
    const role = user?.role;

    if (!zwid) {
        console.warn("[DEBUG] JWT mancante o non valido");
        return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid JWT" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const url = new URL(request.url);
        const isAdminRequest = url.searchParams.get('all') === 'true';

        console.log(`[DEBUG] GET Availability - zwid: ${zwid}, role: ${role}, adminRequest: ${isAdminRequest}`);

        // ============================
        // Admin / Moderator: Tutti dati
        // ============================
        if (isAdminRequest && (role === 'admin' || role === 'moderator')) {
            console.log("[DEBUG] Eseguo batch Admin / Moderator");

            const results = await env.DB.batch([
                env.DB.prepare(`SELECT p.*, a.name FROM user_time_preferences p JOIN athletes a ON p.zwid = a.zwid`),
                env.DB.prepare(`SELECT v.*, a.name FROM availability v JOIN athletes a ON v.athlete_id = a.zwid`),
                env.DB.prepare(`
                    SELECT a.zwid, a.name, a.base_category, t.name as team 
                    FROM athletes a
                    LEFT JOIN team_members tm ON a.zwid = tm.athlete_id
                    LEFT JOIN teams t ON tm.team_id = t.id
                `)
            ]);

            console.log(`[DEBUG] Query risultati: Prefs=${results[0].results.length}, Avail=${results[1].results.length}, Athletes=${results[2].results.length}`);

            return new Response(JSON.stringify({
                allPreferences: results[0].results,
                allAvailabilities: results[1].results,
                athletes: results[2].results
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // ============================
        // User: solo propri dati
        // ============================
        console.log("[DEBUG] Eseguo batch User");

        const results = await env.DB.batch([
            env.DB.prepare(`SELECT * FROM league_times ORDER BY slot_order`),
            env.DB.prepare(`SELECT * FROM user_time_preferences WHERE zwid = ?`).bind(zwid),
            env.DB.prepare(`
                SELECT r.id, r.name, r.date, r.world, r.route,
                    (SELECT status FROM availability WHERE athlete_id = ? AND round_id = r.id) as status
                FROM rounds r
                WHERE r.series_id = (SELECT id FROM series WHERE is_active = 1 LIMIT 1)
                ORDER BY r.date ASC
            `).bind(zwid)
        ]);

        console.log(`[DEBUG] Query risultati User: timeSlots=${results[0].results.length}, preferences=${results[1].results.length}, rounds=${results[2].results.length}`);

        return new Response(JSON.stringify({
            timeSlots: results[0].results,
            preferences: results[1].results,
            rounds: results[2].results
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("[DEBUG] API GET Availability Error:", e);
        return new Response(JSON.stringify({ error: e.message, stack: e.stack }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

export async function onRequestPost(context) {
    const { env, data, request } = context;
    const user = data?.user;
    const zwid = user?.zwid;

    if (!zwid) {
        console.warn("[DEBUG] JWT mancante POST");
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { type, payload } = body;

        console.log(`[DEBUG] POST Availability - zwid=${zwid}, type=${type}, payload=${JSON.stringify(payload)}`);

        // ============================
        // Preferences
        // ============================
        if (type === 'preferences') {
            if (!Array.isArray(payload) || payload.length === 0) {
                return new Response(JSON.stringify({ error: "Invalid payload for preferences" }), { status: 400 });
            }

            const statements = payload.map(p => {
                console.log(`[DEBUG] Inserimento preference: slot=${p.slotId}, level=${p.level}`);
                return env.DB.prepare(`
                    INSERT OR REPLACE INTO user_time_preferences 
                    (zwid, time_slot_id, preference_level) 
                    VALUES (?, ?, ?)
                `).bind(zwid, p.slotId, p.level);
            });

            await env.DB.batch(statements);

            return new Response(JSON.stringify({ success: true, message: "Preferences updated" }), {
                headers: { "Content-Type": "application/json" }
            });
            }

            // ============================
            // Race Availability
            // ============================
            if (type === 'race') {
            if (!payload || payload.roundId === undefined || payload.status === undefined) {
                return new Response(JSON.stringify({ error: "Invalid payload for race availability" }), { 
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            console.log(`[DEBUG] Inserimento availability: roundId=${payload.roundId}, status=${payload.status}`);

            await env.DB.prepare(`
                INSERT OR REPLACE INTO availability 
                (athlete_id, round_id, status, updated_at) 
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(zwid, payload.roundId, payload.status).run();

            return new Response(JSON.stringify({ success: true, message: "Race availability updated" }), {
                headers: { "Content-Type": "application/json" }
            });
            }

            return new Response(JSON.stringify({ error: "Invalid request type" }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
            });

            } catch (e) {
            console.error("[DEBUG] API POST Availability Error:", e);
            return new Response(JSON.stringify({ error: e.message, stack: e.stack }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
            });
            }
            }