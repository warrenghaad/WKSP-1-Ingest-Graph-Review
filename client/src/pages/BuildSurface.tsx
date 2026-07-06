import { useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  Database,
  Download,
  Filter,
  Grid3X3,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  Search,
  Sparkles,
  Table2,
  X,
} from "lucide-react";
import { BUILD_SURFACE_FACETS, seedArtifacts } from "@/lib/buildSurfaceSeed";
import type { CatalogueArtifact, VerificationStatus } from "@/lib/buildSurfaceTypes";
import { getSupabaseImageUrl } from "@/lib/supabaseClient";
import { useBuildSurfaceStore } from "@/store/buildSurfaceStore";

const STATUS_LABELS: Record<VerificationStatus, string> = {
  approved: "Approved",
  unverified: "Unverified",
  rejected: "Rejected",
  needs_info: "Needs info",
};

const STATUS_CLASSES: Record<VerificationStatus, string> = {
  approved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  unverified: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  rejected: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  needs_info: "border-sky-400/30 bg-sky-400/10 text-sky-200",
};

const VIEW_TABS = [
  { id: "gallery", label: "Gallery", icon: Grid3X3 },
  { id: "table", label: "Table", icon: Table2 },
  { id: "board", label: "Board", icon: LayoutDashboard },
  { id: "inbox", label: "Inbox", icon: Inbox },
] as const;

const columnHelper = createColumnHelper<CatalogueArtifact>();

const tableColumns = [
  columnHelper.accessor("title", {
    header: "Artifact",
    cell: (info) => (
      <div>
        <div className="font-medium text-white">{info.getValue()}</div>
        <div className="text-[11px] text-white/40">{info.row.original.subtitle}</div>
      </div>
    ),
  }),
  columnHelper.accessor("verificationStatus", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor((row) => row.tags.civilization?.join(", ") ?? "", {
    id: "civilization",
    header: "Civilization",
    cell: (info) => <span className="text-white/70">{info.getValue() || "—"}</span>,
  }),
  columnHelper.accessor((row) => row.tags.geometry?.join(", ") ?? "", {
    id: "geometry",
    header: "Geometry",
    cell: (info) => <span className="text-white/70">{info.getValue() || "—"}</span>,
  }),
  columnHelper.accessor("license", {
    header: "License",
    cell: (info) => <span className="text-white/60">{info.getValue()}</span>,
  }),
];

export default function BuildSurface() {
  const [, navigate] = useLocation();
  const activeView = useBuildSurfaceStore((state) => state.activeView);
  const setActiveView = useBuildSurfaceStore((state) => state.setActiveView);
  const searchQuery = useBuildSurfaceStore((state) => state.searchQuery);
  const setSearchQuery = useBuildSurfaceStore((state) => state.setSearchQuery);
  const facetSelections = useBuildSurfaceStore((state) => state.facetSelections);
  const toggleFacet = useBuildSurfaceStore((state) => state.toggleFacet);
  const clearFacets = useBuildSurfaceStore((state) => state.clearFacets);
  const verificationById = useBuildSurfaceStore((state) => state.verificationById);
  const lessonSlots = useBuildSurfaceStore((state) => state.lessonSlots);
  const addToSlot = useBuildSurfaceStore((state) => state.addToSlot);
  const clearLesson = useBuildSurfaceStore((state) => state.clearLesson);
  const verificationEvents = useBuildSurfaceStore((state) => state.verificationEvents);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const artifacts = useMemo(
    () =>
      seedArtifacts.map((artifact) => ({
        ...artifact,
        verificationStatus: verificationById[artifact.id] ?? artifact.verificationStatus,
        thumbUrl: getSupabaseImageUrl(artifact.thumbUrl, 400, 80),
        imageUrl: getSupabaseImageUrl(artifact.imageUrl, 1200, 85),
      })),
    [verificationById],
  );

  const filteredArtifacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return artifacts.filter((artifact) => {
      if (query) {
        const haystack = [
          artifact.title,
          artifact.subtitle,
          artifact.description,
          artifact.source,
          artifact.license,
          ...Object.values(artifact.tags).flat(),
          ...artifact.primitiveRefs,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return Object.entries(facetSelections).every(([dimension, selected]) => {
        if (!selected.length) return true;
        if (dimension === "verificationStatus") return selected.includes(artifact.verificationStatus);
        const values = artifact.tags[dimension as keyof typeof artifact.tags] ?? [];
        return selected.some((value) => values.includes(value));
      });
    });
  }, [artifacts, facetSelections, searchQuery]);

  const facetCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = { verificationStatus: {} };
    for (const artifact of artifacts) {
      counts.verificationStatus[artifact.verificationStatus] = (counts.verificationStatus[artifact.verificationStatus] ?? 0) + 1;
      for (const dimension of BUILD_SURFACE_FACETS) {
        counts[dimension] ??= {};
        for (const value of artifact.tags[dimension] ?? []) {
          counts[dimension][value] = (counts[dimension][value] ?? 0) + 1;
        }
      }
    }
    return counts;
  }, [artifacts]);

  const activeArtifact = useMemo(
    () => artifacts.find((artifact) => artifact.id === activeDragId) ?? null,
    [activeDragId, artifacts],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const artifactId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    if (overId?.startsWith("slot:")) addToSlot(overId, artifactId);
    setActiveDragId(null);
  }

  function exportLessonJson() {
    const payload = {
      schema: "mfie.lesson.selection.v0",
      generatedAt: new Date().toISOString(),
      slots: lessonSlots.map((slot) => ({
        id: slot.id,
        label: slot.label,
        helper: slot.helper,
        items: slot.itemIds.map((id) => artifacts.find((artifact) => artifact.id === id)).filter(Boolean),
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mfie-lesson-selection.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveDragId(null)}>
      <main className="min-h-screen bg-[#05070d] text-white">
        <header className="border-b border-white/10 bg-[#080b12]/95 sticky top-0 z-30 backdrop-blur-xl">
          <div className="max-w-[1560px] mx-auto px-5 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <button
                className="mt-1 h-9 w-9 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center"
                onClick={() => navigate("/")}
                aria-label="Back to home"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-amber-300/70">
                  <Database className="h-3.5 w-3.5" /> MFIE build surface
                </div>
                <h1 className="text-2xl md:text-3xl font-serif font-semibold mt-1">Catalogue, verification, and lesson assembly</h1>
                <p className="text-sm text-white/45 max-w-3xl mt-1">
                  A v0 local-first catalogue surface: facet the seed image library, approve/reject assets, drag cards into lesson slots, and export a stable production contract.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {VIEW_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`h-9 rounded-xl px-3 text-xs border flex items-center gap-2 transition ${
                      activeView === tab.id
                        ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
                        : "border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.06]"
                    }`}
                    onClick={() => setActiveView(tab.id)}
                  >
                    <Icon className="h-3.5 w-3.5" /> {tab.label}
                  </button>
                );
              })}
              <button
                className="h-9 rounded-xl px-3 text-xs border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15 flex items-center gap-2"
                onClick={exportLessonJson}
              >
                <Download className="h-3.5 w-3.5" /> Export lesson JSON
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-[1560px] mx-auto p-5 grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_360px] gap-5">
          <FacetRail facetCounts={facetCounts} selections={facetSelections} toggleFacet={toggleFacet} clearFacets={clearFacets} />

          <section className="min-w-0 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search title, primitive, civilization, source, PFMD…"
                  className="w-full h-10 rounded-xl bg-black/30 border border-white/10 pl-10 pr-3 text-sm outline-none focus:border-amber-400/50 placeholder:text-white/25"
                />
              </div>
              <div className="text-xs text-white/40 flex items-center gap-3">
                <span>{filteredArtifacts.length} visible</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>{artifacts.length} seeded</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>{verificationEvents.length} review events cached</span>
              </div>
            </div>

            {activeView === "gallery" && <GalleryView artifacts={filteredArtifacts} />}
            {activeView === "table" && <TableView artifacts={filteredArtifacts} />}
            {activeView === "board" && <BoardView artifacts={filteredArtifacts} />}
            {activeView === "inbox" && <VerificationInbox artifacts={filteredArtifacts} />}
          </section>

          <LessonBuilder artifacts={artifacts} clearLesson={clearLesson} />
        </div>
      </main>

      <DragOverlay>{activeArtifact ? <ArtifactCard artifact={activeArtifact} compact overlay /> : null}</DragOverlay>
    </DndContext>
  );
}

function FacetRail({
  facetCounts,
  selections,
  toggleFacet,
  clearFacets,
}: {
  facetCounts: Record<string, Record<string, number>>;
  selections: Record<string, string[]>;
  toggleFacet: (dimension: string, value: string) => void;
  clearFacets: () => void;
}) {
  const dimensions = ["verificationStatus", ...BUILD_SURFACE_FACETS] as const;

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 h-fit xl:sticky xl:top-24">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/35">
          <Filter className="h-3.5 w-3.5" /> Facets
        </div>
        <button className="text-[11px] text-white/35 hover:text-white" onClick={clearFacets}>
          clear
        </button>
      </div>
      <div className="space-y-4">
        {dimensions.map((dimension) => {
          const values = Object.entries(facetCounts[dimension] ?? {}).sort((a, b) => b[1] - a[1]);
          if (values.length === 0) return null;
          return (
            <div key={dimension}>
              <h3 className="text-[11px] uppercase tracking-[0.16em] text-amber-200/50 mb-2">{dimension}</h3>
              <div className="space-y-1">
                {values.map(([value, count]) => {
                  const active = selections[dimension]?.includes(value) ?? false;
                  return (
                    <button
                      key={value}
                      className={`w-full flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition ${
                        active
                          ? "border-amber-400/40 bg-amber-400/10 text-amber-100"
                          : "border-white/5 bg-white/[0.02] text-white/45 hover:text-white/80 hover:bg-white/[0.05]"
                      }`}
                      onClick={() => toggleFacet(dimension, value)}
                    >
                      <span className="truncate">{dimension === "verificationStatus" ? STATUS_LABELS[value as VerificationStatus] : value}</span>
                      <span className="text-white/25">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function GalleryView({ artifacts }: { artifacts: CatalogueArtifact[] }) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const columns = 3;
  const rows = useMemo(() => {
    const chunks: CatalogueArtifact[][] = [];
    for (let i = 0; i < artifacts.length; i += columns) chunks.push(artifacts.slice(i, i + columns));
    return chunks;
  }, [artifacts]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 372,
    overscan: 4,
  });

  return (
    <div ref={parentRef} className="h-[calc(100vh-190px)] overflow-auto rounded-2xl border border-white/10 bg-black/20">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            className="absolute left-0 top-0 w-full p-3 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3"
            style={{ transform: `translateY(${virtualRow.start}px)` }}
          >
            {rows[virtualRow.index]?.map((artifact) => <ArtifactCard key={artifact.id} artifact={artifact} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function ArtifactCard({ artifact, compact = false, overlay = false }: { artifact: CatalogueArtifact; compact?: boolean; overlay?: boolean }) {
  const toggleSelected = useBuildSurfaceStore((state) => state.toggleSelected);
  const selected = useBuildSurfaceStore((state) => state.selectedArtifactIds.includes(artifact.id));
  const setVerificationStatus = useBuildSurfaceStore((state) => state.setVerificationStatus);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: artifact.id, data: { artifactId: artifact.id } });
  const style = transform ? { transform: CSS.Transform.toString(transform) } : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group rounded-2xl border bg-[#0b0f19] overflow-hidden transition ${
        selected ? "border-amber-400/50 ring-1 ring-amber-400/30" : "border-white/10 hover:border-white/20"
      } ${isDragging && !overlay ? "opacity-30" : "opacity-100"} ${overlay ? "w-80 shadow-2xl border-amber-400/60" : ""}`}
    >
      <div className={`${compact ? "h-28" : "h-44"} relative overflow-hidden`} {...attributes} {...listeners}>
        <img src={artifact.thumbUrl} alt={artifact.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          <StatusBadge status={artifact.verificationStatus} />
        </div>
        <button
          className={`absolute top-2 right-2 rounded-lg border px-2 py-1 text-[11px] ${
            selected ? "border-amber-400/40 bg-amber-400/20 text-amber-100" : "border-white/10 bg-black/40 text-white/50 hover:text-white"
          }`}
          onClick={(event) => {
            event.stopPropagation();
            toggleSelected(artifact.id);
          }}
        >
          {selected ? "picked" : "pick"}
        </button>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-sm font-semibold text-white leading-tight">{artifact.title}</h3>
          <p className="text-[11px] text-white/55 mt-0.5 line-clamp-1">{artifact.subtitle}</p>
        </div>
      </div>
      {!compact && (
        <div className="p-3 space-y-3">
          <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{artifact.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {(artifact.tags.geometry ?? []).slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/45">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/25">{artifact.license}</div>
            <div className="flex gap-1">
              <button className="h-7 rounded-lg border border-emerald-400/20 px-2 text-[11px] text-emerald-200 hover:bg-emerald-400/10" onClick={() => setVerificationStatus(artifact.id, "approved")}>Approve</button>
              <button className="h-7 rounded-lg border border-sky-400/20 px-2 text-[11px] text-sky-200 hover:bg-sky-400/10" onClick={() => setVerificationStatus(artifact.id, "needs_info")}>Info</button>
              <button className="h-7 rounded-lg border border-rose-400/20 px-2 text-[11px] text-rose-200 hover:bg-rose-400/10" onClick={() => setVerificationStatus(artifact.id, "rejected")}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function StatusBadge({ status }: { status: VerificationStatus }) {
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_CLASSES[status]}`}>{STATUS_LABELS[status]}</span>;
}

function TableView({ artifacts }: { artifacts: CatalogueArtifact[] }) {
  const table = useReactTable({ data: artifacts, columns: tableColumns, getCoreRowModel: getCoreRowModel() });
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/20">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.04] text-[11px] uppercase tracking-[0.16em] text-white/35">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 text-left font-medium">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-white/5 hover:bg-white/[0.03]">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 align-top">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BoardView({ artifacts }: { artifacts: CatalogueArtifact[] }) {
  const statuses: VerificationStatus[] = ["unverified", "needs_info", "approved", "rejected"];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-3">
      {statuses.map((status) => {
        const items = artifacts.filter((artifact) => artifact.verificationStatus === status);
        return (
          <section key={status} className="rounded-2xl border border-white/10 bg-black/20 p-3 min-h-[420px]">
            <div className="flex items-center justify-between mb-3">
              <StatusBadge status={status} />
              <span className="text-xs text-white/30">{items.length}</span>
            </div>
            <div className="space-y-3">
              {items.map((artifact) => <ArtifactCard key={artifact.id} artifact={artifact} compact />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function VerificationInbox({ artifacts }: { artifacts: CatalogueArtifact[] }) {
  const setVerificationStatus = useBuildSurfaceStore((state) => state.setVerificationStatus);
  const queue = artifacts.filter((artifact) => artifact.verificationStatus !== "approved" && artifact.verificationStatus !== "rejected");

  if (queue.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-10 text-center">
        <Check className="h-10 w-10 text-emerald-300 mx-auto mb-3" />
        <h2 className="text-lg font-serif">Review queue cleared</h2>
        <p className="text-sm text-white/45 mt-1">Every visible item is either approved or rejected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {queue.map((artifact) => (
        <article key={artifact.id} className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
          <img src={artifact.thumbUrl} alt={artifact.title} loading="lazy" decoding="async" className="h-64 lg:h-full w-full object-cover" />
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <StatusBadge status={artifact.verificationStatus} />
                <h2 className="text-xl font-serif mt-3">{artifact.title}</h2>
                <p className="text-sm text-white/45 mt-1">{artifact.subtitle}</p>
              </div>
              <div className="flex gap-2">
                <button className="h-9 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 text-xs text-emerald-100 hover:bg-emerald-400/15 flex items-center gap-1.5" onClick={() => setVerificationStatus(artifact.id, "approved", "Approved in build surface inbox")}> <Check className="h-3.5 w-3.5" /> Approve</button>
                <button className="h-9 rounded-xl border border-sky-400/30 bg-sky-400/10 px-3 text-xs text-sky-100 hover:bg-sky-400/15 flex items-center gap-1.5" onClick={() => setVerificationStatus(artifact.id, "needs_info", "Needs stronger source or pairing evidence")}> <HelpCircle className="h-3.5 w-3.5" /> Needs info</button>
                <button className="h-9 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 text-xs text-rose-100 hover:bg-rose-400/15 flex items-center gap-1.5" onClick={() => setVerificationStatus(artifact.id, "rejected", "Rejected in build surface inbox")}> <X className="h-3.5 w-3.5" /> Reject</button>
              </div>
            </div>
            <p className="text-sm text-white/55 leading-relaxed">{artifact.description}</p>
            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <InfoBox title="Source" value={`${artifact.source} · ${artifact.sourceId}`} />
              <InfoBox title="License" value={artifact.license} />
              <InfoBox title="Primitive refs" value={artifact.primitiveRefs.join(", ")} />
              <InfoBox title="Image prompt" value={artifact.imagePrompt} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-amber-200/40 mb-1">{title}</div>
      <div className="text-white/60 leading-relaxed">{value}</div>
    </div>
  );
}

function LessonBuilder({ artifacts, clearLesson }: { artifacts: CatalogueArtifact[]; clearLesson: () => void }) {
  const lessonSlots = useBuildSurfaceStore((state) => state.lessonSlots);
  const removeFromSlot = useBuildSurfaceStore((state) => state.removeFromSlot);
  const pickedCount = lessonSlots.reduce((sum, slot) => sum + slot.itemIds.length, 0);

  const markdown = useMemo(() => {
    const lines = ["---", "schema: mfie.lesson.selection.v0", `generatedAt: ${new Date().toISOString()}`, "---", "", "# MFIE Lesson Selection", ""];
    for (const slot of lessonSlots) {
      lines.push(`## ${slot.label}`, "", slot.helper, "");
      for (const id of slot.itemIds) {
        const artifact = artifacts.find((candidate) => candidate.id === id);
        if (!artifact) continue;
        lines.push(`- **${artifact.title}** — ${artifact.subtitle}`);
      }
      lines.push("");
    }
    return lines.join("\n");
  }, [artifacts, lessonSlots]);

  function copyMarkdown() {
    void navigator.clipboard?.writeText(markdown);
  }

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 h-fit xl:sticky xl:top-24">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/35">
            <ClipboardList className="h-3.5 w-3.5" /> Lesson builder
          </div>
          <p className="text-xs text-white/35 mt-1">Drag catalogue cards into slots.</p>
        </div>
        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-100">{pickedCount} picked</span>
      </div>

      <div className="space-y-3">
        {lessonSlots.map((slot) => (
          <LessonDropSlot key={slot.id} slotId={slot.id} label={slot.label} helper={slot.helper}>
            {slot.itemIds.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-white/25">Drop artifact here</div>
            ) : (
              <div className="space-y-2">
                {slot.itemIds.map((id) => {
                  const artifact = artifacts.find((candidate) => candidate.id === id);
                  if (!artifact) return null;
                  return (
                    <div key={id} className="rounded-xl border border-white/10 bg-black/30 p-2 flex gap-2 items-center">
                      <img src={artifact.thumbUrl} alt="" className="h-11 w-11 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-white/80 truncate">{artifact.title}</div>
                        <div className="text-[10px] text-white/35 truncate">{artifact.primitiveRefs.join(" · ")}</div>
                      </div>
                      <button className="h-7 w-7 rounded-lg border border-white/10 text-white/35 hover:text-white hover:bg-white/[0.06]" onClick={() => removeFromSlot(slot.id, id)}>
                        <X className="h-3.5 w-3.5 mx-auto" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </LessonDropSlot>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="h-9 rounded-xl border border-white/10 bg-white/[0.03] text-xs text-white/55 hover:text-white hover:bg-white/[0.06]" onClick={copyMarkdown}>
          Copy MD
        </button>
        <button className="h-9 rounded-xl border border-white/10 bg-white/[0.03] text-xs text-white/55 hover:text-white hover:bg-white/[0.06]" onClick={clearLesson}>
          Clear
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
        <div className="flex items-center gap-2 text-xs text-amber-100 mb-1">
          <Sparkles className="h-3.5 w-3.5" /> Production contract
        </div>
        <p className="text-[11px] text-white/40 leading-relaxed">
          This v0 exports the JSON/Markdown shape that the later Supabase, image pipeline, ArtisanalCanvas, and MFIE animation cells can consume.
        </p>
      </div>
    </aside>
  );
}

function LessonDropSlot({ slotId, label, helper, children }: { slotId: string; label: string; helper: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId });
  return (
    <section ref={setNodeRef} className={`rounded-2xl border p-3 transition ${isOver ? "border-amber-400/60 bg-amber-400/10" : "border-white/10 bg-white/[0.02]"}`}>
      <div className="mb-2">
        <h3 className="text-sm font-medium text-white/85">{label}</h3>
        <p className="text-[11px] text-white/35 leading-relaxed mt-0.5">{helper}</p>
      </div>
      {children}
    </section>
  );
}
