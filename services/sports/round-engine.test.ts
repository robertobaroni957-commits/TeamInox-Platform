import { RoundEngine } from './round-engine';

describe('RoundEngine', () => {
    it('should aggregate team rankings correctly', () => {
        const teamResults = [
            { team_name: 'Team A', points: 10 },
            { team_name: 'Team B', points: 20 },
            { team_name: 'Team A', points: 5 }
        ];
        const rankings = RoundEngine.analyze({}, [], [], teamResults).team_rankings;
        
        expect(rankings[0].team_name).toBe('Team B');
        expect(rankings[0].total_points).toBe(20);
        expect(rankings[1].total_points).toBe(15);
    });

    it('should identify standout races correctly', () => {
        const races = [{ id: 1, name: 'Race 1' }, { id: 2, name: 'Race 2' }];
        const teamResults = [
            { race_id: 1, team_name: 'A', position: 1 },
            { race_id: 2, team_name: 'B', position: 2 }
        ];
        const standout = RoundEngine.analyze({}, races, [], teamResults).standout_races;
        
        expect(standout).toContain('Race 1');
        expect(standout).not.toContain('Race 2');
    });
});
