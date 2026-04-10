export interface MuseumResult {
  url: string;
  title: string;
  source: string;
  objectUrl?: string;
  date?: string;
  culture?: string;
  medium?: string;
  license?: string;
  tier?: 1 | 2 | 3 | 4;
  accessionNumber?: string;
  department?: string;
  isReconstruction?: boolean;
}

// ── Tier 1: Primary museum collections ────────────────────────────────────────

export async function searchMetMuseum(query: string, limit = 8): Promise<MuseumResult[]> {
  try {
    // Always scope to Ancient Near Eastern Art (departmentId=3) for Mesopotamian focus
    const params = new URLSearchParams({
      hasImages: "true",
      isPublicDomain: "true",
      departmentId: "3",
      q: query,
    });
    const searchRes = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/search?${params}`
    );
    if (!searchRes.ok) return [];

    const searchData = await searchRes.json() as { objectIDs?: number[] };
    const objectIDs = (searchData.objectIDs ?? []).slice(0, limit);
    if (objectIDs.length === 0) return [];

    const results = await Promise.all(
      objectIDs.map(async (id) => {
        try {
          const objRes = await fetch(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
          );
          if (!objRes.ok) return null;
          const obj = await objRes.json() as {
            primaryImage?: string; title?: string; objectURL?: string;
            objectDate?: string; culture?: string; medium?: string;
            accessionNumber?: string; department?: string;
          };
          if (!obj.primaryImage) return null;
          return {
            url: obj.primaryImage,
            title: obj.title ?? "Untitled",
            source: "Metropolitan Museum of Art",
            objectUrl: obj.objectURL,
            date: obj.objectDate,
            culture: obj.culture,
            medium: obj.medium,
            license: "CC0",
            tier: 1 as const,
            accessionNumber: obj.accessionNumber,
            department: obj.department,
          } satisfies MuseumResult;
        } catch { return null; }
      })
    );
    return results.filter((r) => r !== null) as MuseumResult[];
  } catch (err) {
    console.error("Met Museum API error:", err);
    return [];
  }
}

export async function searchBritishMuseum(query: string, limit = 6): Promise<MuseumResult[]> {
  try {
    // BM collection search endpoint (JSON output)
    const params = new URLSearchParams({
      view: "grid",
      sort: "object_name__asc",
      page_size: String(limit),
      q: query,
      department: "Middle East",
    });
    const res = await fetch(
      `https://www.britishmuseum.org/collection/search?${params}`,
      { headers: { Accept: "application/json", "User-Agent": "EuclidChronos/1.0 (educational)" } }
    );
    if (!res.ok) return [];
    const data = await res.json() as { hits?: { _source?: {
      title?: string; id?: string; admin?: { id?: string };
      image?: { id?: string }; date_text?: string; collection?: string[];
      type?: string[]; material?: string[];
    }}[] };
    const hits = data.hits ?? [];
    return hits
      .filter((h) => h._source?.image?.id)
      .map((h) => {
        const s = h._source!;
        const imgId = s.image!.id!;
        return {
          url: `https://media.britishmuseum.org/media/Repository/${imgId.replace(/\./g, "/")}_mid.jpg`,
          title: s.title ?? "Untitled",
          source: "British Museum",
          objectUrl: `https://www.britishmuseum.org/collection/object/${s.admin?.id ?? s.id}`,
          date: s.date_text,
          culture: s.collection?.[0],
          medium: s.material?.[0],
          license: "CC BY-NC-SA 4.0",
          tier: 1 as const,
          accessionNumber: s.admin?.id ?? s.id,
        } satisfies MuseumResult;
      });
  } catch (err) {
    console.error("British Museum API error:", err);
    return [];
  }
}

// ── Tier 2: Academic and archaeological databases ─────────────────────────────

export async function searchCDLI(query: string, limit = 8): Promise<MuseumResult[]> {
  try {
    // cdli.earth is the canonical domain as of April 2025
    const params = new URLSearchParams({
      search: query,
      limit: String(limit),
    });
    const res = await fetch(`https://cdli.earth/api/v1/artifacts?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json() as { data?: unknown[]; items?: unknown[]; results?: unknown[] };
    const items = (data.data ?? data.items ?? data.results ?? []) as Record<string, unknown>[];
    return items
      .filter((item) => item.image_url ?? item.primary_image)
      .map((item) => ({
        url: String(item.image_url ?? item.primary_image),
        title: String(item.designation ?? item.title ?? "Untitled"),
        source: "CDLI (Cuneiform Digital Library)",
        objectUrl: item.url
          ? String(item.url)
          : `https://cdli.earth/artifacts/${item.id}`,
        date: item.period ? String(item.period) : undefined,
        culture: item.provenience
          ? String(item.provenience)
          : item.culture
          ? String(item.culture)
          : undefined,
        medium: item.material
          ? String(item.material)
          : item.object_type
          ? String(item.object_type)
          : undefined,
        license: "CC BY 4.0",
        tier: 2 as const,
        accessionNumber: item.cdli_no ? String(item.cdli_no) : undefined,
      } satisfies MuseumResult));
  } catch (err) {
    console.error("CDLI API error:", err);
    return [];
  }
}

export async function searchWikidata(query: string, limit = 6): Promise<MuseumResult[]> {
  try {
    // SPARQL: find Mesopotamian artifacts with images and museum accession numbers
    const sparql = `
SELECT ?item ?itemLabel ?image ?collection ?collectionLabel ?inventoryNumber ?date WHERE {
  ?item wdt:P18 ?image .
  ?item rdfs:label ?itemLabel . FILTER(lang(?itemLabel) = "en")
  OPTIONAL { ?item wdt:P195 ?collection . }
  OPTIONAL { ?item wdt:P217 ?inventoryNumber . }
  OPTIONAL { ?item wdt:P571 ?date . }
  {
    ?item wdt:P31 wd:Q927436 .
  } UNION {
    ?item wdt:P361 wd:Q11768 .
  } UNION {
    ?item ?lp ?lv . ?lv rdfs:label ?labelStr . FILTER(lang(?labelStr)="en")
    FILTER(CONTAINS(LCASE(?labelStr), "${query.toLowerCase().replace(/"/g, "").slice(0, 30)}"))
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
} LIMIT ${limit}`.trim();

    const res = await fetch(
      `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`,
      { headers: { Accept: "application/sparql-results+json", "User-Agent": "EuclidChronos/1.0" } }
    );
    if (!res.ok) return [];
    const data = await res.json() as {
      results: { bindings: {
        item?: { value: string }; itemLabel?: { value: string };
        image?: { value: string }; collectionLabel?: { value: string };
        inventoryNumber?: { value: string }; date?: { value: string };
      }[] }
    };
    return data.results.bindings
      .filter((b) => b.image?.value)
      .map((b) => {
        const imgUrl = b.image!.value.replace(/^http:\/\//i, "https://");
        // Convert Wikimedia File: URL to thumbnail URL
        const thumb = imgUrl.includes("Special:FilePath")
          ? imgUrl + "?width=800"
          : imgUrl;
        return {
          url: thumb,
          title: b.itemLabel?.value ?? "Untitled",
          source: `Wikidata${b.collectionLabel?.value ? ` / ${b.collectionLabel.value}` : ""}`,
          objectUrl: b.item?.value,
          date: b.date?.value?.slice(0, 10),
          accessionNumber: b.inventoryNumber?.value,
          license: "CC0 (metadata); image license varies",
          tier: 2 as const,
        } satisfies MuseumResult;
      });
  } catch (err) {
    console.error("Wikidata SPARQL error:", err);
    return [];
  }
}

export async function searchEuropeana(query: string, limit = 6): Promise<MuseumResult[]> {
  const apiKey = process.env.EUROPEANA_API_KEY;
  if (!apiKey) return [];
  try {
    const params = new URLSearchParams({
      wskey: apiKey,
      query: `${query} AND COUNTRY:germany OR COUNTRY:france`,
      rows: String(limit),
      media: "true",
      reusability: "open",
      profile: "rich",
      qf: "TYPE:IMAGE",
    });
    const res = await fetch(`https://api.europeana.eu/record/v2/search.json?${params}`);
    if (!res.ok) return [];
    const data = await res.json() as { items?: {
      edmPreview?: string[]; title?: string | string[]; guid?: string;
      year?: string[]; dataProvider?: string[]; rights?: string[];
    }[] };
    return (data.items ?? [])
      .filter((item) => item.edmPreview?.[0])
      .map((item) => ({
        url: item.edmPreview![0],
        title: (Array.isArray(item.title) ? item.title[0] : item.title) ?? "Untitled",
        source: `Europeana / ${item.dataProvider?.[0] ?? "European Museum"}`,
        objectUrl: item.guid,
        date: item.year?.[0],
        culture: item.dataProvider?.[0],
        license: item.rights?.[0] ?? "See source",
        tier: 2 as const,
      } satisfies MuseumResult));
  } catch (err) {
    console.error("Europeana API error:", err);
    return [];
  }
}

export async function searchSmithsonian(query: string, limit = 6): Promise<MuseumResult[]> {
  try {
    const res = await fetch(
      `https://api.si.edu/openaccess/api/v1.0/search?q=${encodeURIComponent(query + " mesopotamia")}&rows=${limit}&api_key=DEMO_KEY`
    );
    if (!res.ok) return [];
    const data = await res.json() as { response?: { rows?: unknown[] } };
    const rows = (data.response?.rows ?? []) as Record<string, unknown>[];
    return rows
      .filter((row) => {
        const dnr = (row as any).content?.descriptiveNonRepeating;
        return dnr?.online_media?.media?.length > 0;
      })
      .map((row) => {
        const dnr = (row as any).content.descriptiveNonRepeating;
        const media = dnr.online_media.media[0];
        return {
          url: media.content || media.thumbnail,
          title: (row as any).title || dnr.title?.content || "Untitled",
          source: "Smithsonian Institution",
          objectUrl: dnr.record_link,
          date: (row as any).content?.freetext?.date?.[0]?.content,
          culture: (row as any).content?.freetext?.culture?.[0]?.content,
          medium: (row as any).content?.freetext?.physicalDescription?.[0]?.content,
          license: "CC0",
          tier: 2 as const,
        } satisfies MuseumResult;
      })
      .filter((r) => r.url);
  } catch (err) {
    console.error("Smithsonian API error:", err);
    return [];
  }
}

export async function searchWikimediaCommons(query: string, limit = 6): Promise<MuseumResult[]> {
  try {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      generator: "search",
      gsrnamespace: "6",
      gsrsearch: `${query} mesopotamia`,
      gsrlimit: String(limit),
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "800",
      origin: "*",
    });
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
    if (!res.ok) return [];
    const data = await res.json() as { query?: { pages?: Record<string, unknown> } };
    const pages = data.query?.pages ?? {};
    return (Object.values(pages) as Record<string, unknown>[])
      .map((page) => {
        const info = (page as any).imageinfo?.[0];
        if (!info) return null;
        const ext = info.extmetadata ?? {};
        const license = ext.LicenseShortName?.value ?? "";
        // Filter for CC-licensed or public domain — skip "All rights reserved"
        if (license.toLowerCase().includes("reserved")) return null;
        return {
          url: info.thumburl || info.url,
          title: ext.ObjectName?.value || String((page as any).title ?? "").replace("File:", "") || "Untitled",
          source: "Wikimedia Commons",
          objectUrl: info.descriptionurl,
          date: ext.DateTimeOriginal?.value,
          culture: ext.Categories?.value?.split("|")?.[0],
          license: license || "Public Domain",
          tier: 3 as const,
        } satisfies MuseumResult;
      })
      .filter((r) => r !== null && !!r?.url) as MuseumResult[];
  } catch (err) {
    console.error("Wikimedia API error:", err);
    return [];
  }
}

export async function searchWalters(query: string, limit = 6): Promise<MuseumResult[]> {
  try {
    // Walters Art Museum — CC0, ANE section; API v1 closed 2023, use static GitHub data
    // via their open-access collection search (121 ANE objects)
    const res = await fetch(
      `https://art.thewalters.org/search/?q=${encodeURIComponent(query)}&loc=ancient-near-eastern-art`,
      { headers: { "User-Agent": "EuclidChronos/1.0 (educational)" } }
    );
    if (!res.ok) return [];
    const html = await res.text();
    const results: MuseumResult[] = [];
    // Parse search result cards from HTML
    const re = /href="(\/art\/[^"]+)"[^>]*>[^<]*<img[^>]+src="([^"]+)"[^>]*alt="([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null && results.length < limit) {
      const pageUrl = `https://art.thewalters.org${m[1]}`;
      const imgUrl = m[2].startsWith("http") ? m[2] : `https://art.thewalters.org${m[2]}`;
      const title = m[3];
      if (!title || title === "logo") continue;
      results.push({
        url: imgUrl,
        title,
        source: "Walters Art Museum",
        objectUrl: pageUrl,
        license: "CC0",
        tier: 1 as const,
      });
    }
    return results;
  } catch (err) {
    console.error("Walters API error:", err);
    return [];
  }
}

export async function searchPennMuseum(query: string, limit = 5): Promise<MuseumResult[]> {
  try {
    const res = await fetch(
      `https://www.penn.museum/api/objects/search?q=${encodeURIComponent(query + " mesopotamia")}&has_image=true&per_page=${limit}`
    );
    if (!res.ok) return [];
    const data = await res.json() as { objects?: Record<string, unknown>[] };
    return (data.objects ?? [])
      .filter((item) => item.image_url)
      .map((item) => ({
        url: String(item.image_url),
        title: String(item.object_name ?? "Untitled"),
        source: "Penn Museum",
        objectUrl: `https://www.penn.museum/collections/object/${item.object_number}`,
        date: item.period ? String(item.period) : undefined,
        culture: item.culture ? String(item.culture) : undefined,
        medium: item.material ? String(item.material) : undefined,
        license: "CC BY 3.0",
        tier: 1 as const,
      } satisfies MuseumResult));
  } catch (err) {
    console.error("Penn Museum API error:", err);
    return [];
  }
}

export async function searchLouvre(query: string, limit = 5): Promise<MuseumResult[]> {
  try {
    // Louvre: append .json to entry URLs; no search API — use their collections API
    const res = await fetch(
      `https://collections.louvre.fr/api/catalog?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    if (!res.ok) return [];
    const data = await res.json() as { results?: Record<string, unknown>[]; records?: Record<string, unknown>[] };
    const items = data.results ?? data.records ?? [];
    return items
      .filter((item) => item.image ?? item.thumbnail)
      .map((item) => ({
        url: String(item.image ?? item.thumbnail),
        title: String(item.title ?? "Untitled"),
        source: "Louvre Museum",
        objectUrl: item.url
          ? String(item.url)
          : `https://collections.louvre.fr/en/ark:/53355/${item.id}`,
        date: item.period ? String(item.period) : undefined,
        culture: item.department ? String(item.department) : undefined,
        license: "Educational use only",
        tier: 1 as const,
      } satisfies MuseumResult));
  } catch (err) {
    console.error("Louvre API error:", err);
    return [];
  }
}

export async function searchRijksmuseum(query: string, limit = 5): Promise<MuseumResult[]> {
  const apiKey = process.env.RIJKSMUSEUM_API_KEY;
  if (!apiKey) return [];
  try {
    const params = new URLSearchParams({ key: apiKey, q: query, imgonly: "True", ps: String(limit), format: "json" });
    const res = await fetch(`https://www.rijksmuseum.nl/api/en/collection?${params}`);
    if (!res.ok) return [];
    const data = await res.json() as { artObjects?: Record<string, unknown>[] };
    return (data.artObjects ?? [])
      .filter((item) => (item as any).webImage?.url)
      .map((item) => ({
        url: (item as any).webImage.url,
        title: String(item.title ?? "Untitled"),
        source: "Rijksmuseum",
        objectUrl: (item as any).links?.web,
        date: (item as any).dating?.presentingDate,
        culture: String(item.principalOrFirstMaker ?? ""),
        medium: String(item.subTitle ?? ""),
        license: "Public Domain",
        tier: 2 as const,
      } satisfies MuseumResult));
  } catch (err) {
    console.error("Rijksmuseum API error:", err);
    return [];
  }
}

export async function searchAIC(query: string, limit = 5): Promise<MuseumResult[]> {
  try {
    const res = await fetch(
      `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}&limit=${limit}&fields=id,title,image_id,is_public_domain,artist_title,date_display,place_of_origin,medium_display`
    );
    if (!res.ok) return [];
    const data = await res.json() as { config?: { iiif_url?: string }; data?: Record<string, unknown>[] };
    const iiif = data.config?.iiif_url ?? "https://www.artic.edu/iiif/2";
    return (data.data ?? [])
      .filter((item) => item.image_id && item.is_public_domain !== false)
      .map((item) => ({
        url: `${iiif}/${item.image_id}/full/843,/0/default.jpg`,
        title: String(item.title ?? "Untitled"),
        source: "Art Institute of Chicago",
        objectUrl: `https://www.artic.edu/artworks/${item.id}`,
        date: item.date_display ? String(item.date_display) : undefined,
        culture: item.place_of_origin ? String(item.place_of_origin) : undefined,
        medium: item.medium_display ? String(item.medium_display) : undefined,
        license: "CC0",
        tier: 2 as const,
      } satisfies MuseumResult));
  } catch (err) {
    console.error("AIC API error:", err);
    return [];
  }
}

export async function searchCleveland(query: string, limit = 5): Promise<MuseumResult[]> {
  try {
    const res = await fetch(
      `https://openaccess-api.clevelandart.org/api/artworks/?q=${encodeURIComponent(query)}&has_image=1&limit=${limit}`
    );
    if (!res.ok) return [];
    const data = await res.json() as { data?: Record<string, unknown>[] };
    return (data.data ?? [])
      .filter((item) => (item as any).images?.web?.url || (item as any).images?.print?.url)
      .map((item) => ({
        url: (item as any).images?.print?.url ?? (item as any).images?.web?.url,
        title: String(item.title ?? "Untitled"),
        source: "Cleveland Museum of Art",
        objectUrl: item.url ? String(item.url) : undefined,
        date: item.creation_date ? String(item.creation_date) : undefined,
        culture: item.culture ? String(item.culture) : undefined,
        medium: item.technique ? String(item.technique) : undefined,
        license: String(item.share_license_status ?? "CC0"),
        tier: 2 as const,
      } satisfies MuseumResult));
  } catch (err) {
    console.error("Cleveland API error:", err);
    return [];
  }
}

export async function searchInternetArchive(query: string, limit = 5): Promise<MuseumResult[]> {
  try {
    const params = new URLSearchParams({
      q: `${query} mesopotamia AND mediatype:(image) AND date:[* TO 1928]`,
      fl: "identifier,title,description,date,creator",
      rows: String(limit),
      output: "json",
    });
    const res = await fetch(`https://archive.org/advancedsearch.php?${params}`);
    if (!res.ok) return [];
    const data = await res.json() as { response?: { docs?: Record<string, unknown>[] } };
    const docs = data.response?.docs ?? [];
    const results = await Promise.all(
      docs.map(async (doc) => {
        try {
          const id = String(doc.identifier);
          const metaRes = await fetch(`https://archive.org/metadata/${id}/files`);
          if (!metaRes.ok) return null;
          const metaData = await metaRes.json() as { result?: { name: string }[] };
          const files = metaData.result ?? [];
          const imgFile = files.find((f) => /\.(jpg|jpeg|png)$/i.test(f.name) && !/_thumb|_small/.test(f.name));
          if (!imgFile) return null;
          return {
            url: `https://archive.org/download/${id}/${imgFile.name}`,
            title: String(Array.isArray(doc.title) ? doc.title[0] : doc.title ?? "Untitled"),
            source: "Internet Archive",
            objectUrl: `https://archive.org/details/${id}`,
            date: String(Array.isArray(doc.date) ? doc.date[0] : doc.date ?? ""),
            culture: String(Array.isArray(doc.creator) ? doc.creator[0] : doc.creator ?? ""),
            license: "Public Domain",
            tier: 2 as const,
          } satisfies MuseumResult;
        } catch { return null; }
      })
    );
    return results.filter((r) => r !== null) as MuseumResult[];
  } catch (err) {
    console.error("Internet Archive API error:", err);
    return [];
  }
}

export async function searchGetty(query: string, limit = 5): Promise<MuseumResult[]> {
  try {
    const searchUrl =
      `https://search.getty.edu/gateway/search?q=${encodeURIComponent(query)}` +
      `&f=${encodeURIComponent('"Open Content Images"')}&rows=20&srt=a&dir=s&pg=1`;
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "EuclidChronos/1.0 (educational)" },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const results: MuseumResult[] = [];
    const re = /st_url="([^"]*recordIDs=[^"]+)"[^>]*st_title="([^"]+)"[^>]*st_image="([^"]+)"/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(html)) !== null && results.length < limit) {
      const pageUrl = match[1].replace(/^http:\/\//i, "https://");
      const title = match[2].trim();
      const thumb = match[3].trim();
      if (!thumb) continue;
      results.push({
        url: thumb.replace(/\/full\/!600,600\//, "/full/!2400,2400/"),
        title,
        source: "Getty Museum",
        objectUrl: pageUrl,
        license: "Open Content",
        tier: 2 as const,
      });
    }
    return results;
  } catch (err) {
    console.error("Getty search error:", err);
    return [];
  }
}

// ── Tier 3: Curated secondary (verify against Tier 1 when possible) ───────────

export async function searchSmarthistory(query: string, limit = 4): Promise<MuseumResult[]> {
  try {
    // Smarthistory has a WordPress API for content search
    const res = await fetch(
      `https://smarthistory.org/wp-json/wp/v2/posts?search=${encodeURIComponent(query + " ancient near east mesopotamia")}&per_page=${limit}&_fields=id,title,link,excerpt,featured_media,featured_media_src_url`,
      { headers: { "User-Agent": "EuclidChronos/1.0 (educational)" } }
    );
    if (!res.ok) return [];
    const posts = await res.json() as {
      id: number; title: { rendered: string }; link: string;
      excerpt?: { rendered?: string }; featured_media_src_url?: string;
    }[];
    return posts
      .filter((p) => p.featured_media_src_url)
      .map((p) => ({
        url: p.featured_media_src_url!,
        title: p.title.rendered.replace(/<[^>]+>/g, ""),
        source: "Smarthistory (PhD-reviewed)",
        objectUrl: p.link,
        license: "CC BY-NC-SA 4.0",
        tier: 3 as const,
      } satisfies MuseumResult));
  } catch (err) {
    console.error("Smarthistory API error:", err);
    return [];
  }
}

// ── Gemini-grounded search (uses Google_AI key) ───────────────────────────────

export async function searchGoogleImagesViaGemini(query: string): Promise<MuseumResult[]> {
  const apiKey = process.env.Google_AI;
  if (!apiKey) return [];
  try {
    const prompt = `You are a visual research assistant for a Mesopotamian artifact curriculum.

Search for real images of: "${query}"

Return a JSON array of 6–10 image results. Prioritize ONLY these sources (in order):
1. Metropolitan Museum of Art (metmuseum.org) — CC0
2. CDLI (cdli.earth) — cuneiform tablets
3. British Museum (britishmuseum.org) — CC BY-NC-SA
4. Wikimedia Commons (commons.wikimedia.org) — verify license
5. Smithsonian (si.edu) — CC0
6. Smarthistory (smarthistory.org) — CC BY-NC-SA
7. World History Encyclopedia (worldhistory.org)

DO NOT include: Pinterest, Google Images, stock sites, tourism blogs, AI-generated images, or any image without a traceable museum/institution source.

Each item must have:
- "title": what is shown (artifact name, period, culture)
- "imageUrl": direct image URL ending in .jpg, .png, .gif, or .webp
- "pageUrl": museum/institution page URL
- "source": institution name
- "date": approximate date
- "culture": Sumerian/Akkadian/Babylonian/Assyrian etc.
- "license": CC0/CC BY-NC-SA/etc.
- "tier": 1, 2, or 3 (per RWI trust hierarchy)

Respond ONLY with a JSON array, no other text.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
        }),
      }
    );
    if (!res.ok) return [];
    const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const images = JSON.parse(jsonMatch[0]) as {
      imageUrl?: string; pageUrl?: string; title?: string;
      source?: string; date?: string; culture?: string; license?: string; tier?: number;
    }[];
    return images
      .filter((img) => img.imageUrl || img.pageUrl)
      .slice(0, 10)
      .map((img) => ({
        url: img.imageUrl ?? img.pageUrl!,
        title: img.title ?? "Untitled",
        source: img.source ?? "Gemini Research",
        objectUrl: img.pageUrl,
        date: img.date,
        culture: img.culture,
        license: img.license ?? "See source",
        tier: (img.tier === 1 || img.tier === 2 || img.tier === 3 ? img.tier : 3) as 1 | 2 | 3,
      } satisfies MuseumResult));
  } catch (err) {
    console.error("Gemini image search error:", err);
    return [];
  }
}

// ── Primary aggregate search (Tier 1 → 2 → 3, no Tier 4 sources) ─────────────

export async function searchAllMuseums(query: string): Promise<MuseumResult[]> {
  const [
    metResults,
    cdliResults,
    britishMuseumResults,
    waltersResults,
    pennResults,
    louvreResults,
    smithsonianResults,
    wikidataResults,
    europeanaResults,
    wikimediaResults,
    smarthistoryResults,
    archiveResults,
    gettyResults,
    aicResults,
    clevelandResults,
    rijksmuseum,
    geminiResults,
  ] = await Promise.all([
    searchMetMuseum(query, 8),         // Tier 1 ★ primary
    searchCDLI(query, 6),              // Tier 2 ★ essential for cuneiform
    searchBritishMuseum(query, 6),     // Tier 1 — largest Mesopotamian collection
    searchWalters(query, 4),           // Tier 1 — CC0
    searchPennMuseum(query, 4),        // Tier 1 — Ur material
    searchLouvre(query, 4),            // Tier 1
    searchSmithsonian(query, 5),       // Tier 2
    searchWikidata(query, 5),          // Tier 2 — cross-reference bridge
    searchEuropeana(query, 5),         // Tier 2 — Louvre/Berlin proxy
    searchWikimediaCommons(query, 6),  // Tier 3 (verify per-image)
    searchSmarthistory(query, 4),      // Tier 3 ★ best secondary
    searchInternetArchive(query, 4),   // Tier 2
    searchGetty(query, 4),             // Tier 2
    searchAIC(query, 4),               // Tier 2
    searchCleveland(query, 4),         // Tier 2
    searchRijksmuseum(query, 4),       // Tier 2
    searchGoogleImagesViaGemini(query),// Tier 2–3 (Gemini-sourced)
  ]);

  // Return sorted by trust tier (1 first)
  const all = [
    ...metResults, ...cdliResults, ...britishMuseumResults, ...waltersResults,
    ...pennResults, ...louvreResults, ...smithsonianResults, ...wikidataResults,
    ...europeanaResults, ...archiveResults, ...gettyResults, ...aicResults,
    ...clevelandResults, ...rijksmuseum, ...wikimediaResults, ...smarthistoryResults,
    ...geminiResults,
  ];

  all.sort((a, b) => (a.tier ?? 3) - (b.tier ?? 3));
  return all;
}

// Alias used by ingest routes
export const searchAllSources = searchAllMuseums;
