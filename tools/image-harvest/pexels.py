#!/usr/bin/env python3
"""
Pexels Image Scraper

Downloads high-resolution stock photos from the Pexels API.
Requires a free API key from https://www.pexels.com/api/
Falls back to env var PEXELS_API_KEY.
Free tier: 200 requests/hour, 20K requests/month.
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
        logging.FileHandler("pexels_scraper.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


class PexelsScraper:
    BASE_URL = "https://api.pexels.com/v1"

    DEFAULT_SEARCH_QUERIES = {
        "ancient_sites": [
            "ancient ruins",
            "pyramid Egypt",
            "archaeological excavation",
            "ancient temple",
        ],
        "artifacts_museum": [
            "museum artifact",
            "ancient sculpture",
            "pottery ancient",
            "stone carving",
        ],
        "patterns_geometry": [
            "geometric pattern",
            "mosaic tile",
            "symmetry architecture",
            "tessellation",
        ],
    }

    def __init__(self, base_dir="downloads/pexels", max_items=0,
                 api_key=None, search_queries=None):
        self.base_dir = Path(base_dir)
        self.max_items = max_items
        self.api_key = api_key or os.environ.get("PEXELS_API_KEY", "")
        self.search_queries = search_queries or self.DEFAULT_SEARCH_QUERIES
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 PexelsScraper/1.0",
        })
        if self.api_key:
            self.session.headers["Authorization"] = self.api_key
        else:
            logger.warning("No Pexels API key. Get one free at https://www.pexels.com/api/")
        self._create_directories()

    def _create_directories(self):
        for cat in self.search_queries:
            (self.base_dir / cat).mkdir(parents=True, exist_ok=True)

    def search_photos(self, query: str, max_results: int = 0) -> List[Dict]:
        if not self.api_key:
            return []
        all_results = []
        page = 1
        per_page = 80

        while True:
            if max_results > 0 and len(all_results) >= max_results:
                break
            params = {"query": query, "page": page, "per_page": per_page}
            try:
                resp = self.session.get(f"{self.BASE_URL}/search",
                                        params=params, timeout=30)
                resp.raise_for_status()
                data = resp.json()
                photos = data.get("photos", [])
                if not photos:
                    break
                for photo in photos:
                    src = photo.get("src", {})
                    all_results.append({
                        "id": photo.get("id", ""),
                        "alt": photo.get("alt", ""),
                        "image_url": src.get("large2x", src.get("large", "")),
                        "original_url": src.get("original", ""),
                        "thumbnail": src.get("medium", ""),
                        "width": photo.get("width", 0),
                        "height": photo.get("height", 0),
                        "photographer": photo.get("photographer", ""),
                        "photographer_url": photo.get("photographer_url", ""),
                        "page_url": photo.get("url", ""),
                        "avg_color": photo.get("avg_color", ""),
                        "license": "Pexels License",
                    })
                next_page = data.get("next_page")
                if not next_page:
                    break
                page += 1
                time.sleep(0.5)
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
            writer.writerow(["id", "alt", "image_url", "original_url", "width", "height",
                             "photographer", "photographer_url", "page_url", "license", "local_path"])
            for item in items:
                writer.writerow([
                    item.get("id", ""),
                    item.get("alt", ""),
                    item.get("image_url", ""),
                    item.get("original_url", ""),
                    item.get("width", ""),
                    item.get("height", ""),
                    item.get("photographer", ""),
                    item.get("photographer_url", ""),
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
                pid = item.get("id", "")
                if pid and pid not in seen:
                    seen.add(pid)
                    all_items.append(item)
            time.sleep(0.5)

        if self.max_items > 0:
            all_items = all_items[:self.max_items]

        logger.info(f"Processing {len(all_items)} unique photos for {category}")
        downloaded = []
        for i, item in enumerate(all_items, 1):
            desc = self._sanitize(item.get("alt", "photo"))
            filepath = self.base_dir / category / f"pexels_{item['id']}_{desc}.jpg"
            logger.info(f"[{category}] {i}/{len(all_items)}: {item.get('alt', '')[:60]}")
            if self.download_image(item["image_url"], filepath):
                item["local_path"] = str(filepath)
                downloaded.append(item)
            time.sleep(0.3)
        if downloaded:
            self.save_metadata(downloaded, category)

    def scrape_all(self):
        for category in self.search_queries:
            self.scrape_category(category)
        logger.info("Pexels scrape complete.")


def load_config(config_path=None):
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Pexels Image Scraper")
    parser.add_argument("--output", default="downloads/pexels")
    parser.add_argument("--max", type=int, default=0, help="Max items per category (0 = unlimited)")
    parser.add_argument("--config", default=None)
    args = parser.parse_args()
    cfg = load_config(args.config)
    src_cfg = cfg.get("pexels", {})
    scraper = PexelsScraper(
        base_dir=args.output,
        max_items=args.max,
        api_key=src_cfg.get("api_key"),
        search_queries=src_cfg.get("search_queries"),
    )
    scraper.scrape_all()
