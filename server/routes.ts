import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchImages } from "./imageSearch";
import { insertSavedImageSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/search-images", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query string is required" });
      }

      const results = await searchImages(query);
      res.json({ results });
    } catch (error: any) {
      console.error("Image search error:", error);
      res.status(500).json({ error: "Failed to search for images" });
    }
  });

  app.get("/api/saved-images", async (_req, res) => {
    try {
      const images = await storage.getSavedImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching saved images:", error);
      res.status(500).json({ error: "Failed to fetch saved images" });
    }
  });

  app.post("/api/saved-images", async (req, res) => {
    try {
      const parsed = insertSavedImageSchema.parse(req.body);
      const saved = await storage.saveImage(parsed);
      res.status(201).json(saved);
    } catch (error: any) {
      console.error("Error saving image:", error);
      res.status(400).json({ error: error.message || "Failed to save image" });
    }
  });

  app.delete("/api/saved-images/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      await storage.deleteSavedImage(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting saved image:", error);
      res.status(500).json({ error: "Failed to delete saved image" });
    }
  });

  return httpServer;
}
