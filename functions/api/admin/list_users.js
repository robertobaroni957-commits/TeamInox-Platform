// functions/api/admin/list_users.js
import * as jose from 'jose';

export async function onRequestGet({ request, env }) {
    if (!env.DB || !env.JWT_SECRET) {
        return new Response(JSON.stringify({ message: 'Server configuration error.' }), { status: 500 });
    }

    try {
        // 1. Verifica Token e Ruolo Admin
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ message: 'Non autorizzato.' }), { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);

        if (payload.role !== 'admin') {
            return new Response(JSON.stringify({ message: 'Permessi insufficienti.' }), { status: 403 });
        }

        // 2. Recupera tutti gli utenti
        const { results } = await env.DB.prepare(
            "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC"
        ).all();

        return new Response(JSON.stringify(results), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin List Users Error:', error);
        return new Response(JSON.stringify({ message: 'Errore durante il recupero utenti.' }), { status: 500 });
    }
}
