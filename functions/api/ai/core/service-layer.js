/**
 * AI Internal Service Layer - Phase 13.0
 * Provides direct access to AI logic, bypassing HTTP overhead and preventing dev deadlocks.
 */
import { onRequestPost as orchestratorHandler } from '../orchestrator.js';

export const AiService = {
    /**
     * Proxies a request directly to the orchestrator module logic.
     * Prevents internal fetch() and serialization overhead.
     */
    async execute(env, unifiedContract) {
        // Direct invocation of the handler's logic
        // We simulate a Request object to satisfy the handler's interface
        const response = await orchestratorHandler({
            request: new Request("http://internal/ai", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "X-AI-Internal": "true"
                },
                body: JSON.stringify(unifiedContract)
            }),
            env: env
        });

        const resData = await response.json();

        if (!response.ok) {
            const error = new Error(resData.message || resData.error || "AI Service execution failed");
            error.status = response.status;
            error.details = resData.details;
            throw error;
        }

        return resData;
    }
};
