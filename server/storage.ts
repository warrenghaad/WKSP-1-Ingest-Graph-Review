import { eq, desc, ilike, or, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users, savedImages, textreaderSessions, conceptCards, conceptCandidates,
  entities, assets, entityAssets, mentions, documents, docChunks, imagePrompts,
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
}

export const storage = new DatabaseStorage();
