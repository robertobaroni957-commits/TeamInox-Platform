import { UnifiedAiContractValidator } from '../utils/contract-validator.js';

/**
 * AI Contract Gate - Phase 7.0
 * Enforces strict JSON schema validation for all AI reporting requests.
 * Acts as the primary security and data integrity layer.
 */
export function validateAndNormalize(body) {
    const validator = new UnifiedAiContractValidator();
    
    // Perform strict validation
    const result = validator.validate(body);
    
    return {
        valid: result.valid,
        normalized: result.normalized_contract,
        errors: result.errors
    };
}

/**
 * Ensures AI output matches the strict required schema.
 */
export function validateReportStructure(report) {
    const required = ['type', 'title', 'content', 'highlights', 'team_analysis', 'mvp', 'meta'];
    const valid = required.every(key => Object.prototype.hasOwnProperty.call(report, key));
    return {
        valid,
        errors: valid ? [] : ['Missing required keys in AI report structure']
    };
}

/**
 * Standard error response for contract violations.
 */
export function contractErrorResponse(errors) {
    return new Response(JSON.stringify({
        error: "Contract Validation Failed",
        type: "STRICT_MODE_VIOLATION",
        details: errors
    }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
    });
}
