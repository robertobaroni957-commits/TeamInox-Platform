// ================================
// API Availability - Canonical
// ================================
import { getRoundRepository } from "./utils/repositoryLoader";
import { sanitize } from "./utils/dbUtils";

export async function onRequestGet(context) {
    console.log("[DEBUG] onRequestGet reached");
    const { env, data, request } = context;
    const user = data?.user;
    const zwid = user?.zwid ? Number(user.zwid) : null;
    const role = user?.role;

    if (zwid === null || isNaN(zwid)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const url = new URL(request.url);
        const isAdminRequest = url.searchParams.get('all') === 'true';

        // ============ Admin / Moderator ============
        if (isAdminRequest && (role === 'admin' || role === 'moderator')) {
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

            return new Response(JSON.stringify({
                allPreferences: results[0].results || [],
                allAvailabilities: results[1].results || [],
                athletes: results[2].results || []
            }), {
                headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
            });
        }

        // ============ User: Canonical Path ============
        const repo = getRoundRepository(env.ZRL_DB);
        const allRounds = await repo.getCanonicalRoundsWithUserStatus(env.ZRL_DB, 'zrl_25_26', sanitize(zwid, 'zwid'));

        // Filtriamo per round attivo: prendiamo quello con il round_number più alto tra quelli non archiviati/completati
        // Se non ne troviamo uno 'CREATED', prendiamo quello con il numero più alto
        const activeRound = allRounds
            .filter(r => r.lifecycle?.sync_state !== 'ARCHIVED')
            .sort((a, b) => b.round_number - a.round_number)[0];

        const userRounds = activeRound ? [activeRound] : allRounds;

        const timeSlots = await env.ZRL_DB.prepare(`SELECT * FROM league_times ORDER BY slot_order`).all();
        const userPrefs = await env.ZRL_DB.prepare(`SELECT * FROM user_time_preferences WHERE zwid = ?`).bind(sanitize(zwid, 'zwid')).all();
        const participationIntent = await env.ZRL_DB.prepare(`
                SELECT intent FROM zrl_participation_intent 
                WHERE zwid = ? AND series_id = (SELECT id FROM series WHERE is_active = 1 LIMIT 1)
            `).bind(sanitize(zwid, 'zwid')).all();

        return new Response(JSON.stringify({
            timeSlots: timeSlots.results,
            preferences: userPrefs.results,
            rounds: userRounds,
            intent: participationIntent.results[0]?.intent === 1
        }), {
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
        });

    } catch (e) {
        console.error("[API GET Availability Error]", e);
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

export async function onRequestPost(context) {
    const { env, data, request } = context;
    const user = data?.user;
    const zwid = user?.zwid ? Number(user.zwid) : null;

    if (zwid === null || isNaN(zwid)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { type, payload } = body;

        // Intent
        if (type === 'intent') {
            const intentValue = payload.intent === true ? 1 : 0;
            await env.ZRL_DB.prepare(`
                INSERT OR REPLACE INTO zrl_participation_intent 
                (zwid, series_id, intent) 
                VALUES (?, (SELECT id FROM series WHERE is_active = 1 LIMIT 1), ?)
            `).bind(sanitize(zwid), intentValue).run();

            return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
        }

        // Preferences
        if (type === 'preferences') {
            const statements = payload.map(p => env.ZRL_DB.prepare(`
                    INSERT OR REPLACE INTO user_time_preferences 
                    (zwid, time_slot_id, preference_level) 
                    VALUES (?, ?, ?)
                `).bind(sanitize(zwid), sanitize(p.slotId), sanitize(p.level)));
            await env.ZRL_DB.batch(statements);
            return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
        }

        // Race Availability
        if (type === 'race') {
            if (!payload || payload.raceId === undefined || payload.status === undefined) {
                return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
            }

            // Sanitizzazione sicura
            const raceId = sanitize(payload.raceId);
            const status = sanitize(payload.status);
            
            if (zwid === null || raceId === null || status === null) {
                console.error(`[CRITICAL] Bind failed: zwid=${zwid}, raceId=${raceId}, status=${status}`);
                return new Response(JSON.stringify({ error: "Invalid ID/status types" }), { status: 400 });
            }

            // Scrittura nella tabella specifica per le gare
            await env.ZRL_DB.prepare(`
                INSERT OR REPLACE INTO availability_races 
                (zwid, race_id, status, updated_at) 
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(sanitize(zwid), raceId, status).run();

            return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400 });

    } catch (e) {
        console.error("[API POST Availability Error]", e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
