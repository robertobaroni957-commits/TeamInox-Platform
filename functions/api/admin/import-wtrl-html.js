// functions/api/admin/import-wtrl-html.js
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}

export async function onRequestPost({ request, env }) {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    };

    try {
        const { html, teams: jsonData } = await request.json();
        const INOX_CLUB_ID = "cef70cde-9149-43a2-b3ae-187643a44703";
        const statements = [];
        let count = 0;

        // SE RICEVIAMO JSON (Metodo Avanzato tramite Console)
        if (jsonData && Array.isArray(jsonData)) {
            for (const t of jsonData) {
                statements.push(env.DB.prepare(`
                    INSERT INTO teams (name, wtrl_team_id, club_id, category, division, rounds, member_count)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(wtrl_team_id) DO UPDATE SET 
                        name = excluded.name, 
                        category = excluded.category,
                        division = excluded.division,
                        rounds = excluded.rounds,
                        member_count = excluded.member_count
                `).bind(
                    t.name, 
                    t.id, 
                    INOX_CLUB_ID, 
                    t.category || 'TBD',
                    t.division || '',
                    t.rounds || '',
                    t.riders?.length || 0
                ));

                if (t.riders && Array.isArray(t.riders)) {
                    for (const r of t.riders) {
                        statements.push(env.DB.prepare(`
                            INSERT INTO athletes (zwid, name, base_category, avatar_url)
                            VALUES (?, ?, ?, ?)
                            ON CONFLICT(zwid) DO UPDATE SET 
                                name = excluded.name, 
                                base_category = excluded.base_category,
                                avatar_url = excluded.avatar_url
                        `).bind(
                            r.zwid, 
                            r.name, 
                            r.category || '',
                            r.avatar || ''
                        ));

                        statements.push(env.DB.prepare(`
                            INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                            SELECT id, ? FROM teams WHERE wtrl_team_id = ?
                        `).bind(r.zwid, t.id));
                    }
                }
                count++;
            }
        } 
        // ALTRIMENTI SE RICEVIAMO HTML (Metodo Copia-Incolla)
        else if (html) {
            const teamBlockRegex = /id="trc(\d+)"[\s\S]*?<span class="z-title">([^<]+)<\/span>/g;
            let teamMatch;
            while ((teamMatch = teamBlockRegex.exec(html)) !== null) {
                const wtrlId = parseInt(teamMatch[1]);
                const teamName = teamMatch[2].trim();
                
                statements.push(env.DB.prepare(`
                    INSERT INTO teams (name, wtrl_team_id, club_id, category)
                    VALUES (?, ?, ?, 'TBD')
                    ON CONFLICT(wtrl_team_id) DO UPDATE SET name = excluded.name
                `).bind(teamName, wtrlId, INOX_CLUB_ID));
                count++;
            }
        }

        if (statements.length > 0) {
            await env.DB.batch(statements);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Sincronizzazione completata! Aggiornati ${count} team e relativi dati.`,
            count: count
        }), { headers: corsHeaders });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
}
