import { RaceAnalysisInput, RaceNarrativeOutput } from '../../types/raceNarrative';
import { buildRacePrompt } from './buildRacePrompt';

/**
 * Generates and validates an AI race narrative.
 */
export async function generateRaceNarrative(
  input: RaceAnalysisInput
): Promise<RaceNarrativeOutput> {
  const prompt = buildRacePrompt(input);

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    // FIX: Extract wrapper data correctly
    const jsonResponse = await response.json();
    const rawNarrativeData = jsonResponse.data || jsonResponse;
    
    return parseAndValidateNarrative(JSON.stringify(rawNarrativeData));
  } catch (error) {
    console.error('[generateRaceNarrative] Error:', error);
    return getFallbackNarrative();
  }
}

function parseAndValidateNarrative(raw: string): RaceNarrativeOutput {
  try {
    // 1. Clean JSON extraction (handles markdown blocks)
    const jsonString = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    const data = JSON.parse(jsonString);

    // 1b. Adapt NarrativeResponse structure (backend contract) to RaceNarrativeOutput if needed
    if (data && Array.isArray(data.sections) && !data.highlights && !data.insights) {
      console.log("[parseAndValidateNarrative] Mapping NarrativeResponse structure to RaceNarrativeOutput...");
      data.highlights = data.sections
        .filter((s: any) => s.type === 'highlight' || s.type === 'performance')
        .map((s: any) => s.content);
      
      data.insights = [];
      const perfSection = data.sections.find((s: any) => s.type === 'performance');
      const analysisSection = data.sections.find((s: any) => s.type === 'analysis');
      
      if (perfSection) {
        data.insights.push({ category: 'performance', text: perfSection.content });
      }
      if (analysisSection) {
        data.insights.push({ category: 'strategy', text: analysisSection.content });
      }
      
      // Map stats to incidents or general context if stats exist
      if (Array.isArray(data.stats) && data.stats.length > 0) {
        const statsStr = data.stats.map((st: any) => `${st.label}: ${st.value}`).join(', ');
        data.insights.push({ category: 'incidents', text: `Riepilogo statistiche di gara: ${statsStr}` });
      }
    }

    // 2. Strict Validation (checks required keys are present/arrays)
    if (
      !data ||
      typeof data.title !== 'string' ||
      typeof data.summary !== 'string'
    ) {
      throw new Error('Invalid schema structure: title or summary is missing or not a string');
    }

    const rawHighlights = Array.isArray(data.highlights) ? data.highlights : [];
    const rawInsights = Array.isArray(data.insights) ? data.insights : [];

    // 3. Normalization & Category Enforcement
    // We enforce that the returned insights have exactly 'performance', 'strategy', and 'incidents'
    const requiredCategories = ['performance', 'strategy', 'incidents'] as const;
    const insightsList: { category: 'performance' | 'strategy' | 'incidents'; text: string }[] = [];

    for (const cat of requiredCategories) {
      const existing = rawInsights.find((i: any) => i && i.category === cat);
      if (existing && typeof existing.text === 'string') {
        insightsList.push({
          category: cat,
          text: existing.text
        });
      } else {
        // Safe default instead of throwing and failing the pipeline
        insightsList.push({
          category: cat,
          text: `Nessuna analisi di ${cat} disponibile per questa sessione.`
        });
      }
    }

    const normalized: RaceNarrativeOutput = {
      title: data.title,
      summary: data.summary.substring(0, 150),
      highlights: rawHighlights.slice(0, 5).map((h: any) => String(h)),
      insights: insightsList,
      metadata: {
        grounded: !!(data.metadata?.grounded ?? data.metadata?.confidence),
        model_version: data.metadata?.model_version || 'unknown'
      }
    };

    return normalized;
  } catch (error) {
    console.warn('[parseAndValidateNarrative] Parsing failed, using fallback:', error);
    return getFallbackNarrative();
  }
}

function getFallbackNarrative(): RaceNarrativeOutput {
  return {
    title: "Race Analysis Unavailable",
    summary: "Unable to generate narrative from AI output",
    highlights: [],
    insights: [],
    metadata: {
      grounded: false,
      model_version: "error_fallback"
    }
  };
}
