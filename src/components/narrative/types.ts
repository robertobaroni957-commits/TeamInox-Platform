/**
 * UI Narrative Contract Types
 * Defines the strict structural contract for UI consumption.
 */

export type SectionType = 'performance' | 'analysis' | 'highlight';

export interface NarrativeSection {
    type: SectionType;
    content: string;
}

export interface NarrativeStat {
    label: string;
    value: string | number;
}

export interface NarrativeResponse {
    mode: 'race' | 'round' | 'season';
    title: string;
    summary: string;
    sections: NarrativeSection[];
    stats: NarrativeStat[];
    metadata: Record<string, any>;
}

/**
 * Runtime Type Guard: Ensures object conforms to NarrativeResponse.
 */
export function isNarrativeResponse(data: any): data is NarrativeResponse {
    const isValid = (
        typeof data === 'object' &&
        data !== null &&
        typeof data.title === 'string' &&
        typeof data.summary === 'string' &&
        Array.isArray(data.sections) &&
        Array.isArray(data.stats) &&
        typeof data.metadata === 'object'
    );
    if (!isValid) console.warn("[TypeGuard] Failed check for data:", data);
    return isValid;
}
