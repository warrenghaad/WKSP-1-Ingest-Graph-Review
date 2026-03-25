#!/usr/bin/env python3
"""
Library of Congress Image Scraper

Downloads images from the Library of Congress digital collections.
No authentication required. Massive collection of maps, prints,
photographs, manuscripts, and historical illustrations.
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
        logging.FileHandler("loc_scraper.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


class LibraryOfCongressScraper:
    BASE_URL = "https://www.loc.gov"

    DEFAULT_SEARCH_QUERIES = {
        "ancient_near_east": ["Mesopotamia", "Assyria", "Babylon", "cuneiform", "ancient Near East"],
        "ancient_egypt": ["ancient Egypt", "hieroglyph", "pyramid", "pharaoh"],
        "ancient_greece_rome": ["ancient Greece", "ancient Rome", "Greek art", "Roman art"],
        "maps_historical": ["ancient map", "historical atlas", "cartography"],
        "manuscripts": ["illuminated manuscript", "medieval manuscript", "ancient text"],
        "sacred_geometry": ["geometric pattern", "sacred geometry", "mathematical diagram"],
    }

    def __init__(self, base_dir="downloads/loc", max_items=0, search_queries=None):
        self.base_dir = Path(base_dir)
        self.max_items = max_items
        self.search_queries = search_queries or self.DEFAULT_SEARCH_QUERIES
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "Mozilla/5.0 LOCScraper/1.0"})
        self._create_directories()

    def _create_directories(self):
        for cat in self.search_queries:
            (self.base_dir / cat).mkdir(parents=True, exist_ok=True)

    def search_items(self, query: str, max_results: int = 0) -> List[Dict]:
        all_results = []
        page = 1
        per_page = 100

        while True:
            if max_results > 0 and len(all_results) >= max_results:
                break
            params = {"q": query, "fo": "json", "c": per_page, "sp": page, "fa": "online-format:image"}
            try:
                resp = self.session.get(f"{self.BASE_URL}/search/", params=params, timeout=30)
                resp.raise_for_status()
                data = resp.json()
                items = []
                for item in data.get("results", []):
                    image_url = ""
                    if item.get("image_url"):
                        urls = item["image_url"]
                        if isinstance(urls, list):
                            image_url = urls[0]
                        else:
                            image_url = urls
                    if image_url:
                        if image_url.startswith("//"):
                            image_url = "https:" + image_url
                        item["_download_url"] = image_url
                        items.append(item)
                if not items:
                    break
                all_results.extend(items)
                pagination = data.get("pagination", {})
                if page >= pagination.get("total", 1) // per_page + 1:
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
            resp = self.session.get(url, timeout=60, allow_redirects=True)
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
            writer.writerow(["id", "title", "date", "contributors", "subjects", "url", "image_url"])
            for item in items:
                contributors = item.get("contributor", [])
                if isinstance(contributors, list):
                    contributors = "; ".join(contributors)
                subjects = item.get("subject", [])
                if isinstance(subjects, list):
                    subjects = "; ".join(subjects)
                writer.writerow([
                    item.get("id", ""),
                    item.get("title", ""),
                    item.get("date", ""),
                    contributors,
                    subjects,
                    item.get("url", ""),
                    item.get("_download_url", ""),
                ])
        logger.info(f"Saved metadata for {len(items)} items to {csv_path}")

    def scrape_category(self, category: str):
        queries = self.search_queries.get(category, [])
        logger.info(f"Scraping category: {category}")
        seen = set()
        all_items = []
        for query in queries:
            for item in self.search_items(query, self.max_items):
                iid = item.get("id", "")
                if iid not in seen:
                    seen.add(iid)
                    all_items.append(item)
            time.sleep(0.5)

        if self.max_items > 0:
            all_items = all_items[:self.max_items]

        logger.info(f"Processing {len(all_items)} unique items for {category}")
        downloaded = []
        for i, item in enumerate(all_items, 1):
            title = self._sanitize(item.get("title", "untitled"))
            iid = str(item.get("id", "unknown")).replace("/", "_").replace(":", "_")
            filepath = self.base_dir / category / f"{iid}_{title}.jpg"
            logger.info(f"[{category}] {i}/{len(all_items)}: {item.get('title', '')}")
            if self.download_image(item["_download_url"], filepath):
                downloaded.append(item)
            time.sleep(0.3)
        if downloaded:
            self.save_metadata(downloaded, category)

    def scrape_all(self):
        for category in self.search_queries:
            self.scrape_category(category)
        logger.info("Library of Congress scrape complete.")


def load_config(config_path=None):
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Library of Congress Scraper")
    parser.add_argument("--output", default="downloads/loc")
    parser.add_argument("--max", type=int, default=0, help="Max items per category (0 = unlimited)")
    parser.add_argument("--config", default=None)
    args = parser.parse_args()
    cfg = load_config(args.config)
    src_cfg = cfg.get("loc", {})
    scraper = LibraryOfCongressScraper(
        base_dir=args.output,
        max_items=args.max,
        search_queries=src_cfg.get("search_queries"),
    )
    scraper.scrape_all()
