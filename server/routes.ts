import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchImages } from "./imageSearch";
import { searchAllMuseums, searchMetMuseum, searchWikimediaCommons, searchSmithsonian } from "./museumSearch";
import { insertSavedImageSchema, insertSessionSchema, insertConceptCardSchema, insertCandidateSchema } from "@shared/schema";
import { extractConcepts, generateQueryPack } from "./conceptExtractor";
import { checkBackendStatus, sendResearchIngest, buildHandoffPacket } from "./backendAdapter";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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
      res.json({ results, source: "ai" });
    } catch (error: any) {
      console.error("Image search error:", error);
      res.status(500).json({ error: "Failed to search for images" });
    }
  });

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

  // ====== TEXTREADER ENDPOINTS ======

  app.get("/api/textreader/backend-status", async (_req, res) => {
    const status = await checkBackendStatus();
    res.json(status);
  });

  app.post("/api/textreader/sessions", async (req, res) => {
    try {
      const parsed = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(parsed);
      res.status(201).json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create session" });
    }
  });

  app.get("/api/textreader/sessions", async (_req, res) => {
    try {
      const sessions = await storage.getSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get("/api/textreader/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const session = await storage.getSession(id);
      if (!session) return res.status(404).json({ error: "Session not found" });
      const concepts = await storage.getConceptCards(id);
      res.json({ session, concepts });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.delete("/api/textreader/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      await storage.deleteSession(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  app.post("/api/textreader/extract", async (req, res) => {
    try {
      const { sessionId, text, maxConcepts = 8 } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      const extracted = await extractConcepts(text, maxConcepts);

      if (sessionId) {
        const cards = [];
        for (const concept of extracted) {
          const card = await storage.createConceptCard({
            sessionId,
            conceptId: concept.concept_id,
            label: concept.label,
            description: concept.description,
            visualType: concept.visual_type,
            priority: concept.priority,
            state: "parsed",
            searchQueries: concept.search_queries,
            aiPrompts: concept.ai_prompts,
            diagramPrompt: concept.diagram_prompt,
            tags: concept.tags,
            sourceMode: "open_web_fast",
            sourceType: "open_web",
            accuracyStatus: "unreviewed",
          });
          cards.push(card);
        }
        return res.json({ concepts: cards });
      }

      res.json({ concepts: extracted });
    } catch (error: any) {
      console.error("Concept extraction error:", error);
      res.status(500).json({ error: "Failed to extract concepts" });
    }
  });

  app.patch("/api/textreader/concepts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const updated = await storage.updateConceptCard(id, req.body);
      if (!updated) return res.status(404).json({ error: "Concept not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update concept" });
    }
  });

  app.delete("/api/textreader/concepts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      await storage.deleteConceptCard(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete concept" });
    }
  });

  app.post("/api/textreader/concepts/:id/search", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

      const card = await storage.getConceptCard(id);
      if (!card) return res.status(404).json({ error: "Concept not found" });

      const { sourceMode = card.sourceMode } = req.body;

      await storage.updateConceptCard(id, { state: "searching" });

      const queries = card.searchQueries || [card.label];
      const allCandidates = [];

      for (const query of queries.slice(0, 3)) {
        try {
          let results: any[] = [];

          if (sourceMode === "open_web_fast" || sourceMode === "hybrid") {
            const [museumResults, aiResults] = await Promise.all([
              searchAllMuseums(query),
              searchImages(query),
            ]);
            results.push(
              ...museumResults.map(r => ({ ...r, sourceType: "museum" as const })),
              ...aiResults.map(r => ({ ...r, sourceType: "open_web" as const })),
            );
          } else if (sourceMode === "museum_context") {
            const museumResults = await searchAllMuseums(query);
            results.push(...museumResults.map(r => ({ ...r, sourceType: "museum" as const })));
          } else if (sourceMode === "ai_reconstruction") {
            const aiResults = await searchImages(query);
            results.push(...aiResults.map(r => ({ ...r, sourceType: "open_web" as const })));
          }

          for (const r of results) {
            const candidate = await storage.createCandidate({
              conceptCardId: id,
              imageUrl: r.url,
              title: r.title || null,
              source: r.source || null,
              objectUrl: r.objectUrl || null,
              sourceType: r.sourceType || "open_web",
              accuracyStatus: "unreviewed",
              approved: "pending",
              metadata: null,
            });
            allCandidates.push(candidate);
          }
        } catch (err) {
          console.error(`Search failed for query "${query}":`, err);
        }
      }

      await storage.updateConceptCard(id, {
        state: allCandidates.length > 0 ? "candidates_ready" : "query_ready",
      });

      res.json({ candidates: allCandidates, count: allCandidates.length });
    } catch (error: any) {
      console.error("Concept search error:", error);
      res.status(500).json({ error: "Failed to search for concept" });
    }
  });

  app.get("/api/textreader/concepts/:id/candidates", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const candidates = await storage.getCandidates(id);
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch candidates" });
    }
  });

  app.patch("/api/textreader/candidates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const updated = await storage.updateCandidate(id, req.body);
      if (!updated) return res.status(404).json({ error: "Candidate not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update candidate" });
    }
  });

  app.post("/api/textreader/concepts/:id/generate-queries", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

      const card = await storage.getConceptCard(id);
      if (!card) return res.status(404).json({ error: "Concept not found" });

      const pack = await generateQueryPack(card.label, card.description || "");

      const updated = await storage.updateConceptCard(id, {
        searchQueries: pack.queries,
        aiPrompts: pack.prompts,
        state: "query_ready",
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to generate queries" });
    }
  });

  app.post("/api/textreader/handoff", async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) return res.status(400).json({ error: "sessionId is required" });

      const session = await storage.getSession(sessionId);
      if (!session) return res.status(404).json({ error: "Session not found" });

      const concepts = await storage.getConceptCards(sessionId);
      const readyConcepts = concepts.filter(c => c.state === "ready_for_handoff");

      const allCandidates = [];
      for (const concept of readyConcepts) {
        const candidates = await storage.getCandidates(concept.id);
        allCandidates.push(...candidates);
      }

      const packet = buildHandoffPacket(session, readyConcepts, allCandidates);

      const result = await sendResearchIngest({
        title: session.title,
        excerpt: session.rawText,
        sourceUrl: session.sourceUrl || undefined,
        citation: session.citation || undefined,
        tags: {
          grade: session.grade,
          week: session.week,
          section: session.sectionId,
        },
        autoSearchImages: false,
        maxConcepts: readyConcepts.length,
      });

      if (result.ok) {
        for (const concept of readyConcepts) {
          await storage.updateConceptCard(concept.id, { state: "sent_to_backend" });
        }
        res.json({ success: true, backendResponse: result.data, packet });
      } else {
        res.json({ success: false, error: result.error, packet, fallbackExport: true });
      }
    } catch (error: any) {
      console.error("Handoff error:", error);
      res.status(500).json({ error: "Handoff failed" });
    }
  });

  return httpServer;
}
