// functions/api/admin/users.js
import * as jose from 'jose';

const ALG = 'HS256';

// --- Helper: Verify Admin Token ---
async function verifyAdminToken(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Authorization header mancante o malformato.');
    }
    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    try {
        const { payload } = await jose.jwtVerify(token, secret, { algorithms: [ALG] });
        if (payload.role !== 'admin' && !payload.isAdmin) { // Check for both role and isAdmin for compatibility
            throw new Error('Accesso negato. Privilegi di amministratore richiesti.');
        }
        return payload;
    } catch (err) {
        throw new Error('Token non valido, scaduto o privilegi insufficienti.');
    }
}

// --- API Method Handlers ---

// GET /api/admin/users
async function handleGet(context) {
    const { env } = context;
    const { results } = await env.DB.prepare(
        "SELECT id, username, email, role, is_admin FROM users ORDER BY id ASC"
    ).all();

    return new Response(JSON.stringify(results), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

// PUT /api/admin/users
async function handlePut(context) {
    const { request, env } = context;
    const body = await request.json();
    const { userId, role, isAdmin } = body;

    if (!userId || (role === undefined && isAdmin === undefined)) {
        return new Response(JSON.stringify({ error: 'userId e un nuovo "role" o "isAdmin" sono richiesti.' }), { status: 400 });
    }
    
    let setClauses = [];
    const bindings = [];

    if (role !== undefined) {
        setClauses.push("role = ?");
        bindings.push(role);
    }
    if (isAdmin !== undefined) {
        setClauses.push("is_admin = ?");
        bindings.push(isAdmin ? 1 : 0);
    }
    
    bindings.push(userId);

    const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`;

    await env.DB.prepare(sql).bind(...bindings).run();
    
    return new Response(JSON.stringify({ message: `Utente ${userId} aggiornato con successo.` }), { status: 200 });
}

// DELETE /api/admin/users
async function handleDelete(context) {
    const { request, env } = context;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
        return new Response(JSON.stringify({ error: 'userId è richiesto.' }), { status: 400 });
    }

    await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();

    return new Response(JSON.stringify({ message: `Utente ${userId} eliminato con successo.` }), { status: 200 });
}


// --- Main Request Handler ---

export async function onRequest(context) {
    try {
        await verifyAdminToken(context.request, context.env);

        switch (context.request.method) {
            case 'GET':
                return await handleGet(context);
            case 'PUT':
                return await handlePut(context);
            case 'DELETE':
                return await handleDelete(context);
            default:
                return new Response('Method Not Allowed', { status: 405 });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: error.message.includes('Token') || error.message.includes('Accesso negato') ? 403 : 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
