import { RoundScheduleParserService } from '../RoundScheduleParserService';

function runTests() {
  const testInput = `
Round 1
16th Sep - 7th Oct

Round 2
4th Nov - 9th Dec

Round 3
6th Jan - 10th Feb

Round 4
7th - 28th Apr
  `;

  console.log("Starting RoundScheduleParserService Tests...");
  
  try {
    const rounds = RoundScheduleParserService.parse(testInput, 2026, "zrl_2026_27");
    
    console.log(`Parsed ${rounds.length} rounds.`);

    // Assertions
    if (rounds.length !== 4) throw new Error("Expected 4 rounds");
    
    // Round 1: 2026-09-16 to 2026-10-07
    if (rounds[0].starts_at !== '2026-09-16') throw new Error(`R1 Start mismatch: ${rounds[0].starts_at}`);
    if (rounds[0].ends_at !== '2026-10-07') throw new Error(`R1 End mismatch: ${rounds[0].ends_at}`);
    
    // Round 2: 2026-11-04 to 2026-12-09
    if (rounds[1].starts_at !== '2026-11-04') throw new Error(`R2 Start mismatch: ${rounds[1].starts_at}`);
    if (rounds[1].ends_at !== '2026-12-09') throw new Error(`R2 End mismatch: ${rounds[1].ends_at}`);
    
    // Round 3: 2027-01-06 to 2027-02-10 (Year Inference check)
    if (rounds[2].starts_at !== '2027-01-06') throw new Error(`R3 Start mismatch: ${rounds[2].starts_at}`);
    if (rounds[2].ends_at !== '2027-02-10') throw new Error(`R3 End mismatch: ${rounds[2].ends_at}`);

    // Round 4: 2027-04-07 to 2027-04-28 (Missing month inference check)
    if (rounds[3].starts_at !== '2027-04-07') throw new Error(`R4 Start mismatch: ${rounds[3].starts_at}`);
    if (rounds[3].ends_at !== '2027-04-28') throw new Error(`R4 End mismatch: ${rounds[3].ends_at}`);

    console.log("✅ All tests passed!");
    console.log(JSON.stringify(rounds, null, 2));

  } catch (error: any) {
    console.error("❌ Test failed:");
    console.error(error.message);
  }
}

// In a real environment, this would be a Vitest/Jest test
// runTests(); 
