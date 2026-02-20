import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  levelReached: integer("level_reached").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const levels = pgTable("levels", {
  id: serial("id").primaryKey(),
  levelNumber: integer("level_number").notNull().unique(),
  solution: jsonb("solution").$type<number[]>().notNull(), // Array of node IDs in order
  hints: text("hints").array(),
});

export const insertLeaderboardSchema = createInsertSchema(leaderboard).omit({ 
  id: true, 
  completedAt: true 
});

export const insertLevelSchema = createInsertSchema(levels).omit({ 
  id: true 
});

export type LeaderboardEntry = typeof leaderboard.$inferSelect;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardSchema>;

export type Level = typeof levels.$inferSelect;
export type InsertLevel = z.infer<typeof insertLevelSchema>;

export type LeaderboardResponse = LeaderboardEntry;
export type LeaderboardListResponse = LeaderboardEntry[];

export type LevelResponse = Level;
export type LevelListResponse = Level[];
