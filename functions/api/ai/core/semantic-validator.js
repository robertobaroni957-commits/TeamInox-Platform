/**
 * semantic-validator.js
 * Progressive validation ensuring narrative generation for partial/future data.
 */

import { AI_MODES } from './constants.js';

export const LEVEL = { FULL: 'FULL', PARTIAL: 'PARTIAL', FUTURE: 'FUTURE', BLOCKED: 'BLOCKED' };

export function validateSemanticIntegrity(arg1, arg2, arg3) {
    let mode, engineData, report = null, contextData = null;

    if (typeof arg1 === 'string') {
        // Called from generate.js: validateSemanticIntegrity(mode, engineData)
        mode = arg1;
        engineData = arg2;
    } else {
        // Called from orchestrator.js: validateSemanticIntegrity(parsedReport, contextData, report_type)
        report = arg1;
        contextData = arg2;
        mode = arg3 || report?.type || report?.mode;
        engineData = contextData;
    }

    // 1. If absolutely no usable sports data exists, block.
    if (!engineData || Object.keys(engineData).length === 0) {
        return { valid: false, level: LEVEL.BLOCKED, reason: "INVALID_CONTEXT" };
    }

    // 2. Perform grounding checks if a generated report is provided
    if (report) {
        let validRiders = [];
        let validTeams = [];

        if (mode === AI_MODES.RACE) {
            validRiders = contextData.performance?.map(r => r.rider_name) || [];
            validTeams = [
                contextData.target_team?.name,
                ...(contextData.competitors?.map(c => c.team_name) || [])
            ].filter(Boolean);
        } else if (mode === AI_MODES.ROUND) {
            validRiders = contextData.top_performers?.map(p => p.rider_name) || [];
            validTeams = contextData.standings?.map(s => s.team_name) || [];
        } else if (mode === AI_MODES.SEASON) {
            validTeams = contextData.standings?.map(s => s.team_name) || [];
            validRiders = contextData.round_by_round?.map(r => r.rider_name).filter(Boolean) || [];
        }

        // If MVP is generated, verify it exists in the valid riders list
        if (report.mvp && report.mvp !== 'N/A' && validRiders.length > 0) {
            const mvpValid = validRiders.some(name => 
                name.toLowerCase().includes(report.mvp.toLowerCase()) || 
                report.mvp.toLowerCase().includes(name.toLowerCase())
            );
            if (!mvpValid) {
                return { valid: false, level: LEVEL.BLOCKED, reason: `Hallucinated MVP rider: ${report.mvp}` };
            }
        }

        // New Grounding Check: Ensure no invented rider names in content
        const content = (report.content || '') + ' ' + (report.summary || '');
        const potentialNames = content.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g) || [];
        
        const stopWords = ['Zrl', 'Season', 'Round', 'Team', 'Inox', 'InoxTeam', 'Wtrl', 'Zwift', 'League'];
        const invalidNames = potentialNames.filter(name => {
            if (stopWords.includes(name)) return false;
            const isRider = validRiders.some(v => v.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(v.toLowerCase()));
            const isTeam = validTeams.some(v => v.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(v.toLowerCase()));
            return !isRider && !isTeam;
        });

        if (invalidNames.length > 3) { // Allow some threshold for natural language, but reject blatant hallucination
             return { valid: false, level: LEVEL.BLOCKED, reason: `Potential hallucinated entities: ${invalidNames.slice(0, 3).join(', ')}` };
        }
    }

    // 3. Mode-specific structural validation of the engineData
    if (mode === AI_MODES.RACE) {
        const hasRiders = (engineData.riderResults && engineData.riderResults.length > 0) || 
                          (engineData.performance && engineData.performance.length > 0);
        if (hasRiders) return { valid: true, level: LEVEL.FULL };
        if (engineData.race_id || engineData.round_id || engineData.race_info) return { valid: true, level: LEVEL.FUTURE };
        return { valid: false, level: LEVEL.BLOCKED, reason: "NO_RACE_OR_ROUND_ID" };
    } 
    
    // 3. Round/Season Mode Logic
    const hasRaces = (engineData.races && engineData.races.length > 0) || 
                      (engineData.round_by_round && engineData.round_by_round.length > 0);
    const hasStandings = (engineData.standings && engineData.standings.length > 0) || 
                          (engineData.team_rankings && engineData.team_rankings.length > 0);
    
    if (hasRaces || hasStandings) {
        return { 
            valid: true, 
            level: (hasRaces && hasStandings) ? LEVEL.FULL : LEVEL.PARTIAL, 
            reason: (hasRaces && hasStandings) ? null : "PARTIAL_DATA_AVAILABLE" 
        };
    }
    
    return { valid: true, level: LEVEL.FUTURE, reason: "FUTURE_MODE_NO_DATA" };
}
