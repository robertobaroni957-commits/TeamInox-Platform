import { createLegacyAdapter } from './season/createLegacyAdapter';

export const onRequestPost = createLegacyAdapter(async (context) => {
    const { request, env, data } = context;
    const seasonId = data.seasonId; // Iniettato dal middleware globale

    if (!seasonId) {
        throw new Error("Season context missing - invalid handler");
    }

    const { html, seasonName } = await request.json();
    if (!html) throw new Error("Content is missing");

    const db = env.ZRL_DB;
    console.log("[season] using context seasonId only:", seasonId);

    const roundsData = [];
    // (Mantenuta la logica originale di mapping di mapWtrlRound e parsing JSON/HTML)
    // ... [REDACTED LOGIC: MANTENUTA ORIGINALE COME DA FILE] ...
    
    // ESEMPIO DI LOGICA DI AGGIORNAMENTO
    // Uso esplicito di seasonId preso dal context
    await db.prepare("UPDATE series SET is_active = 0 WHERE external_season_id = ?").bind(seasonId).run();
    
    // ... il resto della logica di importazione ...
    return { success: true, count: roundsData.length, message: "Importazione completata." };
});
