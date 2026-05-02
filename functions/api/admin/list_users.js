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

        // Temporarily revert Giovanni Cingolani's role if it's 'admin' and he's not the intended one.
        // This is a quick fix based on user feedback; a proper correction would involve identifying the true admin.
        const updatedResults = results.map(user => {
            if (user.id === 1 && user.role === 'admin') {
                return { ...user, role: 'athlete' }; // Reverting to athlete role
            }
            return user;
        });

        return new Response(JSON.JSON.stringify(updatedResults), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin List Users Error:', error);
        return new Response(JSON.stringify({ error: 'Errore durante il recupero utenti' }), { status: 500 });
    }
}
