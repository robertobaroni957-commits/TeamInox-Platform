/**
 * AI Social Formatter - Phase 6.0
 * Repackages long-form reports into social-media optimized formats.
 * Strictly formatting and summarization logic via AI.
 */

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { report_text, team_name, round_name } = body;

        if (!report_text) {
            return new Response(JSON.stringify({ error: "Missing report_text" }), { status: 400 });
        }

        const aiModel = env.AI_MODEL || "gemini-1.5-flash";

        // 1. Specialized Formatting Prompt
        const systemPrompt = `
You are a Social Media Manager for a pro cycling team. 
Repackage the provided race report into three distinct formats: Twitter, Discord, and Web SEO.

REQUIREMENTS:
- Twitter: Max 260 characters, punchy, use 2-3 relevant emojis, include placeholders like [LINK].
- Discord: Structured Markdown. Sections: "Race Summary", "Top Performer", "Key Moment".
- SEO: Professional meta title and description (max 160 chars) plus 5 keywords.
- Summary: 1 headline, 3 bullet insights, 1 closing line.

OUTPUT FORMAT:
{
  "twitter": "...",
  "discord": "...",
  "seo": {
    "title": "...",
    "description": "...",
    "keywords": ["...", "..."]
  },
  "summary": {
    "headline": "...",
    "insights": ["...", "...", "..."],
    "closing": "..."
  }
}
`;

        const userPrompt = `
TEAM: ${team_name || "Team Inox"}
EVENT: ${round_name || "ZRL Race"}
REPORT CONTENT:
${report_text}

Generate the social pack now. Return ONLY JSON.
`;

        // 2. AI Call
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
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.6,
                response_format: { type: "json_object" }
            })
        });

        if (!aiRes.ok) throw new Error("AI formatting failed");

        const aiData = await aiRes.json();
        const socialPack = JSON.parse(aiData.choices?.[0]?.message?.content || "{}");

        // 3. Final Response
        return new Response(JSON.stringify({
            success: true,
            social_pack: socialPack,
            metadata: {
                generated_at: new Date().toISOString(),
                engine: "Social Automation v1.0"
            }
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ 
            error: "Social formatting failed", 
            message: error.message 
        }), { status: 500 });
    }
}
