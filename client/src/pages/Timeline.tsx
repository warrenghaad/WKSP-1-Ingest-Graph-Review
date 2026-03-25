import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, Database, Image as ImageIcon, Search, BookOpen, Zap,
  ChevronRight, X, ExternalLink, Layers, Circle,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TimelineNode {
  id: string;
  track: "circle" | "crescent" | "star" | "triangle" | "square";
  year: number;
  r: number;
  title: string;
  desc: string;
  type: "gea" | "gek" | "gem" | "gephr" | "invention" | "artifact";
  dayB: string;
}

interface ConvergenceLink {
  year: number;
  y1: string;
  y2: string;
  label: string;
}

interface EntityRecord {
  entity: {
    id: number;
    label: string;
    description: string | null;
    period: string | null;
    magicTags: string[] | null;
    metadata: Record<string, unknown> | null;
  };
  assets: Array<{ id: number; url: string; thumbnailUrl: string | null; title: string | null; source: string | null; linkId: number; approved: boolean }>;
  requirementStatus: string;
}

const TRACK_META = {
  circle:   { y: 120, color: "#BA7517", bg: "#FAEEDA", label: "Circle (Shamash)" },
  crescent: { y: 240, color: "#888780", bg: "#F1EFE8", label: "Crescent (Sin)" },
  star:     { y: 360, color: "#534AB7", bg: "#EEEDFE", label: "8-Star (Ishtar)" },
  triangle: { y: 480, color: "#639922", bg: "#EAF3DE", label: "Triangle (Ninhursag)" },
  square:   { y: 600, color: "#378ADD", bg: "#E6F1FB", label: "Square (Enki)" },
};

const TYPE_COLORS: Record<string, string> = {
  gek: "#F97316",
  invention: "#22C55E",
  gephr: "#8B5CF6",
  gem: "#06B6D4",
  gea: "#EC4899",
  artifact: "#94A3B8",
};

const MAGIC_COLORS: Record<string, string> = {
  M: "#F97316", A: "#EC4899", G: "#22C55E", I: "#8B5CF6", C: "#EF4444",
};

const MIN_YEAR = -7200;
const MAX_YEAR = -200;
const W = 2600;
const H = 720;
const PAD_L = 160;
const PAD_R = 40;
const PAD_T = 60;

function xFor(year: number) {
  return PAD_L + ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * (W - PAD_L - PAD_R);
}

function formatYear(year: number) {
  return `${Math.abs(year).toLocaleString()} BCE`;
}

export default function Timeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTrack, setActiveTrack] = useState<string>("all");
  const [selectedNode, setSelectedNode] = useState<TimelineNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<TimelineNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [generatingImage, setGeneratingImage] = useState(false);
  const [discoveringArticle, setDiscoveringArticle] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [articleResults, setArticleResults] = useState<Record<string, string>>({});
  const [tab, setTab] = useState("detail");
  const qc = useQueryClient();

  const { data: nodesData } = useQuery<{ nodes: TimelineNode[]; convergences: ConvergenceLink[] }>({
    queryKey: ["/api/toolkit/timeline-nodes"],
  });

  const { data: entitiesData, isLoading: entitiesLoading } = useQuery<EntityRecord[]>({
    queryKey: ["/api/toolkit/timeline-entities"],
  });

  const seedMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/toolkit/seed-artifacts"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/toolkit/timeline-entities"] });
    },
  });

  const nodes = nodesData?.nodes ?? [];
  const convergences = nodesData?.convergences ?? [];

  const entityByTimelineId = (entitiesData ?? []).reduce<Record<string, EntityRecord>>((acc, rec) => {
    const meta = rec.entity.metadata;
    if (meta && typeof meta === "object" && "timelineId" in meta) {
      acc[meta.timelineId as string] = rec;
    }
    return acc;
  }, {});

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "#030308";
    ctx.fillRect(0, 0, W, H);

    const eras = [
      { start: -7000, end: -5000, label: "Neolithic / Ubaid" },
      { start: -5000, end: -3200, label: "Chalcolithic / Uruk" },
      { start: -3200, end: -2350, label: "Early Dynastic" },
      { start: -2350, end: -2000, label: "Akkadian / Ur III" },
      { start: -2000, end: -1600, label: "Old Babylonian" },
      { start: -1600, end: -900, label: "Kassite / Mid-Assyrian" },
      { start: -900, end: -200, label: "Neo-Assyrian / Babylonian" },
    ];

    eras.forEach((era, i) => {
      const x1 = xFor(era.start);
      const x2 = xFor(era.end);
      ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0)";
      ctx.fillRect(x1, 0, x2 - x1, H);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.font = "500 10px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(era.label, (x1 + x2) / 2, PAD_T - 10);
    });

    const centuries = [-7000, -6000, -5000, -4000, -3000, -2000, -1000];
    centuries.forEach((yr) => {
      const x = xFor(yr);
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 6]);
      ctx.beginPath(); ctx.moveTo(x, PAD_T); ctx.lineTo(x, H - 20); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.font = "400 10px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(formatYear(yr), x, H - 6);
    });

    Object.entries(TRACK_META).forEach(([key, t]) => {
      const show = activeTrack === "all" || activeTrack === key;
      ctx.globalAlpha = show ? 1 : 0.08;
      ctx.strokeStyle = t.color + "60";
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(PAD_L, t.y); ctx.lineTo(W - PAD_R, t.y); ctx.stroke();
      ctx.fillStyle = t.color;
      ctx.font = "500 11px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(t.label.split(" ")[0], PAD_L - 12, t.y + 4);
      ctx.font = "400 9px system-ui";
      ctx.fillStyle = t.color + "80";
      ctx.fillText(t.label.split(" ").slice(1).join(" "), PAD_L - 12, t.y + 15);
      ctx.globalAlpha = 1;
    });

    if (activeTrack === "all") {
      convergences.forEach((c) => {
        const x = xFor(c.year);
        const y1 = TRACK_META[c.y1 as keyof typeof TRACK_META]?.y;
        const y2 = TRACK_META[c.y2 as keyof typeof TRACK_META]?.y;
        if (!y1 || !y2) return;
        ctx.strokeStyle = "rgba(226,75,74,0.25)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#E24B4A";
        ctx.beginPath(); ctx.arc(x, (y1 + y2) / 2, 3, 0, Math.PI * 2); ctx.fill();
      });
    }

    nodes.forEach((node) => {
      const show = activeTrack === "all" || activeTrack === node.track;
      ctx.globalAlpha = show ? 1 : 0.04;
      const t = TRACK_META[node.track];
      const x = xFor(node.year);
      const y = t.y;
      const r = node.r + 2;
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const rec = entityByTimelineId[node.id];
      const hasEntity = !!rec;
      const hasAsset = hasEntity && rec.assets.length > 0;

      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(x, y, r + 6, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r + 10);
        glow.addColorStop(0, t.color + "60");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (node.type === "invention") {
        ctx.fillStyle = t.color;
      } else if (node.type === "gek") {
        ctx.fillStyle = "#F97316";
      } else if (hasAsset) {
        ctx.fillStyle = t.color + "CC";
      } else {
        ctx.fillStyle = t.bg + "33";
      }
      ctx.fill();
      ctx.strokeStyle = isSelected ? "#FFFFFF" : t.color;
      ctx.lineWidth = isSelected ? 2 : hasEntity ? 1.5 : 0.8;
      ctx.stroke();

      if (node.type === "invention") {
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${Math.max(r - 2, 7)}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("!", x, y + r * 0.35);
      } else if (node.type === "gek") {
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${Math.max(r - 3, 6)}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("M", x, y + r * 0.35);
      } else if (hasAsset) {
        ctx.fillStyle = "#22C55E";
        ctx.beginPath();
        ctx.arc(x + r - 2, y - r + 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      if (node.r >= 7 && show) {
        ctx.fillStyle = isSelected ? "#FFFFFF" : "rgba(255,255,255,0.6)";
        ctx.font = `400 9px system-ui`;
        ctx.textAlign = "left";
        const label = node.title.length > 28 ? node.title.slice(0, 26) + "…" : node.title;
        ctx.fillText(label, x + r + 4, y - 3);
      }

      ctx.globalAlpha = 1;
    });
  }, [nodes, convergences, activeTrack, selectedNode, hoveredNode, entityByTimelineId]);

  useEffect(() => { draw(); }, [draw]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * sx;
    const my = (e.clientY - rect.top) * sy;

    let hit: TimelineNode | null = null;
    for (const n of nodes) {
      if (activeTrack !== "all" && activeTrack !== n.track) continue;
      const x = xFor(n.year);
      const y = TRACK_META[n.track].y;
      const d = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
      if (d < n.r + 6) { hit = n; break; }
    }
    setHoveredNode(hit);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, [nodes, activeTrack]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * sx;
    const my = (e.clientY - rect.top) * sy;

    for (const n of nodes) {
      if (activeTrack !== "all" && activeTrack !== n.track) continue;
      const x = xFor(n.year);
      const y = TRACK_META[n.track].y;
      const d = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
      if (d < n.r + 6) {
        setSelectedNode(selectedNode?.id === n.id ? null : n);
        setTab("detail");
        return;
      }
    }
    setSelectedNode(null);
  }, [nodes, activeTrack, selectedNode]);

  const selectedEntity = selectedNode ? entityByTimelineId[selectedNode.id] : null;

  const handleGenerateImage = async () => {
    if (!selectedNode) return;
    setGeneratingImage(true);
    try {
      const prompt = `${selectedNode.title}, ${selectedNode.desc.slice(0, 150)}, ancient Mesopotamia`;
      const style = selectedNode.type === "gek" ? "diagram" : "museum_photograph";
      const res = await apiRequest("POST", "/api/toolkit/generate-image", {
        prompt, style, entityId: selectedEntity?.entity.id,
      }) as unknown as { url: string };
      setGeneratedImages((prev) => ({ ...prev, [selectedNode.id]: res.url }));
    } catch (err) {
      console.error("Image generation failed", err);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleDiscoverArticle = async () => {
    if (!selectedNode) return;
    setDiscoveringArticle(true);
    try {
      const res = await apiRequest("POST", "/api/toolkit/discover-articles", {
        title: selectedNode.title,
        context: selectedNode.desc.slice(0, 100),
        entityId: selectedEntity?.entity.id,
      }) as unknown as { answer: string; citations: Array<{ url: string }> };
      setArticleResults((prev) => ({ ...prev, [selectedNode.id]: res.answer }));
      qc.invalidateQueries({ queryKey: ["/api/toolkit/timeline-entities"] });
    } catch (err) {
      console.error("Article discovery failed", err);
    } finally {
      setDiscoveringArticle(false);
    }
  };

  const trackKeys = Object.keys(TRACK_META) as Array<keyof typeof TRACK_META>;

  return (
    <div className="flex flex-col h-screen bg-[#030308] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/8 flex-shrink-0 bg-[#07070f]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white/90">Chronos Annotated Timeline</h1>
            <p className="text-xs text-white/35">{nodes.length} artifacts · 5 geometric elements · -7000 to -200 BCE</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-white/10 bg-white/5 hover:bg-white/10 text-white/70"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            data-testid="button-seed-artifacts"
          >
            {seedMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Database className="w-3 h-3 mr-1" />}
            Seed {nodes.length} Artifacts
          </Button>
          {seedMutation.data && (
            <Badge variant="outline" className="text-xs border-green-500/30 text-green-400 bg-green-500/10">
              +{(seedMutation.data as unknown as { created: number }).created} created · {(seedMutation.data as unknown as { skipped: number }).skipped} skipped
            </Badge>
          )}
          {entitiesLoading && <Loader2 className="w-3 h-3 animate-spin text-white/30" />}
          {!entitiesLoading && (
            <Badge variant="outline" className="text-xs border-white/10 text-white/40">
              {entitiesData?.length ?? 0} ingested
            </Badge>
          )}
        </div>
      </div>

      {/* Track filter */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5 flex-shrink-0 bg-[#060610]">
        <button
          onClick={() => setActiveTrack("all")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${activeTrack === "all" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"}`}
          data-testid="button-filter-all"
        >
          All elements
        </button>
        {trackKeys.map((key) => {
          const meta = TRACK_META[key];
          return (
            <button
              key={key}
              onClick={() => setActiveTrack(activeTrack === key ? "all" : key)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                background: activeTrack === key ? meta.color + "30" : "transparent",
                color: activeTrack === key ? meta.color : "rgba(255,255,255,0.35)",
                border: `1px solid ${activeTrack === key ? meta.color + "60" : "rgba(255,255,255,0.08)"}`,
              }}
              data-testid={`button-filter-${key}`}
            >
              {meta.label.split(" ")[0]}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 text-xs text-white/25">
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#F97316]" /> M = math tablet</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#22C55E]" /> ! = invention</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-[#22C55E] ring-1 ring-[#22C55E]" /> sourced</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas pane */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden relative">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            style={{ height: "100%", width: "auto", maxWidth: "none", cursor: hoveredNode ? "pointer" : "default" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={handleClick}
            data-testid="canvas-timeline"
          />

          {hoveredNode && !selectedNode && (
            <div
              className="fixed z-50 pointer-events-none max-w-72"
              style={{ left: tooltipPos.x + 16, top: tooltipPos.y - 10 }}
            >
              <div className="bg-[#0d0f1e] border border-white/12 rounded-xl p-3 shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-mono px-1.5 py-0.5 rounded"
                    style={{ background: TYPE_COLORS[hoveredNode.type] + "25", color: TYPE_COLORS[hoveredNode.type] }}
                  >
                    {hoveredNode.type}
                  </span>
                  <span className="text-xs text-white/35">{formatYear(hoveredNode.year)}</span>
                </div>
                <p className="text-sm font-medium text-white/90 mb-1">{hoveredNode.title}</p>
                <p className="text-xs text-white/50 leading-relaxed line-clamp-3">{hoveredNode.desc}</p>
                <p className="text-xs text-amber-400/70 mt-1.5">{hoveredNode.dayB}</p>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedNode && (
          <div className="w-80 flex-shrink-0 border-l border-white/8 bg-[#07070f] flex flex-col overflow-hidden">
            <div className="flex items-start justify-between p-3 border-b border-white/8">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="text-xs font-mono px-1.5 py-0.5 rounded-md"
                    style={{ background: TYPE_COLORS[selectedNode.type] + "20", color: TYPE_COLORS[selectedNode.type] }}
                  >
                    {selectedNode.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-white/30 font-mono">{formatYear(selectedNode.year)}</span>
                </div>
                <h2 className="text-sm font-semibold text-white/90 leading-tight">{selectedNode.title}</h2>
                <div className="flex items-center gap-1 mt-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: TRACK_META[selectedNode.track].color }}
                  />
                  <span className="text-xs text-white/35">{TRACK_META[selectedNode.track].label}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="ml-2 text-white/30 hover:text-white/60 flex-shrink-0"
                data-testid="button-close-detail"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1 overflow-hidden">
              <TabsList className="mx-3 mt-2 mb-0 h-7 bg-white/5 rounded-lg flex-shrink-0">
                <TabsTrigger value="detail" className="text-xs flex-1 h-6">Detail</TabsTrigger>
                <TabsTrigger value="images" className="text-xs flex-1 h-6">Images</TabsTrigger>
                <TabsTrigger value="articles" className="text-xs flex-1 h-6">Articles</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <TabsContent value="detail" className="mt-0 p-3 space-y-3">
                  <p className="text-xs text-white/60 leading-relaxed">{selectedNode.desc}</p>

                  <div className="rounded-lg p-2.5 bg-amber-500/8 border border-amber-500/15">
                    <p className="text-xs text-amber-300/70 font-medium mb-0.5">Lesson connection</p>
                    <p className="text-xs text-amber-200/80">{selectedNode.dayB}</p>
                  </div>

                  {selectedEntity && (
                    <>
                      {selectedEntity.entity.magicTags && selectedEntity.entity.magicTags.length > 0 && (
                        <div>
                          <p className="text-xs text-white/30 font-medium mb-1.5">MAGIC dimensions</p>
                          <div className="flex gap-1.5 flex-wrap">
                            {selectedEntity.entity.magicTags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-full text-xs font-mono font-medium"
                                style={{ background: (MAGIC_COLORS[tag] ?? "#666") + "20", color: MAGIC_COLORS[tag] ?? "#aaa" }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedEntity.entity.period && (
                        <div className="flex items-center gap-2 text-xs">
                          <Circle className="w-3 h-3 text-white/20" />
                          <span className="text-white/40">{selectedEntity.entity.period}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-white/30">DB status:</span>
                        <Badge
                          variant="outline"
                          className="text-xs h-5"
                          style={{
                            borderColor: selectedEntity.requirementStatus === "COMPLETE" ? "#22C55E50" : "#F9731650",
                            color: selectedEntity.requirementStatus === "COMPLETE" ? "#22C55E" : "#F97316",
                          }}
                        >
                          {selectedEntity.requirementStatus}
                        </Badge>
                      </div>
                    </>
                  )}

                  {!selectedEntity && (
                    <div className="rounded-lg p-3 bg-white/3 border border-white/8 text-center">
                      <p className="text-xs text-white/35 mb-2">Not yet in database</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-white/15 text-white/60 hover:bg-white/8"
                        onClick={() => seedMutation.mutate()}
                        disabled={seedMutation.isPending}
                        data-testid="button-seed-single"
                      >
                        {seedMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Database className="w-3 h-3 mr-1" />}
                        Seed all artifacts
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="images" className="mt-0 p-3 space-y-3">
                  {selectedEntity?.assets.length ? (
                    <div className="space-y-2">
                      <p className="text-xs text-white/30 font-medium">Sourced images</p>
                      {selectedEntity.assets.map((asset) => (
                        <div key={asset.id} className="rounded-lg overflow-hidden border border-white/8">
                          <img
                            src={asset.thumbnailUrl ?? asset.url}
                            alt={asset.title ?? selectedNode.title}
                            className="w-full h-32 object-cover"
                            data-testid={`img-asset-${asset.id}`}
                          />
                          <div className="p-2">
                            <p className="text-xs text-white/60 truncate">{asset.title}</p>
                            <p className="text-xs text-white/30">{asset.source}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg p-3 bg-white/3 border border-white/8 text-center">
                      <ImageIcon className="w-6 h-6 text-white/20 mx-auto mb-2" />
                      <p className="text-xs text-white/35 mb-2">No images sourced yet</p>
                    </div>
                  )}

                  {generatedImages[selectedNode.id] && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-white/30 font-medium">AI generated</p>
                      <div className="rounded-lg overflow-hidden border border-purple-500/20">
                        <img
                          src={generatedImages[selectedNode.id]}
                          alt={`AI: ${selectedNode.title}`}
                          className="w-full object-cover"
                          data-testid="img-generated"
                        />
                        <div className="p-2 bg-purple-500/8">
                          <p className="text-xs text-purple-300/70">Gemini · museum photograph style</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    size="sm"
                    className="w-full h-8 text-xs bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300"
                    onClick={handleGenerateImage}
                    disabled={generatingImage}
                    data-testid="button-generate-image"
                  >
                    {generatingImage ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Zap className="w-3 h-3 mr-1.5" />}
                    {generatingImage ? "Generating…" : "Generate with Gemini"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs border-white/10 text-white/50 hover:bg-white/5"
                    onClick={() => {
                      const q = encodeURIComponent(`${selectedNode.title} Mesopotamia museum`);
                      window.open(`/reader?q=${q}`, "_blank");
                    }}
                    data-testid="button-open-reader"
                  >
                    <Search className="w-3 h-3 mr-1.5" />
                    Search in PRISM Reader
                  </Button>
                </TabsContent>

                <TabsContent value="articles" className="mt-0 p-3 space-y-3">
                  {articleResults[selectedNode.id] ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-blue-400" />
                        <p className="text-xs text-white/40 font-medium">Discovered via Perplexity</p>
                      </div>
                      <div className="rounded-lg p-3 bg-blue-500/5 border border-blue-500/15">
                        <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap">
                          {articleResults[selectedNode.id]}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg p-3 bg-white/3 border border-white/8 text-center">
                      <BookOpen className="w-6 h-6 text-white/20 mx-auto mb-2" />
                      <p className="text-xs text-white/35 mb-1">No articles discovered yet</p>
                      <p className="text-xs text-white/20">Uses Perplexity to find scholarly sources</p>
                    </div>
                  )}

                  <Button
                    size="sm"
                    className="w-full h-8 text-xs bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-300"
                    onClick={handleDiscoverArticle}
                    disabled={discoveringArticle || !selectedEntity}
                    data-testid="button-discover-articles"
                  >
                    {discoveringArticle ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Search className="w-3 h-3 mr-1.5" />}
                    {discoveringArticle ? "Searching…" : "Discover articles"}
                  </Button>

                  {!selectedEntity && (
                    <p className="text-xs text-white/25 text-center">Seed artifact first to store results</p>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs border-white/10 text-white/50 hover:bg-white/5"
                    onClick={() => window.open(`/reader?entity=${selectedNode.title}`, "_blank")}
                    data-testid="button-open-reader-articles"
                  >
                    <ExternalLink className="w-3 h-3 mr-1.5" />
                    Open in Reader
                  </Button>

                  {selectedEntity && (
                    <div>
                      <p className="text-xs text-white/30 font-medium mb-2">Search queries</p>
                      <div className="space-y-1">
                        {((selectedEntity.entity.metadata?.searchQueries as string[] | undefined) ?? []).map((q, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/3 border border-white/6 cursor-pointer hover:bg-white/6"
                            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank")}
                            data-testid={`text-query-${i}`}
                          >
                            <ChevronRight className="w-3 h-3 text-white/20 flex-shrink-0" />
                            <span className="text-xs text-white/50 truncate">{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        )}
      </div>

      {/* Bottom summary bar */}
      <div className="flex items-center gap-4 px-4 py-1.5 border-t border-white/5 bg-[#050508] flex-shrink-0 text-xs text-white/25">
        <span>{nodes.filter(n => n.type === "gek").length} math tablets (M)</span>
        <span>{nodes.filter(n => n.type === "invention").length} inventions (!)</span>
        <span>{nodes.filter(n => n.type === "artifact").length} artifacts</span>
        <span>{convergences.length} convergence points</span>
        <span className="ml-auto">{entitiesData?.filter(e => e.assets.length > 0).length ?? 0} with sourced images</span>
      </div>
    </div>
  );
}
