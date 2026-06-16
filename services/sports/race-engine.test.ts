import { RaceEngine } from './race-engine';

describe('RaceEngine', () => {
    it('should calculate MVP correctly', () => {
        const results = [
            { rider_name: 'A', position: 5, points: 10 },
            { rider_name: 'B', position: 2, points: 20 },
            { rider_name: 'C', position: 8, points: 5 }
        ];
        expect(RaceEngine.calculateMVP(results)).toBe('B');
    });

    it('should compute consistency correctly', () => {
        const results = [
            { position: 2 },
            { position: 3 },
            { position: 2 }
        ];
        // Variance is low -> High consistency
        expect(RaceEngine.computeConsistency(results)).toBeGreaterThan(90);
    });
});
