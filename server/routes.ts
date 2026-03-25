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
import { generateGeminiImage, searchGeminiForArtifact } from "./providers/gemini";
import { searchPerplexityForArtifact } from "./providers/perplexity";
import { exec } from "child_process";
import { promisify } from "util";
import OpenAI from "openai";

const execAsync = promisify(exec);

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const OVERLAY_TYPES = new Set(["geometry", "math", "motif", "ritual", "GEOMETRY", "MATH", "MOTIF", "RITUAL"]);

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

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const fetchRes = await fetch(url, {
          headers: { "User-Agent": "EUCLID-DAM/1.0" },
          signal: controller.signal,
          redirect: "manual",
        });
        clearTimeout(timeout);
        if (fetchRes.status >= 300 && fetchRes.status < 400) {
          return res.status(400).json({ error: "URL redirects are not followed for security reasons" });
        }
        if (fetchRes.ok) {
          const contentType = fetchRes.headers.get("content-type") ?? "";
          if (!contentType.includes("text/")) {
            return res.status(400).json({ error: "URL did not return text content" });
          }
          const html = await fetchRes.text();
          if (html.length > 500_000) {
            return res.status(400).json({ error: "Response too large (max 500KB)" });
          }
          fetchedText = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 8000);
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch) fetchedTitle = titleMatch[1].trim() || fetchedTitle;
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

  return httpServer;
}
