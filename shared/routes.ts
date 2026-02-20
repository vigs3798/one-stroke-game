import { z } from 'zod';
import { insertLeaderboardSchema, leaderboard } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  leaderboard: {
    list: {
      method: 'GET' as const,
      path: '/api/leaderboard' as const,
      responses: {
        200: z.array(z.custom<typeof leaderboard.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/leaderboard' as const,
      input: insertLeaderboardSchema,
      responses: {
        201: z.custom<typeof leaderboard.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type LeaderboardInput = z.infer<typeof api.leaderboard.create.input>;
export type LeaderboardResponse = z.infer<typeof api.leaderboard.create.responses[201]>;
export type LeaderboardListResponse = z.infer<typeof api.leaderboard.list.responses[200]>;
