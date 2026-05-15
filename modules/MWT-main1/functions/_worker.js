import { jwtVerify } from 'jose';

const PROTECTED_API_ROUTES = [
    '/api/calculate',
    '/api/race_data',
    '/api/generate_report',
    '/api/races',
    '/api/admin/users',
    '/api/user/profile'
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Skip authentication for the login endpoint itself
    if (url.pathname === '/api/login') {
      return ctx.next();
    }

    // A more flexible check for protected routes.
    // User profile should be accessible to any logged-in user.
    const isAdminRoute = PROTECTED_API_ROUTES.some(route => url.pathname.startsWith(route) && route.includes('/api/admin/'));
    const isUserRoute = url.pathname.startsWith('/api/user/profile');
    
    if (isAdminRoute || isUserRoute) {
      const jwtSecret = env.JWT_SECRET;
      if (!jwtSecret) {
        return new Response('Server Error: JWT_SECRET is not configured.', { status: 500 });
      }

      const authHeader = request.headers.get('Authorization');
      const token = authHeader ? authHeader.replace('Bearer ', '') : null;

      if (!token) {
        // Look for cookie as a fallback
        const cookieHeader = request.headers.get('Cookie');
        const jwtCookie = cookieHeader ? cookieHeader.split(';').find(cookie => cookie.trim().startsWith('mwt_jwt=')) : null;
        if (!jwtCookie) {
          return new Response('Unauthorized: No JWT token found.', { status: 401 });
        }
        const tokenFromCookie = jwtCookie.split('=')[1];
        if(!tokenFromCookie) return new Response('Unauthorized: No JWT token found.', { status: 401 });
        
        try {
            const secretKey = new TextEncoder().encode(jwtSecret);
            const { payload } = await jwtVerify(tokenFromCookie, secretKey);

            if (isAdminRoute && !(payload.isAdmin || payload.role === 'admin')) {
                return new Response('Forbidden: Admin access required.', { status: 403 });
            }
            // If it's a user route, just being logged in is enough.
        } catch (error) {
            return new Response('Unauthorized: Invalid or expired token.', { status: 401 });
        }


      } else {
         try {
            const secretKey = new TextEncoder().encode(jwtSecret);
            const { payload } = await jwtVerify(token, secretKey);
    
            // Check for admin privileges on admin routes
            if (isAdminRoute && !(payload.isAdmin || payload.role === 'admin')) {
              return new Response('Forbidden: Admin access required.', { status: 403 });
            }
            // If it's just a user route, having a valid token is enough.
    
          } catch (error) {
            console.error('JWT verification failed:', error);
            return new Response('Unauthorized: Invalid or expired token.', { status: 401 });
          }
      }

    }

    // Continue to the next Pages Function or asset
    return ctx.next();
  },
};
