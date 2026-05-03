
export async function onRequestPost({ request, env }) {
    const errorRes = (msg, status = 500) => new Response(
        JSON.stringify({ success: false, error: msg }), 
        { status, headers: { "Content-Type": "application/json" } }
    );

    try {
        if (!env.DB) return errorRes("Database non trovato", 500);

        const body = await request.json();
        const season = body.season_id || 19;

        console.log(`Avvio sincronizzazione leghe per la stagione ${season}...`);

        // 1. Recupero lista team da WTRL
        const wtrlRes = await fetch(`https://www.wtrl.racing/api/wtrlruby/?wtrlid=zrl&season=${season}&action=teamlist`);
        if (!wtrlRes.ok) return errorRes("Errore nella risposta da WTRL", 502);
        
        const data = await wtrlRes.json();
        const wtrlTeams = data.payload || [];

        // 2. Filtriamo solo i team INOX
        const inoxWtrlTeams = wtrlTeams.filter(t => 
            t.teamname.toUpperCase().includes("INOX") || 
            t.clubId === "cef70cde-9149-43a2-b3ae-187643a44703"
        );

        if (inoxWtrlTeams.length === 0) {
            return errorRes(`Nessun team INOX trovato su WTRL per la stagione ${season}`, 404);
        }

        const updates = [];
        let updatedCount = 0;

        // 3. Prepariamo le query di aggiornamento
        // Cerchiamo di matchare per wtrl_team_id (se presente) o per nome
        for (const wt of inoxWtrlTeams) {
            const league = wt.league;
            const category = wt.division || 'A';
            const divNum = wt.divnum || 0;
            const wtrlId = wt.id; // ID del team su WTRL

            updates.push(env.DB.prepare(`
                UPDATE teams 
                SET league = ?, category = ?, division_number = ?, wtrl_team_id = ?
                WHERE wtrl_team_id = ? OR (name = ? AND (wtrl_team_id IS NULL OR wtrl_team_id = ''))
            `).bind(league, category, divNum, wtrlId, wtrlId, wt.teamname));
            
            updatedCount++;
        }

        // 4. Esecuzione batch
        if (updates.length > 0) {
            await env.DB.batch(updates);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Sincronizzazione completata. Aggiornati ${updatedCount} team.`,
            found: inoxWtrlTeams.length
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return errorRes(`Errore critico: ${err.message}`, 500);
    }
}
