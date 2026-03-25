export interface MuseumResult {
  url: string;
  title: string;
  source: string;
  objectUrl?: string;
  date?: string;
  culture?: string;
  medium?: string;
  license?: string;
}

export async function searchMetMuseum(query: string, limit = 8): Promise<MuseumResult[]> {
  try {
    const searchRes = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&isPublicDomain=true&q=${encodeURIComponent(query)}`
    );
    if (!searchRes.ok) return [];

    const searchData = await searchRes.json();
    const objectIDs: number[] = searchData.objectIDs?.slice(0, limit) || [];
    if (objectIDs.length === 0) return [];

    const results = await Promise.all(
      objectIDs.map(async (id) => {
        try {
          const objRes = await fetch(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
          );
          if (!objRes.ok) return null;
          const obj = await objRes.json();
          if (!obj.primaryImage) return null;
          return {
            url: obj.primaryImage,
            title: obj.title || "Untitled",
            source: "Metropolitan Museum of Art",
            objectUrl: obj.objectURL,
            date: obj.objectDate,
            culture: obj.culture,
            medium: obj.medium,
            license: "CC0",
          } as MuseumResult;
        } catch { return null; }
      })
    );

    return results.filter((r): r is MuseumResult => r !== null);
  } catch (err) {
    console.error("Met Museum API error:", err);
    return [];
  }
}

export async function searchSmithsonian(query: string, limit = 6): Promise<MuseumResult[]> {
  try {
    const res = await fetch(
      `https://api.si.edu/openaccess/api/v1.0/search?q=${encodeURIComponent(query)}&rows=${limit}&api_key=DEMO_KEY`
    );
    if (!res.ok) return [];

    const data = await res.json();
    const rows = data.response?.rows || [];

    return rows
      .filter((row: any) => row.content?.descriptiveNonRepeating?.online_media?.media?.length > 0)
      .map((row: any) => {
        const dnr = row.content.descriptiveNonRepeating;
        const media = dnr.online_media.media[0];
        return {
          url: media.content || media.thumbnail,
          title: row.title || dnr.title?.content || "Untitled",
          source: "Smithsonian Institution",
          objectUrl: dnr.record_link,
          date: row.content?.freetext?.date?.[0]?.content,
          culture: row.content?.freetext?.culture?.[0]?.content,
          medium: row.content?.freetext?.physicalDescription?.[0]?.content,
          license: "CC0",
        } as MuseumResult;
      })
      .filter((r: MuseumResult) => r.url);
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
      gsrsearch: query,
      gsrlimit: String(limit),
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "800",
      origin: "*",
    });

    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    const pages = data.query?.pages || {};

    return Object.values(pages)
      .map((page: any) => {
        const info = page.imageinfo?.[0];
        if (!info) return null;
        const ext = info.extmetadata || {};
        return {
          url: info.thumburl || info.url,
          title: ext.ObjectName?.value || page.title?.replace("File:", "") || "Untitled",
          source: "Wikimedia Commons",
          objectUrl: info.descriptionurl,
          date: ext.DateTimeOriginal?.value,
          culture: ext.Categories?.value?.split("|")?.[0],
          license: ext.LicenseShortName?.value || "Public Domain",
        } as MuseumResult;
      })
      .filter((r): r is MuseumResult => r !== null && !!r.url);
  } catch (err) {
    console.error("Wikimedia API error:", err);
    return [];
  }
}

export async function searchRijksmuseum(query: string, limit = 6): Promise<MuseumResult[]> {
  const apiKey = process.env.RIJKSMUSEUM_API_KEY;
  if (!apiKey) return [];
  try {
    const params = new URLSearchParams({
      key: apiKey,
      q: query,
      imgonly: "True",
      ps: String(limit),
      format: "json",
    });
    const res = await fetch(`https://www.rijksmuseum.nl/api/en/collection?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.artObjects || [];
    return items
      .filter((item: any) => item.webImage?.url)
      .map((item: any) => ({
        url: item.webImage.url,
        title: item.title || "Untitled",
        source: "Rijksmuseum",
        objectUrl: item.links?.web,
        date: item.dating?.presentingDate,
        culture: item.principalOrFirstMaker,
        medium: item.subTitle,
        license: "Public Domain",
      } as MuseumResult));
  } catch (err) {
    console.error("Rijksmuseum API error:", err);
    return [];
  }
}

export async function searchEuropeana(query: string, limit = 6): Promise<MuseumResult[]> {
  const apiKey = process.env.EUROPEANA_API_KEY;
  if (!apiKey) return [];
  try {
    const params = new URLSearchParams({
      wskey: apiKey,
      query,
      rows: String(limit),
      media: "true",
      reusability: "open",
      profile: "rich",
    });
    const res = await fetch(`https://api.europeana.eu/record/v2/search.json?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.items || [];
    return items
      .filter((item: any) => item.edmPreview?.[0])
      .map((item: any) => ({
        url: item.edmPreview[0],
        title: (Array.isArray(item.title) ? item.title[0] : item.title) || "Untitled",
        source: "Europeana",
        objectUrl: item.guid,
        date: item.year?.[0],
        culture: item.dataProvider?.[0],
        license: item.rights?.[0],
      } as MuseumResult));
  } catch (err) {
    console.error("Europeana API error:", err);
    return [];
  }
}

export async function searchInternetArchive(query: string, limit = 6): Promise<MuseumResult[]> {
  try {
    const params = new URLSearchParams({
      q: `${query} AND mediatype:(image) AND date:[* TO 1928]`,
      fl: "identifier,title,description,date,creator,subject",
      rows: String(limit),
      output: "json",
    });
    const res = await fetch(`https://archive.org/advancedsearch.php?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.response?.docs || [];

    const results = await Promise.all(
      docs.map(async (doc: any) => {
        try {
          const id = doc.identifier;
          const metaRes = await fetch(`https://archive.org/metadata/${id}/files`);
          if (!metaRes.ok) return null;
          const metaData = await metaRes.json();
          const files: any[] = metaData.result || [];
          const imgFile = files.find((f: any) =>
            /\.(jpg|jpeg|png)$/i.test(f.name) && !/_thumb|_small/.test(f.name)
          );
          if (!imgFile) return null;
          return {
            url: `https://archive.org/download/${id}/${imgFile.name}`,
            title: (Array.isArray(doc.title) ? doc.title[0] : doc.title) || "Untitled",
            source: "Internet Archive",
            objectUrl: `https://archive.org/details/${id}`,
            date: Array.isArray(doc.date) ? doc.date[0] : doc.date,
            culture: Array.isArray(doc.creator) ? doc.creator[0] : doc.creator,
            license: "Public Domain",
          } as MuseumResult;
        } catch { return null; }
      })
    );
    return results.filter((r): r is MuseumResult => r !== null);
  } catch (err) {
    console.error("Internet Archive API error:", err);
    return [];
  }
}

export async function searchCDLI(query: string, limit = 6): Promise<MuseumResult[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      rows: String(limit),
      format: "json",
    });
    const res = await fetch(`https://cdli.mpiwg-berlin.mpg.de/api/v1/artifacts?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    const items: any[] = data.data || data.items || data.results || [];
    return items
      .filter((item: any) => item.image_url || item.primary_image)
      .map((item: any) => ({
        url: item.image_url || item.primary_image,
        title: item.designation || item.title || "Untitled",
        source: "CDLI (Cuneiform Digital Library)",
        objectUrl: item.url || `https://cdli.mpiwg-berlin.mpg.de/artifacts/${item.id}`,
        date: item.period,
        culture: item.provenience || item.culture,
        medium: item.material || item.object_type,
        license: "CC BY 4.0",
      } as MuseumResult));
  } catch (err) {
    console.error("CDLI API error:", err);
    return [];
  }
}

export async function searchGetty(query: string, limit = 6): Promise<MuseumResult[]> {
  try {
    const searchUrl =
      `https://search.getty.edu/gateway/search?q=${encodeURIComponent(query)}` +
      `&f=${encodeURIComponent('"Open Content Images"')}&rows=20&srt=a&dir=s&pg=1`;

    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Educational Research) euclid-chronos" },
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
      });
    }
    return results;
  } catch (err) {
    console.error("Getty search error:", err);
    return [];
  }
}

export async function searchAIC(query: string, limit = 6): Promise<MuseumResult[]> {
  try {
    const res = await fetch(
      `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}&limit=${limit}&fields=id,title,image_id,is_public_domain,artist_title,date_display,place_of_origin,medium_display`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const iiif = data.config?.iiif_url || "https://www.artic.edu/iiif/2";
    const items: any[] = data.data || [];

    return items
      .filter((item: any) => item.image_id && item.is_public_domain !== false)
      .map((item: any) => ({
        url: `${iiif}/${item.image_id}/full/843,/0/default.jpg`,
        title: item.title || "Untitled",
        source: "Art Institute of Chicago",
        objectUrl: `https://www.artic.edu/artworks/${item.id}`,
        date: item.date_display,
        culture: item.place_of_origin,
        medium: item.medium_display,
        license: "CC0",
      } as MuseumResult));
  } catch (err) {
    console.error("AIC API error:", err);
    return [];
  }
}

export async function searchCleveland(query: string, limit = 6): Promise<MuseumResult[]> {
  try {
    const res = await fetch(
      `https://openaccess-api.clevelandart.org/api/artworks/?q=${encodeURIComponent(query)}&has_image=1&limit=${limit}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items: any[] = data.data || [];

    return items
      .filter((item: any) => item.images?.web?.url || item.images?.print?.url)
      .map((item: any) => ({
        url: item.images?.print?.url || item.images?.web?.url,
        title: item.title || "Untitled",
        source: "Cleveland Museum of Art",
        objectUrl: item.url,
        date: item.creation_date,
        culture: item.culture,
        medium: item.technique,
        license: item.share_license_status || "CC0",
      } as MuseumResult));
  } catch (err) {
    console.error("Cleveland API error:", err);
    return [];
  }
}

export async function searchPennMuseum(query: string, limit = 5): Promise<MuseumResult[]> {
  try {
    const res = await fetch(
      `https://www.penn.museum/api/objects/search?q=${encodeURIComponent(query)}&has_image=true&per_page=${limit}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items: any[] = data.objects || [];

    return items
      .filter((item: any) => item.image_url)
      .map((item: any) => ({
        url: item.image_url,
        title: item.object_name || "Untitled",
        source: "Penn Museum",
        objectUrl: `https://www.penn.museum/collections/object/${item.object_number}`,
        date: item.period,
        culture: item.culture,
        medium: item.material,
        license: "Educational Use",
      } as MuseumResult));
  } catch (err) {
    console.error("Penn Museum API error:", err);
    return [];
  }
}

export async function searchLouvre(query: string, limit = 5): Promise<MuseumResult[]> {
  try {
    const res = await fetch(
      `https://collections.louvre.fr/api/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items: any[] = data.results || data.records || [];

    return items
      .filter((item: any) => item.image || item.thumbnail)
      .map((item: any) => ({
        url: item.image || item.thumbnail,
        title: item.title || "Untitled",
        source: "Louvre Museum",
        objectUrl: item.url || `https://collections.louvre.fr/en/ark:/53355/${item.id}`,
        date: item.period,
        culture: item.department,
        license: "Public Domain",
      } as MuseumResult));
  } catch (err) {
    console.error("Louvre API error:", err);
    return [];
  }
}

// ── Google Scholar (free, no key) ─────────────────────────────────────────────
export async function searchGoogleScholar(query: string, limit = 6): Promise<MuseumResult[]> {
  try {
    const url = `https://scholar.google.com/scholar?q=${encodeURIComponent(query + " ancient mesopotamia artifact")}&num=${limit}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EuclidResearch/1.0; educational)",
        "Accept": "text/html",
      },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const results: MuseumResult[] = [];
    // Extract article cards from Scholar HTML
    const titleRe = /<h3[^>]*class="gs_rt"[^>]*>.*?<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gs;
    const snippetRe = /<div[^>]*class="gs_rs"[^>]*>(.*?)<\/div>/gs;
    const snippets: string[] = [];
    let sm: RegExpExecArray | null;
    while ((sm = snippetRe.exec(html)) !== null) snippets.push(sm[1].replace(/<[^>]+>/g, "").trim());
    let tm: RegExpExecArray | null;
    let i = 0;
    while ((tm = titleRe.exec(html)) !== null && results.length < limit) {
      const pageUrl = tm[1].startsWith("http") ? tm[1] : `https://scholar.google.com${tm[1]}`;
      const title = tm[2].replace(/<[^>]+>/g, "").trim();
      results.push({
        url: `https://via.placeholder.com/400x300/1a2a3a/6699aa?text=${encodeURIComponent(title.slice(0,30))}`,
        title,
        source: "Google Scholar",
        objectUrl: pageUrl,
        medium: snippets[i] ? snippets[i].slice(0, 120) : undefined,
        license: "Academic",
      });
      i++;
    }
    return results;
  } catch (err) {
    console.error("Google Scholar error:", err);
    return [];
  }
}

// ── Pinterest (free, no key — public search JSON) ─────────────────────────────
export async function searchPinterest(query: string, limit = 8): Promise<MuseumResult[]> {
  try {
    const bookmarks: string[] = [];
    const url = `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}&data=${encodeURIComponent(JSON.stringify({
      options: { query, scope: "pins", page_size: limit, bookmarks },
      context: {},
    }))}&_=` + Date.now();
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EuclidResearch/1.0)",
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json",
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const pins: any[] = data?.resource_response?.data?.results || [];
    return pins.slice(0, limit).map((pin: any) => {
      const img = pin.images?.["736x"] || pin.images?.orig || pin.images?.["236x"] || {};
      return {
        url: img.url || pin.image_cover_url || "",
        title: pin.title || pin.description?.slice(0, 80) || "Pinterest pin",
        source: "Pinterest",
        objectUrl: `https://www.pinterest.com/pin/${pin.id}/`,
        date: pin.created_at?.slice(0, 4),
        license: "Public Pin",
      } as MuseumResult;
    }).filter(r => r.url);
  } catch (err) {
    console.error("Pinterest error:", err);
    return [];
  }
}

// ── Google Images via Gemini grounding (free Google_AI key) ───────────────────
export async function searchGoogleImagesViaGemini(query: string): Promise<MuseumResult[]> {
  const apiKey = process.env.Google_AI;
  if (!apiKey) return [];
  try {
    const prompt = `You are a visual research assistant for a Mesopotamian artifact curriculum.

Search for real images of: "${query}"

Return a JSON array of 8–12 image results from across the web. Each item must have:
- "title": what is shown
- "imageUrl": a direct image URL ending in .jpg, .png, .gif, or .webp (real URLs only — museum sites, Wikimedia, archive.org, etc.)
- "pageUrl": the page where the image lives
- "source": site or institution name
- "date": approximate date if known
- "culture": civilization if known

Prioritize: museum databases, Wikimedia Commons, archive.org, university collections, World History Encyclopedia, Smarthistory, Google Arts & Culture.
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
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const images = JSON.parse(jsonMatch[0]);
    return images
      .filter((img: any) => img.imageUrl || img.pageUrl)
      .slice(0, 12)
      .map((img: any) => ({
        url: img.imageUrl || img.pageUrl,
        title: img.title || "Untitled",
        source: img.source || "Google Images (Gemini)",
        objectUrl: img.pageUrl,
        date: img.date,
        culture: img.culture,
        license: "See source",
      } as MuseumResult));
  } catch (err) {
    console.error("Gemini image search error:", err);
    return [];
  }
}

export async function searchAllMuseums(query: string): Promise<MuseumResult[]> {
  const results = await Promise.all([
    searchMetMuseum(query, 6),
    searchSmithsonian(query, 5),
    searchWikimediaCommons(query, 5),
    searchRijksmuseum(query, 5),
    searchEuropeana(query, 5),
    searchInternetArchive(query, 6),
    searchCDLI(query, 4),
    searchGetty(query, 5),
    searchAIC(query, 5),
    searchCleveland(query, 5),
    searchPennMuseum(query, 4),
    searchLouvre(query, 4),
    searchGoogleScholar(query, 5),
    searchPinterest(query, 8),
    searchGoogleImagesViaGemini(query),
  ]);

  return results.flat();
}

// Alias used by ingest routes
export const searchAllSources = searchAllMuseums;
