import { extractMetadata } from './utils/quality-engine.js';
import { formatDiscord } from './utils/publish-adapters.js';

/**
 * AI Multi-Channel Publisher - Phase 4.0
 * Rule-based content distribution pipeline.
 */

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { round_id, team_id, report_type = "race" } = body;

        const db = env.ZRL_DB;
        if (!db) throw new Error("DB binding missing");

        // 1. Fetch Latest Report
        const reportRow = await db.prepare(`
            SELECT content, model, created_at, hash
            FROM zrl_ai_reports
            WHERE round_id = ? AND team_id = ? AND report_type = ?
            ORDER BY created_at DESC LIMIT 1
        `).bind(round_id, team_id, report_type).first();

        if (!reportRow) {
            return new Response(JSON.stringify({ published: false, error: "Report not found in cache" }), { status: 404 });
        }

        // 2. Metadata Extraction & Quality Gate
        const metadata = extractMetadata(reportRow.content);
        const qualityScore = metadata.quality_score || 0;

        if (qualityScore < 75) {
            return new Response(JSON.stringify({ 
                published: false, 
                quality_score: qualityScore, 
                skipped_reason: "Quality score below 75 threshold. Publication aborted." 
            }), { status: 200 });
        }

        // 3. Execution of Publish Adapters
        const results = {
            internal: true, // Confirmed existing in D1
            webhook: false,
            discord: false
        };

        // A) WEBHOOK (Generic JSON payload)
        if (env.WEBHOOK_URL) {
            try {
                await fetch(env.WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        event: "report_published",
                        round_id,
                        team_id,
                        report_type,
                        quality_score: qualityScore,
                        content_preview: reportRow.content.slice(0, 500)
                    })
                });
                results.webhook = true;
            } catch (e) { console.error("Webhook failed", e); }
        }

        // B) DISCORD (Formatted rich embed)
        if (env.DISCORD_WEBHOOK_URL) {
            try {
                const discordPayload = formatDiscord(reportRow.content, metadata, { round_id, team_id });
                await fetch(env.DISCORD_WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(discordPayload)
                });
                results.discord = true;
            } catch (e) { console.error("Discord failed", e); }
        }

        return new Response(JSON.stringify({
            published: true,
            channels: Object.keys(results).filter(k => results[k]),
            quality_score: qualityScore,
            report_hash: reportRow.hash
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
