import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchImages } from "./imageSearch";
import { searchAllMuseums, searchMetMuseum, searchWikimediaCommons, searchSmithsonian } from "./museumSearch";
import { searchAllProviders, searchGoogleCSE, searchWikimediaProvider, searchMetMuseumProvider, searchOpenverse } from "./providers/index";
import {
  insertSavedImageSchema, insertSessionSchema, insertConceptCardSchema, insertCandidateSchema,
  insertEntitySchema, insertAssetSchema, insertDocumentSchema,
} from "@shared/schema";
import { extractConcepts, generateQueryPack } from "./conceptExtractor";
import { checkBackendStatus, sendResearchIngest, buildHandoffPacket, sendHandoffPacket } from "./backendAdapter";
import { extractEntitiesFromText } from "./entityExtractor";
import { seedTimelineArtifacts, TIMELINE_NODES, CONVERGENCE_LINKS } from "./artifactSeeder";
import { seedBraidPoints } from "./braidSeeder";
import { generateGeminiImage, searchGeminiForArtifact } from "./providers/gemini";
import { searchPerplexityForArtifact } from "./providers/perplexity";
import { exec } from "child_process";
import { promisify } from "util";
import OpenAI from "openai";
import multer from "multer";

const execAsync = promisify(exec);

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const OVERLAY_TYPES = new Set(["geometry", "math", "motif", "ritual", "GEOMETRY", "MATH", "MOTIF", "RITUAL"]);

const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 10 },
});

function inferRequirementKind(entityType: string): "SOURCE_ONLY" | "SOURCE_PLUS_OVERLAY" {
  if (OVERLAY_TYPES.has(entityType)) return "SOURCE_PLUS_OVERLAY";
  return "SOURCE_ONLY";
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/quick-search/images", async (req, res) => {
    try {
      const q = req.query.q as string;
      if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: "Query too short" });
      }
      const results = await searchAllMuseums(q);
      res.json({ results, query: q, total: results.length });
    } catch (err) {
      console.error("Quick image search error:", err);
      res.status(500).json({ error: "Search failed", results: [] });
    }
  });

  app.post("/api/search-images", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Query string is required" });
      }
      const results = await searchImages(query);
      res.json({ results, source: "ai" });
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : "Unknown error";
          allResults.push({ query, results: [], count: 0, error: errMsg });
          if (!aborted) {
            res.write(`data: ${JSON.stringify({ type: "error", index: i, query, error: errMsg })}\n\n`);
          }
        }
      }

      if (!aborted) {
        res.write(`data: ${JSON.stringify({ type: "complete", totalQueries: queries.length, totalImages: allResults.reduce((sum, r) => sum + r.count, 0) })}\n\n`);
      }
      res.end();
    } catch (error: unknown) {
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

      const imageData = response.data?.[0];
      res.json({
        b64_json: imageData?.b64_json,
        prompt,
      });
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error("Error saving image:", error);
      res.status(400).json({ error: (error as Error).message || "Failed to save image" });
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      res.status(400).json({ error: (error as Error).message || "Failed to create session" });
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

  app.patch("/api/textreader/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const patchSchema = insertSessionSchema.partial().pick({
        title: true,
        rawText: true,
        citation: true,
        sourceUrl: true,
        grade: true,
        week: true,
        sectionId: true,
        sourceMode: true,
      });
      const parsed = patchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid session update", details: parsed.error.flatten() });
      }
      const updated = await storage.updateSession(id, parsed.data);
      if (!updated) return res.status(404).json({ error: "Session not found" });
      res.json(updated);
    } catch (error: unknown) {
      res.status(400).json({ error: (error as Error).message || "Failed to update session" });
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      res.status(400).json({ error: (error as Error).message || "Failed to update concept" });
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

      await storage.updateConceptCard(id, { state: "searching", sourceMode });

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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      res.status(400).json({ error: (error as Error).message || "Failed to update candidate" });
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
    } catch (error: unknown) {
      res.status(500).json({ error: "Failed to generate queries" });
    }
  });

  app.post("/api/textreader/concepts/:id/generate-image", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

      const card = await storage.getConceptCard(id);
      if (!card) return res.status(404).json({ error: "Concept not found" });

      const { prompt, style = "museum_photograph", provider = "auto" } = req.body;
      const aiPrompt = prompt || (card.aiPrompts?.[0]) || card.label;

      let imageUrl: string | null = null;
      let modelLabel = "";

      const useOpenAI = provider === "openai" ||
        (provider === "auto" && !process.env.Google_AI && process.env.AI_INTEGRATIONS_OPENAI_API_KEY);

      if (!useOpenAI) {
        const geminiResult = await generateGeminiImage(
          aiPrompt,
          style as "museum_photograph" | "reconstruction" | "diagram" | "illustration"
        );
        if (geminiResult) {
          imageUrl = geminiResult.url;
          modelLabel = `Gemini ${geminiResult.model}`;
        }
      }

      if (!imageUrl && process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
        const { generateImageBuffer } = await import("./replit_integrations/image/client");
        const stylePrefix: Record<string, string> = {
          museum_photograph: "Museum-quality archival photograph, professional lighting, white background, educational reference:",
          reconstruction: "Archaeological reconstruction illustration, scholarly accuracy, academic style:",
          diagram: "Clean schematic diagram with labels, academic publication quality:",
          illustration: "Historical illustration, Victorian scholarly engraving style:",
        };
        const fullPrompt = `${stylePrefix[style] || ""} ${aiPrompt}`;
        try {
          const buf = await generateImageBuffer(fullPrompt, "1024x1024");
          imageUrl = `data:image/png;base64,${buf.toString("base64")}`;
          modelLabel = "gpt-image-1";
        } catch (err) {
          console.error("[OpenAI image] generation failed:", err);
        }
      }

      if (!imageUrl) {
        return res.status(502).json({ error: "AI image generation failed — no provider configured or available" });
      }

      const candidate = await storage.createCandidate({
        conceptCardId: id,
        imageUrl,
        title: `AI: ${aiPrompt.slice(0, 60)}`,
        source: modelLabel,
        objectUrl: null,
        sourceType: "ai_generated",
        accuracyStatus: "plausible",
        approved: "pending",
        metadata: { prompt: aiPrompt, style, model: modelLabel },
      });

      await storage.updateConceptCard(id, { state: "candidates_ready" });

      res.json({ candidate, prompt: aiPrompt, model: modelLabel });
    } catch (error: unknown) {
      console.error("Concept AI image generation error:", error);
      res.status(500).json({ error: "Failed to generate AI image" });
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

      const result = await sendHandoffPacket(packet);

      if (result.ok) {
        for (const concept of readyConcepts) {
          await storage.updateConceptCard(concept.id, { state: "sent_to_backend" });
        }
        res.json({ success: true, backendResponse: result.data, packet });
      } else {
        const ingestResult = await sendResearchIngest({
          title: session.title,
          excerpt: session.rawText,
          sourceUrl: session.sourceUrl || undefined,
          citation: session.citation || undefined,
          tags: { grade: session.grade, week: session.week, section: session.sectionId },
          autoSearchImages: false,
          maxConcepts: readyConcepts.length,
        });
        if (ingestResult.ok) {
          for (const concept of readyConcepts) {
            await storage.updateConceptCard(concept.id, { state: "sent_to_backend" });
          }
          res.json({ success: true, backendResponse: ingestResult.data, packet, fallbackPath: "ingest" });
        } else {
          res.json({ success: false, error: result.error, packet, fallbackExport: true });
        }
      }
    } catch (error: unknown) {
      console.error("Handoff error:", error);
      res.status(500).json({ error: "Handoff failed" });
    }
  });

  // ====== ENTITY DAM ENDPOINTS ======

  app.get("/api/entities/by-label", async (req, res) => {
    try {
      const q = (req.query.q as string | undefined) ?? "";
      const entityType = (req.query.type as string | undefined) ?? "concept";
      if (!q || q.length < 2) return res.json([]);
      const normalizedLabel = q.trim().toLowerCase();
      const results = await storage.findEntitiesByLabel(q);
      const exactMatch = results.find(e => e.label.toLowerCase() === normalizedLabel);
      if (exactMatch) {
        return res.json([exactMatch, ...results.filter(e => e.id !== exactMatch.id)]);
      }
      if (results.length > 0) {
        return res.json(results);
      }
      const created = await storage.createEntity({
        label: q.trim(),
        entityType,
        aliases: [],
        description: null,
        period: null,
        region: null,
        magicTags: [],
        metadata: null,
      });
      res.json([created]);
    } catch (error) {
      res.status(500).json({ error: "Failed to search or create entity" });
    }
  });

  app.get("/api/entities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const entity = await storage.getEntity(id);
      if (!entity) return res.status(404).json({ error: "Entity not found" });
      const linkedAssets = await storage.getAssetsByEntity(id);
      const mentionsList = await storage.getMentionsByEntity(id);
      const requirements = await storage.getVisualRequirementsByEntity(id);
      const candidateSets = await Promise.all(
        requirements.map(r => storage.getImageCandidatesByRequirement(r.id))
      );
      const topCandidates = candidateSets
        .flat()
        .sort((a, b) => (b.qcScore ?? -1) - (a.qcScore ?? -1))
        .slice(0, 6);
      res.json({ entity, assets: linkedAssets, mentions: mentionsList, requirements, topCandidates });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entity" });
    }
  });

  app.post("/api/entities", async (req, res) => {
    try {
      const parsed = insertEntitySchema.parse(req.body);
      const entity = await storage.createEntity(parsed);
      res.status(201).json(entity);
    } catch (error: unknown) {
      res.status(400).json({ error: (error as Error).message || "Failed to create entity" });
    }
  });

  app.patch("/api/entities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const updated = await storage.updateEntity(id, req.body);
      if (!updated) return res.status(404).json({ error: "Entity not found" });
      res.json(updated);
    } catch (error: unknown) {
      res.status(400).json({ error: (error as Error).message || "Failed to update entity" });
    }
  });

  app.post("/api/assets/search", async (req, res) => {
    try {
      const { query, entityId, sourceMode = "open_web_fast" } = req.body;
      if (!query) return res.status(400).json({ error: "Query is required" });

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

      if (entityId) {
        const savedAssets = [];
        for (const r of results) {
          const asset = await storage.createAsset({
            url: r.url,
            title: r.title || null,
            source: r.source || null,
            objectUrl: r.objectUrl || null,
            sourceType: r.sourceType || "open_web",
            status: "candidate",
            provider: r.source || null,
            thumbnailUrl: null,
            width: null,
            height: null,
            metadata: null,
          });
          await storage.linkEntityAsset({
            entityId,
            assetId: asset.id,
            linkType: "depicts",
            approved: false,
            confidence: "medium",
          });
          savedAssets.push(asset);
        }
        return res.json({ assets: savedAssets, count: savedAssets.length });
      }

      res.json({ results, count: results.length });
    } catch (error: unknown) {
      console.error("Asset search error:", error);
      res.status(500).json({ error: "Failed to search assets" });
    }
  });

  app.post("/api/assets/save", async (req, res) => {
    try {
      const { entityId, url, title, source, objectUrl, sourceType } = req.body;
      if (!url) return res.status(400).json({ error: "URL is required" });

      const asset = await storage.createAsset({
        url,
        title: title || null,
        source: source || null,
        objectUrl: objectUrl || null,
        sourceType: sourceType || "open_web",
        status: "saved",
        provider: source || null,
        thumbnailUrl: null,
        width: null,
        height: null,
        metadata: null,
      });

      if (entityId) {
        await storage.linkEntityAsset({
          entityId,
          assetId: asset.id,
          linkType: "depicts",
          approved: true,
          confidence: "high",
        });
      }

      res.status(201).json(asset);
    } catch (error: unknown) {
      res.status(400).json({ error: (error as Error).message || "Failed to save asset" });
    }
  });

  app.patch("/api/entity-assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const updated = await storage.updateEntityAsset(id, req.body);
      if (!updated) return res.status(404).json({ error: "Link not found" });
      res.json(updated);
    } catch (error: unknown) {
      res.status(400).json({ error: (error as Error).message || "Failed to update link" });
    }
  });

  // ====== INGEST ENDPOINTS ======

  app.post("/api/ingest/text", async (req, res) => {
    try {
      const { title, text, sourceUrl, citation, grade, week, sectionId } = req.body;
      if (!text || !title) return res.status(400).json({ error: "Title and text are required" });

      const doc = await storage.createDocument({
        title,
        rawText: text,
        sourceUrl: sourceUrl || null,
        citation: citation || null,
        grade: grade || null,
        week: week || null,
        sectionId: sectionId || null,
        processed: false,
      });

      const chunks: string[] = [];
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let chunk = "";
      for (const sentence of sentences) {
        if ((chunk + sentence).length > 500) {
          if (chunk) chunks.push(chunk.trim());
          chunk = sentence;
        } else {
          chunk += sentence;
        }
      }
      if (chunk.trim()) chunks.push(chunk.trim());

      for (let i = 0; i < chunks.length; i++) {
        await storage.createDocChunk({
          documentId: doc.id,
          chunkIndex: i,
          text: chunks[i],
          entities: null,
        });
      }

      const extracted = await extractEntitiesFromText(text);

      const createdEntities = [];
      for (const ext of extracted) {
        const existing = await storage.findEntitiesByLabel(ext.label);
        let entity;
        if (existing.length > 0 && existing[0].label.toLowerCase() === ext.label.toLowerCase()) {
          entity = existing[0];
        } else {
          entity = await storage.createEntity({
            label: ext.label,
            entityType: ext.entityType,
            description: ext.description,
            period: ext.period || null,
            region: ext.region || null,
            aliases: ext.aliases || null,
            magicTags: ext.magicTags || null,
            metadata: null,
          });
        }

        await storage.createMention({
          entityId: entity.id,
          documentId: doc.id,
          offsetStart: ext.offsetStart ?? null,
          offsetEnd: ext.offsetEnd ?? null,
          snippet: ext.snippet || null,
        });

        const existingReqs = await storage.getVisualRequirementsByEntity(entity.id);
        const hasReqForDoc = existingReqs.some(r => r.documentId === doc.id);
        if (!hasReqForDoc) {
          await storage.createVisualRequirement({
            entityId: entity.id,
            documentId: doc.id,
            kind: inferRequirementKind(ext.entityType),
            status: "MISSING",
            imageSpec: null,
            overlaySpec: null,
            primaryAssetId: null,
            qcFailCount: 0,
          });
        }

        createdEntities.push({
          ...entity,
          searchQueries: ext.searchQueries,
          offsetStart: ext.offsetStart,
          offsetEnd: ext.offsetEnd,
          snippet: ext.snippet,
        });
      }

      await storage.updateDocument(doc.id, { processed: true });

      res.json({
        document: doc,
        entities: createdEntities,
        chunkCount: chunks.length,
      });
    } catch (error: unknown) {
      console.error("Ingestion error:", error);
      res.status(500).json({ error: "Text ingestion failed" });
    }
  });

  app.post("/api/ingest/url", async (req, res) => {
    try {
      const { url, title } = req.body;
      if (!url || typeof url !== "string") return res.status(400).json({ error: "URL is required" });

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return res.status(400).json({ error: "Only http and https URLs are allowed" });
      }

      const hostname = parsedUrl.hostname.toLowerCase();
      const blockedHostPatterns = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0|::1|metadata\.google\.internal|169\.254\.|fc00:|fd[0-9a-f]{2}:)/;
      if (blockedHostPatterns.test(hostname)) {
        return res.status(400).json({ error: "Internal or private network URLs are not allowed" });
      }

      const dns = await import("dns/promises");
      try {
        const addresses = await dns.resolve(hostname);
        const privateRanges = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0|169\.254\.)/;
        for (const addr of addresses) {
          if (privateRanges.test(addr) || addr === "::1") {
            return res.status(400).json({ error: "Resolved IP is in a private network range" });
          }
        }
      } catch {
        return res.status(400).json({ error: "Could not resolve hostname" });
      }

      let fetchedText = "";
      let fetchedTitle = title || url;

      // Detect Google Sheets public links and fetch as CSV
      const isGoogleSheets = parsedUrl.hostname === "docs.google.com" &&
        parsedUrl.pathname.includes("/spreadsheets/");

      try {
        let fetchUrl = url;
        if (isGoogleSheets) {
          const sheetIdMatch = parsedUrl.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
          if (sheetIdMatch) {
            const gid = parsedUrl.searchParams.get("gid") || "0";
            fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetIdMatch[1]}/export?format=csv&gid=${gid}`;
            fetchedTitle = title || "Google Sheet";
          }
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const fetchRes = await fetch(fetchUrl, {
          headers: { "User-Agent": "EUCLID-DAM/1.0" },
          signal: controller.signal,
          redirect: isGoogleSheets ? "follow" : "manual",
        });
        clearTimeout(timeout);
        if (!isGoogleSheets && fetchRes.status >= 300 && fetchRes.status < 400) {
          return res.status(400).json({ error: "URL redirects are not followed for security reasons" });
        }
        if (fetchRes.ok) {
          const contentType = fetchRes.headers.get("content-type") ?? "";
          const rawContent = await fetchRes.text();
          if (rawContent.length > 500_000) {
            return res.status(400).json({ error: "Response too large (max 500KB)" });
          }
          if (isGoogleSheets || contentType.includes("text/csv") || contentType.includes("text/plain")) {
            // For Google Sheets: detect if we got an HTML login page instead of CSV
            if (isGoogleSheets && (rawContent.trimStart().startsWith("<!DOCTYPE") || rawContent.trimStart().startsWith("<html"))) {
              return res.status(400).json({ error: "Could not fetch Google Sheet — make sure it is shared publicly (File > Share > Anyone with link)" });
            }
            fetchedText = rawContent.replace(/\r\n/g, "\n").trim().slice(0, 8000);
          } else if (contentType.includes("text/")) {
            fetchedText = rawContent
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 8000);
            const titleMatch = rawContent.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch) fetchedTitle = titleMatch[1].trim() || fetchedTitle;
          } else {
            return res.status(400).json({ error: "URL did not return text content" });
          }
        }
      } catch (fetchErr) {
        console.warn("Could not fetch URL:", fetchErr);
      }

      if (!fetchedText) {
        return res.status(400).json({ error: "Could not fetch content from URL" });
      }

      const doc = await storage.createDocument({
        title: fetchedTitle,
        rawText: fetchedText,
        sourceUrl: url,
        citation: null,
        grade: null,
        week: null,
        sectionId: null,
        processed: false,
      });

      const chunks: string[] = [];
      const sentences = fetchedText.match(/[^.!?]+[.!?]+/g) || [fetchedText];
      let chunk = "";
      for (const sentence of sentences) {
        if ((chunk + sentence).length > 500) {
          if (chunk) chunks.push(chunk.trim());
          chunk = sentence;
        } else {
          chunk += sentence;
        }
      }
      if (chunk.trim()) chunks.push(chunk.trim());
      for (let i = 0; i < chunks.length; i++) {
        await storage.createDocChunk({ documentId: doc.id, chunkIndex: i, text: chunks[i], entities: null });
      }

      const extracted = await extractEntitiesFromText(fetchedText);
      const createdEntities = [];
      for (const ext of extracted) {
        const existing = await storage.findEntitiesByLabel(ext.label);
        let entity;
        if (existing.length > 0 && existing[0].label.toLowerCase() === ext.label.toLowerCase()) {
          entity = existing[0];
        } else {
          entity = await storage.createEntity({
            label: ext.label, entityType: ext.entityType, description: ext.description,
            period: ext.period || null, region: ext.region || null,
            aliases: ext.aliases || null, magicTags: ext.magicTags || null, metadata: null,
          });
        }
        await storage.createMention({
          entityId: entity.id, documentId: doc.id,
          offsetStart: ext.offsetStart ?? null, offsetEnd: ext.offsetEnd ?? null, snippet: ext.snippet || null,
        });
        const existingReqs = await storage.getVisualRequirementsByEntity(entity.id);
        const hasReqForDoc = existingReqs.some(r => r.documentId === doc.id);
        if (!hasReqForDoc) {
          await storage.createVisualRequirement({
            entityId: entity.id, documentId: doc.id,
            kind: inferRequirementKind(ext.entityType),
            status: "MISSING", imageSpec: null, overlaySpec: null, primaryAssetId: null, qcFailCount: 0,
          });
        }
        createdEntities.push({ ...entity, searchQueries: ext.searchQueries, offsetStart: ext.offsetStart, offsetEnd: ext.offsetEnd, snippet: ext.snippet });
      }

      await storage.updateDocument(doc.id, { processed: true });
      res.json({ document: doc, entities: createdEntities, chunkCount: chunks.length });
    } catch (error: unknown) {
      console.error("URL ingestion error:", error);
      res.status(500).json({ error: "URL ingestion failed" });
    }
  });

  // ====== FILE INTAKE ENDPOINT ======

  app.post("/api/ingest/file", uploadMiddleware.array("files", 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const results: Array<{ filename: string; text: string; mimeType: string; size: number; error?: string }> = [];

      for (const file of files) {
        const ext = (file.originalname.split(".").pop() ?? "").toLowerCase();
        const mime = file.mimetype.toLowerCase();

        try {
          let text = "";

          if (ext === "pdf" || mime === "application/pdf") {
            const { PDFParse } = await import("pdf-parse");
            const parser = new PDFParse({ data: file.buffer });
            const data = await parser.getText();
            text = data.text.trim();
          } else if (ext === "docx" || mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const mammoth = await import("mammoth");
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            text = result.value.trim();
          } else if (ext === "doc" || mime === "application/msword") {
            try {
              const mammoth = await import("mammoth");
              const result = await mammoth.extractRawText({ buffer: file.buffer });
              text = result.value.trim();
            } catch {
              results.push({ filename: file.originalname, text: "", mimeType: file.mimetype, size: file.size, error: "Could not extract text from .doc file. Try saving as .docx and uploading again." });
              continue;
            }
          } else if (ext === "json" || mime === "application/json") {
            const raw = file.buffer.toString("utf-8");
            const parsed = JSON.parse(raw);
            text = JSON.stringify(parsed, null, 2);
          } else {
            // Plain text, markdown, code files, etc.
            const textExts = ["txt", "md", "markdown", "js", "ts", "jsx", "tsx", "py", "java", "cpp", "c", "cs", "go", "rs", "rb", "php", "swift", "kt", "sh", "yaml", "yml", "toml", "ini", "cfg", "xml", "html", "htm", "css", "scss", "sql", "r", "scala", "vue", "svelte"];
            if (textExts.includes(ext) || mime.startsWith("text/") || mime === "application/javascript" || mime === "application/typescript" || mime === "application/xml") {
              text = file.buffer.toString("utf-8").trim();
            } else {
              results.push({ filename: file.originalname, text: "", mimeType: file.mimetype, size: file.size, error: `Unsupported file type: .${ext}` });
              continue;
            }
          }

          if (!text) {
            results.push({ filename: file.originalname, text: "", mimeType: file.mimetype, size: file.size, error: "No text could be extracted from this file" });
          } else {
            results.push({ filename: file.originalname, text: text.slice(0, 50000), mimeType: file.mimetype, size: file.size });
          }
        } catch (parseErr) {
          console.error(`Error parsing file ${file.originalname}:`, parseErr);
          results.push({ filename: file.originalname, text: "", mimeType: file.mimetype, size: file.size, error: `Failed to parse file: ${(parseErr as Error).message}` });
        }
      }

      res.json({ results });
    } catch (error: unknown) {
      console.error("File ingestion error:", error);
      res.status(500).json({ error: "File ingestion failed" });
    }
  });

  // ====== VISUAL REQUIREMENTS ENDPOINTS ======

  app.get("/api/requirements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const req_ = await storage.getVisualRequirement(id);
      if (!req_) return res.status(404).json({ error: "Requirement not found" });
      const candidates = await storage.getImageCandidatesByRequirement(id);
      const assessments = await storage.getQcAssessmentsByRequirement(id);
      res.json({ requirement: req_, candidates, assessments });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requirement" });
    }
  });

  app.post("/api/requirements/:id/search", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const requirement = await storage.getVisualRequirement(id);
      if (!requirement) return res.status(404).json({ error: "Requirement not found" });
      const entity = await storage.getEntity(requirement.entityId);
      if (!entity) return res.status(404).json({ error: "Entity not found" });

      const queries: string[] = [entity.label, ...(entity.aliases ?? [])].slice(0, 2);
      const allCandidates = [];

      type ProviderName = "google_cse" | "wikimedia" | "met_museum" | "openverse" | "pinterest" | "adobe_stock" | "ai_generated";
      type ProviderEntry = { name: ProviderName; fn: () => ReturnType<typeof searchGoogleCSE> };

      for (const query of queries) {
        const providerDefs: ProviderEntry[] = [
          { name: "google_cse", fn: () => searchGoogleCSE(query, 6) },
          { name: "wikimedia", fn: () => searchWikimediaProvider(query, 6) },
          { name: "met_museum", fn: () => searchMetMuseumProvider(query, 6) },
          { name: "openverse", fn: () => searchOpenverse(query, 4) },
        ];

        const jobs = await Promise.all(
          providerDefs.map(p =>
            storage.createImageSearchJob({
              requirementId: id,
              provider: p.name,
              query,
              status: "running",
              resultCount: 0,
              error: null,
              completedAt: null,
            })
          )
        );

        const settledResults = await Promise.allSettled(
          providerDefs.map((p) => p.fn())
        );

        for (let i = 0; i < providerDefs.length; i++) {
          const provider = providerDefs[i];
          const job = jobs[i];
          const settled = settledResults[i];

          if (settled.status === "fulfilled") {
            const results = settled.value;
            const jobCandidates = await Promise.all(
              results.map(r =>
                storage.createImageCandidate({
                  requirementId: id,
                  jobId: job.id,
                  url: r.url,
                  thumbnailUrl: r.thumbnailUrl ?? null,
                  title: r.title ?? null,
                  source: r.source ?? null,
                  provider: provider.name,
                  objectUrl: r.objectUrl ?? null,
                  qcStatus: "pending",
                  qcScore: null,
                  metadata: r.metadata ?? null,
                })
              )
            );
            allCandidates.push(...jobCandidates);
            await storage.updateImageSearchJob(job.id, {
              status: "done",
              resultCount: results.length,
              completedAt: new Date(),
            });
          } else {
            await storage.updateImageSearchJob(job.id, {
              status: "error",
              error: settled.reason instanceof Error ? settled.reason.message : "Unknown error",
              completedAt: new Date(),
            });
          }
        }
      }

      if (allCandidates.length > 0) {
        const passedCount = allCandidates.filter(c => c.qcStatus === "passed").length;
        const newStatus = passedCount > 0 ? "CANDIDATES_READY" : "SEARCHING";
        await storage.updateVisualRequirement(id, { status: newStatus });
      }

      res.json({ candidates: allCandidates, count: allCandidates.length });
    } catch (error: unknown) {
      console.error("Requirement search error:", error);
      res.status(500).json({ error: "Failed to search for requirement" });
    }
  });

  app.post("/api/requirements/:id/spec/generate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const requirement = await storage.getVisualRequirement(id);
      if (!requirement) return res.status(404).json({ error: "Requirement not found" });
      const entity = await storage.getEntity(requirement.entityId);
      if (!entity) return res.status(404).json({ error: "Entity not found" });

      const systemPrompt = `You are an art director for an educational museum. Given an entity, produce structured image and overlay specifications.
Return JSON with:
- imageSpec: { subject, era, medium, composition, allowedVariance, disallowedContent, requiredElements }
- overlaySpec: { axes, labels, grid, geometrySkeleton } (null if not applicable)`;

      const userMsg = `Entity: "${entity.label}" (type: ${entity.entityType})
Description: ${entity.description || "No description"}
Period: ${entity.period || "Unknown"}
Region: ${entity.region || "Unknown"}
Requirement kind: ${requirement.kind}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content || "{}";
      type SpecResult = { imageSpec?: Record<string, unknown>; overlaySpec?: Record<string, unknown> };
      let parsed: SpecResult = {};
      try { parsed = JSON.parse(content) as SpecResult; } catch { }

      const updated = await storage.updateVisualRequirement(id, {
        imageSpec: parsed.imageSpec ?? null,
        overlaySpec: parsed.overlaySpec ?? null,
      });

      res.json({ requirement: updated, imageSpec: parsed.imageSpec, overlaySpec: parsed.overlaySpec });
    } catch (error: unknown) {
      console.error("Spec generation error:", error);
      res.status(500).json({ error: "Failed to generate spec" });
    }
  });

  app.post("/api/requirements/:id/prompts/generate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const requirement = await storage.getVisualRequirement(id);
      if (!requirement) return res.status(404).json({ error: "Requirement not found" });
      const entity = await storage.getEntity(requirement.entityId);
      if (!entity) return res.status(404).json({ error: "Entity not found" });

      type SpecShape = { subject?: string; era?: string; medium?: string; composition?: string; requiredElements?: string[]; disallowedContent?: string };
      const imageSpec = requirement.imageSpec as SpecShape | null;
      const overlaySpec = requirement.overlaySpec as SpecShape | null;

      let promptText = `Museum-quality photograph of ${entity.label}`;
      if (imageSpec) {
        if (imageSpec.subject) promptText = imageSpec.subject;
        if (imageSpec.era) promptText += `, ${imageSpec.era}`;
        if (imageSpec.medium) promptText += `, ${imageSpec.medium}`;
        if (imageSpec.composition) promptText += `. ${imageSpec.composition}`;
        if (imageSpec.requiredElements?.length) promptText += `. Must include: ${imageSpec.requiredElements.join(", ")}`;
      }
      promptText += ". Museum lighting, high detail, educational reference quality.";

      let negativePrompt = "blurry, low quality, watermark, text overlay, modern objects";
      if (imageSpec?.disallowedContent) negativePrompt += `, ${imageSpec.disallowedContent}`;

      const imagePrompt = await storage.createImagePrompt({
        entityId: entity.id,
        requirementId: id,
        prompt: promptText,
        negativePrompt,
        style: "museum_photograph",
        generatedUrl: null,
        status: "pending",
        metadata: { imageSpec, overlaySpec },
      });

      res.json({ prompt: imagePrompt });
    } catch (error: unknown) {
      console.error("Prompt generation error:", error);
      res.status(500).json({ error: "Failed to generate prompt" });
    }
  });

  app.post("/api/requirements/:id/image/generate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const requirement = await storage.getVisualRequirement(id);
      if (!requirement) return res.status(404).json({ error: "Requirement not found" });

      const prompts = await storage.getImagePromptsByRequirement(id);
      const latestPrompt = prompts[0];

      console.log("[GenerateImage] STUB called for requirement", id, "prompt:", latestPrompt?.prompt);
      return res.status(501).json({
        stub: true,
        message: "Image generation is stubbed. Wire a live model to enable.",
        prompt: latestPrompt?.prompt || null,
        requirementId: id,
      });
    } catch (error: unknown) {
      res.status(500).json({ error: "Failed to generate image" });
    }
  });

  app.post("/api/requirements/:id/save-candidate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const { candidateId, force } = req.body;
      if (!candidateId) return res.status(400).json({ error: "candidateId is required" });

      const requirement = await storage.getVisualRequirement(id);
      if (!requirement) return res.status(404).json({ error: "Requirement not found" });

      const candidate = await storage.getImageCandidate(candidateId);
      if (!candidate) return res.status(404).json({ error: "Candidate not found" });

      if (candidate.requirementId !== id) {
        return res.status(400).json({ error: "Candidate does not belong to this requirement" });
      }

      if (candidate.qcStatus !== "passed" && !force) {
        return res.status(400).json({
          error: "Candidate has not passed QC. Use force=true to override.",
          qcStatus: candidate.qcStatus,
        });
      }

      const candidateMeta = candidate.metadata as Record<string, unknown> | null;
      const asset = await storage.createAsset({
        url: candidate.url,
        thumbnailUrl: candidate.thumbnailUrl ?? null,
        title: candidate.title ?? null,
        source: candidate.source ?? null,
        provider: candidate.provider ?? null,
        objectUrl: candidate.objectUrl ?? null,
        status: "saved",
        sourceType: "museum",
        width: null,
        height: null,
        metadata: candidateMeta,
      });

      await storage.linkEntityAsset({
        entityId: requirement.entityId,
        assetId: asset.id,
        linkType: "depicts",
        approved: true,
        confidence: "high",
      });

      const updated = await storage.updateVisualRequirement(id, {
        primaryAssetId: asset.id,
        status: "COMPLETE",
      });

      await storage.updateImageCandidate(candidateId, { qcStatus: "saved" });

      if (requirement.documentId) {
        await storage.createDocAssetLink({
          documentId: requirement.documentId,
          assetId: asset.id,
          entityId: requirement.entityId,
        });
      }

      res.json({ asset, requirement: updated });
    } catch (error: unknown) {
      console.error("Save candidate error:", error);
      res.status(500).json({ error: "Failed to save candidate" });
    }
  });

  // ====== QC ENDPOINTS ======

  app.post("/api/qc/:candidateId/evaluate", async (req, res) => {
    try {
      const candidateId = parseInt(req.params.candidateId);
      if (isNaN(candidateId)) return res.status(400).json({ error: "Invalid ID" });

      const candidate = await storage.getImageCandidate(candidateId);
      if (!candidate) return res.status(404).json({ error: "Candidate not found" });

      const requirement = await storage.getVisualRequirement(candidate.requirementId);
      if (!requirement) return res.status(404).json({ error: "Requirement not found" });

      const entity = await storage.getEntity(requirement.entityId);
      type QcSpecShape = { subject?: string; era?: string; medium?: string; requiredElements?: string[]; disallowedContent?: string };
      const imageSpec = requirement.imageSpec as QcSpecShape | null;

      const specDescription = imageSpec
        ? `Subject: ${imageSpec.subject ?? ""}. Era: ${imageSpec.era ?? ""}. Medium: ${imageSpec.medium ?? ""}. Required elements: ${(imageSpec.requiredElements ?? []).join(", ")}. Disallowed: ${imageSpec.disallowedContent ?? "none"}.`
        : `This should be a museum-quality image of ${entity?.label ?? "the entity"}.`;

      const systemPrompt = `You are a visual quality control expert for educational museum images. 
Evaluate the provided image against the specification. 
Return JSON with:
- passed: boolean
- score: number 0-1 (1=perfect match)
- reasons: string array (specific reasons for pass or fail)
- observations: object with keys like "subject_match", "era_accuracy", "medium_match", "overall_quality"`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: `Spec: ${specDescription}\nEntity: ${entity?.label || "Unknown"}` },
              { type: "image_url", image_url: { url: candidate.url, detail: "low" } },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 800,
      });

      const content = response.choices[0]?.message?.content || "{}";
      type QcResult = { passed?: boolean; score?: number; reasons?: string[]; observations?: Record<string, unknown> };
      let parsed: QcResult = { passed: false, score: 0, reasons: ["Parse error"], observations: {} };
      try { parsed = JSON.parse(content) as QcResult; } catch { }

      const assessment = await storage.createQcAssessment({
        candidateId,
        requirementId: candidate.requirementId,
        passed: !!parsed.passed,
        score: typeof parsed.score === "number" ? parsed.score : 0,
        reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
        observations: parsed.observations ?? {},
      });

      await storage.updateImageCandidate(candidateId, {
        qcStatus: parsed.passed ? "passed" : "failed",
        qcScore: parsed.score ?? 0,
      });

      if (!parsed.passed) {
        const newFailCount = (requirement.qcFailCount || 0) + 1;
        await storage.updateVisualRequirement(candidate.requirementId, {
          qcFailCount: newFailCount,
          status: "QC_IN_PROGRESS",
        });

        if (newFailCount >= 3) {
          const existingPassedCandidates = await storage.getImageCandidatesByRequirement(candidate.requirementId);
          const hasPassed = existingPassedCandidates.some(c => c.qcStatus === "passed");
          if (!hasPassed) {
            const entity2 = await storage.getEntity(requirement.entityId);
            const imageSpec2 = requirement.imageSpec as { subject?: string } | null;
            let promptText = `Museum-quality photograph of ${entity2?.label ?? "entity"}`;
            if (imageSpec2?.subject) promptText = imageSpec2.subject;
            promptText += ". Museum lighting, high detail, educational reference quality.";
            await storage.createImagePrompt({
              entityId: requirement.entityId,
              requirementId: candidate.requirementId,
              prompt: promptText,
              negativePrompt: "blurry, low quality, watermark",
              style: "museum_photograph",
              generatedUrl: null,
              status: "pending",
              metadata: { autoGenerated: true, qcFailCount: newFailCount },
            });
            await storage.updateVisualRequirement(candidate.requirementId, {
              status: "PROMPT_FALLBACK",
            });
          }
        }
      } else {
        await storage.updateVisualRequirement(candidate.requirementId, { status: "CANDIDATES_READY" });
      }

      res.json({ assessment, passed: parsed.passed, score: parsed.score });
    } catch (error: unknown) {
      console.error("QC evaluation error:", error);
      res.status(500).json({ error: "QC evaluation failed" });
    }
  });

  // ====== WORK QUEUE ENDPOINTS ======

  app.get("/api/work/queue", async (_req, res) => {
    try {
      const queue = await storage.getWorkQueue();
      res.json(queue);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch work queue" });
    }
  });

  app.post("/api/work/recompute", async (req, res) => {
    try {
      const docs = await storage.getDocuments();
      let updated = 0;
      for (const doc of docs) {
        const reqs = await storage.getVisualRequirementsByDocument(doc.id);
        for (const req_ of reqs) {
          const candidates = await storage.getImageCandidatesByRequirement(req_.id);
          const passedCandidates = candidates.filter(c => c.qcStatus === "passed");
          const savedCandidates = candidates.filter(c => c.qcStatus === "saved");

          let newStatus: "MISSING" | "SEARCHING" | "CANDIDATES_READY" | "QC_IN_PROGRESS" | "COMPLETE" | "PROMPT_FALLBACK" = req_.status;
          if (savedCandidates.length > 0 || req_.primaryAssetId) {
            newStatus = "COMPLETE";
          } else if (passedCandidates.length > 0) {
            newStatus = "CANDIDATES_READY";
          } else if (candidates.length > 0) {
            const failedCount = candidates.filter(c => c.qcStatus === "failed").length;
            if (failedCount > 0) newStatus = "QC_IN_PROGRESS";
            else newStatus = "SEARCHING";
          } else {
            newStatus = "MISSING";
          }

          if (newStatus !== req_.status) {
            await storage.updateVisualRequirement(req_.id, { status: newStatus });
            updated++;
          }
        }
      }
      res.json({ updated, message: `Recomputed ${updated} requirement statuses` });
    } catch (error) {
      res.status(500).json({ error: "Failed to recompute statuses" });
    }
  });

  // ====== DOCUMENT ENDPOINTS ======

  app.get("/api/documents", async (_req, res) => {
    try {
      const docs = await storage.getDocuments();
      res.json(docs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const doc = await storage.getDocument(id);
      if (!doc) return res.status(404).json({ error: "Document not found" });
      const mentionsList = await storage.getMentionsByDocument(id);
      res.json({ document: doc, mentions: mentionsList });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  // ====== TOOLKIT — TIMELINE ARTIFACTS ======

  app.get("/api/toolkit/timeline-nodes", (_req, res) => {
    res.json({ nodes: TIMELINE_NODES, convergences: CONVERGENCE_LINKS });
  });

  app.post("/api/toolkit/seed-artifacts", async (_req, res) => {
    try {
      const result = await seedTimelineArtifacts();
      res.json(result);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Seed failed";
      res.status(500).json({ error: msg });
    }
  });

  app.get("/api/toolkit/timeline-entities", async (_req, res) => {
    try {
      const allEntities = await storage.getAllEntities(200);
      const timelineEntities = allEntities.filter(
        (e) => e.metadata && typeof e.metadata === "object" && "timelineId" in (e.metadata as Record<string, unknown>)
      );
      const enriched = await Promise.all(
        timelineEntities.map(async (entity) => {
          const assets = await storage.getAssetsByEntity(entity.id);
          const requirements = await storage.getVisualRequirementsByEntity(entity.id);
          return { entity, assets: assets.slice(0, 3), requirementStatus: requirements[0]?.status ?? "MISSING" };
        })
      );
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timeline entities" });
    }
  });

  // ====== TOOLKIT — AI IMAGE GENERATION ======

  app.post("/api/toolkit/generate-image", async (req, res) => {
    try {
      const { prompt, style = "museum_photograph", entityId } = req.body as {
        prompt: string;
        style?: "museum_photograph" | "reconstruction" | "diagram" | "illustration";
        entityId?: number;
      };
      if (!prompt) return res.status(400).json({ error: "prompt is required" });

      const result = await generateGeminiImage(prompt, style);
      if (!result) return res.status(502).json({ error: "Image generation failed — check Google_AI key" });

      if (entityId && result.url.startsWith("data:")) {
        await storage.createImagePrompt({
          entityId,
          prompt,
          style,
          generatedUrl: result.url,
          status: "generated",
          metadata: { model: result.model, mimeType: result.mimeType },
        });
      }

      res.json({ url: result.url, prompt: result.prompt, model: result.model });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Generation error";
      res.status(500).json({ error: msg });
    }
  });

  app.post("/api/toolkit/artifact-description", async (req, res) => {
    try {
      const { title, museumId } = req.body as { title: string; museumId?: string };
      if (!title) return res.status(400).json({ error: "title is required" });
      const description = await searchGeminiForArtifact(title, museumId);
      res.json({ description });
    } catch (error) {
      res.status(500).json({ error: "Description generation failed" });
    }
  });

  // ====== TOOLKIT — ARTICLE DISCOVERY ======

  app.post("/api/toolkit/discover-articles", async (req, res) => {
    try {
      const { title, context, entityId } = req.body as {
        title: string;
        context?: string;
        entityId?: number;
      };
      if (!title) return res.status(400).json({ error: "title is required" });

      const result = await searchPerplexityForArtifact(title, context);
      if (!result) return res.status(502).json({ error: "Article discovery failed — check perplexity key" });

      if (entityId && result.answer) {
        const doc = await storage.createDocument({
          title: `Research: ${title}`,
          rawText: result.answer,
          sourceUrl: result.citations[0]?.url,
          citation: result.citations.map((c) => c.url).join("; "),
          processed: false,
        });
        await storage.createMention({
          entityId,
          documentId: doc.id,
          snippet: result.answer.slice(0, 300),
        });
      }

      res.json(result);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Discovery error";
      res.status(500).json({ error: msg });
    }
  });

  // ====== TOOLKIT — HARVEST RUNNER ======

  app.post("/api/toolkit/run-harvest", async (req, res) => {
    try {
      const { source = "met", query, maxItems = 20 } = req.body as {
        source?: string;
        query?: string;
        maxItems?: number;
      };
      const validSources = ["met", "smithsonian", "wikimedia", "archive", "all"];
      if (!validSources.includes(source)) {
        return res.status(400).json({ error: `source must be one of: ${validSources.join(", ")}` });
      }

      const harvestDir = `${process.cwd()}/tools/image-harvest`;
      const outputDir = `${process.cwd()}/downloads`;
      const queryArg = query ? `--query "${query.replace(/"/g, '\\"')}"` : "";
      const cmd = `cd "${harvestDir}" && python3 run.py --source ${source} --max ${maxItems} --output "${outputDir}" ${queryArg} 2>&1`;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      res.write(`data: ${JSON.stringify({ type: "start", source, maxItems })}\n\n`);

      execAsync(cmd, { timeout: 120000 })
        .then(({ stdout }) => {
          const lines = stdout.split("\n").filter(Boolean);
          res.write(`data: ${JSON.stringify({ type: "complete", lines, source })}\n\n`);
          res.end();
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          res.write(`data: ${JSON.stringify({ type: "error", error: msg.slice(0, 500) })}\n\n`);
          res.end();
        });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Harvest error";
      if (!res.headersSent) res.status(500).json({ error: msg });
    }
  });

  // ── Storage Contract Routes ───────────────────────────────────────────────────

  // POST /api/research/ingest — placeholder (use /api/gecd/ingest for full pipeline)
  app.post("/api/research/ingest", async (req, res) => {
    try {
      const { text, title, artifactId } = req.body;
      if (!text || !artifactId) return res.status(400).json({ error: "text and artifactId required" });
      const session = await storage.createSession({ name: title || artifactId, inputText: text });
      res.json({ ok: true, sessionId: session.id, artifactId, message: "Use /api/gecd/ingest for full GECD node extraction." });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Ingest error" });
    }
  });

  // ── GECD Ingest + Nodes ────────────────────────────────────────────────────

  // POST /api/gecd/ingest — extracts GECD nodes from text via OpenAI, stores in graph_nodes + rwi_needs
  app.post("/api/gecd/ingest", async (req, res) => {
    try {
      const { text, context, grade, week, sectionId } = req.body;
      if (!text || text.trim().length < 20) return res.status(400).json({ error: "text required (min 20 chars)" });

      const apiKey = process.env.Google_AI;
      if (!apiKey) return res.status(500).json({ error: "Google AI key not configured" });

      const SYSTEM = `You are a GECD (Geometric Element Civilization Development) research analyst specializing in ancient Mesopotamian history and the MAGIC framework (Math, Aesthetic, Geometry, Institutional, Comptroller).

Extract GECD nodes from the provided text. Each node is a historical moment where a geometric element intersected with civilization development.

Return a JSON array of GECD node objects. Each object must have:
- id: string (snake_case slug, e.g. "node_cylinder_seal_001")
- name: string (artifact or concept name)
- date_bce: number (year BCE, positive integer, null if CE)
- date_ce: number (year CE, null if BCE)
- date_display: string (e.g. "c. 3500 BCE")
- geometric_element: one of ["circle","star","triangle","square","spiral","arc","hexagon","pyramid","dot","line","crescent","rectangle","cone","diamond","grid"]
- deity: string (Shamash/Ishtar/Enlil/Nabu/Tiamat/Anu/Nisaba/Marduk/Nanna/Inanna based on element; Nanna for crescent/moon, Inanna for star/circle, Nisaba for dot/counting)
- magic_drivers: { math: 0-1, aesthetic: 0-1, institutional: 0-1, comptroller: 0-1 }
  (math=mathematical significance, aesthetic=artistic, institutional=organizational, comptroller=economic/accounting)
- description: string (1-2 sentences)
- provenance: string (location)
- civilization: string (e.g. "Sumerian / Uruk Period")
- intensification_category: one of ["object_form","functional_assembly","composite_geometry","complex_designed_system","decoration","simple_token","standardized_token"]
- connections: [] (empty — connections added later)
- tags: string[] (3-6 keywords)
- image_prompt: string (a vivid search/generation prompt for finding a photograph or illustration)
- notes: string | null (important caveats or common misconceptions, or null)

Only include nodes with clear geometric element evidence. Accuracy over quantity.
Respond with ONLY a valid JSON array, no markdown, no explanation.`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${SYSTEM}\n\n${context ? `Context: ${context}\n\n` : ""}Text to analyze:\n\n${text}\n\nRespond with ONLY a JSON array, no markdown, no explanation.` }],
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
          }),
        }
      );

      if (!geminiRes.ok) {
        const err = await geminiRes.text();
        return res.status(502).json({ error: `Gemini API error: ${err.slice(0, 300)}` });
      }

      const geminiData = await geminiRes.json() as any;
      const rawGemini = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
      console.log("[GECD ingest] Gemini raw (first 500):", rawGemini.slice(0, 500));
      const raw = rawGemini.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      let extracted: any[];
      try {
        // Try direct parse first
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          extracted = parsed;
        } else if (parsed && Array.isArray(parsed.nodes)) {
          extracted = parsed.nodes;
        } else {
          extracted = [];
        }
      } catch {
        // Try to extract a JSON array from anywhere in the text
        const arrMatch = raw.match(/\[[\s\S]*\]/);
        if (arrMatch) {
          try { extracted = JSON.parse(arrMatch[0]); }
          catch { extracted = []; }
        } else {
          extracted = [];
        }
      }

      const stored: any[] = [];
      for (const node of extracted) {
        if (!node.id || !node.name || !node.geometric_element) continue;

        // Ensure unique nodeId
        const nodeId = `gecd:${node.id}`;

        // Store in graph_nodes (upsert by nodeId)
        const graphNode = await storage.upsertGraphNode({
          nodeId,
          nodeType: "gecd_node",
          label: node.name,
          description: node.description || null,
          grade: grade || null,
          week: week || null,
          sectionId: sectionId || null,
          payload: node,
          tags: node.tags || null,
        });

        // Also create rwi_need for image sourcing
        const needLabel = `${node.name} (${node.date_display || ""})`;
        await storage.createRwiNeed({
          artifactId: nodeId,
          artifactKey: node.id,
          label: needLabel,
          description: node.description || null,
          visualType: "artifact",
          sourceType: "open_web",
          accuracyStatus: "unreviewed",
          needsOverlay: false,
          needsDiagram: false,
          status: "open",
          grade: grade || null,
          week: week || null,
          sectionId: sectionId || null,
          graphNodeId: nodeId,
          aiPrompts: node.image_prompt ? [node.image_prompt] : null,
        });

        stored.push({ ...node, _graphNodeId: graphNode.id });
      }

      // Trigger background image searches for each node
      const { searchAllSources } = await import("./museumSearch");
      const searchPromises = stored.map(async (node) => {
        if (!node.image_prompt) return;
        try {
          const results = await searchAllSources(node.image_prompt, "open_web_fast");
          await storage.createCandidateSet({
            needsId: null,
            artifactId: `gecd:${node.id}`,
            query: node.image_prompt,
            sourceMode: "open_web_fast",
            candidates: results.slice(0, 12),
            totalCount: results.length,
            grade: grade || null,
            week: week || null,
            sectionId: sectionId || null,
            lessonId: null,
          });
          await storage.logImageSearch({
            needsId: null,
            artifactId: `gecd:${node.id}`,
            query: node.image_prompt,
            provider: "all_parallel",
            resultCount: results.length,
            grade: grade || null,
            week: week || null,
            sectionId: sectionId || null,
          });
        } catch { /* search failure is non-fatal */ }
      });

      // Fire and forget — don't block the response
      Promise.allSettled(searchPromises);

      res.json({
        ok: true,
        extracted: stored.length,
        nodes: stored,
        message: `Extracted ${stored.length} GECD node${stored.length !== 1 ? "s" : ""} and queued image searches.`,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Ingest error" });
    }
  });

  // GET /api/gecd/nodes — return all persisted GECD nodes from graph_nodes
  app.get("/api/gecd/nodes", async (_req, res) => {
    try {
      const { db } = await import("./db");
      const { graphNodes } = await import("../shared/schema");
      const { eq } = await import("drizzle-orm");
      const rows = await db.select().from(graphNodes).where(eq(graphNodes.nodeType, "gecd_node"));
      const nodes = rows.map(r => ({
        ...(r.payload as any),
        _dbId: r.id,
        _nodeId: r.nodeId,
        createdAt: r.createdAt,
      }));
      res.json(nodes);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Fetch nodes error" });
    }
  });

  // GET /api/gecd/candidates?artifactId=... — image candidates for a GECD node
  app.get("/api/gecd/candidates", async (req, res) => {
    try {
      const artifactId = req.query.artifactId as string;
      if (!artifactId) return res.status(400).json({ error: "artifactId query param required" });
      const sets = await storage.getCandidateSets(artifactId);
      const candidates = sets.flatMap(s => (s.candidates as any[]).map(c => ({ ...c, setId: s.id, query: s.query })));
      res.json({ sets: sets.length, candidates });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Candidates error" });
    }
  });

  // POST /api/rwi/needs — create a rwi_need record
  app.post("/api/rwi/needs", async (req, res) => {
    try {
      const need = await storage.createRwiNeed(req.body);
      res.json(need);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Create need error" });
    }
  });

  // GET /api/rwi/needs/:artifactId — list needs for an artifact
  app.get("/api/rwi/needs/:artifactId", async (req, res) => {
    try {
      const needs = await storage.getRwiNeedsByArtifact(req.params.artifactId);
      res.json(needs);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : "List needs error" });
    }
  });

  // POST /api/rwi/images/search — run image search for a rwi_need, persist candidate set + search log
  app.post("/api/rwi/images/search", async (req, res) => {
    try {
      const { needsId, artifactId, query, sourceMode, grade, week, sectionId, lessonId } = req.body;
      if (!query || !artifactId) return res.status(400).json({ error: "query and artifactId required" });

      const { searchAllSources } = await import("./museumSearch");
      const startTime = Date.now();
      const rawResults = await searchAllSources(query, sourceMode || "open_web_fast");
      const durationMs = Date.now() - startTime;

      const candidates = rawResults.map((r: any) => ({
        imageUrl: r.imageUrl,
        title: r.title,
        source: r.source,
        sourceUrl: r.sourceUrl,
        license: r.license,
        provider: r.provider || r.source,
      }));

      // Persist candidate set
      const set = await storage.createCandidateSet({
        needsId: needsId || null,
        artifactId,
        query,
        sourceMode: sourceMode || "open_web_fast",
        candidates,
        totalCount: candidates.length,
        grade: grade || null,
        week: week || null,
        sectionId: sectionId || null,
        lessonId: lessonId || null,
      });

      // Log each provider result
      const providerGroups: Record<string, number> = {};
      rawResults.forEach((r: any) => {
        const p = r.provider || r.source || "unknown";
        providerGroups[p] = (providerGroups[p] || 0) + 1;
      });
      for (const [provider, count] of Object.entries(providerGroups)) {
        await storage.logImageSearch({
          needsId: needsId || null,
          artifactId,
          query,
          provider,
          resultCount: count,
          durationMs,
          grade: grade || null,
          week: week || null,
          sectionId: sectionId || null,
        });
      }

      res.json({ ok: true, setId: set.id, totalCount: candidates.length, candidates });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Search error" });
    }
  });

  // GET /api/rwi/images/candidates/:artifactId — get candidate sets for an artifact
  app.get("/api/rwi/images/candidates/:artifactId", async (req, res) => {
    try {
      const sets = await storage.getCandidateSets(req.params.artifactId);
      res.json(sets);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : "List candidates error" });
    }
  });

  // POST /api/rwi/images/approve — record a review decision, write rwi_image_approvals + media_assets
  app.post("/api/rwi/images/approve", async (req, res) => {
    try {
      const {
        needsId, artifactId, imageUrl, title, sourceUrl, license, author,
        reviewDecision, sourceType, accuracyStatus,
        grade, week, sectionId, lessonId, payload
      } = req.body;

      if (!artifactId || !imageUrl || !reviewDecision) {
        return res.status(400).json({ error: "artifactId, imageUrl, and reviewDecision required" });
      }

      const validDecisions = ["approve_reference", "reject", "needs_ai_generation", "needs_overlay", "needs_crop_or_resize", "needs_better_source"];
      if (!validDecisions.includes(reviewDecision)) {
        return res.status(400).json({ error: `reviewDecision must be one of: ${validDecisions.join(", ")}` });
      }

      // Persist approval record
      const approval = await storage.createApproval({
        needsId: needsId || null,
        artifactId,
        imageUrl,
        title: title || null,
        sourceUrl: sourceUrl || null,
        license: license || null,
        author: author || null,
        reviewDecision,
        sourceType: sourceType || "open_web",
        accuracyStatus: accuracyStatus || "plausible",
        grade: grade || null,
        week: week || null,
        sectionId: sectionId || null,
        lessonId: lessonId || null,
        payload: payload || null,
      });

      // If approved as reference, also write to media_assets
      let mediaAsset = null;
      if (reviewDecision === "approve_reference") {
        mediaAsset = await storage.createMediaAsset({
          needsId: needsId || null,
          approvalId: approval.id,
          url: imageUrl,
          title: title || null,
          source: sourceUrl || null,
          sourceUrl: sourceUrl || null,
          license: license || null,
          author: author || null,
          curationMethod: "human_selected",
          confidence: "high",
          sourceType: sourceType || "open_web",
          accuracyStatus: accuracyStatus || "historically_grounded",
          grade: grade || null,
          week: week || null,
          sectionId: sectionId || null,
          lessonId: lessonId || null,
          artifactId,
          metadata: payload || null,
        });

        // Update needs record if provided
        if (needsId) {
          await storage.updateRwiNeed(needsId, {
            status: "fulfilled",
            mediaAssetId: mediaAsset.id,
          });
        }
      }

      res.json({ ok: true, approval, mediaAsset });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Approval error" });
    }
  });

  // POST /api/vision/spec-and-graph — write a graph node packet
  app.post("/api/vision/spec-and-graph", async (req, res) => {
    try {
      const { nodeId, nodeType, label, description, payload, tags, grade, week, sectionId, mediaAssetId, contentItemId } = req.body;
      if (!nodeId || !nodeType || !label) return res.status(400).json({ error: "nodeId, nodeType, label required" });

      const node = await storage.upsertGraphNode({
        nodeId,
        nodeType,
        label,
        description: description || null,
        payload: payload || null,
        tags: tags || null,
        grade: grade || null,
        week: week || null,
        sectionId: sectionId || null,
        mediaAssetId: mediaAssetId || null,
        contentItemId: contentItemId || null,
      });

      res.json({ ok: true, node });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Graph node error" });
    }
  });

  // POST /api/images/validate — fidelity check, persist quality score
  app.post("/api/images/validate", async (req, res) => {
    try {
      const { needsId, candidateUrl, score, fidelityLabel, reasons, observations, reviewDecision } = req.body;
      if (!candidateUrl) return res.status(400).json({ error: "candidateUrl required" });

      const qs = await storage.createQualityScore({
        needsId: needsId || null,
        candidateUrl,
        score: score ?? null,
        fidelityLabel: fidelityLabel || null,
        reasons: reasons || null,
        observations: observations || null,
        reviewDecision: reviewDecision || null,
        reviewedBy: "system",
      });

      res.json({ ok: true, qualityScore: qs });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Validate error" });
    }
  });

  // GET /api/rwi/review-queue — list pending review items
  app.get("/api/rwi/review-queue", async (req, res) => {
    try {
      const queue = await storage.getReviewQueue();
      res.json(queue);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Queue error" });
    }
  });

  // GET /api/media-assets — list media assets with optional filters
  app.get("/api/media-assets", async (req, res) => {
    try {
      const { artifactId, sectionId, grade } = req.query;
      const assets = await storage.getMediaAssets({
        artifactId: artifactId as string | undefined,
        sectionId: sectionId as string | undefined,
        grade: grade ? parseInt(grade as string) : undefined,
      });
      res.json(assets);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Media assets error" });
    }
  });

  // ── GEA Image Analysis ────────────────────────────────────────────
  app.post("/api/gea/analyze", async (req, res) => {
    const apiKey = process.env.Google_AI;
    if (!apiKey) {
      return res.status(503).json({ error: "Google_AI key not configured" });
    }

    const { imageData, mimeType, prompt } = req.body as {
      imageData?: string;
      mimeType?: string;
      prompt?: string;
    };

    if (!imageData || !mimeType) {
      return res.status(400).json({ error: "imageData and mimeType are required" });
    }

    const analysisPrompt = prompt ?? `Analyze this artifact image using the GEA Construction Grammar framework.
Provide a structured academic analysis covering:
1. VISUAL DESCRIPTION — describe form, geometric elements, patterns, construction evidence, cultural markers
2. GEA DECOMPOSITION — for each element: which primitive(s), operation(s), construction vectors, Halford level
3. PATTERN COMPLEXITY — symmetry type, nesting depth, medium score, GECD stage
4. EMANATION PROFILE — what physics this shape can/cannot produce, emanation axis
5. CONSTRUCTION TIMELINE — estimated GECD stage, earliest possible date, required tools, missing stages
6. SIMPLE MACHINE VALIDATION — if applicable: which machine, GEA combination that produces it, vector count match
7. CROSS-CIVILIZATION COMPARISON — similar patterns elsewhere, independent invention or cultural contact

Be precise and academic. Use GEA notation: Primitive + Operation + Duration + Vector = Result = F(ge).`;

    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inlineData: { mimeType, data: imageData } },
                { text: analysisPrompt },
              ],
            }],
            generationConfig: { maxOutputTokens: 4000, temperature: 0.2 },
          }),
        }
      );

      if (!geminiRes.ok) {
        const err = await geminiRes.text();
        console.error("[GEA-analyze] Gemini error:", geminiRes.status, err.slice(0, 300));
        return res.status(502).json({ error: `Gemini API error ${geminiRes.status}` });
      }

      const data = await geminiRes.json() as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
          finishReason?: string;
        }>;
      };

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        return res.status(502).json({ error: "No text in Gemini response" });
      }

      res.json({ analysis: text, model: "gemini-2.5-flash" });
    } catch (err: unknown) {
      console.error("[GEA-analyze] Fetch error:", err);
      res.status(500).json({ error: err instanceof Error ? err.message : "Analysis failed" });
    }
  });

  // ── Braid Graph ────────────────────────────────────────────────────────────

  app.get("/api/braid/points", async (_req, res) => {
    try {
      const points = await storage.getBraidPoints();
      res.json(points);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/braid/seed", async (_req, res) => {
    try {
      const result = await seedBraidPoints();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/braid/points", async (req, res) => {
    try {
      const { name, year, math, art, geometry, ideology, comptroller, description, source } = req.body;
      if (!name || year == null) return res.status(400).json({ error: "name and year are required" });
      const point = await storage.createBraidPoint({
        name, year: Number(year),
        math: Number(math ?? 0),
        art: Number(art ?? 0),
        geometry: Number(geometry ?? 0),
        ideology: Number(ideology ?? 0),
        comptroller: Number(comptroller ?? 0),
        description: description ?? null,
        source: source ?? null,
      });
      res.json(point);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.get("/api/braid/points/:id", async (req, res) => {
    try {
      const point = await storage.getBraidPointById(Number(req.params.id));
      if (!point) return res.status(404).json({ error: "Not found" });
      res.json(point);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.get("/api/braid/adjacent/:id", async (req, res) => {
    try {
      const adj = await storage.getAdjacentBraidPoints(Number(req.params.id));
      res.json(adj);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.delete("/api/braid/points/:id", async (req, res) => {
    try {
      await storage.deleteBraidPoint(Number(req.params.id));
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // In-memory interpretation cache (keyed by braid point id)
  const interpretCache = new Map<number, string>();

  app.post("/api/braid/node/interpret", async (req, res) => {
    try {
      const { id } = req.body as { id?: number };
      if (id == null || isNaN(Number(id))) return res.status(400).json({ error: "id is required" });
      const pointId = Number(id);

      if (interpretCache.has(pointId)) {
        return res.json({ interpretation: interpretCache.get(pointId) });
      }

      const point = await storage.getBraidPointById(pointId);
      if (!point) return res.status(404).json({ error: "Point not found" });

      const apiKey = process.env.Google_AI;
      if (!apiKey) return res.status(503).json({ error: "Google_AI key not configured" });

      const { prev, next } = await storage.getAdjacentBraidPoints(pointId);

      const ingenuityPrev = prev
        ? Math.abs(point.geometry - prev.geometry).toFixed(3)
        : null;
      const ingenuityNext = next
        ? Math.abs(point.geometry - next.geometry).toFixed(3)
        : null;

      const PROMPT = `You are a "human interpretive machine" for the MAGIC framework — a system for analysing Mesopotamian artifacts and events through five dimensions: Math (M), Art (A), Geometry/META (G), Ideology (I), and Comptroller (C).

G is the META dimension: it represents the topological shape of this moment in cultural-cognitive space, expressed as the contour of how M, A, I, C relate to each other. Think of it as the orchestrating intelligence of the moment.

Write a single paragraph of 2–3 sentences that interprets this braid node as a living, breathing moment in Mesopotamian history. Illuminate what the MAGIC scores say about this moment's character, what the Ingenuity delta reveals about the shift in cognitive topology between adjacent moments, and why G (the META contour) shapes how the other four dimensions converge or diverge here. Write in precise, evocative scholarly prose — not bullet points, not hedged academic language.

Node: ${point.name} (${point.year < 0 ? Math.abs(point.year) + " BCE" : point.year + " CE"})
M=${point.math.toFixed(2)}, A=${point.art.toFixed(2)}, G=${point.geometry.toFixed(2)}, I=${point.ideology.toFixed(2)}, C=${point.comptroller.toFixed(2)}
${point.description ? "Context: " + point.description : ""}
${ingenuityPrev ? "Ingenuity delta from previous node: " + ingenuityPrev : ""}
${ingenuityNext ? "Ingenuity delta to next node: " + ingenuityNext : ""}

Return only the paragraph text — no headings, no markdown.`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: PROMPT }] }] }),
        }
      );
      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        return res.status(502).json({ error: `Gemini error: ${errText.slice(0, 200)}` });
      }
      const geminiData = await geminiRes.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const interpretation = (geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
      if (interpretation) {
        interpretCache.set(pointId, interpretation);
      }
      res.json({ interpretation: interpretation || null });
    } catch (err) {
      console.error("[braid-node-interpret]", err);
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post("/api/braid/analyze", async (req, res) => {
    try {
      const { text } = req.body as { text?: string };
      if (!text || text.trim().length < 20) return res.status(400).json({ error: "Please provide research text (at least 20 characters)" });
      const apiKey = process.env.Google_AI;
      if (!apiKey) return res.status(503).json({ error: "Google_AI key not configured" });

      const SYSTEM = `You are a MAGIC framework analyst for ancient Mesopotamian history and geometric cognition research.
Given a piece of research text, return a single JSON object with two keys: "points" and "sectionMap".

## PART 1 — "points": MAGIC plot points
Extract up to 5 historically significant events, artifacts, or developments from the text.
For each, score five MAGIC variables (0.0–1.0):
- math (M): Mathematical formalization, proofs, measurement, calculation
- art (A): Aesthetic, visual rhetoric, decorative significance, compositional power
- geometry (G): Geometric reasoning, spatial understanding, structural form analysis (INDEPENDENT variable)
- ideology (I): Institutional, religious, political embedding, narrative authority
- comptroller (C): Economic, administrative, accounting, resource allocation control

"points" format:
[{
  "name": "Short descriptive name (max 60 chars)",
  "year": -1800,
  "math": 0.0, "art": 0.0, "geometry": 0.0, "ideology": 0.0, "comptroller": 0.0,
  "description": "One sentence explaining the event and why these scores were chosen."
}]

## PART 2 — "sectionMap": Lesson section impact
Score the relevance of this research text to each of the 15 lesson sections (0.0–1.0).
Write a one-sentence contribution ONLY for sections with relevance ≥ 0.4.

Use the per-section MAGIC emphasis profiles below when computing relevance — a section is more relevant if the research text is strong in the same MAGIC dimensions the section emphasizes.

Sections with MAGIC emphasis profiles (dominant dimensions listed first):
A1 (Myth) [I, A, G]: Hook — narrative entry. Three-act myth where the geometric element SOLVES the problem. Deity/cultural origin. Emphasizes Ideology and Art.
A2 (Identify Artifact) [G, A, M]: Visual rhetoric — GEA decomposition, how geometric properties produce cognitive effects via three-stage broadcast. Emphasizes Geometry and Art.
A3 (Connect Myth to Artifact) [I, A, G]: Bridge myth to material culture. Deity's geometric powers at work in real artifacts. Emphasizes Ideology and Art.
A4 (Material Culture) [I, C, A]: Element across 6 object classes. Ideology institutionalizing — I narrates, C allocates. Emphasizes Ideology and Comptroller.
A5 (TEACH Visual Rhetoric) [A, G, M]: Teach compositional mechanics from A2. Explicit instruction in HOW the geometry was made. Emphasizes Art and Geometry.
A6 (CREATE Artifact) [A, G]: Student creation matching A2. Grade-appropriate production using visual rhetoric skills. Emphasizes Art.
A7 (Architecture Bridge) [G, M, I]: Pivot to Day B. Architecture as dual-register capstone. "What does it DO?" Emphasizes Geometry and Math.
B1 (Bridge Review) [G, M, I]: Resolve A7 bridge question. Same artifact, new register — functional reading. Emphasizes Geometry.
B2 (Math Proof) [M, G]: Mathematical formalization. Properties, proofs, measurements. F(ge) formula. Strongly emphasizes Math.
B3 (Transformation) [G, M]: Element in operation — what the math enables. Geometric operations (rotation, reflection, scaling). Emphasizes Geometry.
B4 (Mechanics) [M, G, C]: What transformation produces — mechanical result. The geometry does physical WORK. Emphasizes Math and Comptroller.
B5 (STEM History) [M, G, I, C]: Where element sits in STEM timeline. Historical lineage of functional deployments. Balanced MAGIC emphasis.
B6 (Invention Moment) [M, C, I]: ONE specific invention — crystallization point. The STEM notch. Emphasizes Math and Comptroller.
B7 (Activity/Build) [G, A, M]: Student construction. Hands-on. Parallels A6. Emphasizes Geometry and Art.
B8 (Synthesis) [G, M, I, A]: Both registers visible SIMULTANEOUSLY. Superimpositional agreement — NOT "metaphor = function." All MAGIC visible at once.

"sectionMap" format:
[
  { "sectionId": "A1", "relevance": 0.0, "contribution": null },
  { "sectionId": "A2", "relevance": 0.8, "contribution": "One sentence about what this research contributes to this section." },
  ...all 15 sections must appear...
]

Rules:
- Return ONLY valid JSON, no markdown, no explanation
- year is integer; BCE = negative (e.g., -3500 for 3500 BCE), CE = positive
- All MAGIC scores between 0.0 and 1.0
- All 15 sectionIds must appear in sectionMap: A1, A2, A3, A4, A5, A6, A7, B1, B2, B3, B4, B5, B6, B7, B8
- contribution is null for sections with relevance < 0.4`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: `${SYSTEM}\n\nResearch text:\n\n${text}` }] }] }),
        }
      );
      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        return res.status(502).json({ error: `Gemini error: ${errText.slice(0, 200)}` });
      }
      const geminiData = await geminiRes.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      let raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      let parsed: {
        points?: Array<{ name: string; year: number; math: number; art: number; geometry: number; ideology: number; comptroller: number; description?: string; }>;
        sectionMap?: Array<{ sectionId: string; relevance: number; contribution: string | null; }>;
      };
      try {
        parsed = JSON.parse(raw);
        if (typeof parsed !== "object" || parsed === null) throw new Error("not an object");
      } catch {
        return res.status(502).json({ error: "Gemini returned non-JSON response", raw: raw.slice(0, 500) });
      }

      const pointsRaw = Array.isArray(parsed.points) ? parsed.points : [];
      const sectionMapRaw = Array.isArray(parsed.sectionMap) ? parsed.sectionMap : [];

      const clamp = (n: number) => Math.min(1, Math.max(0, Number(n ?? 0)));

      const savedPoints = [];
      for (const item of pointsRaw.slice(0, 5)) {
        const point = await storage.createBraidPoint({
          name: String(item.name ?? "Unnamed").slice(0, 120),
          year: Number(item.year ?? 0),
          math: clamp(item.math),
          art: clamp(item.art),
          geometry: clamp(item.geometry),
          ideology: clamp(item.ideology),
          comptroller: clamp(item.comptroller),
          description: item.description ? String(item.description).slice(0, 500) : null,
          source: "research-ingestion",
        });
        savedPoints.push(point);
      }

      const VALID_SECTIONS = ["A1","A2","A3","A4","A5","A6","A7","B1","B2","B3","B4","B5","B6","B7","B8"];
      const SECTION_LO: Record<string, string> = {
        A1: "Hook — narrative entry. Three-act myth where the geometric element SOLVES the problem.",
        A2: "Visual rhetoric — how geometric properties produce cognitive effects via three-stage broadcast.",
        A3: "Bridge myth to material culture. Deity's geometric powers AT WORK in real artifacts.",
        A4: "Element across 6 object classes. Ideology institutionalizing — I narrates, C allocates.",
        A5: "Teach compositional mechanics identified in A2. Explicit instruction in HOW.",
        A6: "Student creation — must match A2. Students produce using visual rhetoric skills.",
        A7: "Pivot to Day B. Architecture as dual-register capstone. Bridge: 'What does it DO?'",
        B1: "Resolve A7 bridge question. MUST reference SAME artifact as A7. Same element, new register.",
        B2: "Mathematical formalization. 'Because' = demonstration, NOT definition. F(ge) formula.",
        B3: "Element in operation — what the math enables. Geometric operations.",
        B4: "What transformation produces — mechanical result. The geometry does physical WORK.",
        B5: "Where element sits in STEM timeline — historical lineage of functional deployments.",
        B6: "ONE specific invention — crystallization point. The STEM notch.",
        B7: "Student construction. Hands-on. Parallels A6.",
        B8: "Both registers visible SIMULTANEOUSLY. Superimpositional agreement — NOT 'metaphor = function.'",
      };

      // Normalize: build a map from Gemini's response, then fill ALL 15 sections
      const geminiBySection: Record<string, { relevance: number; contribution: string | null }> = {};
      for (const s of sectionMapRaw) {
        if (VALID_SECTIONS.includes(s.sectionId)) {
          geminiBySection[s.sectionId] = {
            relevance: clamp(s.relevance),
            contribution: s.contribution ? String(s.contribution).slice(0, 400) : null,
          };
        }
      }

      // Source name derived from the first extracted point or the raw text
      const sourceName = (pointsRaw[0]?.name ?? text.slice(0, 60)).slice(0, 120);

      // Create one set of 15 section rows per created braid point so each point
      // has its own full A1–B8 impact map.  If no points were created (ingestion
      // returned zero points) fall back to a single set linked to null.
      const pointsToLink = savedPoints.length > 0 ? savedPoints : [{ id: null }];
      const contribRows = pointsToLink.flatMap(pt =>
        VALID_SECTIONS.map(sectionId => ({
          braidPointId: pt.id as number | null,
          sourceName,
          sectionId,
          relevance: geminiBySection[sectionId]?.relevance ?? 0,
          contribution: geminiBySection[sectionId]?.contribution ?? null,
          learningObjective: SECTION_LO[sectionId] ?? null,
        }))
      );

      const savedContribs = await storage.createLessonContributions(contribRows);

      // Return one canonical 15-section display map (the first point's rows, or
      // all rows when no points were created) so the UI payload stays lean.
      const displayMap = savedContribs.filter(r => r.braidPointId === savedPoints[0]?.id ?? null);

      res.json({
        created: savedPoints.length,
        points: savedPoints,
        sectionMap: displayMap.length > 0 ? displayMap : savedContribs.slice(0, 15),
      });
    } catch (err) {
      console.error("[braid-analyze]", err);
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  return httpServer;
}
