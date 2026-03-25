#!/usr/bin/env python3
"""
Unsplash Image Scraper

Downloads high-resolution photos from the Unsplash API.
Requires a free API key from https://unsplash.com/developers
Falls back to env var UNSPLASH_ACCESS_KEY.
Free tier: 50 requests/hour.
max_items=0 means unlimited — paginate through all results.
"""

import os
import json
import time
import csv
import logging
import requests
from pathlib import Path
from typing import Dict, List

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("unsplash_scraper.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


class UnsplashScraper:
    BASE_URL = "https://api.unsplash.com"

    DEFAULT_SEARCH_QUERIES = {
        "ancient_sites": [
            "Mesopotamia ruins",
            "Egyptian pyramid",
            "ancient temple",
            "archaeological site",
        ],
        "artifacts": [
            "ancient artifact museum",
            "cuneiform",
            "hieroglyph",
            "ancient pottery",
        ],
        "geometric_patterns": [
            "geometric pattern",
            "Islamic tile",
            "mosaic",
            "tessellation",
            "mandala",
        ],
        "textures_materials": [
            "clay texture ancient",
            "stone carving detail",
            "ancient brick wall",
        ],
    }

    def __init__(self, base_dir="downloads/unsplash", max_items=0,
                 api_key=None, search_queries=None):
        self.base_dir = Path(base_dir)
        self.max_items = max_items
        self.api_key = api_key or os.environ.get("UNSPLASH_ACCESS_KEY", "")
        self.search_queries = search_queries or self.DEFAULT_SEARCH_QUERIES
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 UnsplashScraper/1.0",
        })
        if self.api_key:
            self.session.headers["Authorization"] = f"Client-ID {self.api_key}"
        else:
            logger.warning("No Unsplash API key. Get one free at https://unsplash.com/developers")
        self._create_directories()

    def _create_directories(self):
        for cat in self.search_queries:
            (self.base_dir / cat).mkdir(parents=True, exist_ok=True)

    def search_photos(self, query: str, max_results: int = 0) -> List[Dict]:
        if not self.api_key:
            return []
        all_results = []
        page = 1
        per_page = 30

        while True:
            if max_results > 0 and len(all_results) >= max_results:
                break
            params = {"query": query, "page": page, "per_page": per_page}
            try:
                resp = self.session.get(f"{self.BASE_URL}/search/photos",
                                        params=params, timeout=30)
                resp.raise_for_status()
                data = resp.json()
                results = data.get("results", [])
                if not results:
                    break
                for item in results:
                    all_results.append({
                        "id": item.get("id", ""),
                        "description": item.get("description") or item.get("alt_description", ""),
                        "image_url": item.get("urls", {}).get("regular", ""),
                        "full_url": item.get("urls", {}).get("full", ""),
                        "thumbnail": item.get("urls", {}).get("thumb", ""),
                        "width": item.get("width", 0),
                        "height": item.get("height", 0),
                        "color": item.get("color", ""),
                        "author": item.get("user", {}).get("name", ""),
                        "author_url": item.get("user", {}).get("links", {}).get("html", ""),
                        "page_url": item.get("links", {}).get("html", ""),
                        "license": "Unsplash License",
                    })
                total_pages = data.get("total_pages", 1)
                if page >= total_pages:
                    break
                page += 1
                time.sleep(1.5)
            except Exception as e:
                logger.error(f"Search failed for '{query}': {e}")
                break

        if max_results > 0:
            all_results = all_results[:max_results]
        return all_results

    def _sanitize(self, name: str) -> str:
        for ch in '<>:"/\\|?*\n\r\t':
            name = name.replace(ch, "_")
        return name[:150]

    def download_image(self, url: str, filepath: Path) -> bool:
        try:
            resp = self.session.get(url, timeout=60)
            resp.raise_for_status()
            filepath.parent.mkdir(parents=True, exist_ok=True)
            with open(filepath, "wb") as f:
                f.write(resp.content)
            return True
        except Exception as e:
            logger.error(f"Download failed {url}: {e}")
            return False

    def save_metadata(self, items: List[Dict], category: str):
        csv_path = self.base_dir / category / "metadata.csv"
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["id", "description", "image_url", "full_url", "width", "height",
                             "author", "author_url", "page_url", "license", "local_path"])
            for item in items:
                writer.writerow([
                    item.get("id", ""),
                    item.get("description", ""),
                    item.get("image_url", ""),
                    item.get("full_url", ""),
                    item.get("width", ""),
                    item.get("height", ""),
                    item.get("author", ""),
                    item.get("author_url", ""),
                    item.get("page_url", ""),
                    item.get("license", ""),
                    item.get("local_path", ""),
                ])
        logger.info(f"Saved metadata for {len(items)} items to {csv_path}")

    def scrape_category(self, category: str):
        queries = self.search_queries.get(category, [])
        logger.info(f"Scraping category: {category}")
        seen = set()
        all_items = []
        for query in queries:
            for item in self.search_photos(query, self.max_items):
                uid = item.get("id", "")
                if uid not in seen:
                    seen.add(uid)
                    all_items.append(item)
            time.sleep(1.5)

        if self.max_items > 0:
            all_items = all_items[:self.max_items]

        logger.info(f"Processing {len(all_items)} unique photos for {category}")
        downloaded = []
        for i, item in enumerate(all_items, 1):
            desc = self._sanitize(item.get("description", "photo"))
            filepath = self.base_dir / category / f"{item['id']}_{desc}.jpg"
            logger.info(f"[{category}] {i}/{len(all_items)}: {item.get('description', '')[:60]}")
            if self.download_image(item["image_url"], filepath):
                item["local_path"] = str(filepath)
                downloaded.append(item)
            time.sleep(0.5)
        if downloaded:
            self.save_metadata(downloaded, category)

    def scrape_all(self):
        for category in self.search_queries:
            self.scrape_category(category)
        logger.info("Unsplash scrape complete.")


def load_config(config_path=None):
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Unsplash Image Scraper")
    parser.add_argument("--output", default="downloads/unsplash")
    parser.add_argument("--max", type=int, default=0, help="Max items per category (0 = unlimited)")
    parser.add_argument("--config", default=None)
    args = parser.parse_args()
    cfg = load_config(args.config)
    src_cfg = cfg.get("unsplash", {})
    scraper = UnsplashScraper(
        base_dir=args.output,
        max_items=args.max,
        api_key=src_cfg.get("api_key"),
        search_queries=src_cfg.get("search_queries"),
    )
    scraper.scrape_all()
