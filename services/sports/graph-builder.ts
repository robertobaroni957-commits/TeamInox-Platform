/**
 * Graph Builder Service
 * Transforms relational D1 data into a runtime graph structure.
 */

// Simple node/edge structure
interface GraphNode { id: string; type: string; data: any; }
interface GraphEdge { source: string; target: string; type: string; }

export interface SportsGraph {
    nodes: Record<string, GraphNode>;
    edges: GraphEdge[];
}

/**
 * Builds the runtime graph from D1 data.
 * Pure transformation function.
 */
export function transformToGraph(data: {
    seasons: any[];
    rounds: any[];
    races: any[];
    teams: any[];
    riders: any[];
    riderResults: any[];
    teamResults: any[];
}): SportsGraph {
    const graph: SportsGraph = { nodes: {}, edges: [] };

    // Helper to add nodes
    const addNode = (type: string, id: number | string, data: any) => {
        const nodeId = `${type}:${id}`;
        graph.nodes[nodeId] = { id: nodeId, type, data };
        return nodeId;
    };

    // Helper to add edges
    const addEdge = (source: string, target: string, type: string) => {
        graph.edges.push({ source, target, type });
    };

    // 1. Process Nodes
    data.seasons.forEach(s => addNode('season', s.id, s));
    data.rounds.forEach(r => addNode('round', r.id, r));
    data.races.forEach(r => addNode('race', r.id, r));
    data.teams.forEach(t => addNode('team', t.id, t));
    data.riders.forEach(r => addNode('rider', r.id, r));

    // 2. Process Edges (Relationships)
    data.rounds.forEach(r => addEdge(`season:${r.season_id}`, `round:${r.id}`, 'contains'));
    data.races.forEach(r => addEdge(`round:${r.round_id}`, `race:${r.id}`, 'contains'));
    
    data.teamResults.forEach(tr => addEdge(`race:${tr.race_id}`, `team:${tr.team_id}`, 'competed_in'));
    data.riderResults.forEach(rr => {
        addEdge(`race:${rr.race_id}`, `rider:${rr.rider_id}`, 'competed_in');
        addEdge(`team:${rr.team_id}`, `rider:${rr.rider_id}`, 'member_of');
    });

    return graph;
}

/**
 * Service to fetch and build graph
 */
export const GraphBuilderService = {
    async fetchAndBuild(db: any): Promise<SportsGraph> {
        // Cache could be implemented here using a TTL check
        
        // Parallel data fetch
        const [seasons, rounds, races, teams, riders, riderResults, teamResults] = await Promise.all([
            db.prepare("SELECT * FROM seasons").all().then(r => r.results),
            db.prepare("SELECT * FROM rounds").all().then(r => r.results),
            db.prepare("SELECT * FROM races").all().then(r => r.results),
            db.prepare("SELECT * FROM teams").all().then(r => r.results),
            db.prepare("SELECT * FROM riders").all().then(r => r.results),
            db.prepare("SELECT * FROM rider_race_results").all().then(r => r.results),
            db.prepare("SELECT * FROM team_race_results").all().then(r => r.results)
        ]);

        return transformToGraph({ seasons, rounds, races, teams, riders, riderResults, teamResults });
    }
};
