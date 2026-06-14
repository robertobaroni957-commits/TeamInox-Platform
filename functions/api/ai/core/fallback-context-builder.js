/**
 * fallback-context-builder.js
 * Attempts to derive missing identifiers from graph state.
 */

export function fallbackContextBuilder(mode, params, graph) {
    const p = { ...params };
    const nodes = Object.values(graph.nodes);

    console.log(`[FALLBACK] Initial params:`, JSON.stringify(p));

    // Derive missing round_id
    if (!p.round_id && (mode === 'race' || mode === 'round')) {
        const rounds = nodes
            .filter(n => n.type === 'round')
            .sort((a, b) => b.data.id - a.data.id);
        if (rounds.length > 0) {
            p.round_id = rounds[0].data.id;
            console.log(`[FALLBACK] Derived round_id: ${p.round_id}`);
        }
    }

    // Derive missing team_id (only for race if necessary)
    if (!p.team_id && mode === 'race') {
        const team = nodes.find(n => n.type === 'team');
        if (team) {
            p.team_id = team.data.wtrl_team_id || team.data.id;
            console.log(`[FALLBACK] Derived team_id: ${p.team_id}`);
        }
    }

    // Derive missing season_code
    if (!p.season_code && mode === 'season') {
        const seasons = nodes.filter(n => n.type === 'season');
        if (seasons.length > 0) {
            p.season_code = seasons[0].data.code;
            console.log(`[FALLBACK] Derived season_code: ${p.season_code}`);
        }
    }

    console.log(`[FALLBACK] Final params:`, JSON.stringify(p));
    return p;
}
