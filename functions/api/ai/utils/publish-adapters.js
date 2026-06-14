/**
 * AI Publish Adapters - Utility
 * Handles formatting for different distribution channels.
 */

export function extractHighlights(content, count = 3) {
    // Basic extraction: find paragraphs or sentences with numbers/bold text
    const sentences = content.split(/[.!?]\s+/);
    const highlights = sentences
        .filter(s => s.includes('**') || /\d+/.test(s))
        .map(s => s.trim().replace(/\*\*/g, ''))
        .filter(s => s.length > 20 && s.length < 150)
        .slice(0, count);
    
    return highlights.length > 0 ? highlights : ["Analisi dettagliata disponibile in dashboard."];
}

export function formatDiscord(report, metadata, context) {
    const title = report.match(/^# (.*)/m)?.[1] || "Nuovo Report Gara AI";
    const highlights = extractHighlights(report);
    
    return {
        username: "InoxTeam AI Reporter",
        embeds: [{
            title: `🏆 ${title}`,
            color: 0x4F46E5, // Indigo
            fields: [
                { name: "🔍 Punti Chiave", value: highlights.map(h => `• ${h}`).join('\n') },
                { name: "📊 Qualità Analisi", value: `${metadata.quality_score}/100`, inline: true },
                { name: "🤖 Modello", value: metadata.variant || "Standard", inline: true }
            ],
            footer: { text: "TeamInox Platform • Generato via Gemini 1.5 Flash" },
            timestamp: new Date().toISOString()
        }]
    };
}
