// @ts-check
import { SeasonActionService } from "../../../../../src/services/SeasonActionService";

export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    
    // Il JsonIngestor invia { data, seasonId, wtrl_id }
    const { data, seasonId, wtrl_id } = body;

    try {
        if (!data || !data.payload) {
            throw new Error("Formato JSON non valido: payload mancante");
        }

        // Normalizzazione rigorosa dei dati per evitare D1_TYPE_ERROR
        const processedData = data.payload.map(entry => ({
            teamExternalId: parseInt(entry.meta?.team?.teamid || 0),
            riders: (entry.riders || []).map(r => ({
                wtrlId: parseInt(r.tmuid || r.wtrlId || 0),
                name: String(r.name || 'Unknown'),
                category: String(r.category || 'N/A'),
                avatar: String(r.avatar || '')
            }))
        }));

        const sid = parseInt(seasonId || wtrl_id || 19);

        // Chiamata al servizio
        const result = await SeasonActionService.execute(env.ZRL_DB, 'IMPORT_ROSTER', {
            seasonId: sid,
            data: processedData
        });

        return new Response(JSON.stringify(result), { 
            status: 200,
            headers: { "Content-Type": "application/json" } 
        });
    } catch (err) {
        console.error("[Roster Import Error]", err);
        return new Response(JSON.stringify({ success: false, error: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
