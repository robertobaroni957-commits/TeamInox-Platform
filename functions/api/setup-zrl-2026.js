// functions/api/setup-zrl-2026.js
export async function onRequestGet({ env }) {
    if (!env.DB) {
        return new Response("DB binding missing", { status: 500 });
    }

    const officialTimes = [
        "06:00", "07:00", "07:30", "09:30", "10:30", "11:30", "12:00", "13:00", "14:00", 
        "18:00", "18:30", "19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30", "20:45"
    ];

    try {
        // 1. Pulizia tabelle legate agli orari (per evitare duplicati e orfani)
        await env.DB.batch([
            env.DB.prepare("DELETE FROM user_time_preferences"),
            env.DB.prepare("DELETE FROM league_times")
        ]);

        // 2. Popolamento nuovi slot ufficiali
        const statements = officialTimes.map((time, index) => {
            return env.DB.prepare(
                "INSERT INTO league_times (id, region, start_time_utc, display_name, slot_order) VALUES (?, ?, ?, ?, ?)"
            ).bind(`T_${time.replace(':', '')}`, 'Europe', time, `${time} (CET)`, index + 1);
        });

        await env.DB.batch(statements);

        return new Response(JSON.stringify({ 
            success: true, 
            message: "Database bonificato con gli orari ufficiali TEAM INFO.json",
            count: officialTimes.length
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
