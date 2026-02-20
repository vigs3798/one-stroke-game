import { db } from "./db";
import { leaderboard, levels, type InsertLeaderboardEntry, type LeaderboardEntry, type Level, type InsertLevel } from "@shared/schema";
import { desc, eq, avg, count } from "drizzle-orm";

export interface IStorage {
  getTopScores(): Promise<LeaderboardEntry[]>;
  createScore(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry>;
  getLevels(): Promise<Level[]>;
  updateLevel(level: InsertLevel): Promise<Level>;
  getAdminStats(): Promise<{ totalPlayers: number; avgLevel: number }>;
}

export class DatabaseStorage implements IStorage {
  async getTopScores(): Promise<LeaderboardEntry[]> {
    return await db.select().from(leaderboard).orderBy(desc(leaderboard.levelReached)).limit(100);
  }

  async createScore(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    const [score] = await db.insert(leaderboard).values(entry).returning();
    return score;
  }

  async getLevels(): Promise<Level[]> {
    return await db.select().from(levels).orderBy(levels.levelNumber);
  }

  async updateLevel(entry: InsertLevel): Promise<Level> {
    const [level] = await db
      .insert(levels)
      .values(entry)
      .onConflictDoUpdate({
        target: levels.levelNumber,
        set: { solution: entry.solution, hints: entry.hints },
      })
      .returning();
    return level;
  }

  async getAdminStats(): Promise<{ totalPlayers: number; avgLevel: number }> {
    const [stats] = await db
      .select({
        totalPlayers: count(leaderboard.id),
        avgLevel: avg(leaderboard.levelReached),
      })
      .from(leaderboard);
    return {
      totalPlayers: Number(stats?.totalPlayers || 0),
      avgLevel: Number(stats?.avgLevel || 0),
    };
  }
}

export const storage = new DatabaseStorage();
