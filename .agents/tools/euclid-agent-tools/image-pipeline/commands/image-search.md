---
description: "Search museum APIs for artifact images matching research findings"
allowed-tools: WebSearch, WebFetch, Read, Write, Bash, Glob, Grep
---

# /image-search — Museum API Image Search

Search for artifact images across museum APIs. Returns structured results with metadata, URLs, and preliminary quality estimates.

## Usage

```
/image-search <element> <civilization> [--artifact "specific name"] [--accession "number"] [--limit 20]
```

## Instructions

1. **Load references:**
   - Read `@${CLAUDE_PLUGIN_ROOT}/skills/image-pipeline/references/museum-api-patterns.md`
   - Read `@${CLAUDE_PLUGIN_ROOT}/skills/image-pipeline/references/quality-rubric.md`

2. **Parse input:**
   - Extract the geometric element (e.g., "circle", "crescent", "8-star")
   - Extract the civilization (e.g., "mesopotamia", "egypt", "greece")
   - If a specific artifact name or accession number is provided, prioritize exact match

3. **Execute searches in this order:**

   **A. Metropolitan Museum Open Access API:**
   ```
   WebFetch: https://collectionapi.metmuseum.org/public/collection/v1/search?q=BROAD_QUERY&hasImages=true
   ```
   - Use BROAD 1-2 word queries: `"{civilization} {element}"` or `"{civilization} {carrier}"`
   - For each result (up to 10 objectIDs), fetch details:
   ```
   WebFetch: https://collectionapi.metmuseum.org/public/collection/v1/objects/{objectID}
   ```
   - ONLY include results where `isPublicDomain: true`
   - Record: `primaryImage`, `primaryImageSmall`, `title`, `objectDate`, `medium`, `dimensions`, `accessionNumber`, `culture`, `period`

   **B. Wikimedia Commons:**
   ```
   WebFetch: https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=QUERY&srnamespace=6&srlimit=10&format=json
   ```
   - Search for `"{civilization} {element}"` and `"{artifact_name}"` if provided
   - For promising results, get image info for direct URL

   **C. British Museum (web search fallback):**
   ```
   WebSearch: "site:britishmuseum.org {civilization} {element}"
   ```
   - Or search by BM number if accession provided

   **D. Smithsonian Open Access (if needed):**
   ```
   WebFetch: https://api.si.edu/openaccess/api/v1.0/search?q=QUERY&online_media_type=Images&rows=10
   ```

4. **For each result, produce a SEARCH_RESULT block:**

```yaml
SEARCH_RESULT:
  source: "Met Museum" | "Wikimedia" | "British Museum" | "Smithsonian"
  object_id: string
  title: string
  date: string
  culture: string
  medium: string
  dimensions: string
  accession: string
  image_url: string
  thumbnail_url: string
  is_public_domain: true | false | unknown
  preliminary_relevance: 1-5
  gea_match_likelihood: high | medium | low
  download_priority: 1-N
```

5. **Output a SEARCH_SUMMARY:**

```yaml
SEARCH_SUMMARY:
  query_element: string
  query_civilization: string
  total_results: integer
  by_source:
    met: integer
    wikimedia: integer
    british_museum: integer
    smithsonian: integer
  high_priority: integer
  ready_for_download: [list of image_urls]
  needs_further_search: [list of gaps]
```

## Hard Rules
- **BROAD keywords only** — never more than 3 words in a search query
- **Public domain first** — always prefer confirmed public domain images
- **No local searches** — only external museum APIs
- **Record everything** — even low-relevance results may be useful for comparison sections
