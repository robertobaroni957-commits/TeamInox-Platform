/**
 * AI Data Engines - Phase 10.0
 * Pure logic for aggregating race and season data.
 * No AI calls, no Response objects, just pure D1 queries.
 */

/**
 * Aggregates all data for a single race focusing on a specific team.
 */
export async function getRaceContext(db, round_id, team_id) {
    // 1. Race Metadata (Try rounds_v2 + zrl_races first, then rounds)
    let race = await db.prepare(`
        SELECT 
            rv2.id, rv2.wtrl_id, rv2.name, rv2.starts_at as date,
            zr.world, zr.route, rv2.round_number
        FROM rounds_v2 rv2
        LEFT JOIN zrl_round_groups zrg ON rv2.wtrl_id = zrg.external_season_id
        LEFT JOIN zrl_races zr ON zrg.id = zr.zrl_round_group_id
        WHERE rv2.id = ? OR rv2.wtrl_id = ?
        LIMIT 1
    `).bind(round_id, round_id).first();

    if (!race || (!race.world && !race.route)) {
        race = await db.prepare(`
            SELECT id, name, date, world, route, format, distance, elevation, powerups, strategy_details
            FROM rounds WHERE id = ?
        `).bind(round_id).first();
    }
    
    // 2. Team Metadata
    const team = await db.prepare(`
        SELECT wtrl_team_id, name, category, division, league FROM teams WHERE wtrl_team_id = ?
    `).bind(team_id).first();

    if (!race || !team) throw new Error(`Race (${round_id}) or Team (${team_id}) not found in database`);

    const effectiveRoundId = race.wtrl_id || race.id;
    const roundNumber = race.round_number || null;

    // 3. Planned Lineup
    const { results: lineup } = await db.prepare(`
        SELECT a.zwid, a.name, rl.role FROM race_lineup rl 
        JOIN athletes a ON rl.athlete_id = a.zwid 
        WHERE (rl.round_id = ? OR rl.round_id = ? OR rl.round_id = ?) AND rl.team_id = ?
    `).bind(effectiveRoundId, race.id, roundNumber, team_id).all();

    // 4. Actual Rider Performance (Target Team Riders)
    const { results: riders } = await db.prepare(`
        SELECT dr.rider_name, dr.position, dr.points_finish, dr.points_fal, dr.points_fts, dr.points_total
        FROM division_results dr
        WHERE (dr.round_id = ? OR dr.round_id = ? OR dr.round_id = ?) AND dr.team_name = ? AND dr.rider_name IS NOT NULL
        ORDER BY dr.points_total DESC
    `).bind(effectiveRoundId, race.id, roundNumber, team.name).all();

    // 5. Team Summary
    const teamSummary = await db.prepare(`
        SELECT position, points_total FROM division_results dr
        WHERE (dr.round_id = ? OR dr.round_id = ? OR dr.round_id = ?) AND dr.team_name = ? AND dr.rider_name IS NULL
    `).bind(effectiveRoundId, race.id, roundNumber, team.name).first();

    // 6. Division Context (Competitors)
    const { results: topTeams } = await db.prepare(`
        SELECT team_name, points_total, position FROM division_results dr
        WHERE (dr.round_id = ? OR dr.round_id = ? OR dr.round_id = ?) AND dr.league_key = ? AND dr.rider_name IS NULL
        ORDER BY position ASC LIMIT 5
    `).bind(effectiveRoundId, race.id, roundNumber, team.league).all();

    const hasPerformance = riders && riders.length > 0;
    const hasSummary = teamSummary && teamSummary.position;

    return {
        scope: "race",
        status: hasPerformance ? "COMPLETE" : (hasSummary ? "PARTIAL" : "EMPTY"),
        race_info: race,
        target_team: team,
        roster: lineup,
        performance: riders,
        summary: teamSummary,
        competitors: topTeams
    };
}

/**
 * Aggregates data for an entire round across all teams.
 */
export async function getRoundContext(db, round_id) {
    let round = await db.prepare(`
        SELECT id, wtrl_id, name, starts_at as date, round_number FROM rounds_v2 
        WHERE id = ? OR wtrl_id = ?
    `).bind(round_id, round_id).first();

    if (!round) {
        round = await db.prepare(`SELECT id, name, date FROM rounds WHERE id = ?`).bind(round_id).first();
    }

    if (!round) throw new Error(`Round (${round_id}) not found`);

    const effectiveRoundId = round.wtrl_id || round.id;
    const roundNumber = round.round_number || null;

    // 1. All Team Results in this Round
    const { results: allStandings } = await db.prepare(`
        SELECT team_name, position, points_total, league_key FROM division_results 
        WHERE (round_id = ? OR round_id = ? OR round_id = ?) AND rider_name IS NULL
        ORDER BY position ASC
    `).bind(effectiveRoundId, round.id, roundNumber).all();

    // 2. Top Individual Performers in this Round (Overall)
    const { results: topPerformers } = await db.prepare(`
        SELECT rider_name, team_name, points_total, position FROM division_results 
        WHERE (round_id = ? OR round_id = ? OR round_id = ?) AND rider_name IS NOT NULL
        ORDER BY points_total DESC LIMIT 10
    `).bind(effectiveRoundId, round.id, roundNumber).all();

    // 3. Race Details (Worlds/Routes)
    const { results: races } = await db.prepare(`
        SELECT zr.name, zr.world, zr.route FROM zrl_races zr
        JOIN zrl_round_groups zrg ON zr.zrl_round_group_id = zrg.id
        WHERE zrg.external_season_id = ?
    `).bind(effectiveRoundId).all();

    const hasStandings = allStandings && allStandings.length > 0;

    return {
        scope: "round",
        status: hasStandings ? "COMPLETE" : "EMPTY",
        round_info: round,
        standings: allStandings,
        top_performers: topPerformers,
        races: races
    };
}

/**
 * Aggregates high-level seasonal data and trends.
 */
export async function getSeasonContext(db, season_code) {
    let season = await db.prepare(`
        SELECT name as code, name FROM zrl_seasons WHERE name = ? OR name LIKE ?
    `).bind(season_code, `%${season_code}%`).first();

    if (!season) {
        season = await db.prepare(`SELECT name as code, name FROM zrl_seasons WHERE is_active = 1 LIMIT 1`).first();
    }

    if (!season) {
        season = { code: season_code, name: season_code.replace(/_/g, ' ').toUpperCase() };
    }

    // 1. Overall Season Standings
    const { results: standings } = await db.prepare(`
        SELECT ts.team_name, ts.rank, ts.league_points, ts.r1, ts.r2, ts.r3, ts.r4, ts.league_key
        FROM zrl_team_standings ts
        JOIN zrl_round_groups rg ON ts.round_group_id = rg.id
        JOIN zrl_seasons zs ON rg.series_id = zs.id
        WHERE zs.name = ? OR zs.name LIKE ?
    `).bind(season.name, `%${season.name}%`).all();

    // 2. Momentum & Trends (Point totals per round up to R4)
    const { results: roundPerformance } = await db.prepare(`
        SELECT dr.team_name, dr.round_id, SUM(dr.points_total) as points
        FROM division_results dr
        JOIN rounds_v2 r ON dr.round_id = r.wtrl_id
        WHERE r.season_code = ? AND dr.rider_name IS NOT NULL AND r.round_number <= 4
        GROUP BY dr.team_name, dr.round_id
    `).bind(season_code).all();

    const hasStandings = standings && standings.length > 0;

    return {
        scope: "season",
        status: hasStandings ? "COMPLETE" : "EMPTY",
        season_info: season,
        standings: standings,
        round_by_round: roundPerformance
    };
}
