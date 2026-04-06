// functions/api/round-status.js

export async function onRequestGet(context) {
    const { env } = context;

    try {
        // 1. Get the most recent active series
        const series = await env.DB.prepare(`
            SELECT * FROM series 
            WHERE is_active = 1 
            ORDER BY id DESC LIMIT 1
        `).first();

        if (!series) {
            return new Response(JSON.stringify({
                success: true,
                series: null,
                rounds: [],
                message: "Nessuna serie attiva trovata."
            }), { 
                headers: { 
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                } 
            });
        }

        // 2. Get all rounds for this series with counts
        const rounds = await env.DB.prepare(`
            SELECT r.*,
                (SELECT COUNT(*) FROM round_teams rt WHERE rt.round_id = r.id) as team_count,
                (SELECT COUNT(*) FROM race_lineup rl WHERE rl.round_id = r.id) as lineup_count,
                (SELECT COUNT(*) FROM availability a WHERE a.round_id = r.id) as availability_count
            FROM rounds r
            WHERE r.series_id = ?
            ORDER BY r.date ASC, r.id ASC
        `).bind(series.id).all();

        // 3. Get total teams available in the system
        const totalTeams = await env.DB.prepare(`SELECT COUNT(*) as count FROM teams`).first();

        return new Response(JSON.stringify({
            success: true,
            series,
            rounds: rounds.results || [],
            total_system_teams: totalTeams.count,
            message: "Stato round recuperato correttamente."
        }), {
            headers: { 
                "Content-Type": "application/json",
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        });

    } catch (err) {
        console.error("ERRORE API round-status:", err.message);
        return new Response(JSON.stringify({ 
            success: false, 
            error: err.message 
        }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}
