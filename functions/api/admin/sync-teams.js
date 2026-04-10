// functions/api/admin/sync-teams.js
export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { teams } = body;

        if (!env.DB) return new Response(JSON.stringify({ error: "DB binding missing" }), { status: 500 });
        if (!teams || !Array.isArray(teams)) return new Response(JSON.stringify({ error: "Nessun team fornito" }), { status: 400 });

        // Svuotiamo e ripopoliamo i team con i dati ricevuti
        await env.DB.prepare("DELETE FROM teams").run();

        const INOX_CLUB_ID = "cef70cde-9149-43a2-b3ae-187643a44703";

        const statements = teams.map(t => {
            return env.DB.prepare(`
                INSERT INTO teams (name, category, division, wtrl_team_id, club_id)
                VALUES (?, ?, ?, ?, ?)
            `).bind(
                t.teamname || t.name, 
                t.division || "N/A", 
                t.zrldivision || "N/A", 
                parseInt(t.id || t.wtrl_team_id), 
                INOX_CLUB_ID
            );
        });

        // Eseguiamo il batch degli inserimenti
        if (statements.length > 0) {
            await env.DB.batch(statements);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Sincronizzati con successo ${teams.length} team INOX nel database.`,
            count: teams.length 
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Errore DB: " + err.message }), { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
        });
    }
}
