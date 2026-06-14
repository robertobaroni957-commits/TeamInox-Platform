/**
 * PromptOrchestrator
 * Definitive builder for Gemini prompts with strict grounding and hallucination-free generation.
 */

import { NarrativeResponse } from './narrative-contract.js';

export function injectSystemPrompt(): string {
    return `Sei il "Narrative Engine" ufficiale della InoxTeam Platform.
Il tuo ruolo è trasformare dati sportivi strutturati in una narrazione coerente.
Sei un trasformatore deterministico: NON inventare risultati, NON inventare nomi, ma inferisci il tono basandoti sul contesto fornito.`;
}

export function injectConstraintLayer(): string {
    return `
REGOLE DI GROUNDING ASSOLUTE (VIOLAZIONE = RIGETTO):
1. PRODUCI SEMPRE JSON VALIDO SECONDO IL CONTRACT.
2. UTILIZZA ESCLUSIVAMENTE I DATI FORNITI NEL DATA_CONTEXT.
3. È PROIBITO INVENTARE: nomi di rider, posizioni, punti, o eventi non presenti nei dati.
4. Se i dati sono scarsi o parziali, NON inferire risultati mancanti. Descrivi solo ciò che è presente.
5. Se un campo richiesto (es. MVP) non è supportato dai dati, scrivi "N/A" o "Dati non disponibili".
6. EVITA FRASEOLOGISMI GENERICI (es. "team si prepara", "fase di transizione"). Sii specifico sui dati reali.
`;
}

function buildModePrompt(mode: 'race' | 'round' | 'season', validationLevel: string): string {
    const focus = {
        race: `GARA: Analizza esclusivamente la prestazione basandoti sui rider e i risultati forniti.`,
        round: `ROUND: Analizza il round complessivo basandoti sulle classifiche di team e i top performer citati.`,
        season: `STAGIONE: Analizza il percorso stagionale basandoti esclusivamente sulla progressione dei punti e dei rank forniti.`
    };
    
    let instructions = focus[mode];
    if (validationLevel === 'PARTIAL') instructions += " ATTENZIONE: I dati sono parziali. Non cercare di completare le informazioni mancanti.";
    if (validationLevel === 'FUTURE') instructions += " ATTENZIONE: Nessun dato reale disponibile. Restituisci un JSON con messaggi di 'Dati non ancora disponibili' invece di generare testo creativo.";

    return `MODALITÀ DI ANALISI: ${mode.toUpperCase()}. ${instructions}`;
}

export function injectContextLayer(context: any): string {
    return `
[DATA_CONTEXT]
${JSON.stringify(context, null, 2)}
[END_DATA_CONTEXT]
`;
}

export function injectOutputContract(): string {
    return `
CRITICAL: YOU MUST OUTPUT ONLY VALID JSON.
FOLLOW THIS SCHEMA EXACTLY:

{
  "mode": "race | round | season",
  "status": "SUCCESS | PARTIAL | EMPTY",
  "title": "string",
  "summary": "string",
  "sections": [
    {
      "type": "performance" | "analysis" | "highlight",
      "content": "string"
    }
  ],
  "stats": [
    {
      "label": "string",
      "value": "string|number"
    }
  ],
  "metadata": {
    "grounded": true,
    "confidence": number
  }
}

HARD RULES:
- Output MUST be valid JSON parseable by JSON.parse()
- NEVER cut output mid-sentence
- NEVER omit brackets or braces
- NEVER write prose outside JSON
- NO markdown, NO backticks, NO "Here is the response"
`;
}

export function generatePrompt(mode: 'race' | 'round' | 'season', context: any): string {
    return [
        injectSystemPrompt(),
        injectConstraintLayer(),
        buildModePrompt(mode, context._validationLevel),
        injectContextLayer(context),
        injectOutputContract()
    ].join('\n\n');
}
