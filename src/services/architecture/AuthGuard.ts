export function assertAuthValid(context) {
    const { user } = context.data || {};
    
    // Auth must be an object (even if role is anonymous) or null if not yet determined
    // Never allow raw string manipulation of auth state
    if (user !== undefined && user !== null && typeof user !== 'object') {
        throw new Error("UNAUTHORIZED: Invalid auth context structure");
    }
    
    console.log("[ARCHITECTURE GUARD] PASS: Auth Context Valid");
}
