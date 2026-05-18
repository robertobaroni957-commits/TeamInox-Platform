// Cloudflare Function for user login and JWT issuance

import { SignJWT } from 'jose'; // Import from 'jose' library

// Hash function compatible with Web Crypto API (for Workers)
async function hashPassword(password) {
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashedPassword;
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const db = env.ZRL_DB; // Assumes D1 binding is named DB in wrangler.toml
    const JWT_SECRET = env.JWT_SECRET; // Bound secret for JWT signing

    if (!JWT_SECRET) {
        return new Response(JSON.stringify({ error: 'JWT_SECRET is not configured.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return new Response(JSON.stringify({ error: 'Username and password are required.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 1. Find user in D1
        const user = await db.prepare("SELECT id, username, password_hash, is_admin FROM users WHERE username = ?")
                             .bind(username)
                             .first();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Invalid credentials.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. Hash provided password and compare (simplified hashing for now)
        const hashedPassword = await hashPassword(password);
        if (hashedPassword !== user.password_hash) {
            return new Response(JSON.stringify({ error: 'Invalid credentials.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 3. Generate JWT
        const alg = 'HS256'; // Algorithm for signing
        const jwt = await new SignJWT({ 
                userId: user.id, 
                username: user.username, 
                isAdmin: user.is_admin 
            })
            .setProtectedHeader({ alg })
            .setIssuedAt()
            .setExpirationTime('2h') // Token expires in 2 hours
            .sign(new TextEncoder().encode(JWT_SECRET)); // Sign with secret

        // 4. Set JWT as HTTP-only cookie
        const response = new Response(JSON.stringify({ message: 'Login successful!', user: { username: user.username, isAdmin: user.is_admin } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

        // Max-Age should be consistent with JWT expiration
        response.headers.set('Set-Cookie', `mwt_jwt=${jwt}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${2 * 60 * 60}`);
        
        return response;

    } catch (error) {
        console.error("Error during login:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
