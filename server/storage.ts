import { eq, desc, ilike } from "drizzle-orm";
import { db } from "./db";
import {
  users, savedImages, textreaderSessions, conceptCards, conceptCandidates,
  type User, type InsertUser,
  type SavedImage, type InsertSavedImage,
  type TextreaderSession, type InsertTextreaderSession,
  type ConceptCard, type InsertConceptCard,
  type ConceptCandidate, type InsertConceptCandidate,
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
}

export const storage = new DatabaseStorage();
