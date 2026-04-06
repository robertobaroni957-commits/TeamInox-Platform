// functions/api/round-reset.js

export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        const body = await request.json();
        const { round_id, confirm } = body;

        if (!round_id) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Dati mancanti (round_id è obbligatorio)" 
            }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        if (!confirm) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Richiesta conferma (confirm: true) non fornita." 
            }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        // 1. Get round info to log what we're deleting
        const round = await env.DB.prepare(`SELECT name FROM rounds WHERE id = ?`).bind(round_id).first();
        if (!round) {
            return new Response(JSON.stringify({ success: false, error: "Round non trovato." }), { status: 404 });
        }

        console.log(`RESET ROUND: Resettando dati per "${round.name}" (ID: ${round_id})...`);

        // 2. Perform deletions in a batch
        // We delete: lineups, availability, round_teams, results
        // WE DO NOT delete the round entry itself or users/teams
        await env.DB.batch([
            env.DB.prepare(`DELETE FROM race_lineup WHERE round_id = ?`).bind(round_id),
            env.DB.prepare(`DELETE FROM availability WHERE round_id = ?`).bind(round_id),
            env.DB.prepare(`DELETE FROM round_teams WHERE round_id = ?`).bind(round_id),
            env.DB.prepare(`DELETE FROM results WHERE round_id = ?`).bind(round_id)
        ]);

        return new Response(JSON.stringify({
            success: true,
            message: `Tutti i dati per il round "${round.name}" sono stati resettati (lineup, availability, team associations).`
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error("ERRORE API round-reset:", err.message);
        return new Response(JSON.stringify({ 
            success: false, 
            error: err.message 
        }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}
