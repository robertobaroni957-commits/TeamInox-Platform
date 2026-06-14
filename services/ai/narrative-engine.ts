/**
 * NarrativeEngine Service
 * Deterministic transformer: Data Object -> Platform Narrative.
 * STRICT: No data invention permitted.
 */

const BASE_SYSTEM_PROMPT = `
Sei un trasformatore di dati sportivi in narrativa.
REGOLA ASSOLUTA: Utilizza ESCLUSIVAMENTE i dati forniti nel JSON di input. 
È VIETATO inventare rider, risultati, posizioni o eventi non presenti.
Se il dato è mancante, non inventare; scrivi "Informazione non disponibile".
`;

const PLATFORM_STYLES = {
    discord: "Tono analitico, tecnico, focus sulle prestazioni.",
    instagram: "Tono emozionale, energico, focus sull'impatto visivo.",
    facebook: "Tono informativo, coinvolgente, adatto a un pubblico ampio."
};

const PROMPT_TEMPLATES = {
    race: (data, platform) => `
${BASE_SYSTEM_PROMPT}
Stile: ${PLATFORM_STYLES[platform]}
INPUT DATA: ${JSON.stringify(data)}
Obiettivo: Crea una narrazione sulla gara basata SOLO su MVP, top performers e metriche.
`,
    round: (data, platform) => `
${BASE_SYSTEM_PROMPT}
Stile: ${PLATFORM_STYLES[platform]}
INPUT DATA: ${JSON.stringify(data)}
Obiettivo: Crea una sintesi del round basata SOLO su team rankings e trend.
`,
    season: (data, platform) => `
${BASE_SYSTEM_PROMPT}
Stile: ${PLATFORM_STYLES[platform]}
INPUT DATA: ${JSON.stringify(data)}
Obiettivo: Crea un racconto celebrativo della stagione basato SOLO su metriche di progressione e milestones.
`
};

export const NarrativeEngine = {
    async generateRaceNarrative(env, data, platform = 'discord') {
        return await callLlama(env, PROMPT_TEMPLATES.race(data, platform));
    },
    async generateRoundNarrative(env, data, platform = 'discord') {
        return await callLlama(env, PROMPT_TEMPLATES.round(data, platform));
    },
    async generateSeasonNarrative(env, data, platform = 'discord') {
        return await callLlama(env, PROMPT_TEMPLATES.season(data, platform));
    }
};

async function callLlama(env, prompt) {
    // Shared call logic to LLM with strict constraints
    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [{ role: "system", content: prompt }]
    });
    return response.response;
}
