import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchImages } from "./imageSearch";
import { searchAllMuseums, searchMetMuseum } from "./museumSearch";
import { insertSavedImageSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // AI-powered image search (Perplexity + OpenAI)
  app.post("/api/search-images", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query string is required" });
      }
      const results = await searchImages(query);
      res.json({ results, source: "ai" });
    } catch (error: any) {
      console.error("Image search error:", error);
      res.status(500).json({ error: "Failed to search for images" });
    }
  });

  // Direct museum API search (Met, Smithsonian, Wikimedia)
  app.post("/api/search-museums", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query string is required" });
      }
      const results = await searchAllMuseums(query);
      res.json({ results, source: "museums" });
    } catch (error: any) {
      console.error("Museum search error:", error);
      res.status(500).json({ error: "Failed to search museums" });
    }
  });

  // Batch search - run multiple queries at once
  app.post("/api/batch-search", async (req, res) => {
    try {
      const { queries, searchType = "all" } = req.body;
      if (!Array.isArray(queries) || queries.length === 0) {
        return res.status(400).json({ error: "Array of queries is required" });
      }
      if (queries.length > 20) {
        return res.status(400).json({ error: "Maximum 20 queries per batch" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const allResults: any[] = [];
      let aborted = false;

      req.on("close", () => { aborted = true; });

      for (let i = 0; i < queries.length; i++) {
        if (aborted) break;

        const query = queries[i];
        res.write(`data: ${JSON.stringify({ type: "progress", index: i, total: queries.length, query })}\n\n`);

        try {
          let results: any[] = [];

          if (searchType === "museums" || searchType === "all") {
            const museumResults = await searchAllMuseums(query);
            results.push(...museumResults.map(r => ({ ...r, searchType: "museum" })));
          }

          if (!aborted && (searchType === "ai" || searchType === "all")) {
            const aiResults = await searchImages(query);
            results.push(...aiResults.map(r => ({ ...r, searchType: "ai" })));
          }

          allResults.push({ query, results, count: results.length });
          if (!aborted) {
            res.write(`data: ${JSON.stringify({ type: "result", index: i, query, results, count: results.length })}\n\n`);
          }
        } catch (err: any) {
          allResults.push({ query, results: [], count: 0, error: err.message });
          if (!aborted) {
            res.write(`data: ${JSON.stringify({ type: "error", index: i, query, error: err.message })}\n\n`);
          }
        }
      }

      if (!aborted) {
        res.write(`data: ${JSON.stringify({ type: "complete", totalQueries: queries.length, totalImages: allResults.reduce((sum, r) => sum + r.count, 0) })}\n\n`);
      }
      res.end();
    } catch (error: any) {
      console.error("Batch search error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Batch search failed" });
      }
    }
  });

  // AI image generation
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, size = "1024x1024" } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt: `Archaeological museum photograph style: ${prompt}. Highly detailed, museum lighting, educational reference quality.`,
        n: 1,
        size: size as "1024x1024",
      });

      const imageData = response.data[0];
      res.json({
        b64_json: imageData.b64_json,
        prompt,
      });
    } catch (error: any) {
      console.error("Image generation error:", error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  });

  // Saved images CRUD
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

  app.post("/api/saved-images/batch", async (req, res) => {
    try {
      const { images } = req.body;
      if (!Array.isArray(images)) {
        return res.status(400).json({ error: "Array of images is required" });
      }

      const saved = [];
      for (const image of images) {
        try {
          const parsed = insertSavedImageSchema.parse(image);
          const result = await storage.saveImage(parsed);
          saved.push(result);
        } catch (err) {
          // skip invalid
        }
      }

      res.status(201).json({ saved, count: saved.length });
    } catch (error: any) {
      console.error("Error batch saving:", error);
      res.status(500).json({ error: "Batch save failed" });
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
