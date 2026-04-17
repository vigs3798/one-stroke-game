import { type InsertLeaderboardEntry, type LeaderboardEntry, type Level as LevelType, type InsertLevel } from "@shared/schema";
import { Leaderboard, Level } from "./db";

export interface IStorage {
  getTopScores(): Promise<LeaderboardEntry[]>;
  createScore(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry>;
  getLevels(): Promise<LevelType[]>;
  updateLevel(level: InsertLevel): Promise<LevelType>;
  getAdminStats(): Promise<{ totalPlayers: number; avgLevel: number }>;
}

export class MongoStorage implements IStorage {
  constructor() {
    this.seedLevels();
  }

  private async seedLevels() {
    const levelSolutions: { [key: number]: { solution: number[], hints: string[] } } = {
      1: {
        solution: [0, 1, 2, 3, 0, 4, 1, 3, 4, 2, 0],
        hints: ["All nodes are degree 4. You can start anywhere and return to start."]
      },
      2: {
        solution: [0, 3, 4, 2, 3, 1, 2, 0, 1],
        hints: ["Odd nodes are 0 and 1. Start at 0 and end at 1."]
      },
      3: {
        solution: [0, 1, 2, 0, 5, 2, 3, 4, 2],
        hints: ["Odd nodes are 0 and 2. Trace the left loop, then the right."]
      },
      4: {
        solution: [0, 2, 4, 1, 3, 0, 1, 2, 3, 4, 0],
        hints: ["Classical Pentagram. Trace the star then the circle."]
      },
      5: {
        solution: [0, 4, 3, 0, 1, 4, 5, 1, 2, 5, 3, 2],
        hints: ["Odd nodes are 0 and 2. Start at the top and weave through the inner diamond before finishing at the base."]
      },
      6: {
        solution: [0, 1, 2, 3, 4, 5, 0, 3, 6, 1, 4, 6, 0],
        hints: ["All nodes are even degree. Use the center node 6 to bridge the segments."]
      },
      7: {
        solution: [1, 6, 2, 5, 0, 1, 2, 4, 3, 0, 2, 3],
        hints: ["Odd nodes are 1 and 3. Start at 1, loop through the hub, and end at 3."]
      },
      8: {
        solution: [2, 0, 1, 3, 4, 2, 3, 5, 1, 2, 5],
        hints: ["Odd nodes are 2 and 5. Carefully manage the central intersections."]
      },
      9: {
        solution: [0, 5, 4, 6, 0, 3, 2, 1, 4, 0, 1],
        hints: ["Odd nodes are 0 and 1. Use the extensions (5 and 6) early in the path."]
      },
      10: {
        solution: [0, 1, 2, 3, 4, 5, 0, 6, 1, 4, 6, 2, 5, 6, 3, 0],
        hints: ["The finale! All even nodes. Plan a route that visits the center hub frequently."]
      },
    };

    for (const [lvl, data] of Object.entries(levelSolutions)) {
      const levelNumber = parseInt(lvl);
      const existing = await Level.findOne({ levelNumber });
      if (!existing) {
        await Level.create({
          levelNumber,
          solution: data.solution,
          hints: data.hints
        });
      }
    }
  }

  async getTopScores(): Promise<LeaderboardEntry[]> {
    const scores = await Leaderboard.find()
      .sort({ levelReached: -1, totalTimeTaken: 1 })
      .limit(10);
    
    return scores.map(s => ({
      id: (s as any)._id.toString(), // Convert ObjectId to string
      playerName: s.playerName,
      levelReached: s.levelReached,
      totalTimeTaken: s.totalTimeTaken,
      completedAt: s.completedAt
    })) as unknown as LeaderboardEntry[];
  }

  async createScore(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    const score = await Leaderboard.create(entry);
    return {
      id: (score as any)._id.toString(),
      playerName: score.playerName,
      levelReached: score.levelReached,
      totalTimeTaken: score.totalTimeTaken,
      completedAt: score.completedAt
    } as unknown as LeaderboardEntry;
  }

  async getLevels(): Promise<LevelType[]> {
    const levels = await Level.find().sort({ levelNumber: 1 });
    return levels.map(l => ({
      id: (l as any)._id.toString(),
      levelNumber: l.levelNumber,
      solution: l.solution,
      hints: l.hints
    })) as unknown as LevelType[];
  }

  async updateLevel(entry: InsertLevel): Promise<LevelType> {
    const level = await Level.findOneAndUpdate(
      { levelNumber: entry.levelNumber },
      { ...entry },
      { upsert: true, new: true }
    );
    return {
      id: (level as any)._id.toString(),
      levelNumber: level.levelNumber,
      solution: level.solution,
      hints: level.hints
    } as unknown as LevelType;
  }

  async getAdminStats(): Promise<{ totalPlayers: number; avgLevel: number }> {
    const totalPlayers = await Leaderboard.countDocuments();
    const result = await Leaderboard.aggregate([
      {
        $group: {
          _id: null,
          avgLevel: { $avg: "$levelReached" }
        }
      }
    ]);

    return {
      totalPlayers,
      avgLevel: result[0]?.avgLevel || 0,
    };
  }
}

export const storage = new MongoStorage();
