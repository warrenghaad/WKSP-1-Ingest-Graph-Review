import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { del, get, set } from "idb-keyval";
import { seedLessonSlots } from "@/lib/buildSurfaceSeed";
import type { LessonSlot, VerificationEvent, VerificationStatus } from "@/lib/buildSurfaceTypes";

const indexedDbStorage: StateStorage = {
  getItem: async (name: string) => (await get(name)) ?? null,
  setItem: async (name: string, value: string) => set(name, value),
  removeItem: async (name: string) => del(name),
};

type FacetSelections = Record<string, string[]>;

interface BuildSurfaceState {
  activeView: "gallery" | "table" | "board" | "inbox";
  searchQuery: string;
  selectedArtifactIds: string[];
  facetSelections: FacetSelections;
  verificationById: Record<string, VerificationStatus>;
  verificationEvents: VerificationEvent[];
  lessonSlots: LessonSlot[];
  setActiveView: (view: BuildSurfaceState["activeView"]) => void;
  setSearchQuery: (query: string) => void;
  toggleFacet: (dimension: string, value: string) => void;
  clearFacets: () => void;
  toggleSelected: (artifactId: string) => void;
  clearSelection: () => void;
  setVerificationStatus: (artifactId: string, status: VerificationStatus, note?: string) => void;
  addToSlot: (slotId: string, artifactId: string) => void;
  removeFromSlot: (slotId: string, artifactId: string) => void;
  clearLesson: () => void;
}

export const useBuildSurfaceStore = create<BuildSurfaceState>()(
  persist(
    (setState) => ({
      activeView: "gallery",
      searchQuery: "",
      selectedArtifactIds: [],
      facetSelections: { verificationStatus: ["approved"] },
      verificationById: {},
      verificationEvents: [],
      lessonSlots: seedLessonSlots,
      setActiveView: (view) =>
        setState((state) => ({
          activeView: view,
          facetSelections:
            view === "inbox"
              ? { ...state.facetSelections, verificationStatus: ["unverified", "needs_info"] }
              : state.facetSelections,
        })),
      setSearchQuery: (query) => setState({ searchQuery: query }),
      toggleFacet: (dimension, value) =>
        setState((state) => {
          const current = state.facetSelections[dimension] ?? [];
          const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
          const facetSelections = { ...state.facetSelections };
          if (next.length === 0) delete facetSelections[dimension];
          else facetSelections[dimension] = next;
          return { facetSelections };
        }),
      clearFacets: () => setState({ facetSelections: {} }),
      toggleSelected: (artifactId) =>
        setState((state) => ({
          selectedArtifactIds: state.selectedArtifactIds.includes(artifactId)
            ? state.selectedArtifactIds.filter((id) => id !== artifactId)
            : [...state.selectedArtifactIds, artifactId],
        })),
      clearSelection: () => setState({ selectedArtifactIds: [] }),
      setVerificationStatus: (artifactId, status, note) =>
        setState((state) => ({
          verificationById: { ...state.verificationById, [artifactId]: status },
          verificationEvents: [
            {
              artifactId,
              decision: status,
              reviewer: "local-curator",
              decidedAt: new Date().toISOString(),
              note,
            },
            ...state.verificationEvents,
          ].slice(0, 200),
        })),
      addToSlot: (slotId, artifactId) =>
        setState((state) => ({
          lessonSlots: state.lessonSlots.map((slot) =>
            slot.id === slotId && !slot.itemIds.includes(artifactId)
              ? { ...slot, itemIds: [...slot.itemIds, artifactId] }
              : slot,
          ),
        })),
      removeFromSlot: (slotId, artifactId) =>
        setState((state) => ({
          lessonSlots: state.lessonSlots.map((slot) =>
            slot.id === slotId ? { ...slot, itemIds: slot.itemIds.filter((id) => id !== artifactId) } : slot,
          ),
        })),
      clearLesson: () => setState({ lessonSlots: seedLessonSlots }),
    }),
    {
      name: "mfie-build-surface-cache",
      storage: createJSONStorage(() => indexedDbStorage),
      partialize: (state) => ({
        activeView: state.activeView,
        searchQuery: state.searchQuery,
        selectedArtifactIds: state.selectedArtifactIds,
        facetSelections: state.facetSelections,
        verificationById: state.verificationById,
        verificationEvents: state.verificationEvents,
        lessonSlots: state.lessonSlots,
      }),
    },
  ),
);
