// functions/api/utils/dbUtils.js

/**
 * Sanitizza un valore per il binding in una query SQLite D1.
 * Garantisce che l'oggetto non venga passato direttamente, causando D1_TYPE_ERROR.
 */
export const sanitize = (val) => {
    if (val === null || val === undefined) return null;
    
    // Se è un numero o stringa (primitivi), restituiscilo
    if (typeof val === 'number' || typeof val === 'string' || typeof val === 'boolean') {
        return val;
    }
    
    // Se è un oggetto, tenta l'estrazione intelligente
    if (typeof val === 'object') {
        if ('id' in val) return Number(val.id);
        if ('zwid' in val) return Number(val.zwid);
        if ('value' in val) return val.value;
        
        console.error("[dbUtils] Attempted to bind unsupported object:", val);
        return null; 
    }
    
    return null;
};
