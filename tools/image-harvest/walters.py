#!/usr/bin/env python3
"""
Walters Art Museum Image Scraper

Downloads images from the Walters Art Museum API. No authentication required.
Strong ancient Near Eastern, Egyptian, Greek, and medieval collections.
max_items=0 means unlimited — paginate through all results.
"""

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
        logging.FileHandler("walters_scraper.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


class WaltersArtScraper:
    BASE_URL = "https://api.thewalters.org/v1/objects"

    DEFAULT_SEARCH_QUERIES = {
        "ancient_near_east": ["Mesopotamian", "Assyrian", "Babylonian", "cuneiform"],
        "egyptian_art": ["Egyptian", "pharaoh", "hieroglyph", "ancient Egypt"],
        "greek_roman_art": ["Greek", "Roman", "amphora", "ancient sculpture"],
        "islamic_art": ["Islamic", "Persian", "Arabic calligraphy", "Quran"],
        "medieval_art": ["medieval", "illuminated", "Byzantine", "Gothic"],
        "asian_art": ["Chinese", "Japanese", "Buddhist", "Indian"],
    }

    def __init__(self, base_dir="downloads/walters", max_items=0, search_queries=None):
        self.base_dir = Path(base_dir)
        self.max_items = max_items
        self.search_queries = search_queries or self.DEFAULT_SEARCH_QUERIES
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 WaltersScraper/1.0",
            "Accept": "application/json",
        })
        self._create_directories()

    def _create_directories(self):
        for cat in self.search_queries:
            (self.base_dir / cat).mkdir(parents=True, exist_ok=True)

    def search_objects(self, query: str, max_results: int = 0) -> List[Dict]:
        all_results = []
        page = 1
        per_page = 100

        while True:
            if max_results > 0 and len(all_results) >= max_results:
                break
            params = {"keyword": query, "hasImages": "true", "pageSize": per_page, "page": page, "accept": "json"}
            try:
                resp = self.session.get(self.BASE_URL, params=params, timeout=30)
                resp.raise_for_status()
                data = resp.json()
                items = []
                for item in data.get("Items", []):
                    img_url = item.get("PrimaryImage", {}).get("Large", "")
                    if not img_url:
                        img_url = item.get("PrimaryImage", {}).get("Medium", "")
                    if img_url:
                        item["_download_url"] = img_url
                        items.append(item)
                if not items:
                    break
                all_results.extend(items)
                total = data.get("ReturnStatus", False)
                if len(items) < per_page:
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
        for ch in '<>:"/\\|?*':
            name = name.replace(ch, "_")
        return name[:180]

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
            writer.writerow(["id", "title", "date", "culture", "medium", "classification", "creator", "image_url"])
            for item in items:
                writer.writerow([
                    item.get("ObjectID", ""),
                    item.get("Title", ""),
                    item.get("DateText", ""),
                    item.get("Culture", ""),
                    item.get("Medium", ""),
                    item.get("Classification", ""),
                    item.get("Creator", ""),
                    item.get("_download_url", ""),
                ])
        logger.info(f"Saved metadata for {len(items)} items to {csv_path}")

    def scrape_category(self, category: str):
        queries = self.search_queries.get(category, [])
        logger.info(f"Scraping category: {category}")
        seen = set()
        all_items = []
        for query in queries:
            for item in self.search_objects(query, self.max_items):
                oid = item.get("ObjectID")
                if oid not in seen:
                    seen.add(oid)
                    all_items.append(item)
            time.sleep(0.5)

        if self.max_items > 0:
            all_items = all_items[:self.max_items]

        logger.info(f"Processing {len(all_items)} unique items for {category}")
        downloaded = []
        for i, item in enumerate(all_items, 1):
            title = self._sanitize(item.get("Title", "untitled"))
            filepath = self.base_dir / category / f"{item['ObjectID']}_{title}.jpg"
            logger.info(f"[{category}] {i}/{len(all_items)}: {item.get('Title', '')}")
            if self.download_image(item["_download_url"], filepath):
                downloaded.append(item)
            time.sleep(0.25)
        if downloaded:
            self.save_metadata(downloaded, category)

    def scrape_all(self):
        for category in self.search_queries:
            self.scrape_category(category)
        logger.info("Walters Art Museum scrape complete.")


def load_config(config_path=None):
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Walters Art Museum Scraper")
    parser.add_argument("--output", default="downloads/walters")
    parser.add_argument("--max", type=int, default=0, help="Max items per category (0 = unlimited)")
    parser.add_argument("--config", default=None)
    args = parser.parse_args()
    cfg = load_config(args.config)
    src_cfg = cfg.get("walters", {})
    scraper = WaltersArtScraper(
        base_dir=args.output,
        max_items=args.max,
        search_queries=src_cfg.get("search_queries"),
    )
    scraper.scrape_all()
