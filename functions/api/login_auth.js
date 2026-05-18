import bcrypt from 'bcryptjs';
import * as jose from 'jose';

const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24; // 1 giorno
const ALG = 'HS256';

export async function onRequestPost({ request, env, data }) {
    try {
        if (!env.JWT_SECRET) {
            console.error("Missing JWT_SECRET in environment");
            return new Response(JSON.stringify({ message: 'Missing JWT_SECRET configuration' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const body = await request.json();
        const loginId = (body.identifier || body.zwid || body.email || "").toString().trim();
        const password = body.password;

        if (!loginId || !password) {
            return new Response(JSON.stringify({ message: 'Credenziali richieste.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let user;
        const isNumeric = /^\d+$/.test(loginId);

        if (isNumeric) {
            user = await env.ZRL_DB.prepare("SELECT * FROM athletes WHERE zwid = ?").bind(parseInt(loginId)).first();
        }

        if (!user) {
            user = await env.ZRL_DB.prepare("SELECT * FROM athletes WHERE LOWER(email) = ?").bind(loginId.toLowerCase()).first();
        }

        if (!user) {
            user = await env.ZRL_DB.prepare("SELECT * FROM athletes WHERE LOWER(name) = ?").bind(loginId.toLowerCase()).first();
        }

        if (!user) {
            return new Response(JSON.stringify({ message: 'Utente non trovato.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let isPasswordValid = false;
        if (user.password_hash) {
            try {
                isPasswordValid = await bcrypt.compare(password, user.password_hash);
            } catch (e) {
                console.error("Bcrypt compare error:", e);
                return new Response(JSON.stringify({ message: 'Errore verifica password.' }), { status: 500 });
            }
        } else {
            isPasswordValid = (password === user.zwid.toString());
        }

        if (!isPasswordValid) {
            return new Response(JSON.stringify({ message: 'Password errata.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const userRole = user.role ? user.role.toString().trim().toLowerCase() : 'user';
   
        const payload = {
            zwid: user.zwid,
            username: user.name,
            role: userRole,
            exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS
        };
   
        const token = await new jose.SignJWT(payload)
            .setProtectedHeader({ alg: ALG })
            .setIssuedAt()
            .setExpirationTime(`${TOKEN_EXPIRY_SECONDS}s`)
            .sign(secret);

        return new Response(JSON.stringify({
            message: 'Login effettuato.',
            token: token,
            role: user.role
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Login Error:", error);
        return new Response(JSON.stringify({ message: 'Errore interno del server.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
