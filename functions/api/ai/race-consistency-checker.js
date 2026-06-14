/**
 * Race Consistency Checker
 * Validates performance metrics (MVP, Winner, Positions, Points).
 */
export function checkRaceConsistency(report, contextData) {
    // Ground truth from contextData
    const results = contextData.results || [];
    
    // Validate MVP
    if (report.mvp) {
        const mvpExists = results.some(r => r.rider_name === report.mvp);
        if (!mvpExists) return { valid: false, reason: `MVP ${report.mvp} not found in results` };
    }

    // Add more validation: Points consistency, etc.
    return { valid: true };
}
