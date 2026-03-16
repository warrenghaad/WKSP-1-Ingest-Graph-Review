export interface MuseumResult {
  url: string;
  title: string;
  source: string;
  objectUrl?: string;
  date?: string;
  culture?: string;
  medium?: string;
}

export async function searchMetMuseum(query: string, limit = 8): Promise<MuseumResult[]> {
  try {
    const searchRes = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&isPublicDomain=true&departmentId=3&q=${encodeURIComponent(query)}`
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
          } as MuseumResult;
        } catch {
          return null;
        }
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
      .filter((row: any) => {
        const descriptiveNonRepeating = row.content?.descriptiveNonRepeating;
        return descriptiveNonRepeating?.online_media?.media?.length > 0;
      })
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
        } as MuseumResult;
      })
      .filter((r): r is MuseumResult => r !== null);
  } catch (err) {
    console.error("Wikimedia API error:", err);
    return [];
  }
}

export async function searchAllMuseums(query: string): Promise<MuseumResult[]> {
  const [metResults, smithResults, wikiResults] = await Promise.all([
    searchMetMuseum(query, 6),
    searchSmithsonian(query, 4),
    searchWikimediaCommons(query, 4),
  ]);

  return [...metResults, ...smithResults, ...wikiResults];
}
