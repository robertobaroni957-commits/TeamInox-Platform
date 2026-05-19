import bcrypt from 'bcryptjs';
import * as jose from 'jose';

const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24; // 1 giorno
const ALG = 'HS256';

/**
 * Endpoint Login: REST API contract compliant.
 * Always returns JSON, never HTML.
 */
export async function onRequestPost(context) {
    const { request, env, data } = context;
    const traceId = data?.traceId || crypto.randomUUID();

    const jsonResponse = (data, status = 200, success = true, error = null) => {
        return new Response(JSON.stringify({
            success,
            data,
            error,
            traceId
        }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    };

    try {
        if (!env.JWT_SECRET) {
            return jsonResponse(null, 500, false, "JWT_SECRET missing configuration");
        }

        const body = await request.json().catch(() => ({}));
        const loginId = (body.identifier || body.zwid || body.email || "").toString().trim();
        const password = body.password;

        if (!loginId || !password) {
            return jsonResponse(null, 400, false, "Credenziali mancanti");
        }

        const db = env.ZRL_DB;
        if (!db) return jsonResponse(null, 500, false, "Database non disponibile");

        let user;
        const isNumeric = /^\d+$/.test(loginId);

        // Query sequence
        const queries = [
            db.prepare("SELECT * FROM athletes WHERE zwid = ?").bind(isNumeric ? parseInt(loginId) : -1),
            db.prepare("SELECT * FROM athletes WHERE LOWER(email) = ?").bind(loginId.toLowerCase()),
            db.prepare("SELECT * FROM athletes WHERE LOWER(name) = ?").bind(loginId.toLowerCase())
        ];

        for (const query of queries) {
            user = await query.first();
            if (user) break;
        }

        if (!user) {
            return jsonResponse(null, 401, false, "Utente non trovato");
        }

        let isPasswordValid = false;
        if (user.password_hash) {
            isPasswordValid = await bcrypt.compare(password, user.password_hash);
        } else {
            isPasswordValid = (password === user.zwid.toString());
        }

        if (!isPasswordValid) {
            return jsonResponse(null, 401, false, "Password errata");
        }
    
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        
        // Ensure admin remains admin, other roles become user
        let role = user.role ? user.role.toString().trim().toLowerCase() : 'user';
        if (role !== 'admin' && role !== 'moderator') {
            role = 'user';
        }

        const payload = {
            zwid: user.zwid,
            username: user.name,
            role: role,
            exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS
        };
   
        console.log(`[auth] signing token for ${payload.username} with role: ${payload.role}`);

        const token = await new jose.SignJWT(payload)
            .setProtectedHeader({ alg: ALG })
            .setIssuedAt()
            .setExpirationTime(`${TOKEN_EXPIRY_SECONDS}s`)
            .sign(secret);

        return jsonResponse({
            token,
            role: role
        });

    } catch (error) {
        console.error(`[LoginAuth Error] ${traceId}:`, error);
        return jsonResponse(null, 500, false, "Errore interno del server");
    }
}
