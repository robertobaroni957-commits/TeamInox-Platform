import { RaceAnalysisInput } from '../../types/raceNarrative';

/**
 * Robust adapter to transform raw multi-league upload JSON into canonical RaceAnalysisInput.
 * Handles:
 * - Multi-league arrays
 * - Metadata from 'args'
 * - Results nested in team 'a' arrays
 */
export function buildRaceAnalysisInputFromUpload(rawJson: unknown): RaceAnalysisInput {
  console.log("[PARSER INPUT]", rawJson);
  const leagues = Array.isArray(rawJson) ? rawJson : [rawJson];
  
  // 1. Find a source for context/metadata extraction from 'args'
  // Find the first league that has both args and a non-empty payload
  const sourceLeague = leagues.find((x: any) => 
    x?.data?.args && 
    Array.isArray(x?.data?.payload) && 
    x.data.payload.length > 0
  );
  
  if (!sourceLeague) {
    throw new Error("[RaceAnalysisInput Builder] No valid league with data found in upload");
  }

  const args = sourceLeague.data.args;

  const metadata = {
    race_id: parseInt(args.race || '0', 10),
    race_name: `Race ${args.race || 'Unknown'}`,
    date: new Date().toISOString(),
    track_name: "Unknown Track",
    track_conditions: 'dry' as const
  };

  const context = {
    round_id: 0,
    round_name: "Unknown Round",
    season_code: args.season || "Unknown",
    team_id: 0,
    team_name: "Aggregated Teams"
  };

  // 2. Aggregate Results across all leagues (flattening teams and their riders)
  const allResults = leagues.flatMap(league => {
    console.log(`[DEBUG] Processing league key:`, league?.key);
    console.log(`[DEBUG] League structure:`, Object.keys(league || {}));
    
    const payload = league.data?.payload;
    console.log(`[DEBUG] Payload exists:`, !!payload, "IsArray:", Array.isArray(payload));
    
    if (!Array.isArray(payload)) return [];
    
    console.log(`[PARSER] League ${league.key} payload length: ${payload.length}`);
    
    return payload.flatMap((team: any, tIdx: number) => {
        if (!team.a || !Array.isArray(team.a)) {
            console.log(`[PARSER] Team ${tIdx} in league ${league.key} has no riders ('a' array)`);
            return [];
        }
        
        console.log(`[PARSER] Team ${tIdx} riders count: ${team.a.length}`);
        
        return team.a.map((rider: any) => ({
            driver_id: rider.zid || 0,
            driver_name: rider.name || 'Unknown',
            team_name: team.teamname || 'Unknown Team',
            position: rider.p1 || 0,
            time_gap: parseFloat(rider.gap) || null,
            status: 'finished' as const,
            points: rider.totrp || 0
        }));
    });
  });

  // 3. Validation Check
  if (!metadata.race_id || !Array.isArray(allResults) || allResults.length === 0) {
    throw new Error("[RaceAnalysisInput Builder] Invalid upload structure: missing required fields or no results found");
  }

  // 4. Aggregates Calculation (Derived)
  const total_incidents = 0; // Events not available in this JSON structure
  const team_position_trend: number[] = [];

  const output = {
    metadata,
    context,
    results: allResults,
    events: [],
    aggregates: {
      avg_power: 0,
      total_incidents,
      team_position_trend
    }
  };

  console.log("[PARSED RESULTS COUNT]", allResults.length);
  console.log("[PARSED OUTPUT]", output);

  return output;
}
