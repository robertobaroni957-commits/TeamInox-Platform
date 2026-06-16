/**
 * AI Narrative Analyzer - Phase 5.0
 * Extracts high-level insights from generated reports for UI injection.
 * Does not rewrite the report; provides a metadata layer for cards/summaries.
 */

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { report_text, round_id, team_id } = body;

        if (!report_text) {
            return new Response(JSON.stringify({ error: "Missing report_text" }), { status: 400 });
        }

        const aiModel = env.AI_MODEL || "gemini-1.5-flash";

        // 1. Specialized Extraction Prompt
        const systemPrompt = `
You are a Narrative Data Analyst. Your job is to extract specific insights from a cycling race report text.
Analyze the provided text and return ONLY a JSON object.

REQUIRED JSON FIELDS:
- hero: The name of the standout athlete and why (max 10 words).
- disappointment: Any mentioned underperformance or bad luck (max 10 words). If none, "Nessuna menzione".
- key_moment: The specific turning point of the race (max 15 words).
- momentum: Exactly one of "positive", "negative", or "neutral".
- rivalry: Name of a rival team mentioned or "Nessuno".
- confidence: A score from 0 to 1 for each field.

OUTPUT FORMAT:
{
  "hero": "...",
  "disappointment": "...",
  "key_moment": "...",
  "momentum": "...",
  "rivalry": "...",
  "confidence": { "hero": 0.9, ... }
}
`;

        // 2. AI Call for Extraction
        const aiRes = await fetch(env.AI_ENDPOINT, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.AI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: aiModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `REPORT TEXT:\n${report_text}` }
                ],
                temperature: 0.2, // Low temperature for extraction accuracy
                response_format: { type: "json_object" } // Force JSON
            })
        });

        if (!aiRes.ok) throw new Error("AI extraction failed");

        const aiData = await aiRes.json();
        const narrativeLayer = JSON.parse(aiData.choices?.[0]?.message?.content || "{}");

        // 3. Response Construction
        return new Response(JSON.stringify({
            success: true,
            round_id,
            team_id,
            narrative_layer: narrativeLayer,
            metadata: {
                engine: "Narrative Intelligence v1.0",
                extracted_at: new Date().toISOString()
            }
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ 
            error: "Narrative extraction failed", 
            message: error.message 
        }), { status: 500 });
    }
}
