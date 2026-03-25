#!/usr/bin/env python3
"""
Internet Archive Historical Image Scraper

Downloads images from digitized historical books and collections.
Uses direct HTTP calls to the Internet Archive API (no SDK required).
Can be run standalone or via run.py master runner.
max_items=0 means unlimited — paginate through all results.
"""

import os
import time
import json
import csv
import logging
import requests
from pathlib import Path
from typing import List, Dict, Optional

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("archive_scraper.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


class InternetArchiveScraper:
    SEARCH_URL = "https://archive.org/advancedsearch.php"
    METADATA_URL = "https://archive.org/metadata"
    DOWNLOAD_URL = "https://archive.org/download"

    DEFAULT_SEARCHES = {
        "mesopotamian_art": [
            "Mesopotamian art",
            "Assyrian sculpture",
            "Babylonian art",
            "cuneiform tablets",
        ],
        "ancient_near_east": [
            "ancient Near East",
            "Sumerian artifacts",
            "Akkadian cylinder seals",
        ],
        "egyptian_art": [
            "Egyptian hieroglyphs",
            "ancient Egypt art",
            "pharaoh tomb painting",
        ],
        "geometry_diagrams": [
            "geometric diagrams mathematics",
            "historical geometry illustrations",
            "euclidean geometry diagrams",
        ],
    }

    def __init__(
        self,
        base_dir: str = "downloads/archive",
        searches: Dict[str, List[str]] = None,
    ):
        self.base_dir = Path(base_dir)
        self.session = requests.Session()
        self.session.headers.update(
            {"User-Agent": "Mozilla/5.0 ArchiveScraper/1.0"}
        )
        self.searches = searches or self.DEFAULT_SEARCHES
        self._create_directories()

    def _create_directories(self):
        for category in self.searches.keys():
            (self.base_dir / category).mkdir(parents=True, exist_ok=True)

    def search_items(self, query: str, max_results: int = 0) -> List[Dict]:
        all_items = []
        page = 1
        rows_per_page = 100

        while True:
            if max_results > 0 and len(all_items) >= max_results:
                break
            params = {
                "q": f"{query} AND mediatype:(texts OR image)",
                "fl[]": ["identifier", "title", "mediatype", "date", "publicdate"],
                "sort[]": "downloads desc",
                "rows": rows_per_page,
                "page": page,
                "output": "json",
            }
            try:
                response = self.session.get(self.SEARCH_URL, params=params, timeout=30)
                response.raise_for_status()
                data = response.json()
                docs = data.get("response", {}).get("docs", [])
                if not docs:
                    break
                for doc in docs:
                    date = doc.get("date", "")
                    try:
                        year = int(str(date)[:4]) if date else 9999
                    except (ValueError, IndexError):
                        year = 9999
                    if year < 1928:
                        all_items.append(doc)
                page += 1
                time.sleep(0.5)
            except Exception as e:
                logger.error(f"Search error for '{query}': {e}")
                break

        if max_results > 0:
            all_items = all_items[:max_results]
        logger.info(f"Found {len(all_items)} pre-1928 items for '{query}'")
        return all_items

    def get_item_files(self, identifier: str) -> List[Dict]:
        try:
            url = f"{self.METADATA_URL}/{identifier}"
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get("files", [])
        except Exception as e:
            logger.error(f"Metadata error for {identifier}: {e}")
            return []

    def download_item_images(
        self, identifier: str, category: str, max_images: int = 10
    ) -> int:
        files = self.get_item_files(identifier)
        downloaded = 0

        for file_info in files:
            if downloaded >= max_images:
                break
            name = file_info.get("name", "")
            if not name.lower().endswith((".jpg", ".jpeg", ".png", ".gif")):
                continue
            if "_thumb" in name or "_small" in name:
                continue

            url = f"{self.DOWNLOAD_URL}/{identifier}/{name}"
            safe_name = name.replace("/", "_")
            file_path = self.base_dir / category / f"{identifier}_{safe_name}"

            if file_path.exists():
                continue

            try:
                response = self.session.get(url, stream=True, timeout=60)
                response.raise_for_status()
                file_path.parent.mkdir(parents=True, exist_ok=True)
                with open(file_path, "wb") as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                downloaded += 1
                logger.info(f"Downloaded: {file_path.name}")
            except requests.exceptions.RequestException as e:
                logger.error(f"Failed to download {url}: {e}")

            time.sleep(0.5)

        return downloaded

    def save_metadata_csv(self, items: List[Dict], category: str):
        csv_path = self.base_dir / category / "metadata.csv"
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(
                ["identifier", "title", "mediatype", "date", "publicdate"]
            )
            for item in items:
                writer.writerow(
                    [
                        item.get("identifier", ""),
                        item.get("title", ""),
                        item.get("mediatype", ""),
                        item.get("date", ""),
                        item.get("publicdate", ""),
                    ]
                )
        logger.info(f"Saved metadata for {len(items)} items to {csv_path}")

    def scrape_category(self, category: str, max_items: int = 0):
        if category not in self.searches:
            logger.error(f"Unknown category: {category}")
            return
        logger.info(f"Scraping category: {category}")
        all_items: Dict[str, Dict] = {}

        for query in self.searches[category]:
            items = self.search_items(query, max_items)
            for item in items:
                ident = item.get("identifier", "")
                if ident and ident not in all_items:
                    all_items[ident] = item

        total_downloaded = 0
        for identifier, item in all_items.items():
            logger.info(f"Processing: {item.get('title', identifier)}")
            downloaded = self.download_item_images(identifier, category)
            total_downloaded += downloaded

        if all_items:
            self.save_metadata_csv(list(all_items.values()), category)

        logger.info(f"Downloaded {total_downloaded} images for {category}")

    def scrape_all(self, max_items: int = 0):
        for category in self.searches.keys():
            self.scrape_category(category, max_items)
        logger.info("All Internet Archive categories complete.")


def load_config(config_path: str = None) -> Dict:
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Internet Archive Image Scraper")
    parser.add_argument(
        "--output", default="downloads/archive", help="Output directory"
    )
    parser.add_argument("--max", type=int, default=0, help="Max items per query (0 = unlimited)")
    parser.add_argument("--config", default=None, help="Path to config.json")
    args = parser.parse_args()

    cfg = load_config(args.config)
    archive_cfg = cfg.get("archive", {})

    scraper = InternetArchiveScraper(
        base_dir=args.output,
        searches=archive_cfg.get("searches"),
    )
    scraper.scrape_all(max_items=args.max)
