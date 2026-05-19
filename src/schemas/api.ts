import { z } from 'zod';

export const SeasonStatusSchema = z.object({
  seasonId: z.number(),
  status: z.string(),
  logs: z.array(z.object({
    action: z.string(),
    status: z.string(),
    timestamp: z.string()
  })),
  lifecycle: z.object({
    name: z.string(),
    lastUpdated: z.string().nullable(),
    isImporting: z.boolean(),
    isReady: z.boolean()
  }),
  auth: z.string(),
  traceId: z.string()
});

export const BootstrapRequestSchema = z.object({
  name: z.string(),
  externalId: z.number(),
  roundCount: z.number().optional().default(4)
});

export const TeamImportRequestSchema = z.object({
  teams: z.array(z.object({
    externalId: z.number(),
    name: z.string(),
    division: z.string(),
    league: z.string(),
    zrldivision: z.string(),
    membersCount: z.number(),
    rounds: z.array(z.string()),
    isDev: z.boolean()
  }))
});
