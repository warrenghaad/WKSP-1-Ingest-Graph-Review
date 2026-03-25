#!/usr/bin/env python3
"""
Art Institute of Chicago Image Scraper

Downloads images from the AIC's open API. No authentication required.
CC0 licensed images. Excellent collection of ancient, medieval, and modern art.
max_items=0 means unlimited — paginate through all results.
"""

import json
import time
import csv
import logging
import requests
from pathlib import Path
from typing import Dict, List, Optional

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("chicago_scraper.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


class ChicagoArtScraper:
    BASE_URL = "https://api.artic.edu/api/v1"

    DEFAULT_SEARCH_QUERIES = {
        "mesopotamian_art": [
            "Mesopotamia",
            "Assyrian",
            "Babylonian",
            "Sumerian",
            "cuneiform",
            "ancient Near East",
        ],
        "egyptian_art": [
            "ancient Egypt",
            "Egyptian sculpture",
            "pharaoh",
            "hieroglyph",
            "mummy",
        ],
        "greek_roman_art": [
            "Greek vase",
            "Roman sculpture",
            "amphora",
            "Hellenistic",
            "ancient Greece",
        ],
        "islamic_art": [
            "Islamic art",
            "geometric pattern",
            "arabesque",
            "Islamic tile",
            "calligraphy",
        ],
        "asian_art": [
            "Chinese bronze",
            "Japanese woodblock",
            "Buddhist sculpture",
            "mandala",
            "jade carving",
        ],
    }

    def __init__(
        self,
        base_dir: str = "downloads/chicago",
        max_items: int = 0,
        search_queries: Dict[str, List[str]] = None,
    ):
        self.base_dir = Path(base_dir)
        self.max_items = max_items
        self.search_queries = search_queries or self.DEFAULT_SEARCH_QUERIES
        self.session = requests.Session()
        self.session.headers.update(
            {"User-Agent": "Mozilla/5.0 ChicagoArtScraper/1.0"}
        )
        self._create_directories()

    def _create_directories(self):
        for cat in self.search_queries:
            (self.base_dir / cat).mkdir(parents=True, exist_ok=True)

    def search_artworks(self, query: str, max_results: int = 0) -> List[Dict]:
        all_results = []
        page = 1
        per_page = 100

        while True:
            if max_results > 0 and len(all_results) >= max_results:
                break
            params = {
                "q": query,
                "limit": per_page,
                "page": page,
                "fields": "id,title,artist_display,date_display,place_of_origin,medium_display,department_title,image_id,classification_title,style_title",
            }
            try:
                resp = self.session.get(f"{self.BASE_URL}/artworks/search", params=params, timeout=30)
                resp.raise_for_status()
                data = resp.json()
                items = [r for r in data.get("data", []) if r.get("image_id")]
                if not items:
                    break
                all_results.extend(items)
                pagination = data.get("pagination", {})
                if page >= pagination.get("total_pages", 1):
                    break
                page += 1
                time.sleep(0.25)
            except Exception as e:
                logger.error(f"Search failed for '{query}': {e}")
                break

        if max_results > 0:
            all_results = all_results[:max_results]
        return all_results

    def get_image_url(self, image_id: str, width: int = 1686) -> str:
        return f"https://www.artic.edu/iiif/2/{image_id}/full/{width},/0/default.jpg"

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
            writer.writerow(["id", "title", "artist", "date", "origin", "medium", "department", "classification", "style", "image_url"])
            for item in items:
                writer.writerow([
                    item.get("id", ""),
                    item.get("title", ""),
                    item.get("artist_display", ""),
                    item.get("date_display", ""),
                    item.get("place_of_origin", ""),
                    item.get("medium_display", ""),
                    item.get("department_title", ""),
                    item.get("classification_title", ""),
                    item.get("style_title", ""),
                    item.get("_image_url", ""),
                ])
        logger.info(f"Saved metadata for {len(items)} items to {csv_path}")

    def scrape_category(self, category: str):
        queries = self.search_queries.get(category, [])
        logger.info(f"Scraping category: {category}")
        seen_ids = set()
        all_items = []

        for query in queries:
            results = self.search_artworks(query, self.max_items)
            for item in results:
                if item["id"] not in seen_ids:
                    seen_ids.add(item["id"])
                    all_items.append(item)
            time.sleep(0.25)

        if self.max_items > 0:
            all_items = all_items[:self.max_items]

        logger.info(f"Processing {len(all_items)} unique items for {category}")
        downloaded = []
        for i, item in enumerate(all_items, 1):
            image_url = self.get_image_url(item["image_id"])
            title = self._sanitize(item.get("title", "untitled"))
            filepath = self.base_dir / category / f"{item['id']}_{title}.jpg"
            logger.info(f"[{category}] {i}/{len(all_items)}: {item.get('title', '')}")
            if self.download_image(image_url, filepath):
                item["_image_url"] = image_url
                downloaded.append(item)
            time.sleep(0.25)

        if downloaded:
            self.save_metadata(downloaded, category)

    def scrape_all(self):
        for category in self.search_queries:
            self.scrape_category(category)
        logger.info("Art Institute of Chicago scrape complete.")


def load_config(config_path: str = None) -> Dict:
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Art Institute of Chicago Scraper")
    parser.add_argument("--output", default="downloads/chicago")
    parser.add_argument("--max", type=int, default=0, help="Max items per category (0 = unlimited)")
    parser.add_argument("--config", default=None)
    args = parser.parse_args()
    cfg = load_config(args.config)
    src_cfg = cfg.get("chicago", {})
    scraper = ChicagoArtScraper(
        base_dir=args.output,
        max_items=args.max,
        search_queries=src_cfg.get("search_queries"),
    )
    scraper.scrape_all()
