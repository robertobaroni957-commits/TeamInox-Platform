// functions/api/admin/import-csv.js
export async function onRequestPost({ request, env }) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file) return new Response(JSON.stringify({ error: "File mancante" }), { status: 400 });

        const text = await file.text();
        const lines = text.split('\n');
        const INOX_CLUB_ID = "cef70cde-9149-43a2-b3ae-187643a44703";

        // Mappa per raccogliere i team dal CSV
        const teamsMap = new Map();
        const athletes = [];

        // Parsing CSV (saltiamo l'intestazione)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Split semplice (assumendo virgola) - Logica migliorata per gestire eventuali virgolette
            const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (cols.length < 6) continue;

            const name = cols[0].replace(/"/g, '').trim();
            const category = cols[1].trim();
            const teamName = cols[3].replace(/"/g, '').trim();
            const zwid = parseInt(cols[5]);

            if (!zwid || !teamName) continue;

            // Se il team non è ancora nella mappa, aggiungiamolo
            if (!teamsMap.has(teamName)) {
                teamsMap.set(teamName, {
                    name: teamName.startsWith("Team INOX") ? teamName : `Team INOX ${teamName}`,
                    category: category
                });
            }

            athletes.push({
                zwid,
                name,
                category,
                teamName
            });
        }

        const statements = [];

        // 1. Upsert Teams
        for (const [key, t] of teamsMap) {
            // Poiché 'name' non è UNIQUE nello schema, usiamo un approccio diverso o aggiorniamo se esiste
            const existingTeam = await env.ZRL_DB.prepare("SELECT wtrl_team_id FROM teams WHERE name = ?").bind(teamName).first();
            const teamWtrlId = existingTeam ? existingTeam.wtrl_team_id : null;

            if (teamWtrlId) {
                // Aggiorna il team esistente (se necessario)
                statements.push(env.ZRL_DB.prepare(`
                    UPDATE teams SET category = ?, club_id = ?
                    WHERE wtrl_team_id = ?
                `).bind(a.category, INOX_CLUB_ID, teamWtrlId));
            } else {
                // Crea un nuovo team se non esiste (dovrebbe essere gestito dall'import-wtrl-team, ma per sicurezza)
                // Questo caso è meno probabile se si usa prima il CSV per popolare i team
                // Potrebbe essere necessario un approccio diverso per creare nuovi team tramite CSV
                console.warn(`Team ${teamName} non trovato con wtrl_team_id. Inserimento come nuovo team.`);
                statements.push(env.ZRL_DB.prepare(`
                    INSERT INTO teams (name, category, club_id, wtrl_team_id)
                    VALUES (?, ?, ?, ?)
                `).bind(teamName, a.category, INOX_CLUB_ID, null)); // wtrl_team_id è null qui, gestione da rivedere
            }

            // Relazione Team
            statements.push(env.ZRL_DB.prepare(`
                INSERT OR IGNORE INTO team_members (team_id, athlete_id)
                SELECT t.wtrl_team_id, ? FROM teams t WHERE t.name = ?
            `).bind(a.zwid, teamName));
            }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Importazione completata! Creati/Aggiornati ${teamsMap.size} team e ${athletes.length} atleti.`,
            count: athletes.length
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

