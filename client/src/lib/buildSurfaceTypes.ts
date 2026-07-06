export type BuildSurfaceView = "gallery" | "table" | "board" | "inbox";

export type VerificationStatus = "unverified" | "approved" | "rejected" | "needs_info";

export type FacetDimension =
  | "civilization"
  | "period"
  | "geometry"
  | "carrier"
  | "material"
  | "source"
  | "lessonRole"
  | "pfmd";

export type ArtifactTags = Partial<Record<FacetDimension, string[]>>;

export interface CatalogueArtifact {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  thumbUrl: string;
  source: string;
  sourceId: string;
  license: "CC0" | "Public Domain" | "Educational Use" | "Unknown";
  verificationStatus: VerificationStatus;
  tags: ArtifactTags;
  primitiveRefs: string[];
  productionNotes: string[];
  imagePrompt: string;
}

export interface VerificationEvent {
  artifactId: string;
  decision: VerificationStatus;
  reviewer: string;
  decidedAt: string;
  note?: string;
}

export interface LessonSlot {
  id: string;
  label: string;
  helper: string;
  itemIds: string[];
}

export interface SurfaceViewConfig {
  id: string;
  name: string;
  type: BuildSurfaceView;
  filters: Record<string, string[]>;
  sort: Array<{ id: string; desc: boolean }>;
  groupBy?: FacetDimension | "verificationStatus";
  visibleColumns: string[];
  columnOrder: string[];
  galleryCoverField?: "thumbUrl" | "imageUrl";
}
