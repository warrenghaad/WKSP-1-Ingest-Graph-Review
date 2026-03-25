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

export async function searchAllMuseums(query: string): Promise<MuseumResult[]> {
  const [met, smithsonian, wikimedia, rijksmuseum, europeana, archive, cdli] = await Promise.all([
    searchMetMuseum(query, 6),
    searchSmithsonian(query, 5),
    searchWikimediaCommons(query, 5),
    searchRijksmuseum(query, 5),
    searchEuropeana(query, 5),
    searchInternetArchive(query, 4),
    searchCDLI(query, 4),
  ]);

  return [...met, ...smithsonian, ...wikimedia, ...rijksmuseum, ...europeana, ...archive, ...cdli];
}
