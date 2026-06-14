/**
 * request-validator.js
 * Strict structural validation for AI API requests.
 */
import { ALLOWED_MODES } from './constants.js';

export function validateRequestParams(mode, params) {
    console.log("[REQUEST VALIDATOR] Received mode:", mode, "Allowed modes:", ALLOWED_MODES);
    const missing = [];

    if (!mode || !ALLOWED_MODES.includes(mode)) {
        console.error("[REQUEST VALIDATOR] Validation failed: invalid mode", mode);
        missing.push('valid mode (' + ALLOWED_MODES.join(', ') + ')');
    }

    if (mode === 'race') {
        if (!params?.round_id) missing.push('round_id');
        if (!params?.team_id) missing.push('team_id');
    } else if (mode === 'round') {
        if (!params?.round_id) missing.push('round_id');
    } else if (mode === 'season') {
        if (!params?.season_code) missing.push('season_code');
    }

    const result = { valid: missing.length === 0, missing };
    console.log("[REQUEST VALIDATOR] Result:", JSON.stringify(result));
    return result;
}
