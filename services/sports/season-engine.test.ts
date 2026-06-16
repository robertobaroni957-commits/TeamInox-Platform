import { SeasonEngine } from './season-engine';

describe('SeasonEngine', () => {
    it('should aggregate team progression correctly', () => {
        const rounds = [{ id: 1 }, { id: 2 }];
        const races = [{ id: 10, round_id: 1 }, { id: 20, round_id: 2 }];
        const teamResults = [
            { race_id: 10, team_name: 'A', points: 10 },
            { race_id: 20, team_name: 'A', points: 20 }
        ];
        
        const result = SeasonEngine.analyze({}, rounds, races, [], teamResults);
        
        expect(result.team_progression['A']).toEqual([10, 20]);
    });

    it('should calculate top team correctly', () => {
        const rounds = [{ id: 1 }];
        const races = [{ id: 10, round_id: 1 }];
        const teamResults = [
            { race_id: 10, team_name: 'A', points: 10 },
            { race_id: 10, team_name: 'B', points: 20 }
        ];
        
        const result = SeasonEngine.analyze({}, rounds, races, [], teamResults);
        
        expect(result.season_story_metrics.top_team).toBe('B');
    });
});
