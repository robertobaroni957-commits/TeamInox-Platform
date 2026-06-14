/**
 * SeasonEngine Service
 * Deterministic aggregation of metrics across an entire season.
 */

export interface SeasonMetrics {
    evolution_curve: Array<{ round_id: number; avg_points: number }>;
    team_progression: Record<string, number[]>; // Points per round
    rider_development: Record<string, number[]>; // Position per round
    milestone_events: string[];
    season_story_metrics: {
        total_races: number;
        total_riders: number;
        top_team: string;
    };
}

export const SeasonEngine = {
    analyze(season: any, rounds: any[], races: any[], riderResults: any[], teamResults: any[]): SeasonMetrics {
        
        // 1. Team Progression (Cumulative Points per Round)
        const teamProgression: Record<string, number[]> = {};
        teamResults.forEach(tr => {
            const roundId = races.find(r => r.id === tr.race_id)?.round_id;
            if (!teamProgression[tr.team_name]) teamProgression[tr.team_name] = new Array(rounds.length).fill(0);
            const roundIndex = rounds.findIndex(r => r.id === roundId);
            if (roundIndex !== -1) teamProgression[tr.team_name][roundIndex] += tr.points;
        });

        // 2. Rider Development (Positions per Round)
        const riderDevelopment: Record<string, number[]> = {};
        riderResults.forEach(rr => {
            const roundId = races.find(r => r.id === rr.race_id)?.round_id;
            if (!riderDevelopment[rr.rider_name]) riderDevelopment[rr.rider_name] = new Array(rounds.length).fill(null);
            const roundIndex = rounds.findIndex(r => r.id === roundId);
            if (roundIndex !== -1) riderDevelopment[rr.rider_name][roundIndex] = rr.position;
        });

        // 3. Evolution Curve (Global Avg Points per Round)
        const evolutionCurve = rounds.map((round, index) => {
            const roundTeams = teamResults.filter(tr => races.find(r => r.id === tr.race_id)?.round_id === round.id);
            const avg = roundTeams.reduce((a, b) => a + b.points, 0) / (roundTeams.length || 1);
            return { round_id: round.id, avg_points: avg };
        });

        return {
            evolution_curve: evolutionCurve,
            team_progression: teamProgression,
            rider_development: riderDevelopment,
            milestone_events: [
                `Season start with ${rounds.length} rounds`,
                `Total participation across ${races.length} races`
            ],
            season_story_metrics: {
                total_races: races.length,
                total_riders: new Set(riderResults.map(r => r.rider_id)).size,
                top_team: Object.keys(teamProgression).length > 0 
                    ? Object.keys(teamProgression).reduce((a, b) => 
                        (teamProgression[a].reduce((x, y) => x + y, 0) > teamProgression[b].reduce((x, y) => x + y, 0) ? a : b)
                    )
                    : "N/A"
            }
        };
    }
};
