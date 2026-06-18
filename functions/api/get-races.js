import { getRoundRepository } from "./utils/repositoryLoader";

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const round_v2_id = url.searchParams.get("round_v2_id");

    if (!round_v2_id) return new Response(JSON.stringify({ error: "round_v2_id mancante" }), { status: 400 });

    try {
        const repo = getRoundRepository(env.ZRL_DB);
        const canonicalRound = await repo.getRoundById(parseInt(round_v2_id, 10));

        if (!canonicalRound) return new Response(JSON.stringify({ error: "Round non trovato" }), { status: 404 });
        
        return new Response(JSON.stringify(canonicalRound.races), { 
            headers: { "Content-Type": "application/json" } 
        });
    } catch (err) {
        console.error("[API get-races Error]", err);
        return new Response(JSON.stringify({ 
            error: "Errore nel repository", 
            details: err.message
        }), { 
            status: 500,
            headers: { "Content-Type": "application/json" } 
        });
    }
}
