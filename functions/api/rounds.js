import { getRoundRepository } from "./utils/repositoryLoader";

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const season_code = url.searchParams.get("season_code") || 'zrl_25_26';

    if (!env.ZRL_DB) return new Response("DB non trovato", { status: 500 });

    try {
        const repo = getRoundRepository(env.ZRL_DB);
        const rounds = await repo.getCanonicalRounds(season_code);
        
        return new Response(JSON.stringify(rounds), { 
            headers: { 
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate"
            } 
        });
    } catch (error) {
        console.error("[API Rounds Error]", error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
        });
    }
}
