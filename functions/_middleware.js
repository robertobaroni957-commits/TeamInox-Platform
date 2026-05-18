// ================================
// Middleware globale INOXTEAM API
// JWT + RBAC + Anti-cache
// ================================
import { jwtVerify } from 'jose';

const RBAC_POLICY = {
    '/api/admin': ['admin', 'moderator'],
    '/api/admin/zrl/import': ['admin', 'moderator'],
    '/api/create-admin': ['admin'],
    '/api/events': {
        GET: ['admin', 'moderator', 'captain', 'user'],
        POST: ['admin', 'moderator'],
        PATCH: ['admin', 'moderator'],
        DELETE: ['admin', 'moderator']
    },
    '/api/availability': {
        GET: ['admin', 'moderator', 'captain', 'user'],
        POST: ['admin', 'moderator', 'captain', 'user']
    },
    '/api/lineup': {
        GET: ['admin', 'moderator', 'captain', 'user'],
        POST: ['admin', 'moderator', 'captain'],
        PATCH: ['admin', 'moderator', 'captain'],
        DELETE: ['admin', 'moderator', 'captain']
    },
    '/api/data': ['admin', 'moderator'],
    '/api/mutation': ['admin']
};

const PUBLIC_ROUTES = [
    '/api/login_auth',
    '/api/register',
    '/api/series',
    '/api/rounds',
    '/api/results',
    '/api/teams',
    '/api/division-results',
    '/api/setup-zrl-2026',
    '/api/sync-schedule',
    '/api/sync-rounds',
    '/api/sync-all-teams',
    '/api/setup-admin',
    '/api/availability-check',
    '/api/zrl-analytics',
    '/api/season-stats'
];

// Rotte che permettono l'accesso anonimo in modalità "ridotta" (Redaction Layer)
const REDACTABLE_ROUTES = [
    '/api/admin/season/status',
    '/api/admin/season/logs'
];

export async function onRequest(context) {
    const { request, env, next, data } = context;
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase().replace(/\/$/, '');
    const method = request.method;

    // 1. Pass-through per file statici
    if (!path.startsWith('/api')) {
        return next();
    }

    // 2. TRACE ID GENERATION / PROPAGATION
    const traceId = request.headers.get('x-debug-trace-id') || crypto.randomUUID();
    data.traceId = traceId;
    data.debugMode = url.searchParams.get('debug') === 'true';

    // 3. GESTIONE CORS PREFLIGHT
    if (method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, x-debug-trace-id",
                "Access-Control-Max-Age": "86400",
            }
        });
    }

    // 4. IDENTIFICAZIONE ROTTE PUBBLICHE (Sempre accessibili senza JWT)
    if (path === '/api/login_auth' || PUBLIC_ROUTES.includes(path)) {
        return handleNext(next, traceId);
    }

    // 4. VERIFICA AUTENTICAZIONE
    const isRedactable = REDACTABLE_ROUTES.includes(path) && method === 'GET';
    const authHeader = request.headers.get('Authorization');
    
    // Tentativo di verifica JWT se presente
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            if (!env.JWT_SECRET) throw new Error("JWT_SECRET missing");
            
            const secret = new TextEncoder().encode(env.JWT_SECRET);
            const { payload } = await jwtVerify(token, secret);

            if (payload.role === 'athlete') payload.role = 'user';
            
            // RBAC Check per rotte admin
            if (path.startsWith('/api/admin') || path.startsWith('/api/mutation')) {
                if (!checkPermissions(path, method, payload.role)) {
                    // Se la rotta è redactable e l'utente ha un token valido ma non è admin,
                    // lo trattiamo come anonimo (redacted) invece di dargli 403
                    if (isRedactable) {
                        data.user = { role: 'anonymous', auth_level: 'anonymous' };
                        return handleNext(next, traceId);
                    }
                    return jsonError(`Forbidden: ${payload.role} role cannot access this resource`, 403);
                }
            }

            data.user = { ...payload, auth_level: 'full' };
            return handleNext(next, traceId);

        } catch (err) {
            // Token presente ma invalido/scaduto
            if (isRedactable) {
                data.user = { role: 'anonymous', auth_level: 'anonymous' };
                return handleNext(next, traceId);
            }
            return jsonError('Unauthorized: Session expired or invalid', 401);
        }
    }

    // 5. GESTIONE MANCANZA JWT
    if (isRedactable) {
        data.user = { role: 'anonymous', auth_level: 'anonymous' };
        return handleNext(next, traceId);
    }

    // Qualsiasi altra rotta admin/protetta senza JWT fallisce con 401
    return jsonError('Authentication required', 401);
}

function checkPermissions(path, method, userRole) {
    if (userRole === 'admin') return true;
    for (const [route, requirements] of Object.entries(RBAC_POLICY)) {
        if (path.startsWith(route)) {
            const allowedRoles = Array.isArray(requirements) ? requirements : requirements[method];
            if (allowedRoles && allowedRoles.includes(userRole)) return true;
            return false;
        }
    }
    return true;
}

function jsonError(message, status = 400) {
    return new Response(JSON.stringify({ error: message, success: false }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

async function handleNext(next, traceId) {
    try {
        const response = await next();
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        newResponse.headers.set('Cache-Control', 'no-store');
        if (traceId) {
            newResponse.headers.set('x-debug-trace-id', traceId);
        }
        return newResponse;
    } catch (e) {
        return jsonError(`Server Error: ${e.message}`, 500);
    }
}

