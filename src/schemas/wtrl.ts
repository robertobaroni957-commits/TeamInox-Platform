import { z } from 'zod';

export const WTRLTeamSchema = z.object({
  id: z.number(),
  name: z.string(),
  division: z.string().optional(),
  league: z.string().optional(),
  zrldivision: z.string().optional(),
  membersCount: z.number(),
  rounds: z.string().optional(),
  clubId: z.string().optional()
});

export const WTRLRiderSchema = z.object({
  name: z.string(),
  wtrlId: z.string(),
  category: z.string()
});

export const WTRLRosterSchema = z.object({
  teamId: z.number(),
  riders: z.array(WTRLRiderSchema)
});
