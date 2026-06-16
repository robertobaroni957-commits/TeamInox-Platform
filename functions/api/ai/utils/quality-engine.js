/**
 * AI Quality & Narrative Engine - Utility
 * Handles scoring, prompt variants, and metadata embedding.
 */

export const PROMPT_VARIANTS = {
    journalistic: `Sei un giornalista della Gazzetta dello Sport. Scrivi con enfasi, titoli forti e focus sul duello atletico.`,
    analytical: `Sei un Performance Coach esperto. Analizza i dati numerici, la costanza e suggerisci margini di miglioramento tattico.`,
    epic: `Sei un narratore epico. Racconta la stagione come un'odissea, celebrando la resilienza e l'identità del team.`
};

/**
 * Heuristic Quality Scorer
 * Returns score 0-100 based on narrative and data density.
 */
export function scoreReport(content, type, context) {
    let score = 0;
    
    // 1. Data Presence (Numbers/Percentages)
    const numbers = (content.match(/\d+/g) || []).length;
    score += Math.min(30, numbers * 2); 

    // 2. Structural integrity (Paragraphs)
    const paragraphs = content.split(/\n\n+/).length;
    score += Math.min(20, paragraphs * 4);

    // 3. Narrative Flow (No bullets check)
    const hasBullets = content.includes('* ') || content.includes('- ') || /^\d+\./m.test(content);
    if (!hasBullets) score += 20;

    // 4. Length check
    const minLength = type === 'season' ? 1200 : 500;
    if (content.length > minLength) score += 30;
    else score += (content.length / minLength) * 30;

    return Math.round(score);
}

/**
 * Embeds metadata into the content.
 * If content is an object, it adds a metadata field.
 * If content is a string, it appends an HTML comment.
 */
export function embedMetadata(content, metadata) {
    if (typeof content === 'object' && content !== null) {
        return { ...content, _metadata: metadata };
    }
    const metaString = `\n\n<!-- AI_METADATA: ${JSON.stringify(metadata)} -->`;
    return content + metaString;
}

export function extractMetadata(content) {
    const match = content.match(/<!-- AI_METADATA: (.*?) -->/);
    if (match) {
        try { return JSON.parse(match[1]); } catch (e) { return {}; }
    }
    return {};
}
