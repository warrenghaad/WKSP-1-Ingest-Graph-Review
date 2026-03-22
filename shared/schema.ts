import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
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

export const entities = pgTable("entities", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  aliases: text("aliases").array(),
  entityType: text("entity_type").default("concept").notNull(),
  description: text("description"),
  period: text("period"),
  region: text("region"),
  magicTags: text("magic_tags").array(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  title: text("title"),
  source: text("source"),
  provider: text("provider"),
  objectUrl: text("object_url"),
  status: text("status").default("candidate").notNull(),
  sourceType: text("source_type").default("open_web").notNull(),
  width: integer("width"),
  height: integer("height"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const entityAssets = pgTable("entity_assets", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id").notNull(),
  assetId: integer("asset_id").notNull(),
  linkType: text("link_type").default("depicts").notNull(),
  approved: boolean("approved").default(false).notNull(),
  confidence: text("confidence").default("medium").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const mentions = pgTable("mentions", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id").notNull(),
  documentId: integer("document_id"),
  offsetStart: integer("offset_start"),
  offsetEnd: integer("offset_end"),
  snippet: text("snippet"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  rawText: text("raw_text").notNull(),
  sourceUrl: text("source_url"),
  citation: text("citation"),
  grade: integer("grade"),
  week: integer("week"),
  sectionId: text("section_id"),
  processed: boolean("processed").default(false).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const docChunks = pgTable("doc_chunks", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  text: text("text").notNull(),
  entities: text("entities").array(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const imagePrompts = pgTable("image_prompts", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id"),
  prompt: text("prompt").notNull(),
  style: text("style").default("museum_photograph").notNull(),
  generatedUrl: text("generated_url"),
  status: text("status").default("pending").notNull(),
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

export const insertEntitySchema = createInsertSchema(entities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
});

export const insertEntityAssetSchema = createInsertSchema(entityAssets).omit({
  id: true,
  createdAt: true,
});

export const insertMentionSchema = createInsertSchema(mentions).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocChunkSchema = createInsertSchema(docChunks).omit({
  id: true,
  createdAt: true,
});

export const insertImagePromptSchema = createInsertSchema(imagePrompts).omit({
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
export type Entity = typeof entities.$inferSelect;
export type InsertEntity = z.infer<typeof insertEntitySchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type EntityAsset = typeof entityAssets.$inferSelect;
export type InsertEntityAsset = z.infer<typeof insertEntityAssetSchema>;
export type Mention = typeof mentions.$inferSelect;
export type InsertMention = z.infer<typeof insertMentionSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type DocChunk = typeof docChunks.$inferSelect;
export type InsertDocChunk = z.infer<typeof insertDocChunkSchema>;
export type ImagePrompt = typeof imagePrompts.$inferSelect;
export type InsertImagePrompt = z.infer<typeof insertImagePromptSchema>;
