import { buildRaceAnalysisInput } from './buildRaceAnalysisInput';
import { RaceAnalysisInput } from '../../types/raceNarrative';

export function parseRawRaceFile(rawJson: any): RaceAnalysisInput {
  // Handle array structure [ { key: "...", data: { success: true, payload: { ... } } } ]
  const items = Array.isArray(rawJson) ? rawJson : [rawJson];
  
  // Extract payload (try payload, then data, then fallback)
  const flattenedData = items.map(item => item.data?.payload || item.data || {})[0];
  
  return buildRaceAnalysisInput(flattenedData);
}
