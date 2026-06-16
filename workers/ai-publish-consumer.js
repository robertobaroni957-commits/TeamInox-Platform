/**
 * AI Publish Queue Consumer
 * Handles external API calls (Discord, Webhooks) asynchronously.
 */
import { formatDiscord } from '../functions/api/ai/utils/publish-adapters.js';

export default {
    async queue(batch, env) {
        for (const message of batch.messages) {
            const job = message.body;

            try {
                const results = [];

                // A) Discord Distribution
                if (env.DISCORD_WEBHOOK_URL) {
                    const discordPayload = formatDiscord(job.content, job.metadata, {});
                    const res = await fetch(env.DISCORD_WEBHOOK_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(discordPayload)
                    });
                    if (res.ok) results.push("discord");
                }

                // B) External Webhook
                if (env.WEBHOOK_URL) {
                    const res = await fetch(env.WEBHOOK_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            event: "ai_report_available",
                            report_id: job.report_id,
                            type: job.report_type,
                            summary_preview: job.content.slice(0, 300)
                        })
                    });
                    if (res.ok) results.push("webhook");
                }

                console.log(`[CONSUMER] Published ${job.idempotency_key} to: ${results.join(", ")}`);
                
                // Confirm message success
                message.ack();

            } catch (err) {
                console.error(`[CONSUMER_RETRY] ${job.idempotency_key} failed: ${err.message}`);
                // Retries are handled by Cloudflare Queues exponential backoff policy
                message.retry();
            }
        }
    }
};
