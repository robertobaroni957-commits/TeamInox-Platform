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

        // Debug log
        console.log("[ImportRoster] Data structure:", typeof data, Array.isArray(data), data?.payload ? typeof data.payload : "no payload");

        // Normalizzazione flessibile
        let rawPayload = data.payload || data;
        if (rawPayload && !Array.isArray(rawPayload) && rawPayload.payload) {
             rawPayload = rawPayload.payload;
        }

        if (!Array.isArray(rawPayload)) {
            console.error("[ImportRoster] Invalid data structure:", rawPayload);
            throw new Error(`Formato JSON non valido: atteso array nel payload, trovato ${typeof rawPayload}`);
        }

        const processedData = rawPayload.map(item => {
            // Gestione flessibile per {key, data} o direttamente l'oggetto API
            const entry = item.data || item;
            
            return {
                teamExternalId: parseInt(entry.meta?.team?.teamid || 0),
                captainId: entry.meta?.captainId ? parseInt(entry.meta.captainId) : null,
                managerId: entry.meta?.managerId ? parseInt(entry.meta.managerId) : null,
                riders: (entry.riders || entry.members || []).map(r => ({
                    wtrlId: parseInt(r.tmuid || r.wtrlId || r.zwid || r.profileId || 0),
                    name: String(r.name || 'Unknown'),
                    category: String(r.category || 'N/A'),
                    avatar: String(r.avatar || '')
                }))
            };
        });

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
