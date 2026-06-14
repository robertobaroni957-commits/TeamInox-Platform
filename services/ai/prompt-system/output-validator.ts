/**
 * OutputValidator
 * Reliability layer for AI Narrative outputs.
 */

import { 
    NarrativeResponse, 
    validateNarrativeContract, 
    getContractFallback 
} from './narrative-contract.js';

export function sanitizeMarkdownArtifacts(output: string): string {
    return output.replace(/```json\n?|\n?```/g, "").trim();
}

export function validateOutputSchema(output: string): { valid: boolean; data?: NarrativeResponse } {
    const cleaned = sanitizeMarkdownArtifacts(output);
    try {
        const data = JSON.parse(cleaned);
        
        if (validateNarrativeContract(data)) {
            return { valid: true, data: data as NarrativeResponse };
        }
        return { valid: false, data: data }; 
    } catch (e) {
        return { valid: false };
    }
}

export function forceContractCompliance(data: any, mode: 'race' | 'round' | 'season'): NarrativeResponse {
    if (!data || typeof data !== 'object') {
        return getContractFallback(mode, "Input non valido per la conformità del contratto");
    }

    return {
        mode: data?.mode || mode,
        title: data?.title || "Dati Non Disponibili",
        summary: data?.summary || "Dati insufficienti per una sintesi.",
        sections: (Array.isArray(data?.sections) && data.sections.length > 0) 
            ? data.sections 
            : [{ type: 'analysis', content: "Dettagli tecnici non disponibili." }],
        stats: Array.isArray(data?.stats) ? data.stats : [],
        metadata: {
            grounded: data?.metadata?.grounded ?? false,
            confidence: data?.metadata?.confidence || 0,
            source_hash: data?.metadata?.source_hash || 'repaired'
        }
    };
}

/**
 * Robust repair: Attempts to extract valid JSON from a malformed string.
 * It will not attempt to rewrite the string content, only extract valid blocks.
 */
export function repairInvalidJson(output: string): NarrativeResponse | null {
    let clean = sanitizeMarkdownArtifacts(output);
    const first = clean.indexOf('{');
    const last = clean.lastIndexOf('}');
    
    if (first === -1 || last === -1 || last <= first) return null;
    
    const jsonStr = clean.substring(first, last + 1);
    
    try {
        const data = JSON.parse(jsonStr);
        return forceContractCompliance(data, data.mode || 'race');
    } catch (e) {
        return null;
    }
}

export function fallbackNarrative(context: any, mode: 'race' | 'round' | 'season'): NarrativeResponse {
    const source_hash = context?.metadata?.source_hash || 'unknown_fallback';
    return getContractFallback(mode, source_hash);
}
