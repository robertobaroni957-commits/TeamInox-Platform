// functions/_middleware.js
import * as jose from 'jose';

export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);

    // 1. Escludi le rotte pubbliche (Login, Register, Asset Statici)
    const publicPaths = ['/api/login_auth', '/api/register', '/login', '/', '/api/create-admin'];
    const isPublicPath = publicPaths.some(path => url.pathname === path);
    const isPublicGet = request.method === 'GET' && (
        url.pathname === '/api/series' || 
        url.pathname === '/api/rounds' || 
        url.pathname === '/api/results' ||
        url.pathname === '/api/events' ||
        url.pathname === '/api/teams'
    );

    if (isPublicPath || isPublicGet || !url.pathname.startsWith('/api/')) {
        return next();
    }

    // 2. Estrai il Token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Missing or invalid authentication token' }), { 
            status: 401, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verifica Token utilizzando 'jose'
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        
        // Passa i dati dell'utente al contesto per le funzioni API successive
        context.data.user = payload;
        
        return next();
    } catch (err) {
        console.error('Middleware JWT Error:', err.message);
        return new Response(JSON.stringify({ error: 'Unauthorized: Session expired or invalid' }), { 
            status: 401, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
}
