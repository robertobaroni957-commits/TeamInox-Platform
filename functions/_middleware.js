// ==================================================
// functions/_middleware.js (STRICT API ISOLATION)
// ==================================================

import { jwtVerify } from 'jose';
import { assertAuthValid } from './api/utils/auth.js';

const PUBLIC_ROUTES = new Set([
  '/api/login_auth',
  '/api/register',
  '/api/setup-admin',
  '/api/create-admin',
  '/api/get-races',
  '/api/rounds',
  '/api/teams',
  '/api/roster',
]);

function jsonError(message, status = 500) {
  return new Response(
    JSON.stringify({ success: false, error: message, traceId: crypto.randomUUID() }),
    { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
  );
}

async function auth(context) {
  const { request } = context;
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    context.data.user = { role: 'anonymous', auth_level: 'anonymous' };
    return;
  }
  try {
    const token = authHeader.split(' ')[1];
    const secret = new TextEncoder().encode(context.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    context.data.user = { ...payload, role: payload.role || 'user', auth_level: 'full' };
  } catch (err) {
    context.data.user = { role: 'anonymous', auth_level: 'anonymous' };
  }
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // 1. STRONGEST BYPASS: Extension-based check
  const isStaticAsset = /\.(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|html)$/.test(url.pathname);
  if (isStaticAsset || !url.pathname.startsWith('/api')) {
    return next();
  }

  // 2. CORS (Preflight for API)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-debug-trace-id',
      },
    });
  }

  // 3. AUTH (API ONLY)
  if (!PUBLIC_ROUTES.has(url.pathname.toLowerCase().replace(/\/$/, ''))) {
    await auth(context);
    try {
      assertAuthValid(context);
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
  }

  // 4. API RESPONSE (WRAP ONLY)
  const response = await next();
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('x-debug-trace-id', crypto.randomUUID());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
