import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface OntologyDimension { id: string; name: string; description: string | null }
interface OntologyElement { id: string; dimension: string; name: string; variants: string[] | null }
interface OntologyOperation { id: string; name: string; description: string | null }
interface OntologyMaterial { id: string; name: string; classes: string[] | null }
interface OntologyTechnique { id: string; name: string }
interface OntologyMathConcept { id: string; name: string; topics: string[] | null }
interface OntologyCulture { id: string; name: string }
interface OntologyArchElement { id: string; name: string }
interface OntologyPatternType { id: string; name: string; groups: string | null }
interface OntologyManifestation {
  id: string; title: string; dimensionMapping: string | null;
  elements: string[] | null; materials: string[] | null; techniques: string[] | null;
  culture: string | null; patternType: string | null; mathLinks: string[] | null;
  description: string | null; metadata: any;
}
interface OntologyArchTranslation {
  id: string; title: string; from2dPattern: string | null; to3dElement: string | null;
  operations: string[] | null; benefits: string[] | null; mathLinks: string[] | null;
}
interface OntologyDeity {
  id: string; name: string; culture: string | null; domains: string[] | null;
  symbols: string[] | null; geometricAssociations: string[] | null; stories: string[] | null;
}
interface OntologySymbol { symbol: string; linkedTo: string[] | null; geometric: string[] | null }

interface OntologyAll {
  dimensions: OntologyDimension[];
  elements: OntologyElement[];
  operations: OntologyOperation[];
  patternTypes: OntologyPatternType[];
  materials: OntologyMaterial[];
  techniques: OntologyTechnique[];
  archElements: OntologyArchElement[];
  mathConcepts: OntologyMathConcept[];
  cultures: OntologyCulture[];
  manifestations: OntologyManifestation[];
  archTranslations: OntologyArchTranslation[];
  deities: OntologyDeity[];
  symbols: OntologySymbol[];
}

const CULTURE_COLORS: Record<string, string> = {
  "civ-egypt": "#c6a82b",
  "civ-greece": "#3b82f6",
  "civ-islam": "#16a34a",
  "civ-india": "#f97316",
  "civ-china": "#ef4444",
  "civ-meso": "#8b5cf6",
  "civ-medieval-eu": "#64748b",
  "civ-renaissance": "#d946ef",
  "civ-andes": "#78716c",
};

const DIM_MAP_LABELS: Record<string, string> = {
  "map-1d-on-2d": "1D on 2D",
  "map-1d-on-3d": "1D on 3D",
  "map-1d-builds-2d-on-2d": "1D → 2D on 2D",
  "map-2d-on-2d": "2D on 2D",
  "map-2d-on-3d": "2D on 3D",
  "map-2d-to-3d": "2D → 3D",
  "map-3d-objects": "3D Objects",
  "map-3d-versions-of-2d": "3D ver. of 2D",
};

function Badge({ label, color = "#64748b" }: { label: string; color?: string }) {
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}55`, borderRadius: 4, padding: "1px 8px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function ManifestationCard({
  item, cultures, elements, materials, mathConcepts, deities, archTranslations, symbols,
  expanded, onClick,
}: {
  item: OntologyManifestation;
  cultures: OntologyCulture[];
  elements: OntologyElement[];
  materials: OntologyMaterial[];
  mathConcepts: OntologyMathConcept[];
  deities: OntologyDeity[];
  archTranslations: OntologyArchTranslation[];
  symbols: OntologySymbol[];
  expanded: boolean;
  onClick: () => void;
}) {
  const cultureName = cultures.find(c => c.id === item.culture)?.name;
  const cultureColor = item.culture ? CULTURE_COLORS[item.culture] ?? "#64748b" : "#64748b";
  const dimLabel = item.dimensionMapping ? (DIM_MAP_LABELS[item.dimensionMapping] ?? item.dimensionMapping) : null;

  const elementNames = (item.elements ?? []).map(eid => {
    const el = elements.find(e => e.id === eid);
    return el?.name ?? eid;
  });

  const materialNames = (item.materials ?? []).map(mid => {
    const mat = materials.find(m => m.id === mid);
    return mat?.name ?? mid;
  });

  const mathNames = (item.mathLinks ?? []).map(mid => {
    const mc = mathConcepts.find(m => m.id === mid);
    return mc?.name ?? mid;
  });

  const relatedDeities = deities.filter(d =>
    d.culture === item.culture
  );

  const relatedTranslations = archTranslations.filter(at =>
    (item.elements ?? []).some(eid => at.to3dElement?.includes(eid.replace("geo-", "arch-"))) ||
    (item.patternType && at.from2dPattern === item.patternType)
  );

  const relatedSymbols = symbols.filter(s =>
    relatedDeities.some(d => s.linkedTo?.includes(d.id))
  );

  return (
    <div
      data-testid={`card-manifestation-${item.id}`}
      onClick={onClick}
      style={{
        background: expanded ? "#1e293b" : "#0f172a",
        border: `1px solid ${expanded ? cultureColor + "66" : "#1e293b"}`,
        borderRadius: 10, padding: 16, cursor: "pointer",
        transition: "all 0.15s", gridColumn: expanded ? "1 / -1" : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 6 }}>{item.title}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
            {dimLabel && <Badge label={dimLabel} color="#3b82f6" />}
            {cultureName && <Badge label={cultureName} color={cultureColor} />}
          </div>
          {!expanded && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {elementNames.slice(0, 3).map(n => <Badge key={n} label={n} color="#8b5cf6" />)}
              {materialNames.slice(0, 2).map(n => <Badge key={n} label={n} color="#78716c" />)}
            </div>
          )}
        </div>
        <div style={{ color: "#64748b", fontSize: 12 }}>{expanded ? "▲" : "▼"}</div>
      </div>

      {expanded && (
        <div style={{ marginTop: 12, borderTop: "1px solid #1e293b", paddingTop: 12 }}>
          {item.description && (
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>{item.description}</p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 12 }}>
            {elementNames.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Elements</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {elementNames.map(n => <Badge key={n} label={n} color="#8b5cf6" />)}
                </div>
              </div>
            )}
            {materialNames.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Materials</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {materialNames.map(n => <Badge key={n} label={n} color="#78716c" />)}
                </div>
              </div>
            )}
            {(item.techniques ?? []).length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Techniques</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {(item.techniques ?? []).map(t => <Badge key={t} label={t.replace("tech-", "")} color="#0ea5e9" />)}
                </div>
              </div>
            )}
            {mathNames.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Math Links</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {mathNames.map(n => <Badge key={n} label={n} color="#eab308" />)}
                </div>
              </div>
            )}
          </div>

          {relatedDeities.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 600, textTransform: "uppercase" }}>Related Deities</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {relatedDeities.map(d => (
                  <div key={d.id} style={{ background: "#1e293b", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}>
                    <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{d.name}</span>
                    {d.domains && <span style={{ color: "#64748b" }}> — {d.domains.join(", ")}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {relatedTranslations.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 600, textTransform: "uppercase" }}>Architecture Translations</div>
              {relatedTranslations.map(at => (
                <div key={at.id} style={{ background: "#1e293b", borderRadius: 6, padding: "6px 10px", marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{at.title}</span>
                  {at.benefits && <span style={{ color: "#64748b" }}> — {at.benefits.join(", ")}</span>}
                </div>
              ))}
            </div>
          )}

          {relatedSymbols.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 600, textTransform: "uppercase" }}>Symbols</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {relatedSymbols.map(s => (
                  <div key={s.symbol} style={{ background: "#1e293b", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}>
                    <span style={{ color: "#a78bfa", fontWeight: 600 }}>{s.symbol}</span>
                    {s.geometric && <span style={{ color: "#64748b" }}> — {s.geometric.join(", ")}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DeityCard({ deity }: { deity: OntologyDeity }) {
  const [expanded, setExpanded] = useState(false);
  const cultureColor = deity.culture ? CULTURE_COLORS[deity.culture] ?? "#64748b" : "#64748b";

  return (
    <div
      data-testid={`card-deity-${deity.id}`}
      onClick={() => setExpanded(!expanded)}
      style={{ background: "#0f172a", border: `1px solid ${expanded ? cultureColor + "66" : "#1e293b"}`, borderRadius: 10, padding: 16, cursor: "pointer" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>{deity.name}</div>
        <span style={{ color: "#64748b", fontSize: 12 }}>{expanded ? "▲" : "▼"}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
        {(deity.domains ?? []).map(d => <Badge key={d} label={d} color={cultureColor} />)}
      </div>

      {expanded && (
        <div style={{ marginTop: 10, borderTop: "1px solid #1e293b", paddingTop: 10 }}>
          {deity.symbols && deity.symbols.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Symbols</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {deity.symbols.map(s => <Badge key={s} label={s} color="#a78bfa" />)}
              </div>
            </div>
          )}
          {deity.geometricAssociations && deity.geometricAssociations.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Geometric Associations</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {deity.geometricAssociations.map(g => <Badge key={g} label={g} color="#eab308" />)}
              </div>
            </div>
          )}
          {deity.stories && deity.stories.map((story, i) => (
            <p key={i} style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>{story}</p>
          ))}
        </div>
      )}
    </div>
  );
}

interface LicensedResource {
  id: number; title: string; section: string; imageUrl: string | null;
  source: string; license: string; dimensionMapping: string | null;
  geometricElements: string[] | null; materials: string[] | null;
  techniques: string[] | null; culture: string | null;
  description: string | null; searchTerms: string[] | null;
}

const GECD_DIM_COLORS: Record<string, string> = {
  "map-1d-on-2d": "#3b82f6",
  "map-1d-on-3d": "#6366f1",
  "map-1d-builds-2d-on-2d": "#8b5cf6",
  "map-2d-on-2d": "#0ea5e9",
  "map-2d-on-3d": "#14b8a6",
  "map-2d-to-3d": "#16a34a",
  "map-3d-objects": "#f97316",
  "map-3d-versions-of-2d": "#eab308",
};

export default function OntologyExplorer() {
  const [activeTab, setActiveTab] = useState<"manifestations" | "mythology" | "architecture" | "reference" | "licensed">("manifestations");
  const [filterCulture, setFilterCulture] = useState("");
  const [filterDimension, setFilterDimension] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");
  const [filterGecdDim, setFilterGecdDim] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<OntologyAll>({
    queryKey: ["/api/ontology/all"],
    queryFn: async () => {
      const res = await fetch("/api/ontology/all");
      if (!res.ok) throw new Error("Failed to load ontology");
      return res.json();
    },
  });

  const { data: licensedResources } = useQuery<LicensedResource[]>({
    queryKey: ["/api/licensed-resources"],
    queryFn: () => fetch("/api/licensed-resources").then(r => r.json()),
    staleTime: 10 * 60 * 1000,
  });

  const filteredManifestations = useMemo(() => {
    if (!data) return [];
    return data.manifestations.filter(m => {
      if (filterCulture && m.culture !== filterCulture) return false;
      if (filterDimension && m.dimensionMapping !== filterDimension) return false;
      if (filterMaterial && !(m.materials ?? []).includes(filterMaterial)) return false;
      if (filterGecdDim && m.dimensionMapping !== filterGecdDim) return false;
      return true;
    });
  }, [data, filterCulture, filterDimension, filterMaterial, filterGecdDim]);

  const dimMappingOptions = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.manifestations.map(m => m.dimensionMapping).filter(Boolean)));
  }, [data]);

  const s: React.CSSProperties = {
    minHeight: "100vh",
    background: "#020617",
    color: "#f1f5f9",
    fontFamily: "'Inter', sans-serif",
  };

  if (isLoading) return (
    <div style={s}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div style={{ color: "#64748b", fontSize: 18 }}>Loading ontology…</div>
      </div>
    </div>
  );

  if (error || !data) return (
    <div style={s}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div style={{ color: "#ef4444" }}>Failed to load ontology data. Please try again.</div>
      </div>
    </div>
  );

  const isEmpty = data.manifestations.length === 0 && data.deities.length === 0;

  return (
    <div style={s}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0 16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <Link href="/" style={{ color: "#64748b", textDecoration: "none", fontSize: 13 }}>← Home</Link>
            </div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>Geometric Ontology</h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
              {data.manifestations.length} manifestations · {data.deities.length} deities · {data.cultures.length} cultures
            </p>
          </div>
          <Link href="/gea" style={{ color: "#3b82f6", textDecoration: "none", fontSize: 13, border: "1px solid #3b82f633", borderRadius: 6, padding: "6px 12px" }}>
            GEA Calculator →
          </Link>
        </div>

        {isEmpty && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
            <div style={{ fontSize: 16, marginBottom: 8 }}>Ontology data not yet seeded</div>
            <div style={{ fontSize: 13 }}>The database is being populated on first startup. Refresh in a moment.</div>
          </div>
        )}

        {!isEmpty && (
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ width: 220, flexShrink: 0 }}>
              <div style={{ background: "#0f172a", borderRadius: 10, padding: 16, position: "sticky", top: 16 }}>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>Filters</div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>Dimension Mapping</label>
                  <select
                    data-testid="filter-dimension"
                    value={filterDimension}
                    onChange={e => setFilterDimension(e.target.value)}
                    style={{ width: "100%", background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155", borderRadius: 6, padding: "6px 8px", fontSize: 12 }}
                  >
                    <option value="">All</option>
                    {dimMappingOptions.map(dm => (
                      <option key={dm!} value={dm!}>{DIM_MAP_LABELS[dm!] ?? dm}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>Culture</label>
                  <select
                    data-testid="filter-culture"
                    value={filterCulture}
                    onChange={e => setFilterCulture(e.target.value)}
                    style={{ width: "100%", background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155", borderRadius: 6, padding: "6px 8px", fontSize: 12 }}
                  >
                    <option value="">All</option>
                    {data.cultures.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>Material</label>
                  <select
                    data-testid="filter-material"
                    value={filterMaterial}
                    onChange={e => setFilterMaterial(e.target.value)}
                    style={{ width: "100%", background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155", borderRadius: 6, padding: "6px 8px", fontSize: 12 }}
                  >
                    <option value="">All</option>
                    {data.materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>GECD Dimension</label>
                  <select
                    data-testid="filter-gecd-dimension"
                    value={filterGecdDim}
                    onChange={e => setFilterGecdDim(e.target.value)}
                    style={{ width: "100%", background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155", borderRadius: 6, padding: "6px 8px", fontSize: 12 }}
                  >
                    <option value="">All GECD Dims</option>
                    {Object.entries(DIM_MAP_LABELS).map(([id, label]) => (
                      <option key={id} value={id}>{label}</option>
                    ))}
                  </select>
                </div>

                {(filterCulture || filterDimension || filterMaterial || filterGecdDim) && (
                  <button
                    data-testid="button-clear-filters"
                    onClick={() => { setFilterCulture(""); setFilterDimension(""); setFilterMaterial(""); setFilterGecdDim(""); }}
                    style={{ width: "100%", background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: 6, padding: "6px 8px", fontSize: 12, cursor: "pointer", marginTop: 8 }}
                  >
                    Clear Filters
                  </button>
                )}

                <div style={{ marginTop: 20, borderTop: "1px solid #1e293b", paddingTop: 14 }}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Dimensions</div>
                  {data.dimensions.map(d => (
                    <div key={d.id} style={{ fontSize: 12, color: "#94a3b8", padding: "3px 0", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700, color: "#3b82f6" }}>{d.name}</span>
                      <span style={{ color: "#475569" }}>{d.description}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, borderTop: "1px solid #1e293b", paddingTop: 14 }}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Operations</div>
                  {data.operations.map(o => (
                    <div key={o.id} style={{ fontSize: 11, color: "#64748b", padding: "2px 0" }}>
                      <span style={{ color: "#94a3b8" }}>{o.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #1e293b", paddingBottom: 12 }}>
                {([
                  { key: "manifestations", label: `Manifestations (${filteredManifestations.length})` },
                  { key: "mythology", label: `Mythology (${data.deities.length})` },
                  { key: "architecture", label: `Architecture (${data.archTranslations.length})` },
                  { key: "licensed", label: `Licensed (${licensedResources?.length ?? 0})` },
                  { key: "reference", label: "Reference" },
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    data-testid={`tab-${tab.key}`}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      background: activeTab === tab.key ? "#1e293b" : "transparent",
                      color: activeTab === tab.key ? "#f1f5f9" : "#64748b",
                      border: "1px solid " + (activeTab === tab.key ? "#334155" : "transparent"),
                      borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "manifestations" && (
                <div>
                  {filteredManifestations.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>No manifestations match the current filters.</div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                      {filteredManifestations.map(m => (
                        <ManifestationCard
                          key={m.id}
                          item={m}
                          cultures={data.cultures}
                          elements={data.elements}
                          materials={data.materials}
                          mathConcepts={data.mathConcepts}
                          deities={data.deities}
                          archTranslations={data.archTranslations}
                          symbols={data.symbols}
                          expanded={expandedId === m.id}
                          onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "mythology" && (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                      Deities and their geometric associations across cultures.
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                      {data.deities.map(d => <DeityCard key={d.id} deity={d} />)}
                    </div>
                  </div>

                  {data.symbols.length > 0 && (
                    <div style={{ marginTop: 24 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#f1f5f9" }}>Symbol Index</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                        {data.symbols.map(s => (
                          <div key={s.symbol} data-testid={`card-symbol-${s.symbol}`} style={{ background: "#0f172a", borderRadius: 8, padding: 12, border: "1px solid #1e293b" }}>
                            <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: 6 }}>{s.symbol}</div>
                            {s.geometric && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                                {s.geometric.map(g => <Badge key={g} label={g} color="#eab308" />)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "architecture" && (
                <div>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                    How 2D patterns become 3D architectural forms.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
                    {data.archTranslations.map(at => (
                      <div key={at.id} data-testid={`card-archtrans-${at.id}`} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 8 }}>{at.title}</div>
                        <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}>
                          {at.from2dPattern && <Badge label={at.from2dPattern.replace("pat-", "").replace(/-/g, " ")} color="#3b82f6" />}
                          <span style={{ color: "#64748b" }}>→</span>
                          {at.to3dElement && <Badge label={at.to3dElement.replace("arch-", "").replace(/-/g, " ")} color="#16a34a" />}
                        </div>
                        {at.benefits && at.benefits.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Benefits</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {at.benefits.map(b => <Badge key={b} label={b} color="#0ea5e9" />)}
                            </div>
                          </div>
                        )}
                        {at.operations && at.operations.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {at.operations.map(o => <Badge key={o} label={o.replace("op-", "")} color="#8b5cf6" />)}
                          </div>
                        )}
                        {at.mathLinks && at.mathLinks.length > 0 && (
                          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {at.mathLinks.map(m => <Badge key={m} label={m.replace("math-", "")} color="#eab308" />)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "licensed" && (
                <div>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                    Pre-vetted licensed image resources from the GECD curriculum guide. All images are cleared for educational use.
                  </div>
                  {!licensedResources || licensedResources.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
                      <div>No licensed resources loaded yet.</div>
                    </div>
                  ) : (
                    (() => {
                      const sections = Array.from(new Set(licensedResources.map(r => r.section)));
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                          {sections.map(section => (
                            <div key={section}>
                              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#f1f5f9", borderBottom: "1px solid #1e293b", paddingBottom: 6 }}>
                                {section}
                              </h3>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                                {licensedResources.filter(r => r.section === section).map(r => {
                                  const dimColor = r.dimensionMapping ? (GECD_DIM_COLORS[r.dimensionMapping] ?? "#64748b") : "#64748b";
                                  const dimLabel = r.dimensionMapping ? (DIM_MAP_LABELS[r.dimensionMapping] ?? r.dimensionMapping) : null;
                                  return (
                                    <div key={r.id} data-testid={`card-licensed-${r.id}`}
                                      style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                                      {r.imageUrl && (
                                        <img src={r.imageUrl} alt={r.title}
                                          style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6, background: "#1e293b" }}
                                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                      )}
                                      <div style={{ fontWeight: 600, fontSize: 13, color: "#f1f5f9", lineHeight: 1.3 }}>{r.title}</div>
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                        {dimLabel && <Badge label={dimLabel} color={dimColor} />}
                                        {r.culture && <Badge label={r.culture.replace("civ-", "")} color={CULTURE_COLORS[r.culture] ?? "#64748b"} />}
                                        <Badge label={r.license} color="#64748b" />
                                      </div>
                                      {r.description && <p style={{ color: "#64748b", fontSize: 11, margin: 0, lineHeight: 1.4 }}>{r.description}</p>}
                                      <div style={{ fontSize: 10, color: "#475569" }}>Source: {r.source}</div>
                                      {r.geometricElements && r.geometricElements.length > 0 && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                                          {r.geometricElements.map(el => <Badge key={el} label={el.replace("geo-", "")} color="#8b5cf6" />)}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {activeTab === "reference" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  <div style={{ background: "#0f172a", borderRadius: 10, padding: 16, border: "1px solid #1e293b" }}>
                    <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#3b82f6" }}>Geometric Elements ({data.elements.length})</h3>
                    {data.elements.map(e => (
                      <div key={e.id} style={{ fontSize: 12, padding: "3px 0", display: "flex", gap: 8 }}>
                        <Badge label={e.dimension} color="#3b82f6" />
                        <span style={{ color: "#f1f5f9" }}>{e.name}</span>
                        {e.variants && <span style={{ color: "#64748b" }}>({e.variants.slice(0, 2).join(", ")})</span>}
                      </div>
                    ))}
                  </div>

                  <div style={{ background: "#0f172a", borderRadius: 10, padding: 16, border: "1px solid #1e293b" }}>
                    <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#16a34a" }}>Materials ({data.materials.length})</h3>
                    {data.materials.map(m => (
                      <div key={m.id} style={{ fontSize: 12, padding: "3px 0" }}>
                        <span style={{ color: "#f1f5f9" }}>{m.name}</span>
                        {m.classes && <span style={{ color: "#64748b" }}> — {m.classes.join(", ")}</span>}
                      </div>
                    ))}
                  </div>

                  <div style={{ background: "#0f172a", borderRadius: 10, padding: 16, border: "1px solid #1e293b" }}>
                    <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#f97316" }}>Techniques ({data.techniques.length})</h3>
                    {data.techniques.map(t => (
                      <div key={t.id} style={{ fontSize: 12, padding: "3px 0", color: "#94a3b8" }}>{t.name}</div>
                    ))}
                  </div>

                  <div style={{ background: "#0f172a", borderRadius: 10, padding: 16, border: "1px solid #1e293b" }}>
                    <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#eab308" }}>Math Concepts ({data.mathConcepts.length})</h3>
                    {data.mathConcepts.map(m => (
                      <div key={m.id} style={{ fontSize: 12, padding: "3px 0" }}>
                        <span style={{ color: "#f1f5f9" }}>{m.name}</span>
                        {m.topics && <span style={{ color: "#64748b" }}> — {m.topics.join(", ")}</span>}
                      </div>
                    ))}
                  </div>

                  <div style={{ background: "#0f172a", borderRadius: 10, padding: 16, border: "1px solid #1e293b" }}>
                    <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#8b5cf6" }}>Operations ({data.operations.length})</h3>
                    {data.operations.map(o => (
                      <div key={o.id} style={{ fontSize: 12, padding: "3px 0" }}>
                        <span style={{ color: "#f1f5f9" }}>{o.name}</span>
                        {o.description && <span style={{ color: "#64748b" }}> — {o.description}</span>}
                      </div>
                    ))}
                  </div>

                  <div style={{ background: "#0f172a", borderRadius: 10, padding: 16, border: "1px solid #1e293b" }}>
                    <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#0ea5e9" }}>Pattern Types ({data.patternTypes.length})</h3>
                    {data.patternTypes.map(p => (
                      <div key={p.id} style={{ fontSize: 12, padding: "3px 0" }}>
                        <span style={{ color: "#f1f5f9" }}>{p.name}</span>
                        {p.groups && <span style={{ color: "#64748b" }}> ({p.groups} groups)</span>}
                      </div>
                    ))}
                  </div>

                  <div style={{ background: "#0f172a", borderRadius: 10, padding: 16, border: "1px solid #1e293b" }}>
                    <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#ec4899" }}>Architectural Elements ({data.archElements.length})</h3>
                    {data.archElements.map(a => (
                      <div key={a.id} style={{ fontSize: 12, padding: "3px 0", color: "#94a3b8" }}>{a.name}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
