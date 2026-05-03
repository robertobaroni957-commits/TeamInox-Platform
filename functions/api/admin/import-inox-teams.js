
export async function onRequestPost({ request, env }) {
    const errorRes = (msg, status = 500) => new Response(
        JSON.stringify({ success: false, error: msg }), 
        { status, headers: { "Content-Type": "application/json" } }
    );

    try {
        if (!env.DB) return errorRes("Database non trovato", 500);

        const body = await request.json();
        const teamsData = body.teams || [];

        if (!Array.isArray(teamsData) || teamsData.length === 0) {
            return errorRes("Dati team non validi o mancanti.", 400);
        }

        const updates = [];
        let updatedCount = 0;

        for (const entry of teamsData) {
            const meta = entry.meta;
            if (!meta || !meta.competition || !meta.competition.class) continue;

            const teamName = meta.team.name;
            const wtrlTeamId = meta.trc || meta.team.teamid;
            const leagueKey = meta.competition.class; // es: "2370C30"

            // Estraiamo i componenti dalla leagueKey (es: 237 0 C 3 0)
            // Pattern: {league(3)} + {0} + {category(1)} + {divnum(1)} + {0}
            // Gestiamo anche leghe a 2 o 4 cifre se presenti
            const match = leagueKey.match(/^(\d+)0([A-D])(\d+)0$/);
            
            if (match) {
                const league = match[1];
                const category = match[2];
                const divNum = parseInt(match[3]);

                updates.push(env.DB.prepare(`
                    UPDATE teams 
                    SET league = ?, category = ?, division_number = ?, wtrl_team_id = ?
                    WHERE name = ? OR wtrl_team_id = ?
                `).bind(league, category, divNum, wtrlTeamId, teamName, wtrlTeamId));
                
                updatedCount++;
            }
        }

        if (updates.length > 0) {
            await env.DB.batch(updates);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Aggiornamento completato. Elaborati ${updatedCount} team dal file JSON.`,
            count: updatedCount
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return errorRes(`Errore critico: ${err.message}`, 500);
    }
}
