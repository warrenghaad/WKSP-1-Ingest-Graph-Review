import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const savedImages = pgTable("saved_images", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  source: text("source"),
  query: text("query"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const textreaderSessions = pgTable("textreader_sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  rawText: text("raw_text").notNull(),
  citation: text("citation"),
  sourceUrl: text("source_url"),
  grade: integer("grade"),
  week: integer("week"),
  sectionId: text("section_id"),
  lessonId: text("lesson_id"),
  sourceMode: text("source_mode").default("open_web_fast").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const conceptCards = pgTable("concept_cards", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  conceptId: text("concept_id").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  visualType: text("visual_type").default("artifact").notNull(),
  priority: text("priority").default("medium").notNull(),
  state: text("state").default("draft").notNull(),
  searchQueries: text("search_queries").array(),
  aiPrompts: text("ai_prompts").array(),
  diagramPrompt: text("diagram_prompt"),
  tags: text("tags").array(),
  sourceMode: text("source_mode").default("open_web_fast").notNull(),
  sourceType: text("source_type").default("open_web").notNull(),
  accuracyStatus: text("accuracy_status").default("unreviewed").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const conceptCandidates = pgTable("concept_candidates", {
  id: serial("id").primaryKey(),
  conceptCardId: integer("concept_card_id").notNull(),
  imageUrl: text("image_url").notNull(),
  title: text("title"),
  source: text("source"),
  objectUrl: text("object_url"),
  sourceType: text("source_type").default("open_web").notNull(),
  accuracyStatus: text("accuracy_status").default("unreviewed").notNull(),
  approved: text("approved").default("pending").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSavedImageSchema = createInsertSchema(savedImages).omit({
  id: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(textreaderSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConceptCardSchema = createInsertSchema(conceptCards).omit({
  id: true,
  createdAt: true,
});

export const insertCandidateSchema = createInsertSchema(conceptCandidates).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SavedImage = typeof savedImages.$inferSelect;
export type InsertSavedImage = z.infer<typeof insertSavedImageSchema>;
export type TextreaderSession = typeof textreaderSessions.$inferSelect;
export type InsertTextreaderSession = z.infer<typeof insertSessionSchema>;
export type ConceptCard = typeof conceptCards.$inferSelect;
export type InsertConceptCard = z.infer<typeof insertConceptCardSchema>;
export type ConceptCandidate = typeof conceptCandidates.$inferSelect;
export type InsertConceptCandidate = z.infer<typeof insertCandidateSchema>;
