/**
 * Anti-Hallucination Guardrails
 * Deterministic validation layer ensuring AI output grounded in provided context.
 */

export interface ValidationResult {
    isValid: boolean;
    confidence: number; // 0 to 1
    reason: string[];
    strictModeFailed: boolean;
}

/**
 * Validates that all entities (riders/teams) in output exist in context.
 */
export function validateNoInventedEntities(output: string, context: any): string[] {
    const invalidEntities: string[] = [];
    
    // Extract valid entities from context
    const validRiders = context.riders?.map((r: any) => r.name) || [];
    const validTeams = context.teams?.map((t: any) => t.name) || [];
    const allowed = [...validRiders, ...validTeams];

    // Simple heuristic: extract capitalized words that aren't common English stop words
    const potentialEntities = output.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g) || [];

    potentialEntities.forEach(entity => {
        if (!allowed.includes(entity) && !isCommonWord(entity)) {
            invalidEntities.push(entity);
        }
    });

    return invalidEntities;
}

/**
 * Validates that all numbers mentioned in output are supported by context metrics.
 */
export function enforceGrounding(context: any, output: string): ValidationResult {
    const reasons: string[] = [];
    const invalidEntities = validateNoInventedEntities(output, context);
    
    if (invalidEntities.length > 0) {
        reasons.push(`Invented entities found: ${invalidEntities.join(', ')}`);
    }

    // Heuristic: check if output contains numbers not in context (very simplified)
    const outputNumbers = output.match(/\d+/g)?.map(Number) || [];
    const contextNumbers = JSON.stringify(context).match(/\d+/g)?.map(Number) || [];
    
    outputNumbers.forEach(num => {
        if (!contextNumbers.includes(num)) {
            reasons.push(`Number ${num} not found in ground truth context`);
        }
    });

    return {
        isValid: reasons.length === 0,
        confidence: computeConfidenceScore(output, context),
        reason: reasons,
        strictModeFailed: reasons.length > 0
    };
}

export function computeConfidenceScore(output: string, context: any): number {
    const invalid = validateNoInventedEntities(output, context);
    const totalPotential = (output.match(/\b[A-Z][a-z]+\b/g) || []).length;
    
    if (totalPotential === 0) return 1.0;
    
    return Math.max(0, 1 - (invalid.length / totalPotential));
}

function isCommonWord(word: string): boolean {
    const stopWords = ['Il', 'La', 'E', 'Zrl', 'Season', 'Round', 'Team', 'Inox'];
    return stopWords.includes(word);
}
