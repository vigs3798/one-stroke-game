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

  // Seed initial level solutions for admin
  const existingLevels = await storage.getLevels();
  if (existingLevels.length === 0) {
    // Level 1: 5 nodes (e.g., house shape)
    await storage.updateLevel({
      levelNumber: 1,
      solution: [0, 1, 2, 3, 0, 2, 4, 3], // Example path
      hints: ["Start at the bottom left", "Visit the roof last"],
    });
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

  app.get(api.admin.levels.list.path, async (req, res) => {
    try {
      const levels = await storage.getLevels();
      res.json(levels);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch levels" });
    }
  });

  app.post(api.admin.levels.update.path, async (req, res) => {
    try {
      const input = api.admin.levels.update.input.parse(req.body);
      const level = await storage.updateLevel(input);
      res.json(level);
    } catch (err) {
      res.status(500).json({ message: "Failed to update level" });
    }
  });

  app.get(api.admin.stats.get.path, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
