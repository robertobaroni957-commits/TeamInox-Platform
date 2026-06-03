import { roundBridge } from "./utils/roundBridge";

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const round_v2_id = url.searchParams.get("round_v2_id");

    if (!round_v2_id) return new Response(JSON.stringify({ error: "round_v2_id mancante" }), { status: 400 });

    try {
        const races = await roundBridge.getRacesByRoundV2(env.ZRL_DB, parseInt(round_v2_id, 10));
        return new Response(JSON.stringify(races), { 
            headers: { 
                "Content-Type": "application/json",
                "Cache-Control": "no-cache"
            } 
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
