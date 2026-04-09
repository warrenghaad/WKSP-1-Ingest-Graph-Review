import { eq, desc, ilike, and, sql, lt, gt, asc } from "drizzle-orm";
import { db } from "./db";
import {
  users, savedImages, textreaderSessions, conceptCards, conceptCandidates,
  entities, assets, entityAssets, mentions, documents, docChunks, imagePrompts,
  visualRequirements, imageSearchJobs, imageCandidates, qcAssessments, docAssetLinks,
  rwiNeeds, rwiImageCandidateSets, imageProviderCache, imageSearchLog,
  imageQualityScores, imageReviewQueue, rwiImageApprovals, mediaAssets, graphNodes,
  type User, type InsertUser,
  type SavedImage, type InsertSavedImage,
  type TextreaderSession, type InsertTextreaderSession,
  type ConceptCard, type InsertConceptCard,
  type ConceptCandidate, type InsertConceptCandidate,
  type Entity, type InsertEntity,
  type Asset, type InsertAsset,
  type EntityAsset, type InsertEntityAsset,
  type Mention, type InsertMention,
  type Document, type InsertDocument,
  type DocChunk, type InsertDocChunk,
  type ImagePrompt, type InsertImagePrompt,
  type VisualRequirement, type InsertVisualRequirement,
  type ImageSearchJob, type InsertImageSearchJob,
  type ImageCandidate, type InsertImageCandidate,
  type QcAssessment, type InsertQcAssessment,
  type DocAssetLink, type InsertDocAssetLink,
  type RwiNeed, type InsertRwiNeed,
  type RwiImageCandidateSet, type InsertRwiImageCandidateSet,
  type ImageProviderCache, type InsertImageProviderCache,
  type ImageSearchLog, type InsertImageSearchLog,
  type ImageQualityScore, type InsertImageQualityScore,
  type ImageReviewQueue, type InsertImageReviewQueue,
  type RwiImageApproval, type InsertRwiImageApproval,
  type MediaAsset, type InsertMediaAsset,
  type GraphNode, type InsertGraphNode,
  braidPoints,
  type BraidPoint, type InsertBraidPoint,
  lessonSectionContributions,
  type LessonSectionContribution, type InsertLessonSectionContribution,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getSavedImages(): Promise<SavedImage[]>;
  saveImage(image: InsertSavedImage): Promise<SavedImage>;
  deleteSavedImage(id: number): Promise<void>;

  createSession(session: InsertTextreaderSession): Promise<TextreaderSession>;
  getSession(id: number): Promise<TextreaderSession | undefined>;
  getSessions(): Promise<TextreaderSession[]>;
  updateSession(id: number, updates: Partial<InsertTextreaderSession>): Promise<TextreaderSession | undefined>;
  deleteSession(id: number): Promise<void>;

  createConceptCard(card: InsertConceptCard): Promise<ConceptCard>;
  getConceptCards(sessionId: number): Promise<ConceptCard[]>;
  getConceptCard(id: number): Promise<ConceptCard | undefined>;
  updateConceptCard(id: number, updates: Partial<InsertConceptCard>): Promise<ConceptCard | undefined>;
  deleteConceptCard(id: number): Promise<void>;

  createCandidate(candidate: InsertConceptCandidate): Promise<ConceptCandidate>;
  getCandidates(conceptCardId: number): Promise<ConceptCandidate[]>;
  updateCandidate(id: number, updates: Partial<InsertConceptCandidate>): Promise<ConceptCandidate | undefined>;
  deleteCandidate(id: number): Promise<void>;

  createEntity(entity: InsertEntity): Promise<Entity>;
  getEntity(id: number): Promise<Entity | undefined>;
  getAllEntities(limit?: number): Promise<Entity[]>;
  findEntitiesByLabel(query: string): Promise<Entity[]>;
  updateEntity(id: number, updates: Partial<InsertEntity>): Promise<Entity | undefined>;

  createAsset(asset: InsertAsset): Promise<Asset>;
  getAsset(id: number): Promise<Asset | undefined>;
  getAssetsByEntity(entityId: number): Promise<(Asset & { linkId: number; linkType: string; approved: boolean })[]>;
  updateAsset(id: number, updates: Partial<InsertAsset>): Promise<Asset | undefined>;

  linkEntityAsset(link: InsertEntityAsset): Promise<EntityAsset>;
  updateEntityAsset(id: number, updates: Partial<InsertEntityAsset>): Promise<EntityAsset | undefined>;
  getEntityAssetLinks(entityId: number): Promise<EntityAsset[]>;

  createMention(mention: InsertMention): Promise<Mention>;
  getMentionsByEntity(entityId: number): Promise<Mention[]>;
  getMentionsByDocument(documentId: number): Promise<Mention[]>;

  createDocument(doc: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocuments(): Promise<Document[]>;
  updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | undefined>;

  createDocChunk(chunk: InsertDocChunk): Promise<DocChunk>;
  getDocChunks(documentId: number): Promise<DocChunk[]>;

  createImagePrompt(prompt: InsertImagePrompt): Promise<ImagePrompt>;
  getImagePromptsByEntity(entityId: number): Promise<ImagePrompt[]>;
  getImagePromptsByRequirement(requirementId: number): Promise<ImagePrompt[]>;

  createVisualRequirement(req: InsertVisualRequirement): Promise<VisualRequirement>;
  getVisualRequirement(id: number): Promise<VisualRequirement | undefined>;
  getVisualRequirementsByEntity(entityId: number): Promise<VisualRequirement[]>;
  getVisualRequirementsByDocument(documentId: number): Promise<VisualRequirement[]>;
  updateVisualRequirement(id: number, updates: Partial<InsertVisualRequirement>): Promise<VisualRequirement | undefined>;

  createImageSearchJob(job: InsertImageSearchJob): Promise<ImageSearchJob>;
  updateImageSearchJob(id: number, updates: Partial<InsertImageSearchJob>): Promise<ImageSearchJob | undefined>;
  getImageSearchJobsByRequirement(requirementId: number): Promise<ImageSearchJob[]>;

  createImageCandidate(candidate: InsertImageCandidate): Promise<ImageCandidate>;
  getImageCandidate(id: number): Promise<ImageCandidate | undefined>;
  getImageCandidatesByRequirement(requirementId: number): Promise<ImageCandidate[]>;
  updateImageCandidate(id: number, updates: Partial<InsertImageCandidate>): Promise<ImageCandidate | undefined>;

  createQcAssessment(assessment: InsertQcAssessment): Promise<QcAssessment>;
  getQcAssessmentsByCandidate(candidateId: number): Promise<QcAssessment[]>;
  getQcAssessmentsByRequirement(requirementId: number): Promise<QcAssessment[]>;

  createDocAssetLink(link: InsertDocAssetLink): Promise<DocAssetLink>;
  getDocAssetLinksByDocument(documentId: number): Promise<DocAssetLink[]>;

  getWorkQueue(): Promise<Array<{
    document: Document;
    missing: number;
    qcFailed: number;
    readyToSave: number;
  }>>;

  // Storage Contract
  createRwiNeed(need: InsertRwiNeed): Promise<RwiNeed>;
  getRwiNeed(id: number): Promise<RwiNeed | undefined>;
  getRwiNeedsByArtifact(artifactId: string): Promise<RwiNeed[]>;
  updateRwiNeed(id: number, updates: Partial<InsertRwiNeed>): Promise<RwiNeed | undefined>;

  createCandidateSet(set: InsertRwiImageCandidateSet): Promise<RwiImageCandidateSet>;
  getCandidateSets(artifactId: string): Promise<RwiImageCandidateSet[]>;

  getCachedProviderResult(cacheKey: string): Promise<ImageProviderCache | undefined>;
  upsertProviderCache(entry: InsertImageProviderCache): Promise<ImageProviderCache>;

  logImageSearch(entry: InsertImageSearchLog): Promise<ImageSearchLog>;

  createQualityScore(score: InsertImageQualityScore): Promise<ImageQualityScore>;
  getQualityScores(needsId: number): Promise<ImageQualityScore[]>;

  createReviewQueueItem(item: InsertImageReviewQueue): Promise<ImageReviewQueue>;
  getReviewQueue(): Promise<ImageReviewQueue[]>;
  updateReviewQueueItem(id: number, updates: Partial<InsertImageReviewQueue>): Promise<ImageReviewQueue | undefined>;

  createApproval(approval: InsertRwiImageApproval): Promise<RwiImageApproval>;
  getApprovals(artifactId: string): Promise<RwiImageApproval[]>;

  createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset>;
  getMediaAsset(id: number): Promise<MediaAsset | undefined>;
  getMediaAssets(filters?: { artifactId?: string; sectionId?: string; grade?: number }): Promise<MediaAsset[]>;
  updateMediaAsset(id: number, updates: Partial<InsertMediaAsset>): Promise<MediaAsset | undefined>;

  createGraphNode(node: InsertGraphNode): Promise<GraphNode>;
  getGraphNode(nodeId: string): Promise<GraphNode | undefined>;
  upsertGraphNode(node: InsertGraphNode): Promise<GraphNode>;

  getBraidPoints(): Promise<BraidPoint[]>;
  getBraidPointById(id: number): Promise<BraidPoint | undefined>;
  getAdjacentBraidPoints(id: number): Promise<{ prev: BraidPoint | null; next: BraidPoint | null }>;
  createBraidPoint(point: InsertBraidPoint): Promise<BraidPoint>;
  deleteBraidPoint(id: number): Promise<void>;
  countBraidPoints(): Promise<number>;

  createLessonContributions(rows: InsertLessonSectionContribution[]): Promise<LessonSectionContribution[]>;
  getLessonContributionsForPoint(braidPointId: number): Promise<LessonSectionContribution[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getSavedImages(): Promise<SavedImage[]> {
    return db.select().from(savedImages).orderBy(desc(savedImages.createdAt));
  }

  async saveImage(image: InsertSavedImage): Promise<SavedImage> {
    const [saved] = await db.insert(savedImages).values(image).returning();
    return saved;
  }

  async deleteSavedImage(id: number): Promise<void> {
    await db.delete(savedImages).where(eq(savedImages.id, id));
  }

  async createSession(session: InsertTextreaderSession): Promise<TextreaderSession> {
    const [created] = await db.insert(textreaderSessions).values(session).returning();
    return created;
  }

  async getSession(id: number): Promise<TextreaderSession | undefined> {
    const [session] = await db.select().from(textreaderSessions).where(eq(textreaderSessions.id, id));
    return session;
  }

  async getSessions(): Promise<TextreaderSession[]> {
    return db.select().from(textreaderSessions).orderBy(desc(textreaderSessions.updatedAt));
  }

  async updateSession(id: number, updates: Partial<InsertTextreaderSession>): Promise<TextreaderSession | undefined> {
    const [updated] = await db.update(textreaderSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(textreaderSessions.id, id))
      .returning();
    return updated;
  }

  async deleteSession(id: number): Promise<void> {
    const cards = await db.select({ id: conceptCards.id }).from(conceptCards).where(eq(conceptCards.sessionId, id));
    for (const card of cards) {
      await db.delete(conceptCandidates).where(eq(conceptCandidates.conceptCardId, card.id));
    }
    await db.delete(conceptCards).where(eq(conceptCards.sessionId, id));
    await db.delete(textreaderSessions).where(eq(textreaderSessions.id, id));
  }

  async createConceptCard(card: InsertConceptCard): Promise<ConceptCard> {
    const [created] = await db.insert(conceptCards).values(card).returning();
    return created;
  }

  async getConceptCards(sessionId: number): Promise<ConceptCard[]> {
    return db.select().from(conceptCards).where(eq(conceptCards.sessionId, sessionId));
  }

  async getConceptCard(id: number): Promise<ConceptCard | undefined> {
    const [card] = await db.select().from(conceptCards).where(eq(conceptCards.id, id));
    return card;
  }

  async updateConceptCard(id: number, updates: Partial<InsertConceptCard>): Promise<ConceptCard | undefined> {
    const [updated] = await db.update(conceptCards)
      .set(updates)
      .where(eq(conceptCards.id, id))
      .returning();
    return updated;
  }

  async deleteConceptCard(id: number): Promise<void> {
    await db.delete(conceptCandidates).where(eq(conceptCandidates.conceptCardId, id));
    await db.delete(conceptCards).where(eq(conceptCards.id, id));
  }

  async createCandidate(candidate: InsertConceptCandidate): Promise<ConceptCandidate> {
    const [created] = await db.insert(conceptCandidates).values(candidate).returning();
    return created;
  }

  async getCandidates(conceptCardId: number): Promise<ConceptCandidate[]> {
    return db.select().from(conceptCandidates)
      .where(eq(conceptCandidates.conceptCardId, conceptCardId))
      .orderBy(desc(conceptCandidates.createdAt));
  }

  async updateCandidate(id: number, updates: Partial<InsertConceptCandidate>): Promise<ConceptCandidate | undefined> {
    const [updated] = await db.update(conceptCandidates)
      .set(updates)
      .where(eq(conceptCandidates.id, id))
      .returning();
    return updated;
  }

  async deleteCandidate(id: number): Promise<void> {
    await db.delete(conceptCandidates).where(eq(conceptCandidates.id, id));
  }

  async createEntity(entity: InsertEntity): Promise<Entity> {
    const [created] = await db.insert(entities).values(entity).returning();
    return created;
  }

  async getEntity(id: number): Promise<Entity | undefined> {
    const [entity] = await db.select().from(entities).where(eq(entities.id, id));
    return entity;
  }

  async getAllEntities(limit = 200): Promise<Entity[]> {
    return db.select().from(entities).orderBy(entities.label).limit(limit);
  }

  async findEntitiesByLabel(query: string): Promise<Entity[]> {
    return db.select().from(entities)
      .where(ilike(entities.label, `%${query}%`))
      .orderBy(entities.label)
      .limit(20);
  }

  async updateEntity(id: number, updates: Partial<InsertEntity>): Promise<Entity | undefined> {
    const [updated] = await db.update(entities)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(entities.id, id))
      .returning();
    return updated;
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const [created] = await db.insert(assets).values(asset).returning();
    return created;
  }

  async getAsset(id: number): Promise<Asset | undefined> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset;
  }

  async getAssetsByEntity(entityId: number): Promise<(Asset & { linkId: number; linkType: string; approved: boolean })[]> {
    const rows = await db
      .select({
        id: assets.id,
        url: assets.url,
        thumbnailUrl: assets.thumbnailUrl,
        title: assets.title,
        source: assets.source,
        provider: assets.provider,
        objectUrl: assets.objectUrl,
        status: assets.status,
        sourceType: assets.sourceType,
        width: assets.width,
        height: assets.height,
        metadata: assets.metadata,
        createdAt: assets.createdAt,
        linkId: entityAssets.id,
        linkType: entityAssets.linkType,
        approved: entityAssets.approved,
      })
      .from(entityAssets)
      .innerJoin(assets, eq(entityAssets.assetId, assets.id))
      .where(eq(entityAssets.entityId, entityId))
      .orderBy(desc(assets.createdAt));
    return rows;
  }

  async updateAsset(id: number, updates: Partial<InsertAsset>): Promise<Asset | undefined> {
    const [updated] = await db.update(assets).set(updates).where(eq(assets.id, id)).returning();
    return updated;
  }

  async linkEntityAsset(link: InsertEntityAsset): Promise<EntityAsset> {
    const [created] = await db.insert(entityAssets).values(link).returning();
    return created;
  }

  async updateEntityAsset(id: number, updates: Partial<InsertEntityAsset>): Promise<EntityAsset | undefined> {
    const [updated] = await db.update(entityAssets).set(updates).where(eq(entityAssets.id, id)).returning();
    return updated;
  }

  async getEntityAssetLinks(entityId: number): Promise<EntityAsset[]> {
    return db.select().from(entityAssets).where(eq(entityAssets.entityId, entityId));
  }

  async createMention(mention: InsertMention): Promise<Mention> {
    const [created] = await db.insert(mentions).values(mention).returning();
    return created;
  }

  async getMentionsByEntity(entityId: number): Promise<Mention[]> {
    return db.select().from(mentions).where(eq(mentions.entityId, entityId));
  }

  async getMentionsByDocument(documentId: number): Promise<Mention[]> {
    return db.select().from(mentions).where(eq(mentions.documentId, documentId));
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const [created] = await db.insert(documents).values(doc).returning();
    return created;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getDocuments(): Promise<Document[]> {
    return db.select().from(documents).orderBy(desc(documents.updatedAt));
  }

  async updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updated] = await db.update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updated;
  }

  async createDocChunk(chunk: InsertDocChunk): Promise<DocChunk> {
    const [created] = await db.insert(docChunks).values(chunk).returning();
    return created;
  }

  async getDocChunks(documentId: number): Promise<DocChunk[]> {
    return db.select().from(docChunks)
      .where(eq(docChunks.documentId, documentId))
      .orderBy(docChunks.chunkIndex);
  }

  async createImagePrompt(prompt: InsertImagePrompt): Promise<ImagePrompt> {
    const [created] = await db.insert(imagePrompts).values(prompt).returning();
    return created;
  }

  async getImagePromptsByEntity(entityId: number): Promise<ImagePrompt[]> {
    return db.select().from(imagePrompts).where(eq(imagePrompts.entityId, entityId));
  }

  async getImagePromptsByRequirement(requirementId: number): Promise<ImagePrompt[]> {
    return db.select().from(imagePrompts).where(eq(imagePrompts.requirementId, requirementId));
  }

  async createVisualRequirement(req: InsertVisualRequirement): Promise<VisualRequirement> {
    const [created] = await db.insert(visualRequirements).values(req).returning();
    return created;
  }

  async getVisualRequirement(id: number): Promise<VisualRequirement | undefined> {
    const [req] = await db.select().from(visualRequirements).where(eq(visualRequirements.id, id));
    return req;
  }

  async getVisualRequirementsByEntity(entityId: number): Promise<VisualRequirement[]> {
    return db.select().from(visualRequirements)
      .where(eq(visualRequirements.entityId, entityId))
      .orderBy(desc(visualRequirements.createdAt));
  }

  async getVisualRequirementsByDocument(documentId: number): Promise<VisualRequirement[]> {
    return db.select().from(visualRequirements)
      .where(eq(visualRequirements.documentId, documentId))
      .orderBy(desc(visualRequirements.createdAt));
  }

  async updateVisualRequirement(id: number, updates: Partial<InsertVisualRequirement>): Promise<VisualRequirement | undefined> {
    const [updated] = await db.update(visualRequirements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(visualRequirements.id, id))
      .returning();
    return updated;
  }

  async createImageSearchJob(job: InsertImageSearchJob): Promise<ImageSearchJob> {
    const [created] = await db.insert(imageSearchJobs).values(job).returning();
    return created;
  }

  async updateImageSearchJob(id: number, updates: Partial<InsertImageSearchJob>): Promise<ImageSearchJob | undefined> {
    const [updated] = await db.update(imageSearchJobs).set(updates).where(eq(imageSearchJobs.id, id)).returning();
    return updated;
  }

  async getImageSearchJobsByRequirement(requirementId: number): Promise<ImageSearchJob[]> {
    return db.select().from(imageSearchJobs)
      .where(eq(imageSearchJobs.requirementId, requirementId))
      .orderBy(desc(imageSearchJobs.createdAt));
  }

  async createImageCandidate(candidate: InsertImageCandidate): Promise<ImageCandidate> {
    const [created] = await db.insert(imageCandidates).values(candidate).returning();
    return created;
  }

  async getImageCandidate(id: number): Promise<ImageCandidate | undefined> {
    const [candidate] = await db.select().from(imageCandidates).where(eq(imageCandidates.id, id));
    return candidate;
  }

  async getImageCandidatesByRequirement(requirementId: number): Promise<ImageCandidate[]> {
    return db.select().from(imageCandidates)
      .where(eq(imageCandidates.requirementId, requirementId))
      .orderBy(desc(imageCandidates.createdAt));
  }

  async updateImageCandidate(id: number, updates: Partial<InsertImageCandidate>): Promise<ImageCandidate | undefined> {
    const [updated] = await db.update(imageCandidates).set(updates).where(eq(imageCandidates.id, id)).returning();
    return updated;
  }

  async createQcAssessment(assessment: InsertQcAssessment): Promise<QcAssessment> {
    const [created] = await db.insert(qcAssessments).values(assessment).returning();
    return created;
  }

  async getQcAssessmentsByCandidate(candidateId: number): Promise<QcAssessment[]> {
    return db.select().from(qcAssessments)
      .where(eq(qcAssessments.candidateId, candidateId))
      .orderBy(desc(qcAssessments.createdAt));
  }

  async getQcAssessmentsByRequirement(requirementId: number): Promise<QcAssessment[]> {
    return db.select().from(qcAssessments)
      .where(eq(qcAssessments.requirementId, requirementId))
      .orderBy(desc(qcAssessments.createdAt));
  }

  async createDocAssetLink(link: InsertDocAssetLink): Promise<DocAssetLink> {
    const [created] = await db.insert(docAssetLinks).values(link).returning();
    return created;
  }

  async getDocAssetLinksByDocument(documentId: number): Promise<DocAssetLink[]> {
    return db.select().from(docAssetLinks).where(eq(docAssetLinks.documentId, documentId));
  }

  // ── Storage Contract Implementations ────────────────────────────────────────

  async createRwiNeed(need: InsertRwiNeed): Promise<RwiNeed> {
    const [row] = await db.insert(rwiNeeds).values(need).returning();
    return row;
  }
  async getRwiNeed(id: number): Promise<RwiNeed | undefined> {
    const [row] = await db.select().from(rwiNeeds).where(eq(rwiNeeds.id, id));
    return row;
  }
  async getRwiNeedsByArtifact(artifactId: string): Promise<RwiNeed[]> {
    return db.select().from(rwiNeeds).where(eq(rwiNeeds.artifactId, artifactId)).orderBy(desc(rwiNeeds.createdAt));
  }
  async updateRwiNeed(id: number, updates: Partial<InsertRwiNeed>): Promise<RwiNeed | undefined> {
    const [row] = await db.update(rwiNeeds).set({ ...updates, updatedAt: new Date() }).where(eq(rwiNeeds.id, id)).returning();
    return row;
  }

  async createCandidateSet(set: InsertRwiImageCandidateSet): Promise<RwiImageCandidateSet> {
    const [row] = await db.insert(rwiImageCandidateSets).values(set).returning();
    return row;
  }
  async getCandidateSets(artifactId: string): Promise<RwiImageCandidateSet[]> {
    return db.select().from(rwiImageCandidateSets).where(eq(rwiImageCandidateSets.artifactId, artifactId)).orderBy(desc(rwiImageCandidateSets.createdAt));
  }

  async getCachedProviderResult(cacheKey: string): Promise<ImageProviderCache | undefined> {
    const [row] = await db.select().from(imageProviderCache).where(eq(imageProviderCache.cacheKey, cacheKey));
    if (!row) return undefined;
    if (row.expiresAt < new Date()) return undefined;
    await db.update(imageProviderCache).set({ hitCount: row.hitCount + 1 }).where(eq(imageProviderCache.id, row.id));
    return row;
  }
  async upsertProviderCache(entry: InsertImageProviderCache): Promise<ImageProviderCache> {
    const existing = await db.select().from(imageProviderCache).where(eq(imageProviderCache.cacheKey, entry.cacheKey));
    if (existing.length > 0) {
      const [row] = await db.update(imageProviderCache)
        .set({ results: entry.results, expiresAt: entry.expiresAt, hitCount: existing[0].hitCount + 1 })
        .where(eq(imageProviderCache.cacheKey, entry.cacheKey)).returning();
      return row;
    }
    const [row] = await db.insert(imageProviderCache).values(entry).returning();
    return row;
  }

  async logImageSearch(entry: InsertImageSearchLog): Promise<ImageSearchLog> {
    const [row] = await db.insert(imageSearchLog).values(entry).returning();
    return row;
  }

  async createQualityScore(score: InsertImageQualityScore): Promise<ImageQualityScore> {
    const [row] = await db.insert(imageQualityScores).values(score).returning();
    return row;
  }
  async getQualityScores(needsId: number): Promise<ImageQualityScore[]> {
    return db.select().from(imageQualityScores).where(eq(imageQualityScores.needsId, needsId));
  }

  async createReviewQueueItem(item: InsertImageReviewQueue): Promise<ImageReviewQueue> {
    const [row] = await db.insert(imageReviewQueue).values(item).returning();
    return row;
  }
  async getReviewQueue(): Promise<ImageReviewQueue[]> {
    return db.select().from(imageReviewQueue).orderBy(desc(imageReviewQueue.createdAt));
  }
  async updateReviewQueueItem(id: number, updates: Partial<InsertImageReviewQueue>): Promise<ImageReviewQueue | undefined> {
    const [row] = await db.update(imageReviewQueue).set(updates).where(eq(imageReviewQueue.id, id)).returning();
    return row;
  }

  async createApproval(approval: InsertRwiImageApproval): Promise<RwiImageApproval> {
    const [row] = await db.insert(rwiImageApprovals).values(approval).returning();
    return row;
  }
  async getApprovals(artifactId: string): Promise<RwiImageApproval[]> {
    return db.select().from(rwiImageApprovals).where(eq(rwiImageApprovals.artifactId, artifactId)).orderBy(desc(rwiImageApprovals.createdAt));
  }

  async createMediaAsset(asset: InsertMediaAsset): Promise<MediaAsset> {
    const [row] = await db.insert(mediaAssets).values(asset).returning();
    return row;
  }
  async getMediaAsset(id: number): Promise<MediaAsset | undefined> {
    const [row] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id));
    return row;
  }
  async getMediaAssets(filters?: { artifactId?: string; sectionId?: string; grade?: number }): Promise<MediaAsset[]> {
    let q = db.select().from(mediaAssets).$dynamic();
    if (filters?.artifactId) q = q.where(eq(mediaAssets.artifactId, filters.artifactId));
    else if (filters?.sectionId) q = q.where(eq(mediaAssets.sectionId, filters.sectionId));
    else if (filters?.grade !== undefined) q = q.where(eq(mediaAssets.grade, filters.grade));
    return q.orderBy(desc(mediaAssets.createdAt));
  }
  async updateMediaAsset(id: number, updates: Partial<InsertMediaAsset>): Promise<MediaAsset | undefined> {
    const [row] = await db.update(mediaAssets).set(updates).where(eq(mediaAssets.id, id)).returning();
    return row;
  }

  async createGraphNode(node: InsertGraphNode): Promise<GraphNode> {
    const [row] = await db.insert(graphNodes).values(node).returning();
    return row;
  }
  async getGraphNode(nodeId: string): Promise<GraphNode | undefined> {
    const [row] = await db.select().from(graphNodes).where(eq(graphNodes.nodeId, nodeId));
    return row;
  }
  async upsertGraphNode(node: InsertGraphNode): Promise<GraphNode> {
    const existing = await this.getGraphNode(node.nodeId);
    if (existing) {
      const [row] = await db.update(graphNodes).set(node).where(eq(graphNodes.nodeId, node.nodeId)).returning();
      return row;
    }
    return this.createGraphNode(node);
  }

  async getBraidPoints(): Promise<BraidPoint[]> {
    return db.select().from(braidPoints).orderBy(braidPoints.year);
  }

  async getBraidPointById(id: number): Promise<BraidPoint | undefined> {
    const [row] = await db.select().from(braidPoints).where(eq(braidPoints.id, id));
    return row;
  }

  async getAdjacentBraidPoints(id: number): Promise<{ prev: BraidPoint | null; next: BraidPoint | null }> {
    const [current] = await db.select({ year: braidPoints.year }).from(braidPoints).where(eq(braidPoints.id, id));
    if (!current) return { prev: null, next: null };
    const { year } = current;
    const [prevRow] = await db.select().from(braidPoints)
      .where(lt(braidPoints.year, year))
      .orderBy(desc(braidPoints.year))
      .limit(1);
    const [nextRow] = await db.select().from(braidPoints)
      .where(gt(braidPoints.year, year))
      .orderBy(asc(braidPoints.year))
      .limit(1);
    return { prev: prevRow ?? null, next: nextRow ?? null };
  }

  async createBraidPoint(point: InsertBraidPoint): Promise<BraidPoint> {
    const [row] = await db.insert(braidPoints).values(point).returning();
    return row;
  }

  async deleteBraidPoint(id: number): Promise<void> {
    await db.delete(braidPoints).where(eq(braidPoints.id, id));
  }

  async countBraidPoints(): Promise<number> {
    const [row] = await db.select({ count: sql<number>`count(*)` }).from(braidPoints);
    return Number(row?.count ?? 0);
  }

  async createLessonContributions(rows: InsertLessonSectionContribution[]): Promise<LessonSectionContribution[]> {
    if (rows.length === 0) return [];
    return db.insert(lessonSectionContributions).values(rows).returning();
  }

  async getLessonContributionsForPoint(braidPointId: number): Promise<LessonSectionContribution[]> {
    return db.select().from(lessonSectionContributions)
      .where(eq(lessonSectionContributions.braidPointId, braidPointId))
      .orderBy(lessonSectionContributions.sectionId);
  }

  async getWorkQueue(): Promise<Array<{
    document: Document;
    missing: number;
    qcFailed: number;
    readyToSave: number;
  }>> {
    const docs = await db.select().from(documents).orderBy(desc(documents.updatedAt)).limit(50);
    const result = [];
    for (const doc of docs) {
      const reqs = await db.select().from(visualRequirements)
        .where(eq(visualRequirements.documentId, doc.id));
      if (reqs.length === 0) continue;
      const missing = reqs.filter(r => r.status === "MISSING").length;
      const qcFailed = reqs.filter(r => r.status === "QC_IN_PROGRESS").length;
      const readyToSave = reqs.filter(r => r.status === "CANDIDATES_READY").length;
      if (missing > 0 || qcFailed > 0 || readyToSave > 0) {
        result.push({ document: doc, missing, qcFailed, readyToSave });
      }
    }
    return result;
  }
}

export const storage = new DatabaseStorage();
