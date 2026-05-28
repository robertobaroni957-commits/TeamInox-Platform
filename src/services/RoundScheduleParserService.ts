import { RoundDraft } from './types';

const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

export class RoundScheduleParserService {
  /**
   * Parses a raw text schedule into structured RoundDraft objects.
   * 
   * Example Format:
   * Round 1
   * 16th Sep - 7th Oct
   * 
   * @param text Raw schedule text
   * @param baseYear The year of the first round
   * @param seasonCode Optional metadata for the rounds
   */
  static parse(text: string, baseYear: number, seasonCode?: string): RoundDraft[] {
    const rounds: RoundDraft[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let currentYear = baseYear;
    let prevStartMonth = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const roundMatch = line.match(/Round\s+(\d+)/i);
      
      if (roundMatch && i + 1 < lines.length) {
        const roundNumber = parseInt(roundMatch[1]);
        const dateLine = lines[i + 1];
        
        // Try parsing the date line
        const dateRegex = /(\d+)(?:st|nd|rd|th)?\s*([A-Za-z]+)?\s*-\s*(\d+)(?:st|nd|rd|th)?\s+([A-Za-z]+)/i;
        const dateMatch = dateLine.match(dateRegex);
        
        if (dateMatch) {
            const startDay = parseInt(dateMatch[1]);
            const startMonthStr = (dateMatch[2] || dateMatch[4]).toLowerCase().substring(0, 3);
            const endDay = parseInt(dateMatch[3]);
            const endMonthStr = dateMatch[4].toLowerCase().substring(0, 3);

            const startMonthIndex = MONTH_MAP[startMonthStr];
            const endMonthIndex = MONTH_MAP[endMonthStr];

            if (startMonthIndex !== undefined && endMonthIndex !== undefined) {
                // Year Inference
                if (prevStartMonth !== -1 && startMonthIndex < prevStartMonth) {
                    currentYear++;
                }
                prevStartMonth = startMonthIndex;

                const startDate = new Date(currentYear, startMonthIndex, startDay);
                let endYear = currentYear;
                if (endMonthIndex < startMonthIndex) endYear++;
                const endDate = new Date(endYear, endMonthIndex, endDay);

                rounds.push({
                    round_number: roundNumber,
                    name: `Round ${roundNumber}`,
                    starts_at: startDate.toISOString().split('T')[0],
                    ends_at: endDate.toISOString().split('T')[0],
                    season_code: seasonCode,
                    status: "CREATED"
                });
                
                i++; // Skip date line
            }
        }
      }
    }

    return rounds;
  }
}
