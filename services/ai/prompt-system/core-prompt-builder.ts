/**
 * CorePromptBuilder
 * Generates grounded, structured prompts for the InoxTeam AI Narrative Engine.
 */

export interface NarrativeContext {
    mode: 'race' | 'round' | 'season';
    data: any;
}

/**
 * Foundation: Defines AI role as a pure data-to-text transformer.
 */
export function buildSystemPrompt(): string {
    return `Sei il "Narrative Engine" ufficiale della InoxTeam Platform.
Il tuo unico compito è trasformare dati sportivi strutturati in una narrazione coerente e coinvolgente.`;
}

/**
 * Strict Constraints: Prevents hallucinations and enforces data grounding.
 */
export function buildConstraintLayer(): string {
    return `
REGOLE DI GROUNDING ASSOLUTE (VIOLAZIONE = ERRORE CRITICO):
1. UTILIZZA ESCLUSIVAMENTE I DATI FORNITI NEL CONTEXT.
2. È PROIBITO inventare nomi di rider, risultati, statistiche o eventi non esplicitamente presenti.
3. Se un dato necessario per la narrativa è assente, scrivi: "Dati non disponibili".
4. Non aggiungere informazioni esterne al contesto sportivo (es. meteo non citato, eventi extra-gara).
5. Mantieni la coerenza numerica tra le statistiche citate e quelle fornite.
`;
}

/**
 * Mode Layer: Defines the narrative focus for each event type.
 */
export function buildModePrompt(mode: 'race' | 'round' | 'season'): string {
    const modes = {
        race: "Analizza la prestazione di gara focalizzandoti su MVP, top performers e dinamiche di team.",
        round: "Analizza il round complessivo basandoti su classifiche di team e trend di performance tra le varie gare.",
        season: "Analizza il percorso stagionale basandoti su progressione team, sviluppo rider e milestones raggiunte."
    };
    return `MODALITÀ NARRATIVA: ${mode.toUpperCase()}. ${modes[mode]}`;
}

/**
 * Context Layer: Formats the raw data for LLM consumption.
 */
export function buildContextLayer(data: any): string {
    return `
[DATA_CONTEXT]
${JSON.stringify(data, null, 2)}
[END_DATA_CONTEXT]
`;
}

/**
 * Composable function to build the final prompt.
 */
export function buildFinalPrompt(context: NarrativeContext): string {
    return [
        buildSystemPrompt(),
        buildConstraintLayer(),
        buildModePrompt(context.mode),
        buildContextLayer(context.data),
        "Genera la narrativa in base alle regole sopra."
    ].join('\n\n');
}
