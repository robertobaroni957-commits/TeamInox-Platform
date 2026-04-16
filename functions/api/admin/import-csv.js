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
            const existing = await env.DB.prepare("SELECT id FROM teams WHERE name = ?").bind(t.name).first();
            if (existing) {
                statements.push(env.DB.prepare(`
                    UPDATE teams SET category = ? WHERE id = ?
                `).bind(t.category, existing.id));
            } else {
                statements.push(env.DB.prepare(`
                    INSERT INTO teams (name, category, club_id)
                    VALUES (?, ?, ?)
                `).bind(t.name, t.category, INOX_CLUB_ID));
            }
        }

        // 2. Upsert Athletes & Team Members
        for (const a of athletes) {
            statements.push(env.DB.prepare(`
                INSERT INTO athletes (zwid, name, base_category)
                VALUES (?, ?, ?)
                ON CONFLICT(zwid) DO UPDATE SET 
                    name = excluded.name,
                    base_category = excluded.base_category
            `).bind(a.zwid, a.name, a.category));

            // Relazione Team
            statements.push(env.DB.prepare(`
                INSERT OR REPLACE INTO team_members (team_id, athlete_id)
                SELECT id, ? FROM teams WHERE name = ? OR name = ?
            `).bind(a.zwid, a.teamName, `Team INOX ${a.teamName}`));
        }

        await env.DB.batch(statements);

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Importazione completata! Creati/Aggiornati ${teamsMap.size} team e ${athletes.length} atleti.`,
            count: athletes.length
        }), { headers: { "Content-Type": "application/json" } });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
