import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  levelReached: integer("level_reached").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertLeaderboardSchema = createInsertSchema(leaderboard).omit({ 
  id: true, 
  completedAt: true 
});

export type LeaderboardEntry = typeof leaderboard.$inferSelect;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardSchema>;

export type LeaderboardResponse = LeaderboardEntry;
export type LeaderboardListResponse = LeaderboardEntry[];
