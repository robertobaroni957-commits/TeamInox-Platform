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
        
        // 1. Estrazione Team (Regex per i blocchi panel-group)
        const teamBlockRegex = /id="trc(\d+)"[\s\S]*?<span class="z-title">([^<]+)<\/span>[\s\S]*?copyRacePass\('([^']+)'\)[\s\S]*?<div class="panel-collapse collapse"[\s\S]*?<\/div><\/div>/g;
        
        let teamMatch;
        const foundTeams = [];

        while ((teamMatch = teamBlockRegex.exec(html)) !== null) {
            const teamId = parseInt(teamMatch[1]);
            const teamName = teamMatch[2].trim();
            const racePass = teamMatch[3];
            const teamContent = teamMatch[0]; // Tutto il blocco del team

            // Estrazione Rider all'interno di questo team
            // Cerchiamo pattern: data-zwid="(\d+)"
            const riderRegex = /data-zwid="(\d+)"[\s\S]*?<span class="zrl-rider-name">([^<]+)<\/span>[\s\S]*?zrl-cat-([ABCD])/g;
            let riderMatch;
            const riders = [];
            while ((riderMatch = riderRegex.exec(teamContent)) !== null) {
                riders.push({
                    zwid: parseInt(riderMatch[1]),
                    name: riderMatch[2].trim(),
                    category: riderMatch[3]
                });
            }

            foundTeams.push({
                wtrl_id: teamId,
                name: teamName,
                race_pass: racePass,
                riders: riders,
                // Determiniamo categoria team dal nome o dai riders se possibile
                category: teamName.includes("ELITE") || teamName.includes("AAB") || teamName.includes("PRO") ? "A" :
                          teamName.includes("MADNESS") || teamName.includes("DEV") || teamName.includes("WARRIORS") ? "B" :
                          teamName.includes("LOL") || teamName.includes("TURTLES") ? "D" : "C"
            });
        }

        if (foundTeams.length === 0) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "Nessun team trovato. Assicurati di essere nella pagina 'My Teams' di WTRL." 
            }), { status: 400, headers: corsHeaders });
        }

        // 2. Esecuzione SQL in Batch
        const statements = [];
        
        for (const t of foundTeams) {
            // Upsert Team
            statements.push(env.DB.prepare(`
                INSERT INTO teams (name, wtrl_team_id, club_id, race_pass_url, category)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(wtrl_team_id) DO UPDATE SET
                    name = excluded.name,
                    race_pass_url = excluded.race_pass_url,
                    category = excluded.category
            `).bind(t.name, t.wtrl_id, INOX_CLUB_ID, t.race_pass, t.category));

            // Per ogni rider, salviamo l'atleta e la relazione
            for (const r of t.riders) {
                statements.push(env.DB.prepare(`
                    INSERT INTO athletes (zwid, name, base_category)
                    VALUES (?, ?, ?)
                    ON CONFLICT(zwid) DO UPDATE SET 
                        name = excluded.name,
                        base_category = excluded.base_category
                `).bind(r.zwid, r.name, r.category));

                // Relazione Many-to-Many (rimuoviamo vecchie se necessario o usiamo INSERT OR IGNORE)
                // Usiamo una sottoquery per ottenere l'ID interno del team appena inserito/aggiornato
                statements.push(env.DB.prepare(`
                    INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                    SELECT id, ? FROM teams WHERE wtrl_team_id = ?
                `).bind(r.zwid, t.wtrl_id));
            }
        }

        await env.DB.batch(statements);

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Sincronizzazione completata! ${foundTeams.length} team e relativi roster aggiornati.`,
            count: foundTeams.length
        }), { headers: corsHeaders });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
}
