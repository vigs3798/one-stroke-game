import { z } from 'zod';
import { insertLeaderboardSchema, insertLevelSchema, type LeaderboardEntry, type Level, leaderboardSchema, levelSchema } from './schema';

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
        200: z.array(leaderboardSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/leaderboard' as const,
      input: insertLeaderboardSchema,
      responses: {
        201: leaderboardSchema,
        400: errorSchemas.validation,
      },
    },
  },
  admin: {
    levels: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/levels' as const,
        responses: {
          200: z.array(levelSchema),
        },
      },
      update: {
        method: 'POST' as const,
        path: '/api/admin/levels' as const,
        input: insertLevelSchema,
        responses: {
          200: levelSchema,
          400: errorSchemas.validation,
        },
      },
    },
    stats: {
      get: {
        method: 'GET' as const,
        path: '/api/admin/stats' as const,
        responses: {
          200: z.object({
            totalPlayers: z.number(),
            avgLevel: z.number(),
          }),
        },
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

export type LevelInput = z.infer<typeof api.admin.levels.update.input>;
export type LevelResponse = z.infer<typeof api.admin.levels.update.responses[200]>;
export type StatsResponse = z.infer<typeof api.admin.stats.get.responses[200]>;
