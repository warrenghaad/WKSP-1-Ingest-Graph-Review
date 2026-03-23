# Museum API Search Patterns

## Metropolitan Museum of Art (Open Access)

### Search Endpoint
```
GET https://collectionapi.metmuseum.org/public/collection/v1/search
Parameters:
  q=QUERY          # Required. Keep BROAD: 1-2 keywords
  hasImages=true   # Only objects with images
  isOnView=false   # Include storage items (much larger pool)
  departmentId=N   # Optional department filter
```

### Key Department IDs
| ID | Department | Use For |
|----|-----------|---------|
| 3  | Ancient Near Eastern Art | Mesopotamia, Persia, Anatolia |
| 10 | Egyptian Art | Egypt all periods |
| 13 | Greek and Roman Art | Greece, Rome |
| 2  | Asian Art | China, India, Japan, SE Asia |
| 5  | Arts of Africa, Oceania, Americas | Mesoamerica, Sub-Saharan |
| 14 | Islamic Art | Islamic Golden Age |

### Object Detail Endpoint
```
GET https://collectionapi.metmuseum.org/public/collection/v1/objects/{objectID}
Returns full metadata including:
  - primaryImage (full resolution URL)
  - primaryImageSmall (thumbnail)
  - additionalImages[] (alternate views)
  - isPublicDomain (MUST be true for use)
  - objectDate, period, culture, medium, dimensions
  - accessionNumber, creditLine, repository
  - GalleryNumber (if on view)
```

### Search Strategy Examples
```
# GOOD — broad, returns many results
"mesopotamia seal"
"babylonian tablet"
"assyrian relief"
"sumerian sculpture"
"cylinder seal"

# BAD — too specific, returns nothing
"neo-assyrian cylinder seal depicting shamash sun disk with radiating lines 850 BCE"
"old babylonian mathematical tablet showing circle area calculation"
```

### Rate Limits
- No authentication required
- No official rate limit, but be respectful: ~1 request/second
- Cache results aggressively — objectIDs don't change

---

## Wikimedia Commons

### Search Endpoint
```
GET https://commons.wikimedia.org/w/api.php
Parameters:
  action=query
  list=search
  srsearch=QUERY
  srnamespace=6     # File namespace only
  srlimit=20        # Max results per page
  format=json
```

### Image Info Endpoint
```
GET https://commons.wikimedia.org/w/api.php
Parameters:
  action=query
  titles=File:FILENAME.jpg
  prop=imageinfo
  iiprop=url|size|mime|extmetadata
  format=json
```

### Search Tips
- Use English category names: `"Babylonian art"`, `"Mesopotamian seals"`
- Try artifact names directly: `"Stele of Hammurabi"`, `"Tablet YBC 7302"`
- Category browsing: `"Category:Ancient Near Eastern art"`, `"Category:Cylinder seals"`

### License Filtering
Look for `extmetadata.LicenseShortName`:
- `"Public domain"` — free to use
- `"CC-BY-SA-4.0"` — attribute + share-alike
- `"CC-BY-4.0"` — attribute only

---

## British Museum

### No Public API — Use Web Search Strategy
```
# Search by museum number
WebSearch: "site:britishmuseum.org BM 91000"
WebSearch: "british museum collection online [ARTIFACT NAME]"

# Known Mesopotamian treasures with BM numbers:
BM 91000  — Shamash Tablet (Sun God Tablet)
BM 92687  — Babylonian Map of the World
BM 116624 — Standard of Ur (Peace side)
BM 116625 — Standard of Ur (War side)
BM 118822 — Flood Tablet (Gilgamesh XI)
BM 121201 — Black Obelisk of Shalmaneser III
```

### Image URLs
British Museum images often follow pattern:
`https://www.britishmuseum.org/collection/image/[IMAGE_ID]`

---

## Smithsonian Open Access

### Search Endpoint
```
GET https://api.si.edu/openaccess/api/v1.0/search
Parameters:
  q=QUERY
  online_media_type=Images
  rows=10
  start=0
```

### Key Collections
- National Museum of Asian Art (Freer|Sackler) — good for Mesopotamia
- National Museum of Natural History — some archaeological

---

## Search Priority Algorithm

```python
def search_for_artifact(artifact_name, accession=None, civilization=None, element=None):
    results = []

    # Priority 1: Known accession number
    if accession:
        # Try Met by accession
        results += met_search(accession)
        # Try Wikimedia by accession/name
        results += wiki_search(artifact_name)

    # Priority 2: Named artifact
    if artifact_name:
        results += met_search(artifact_name)
        results += wiki_search(artifact_name)
        results += web_search(f"site:britishmuseum.org {artifact_name}")

    # Priority 3: Broad category
    if civilization and element:
        broad_query = f"{civilization} {element}"
        results += met_search(broad_query, department=get_dept(civilization))
        results += wiki_search(f"{civilization} {element} artifact")

    # Priority 4: Broader still
    if not results:
        results += met_search(civilization)
        results += wiki_search(f"{civilization} ancient art")

    return deduplicate(results)
```
