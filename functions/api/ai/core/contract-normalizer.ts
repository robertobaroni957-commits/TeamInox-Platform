/**
 * contract-normalizer.ts
 * Helper to force-map any engine output to the strict NarrativeResponse contract.
 */
import { NarrativeResponse } from '../../../../services/ai/prompt-system/narrative-contract';

export function normalizeToContract(
    mode: 'race' | 'round' | 'season',
    rawOutput: any,
    state: 'success' | 'empty' | 'semantic_block' | 'error' | 'partial',
    warning?: string
): NarrativeResponse {
    // If it's already a valid response, return it with updated state
    if (rawOutput && typeof rawOutput === 'object' && 'sections' in rawOutput) {
        return {
            ...rawOutput,
            mode,
            metadata: { 
                ...rawOutput.metadata, 
                state,
                ...(warning ? { warning } : {})
            }
        };
    }

    // Fallback: Build a contract-compliant object from whatever is available
    return {
        mode,
        title: rawOutput?.title || "Analisi Sportiva",
        summary: rawOutput?.summary || "Dati elaborati non disponibili.",
        sections: rawOutput?.sections || [{ type: 'analysis', content: "Dati non disponibili." }],
        stats: rawOutput?.stats || [],
        metadata: {
            grounded: true,
            confidence: 0,
            state,
            source_hash: 'manual_normalization',
            ...(warning ? { warning } : {})
        }
    };
}
