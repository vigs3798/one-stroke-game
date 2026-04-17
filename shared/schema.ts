import { z } from "zod";

export const insertLeaderboardSchema = z.object({
  playerName: z.string(),
  levelReached: z.number(),
  totalTimeTaken: z.number().default(0),
}).strict();

export const insertLevelSchema = z.object({
  levelNumber: z.number(),
  solution: z.array(z.number()),
  hints: z.array(z.string()).optional(),
}).strict();

export const leaderboardSchema = insertLeaderboardSchema.extend({
  id: z.string(),
  completedAt: z.coerce.date(),
});

export const levelSchema = insertLevelSchema.extend({
  id: z.string(),
});

export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardSchema>;

export type InsertLevel = z.infer<typeof insertLevelSchema>;
export type Level = z.infer<typeof levelSchema>;

export type LeaderboardResponse = LeaderboardEntry;
export type LeaderboardListResponse = LeaderboardEntry[];

export type LevelResponse = Level;
export type LevelListResponse = Level[];
