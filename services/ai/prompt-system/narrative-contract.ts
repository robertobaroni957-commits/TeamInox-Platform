/**
 * NarrativeContract
 * Defines the strict structural contract for all AI-generated content.
 */

export interface NarrativeSection {
    type: 'performance' | 'analysis' | 'highlight';
    content: string;
}

export interface NarrativeStat {
    label: string;
    value: string | number;
}

export interface NarrativeMetadata {
    grounded: boolean;
    confidence: number;
    source_hash?: string;
}

export interface NarrativeResponse {
    mode: 'race' | 'round' | 'season';
    title: string;
    summary: string;
    sections: NarrativeSection[];
    stats: NarrativeStat[];
    metadata: NarrativeMetadata;
}

/**
 * Validates an object against the NarrativeContract.
 */
export function validateNarrativeContract(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    
    const requiredKeys = ['mode', 'title', 'summary', 'sections', 'stats', 'metadata'];
    if (!requiredKeys.every(key => key in data)) return false;

    if (!Array.isArray(data.sections) || !Array.isArray(data.stats)) return false;
    
    return true;
}

/**
 * Returns a strict error object if AI generation fails or validation breaks.
 * NO GENERIC PROSE ALLOWED.
 */
export function getContractFallback(mode: 'race' | 'round' | 'season', reason: string): NarrativeResponse {
    return {
        mode,
        title: "Dati Non Disponibili",
        summary: `Impossibile generare la narrativa: ${reason}`,
        sections: [
            { 
                type: 'analysis', 
                content: "La generazione automatica è stata sospesa a causa di dati insufficienti o errori di validazione. Verificare i dati sorgente nel database." 
            }
        ],
        stats: [{ label: "Stato", value: "Errore Dati" }],
        metadata: { grounded: false, confidence: 0, source_hash: 'error_fallback' }
    };
}
