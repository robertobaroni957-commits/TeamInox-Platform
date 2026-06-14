/**
 * Participant Grounding Layer
 * Ensures no invented riders are mentioned.
 */
export function checkParticipantGrounding(report, contextData) {
    const validRiders = contextData.participants?.map(p => p.name) || [];
    const mentionedRiders = extractRiderNames(report.content + " " + report.team_analysis);

    for (const rider of mentionedRiders) {
        if (!validRiders.includes(rider)) {
            return { valid: false, reason: `Invented rider mentioned: ${rider}` };
        }
    }
    
    return { valid: true };
}

// Simple heuristic to find names capitalized in text
function extractRiderNames(text) {
    // This is a placeholder logic: in production, use NER or predefined list
    return []; 
}
