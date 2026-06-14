import { transformToGraph } from './graph-builder';

describe('GraphBuilder - transformToGraph', () => {
    it('should correctly transform relational data into a graph', () => {
        const mockData = {
            seasons: [{ id: 1, name: 'S1' }],
            rounds: [{ id: 10, season_id: 1, name: 'R1' }],
            races: [{ id: 100, round_id: 10, name: 'TTT' }],
            teams: [{ id: 50, name: 'Team A' }],
            riders: [{ id: 200, name: 'Rider 1' }],
            riderResults: [{ race_id: 100, rider_id: 200, team_id: 50 }],
            teamResults: [{ race_id: 100, team_id: 50 }]
        };

        const graph = transformToGraph(mockData);

        expect(graph.nodes['season:1']).toBeDefined();
        expect(graph.nodes['round:10']).toBeDefined();
        expect(graph.edges).toContainEqual({ source: 'season:1', target: 'round:10', type: 'contains' });
        expect(graph.edges).toContainEqual({ source: 'race:100', target: 'team:50', type: 'competed_in' });
    });
});
