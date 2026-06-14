/**
 * UnifiedAiContractValidator
 * Production-grade strict validator for the Unified AI Reporting Engine Contract.
 * Optimized for Cloudflare Workers / D1. Zero dependencies.
 */

export class UnifiedAiContractValidator {
    constructor() {
        this.reportTypes = ['race', 'round', 'season', 'rider'];
        this.styles = ['journalistic', 'analytical', 'epic'];
        this.formats = ['markdown', 'html', 'plain'];
        this.strategies = ['cache-first', 'force-refresh', 'background-only'];
    }

    /**
     * Entry point for validation.
     * Never throws; returns results object.
     */
    validate(input) {
        const errors = [];
        const normalized = {};

        if (!input || typeof input !== 'object' || Array.isArray(input)) {
            return { valid: false, errors: ["Root must be a valid JSON object"], normalized_contract: null };
        }

        // 1. Strict Field Check (Root)
        const allowedRootFields = ['request_id', 'report_type', 'scope', 'config', 'context', 'caching'];
        this._checkExtraFields(input, allowedRootFields, "root", errors);

        // 2. Validate Component Modules
        const typeResult = this.validateReportType(input.report_type, errors);
        const scopeResult = this.validateScope(input.scope, errors);
        const configResult = this.validateConfig(input.config, errors);
        const contextResult = this.validateContext(input.context, errors);
        const cachingResult = this.validateCaching(input.caching, errors);

        if (errors.length === 0) {
            return {
                valid: true,
                errors: [],
                normalized_contract: {
                    request_id: input.request_id || crypto.randomUUID(),
                    report_type: typeResult,
                    scope: scopeResult,
                    config: configResult,
                    context: contextResult,
                    caching: cachingResult
                }
            };
        }

        return { valid: false, errors, normalized_contract: null };
    }

    validateReportType(type, errors) {
        if (!this.reportTypes.includes(type)) {
            errors.push(`report_type must be one of: ${this.reportTypes.join(', ')}`);
            return null;
        }
        return type;
    }

    validateScope(scope, errors) {
        if (!this._isObject(scope)) {
            errors.push("scope must be a non-null object");
            return null;
        }

        const allowed = ['round_id', 'team_id', 'athlete_id', 'season_code'];
        this._checkExtraFields(scope, allowed, "scope", errors);

        return {
            round_id: this._coerceNumber(scope.round_id, 'scope.round_id', errors, true),
            team_id: this._coerceNumber(scope.team_id, 'scope.team_id', errors, true),
            athlete_id: this._coerceNumber(scope.athlete_id, 'scope.athlete_id', errors, true),
            season_code: this._checkType(scope.season_code, 'string', 'scope.season_code', errors, true)
        };
    }

    validateConfig(config, errors) {
        if (!this._isObject(config)) {
            errors.push("config must be a non-null object");
            return null;
        }

        const allowed = ['style', 'language', 'tone_modifier', 'output_format'];
        this._checkExtraFields(config, allowed, "config", errors);

        if (config.style && !this.styles.includes(config.style)) {
            errors.push(`config.style must be one of: ${this.styles.join(', ')}`);
        }

        if (config.output_format && !this.formats.includes(config.output_format)) {
            errors.push(`config.output_format must be one of: ${this.formats.join(', ')}`);
        }

        return {
            style: config.style || 'journalistic',
            language: (config.language || 'it').trim().toLowerCase(),
            tone_modifier: config.tone_modifier ? config.tone_modifier.trim() : null,
            output_format: config.output_format || 'markdown'
        };
    }

    validateContext(context, errors) {
        if (!this._isObject(context)) {
            // Default context if missing
            return { payload: {}, minified: true, version: "11.0" };
        }

        const allowed = ['payload', 'minified', 'version'];
        this._checkExtraFields(context, allowed, "context", errors);

        return {
            payload: context.payload || {},
            minified: context.minified !== undefined ? !!context.minified : true,
            version: this._checkType(context.version, 'string', 'context.version', errors, true) || "11.0"
        };
    }

    validateCaching(caching, errors) {
        if (!this._isObject(caching)) {
            // Default caching if missing
            return { strategy: 'cache-first', ttl_seconds: 3600 };
        }

        const allowed = ['strategy', 'hash_override', 'ttl_seconds'];
        this._checkExtraFields(caching, allowed, "caching", errors);

        if (caching.strategy && !this.strategies.includes(caching.strategy)) {
            errors.push(`caching.strategy must be one of: ${this.strategies.join(', ')}`);
        }

        return {
            strategy: caching.strategy || 'cache-first',
            hash_override: this._checkType(caching.hash_override, 'string', 'caching.hash_override', errors, true),
            ttl_seconds: this._coerceNumber(caching.ttl_seconds, 'caching.ttl_seconds', errors, true) || 3600
        };
    }

    // --- Private Strictness Helpers ---

    _isObject(obj) {
        return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
    }

    _checkExtraFields(obj, allowed, path, errors) {
        const actual = Object.keys(obj || {});
        for (const key of actual) {
            if (!allowed.includes(key)) {
                errors.push(`Strict Mode Violation: Extra field "${key}" not allowed in ${path}`);
            }
        }
    }

    _coerceNumber(value, path, errors, nullable = false) {
        if (value === null || value === undefined) {
            if (!nullable && value === undefined) errors.push(`${path} is missing`);
            return null;
        }
        const num = Number(value);
        if (isNaN(num)) {
            errors.push(`${path} must be a number or numeric string, got ${typeof value}`);
            return null;
        }
        return num;
    }

    _checkType(value, expected, path, errors, nullable = false) {
        if (value === null || value === undefined) {
            if (!nullable && value === undefined) errors.push(`${path} is missing`);
            return null;
        }
        if (typeof value !== expected) {
            errors.push(`${path} must be of type ${expected}, got ${typeof value}`);
            return null;
        }
        return value;
    }
}
