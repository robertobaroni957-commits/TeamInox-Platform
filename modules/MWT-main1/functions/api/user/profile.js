// functions/api/user/profile.js
import * as jose from 'jose';

const ALG = 'HS256';

// --- Funzioni di Crittografia (AES-GCM) ---
async function getKey(secret) {
    const keyData = new TextEncoder().encode(secret);
    const hash = await crypto.subtle.digest('SHA-256', keyData);
    return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function encrypt(text, secret) {
    const key = await getKey(secret);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedText = new TextEncoder().encode(text);
    const encryptedData = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, encodedText);
    const ivB64 = btoa(String.fromCharCode.apply(null, iv));
    const encryptedB64 = btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedData)));
    return `${ivB64}:${encryptedB64}`;
}

// --- Funzioni di Autenticazione ---
async function verifyToken(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Authorization header mancante o malformato.');
    }
    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    try {
        const { payload } = await jose.jwtVerify(token, secret, { algorithms: [ALG] });
        if (!payload.userId) throw new Error('Token non valido: userId mancante.');
        return payload;
    } catch (err) {
        throw new Error('Token non valido o scaduto.');
    }
}

// --- Gestione Richieste ---
// GET /api/user/profile
async function handleGet(context) {
    const { request, env } = context;
    const payload = await verifyToken(request, env);
    const { results } = await env.DB.prepare("SELECT zwift_username FROM users WHERE id = ?").bind(payload.userId).all();
    if (!results || results.length === 0) {
        return new Response(JSON.stringify({ error: 'Utente non trovato.' }), { status: 404 });
    }
    return new Response(JSON.stringify({ zwift_username: results[0].zwift_username || '' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

// POST /api/user/profile
async function handlePost(context) {
    const { request, env } = context;
    const payload = await verifyToken(request, env);
    const body = await request.json();
    const { zwift_username, zwift_password } = body;

    if (!zwift_username) {
        return new Response(JSON.stringify({ error: 'Il campo zwift_username è obbligatorio.' }), { status: 400 });
    }

    if (zwift_password) {
        if (!env.ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY non configurata come secret.');
        const encryptedPassword = await encrypt(zwift_password, env.ENCRYPTION_KEY);
        await env.DB.prepare("UPDATE users SET zwift_username = ?, zwift_password_encrypted = ? WHERE id = ?").bind(zwift_username, encryptedPassword, payload.userId).run();
    } else {
        await env.DB.prepare("UPDATE users SET zwift_username = ? WHERE id = ?").bind(zwift_username, payload.userId).run();
    }
    
    return new Response(JSON.stringify({ message: 'Profilo aggiornato con successo.' }), { status: 200 });
}

// Funzione principale
export async function onRequest(context) {
    try {
        if (context.request.method === 'GET') {
            return await handleGet(context);
        }
        if (context.request.method === 'POST') {
            return await handlePost(context);
        }
        return new Response('Method Not Allowed', { status: 405 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: error.message.includes('Token') ? 401 : 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}