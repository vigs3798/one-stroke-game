import { db } from "./db";
import { leaderboard, type InsertLeaderboardEntry, type LeaderboardEntry } from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  getTopScores(): Promise<LeaderboardEntry[]>;
  createScore(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry>;
}

export class DatabaseStorage implements IStorage {
  async getTopScores(): Promise<LeaderboardEntry[]> {
    return await db.select().from(leaderboard).orderBy(desc(leaderboard.levelReached)).limit(100);
  }

  async createScore(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    const [score] = await db.insert(leaderboard).values(entry).returning();
    return score;
  }
}

export const storage = new DatabaseStorage();
