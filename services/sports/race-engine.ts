/**
 * RaceEngine Service
 * Deterministic computation of sports analytics metrics based on raw event data.
 */

export interface RaceMetrics {
    race_id?: number;
    mvp: string | null;
    top_performers: string[];
    key_moments: string[];
    performance_metrics: {
        avg_position: number;
        total_points: number;
    };
    consistency_score: number;
}

export function calculateMVP(riderResults: any[]): string | null {
    if (riderResults.length === 0) return null;
    const sorted = [...riderResults].sort((a, b) => a.position - b.position || b.points - a.points);
    return sorted[0].rider_name;
}

export function calculateKeyMoments(raceEvents: any[]): string[] {
    return raceEvents
        .filter(e => ['breakaway', 'attack', 'sprint_win'].includes(e.event_type))
        .map(e => `${e.event_type.toUpperCase()} at ${e.timestamp}`);
}

export function computeConsistency(riderResults: any[]): number {
    if (riderResults.length < 2) return 100;
    const positions = riderResults.map(r => r.position);
    const avg = positions.reduce((a, b) => a + b, 0) / positions.length;
    const variance = positions.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / positions.length;
    return Math.max(0, 100 - (variance * 10));
}

export const RaceEngine = {
    analyze(race: any, riderResults: any[], teamResults: any[], raceEvents: any[], roundId?: number): RaceMetrics {
        return {
            race_id: race.id || null,
            round_id: roundId || race.round_id || null, // Preserve round_id
            mvp: calculateMVP(riderResults),
            top_performers: riderResults.filter(r => r.position <= 3).map(r => r.rider_name),
            key_moments: calculateKeyMoments(raceEvents),
            performance_metrics: {
                avg_position: riderResults.length > 0 ? riderResults.reduce((a, b) => a + b.position, 0) / riderResults.length : 0,
                total_points: teamResults.reduce((a, b) => a + b.points, 0)
            },
            consistency_score: computeConsistency(riderResults)
        };
    }
};
