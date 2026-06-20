import { getRoundRepository } from "./utils/repositoryLoader";

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const round_id = url.searchParams.get("round_id");

    if (!round_id) return new Response(JSON.stringify({ error: "round_id mancante" }), { status: 400 });

    try {
        const roundIdInt = parseInt(round_id, 10);
        
        // Guard clause: blocca l'uso accidentale di wtrl_id come round_id
        // Controlliamo se per caso il numero passato esiste come wtrl_id
        const isWtrlIdMatch = await env.ZRL_DB.prepare("SELECT id FROM rounds WHERE wtrl_id = ?").bind(roundIdInt).first();
        if (isWtrlIdMatch && isWtrlIdMatch.id !== roundIdInt) {
            return new Response(JSON.stringify({ error: "L'ID fornito sembra essere un WTRL ID. Per favore usa il round_id interno." }), { status: 400 });
        }

        const repo = getRoundRepository(env.ZRL_DB);
        const canonicalRound = await repo.getRoundById(roundIdInt);

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
