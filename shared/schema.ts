import { sql } from "drizzle-orm";
import { pgTable, pgEnum, text, varchar, serial, timestamp, jsonb, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const requirementKindEnum = pgEnum("requirement_kind", ["SOURCE_ONLY", "SOURCE_PLUS_OVERLAY"]);
export const requirementStatusEnum = pgEnum("requirement_status", ["MISSING", "SEARCHING", "CANDIDATES_READY", "QC_IN_PROGRESS", "COMPLETE", "PROMPT_FALLBACK"]);
export const imageSearchJobStatusEnum = pgEnum("image_search_job_status", ["pending", "running", "done", "error"]);
export const imageCandidateQcStatusEnum = pgEnum("image_candidate_qc_status", ["pending", "passed", "failed", "saved"]);
export const imageSearchProviderEnum = pgEnum("image_search_provider", ["google_cse", "wikimedia", "met_museum", "openverse", "pinterest", "adobe_stock", "ai_generated"]);

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
  requirementId: integer("requirement_id"),
  prompt: text("prompt").notNull(),
  negativePrompt: text("negative_prompt"),
  style: text("style").default("museum_photograph").notNull(),
  generatedUrl: text("generated_url"),
  status: text("status").default("pending").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const visualRequirements = pgTable("visual_requirements", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id").notNull(),
  documentId: integer("document_id"),
  kind: requirementKindEnum("kind").default("SOURCE_ONLY").notNull(),
  status: requirementStatusEnum("status").default("MISSING").notNull(),
  imageSpec: jsonb("image_spec"),
  overlaySpec: jsonb("overlay_spec"),
  primaryAssetId: integer("primary_asset_id"),
  qcFailCount: integer("qc_fail_count").default(0).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const imageSearchJobs = pgTable("image_search_jobs", {
  id: serial("id").primaryKey(),
  requirementId: integer("requirement_id").notNull(),
  provider: imageSearchProviderEnum("provider").notNull(),
  query: text("query").notNull(),
  status: imageSearchJobStatusEnum("status").default("pending").notNull(),
  resultCount: integer("result_count").default(0).notNull(),
  error: text("error"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  completedAt: timestamp("completed_at"),
});

export const imageCandidates = pgTable("image_candidates", {
  id: serial("id").primaryKey(),
  requirementId: integer("requirement_id").notNull(),
  jobId: integer("job_id"),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  title: text("title"),
  source: text("source"),
  provider: imageSearchProviderEnum("provider"),
  objectUrl: text("object_url"),
  qcStatus: imageCandidateQcStatusEnum("qc_status").default("pending").notNull(),
  qcScore: real("qc_score"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const qcAssessments = pgTable("qc_assessments", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  requirementId: integer("requirement_id").notNull(),
  passed: boolean("passed").notNull(),
  score: real("score").notNull(),
  reasons: text("reasons").array(),
  observations: jsonb("observations"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const docAssetLinks = pgTable("doc_asset_links", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  assetId: integer("asset_id"),
  candidateId: integer("candidate_id"),
  entityId: integer("entity_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ── Storage Contract Tables ───────────────────────────────────────────────────

export const rwiNeeds = pgTable("rwi_needs", {
  id: serial("id").primaryKey(),
  artifactId: text("artifact_id").notNull(),
  artifactKey: text("artifact_key"),
  label: text("label").notNull(),
  description: text("description"),
  visualType: text("visual_type").default("artifact").notNull(),
  grade: integer("grade"),
  week: integer("week"),
  sectionId: text("section_id"),
  lessonId: text("lesson_id"),
  lessonFile: text("lesson_file"),
  sourceRowIndex: integer("source_row_index"),
  rowKey: text("row_key"),
  sourceType: text("source_type").default("open_web").notNull(),
  accuracyStatus: text("accuracy_status").default("unreviewed").notNull(),
  needsOverlay: boolean("needs_overlay").default(false).notNull(),
  needsDiagram: boolean("needs_diagram").default(false).notNull(),
  aiPrompts: text("ai_prompts").array(),
  diagramPrompt: text("diagram_prompt"),
  overlaySpec: jsonb("overlay_spec"),
  status: text("status").default("open").notNull(),
  contentItemId: integer("content_item_id"),
  mediaAssetId: integer("media_asset_id"),
  graphNodeId: text("graph_node_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const rwiImageCandidateSets = pgTable("rwi_image_candidate_sets", {
  id: serial("id").primaryKey(),
  needsId: integer("needs_id"),
  artifactId: text("artifact_id").notNull(),
  query: text("query").notNull(),
  sourceMode: text("source_mode").default("open_web_fast").notNull(),
  providers: text("providers").array(),
  candidates: jsonb("candidates").notNull(),
  totalCount: integer("total_count").default(0).notNull(),
  grade: integer("grade"),
  week: integer("week"),
  sectionId: text("section_id"),
  lessonId: text("lesson_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const imageProviderCache = pgTable("image_provider_cache", {
  id: serial("id").primaryKey(),
  cacheKey: text("cache_key").notNull().unique(),
  provider: text("provider").notNull(),
  query: text("query").notNull(),
  results: jsonb("results").notNull(),
  hitCount: integer("hit_count").default(1).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const imageSearchLog = pgTable("image_search_log", {
  id: serial("id").primaryKey(),
  needsId: integer("needs_id"),
  artifactId: text("artifact_id"),
  query: text("query").notNull(),
  provider: text("provider").notNull(),
  resultCount: integer("result_count").default(0).notNull(),
  selectedUrl: text("selected_url"),
  durationMs: integer("duration_ms"),
  error: text("error"),
  grade: integer("grade"),
  week: integer("week"),
  sectionId: text("section_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const imageQualityScores = pgTable("image_quality_scores", {
  id: serial("id").primaryKey(),
  needsId: integer("needs_id"),
  candidateUrl: text("candidate_url").notNull(),
  score: real("score"),
  fidelityLabel: text("fidelity_label"),
  reasons: text("reasons").array(),
  observations: jsonb("observations"),
  reviewDecision: text("review_decision"),
  reviewedBy: text("reviewed_by"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const imageReviewQueue = pgTable("image_review_queue", {
  id: serial("id").primaryKey(),
  needsId: integer("needs_id"),
  artifactId: text("artifact_id").notNull(),
  candidateUrl: text("candidate_url").notNull(),
  candidateTitle: text("candidate_title"),
  candidateSource: text("candidate_source"),
  reviewDecision: text("review_decision").default("pending").notNull(),
  reviewNotes: text("review_notes"),
  sourceType: text("source_type"),
  accuracyStatus: text("accuracy_status").default("unreviewed").notNull(),
  grade: integer("grade"),
  week: integer("week"),
  sectionId: text("section_id"),
  lessonId: text("lesson_id"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const rwiImageApprovals = pgTable("rwi_image_approvals", {
  id: serial("id").primaryKey(),
  needsId: integer("needs_id"),
  artifactId: text("artifact_id").notNull(),
  imageUrl: text("image_url").notNull(),
  title: text("title"),
  sourceUrl: text("source_url"),
  license: text("license"),
  author: text("author"),
  reviewDecision: text("review_decision").notNull(),
  sourceType: text("source_type").default("open_web").notNull(),
  accuracyStatus: text("accuracy_status").default("plausible").notNull(),
  grade: integer("grade"),
  week: integer("week"),
  sectionId: text("section_id"),
  lessonId: text("lesson_id"),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  needsId: integer("needs_id"),
  approvalId: integer("approval_id"),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  title: text("title"),
  source: text("source"),
  sourceUrl: text("source_url"),
  license: text("license"),
  author: text("author"),
  curationMethod: text("curation_method").default("human_selected").notNull(),
  confidence: text("confidence").default("medium").notNull(),
  reviewer: text("reviewer"),
  sourceType: text("source_type").default("open_web").notNull(),
  accuracyStatus: text("accuracy_status").default("plausible").notNull(),
  grade: integer("grade"),
  week: integer("week"),
  sectionId: text("section_id"),
  lessonId: text("lesson_id"),
  artifactId: text("artifact_id"),
  contentItemId: integer("content_item_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const graphNodes = pgTable("graph_nodes", {
  id: serial("id").primaryKey(),
  nodeId: text("node_id").notNull().unique(),
  nodeType: text("node_type").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  sourceDocumentId: integer("source_document_id"),
  contentItemId: integer("content_item_id"),
  mediaAssetId: integer("media_asset_id"),
  payload: jsonb("payload"),
  tags: text("tags").array(),
  grade: integer("grade"),
  week: integer("week"),
  sectionId: text("section_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ── Braid Graph Points (MAGIC instantiations) ────────────────────────────────
export const braidPoints = pgTable("braid_points", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  math: real("math").notNull().default(0),
  art: real("art").notNull().default(0),
  geometry: real("geometry").notNull().default(0),
  ideology: real("ideology").notNull().default(0),
  comptroller: real("comptroller").notNull().default(0),
  description: text("description"),
  source: text("source"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const lessonSectionContributions = pgTable("lesson_section_contributions", {
  id: serial("id").primaryKey(),
  braidPointId: integer("braid_point_id").references(() => braidPoints.id, { onDelete: "set null" }),
  sourceName: text("source_name").notNull(),
  sectionId: text("section_id").notNull(),
  relevance: real("relevance").notNull().default(0),
  contribution: text("contribution"),
  learningObjective: text("learning_objective"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ── Insert schemas ────────────────────────────────────────────────────────────

export const insertRwiNeedsSchema = createInsertSchema(rwiNeeds).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRwiCandidateSetSchema = createInsertSchema(rwiImageCandidateSets).omit({ id: true, createdAt: true });
export const insertImageProviderCacheSchema = createInsertSchema(imageProviderCache).omit({ id: true, createdAt: true });
export const insertImageSearchLogSchema = createInsertSchema(imageSearchLog).omit({ id: true, createdAt: true });
export const insertImageQualityScoreSchema = createInsertSchema(imageQualityScores).omit({ id: true, createdAt: true });
export const insertImageReviewQueueSchema = createInsertSchema(imageReviewQueue).omit({ id: true, createdAt: true });
export const insertRwiImageApprovalSchema = createInsertSchema(rwiImageApprovals).omit({ id: true, createdAt: true });
export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({ id: true, createdAt: true });
export const insertGraphNodeSchema = createInsertSchema(graphNodes).omit({ id: true, createdAt: true });
export const insertBraidPointSchema = createInsertSchema(braidPoints).omit({ id: true, createdAt: true });
export const insertLessonSectionContributionSchema = createInsertSchema(lessonSectionContributions).omit({ id: true, createdAt: true });

// ── Select types ──────────────────────────────────────────────────────────────

export type RwiNeed = typeof rwiNeeds.$inferSelect;
export type InsertRwiNeed = z.infer<typeof insertRwiNeedsSchema>;
export type RwiImageCandidateSet = typeof rwiImageCandidateSets.$inferSelect;
export type InsertRwiImageCandidateSet = z.infer<typeof insertRwiCandidateSetSchema>;
export type ImageProviderCache = typeof imageProviderCache.$inferSelect;
export type InsertImageProviderCache = z.infer<typeof insertImageProviderCacheSchema>;
export type ImageSearchLog = typeof imageSearchLog.$inferSelect;
export type InsertImageSearchLog = z.infer<typeof insertImageSearchLogSchema>;
export type ImageQualityScore = typeof imageQualityScores.$inferSelect;
export type InsertImageQualityScore = z.infer<typeof insertImageQualityScoreSchema>;
export type ImageReviewQueue = typeof imageReviewQueue.$inferSelect;
export type InsertImageReviewQueue = z.infer<typeof insertImageReviewQueueSchema>;
export type RwiImageApproval = typeof rwiImageApprovals.$inferSelect;
export type InsertRwiImageApproval = z.infer<typeof insertRwiImageApprovalSchema>;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
export type GraphNode = typeof graphNodes.$inferSelect;
export type InsertGraphNode = z.infer<typeof insertGraphNodeSchema>;
export type BraidPoint = typeof braidPoints.$inferSelect;
export type InsertBraidPoint = z.infer<typeof insertBraidPointSchema>;
export type LessonSectionContribution = typeof lessonSectionContributions.$inferSelect;
export type InsertLessonSectionContribution = z.infer<typeof insertLessonSectionContributionSchema>;

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

export const insertVisualRequirementSchema = createInsertSchema(visualRequirements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertImageSearchJobSchema = createInsertSchema(imageSearchJobs).omit({
  id: true,
  createdAt: true,
});

export const insertImageCandidateSchema = createInsertSchema(imageCandidates).omit({
  id: true,
  createdAt: true,
});

export const insertQcAssessmentSchema = createInsertSchema(qcAssessments).omit({
  id: true,
  createdAt: true,
});

export const insertDocAssetLinkSchema = createInsertSchema(docAssetLinks).omit({
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
export type VisualRequirement = typeof visualRequirements.$inferSelect;
export type InsertVisualRequirement = z.infer<typeof insertVisualRequirementSchema>;
export type ImageSearchJob = typeof imageSearchJobs.$inferSelect;
export type InsertImageSearchJob = z.infer<typeof insertImageSearchJobSchema>;
export type ImageCandidate = typeof imageCandidates.$inferSelect;
export type InsertImageCandidate = z.infer<typeof insertImageCandidateSchema>;
export type QcAssessment = typeof qcAssessments.$inferSelect;
export type InsertQcAssessment = z.infer<typeof insertQcAssessmentSchema>;
export type DocAssetLink = typeof docAssetLinks.$inferSelect;
export type InsertDocAssetLink = z.infer<typeof insertDocAssetLinkSchema>;
