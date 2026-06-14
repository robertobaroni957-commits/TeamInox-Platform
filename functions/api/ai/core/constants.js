/**
 * constants.js
 * Single source of truth for AI Narrative modes.
 */
export const AI_MODES = {
    RACE: 'race',
    ROUND: 'round',
    SEASON: 'season'
};

export const DEFAULT_MODE = AI_MODES.ROUND;
export const ALLOWED_MODES = Object.values(AI_MODES);
