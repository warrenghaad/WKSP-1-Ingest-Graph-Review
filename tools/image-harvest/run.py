#!/usr/bin/env python3
"""
Image Harvest Toolkit — Master Runner

Runs one or all scrapers with shared configuration.
max_items=0 means unlimited — fetch everything the APIs return.
No hierarchy — every source is equal, organized only by availability.

Usage:
    python run.py --source all
    python run.py --source met --max 100
    python run.py --source pinterest --source google_images
    python run.py --source met --source wikimedia --max 25
    python run.py --list-sources
"""

import argparse
import json
import logging
import sys
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

SOURCES = [
    "met",
    "smithsonian",
    "wikimedia",
    "archive",
    "chicago",
    "cleveland",
    "rijksmuseum",
    "europeana",
    "loc",
    "harvard",
    "vanda",
    "brooklyn",
    "walters",
    "dpla",
    "google_images",
    "pinterest",
    "unsplash",
    "pexels",
    "getty",
]

SOURCE_DESCRIPTIONS = {
    "met":           "Metropolitan Museum of Art — 492K+ CC0 images",
    "smithsonian":   "Smithsonian Open Access — 4.4M+ CC0 items",
    "wikimedia":     "Wikimedia Commons — 90M+ files, category-based",
    "archive":       "Internet Archive — pre-1928 public domain books & images",
    "chicago":       "Art Institute of Chicago — CC0 images",
    "cleveland":     "Cleveland Museum of Art — open access",
    "rijksmuseum":   "Rijksmuseum (Amsterdam) — 700K+ objects",
    "europeana":     "Europeana — 50M+ items from European institutions",
    "loc":           "Library of Congress — maps, prints, manuscripts",
    "harvard":       "Harvard Art Museums — 250K+ objects",
    "vanda":         "Victoria & Albert Museum — 1.2M+ decorative arts & design",
    "brooklyn":      "Brooklyn Museum — Egyptian, African, Asian art",
    "walters":       "Walters Art Museum — ancient & medieval art",
    "dpla":          "Digital Public Library of America — 40M+ US library items",
    "google_images": "Google Images — directed visual search via Custom Search API",
    "pinterest":     "Pinterest — visual discovery, boards, curated collections",
    "unsplash":      "Unsplash — high-res stock photography",
    "pexels":        "Pexels — free stock photos, high quality",
    "getty":         "Getty Open Content — museum-grade open-licensed images",
}

SOURCE_AUTH = {
    "met":           "none",
    "smithsonian":   "SMITHSONIAN_API_KEY (or DEMO_KEY fallback)",
    "wikimedia":     "none",
    "archive":       "none",
    "chicago":       "none",
    "cleveland":     "none",
    "rijksmuseum":   "RIJKS_API_KEY",
    "europeana":     "EUROPEANA_API_KEY",
    "loc":           "none",
    "harvard":       "HARVARD_ART_API_KEY",
    "vanda":         "none",
    "brooklyn":      "BROOKLYN_MUSEUM_API_KEY",
    "walters":       "none",
    "dpla":          "DPLA_API_KEY",
    "google_images": "GOOGLE_API_KEY + GOOGLE_CSE_ID",
    "pinterest":     "none",
    "unsplash":      "UNSPLASH_ACCESS_KEY",
    "pexels":        "PEXELS_API_KEY",
    "getty":         "none",
}

CONFIG_PATH = Path(__file__).parent / "config.json"


def load_config(config_path: str = None) -> dict:
    path = Path(config_path) if config_path else CONFIG_PATH
    if path.exists():
        with open(path) as f:
            return json.load(f)
    logger.warning(f"Config not found at {path}, using defaults")
    return {}


def _source_max(cfg: dict, source: str, cli_max: int) -> int:
    if cli_max is not None:
        return cli_max
    source_max = cfg.get(source, {}).get("max_items")
    if source_max is not None:
        return source_max
    return cfg.get("default_max_items", 0)


def run_met(cfg, output, max_items):
    from met import MetMuseumScraper
    c = cfg.get("met", {})
    MetMuseumScraper(base_path=f"{output}/met", max_items=_source_max(cfg, "met", max_items),
                     search_queries=c.get("search_queries")).scrape_all()

def run_smithsonian(cfg, output, max_items):
    from smithsonian import SmithsonianImageScraper
    c = cfg.get("smithsonian", {})
    s = SmithsonianImageScraper(base_dir=f"{output}/smithsonian", api_key=c.get("api_key"))
    if c.get("search_queries"):
        s.search_queries = c["search_queries"]
    s.bulk_download_all(max_images_per_query=_source_max(cfg, "smithsonian", max_items))

def run_wikimedia(cfg, output, max_items):
    from wikimedia import WikimediaCommonsScraper
    c = cfg.get("wikimedia", {})
    WikimediaCommonsScraper(base_dir=f"{output}/wikimedia",
                            categories=c.get("categories")).scrape_all(
        limit_per_category=_source_max(cfg, "wikimedia", max_items))

def run_archive(cfg, output, max_items):
    from archive import InternetArchiveScraper
    c = cfg.get("archive", {})
    InternetArchiveScraper(base_dir=f"{output}/archive",
                           searches=c.get("searches")).scrape_all(
        max_items=_source_max(cfg, "archive", max_items))

def run_chicago(cfg, output, max_items):
    from chicago import ChicagoArtScraper
    c = cfg.get("chicago", {})
    ChicagoArtScraper(base_dir=f"{output}/chicago",
                      max_items=_source_max(cfg, "chicago", max_items),
                      search_queries=c.get("search_queries")).scrape_all()

def run_cleveland(cfg, output, max_items):
    from cleveland import ClevelandMuseumScraper
    c = cfg.get("cleveland", {})
    ClevelandMuseumScraper(base_dir=f"{output}/cleveland",
                           max_items=_source_max(cfg, "cleveland", max_items),
                           search_queries=c.get("search_queries")).scrape_all()

def run_rijksmuseum(cfg, output, max_items):
    from rijksmuseum import RijksmuseumScraper
    c = cfg.get("rijksmuseum", {})
    RijksmuseumScraper(base_dir=f"{output}/rijksmuseum",
                       max_items=_source_max(cfg, "rijksmuseum", max_items),
                       api_key=c.get("api_key"),
                       search_queries=c.get("search_queries")).scrape_all()

def run_europeana(cfg, output, max_items):
    from europeana import EuropeanaScraper
    c = cfg.get("europeana", {})
    EuropeanaScraper(base_dir=f"{output}/europeana",
                     max_items=_source_max(cfg, "europeana", max_items),
                     api_key=c.get("api_key"),
                     search_queries=c.get("search_queries")).scrape_all()

def run_loc(cfg, output, max_items):
    from loc import LibraryOfCongressScraper
    c = cfg.get("loc", {})
    LibraryOfCongressScraper(base_dir=f"{output}/loc",
                             max_items=_source_max(cfg, "loc", max_items),
                             search_queries=c.get("search_queries")).scrape_all()

def run_harvard(cfg, output, max_items):
    from harvard import HarvardArtScraper
    c = cfg.get("harvard", {})
    HarvardArtScraper(base_dir=f"{output}/harvard",
                      max_items=_source_max(cfg, "harvard", max_items),
                      api_key=c.get("api_key"),
                      search_queries=c.get("search_queries")).scrape_all()

def run_vanda(cfg, output, max_items):
    from vanda import VandAScraper
    c = cfg.get("vanda", {})
    VandAScraper(base_dir=f"{output}/vanda",
                 max_items=_source_max(cfg, "vanda", max_items),
                 search_queries=c.get("search_queries")).scrape_all()

def run_brooklyn(cfg, output, max_items):
    from brooklyn import BrooklynMuseumScraper
    c = cfg.get("brooklyn", {})
    BrooklynMuseumScraper(base_dir=f"{output}/brooklyn",
                          max_items=_source_max(cfg, "brooklyn", max_items),
                          api_key=c.get("api_key"),
                          search_queries=c.get("search_queries")).scrape_all()

def run_walters(cfg, output, max_items):
    from walters import WaltersArtScraper
    c = cfg.get("walters", {})
    WaltersArtScraper(base_dir=f"{output}/walters",
                      max_items=_source_max(cfg, "walters", max_items),
                      search_queries=c.get("search_queries")).scrape_all()

def run_dpla(cfg, output, max_items):
    from dpla import DPLAScraper
    c = cfg.get("dpla", {})
    DPLAScraper(base_dir=f"{output}/dpla",
                max_items=_source_max(cfg, "dpla", max_items),
                api_key=c.get("api_key"),
                search_queries=c.get("search_queries")).scrape_all()

def run_google_images(cfg, output, max_items):
    from google_images import GoogleImagesScraper
    c = cfg.get("google_images", {})
    GoogleImagesScraper(base_dir=f"{output}/google_images",
                        max_items=_source_max(cfg, "google_images", max_items),
                        api_key=c.get("api_key"),
                        cse_id=c.get("cse_id"),
                        search_queries=c.get("search_queries")).scrape_all()

def run_pinterest(cfg, output, max_items):
    from pinterest import PinterestScraper
    c = cfg.get("pinterest", {})
    PinterestScraper(base_dir=f"{output}/pinterest",
                     max_items=_source_max(cfg, "pinterest", max_items),
                     search_queries=c.get("search_queries")).scrape_all()

def run_unsplash(cfg, output, max_items):
    from unsplash import UnsplashScraper
    c = cfg.get("unsplash", {})
    UnsplashScraper(base_dir=f"{output}/unsplash",
                    max_items=_source_max(cfg, "unsplash", max_items),
                    api_key=c.get("api_key"),
                    search_queries=c.get("search_queries")).scrape_all()

def run_pexels(cfg, output, max_items):
    from pexels import PexelsScraper
    c = cfg.get("pexels", {})
    PexelsScraper(base_dir=f"{output}/pexels",
                  max_items=_source_max(cfg, "pexels", max_items),
                  api_key=c.get("api_key"),
                  search_queries=c.get("search_queries")).scrape_all()

def run_getty(cfg, output, max_items):
    from getty import GettyScraper
    c = cfg.get("getty", {})
    GettyScraper(base_dir=f"{output}/getty",
                 max_items=_source_max(cfg, "getty", max_items),
                 search_queries=c.get("search_queries")).scrape_all()


RUNNERS = {
    "met": run_met,
    "smithsonian": run_smithsonian,
    "wikimedia": run_wikimedia,
    "archive": run_archive,
    "chicago": run_chicago,
    "cleveland": run_cleveland,
    "rijksmuseum": run_rijksmuseum,
    "europeana": run_europeana,
    "loc": run_loc,
    "harvard": run_harvard,
    "vanda": run_vanda,
    "brooklyn": run_brooklyn,
    "walters": run_walters,
    "dpla": run_dpla,
    "google_images": run_google_images,
    "pinterest": run_pinterest,
    "unsplash": run_unsplash,
    "pexels": run_pexels,
    "getty": run_getty,
}


def main():
    parser = argparse.ArgumentParser(
        description="Image Harvest Toolkit — Master Runner (19 sources)"
    )
    parser.add_argument(
        "--source",
        action="append",
        choices=SOURCES + ["all"],
        help="Source to scrape (can be repeated). Use 'all' for every source.",
    )
    parser.add_argument(
        "--max",
        type=int,
        default=None,
        help="Max items per category/query (overrides config). 0 = unlimited (default).",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Base output directory (overrides config)",
    )
    parser.add_argument(
        "--config",
        default=None,
        help="Path to config.json (default: config.json in this directory)",
    )
    parser.add_argument(
        "--list-sources",
        action="store_true",
        help="List all available sources and exit",
    )
    args = parser.parse_args()

    if args.list_sources:
        print(f"\nAll {len(SOURCES)} sources (no hierarchy — pick what fits the need):\n")
        for src in SOURCES:
            desc = SOURCE_DESCRIPTIONS.get(src, "")
            auth = SOURCE_AUTH.get(src, "unknown")
            key_note = "" if auth == "none" else f"  [needs: {auth}]"
            print(f"  {src:15s} {desc}{key_note}")
        print(f"\n  {'all':15s} Run every source above")
        print()
        return

    cfg = load_config(args.config)
    output = args.output or cfg.get("output_base", "./downloads")
    max_items = args.max

    sources = args.source or ["all"]
    if "all" in sources:
        sources = SOURCES

    logger.info(f"Sources: {sources}")
    logger.info(f"Output:  {output}")
    if max_items is not None:
        logger.info(f"Max:     {max_items or 'unlimited'}")
    else:
        logger.info(f"Max:     (per-source defaults, 0 = unlimited)")

    for source in sources:
        runner = RUNNERS.get(source)
        if not runner:
            logger.error(f"Unknown source: {source}")
            continue
        logger.info(f"--- Starting {source} scraper ---")
        try:
            runner(cfg, output, max_items)
        except Exception as e:
            logger.error(f"{source} scraper failed: {e}", exc_info=True)
        logger.info(f"--- Finished {source} scraper ---")

    logger.info("All done.")


if __name__ == "__main__":
    main()
