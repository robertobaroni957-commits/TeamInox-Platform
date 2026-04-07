import bcrypt from 'bcryptjs';
import * as jose from 'jose';

const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24; // 1 giorno
const ALG = 'HS256';

export async function onRequestPost({ request, env, data }) {
    try {
        // ✅ Leggi body JSON
        const body = await request.json();
        const loginId = (body.identifier || body.zwid || body.email || "").toString().trim();
        const password = body.password;

        if (!loginId || !password) {
            return new Response(JSON.stringify({ message: 'Credenziali richieste.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // ======================================================
        // 1️⃣ Cerca l'utente nel DB
        // ======================================================
        let user;
        const isNumeric = /^\d+$/.test(loginId);

        if (isNumeric) {
            user = await env.DB.prepare(
                "SELECT * FROM athletes WHERE zwid = ?"
            ).bind(parseInt(loginId)).first();
        }

        if (!user) {
            user = await env.DB.prepare(
                "SELECT * FROM athletes WHERE LOWER(email) = ?"
            ).bind(loginId.toLowerCase()).first();
        }

        if (!user) {
            user = await env.DB.prepare(
                "SELECT * FROM athletes WHERE LOWER(name) = ?"
            ).bind(loginId.toLowerCase()).first();
        }

        if (!user) {
            return new Response(JSON.stringify({ message: 'Utente non trovato.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // ======================================================
        // 2️⃣ Verifica password
        // ======================================================
        let isPasswordValid = false;

        if (user.password_hash) {
            // bcrypt hash
            isPasswordValid = await bcrypt.compare(password, user.password_hash);
        } else {
            // fallback utenti CSV senza hash: password = zwid
            isPasswordValid = (password === user.zwid.toString());
        }

        if (!isPasswordValid) {
            return new Response(JSON.stringify({ message: 'Password errata.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // ======================================================
        // 3️⃣ Genera JWT
        // ======================================================
        if (!env.JWT_SECRET || env.JWT_SECRET.length === 0) {
            throw new Error("Configurazione server incompleta: JWT_SECRET mancante.");
        }

        const payload = {
            zwid: user.zwid,
            username: user.name,
            role: user.role || 'user',
            exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS
        };

        const secret = new TextEncoder().encode(env.JWT_SECRET);

        const token = await new jose.SignJWT(payload)
            .setProtectedHeader({ alg: ALG })
            .setIssuedAt()
            .setExpirationTime(`${TOKEN_EXPIRY_SECONDS}s`)
            .sign(secret);

        // ======================================================
        // 4️⃣ Risposta OK
        // ======================================================
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
        return new Response(JSON.stringify({ message: 'Errore: ' + error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}