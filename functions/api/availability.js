export async function onRequest(context) {
    const { request, env } = context;
    const { method } = request;

    const user = context.data?.user;
    const zwid = user?.zwid;
    const role = user?.role;

    if (!zwid) {
        return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid JWT" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    // =========================
    // GET
    // =========================
    if (method === "GET") {
        try {
            const url = new URL(request.url);
            const isAdminRequest = url.searchParams.get('all') === 'true';

            // =========================
            // ADMIN / MODERATOR
            // =========================
            if (isAdminRequest && (role === 'admin' || role === 'moderator')) {
                const results = await env.DB.batch([
                    env.DB.prepare(`
                        SELECT p.*, a.name 
                        FROM user_time_preferences p
                        JOIN athletes a ON p.zwid = a.zwid
                    `),
                    env.DB.prepare(`
                        SELECT v.*, a.name 
                        FROM availability v
                        JOIN athletes a ON v.athlete_id = a.zwid
                    `),
                    env.DB.prepare(`
                        SELECT zwid, name, team, base_category 
                        FROM athletes
                    `)
                ]);

                return new Response(JSON.stringify({
                    allPreferences: results[0].results,
                    allAvailabilities: results[1].results,
                    athletes: results[2].results
                }), {
                    headers: { "Content-Type": "application/json" }
                });
            }

            // =========================
            // USER
            // =========================
            const results = await env.DB.batch([
                env.DB.prepare(`
                    SELECT * 
                    FROM league_times 
                    ORDER BY slot_order
                `),

                env.DB.prepare(`
                    SELECT * 
                    FROM user_time_preferences 
                    WHERE zwid = ?
                `).bind(zwid),

                env.DB.prepare(`
                    SELECT 
                        r.id, r.name, r.date, r.world, r.route,
                        (
                            SELECT status 
                            FROM availability 
                            WHERE athlete_id = ? 
                            AND round_id = r.id
                        ) as status
                    FROM rounds r 
                    WHERE r.series_id = (
                        SELECT id 
                        FROM series 
                        WHERE is_active = 1 
                        LIMIT 1
                    )
                    ORDER BY r.date ASC
                `).bind(zwid)
            ]);

            return new Response(JSON.stringify({
                timeSlots: results[0].results,
                preferences: results[1].results,
                rounds: results[2].results
            }), {
                headers: { "Content-Type": "application/json" }
            });

        } catch (e) {
            console.error("API GET Availability Error:", e);
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    // =========================
    // POST
    // =========================
    if (method === "POST") {
        try {
            const body = await request.json();
            const { type, payload } = body;

            // -------------------------
            // PREFERENCES
            // -------------------------
            if (type === 'preferences') {
                if (!Array.isArray(payload) || payload.length === 0) {
                    return new Response(JSON.stringify({ error: "Invalid payload for preferences" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                const statements = payload.map(p =>
                    env.DB.prepare(`
                        INSERT OR REPLACE INTO user_time_preferences 
                        (zwid, time_slot_id, preference_level) 
                        VALUES (?, ?, ?)
                    `).bind(zwid, p.slotId, p.level)
                );

                await env.DB.batch(statements);

                return new Response(JSON.stringify({ success: true, message: "Preferences updated" }), {
                    headers: { "Content-Type": "application/json" }
                });
            }

            // -------------------------
            // RACE AVAILABILITY
            // -------------------------
            if (type === 'race') {
                if (!payload || payload.roundId === undefined || payload.status === undefined) {
                    return new Response(JSON.stringify({ error: "Invalid payload for race availability" }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                await env.DB.prepare(`
                    INSERT OR REPLACE INTO availability 
                    (athlete_id, round_id, status, updated_at) 
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                `)
                .bind(zwid, payload.roundId, payload.status)
                .run();

                return new Response(JSON.stringify({ success: true, message: "Race availability updated" }), {
                    headers: { "Content-Type": "application/json" }
                });
            }

            return new Response(JSON.stringify({ error: "Invalid request type" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });

        } catch (e) {
            console.error("API POST Availability Error:", e);
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    return new Response("Not Found", { status: 404 });
}