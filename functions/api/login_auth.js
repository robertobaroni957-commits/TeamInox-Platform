// functions/api/login_auth.js
import bcrypt from 'bcryptjs'; 
import * as jose from 'jose';

const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24;
const ALG = 'HS256';

export async function onRequestPost({ request, env }) {
    try {
        const { email, password } = await request.json();
        
        if (!email || !password) {
            return new Response(JSON.stringify({ message: 'Email e password richiesti.' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Recupera l'utente
        const user = await env.DB.prepare(
            "SELECT * FROM users WHERE email = ?"
        ).bind(email).first();

        if (!user) {
             return new Response(JSON.stringify({ message: 'Credenziali non valide.' }), { 
                 status: 401,
                 headers: { 'Content-Type': 'application/json' }
             });
        }

        // Confronta password
        const hashToCompare = user.password_hash;
        const isPasswordValid = await bcrypt.compare(password, hashToCompare); 

        if (!isPasswordValid) {
             return new Response(JSON.stringify({ message: 'Credenziali non valide.' }), { 
                 status: 401,
                 headers: { 'Content-Type': 'application/json' }
             });
        }

        // Genera Token
        const payload = { 
            zwid: user.zwift_power_id || user.id, // Usa zwift_power_id registrato
            username: user.username, 
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS
        };
        const secret = new TextEncoder().encode(env.JWT_SECRET);
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
        console.error("Login Auth Error:", error);
        return new Response(JSON.stringify({ message: 'Errore interno: ' + error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
