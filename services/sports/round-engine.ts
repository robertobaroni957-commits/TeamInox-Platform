/**
 * RoundEngine Service
 * Deterministic aggregation of metrics across all races within a round.
 */

export interface RoundMetrics {
    team_rankings: Array<{ team_name: string; total_points: number }>;
    performance_trends: Array<{ race_name: string; avg_position: number }>;
    standout_races: string[];
    consistency_index: number;
    points_distribution: Record<string, number>;
}

/**
 * Aggregates points per team across all races in the round.
 */
export function aggregateTeamRankings(teamResults: any[]): Array<{ team_name: string; total_points: number }> {
    const map = teamResults.reduce((acc, r) => {
        acc[r.team_name] = (acc[r.team_name] || 0) + (r.points || 0);
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(map)
        .map(([team_name, total_points]) => ({ team_name, total_points }))
        .sort((a, b) => b.total_points - a.total_points);
}

/**
 * Calculates average positions per race to show trend.
 */
export function calculateTrends(races: any[], riderResults: any[]): Array<{ race_name: string; avg_position: number }> {
    return races.map(race => {
        const raceRiders = riderResults.filter(r => r.race_id === race.id);
        const avg = raceRiders.reduce((a, b) => a + b.position, 0) / raceRiders.length;
        return { race_name: race.name, avg_position: avg };
    });
}

export const RoundEngine = {
    analyze(round: any, races: any[], riderResults: any[], teamResults: any[]): RoundMetrics {
        const teamRankings = aggregateTeamRankings(teamResults);
        
        return {
            team_rankings: teamRankings,
            performance_trends: calculateTrends(races, riderResults),
            standout_races: races
                .filter(r => teamResults.filter(tr => tr.race_id === r.id && tr.position === 1).length > 0)
                .map(r => r.name),
            consistency_index: teamRankings.length > 0 ? 100 / (Math.max(...teamRankings.map(t => t.total_points)) + 1) : 0,
            points_distribution: teamRankings.reduce((acc, t) => {
                acc[t.team_name] = t.total_points;
                return acc;
            }, {} as Record<string, number>)
        };
    }
};
