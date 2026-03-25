#!/usr/bin/env python3
"""
Digital Public Library of America (DPLA) Image Scraper

Downloads images aggregated from thousands of US libraries, archives,
and museums. Requires a free API key from https://pro.dp.la/developers/api
Falls back to env var DPLA_API_KEY.
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
        logging.FileHandler("dpla_scraper.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


class DPLAScraper:
    BASE_URL = "https://api.dp.la/v2/items"

    DEFAULT_SEARCH_QUERIES = {
        "mesopotamian_art": ["Mesopotamia", "Assyria", "Babylon", "cuneiform", "Sumerian"],
        "egyptian_art": ["ancient Egypt", "pharaoh", "hieroglyph", "Egyptian art"],
        "greek_roman_art": ["ancient Greece", "ancient Rome", "Greek pottery", "Roman sculpture"],
        "native_american": ["Native American art", "pre-Columbian", "indigenous art"],
        "medieval_manuscripts": ["illuminated manuscript", "medieval art", "Book of Hours"],
        "maps_cartography": ["historical map", "ancient cartography", "atlas historical"],
    }

    def __init__(self, base_dir="downloads/dpla", max_items=0, api_key=None, search_queries=None):
        self.base_dir = Path(base_dir)
        self.max_items = max_items
        self.api_key = api_key or os.environ.get("DPLA_API_KEY", "")
        self.search_queries = search_queries or self.DEFAULT_SEARCH_QUERIES
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "Mozilla/5.0 DPLAScraper/1.0"})
        if not self.api_key:
            logger.warning("No DPLA API key. Get one at https://pro.dp.la/developers/api")
        self._create_directories()

    def _create_directories(self):
        for cat in self.search_queries:
            (self.base_dir / cat).mkdir(parents=True, exist_ok=True)

    def search_items(self, query: str, max_results: int = 0) -> List[Dict]:
        if not self.api_key:
            return []
        all_results = []
        page = 1
        per_page = 100

        while True:
            if max_results > 0 and len(all_results) >= max_results:
                break
            params = {
                "api_key": self.api_key,
                "q": query,
                "page_size": per_page,
                "page": page,
                "sourceResource.type": "image",
            }
            try:
                resp = self.session.get(self.BASE_URL, params=params, timeout=30)
                resp.raise_for_status()
                data = resp.json()
                docs = data.get("docs", [])
                if not docs:
                    break
                for doc in docs:
                    obj = doc.get("object", "")
                    if obj:
                        if isinstance(obj, list):
                            obj = obj[0]
                        doc["_download_url"] = obj
                        all_results.append(doc)
                count = data.get("count", 0)
                if page * per_page >= count:
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
            writer.writerow(["id", "title", "date", "creator", "description", "provider", "image_url"])
            for doc in items:
                sr = doc.get("sourceResource", {})
                title = sr.get("title", "")
                if isinstance(title, list):
                    title = title[0]
                creator = sr.get("creator", "")
                if isinstance(creator, list):
                    creator = "; ".join(creator)
                desc = sr.get("description", "")
                if isinstance(desc, list):
                    desc = desc[0]
                date = sr.get("date", {})
                if isinstance(date, list):
                    date = date[0]
                if isinstance(date, dict):
                    date = date.get("displayDate", "")
                provider = doc.get("provider", {})
                if isinstance(provider, dict):
                    provider = provider.get("name", "")
                writer.writerow([
                    doc.get("id", ""),
                    title,
                    date,
                    creator,
                    desc,
                    provider,
                    doc.get("_download_url", ""),
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
            sr = item.get("sourceResource", {})
            title = sr.get("title", "untitled")
            if isinstance(title, list):
                title = title[0]
            safe_title = self._sanitize(title)
            iid = str(item.get("id", "unknown")).replace("/", "_")
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
        logger.info("DPLA scrape complete.")


def load_config(config_path=None):
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="DPLA Scraper")
    parser.add_argument("--output", default="downloads/dpla")
    parser.add_argument("--max", type=int, default=0, help="Max items per category (0 = unlimited)")
    parser.add_argument("--config", default=None)
    args = parser.parse_args()
    cfg = load_config(args.config)
    src_cfg = cfg.get("dpla", {})
    scraper = DPLAScraper(
        base_dir=args.output,
        max_items=args.max,
        api_key=src_cfg.get("api_key"),
        search_queries=src_cfg.get("search_queries"),
    )
    scraper.scrape_all()
