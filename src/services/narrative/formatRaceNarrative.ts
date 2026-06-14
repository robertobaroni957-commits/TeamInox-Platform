import { RaceNarrativeOutput } from '../../types/raceNarrative';

/**
 * Transforms RaceNarrativeOutput into a UI-ready, standardized object.
 */
export function formatRaceNarrative(
  output: RaceNarrativeOutput,
  // Passing context metadata is required for the header and title normalization
  context?: { raceName?: string; date?: string; trackName?: string; teamName?: string }
): {
  header: string;
  title: string;
  summary: string;
  highlights: string[];
  insights: string[];
} {
  // 1. Header Normalization
  const raceName = context?.raceName || 'Unknown';
  const date = context?.date || 'Unknown';
  const trackName = context?.trackName || 'Unknown';
  const header = `Race ${raceName}, ${date}, ${trackName}`;

  // 2. Title Normalization
  const teamName = context?.teamName || '';
  const title = teamName 
    ? `${teamName} – Race Analysis: Performance Report` 
    : "Race Analysis Report";

  // 3. Summary Cleanup
  const summary = (output.summary || '').trim().substring(0, 150);

  // 4. Highlights Normalization
  const highlights = Array.from(new Set(output.highlights))
    .slice(0, 5)
    .map(h => h.charAt(0).toUpperCase() + h.slice(1));

  // 5. Insights Flattening
  const insights = output.insights.map(i => {
    const category = i.category.charAt(0).toUpperCase() + i.category.slice(1);
    return `${category}: ${i.text}`;
  });

  return {
    header,
    title,
    summary,
    highlights,
    insights
  };
}
