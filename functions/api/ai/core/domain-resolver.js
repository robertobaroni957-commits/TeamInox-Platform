/**
 * domain-resolver.js
 * Validates domain context and resolves to DomainContextMode.
 * NEVER blocks; instead classifies into VALID, DEGRADED, or PROJECTED.
 */

export const DOMAIN_MODES = {
    VALID: 'VALID',
    DEGRADED: 'DEGRADED_CONTEXT',
    PROJECTED: 'PROJECTED_CONTEXT'
};

export function resolveDomain(mode, params, graph) {
    const { nodes } = graph;
    
    // Check if critical round context exists
    const roundExists = !!nodes[`round:${params.round_id}`];
    // Check if team exists (if applicable)
    const teamExists = !params.team_id || !!nodes[`team:${params.team_id}`];

    // Identify if data exists in graph for the requested mode
    const hasRaces = Object.values(nodes).some(n => n.type === 'race' && n.data.round_id == params.round_id);
    const hasResults = false; // Simplified: check against real graph or engine metrics if needed

    if (!roundExists || !teamExists) {
        return { mode: DOMAIN_MODES.PROJECTED, reason: "ID_NOT_FOUND" };
    }

    if (hasRaces) {
        return { mode: DOMAIN_MODES.VALID, reason: "FULL_DATA" };
    }

    return { mode: DOMAIN_MODES.DEGRADED, reason: "PARTIAL_DATA" };
}
