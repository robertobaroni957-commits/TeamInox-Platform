
export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const round_group_id = url.searchParams.get("round_group_id");
    const league_key = url.searchParams.get("league_key");

    try {
        if (!env.DB) return new Response("DB connection lost", { status: 500 });

        if (!round_group_id || !league_key) {
            return new Response(JSON.stringify({ error: "Parametri mancanti: round_group_id e league_key necessari." }), { status: 400 });
        }

        // 1. Recupero dati Squadre per Radar Chart
        const { results: teamData } = await env.DB.prepare(`
            SELECT * FROM zrl_team_standings 
            WHERE round_group_id = ? AND league_key = ?
            ORDER BY rank ASC
        `).bind(round_group_id, league_key).all();

        if (!teamData || teamData.length === 0) {
            return new Response(JSON.stringify({ success: true, analytics: [] }), { headers: { "Content-Type": "application/json" } });
        }

        // 2. Calcolo Medie della Divisione per Normalizzazione
        const avgFAL = teamData.reduce((acc, t) => acc + (t.pts_fal || 0), 0) / teamData.length;
        const avgFTS = teamData.reduce((acc, t) => acc + (t.pts_fts || 0), 0) / teamData.length;
        const avgFinish = teamData.reduce((acc, t) => acc + (t.pts_finish || 0), 0) / teamData.length;
        const maxLP = Math.max(...teamData.map(t => t.league_points || 1));

        const analytics = teamData.map(team => {
            // Calcolo Consistenza (Deviazione dai punti medi per gara)
            const races = [team.r1, team.r2, team.r3, team.r4, team.r5, team.r6]
                .map(r => parseInt(r))
                .filter(r => !isNaN(r) && r > 0);
            
            let consistency = 0;
            if (races.length > 1) {
                const avg = races.reduce((a, b) => a + b, 0) / races.length;
                const variance = races.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / races.length;
                // Più bassa la varianza, più alta la consistenza (scala 0-100)
                consistency = Math.max(0, 100 - Math.sqrt(variance) * 10);
            } else if (races.length === 1) {
                consistency = 50;
            }

            // Normalizzazione indici (0-100) rispetto alla media divisione
            const dna = [
                { subject: 'Sprint Killers (FTS)', A: Math.min(100, ((team.pts_fts || 0) / (avgFTS || 1)) * 50) },
                { subject: 'Attackers (FAL)', A: Math.min(100, ((team.pts_fal || 0) / (avgFAL || 1)) * 50) },
                { subject: 'Finish Masters', A: Math.min(100, ((team.pts_finish || 0) / (avgFinish || 1)) * 50) },
                { subject: 'Consistency', A: consistency },
                { subject: 'Raw Power', A: Math.min(100, ((team.league_points || 0) / maxLP) * 100) }
            ];

            // Identificazione Archetipo
            let archetype = "All-Rounder";
            const topMetric = dna.reduce((prev, current) => (prev.A > current.A) ? prev : current);
            if (topMetric.A > 70) {
                if (topMetric.subject.includes('FTS')) archetype = "Pure Sprinters";
                else if (topMetric.subject.includes('FAL')) archetype = "Aggressive Attackers";
                else if (topMetric.subject.includes('Finish')) archetype = "Tactical Finishers";
                else if (topMetric.subject.includes('Consistency')) archetype = "Steady Machines";
            }

            return {
                team_name: team.team_name,
                rank: team.rank,
                is_inox: team.is_inox,
                archetype,
                dna,
                stats: {
                    total_lp: team.league_points,
                    total_trp: team.total_race_points,
                    races_completed: races.length
                }
            };
        });

        // 3. Recupero MVP (Top 3 Rider Inox nella divisione per punti totali)
        const { results: mvps } = await env.DB.prepare(`
            SELECT rider_name, team_name, points_total, position
            FROM division_results
            WHERE round_id IN (SELECT id FROM zrl_races WHERE zrl_round_group_id = ?)
            AND league_key = ?
            AND is_inox = 1
            ORDER BY points_total DESC
            LIMIT 5
        `).bind(round_group_id, league_key).all();

        return new Response(JSON.stringify({ 
            success: true, 
            analytics,
            mvps
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
