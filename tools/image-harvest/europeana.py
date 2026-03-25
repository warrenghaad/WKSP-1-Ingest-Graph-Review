#!/usr/bin/env python3
"""
Europeana Image Scraper

Downloads images from Europeana — an aggregator of 50M+ items from
European cultural institutions (museums, libraries, archives).
Requires a free API key from https://pro.europeana.eu/page/get-api
Falls back to env var EUROPEANA_API_KEY.
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
from urllib.parse import urlparse

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("europeana_scraper.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


class EuropeanaScraper:
    BASE_URL = "https://api.europeana.eu/record/v2/search.json"

    DEFAULT_SEARCH_QUERIES = {
        "mesopotamian_art": ["Mesopotamia", "Assyrian relief", "Babylonian", "cuneiform", "Sumerian"],
        "egyptian_art": ["ancient Egypt art", "pharaoh", "hieroglyph", "Egyptian sculpture"],
        "greek_roman_art": ["ancient Greek pottery", "Roman mosaic", "amphora", "Hellenistic sculpture"],
        "medieval_manuscripts": ["illuminated manuscript", "medieval illustration", "Book of Hours"],
        "islamic_art": ["Islamic geometric", "arabesque", "mosque decoration", "Islamic tile"],
        "celtic_art": ["Celtic knot", "Celtic illumination", "Book of Kells"],
    }

    def __init__(self, base_dir="downloads/europeana", max_items=0, api_key=None, search_queries=None):
        self.base_dir = Path(base_dir)
        self.max_items = max_items
        self.api_key = api_key or os.environ.get("EUROPEANA_API_KEY", "")
        self.search_queries = search_queries or self.DEFAULT_SEARCH_QUERIES
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "Mozilla/5.0 EuropeanaScraper/1.0"})
        if not self.api_key:
            logger.warning("No Europeana API key set. Get one free at https://pro.europeana.eu/page/get-api")
        self._create_directories()

    def _create_directories(self):
        for cat in self.search_queries:
            (self.base_dir / cat).mkdir(parents=True, exist_ok=True)

    def search_items(self, query: str, max_results: int = 0) -> List[Dict]:
        if not self.api_key:
            return []
        all_results = []
        cursor = "*"
        per_page = 100

        while True:
            if max_results > 0 and len(all_results) >= max_results:
                break
            params = {
                "wskey": self.api_key,
                "query": query,
                "rows": per_page,
                "cursor": cursor,
                "media": "true",
                "thumbnail": "true",
                "qf": "TYPE:IMAGE",
            }
            try:
                resp = self.session.get(self.BASE_URL, params=params, timeout=30)
                resp.raise_for_status()
                data = resp.json()
                items = data.get("items", [])
                if not items:
                    break
                for item in items:
                    img_url = ""
                    if item.get("edmIsShownBy"):
                        img_url = item["edmIsShownBy"][0] if isinstance(item["edmIsShownBy"], list) else item["edmIsShownBy"]
                    elif item.get("edmPreview"):
                        img_url = item["edmPreview"][0] if isinstance(item["edmPreview"], list) else item["edmPreview"]
                    if img_url:
                        item["_download_url"] = img_url
                        all_results.append(item)
                next_cursor = data.get("nextCursor")
                if not next_cursor:
                    break
                cursor = next_cursor
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
            content_type = resp.headers.get("content-type", "")
            if "image" not in content_type and len(resp.content) < 1000:
                return False
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
            writer.writerow(["id", "title", "creator", "date", "provider", "country", "rights", "image_url"])
            for item in items:
                title = item.get("title", [""])[0] if isinstance(item.get("title"), list) else item.get("title", "")
                creator = item.get("dcCreator", [""])[0] if isinstance(item.get("dcCreator"), list) else item.get("dcCreator", "")
                writer.writerow([
                    item.get("id", ""),
                    title,
                    creator,
                    item.get("year", [""])[0] if isinstance(item.get("year"), list) else item.get("year", ""),
                    item.get("dataProvider", [""])[0] if isinstance(item.get("dataProvider"), list) else item.get("dataProvider", ""),
                    item.get("country", [""])[0] if isinstance(item.get("country"), list) else item.get("country", ""),
                    item.get("rights", [""])[0] if isinstance(item.get("rights"), list) else item.get("rights", ""),
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
            title = item.get("title", ["untitled"])
            if isinstance(title, list):
                title = title[0]
            safe_title = self._sanitize(title)
            iid = item.get("id", "unknown").replace("/", "_")
            filepath = self.base_dir / category / f"{iid}_{safe_title}.jpg"
            logger.info(f"[{category}] {i}/{len(all_items)}: {title}")
            if self.download_image(item["_download_url"], filepath):
                downloaded.append(item)
            time.sleep(0.3)
        if downloaded:
            self.save_metadata(downloaded, category)

    def scrape_all(self):
        for category in self.search_queries:
            self.scrape_category(category)
        logger.info("Europeana scrape complete.")


def load_config(config_path=None):
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Europeana Scraper")
    parser.add_argument("--output", default="downloads/europeana")
    parser.add_argument("--max", type=int, default=0, help="Max items per category (0 = unlimited)")
    parser.add_argument("--config", default=None)
    args = parser.parse_args()
    cfg = load_config(args.config)
    src_cfg = cfg.get("europeana", {})
    scraper = EuropeanaScraper(
        base_dir=args.output,
        max_items=args.max,
        api_key=src_cfg.get("api_key"),
        search_queries=src_cfg.get("search_queries"),
    )
    scraper.scrape_all()
