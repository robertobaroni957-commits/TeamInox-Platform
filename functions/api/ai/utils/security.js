/**
 * AI Security Layer - Phase 12.0
 * Prevents Prompt Injection and Data Poisoning in AI Workflows.
 */

const FORBIDDEN_INSTRUCTIONS = [
    "ignore previous", "system:", "assistant:", "user:", "###", 
    "end report", "stop instructions", "write new", "act as"
];

/**
 * Sanitizes a raw string to ensure it cannot be interpreted as an LLM instruction.
 */
export function sanitizeForLLM(input, maxLength = 64) {
    if (typeof input !== 'string') return input;

    let sanitized = input
        .replace(/[\r\n\t]/g, " ") // Neutralize newlines/tabs
        .replace(/['"`]/g, "")     // Remove quotes
        .replace(/[<>\\/]/g, "")   // Remove script/HTML-like chars
        .trim();

    // 1. pseudo-instruction neutralization
    const lower = sanitized.toLowerCase();
    for (const trigger of FORBIDDEN_INSTRUCTIONS) {
        if (lower.includes(trigger)) {
            // Replaces suspicious parts with [REDACTED] to maintain context without risk
            const regex = new RegExp(trigger, 'gi');
            sanitized = sanitized.replace(regex, "[SEC_VIO]");
        }
    }

    // 2. Escape dangerous role tokens
    sanitized = sanitized
        .replace(/\bsystem\b/gi, "s_y_s_t_e_m")
        .replace(/\bassistant\b/gi, "a_s_s_i_s_t_a_n_t")
        .replace(/\buser\b/gi, "u_s_e_r");

    // 3. Length capping
    return sanitized.substring(0, maxLength);
}

/**
 * Recursively builds a safe context object where all strings are sanitized and tagged.
 */
export function safeContextBuilder(data) {
    if (data === null || data === undefined) return null;

    if (Array.isArray(data)) {
        return data.map(item => safeContextBuilder(item));
    }

    if (typeof data === 'object') {
        const safeObj = {};
        for (const [key, value] of Object.entries(data)) {
            safeObj[key] = safeContextBuilder(value);
        }
        return safeObj;
    }

    if (typeof data === 'string') {
        // Apply hard separation strategy via [DATA: ...] wrapping
        return `[DATA: ${sanitizeForLLM(data)}]`;
    }

    return data; // Numbers, Booleans are safe
}
