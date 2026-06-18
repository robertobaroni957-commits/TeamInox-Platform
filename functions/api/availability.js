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

        // ============ Admin / Moderator: Tutti i dati ============
        if (isAdminRequest && (role === 'admin' || role === 'moderator')) {
            console.log("[DEBUG] Eseguo batch Admin / Moderator");

            const results = await env.ZRL_DB.batch([
                env.ZRL_DB.prepare(`SELECT p.*, a.name FROM user_time_preferences p JOIN athletes a ON p.zwid = a.zwid`),
                env.ZRL_DB.prepare(`SELECT v.*, a.name FROM availability v JOIN athletes a ON v.zwid = a.zwid`),
                env.ZRL_DB.prepare(`
                    SELECT a.zwid, a.name, a.base_category, 
                           GROUP_CONCAT(t.name, ', ') as team
                    FROM athletes a
                    LEFT JOIN team_members tm ON a.zwid = tm.athlete_id
                    LEFT JOIN teams t ON tm.team_id = t.wtrl_team_id
                    GROUP BY a.zwid
                `)
            ]);

            console.log(`[DEBUG] Query risultati: Prefs=${results[0].results.length}, Avail=${results[1].results.length}, Athletes=${results[2].results.length}`);

            return new Response(JSON.stringify({
                allPreferences: results[0].results || [],
                allAvailabilities: results[1].results || [],
                athletes: results[2].results || []
            }), {
                headers: { 
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store"
                }
            });
        }

        // ============================
        // User: solo propri dati
        // ============================
        console.log("[DEBUG] Eseguo batch User");

        const results = await env.ZRL_DB.batch([
            env.ZRL_DB.prepare(`SELECT * FROM league_times ORDER BY slot_order`),
            env.ZRL_DB.prepare(`SELECT * FROM user_time_preferences WHERE zwid = ?`).bind(zwid),
            env.ZRL_DB.prepare(`
                SELECT r.id, r.name, r.starts_at as date,
                    (SELECT status FROM availability WHERE zwid = ? AND round_id = r.id) as status
                FROM rounds_v2 r
                WHERE r.season_code = 'zrl_25_26'
                ORDER BY r.starts_at ASC
            `).bind(zwid),
            env.ZRL_DB.prepare(`
                SELECT intent FROM zrl_participation_intent 
                WHERE zwid = ? AND series_id = (SELECT id FROM series WHERE is_active = 1 LIMIT 1)
            `).bind(zwid)
        ]);

        console.log(`[DEBUG] Query risultati User: timeSlots=${results[0].results.length}, preferences=${results[1].results.length}, rounds=${results[2].results.length}, intent=${results[3].results.length}`);

        return new Response(JSON.stringify({
            timeSlots: results[0].results,
            preferences: results[1].results,
            rounds: results[2].results,
            intent: results[3].results[0]?.intent === 1
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
        // Intent
        // ============================
        if (type === 'intent') {
            const intentValue = payload.intent === true ? 1 : 0;
            console.log(`[DEBUG] Inserimento intent: value=${intentValue}`);
            
            await env.ZRL_DB.prepare(`
                INSERT OR REPLACE INTO zrl_participation_intent 
                (zwid, series_id, intent) 
                VALUES (?, (SELECT id FROM series WHERE is_active = 1 LIMIT 1), ?)
            `).bind(zwid, intentValue).run();

            return new Response(JSON.stringify({ success: true, message: "Intent updated" }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // ============================
        // Preferences
        // ============================
        if (type === 'preferences') {
            if (!Array.isArray(payload) || payload.length === 0) {
                return new Response(JSON.stringify({ error: "Invalid payload for preferences" }), { status: 400 });
            }

            const statements = payload.map(p => {
                console.log(`[DEBUG] Inserimento preference: slot=${p.slotId}, level=${p.level}`);
                return env.ZRL_DB.prepare(`
                    INSERT OR REPLACE INTO user_time_preferences 
                    (zwid, time_slot_id, preference_level) 
                    VALUES (?, ?, ?)
                `).bind(zwid, p.slotId, p.level);
            });

            await env.ZRL_DB.batch(statements);

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

            // Validation: Check if round exists in rounds_v2
            const roundCheck = await env.ZRL_DB.prepare("SELECT id FROM rounds_v2 WHERE id = ?").bind(payload.roundId).first();
            if (!roundCheck) {
                console.error(`[DEBUG] Invalid roundId in rounds_v2: ${payload.roundId}`);
                return new Response(JSON.stringify({ error: `Invalid roundId: ${payload.roundId}` }), { 
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            await env.ZRL_DB.prepare(`
                INSERT OR REPLACE INTO availability 
                (zwid, round_id, status, updated_at) 
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
