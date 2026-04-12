// functions/api/admin/import-wtrl-html.js
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "https://www.wtrl.racing",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",
        },
    });
}

export async function onRequestPost({ request, env }) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "https://www.wtrl.racing",
        "Content-Type": "application/json"
    };

    try {
        const { html } = await request.json();
        if (!html) return new Response(JSON.stringify({ error: "HTML mancante" }), { status: 400, headers: corsHeaders });

        const INOX_CLUB_ID = "cef70cde-9149-43a2-b3ae-187643a44703";
        
        // Regex migliorata per estrarre TRC, Nome e RacePass
        const teamRegex = /id="trc(\d+)"[\s\S]*?<span class="z-title">([^<]+)<\/span>[\s\S]*?copyRacePass\('([^']+)'\)/g;
        
        let match;
        const foundTeams = [];

        while ((match = teamRegex.exec(html)) !== null) {
            foundTeams.push({
                wtrl_id: parseInt(match[1]),
                name: match[2].trim(),
                race_pass: match[3]
            });
        }

        if (foundTeams.length === 0) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Nessun team trovato. Assicurati di essere nella pagina 'My Teams' di WTRL." 
            }), { status: 400, headers: corsHeaders });
        }

        // Batch SQL per aggiornare o inserire i team
        const statements = foundTeams.map(t => {
            return env.DB.prepare(`
                INSERT INTO teams (name, wtrl_team_id, club_id, race_pass_url, category)
                VALUES (?, ?, ?, ?, 'TBD')
                ON CONFLICT(wtrl_team_id) DO UPDATE SET
                    name = excluded.name,
                    race_pass_url = excluded.race_pass_url
            `).bind(t.name, t.wtrl_id, INOX_CLUB_ID, t.race_pass);
        });

        await env.DB.batch(statements);

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Sincronizzazione completata! ${foundTeams.length} team aggiornati con RacePass.`,
            count: foundTeams.length
        }), { headers: corsHeaders });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
}
