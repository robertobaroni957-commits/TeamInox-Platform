// ================================
// Middleware globale INOXTEAM API
// JWT + RBAC + Anti-cache + SeasonContext + Architecture Lock + Auto-Bootstrap
// ================================
import { jwtVerify } from 'jose';
import { assertNoFallbackUsage } from '../src/services/architecture/ArchitectureGuard';
import { assertAuthValid } from '../src/services/architecture/AuthGuard';

const RBAC_POLICY = {
    '/api/admin': ['admin', 'moderator'],
    '/api/mutation': ['admin']
};

const PUBLIC_ROUTES = [
    '/api/login_auth', '/api/register', '/api/setup-admin', '/api/create-admin'
];

export async function onRequest(context) {
    const { request, env, next, data } = context;
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase().replace(/\/$/, '');
    const method = request.method;

    const traceId = request.headers.get('x-debug-trace-id') || crypto.randomUUID();
    context.data.traceId = traceId;

    // 2. CORS
    if (method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, x-debug-trace-id"
            }
        });
    }

    // 3. AUTH & RBAC
    if (!PUBLIC_ROUTES.includes(path)) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
            const rawToken = authHeader.split(' ')[1];
            console.log("[auth] raw token received:", rawToken);

            try {
                const secret = new TextEncoder().encode(env.JWT_SECRET);
                const { payload } = await jwtVerify(rawToken, secret);
                
                console.log("[auth] JWT payload decoded:", payload);
                
                context.data.user = { 
                    ...payload, 
                    role: payload.role || 'user',
                    auth_level: 'full' 
                };
                console.log("[auth] final resolved role:", context.data.user.role);
            } catch (err) {
                console.error("[auth] jwt verification failed (non-blocking):", err.message);
                context.data.user = { role: 'anonymous', auth_level: 'anonymous' };
            }
        } else {
            console.log("[auth] no Authorization header, defaulting to anonymous");
            context.data.user = { role: 'anonymous', auth_level: 'anonymous' };
        }
    }

    try {
        assertAuthValid(context);
    } catch (err) {
        return jsonError(err.message, 401);
    }

    return handleNext(next, traceId);
}

function jsonError(message, status = 500) {
    return new Response(
        JSON.stringify({ success: false, error: message, traceId: crypto.randomUUID() }),
        { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
}

async function handleNext(next, traceId) {
    const response = await next();
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('x-debug-trace-id', traceId);
    return newResponse;
}
