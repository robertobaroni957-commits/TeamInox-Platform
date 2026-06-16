import { RaceAnalysisInput } from '../../types/raceNarrative';

/**
 * Builds a structured prompt for an LLM to generate race narrative insights.
 */
export function buildRacePrompt(input: RaceAnalysisInput): string {
  // 1. Domain Filter: Identify INOX teams (case-insensitive matching)
  const isInoxTeam = (teamName: string) => {
    return teamName.toLowerCase().includes('inox');
  };

  const inoxResults = input.results.filter(r => isInoxTeam(r.team_name || ''));

  // 2. Relative positioning calculation within INOX domain
  const sortedInoxResults = [...inoxResults].sort((a, b) => a.position - b.position);
  const inoxRiderDomainMappings = sortedInoxResults.map((r, idx) => ({
    absolute_position: r.position, // e.g. 5th overall in the whole race
    relative_position: idx + 1,    // e.g. 1st among INOX riders
    driver_name: r.driver_name,
    team_name: r.team_name || 'Unknown INOX Team',
    time_gap: r.time_gap,
    points: r.points
  }));

  // 3. Top 5 INOX individual performers
  const topInoxPerformers = inoxRiderDomainMappings.slice(0, 5);

  // 4. Team-level aggregates for INOX teams only
  const teamMap: Record<string, { total_points: number; rider_count: number; best_position: number; positions: number[] }> = {};
  inoxResults.forEach(r => {
    const tName = r.team_name || 'Unknown INOX Team';
    if (!teamMap[tName]) {
      teamMap[tName] = { total_points: 0, rider_count: 0, best_position: 999, positions: [] };
    }
    teamMap[tName].total_points += r.points;
    teamMap[tName].rider_count += 1;
    teamMap[tName].positions.push(r.position);
    if (r.position < teamMap[tName].best_position) {
      teamMap[tName].best_position = r.position;
    }
  });

  const inoxTeamSummaries = Object.entries(teamMap)
    .map(([name, data]) => ({
      team_name: name,
      total_points: data.total_points,
      rider_count: data.rider_count,
      best_absolute_position: data.best_position,
      avg_position: Math.round((data.positions.reduce((a, b) => a + b, 0) / data.positions.length) * 10) / 10
    }))
    .sort((a, b) => b.total_points - a.total_points);

  // 5. Outliers / Incidents (restricted to INOX)
  const inoxOutliers = inoxResults
    .filter(r => r.status !== 'finished' || r.points > 400 || (r.time_gap !== null && r.time_gap > 90))
    .map(r => `${r.driver_name} (${r.team_name}): Pos Assoluta ${r.position}, Punti ${r.points}, Stato ${r.status}, Gap ${r.time_gap ? r.time_gap + 's' : 'Leader'}`)
    .slice(0, 5);

  // 6. Global stats for grounding context (no raw records of non-INOX)
  const globalTeamMap = new Set(input.results.map(r => r.team_name || 'Unknown Team'));
  
  const aggregates = {
    inox_athletes_count: inoxResults.length,
    inox_teams_count: Object.keys(teamMap).length,
    inox_average_points: Math.round(inoxResults.reduce((acc, r) => acc + r.points, 0) / (inoxResults.length || 1)),
    global_race_total_athletes: input.results.length,
    global_race_total_teams: globalTeamMap.size,
    global_race_average_points: Math.round(input.results.reduce((acc, r) => acc + r.points, 0) / (input.results.length || 1)),
    total_incidents: input.events.filter(e => e.type === 'incident').length
  };

  const domainScopedContext = {
    metadata: input.metadata,
    context: input.context,
    top_inox_performers: topInoxPerformers,
    inox_team_summaries: inoxTeamSummaries,
    inox_outliers: inoxOutliers,
    events: [...input.events].sort((a, b) => a.timestamp - b.timestamp).slice(0, 5),
    aggregates
  };

  const prompt = `
You are an expert racing data analyst for the InoxTeam.
Your goal is to generate a professional, domain-scoped race narrative focused EXCLUSIVELY on InoxTeam (INOX) performance.

# INSTRUCTION
Analyze the input data and generate a JSON response strictly conforming to the RaceNarrativeOutput schema.
Only mention InoxTeam (INOX) teams, riders, and outcomes. DO NOT mention or invent non-INOX competitor teams in the highlights or insights unless strictly comparing overall aggregates.

# CONSTRAINTS & FORMATTING RULES
1. OUTPUT FORMAT RULE: Return ONLY valid JSON matching RaceNarrativeOutput schema. No commentary, markdown code blocks, or explanations outside the JSON structure.
2. title: Format must be "Race [Race Name] – Team Analysis: InoxTeam".
3. summary: Must be maximum 150 characters. Focus on InoxTeam overall outcome.
4. highlights: Include maximum 5 key moments based on events as an array of strings, focusing on InoxTeam riders.
5. insights: Include exactly 3 objects in the array, one for each category: 'performance', 'strategy', 'incidents' (focus on InoxTeam).
6. metadata: Must include 'grounded' (boolean) and 'model_version' (string).

# RACE ANALYSIS SCHEMA (RaceNarrativeOutput)
{
  "title": "string",
  "summary": "string",
  "highlights": ["string"],
  "insights": [
    { "category": "performance", "text": "string" },
    { "category": "strategy", "text": "string" },
    { "category": "incidents", "text": "string" }
  ],
  "metadata": { "grounded": boolean, "model_version": "string" }
}

# INPUT DATA (DOMAIN SCOPED)
${JSON.stringify(domainScopedContext, null, 2)}
`;

  return prompt.trim();
}
