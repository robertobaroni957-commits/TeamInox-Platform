// functions/api/utils/dbUtils.js

/**
 * Sanitizza un valore per il binding in una query SQLite D1.
 * Garantisce che l'oggetto non venga passato direttamente, causando D1_TYPE_ERROR.
 */
export const sanitize = (val, paramName = 'unknown') => {
    if (val === null || val === undefined) return null;
    
    // Se è un numero, stringa o booleano (primitivi), restituiscilo
    if (typeof val === 'number' || typeof val === 'string' || typeof val === 'boolean') {
        return val;
    }
    
    // Se è un oggetto, tenta l'estrazione intelligente
    if (typeof val === 'object') {
        // Estrazione prioritaria per chiavi comuni
        const keys = ['id', 'zwid', 'wtrl_id', 'athlete_id', 'team_id', 'round_id', 'race_id', 'slotId', 'level'];
        for (const key of keys) {
            if (key in val) return Number(val[key]);
        }
        
        console.error(`[dbUtils] CRITICAL: Attempted to bind unsupported object to ${paramName}:`, JSON.stringify(val));
        return null; 
    }
    
    return null;
};
