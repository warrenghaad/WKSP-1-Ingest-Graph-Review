# Image Harvest Toolkit

A self-contained toolkit for batch-downloading images from museum APIs, stock photo services, visual discovery platforms, and digital archives. No hierarchy — every source is equal. Pick what fits the need.

## Directory Layout

```
tools/image-harvest/
├── config.json        # Search queries, output paths, API keys
├── run.py             # Master runner with CLI flags (19 sources)
├── met.py             # Metropolitan Museum of Art
├── smithsonian.py     # Smithsonian Open Access
├── wikimedia.py       # Wikimedia Commons
├── archive.py         # Internet Archive
├── chicago.py         # Art Institute of Chicago
├── cleveland.py       # Cleveland Museum of Art
├── rijksmuseum.py     # Rijksmuseum (Amsterdam)
├── europeana.py       # Europeana (50M+ European items)
├── loc.py             # Library of Congress
├── harvard.py         # Harvard Art Museums
├── vanda.py           # Victoria & Albert Museum
├── brooklyn.py        # Brooklyn Museum
├── walters.py         # Walters Art Museum
├── dpla.py            # Digital Public Library of America
├── google_images.py   # Google Images (Custom Search API)
├── pinterest.py       # Pinterest visual search
├── unsplash.py        # Unsplash stock photography
├── pexels.py          # Pexels stock photography
├── getty.py           # Getty Open Content images
└── README.md
```

Downloads land in:
```
downloads/<source>/<category>/
├── image_files...
└── metadata.csv
```

## All 19 Sources

| Script | Source | What It's Good At | Auth |
|--------|--------|-------------------|------|
| `met.py` | Metropolitan Museum of Art | Egyptian, Greek, Mesopotamian, medieval — 492K+ CC0 images | None |
| `smithsonian.py` | Smithsonian Institution | American history, ethnography, natural history — 4.4M+ CC0 | `SMITHSONIAN_API_KEY` |
| `wikimedia.py` | Wikimedia Commons | Everything — 90M+ files, category browsing | None |
| `archive.py` | Internet Archive | Pre-1928 books, illustrations, diagrams | None |
| `chicago.py` | Art Institute of Chicago | Ancient, medieval, modern — CC0 images | None |
| `cleveland.py` | Cleveland Museum of Art | Ancient Near East, Egyptian, Asian, African | None |
| `rijksmuseum.py` | Rijksmuseum | Dutch masters, Asian art, decorative arts — 700K+ | `RIJKS_API_KEY` |
| `europeana.py` | Europeana | European manuscripts, medieval, Islamic, Celtic — 50M+ | `EUROPEANA_API_KEY` |
| `loc.py` | Library of Congress | Maps, prints, manuscripts, historical photos | None |
| `harvard.py` | Harvard Art Museums | Ancient to modern, strong Asian & Islamic — 250K+ | `HARVARD_ART_API_KEY` |
| `vanda.py` | Victoria & Albert Museum | Textiles, ceramics, Islamic tiles, decorative arts — 1.2M+ | None |
| `brooklyn.py` | Brooklyn Museum | Egyptian, African, pre-Columbian — 100K+ | `BROOKLYN_MUSEUM_API_KEY` |
| `walters.py` | Walters Art Museum | Ancient Near East, medieval, Islamic manuscripts | None |
| `dpla.py` | Digital Public Library of America | Aggregated from 4K+ US institutions — 40M+ | `DPLA_API_KEY` |
| `google_images.py` | Google Images | Directed visual search — anything on the web | `GOOGLE_API_KEY` + `GOOGLE_CSE_ID` |
| `pinterest.py` | Pinterest | Curated visual collections, boards, infographics | None |
| `unsplash.py` | Unsplash | High-res stock photography — sites, textures, patterns | `UNSPLASH_ACCESS_KEY` |
| `pexels.py` | Pexels | Free stock photos — ruins, architecture, patterns | `PEXELS_API_KEY` |
| `getty.py` | Getty Open Content | Museum-grade open-licensed art and photographs | None |

## Requirements

Python 3.8+ and the `requests` library:

```bash
pip install requests
```

No other dependencies. All scrapers use direct HTTP calls.

## How to Run

### List all sources
```bash
python run.py --list-sources
```

### Run everything (sources without keys will warn and skip)
```bash
python run.py --source all
```

### Run a single source
```bash
python run.py --source met
python run.py --source pinterest
python run.py --source google_images
```

### Run multiple sources
```bash
python run.py --source met --source pinterest --source getty --source unsplash
```

### Override limits and output
```bash
python run.py --source all --max 100 --output ./my_research
```

By default `max_items=0` which means **unlimited** — every scraper will paginate through all available results until the API is exhausted. Pass `--max N` (any positive integer) to cap results per query/category.

### Run a scraper standalone
```bash
cd tools/image-harvest
python met.py --output downloads/met              # unlimited
python met.py --output downloads/met --max 50     # cap at 50 per category
python pinterest.py --output downloads/pinterest
python google_images.py --max 20
```

## API Keys

All keys are free. Set them as environment variables or put them in `config.json` under each source's `"api_key"` field.

| Source | Env Variable | Where to Get It |
|--------|-------------|-----------------|
| Smithsonian | `SMITHSONIAN_API_KEY` | https://api.data.gov/signup/ |
| Rijksmuseum | `RIJKS_API_KEY` | https://data.rijksmuseum.nl/ |
| Europeana | `EUROPEANA_API_KEY` | https://pro.europeana.eu/page/get-api |
| Harvard Art | `HARVARD_ART_API_KEY` | https://harvardartmuseums.org/collections/api |
| Brooklyn Museum | `BROOKLYN_MUSEUM_API_KEY` | https://www.brooklynmuseum.org/opencollection/api |
| DPLA | `DPLA_API_KEY` | https://pro.dp.la/developers/api |
| Google Images | `GOOGLE_API_KEY` + `GOOGLE_CSE_ID` | https://developers.google.com/custom-search/v1/overview |
| Unsplash | `UNSPLASH_ACCESS_KEY` | https://unsplash.com/developers |
| Pexels | `PEXELS_API_KEY` | https://www.pexels.com/api/ |

Sources that need **no key at all**: Met, Wikimedia, Internet Archive, Chicago, Cleveland, LOC, V&A, Walters, Pinterest, Getty.

## Adapting config.json for a New Project

`config.json` is the only file you need to edit when reusing this toolkit. Each source has its own section:

1. **Change search queries** — Replace the default queries with your research terms.
2. **Change output path** — Set `"output_base"` to your preferred download directory.
3. **Change per-source limits** — Set `"max_items"` under each source, or set `"default_max_items"` globally. `0` = unlimited (paginate until exhausted).
4. **Set API keys** — Add keys under each source's `"api_key"` field, or use environment variables.

## Rate Limiting

All scrapers include built-in rate limiting to be respectful to the APIs:
- **Met Museum**: 80 req/sec (API limit)
- **Pinterest**: 1s between requests (polite scraping)
- **Unsplash**: 1.5s between requests (50 req/hr free tier)
- **All others**: 0.25–0.5s delay between requests

## Output

Each source creates `downloads/<source>/<category>/` containing:
- Downloaded image files (JPG/PNG)
- `metadata.csv` with provenance: title, date, culture, artist, source URL, etc.
