import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed initial leaderboard data
  const existingScores = await storage.getTopScores();
  if (existingScores.length === 0) {
    await storage.createScore({ playerName: "EulerMaster", levelReached: 10 });
    await storage.createScore({ playerName: "PathFinder", levelReached: 8 });
    await storage.createScore({ playerName: "GraphNewbie", levelReached: 3 });
  }

  app.get(api.leaderboard.list.path, async (req, res) => {
    try {
      const scores = await storage.getTopScores();
      res.json(scores);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.post(api.leaderboard.create.path, async (req, res) => {
    try {
      const input = api.leaderboard.create.input.parse(req.body);
      const score = await storage.createScore(input);
      res.status(201).json(score);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to submit score" });
    }
  });

  return httpServer;
}
