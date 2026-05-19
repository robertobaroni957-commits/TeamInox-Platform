export function assertNoFallbackUsage(context, reason) {
    const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
    
    if (isDev) {
        console.log(`[ARCHITECTURE GUARD] Checking context for: ${reason}`);
    }

    if (!context.data) {
        throw new Error("ARCHITECTURE_VIOLATION: Missing context data");
    }
}
