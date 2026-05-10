export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const league_key = url.searchParams.get("league_key");

    try {
        if (!env.DB) return new Response("DB connection lost", { status: 500 });

        // 1. Fetch ALL results for this league to calculate correct positions per round
        const { results: allResults } = await env.DB.prepare(`
            SELECT team_name, round_id, points_total, is_inox
            FROM division_results 
            WHERE league_key = ?
        `).bind(league_key).all();

        // 2. Fetch round mapping to know which ID is Round 1, 2, 3, etc.
        const { results: rounds } = await env.DB.prepare("SELECT id, name FROM rounds").all();
        const roundIdMap = {};
        rounds.forEach(r => {
            const idx = parseInt(r.name.replace(/[^0-9]/g, '')) || 0;
            roundIdMap[r.id] = idx;
        });

        // 3. Group and Rank by Round
        const roundRankings = {}; // { 1: [{team, pts}, ...], 2: ... }
        allResults.forEach(res => {
            const rIdx = roundIdMap[res.round_id];
            if (!rIdx) return;
            if (!roundRankings[rIdx]) roundRankings[rIdx] = [];
            
            // Aggreghiamo i punti se ci sono più entry per squadra nello stesso round
            let teamEntry = roundRankings[rIdx].find(e => e.name === res.team_name);
            if (!teamEntry) {
                teamEntry = { name: res.team_name, pts: 0, is_inox: res.is_inox };
                roundRankings[rIdx].push(teamEntry);
            }
            teamEntry.pts += res.points_total || 0;
        });

        // Ordiniamo ogni round per assegnare la posizione
        Object.keys(roundRankings).forEach(rIdx => {
            roundRankings[rIdx].sort((a, b) => b.pts - a.pts);
            roundRankings[rIdx].forEach((item, pos) => {
                item.rank = pos + 1;
            });
        });

        // 4. Extract only Inox Teams with their round-by-round history
        const inoxTeamsMap = {};
        allResults.filter(r => r.is_inox === 1).forEach(r => {
            if (!inoxTeamsMap[r.team_name]) {
                inoxTeamsMap[r.team_name] = { team_name: r.team_name, rounds: {} };
            }
        });

        const finalData = Object.keys(inoxTeamsMap).map(tName => {
            const roundsData = {};
            [1, 2, 3, 4, 5, 6].forEach(rIdx => {
                const roundInfo = roundRankings[rIdx]?.find(e => e.name === tName);
                if (roundInfo) {
                    roundsData[rIdx] = {
                        rank: roundInfo.rank,
                        pts: roundInfo.pts
                    };
                }
            });
            return {
                team_name: tName,
                history: roundsData
            };
        });

        return new Response(JSON.stringify({ 
            success: true, 
            league_key,
            inox_performance: finalData
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
