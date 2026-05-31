
export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const round_id = url.searchParams.get("round_id");
    const league_key = url.searchParams.get("league_key");
    const mode = url.searchParams.get("mode") || 'gc'; // 'gc' or 'race'

    try {
        if (!env.ZRL_DB) return new Response("Database error", { status: 500 });

        // 1. Fetch available Filters (Rounds and Leagues)
        if (!round_id || !league_key) {
            // Available Rounds (only those that have standings or results)
            const { results: rounds } = await env.ZRL_DB.prepare(`
                SELECT DISTINCT r.id, r.name, r.date, rg.id as round_group_id, rg.description as round_group_name
                FROM zrl_races r
                JOIN zrl_round_groups rg ON r.zrl_round_group_id = rg.id
                LEFT JOIN division_results dr ON r.id = dr.round_id
                LEFT JOIN zrl_team_standings ts ON rg.id = ts.round_group_id
                WHERE dr.id IS NOT NULL OR ts.id IS NOT NULL
                ORDER BY r.date DESC
            `).all();

            // Available Leagues for the first round or general
            const { results: leagues } = await env.ZRL_DB.prepare(`
                SELECT 
                    league_key, 
                    GROUP_CONCAT(DISTINCT league_display_name) as league_display_name,
                    GROUP_CONCAT(DISTINCT inox_team_name) as inox_team_name
                FROM (
                    SELECT league_key, league_name as league_display_name, team_name as inox_team_name 
                    FROM zrl_team_standings WHERE is_inox = 1
                    UNION
                    SELECT league_key, NULL as league_display_name, team_name as inox_team_name 
                    FROM division_results WHERE is_inox = 1
                    UNION
                    SELECT DISTINCT league_key, league_name as league_display_name, NULL as inox_team_name
                    FROM zrl_team_standings
                    UNION
                    SELECT DISTINCT league_key, NULL as league_display_name, NULL as inox_team_name
                    FROM division_results
                )
                WHERE league_key IS NOT NULL
                GROUP BY league_key
            `).all();
            
            return new Response(JSON.stringify({ success: true, rounds, leagues }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        if (mode === 'race') {
            // 2. Fetch aggregated Team Results for a specific Race
            // We prioritize official_position for sorting as requested by the user.
            const { results } = await env.ZRL_DB.prepare(`
                SELECT 
                    team_name,
                    league_key,
                    MAX(time) as team_time,
                    MAX(points_finish) as pts_finish,
                    MAX(points_fal) as pts_fal,
                    MAX(points_fts) as pts_fts,
                    MAX(points_total) as total_race_points,
                    is_inox,
                    COUNT(rider_name) as rider_count,
                    MAX(CASE WHEN rider_name IS NULL THEN position ELSE NULL END) as official_position
                FROM division_results
                WHERE round_id = ? AND league_key = ?
                GROUP BY team_name
                ORDER BY 
                    CASE WHEN MAX(CASE WHEN rider_name IS NULL THEN position ELSE NULL END) IS NOT NULL 
                         THEN MAX(CASE WHEN rider_name IS NULL THEN position ELSE NULL END) 
                         ELSE 999 END ASC,
                    MAX(points_total) DESC,
                    CASE WHEN MAX(time) > 0 THEN MAX(time) ELSE 999999 END ASC
            `).bind(round_id, league_key).all();

            // Refined ranking logic for the UI:
            let currentRank = 1;
            const rankedResults = results.map((r, i) => {
                if (i > 0) {
                    const prev = results[i-1];
                    // If the primary sort values are different, increment the fallback rank
                    if (r.official_position !== prev.official_position || 
                        r.total_race_points !== prev.total_race_points || 
                        Math.abs((r.team_time || 0) - (prev.team_time || 0)) > 0.1) {
                        currentRank = i + 1;
                    }
                }
                // Use official position as the primary rank, fallback to our calculated rank
                return { ...r, rank: r.official_position || currentRank };
            });

            return new Response(JSON.stringify({ success: true, results: rankedResults }), {
                headers: { "Content-Type": "application/json" }
            });
        } else {
            // 3. Fetch GC Standings
            // Need round_group_id for GC
            const race = await env.ZRL_DB.prepare("SELECT zrl_round_group_id FROM zrl_races WHERE id = ?").bind(round_id).first();
            const roundGroupId = race?.zrl_round_group_id || 1;

            const { results } = await env.ZRL_DB.prepare(`
                SELECT * FROM zrl_team_standings 
                WHERE round_group_id = ? AND league_key = ?
                ORDER BY rank ASC
            `).bind(roundGroupId, league_key).all();

            return new Response(JSON.stringify({ success: true, results }), {
                headers: { "Content-Type": "application/json" }
            });
        }

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

