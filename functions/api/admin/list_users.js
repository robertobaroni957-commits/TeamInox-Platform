// functions/api/admin/list_users.js
export async function onRequestGet({ env, data }) {
    // Il middleware ha già verificato il ruolo 'admin'
    if (!env.DB) {
        return new Response(JSON.stringify({ error: 'Database binding missing' }), { status: 500 });
    }

    try {
        const { results } = await env.DB.prepare(
            "SELECT zwid as id, name as username, email, role, base_category, gender, created_at FROM athletes ORDER BY created_at DESC"
        ).all();

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
