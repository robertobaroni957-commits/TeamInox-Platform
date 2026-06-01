// functions/api/admin/list_users.js
export async function onRequestGet({ env, data }) {
    // Il middleware ha già verificato il ruolo 'admin'
    if (!env.ZRL_DB) {
        return new Response(JSON.stringify({ error: 'Database binding missing' }), { status: 500 });
    }

    try {
        const { results } = await env.ZRL_DB.prepare(`
            SELECT 
                a.zwid as id, 
                a.name as username, 
                a.email, 
                a.role, 
                a.base_category, 
                a.gender, 
                a.created_at,
                a.avatar_url,
                (SELECT GROUP_CONCAT(t.name) FROM team_members tm JOIN teams t ON tm.team_id = t.wtrl_team_id WHERE tm.athlete_id = a.zwid) as zrl_teams
            FROM athletes a 
            ORDER BY a.name ASC
        `).all();

        return new Response(JSON.stringify(results), { 
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
            }
        });

    } catch (error) {
        console.error('Admin List Users Error:', error);
        return new Response(JSON.stringify({ error: 'Errore durante il recupero utenti' }), { status: 500 });
    }
}

