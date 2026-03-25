export interface ProviderResult {
  url: string;
  thumbnailUrl?: string;
  title: string;
  source: string;
  provider: string;
  objectUrl?: string;
  metadata?: Record<string, unknown>;
}

interface GoogleCSEItem {
  link: string;
  title?: string;
  displayLink?: string;
  snippet?: string;
  image?: { thumbnailLink?: string; contextLink?: string };
}

interface WikimediaPage {
  title?: string;
  imageinfo?: Array<{
    url: string;
    thumburl?: string;
    descriptionurl?: string;
    extmetadata?: {
      ObjectName?: { value?: string };
      Categories?: { value?: string };
    };
  }>;
}

interface OpenverseItem {
  url: string;
  thumbnail?: string;
  title?: string;
  source?: string;
  foreign_landing_url?: string;
  license?: string;
  creator?: string;
}

export async function searchGoogleCSE(query: string, limit = 8): Promise<ProviderResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;
  if (!apiKey || !cseId) {
    console.log("[GoogleCSE] Skipped: GOOGLE_API_KEY or GOOGLE_CSE_ID not set");
    return [];
  }
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&searchType=image&num=${Math.min(limit, 10)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json() as { items?: GoogleCSEItem[] };
    return (data.items ?? []).map((item) => ({
      url: item.link,
      thumbnailUrl: item.image?.thumbnailLink,
      title: item.title ?? "Untitled",
      source: item.displayLink ?? "Google",
      provider: "google_cse",
      objectUrl: item.image?.contextLink,
      metadata: { snippet: item.snippet },
    }));
  } catch (err) {
    console.error("[GoogleCSE] Error:", err);
    return [];
  }
}

export async function searchWikimediaProvider(query: string, limit = 6): Promise<ProviderResult[]> {
  try {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      generator: "search",
      gsrnamespace: "6",
      gsrsearch: query,
      gsrlimit: String(limit),
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "800",
      origin: "*",
    });
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
    if (!res.ok) return [];
    const data = await res.json() as { query?: { pages?: Record<string, WikimediaPage> } };
    const pages = data.query?.pages ?? {};
    return Object.values(pages)
      .map((page) => {
        const info = page.imageinfo?.[0];
        if (!info) return null;
        const ext = info.extmetadata ?? {};
        return {
          url: info.thumburl ?? info.url,
          thumbnailUrl: info.thumburl,
          title: ext.ObjectName?.value ?? page.title?.replace("File:", "") ?? "Untitled",
          source: "Wikimedia Commons",
          provider: "wikimedia",
          objectUrl: info.descriptionurl,
          metadata: { categories: ext.Categories?.value },
        } as ProviderResult;
      })
      .filter((r): r is ProviderResult => r !== null);
  } catch (err) {
    console.error("[Wikimedia] Error:", err);
    return [];
  }
}

interface MetObject {
  primaryImage?: string;
  primaryImageSmall?: string;
  title?: string;
  objectURL?: string;
  objectDate?: string;
  culture?: string;
  medium?: string;
}

export async function searchMetMuseumProvider(query: string, limit = 8): Promise<ProviderResult[]> {
  try {
    const searchRes = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&isPublicDomain=true&q=${encodeURIComponent(query)}`
    );
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json() as { objectIDs?: number[] };
    const objectIDs: number[] = searchData.objectIDs?.slice(0, limit) ?? [];
    if (objectIDs.length === 0) return [];
    const results = await Promise.all(
      objectIDs.map(async (id) => {
        try {
          const objRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
          if (!objRes.ok) return null;
          const obj = await objRes.json() as MetObject;
          if (!obj.primaryImage) return null;
          return {
            url: obj.primaryImage,
            thumbnailUrl: obj.primaryImageSmall ?? obj.primaryImage,
            title: obj.title ?? "Untitled",
            source: "Metropolitan Museum of Art",
            provider: "met_museum",
            objectUrl: obj.objectURL,
            metadata: { date: obj.objectDate, culture: obj.culture, medium: obj.medium },
          } as ProviderResult;
        } catch {
          return null;
        }
      })
    );
    return results.filter((r): r is ProviderResult => r !== null);
  } catch (err) {
    console.error("[Met] Error:", err);
    return [];
  }
}

export async function searchOpenverse(query: string, limit = 6): Promise<ProviderResult[]> {
  try {
    const res = await fetch(
      `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=${limit}&license_type=commercial,modification`,
      { headers: { "User-Agent": "EUCLID-DAM/1.0 (educational research tool)" } }
    );
    if (!res.ok) return [];
    const data = await res.json() as { results?: OpenverseItem[] };
    return (data.results ?? []).map((item) => ({
      url: item.url,
      thumbnailUrl: item.thumbnail,
      title: item.title ?? "Untitled",
      source: item.source ?? "Openverse",
      provider: "openverse",
      objectUrl: item.foreign_landing_url,
      metadata: { license: item.license, creator: item.creator },
    }));
  } catch (err) {
    console.error("[Openverse] Error:", err);
    return [];
  }
}

export async function searchPinterest(_query: string, _limit = 6): Promise<ProviderResult[]> {
  console.log("[Pinterest] Stub: no official API key configured");
  return [];
}

export async function searchAdobeStock(_query: string, _limit = 6): Promise<ProviderResult[]> {
  console.log("[AdobeStock] Stub: no official API key configured");
  return [];
}

export async function searchAllProviders(query: string): Promise<ProviderResult[]> {
  const [google, wikimedia, met, openverse] = await Promise.allSettled([
    searchGoogleCSE(query, 6),
    searchWikimediaProvider(query, 6),
    searchMetMuseumProvider(query, 6),
    searchOpenverse(query, 4),
  ]);

  const results: ProviderResult[] = [];
  if (google.status === "fulfilled") results.push(...google.value);
  if (wikimedia.status === "fulfilled") results.push(...wikimedia.value);
  if (met.status === "fulfilled") results.push(...met.value);
  if (openverse.status === "fulfilled") results.push(...openverse.value);
  return results;
}

export { generateGeminiImage, searchGeminiForArtifact } from "./gemini";
export { searchPerplexityForArtifact, extractArticleText } from "./perplexity";
