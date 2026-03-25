#!/usr/bin/env python3
"""
Victoria & Albert Museum Image Scraper

Downloads images from the V&A's open API. No authentication required.
World's largest museum of decorative arts and design — textiles, ceramics,
metalwork, glass, furniture, fashion, photography, sculpture, and more.
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
        logging.FileHandler("vanda_scraper.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


class VandAScraper:
    BASE_URL = "https://api.vam.ac.uk/v2/objects/search"

    DEFAULT_SEARCH_QUERIES = {
        "islamic_art": ["Islamic tile", "Islamic geometric", "arabesque", "mosque lamp", "Iznik"],
        "asian_art": ["Chinese porcelain", "Japanese lacquer", "Indian textile", "Buddhist sculpture"],
        "medieval_art": ["medieval textile", "Gothic sculpture", "Romanesque", "reliquary"],
        "ancient_art": ["Egyptian", "Greek pottery", "Roman glass", "ancient sculpture"],
        "textiles_patterns": ["textile pattern", "embroidery", "woven silk", "tapestry", "carpet design"],
    }

    def __init__(self, base_dir="downloads/vanda", max_items=0, search_queries=None):
        self.base_dir = Path(base_dir)
        self.max_items = max_items
        self.search_queries = search_queries or self.DEFAULT_SEARCH_QUERIES
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "Mozilla/5.0 VandAScraper/1.0"})
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
            params = {
                "q": query,
                "page_size": per_page,
                "page": page,
                "images_exist": 1,
                "order_by": "relevance",
            }
            try:
                resp = self.session.get(self.BASE_URL, params=params, timeout=30)
                resp.raise_for_status()
                data = resp.json()
                items = []
                for record in data.get("records", []):
                    images = record.get("_images", {})
                    iiif = images.get("_iiif_image_base_url", "")
                    primary = images.get("_primary_thumbnail", "")
                    if iiif:
                        record["_download_url"] = f"{iiif}full/full/0/default.jpg"
                        items.append(record)
                    elif primary:
                        record["_download_url"] = primary
                        items.append(record)
                if not items:
                    break
                all_results.extend(items)
                info = data.get("info", {})
                record_count = info.get("record_count", 0)
                if page * per_page >= record_count:
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
            writer.writerow(["system_number", "title", "date", "place", "artist", "object_type", "materials", "image_url"])
            for item in items:
                writer.writerow([
                    item.get("systemNumber", ""),
                    item.get("_primaryTitle", ""),
                    item.get("_primaryDate", ""),
                    item.get("_primaryPlace", ""),
                    item.get("_primaryMaker", {}).get("name", "") if isinstance(item.get("_primaryMaker"), dict) else "",
                    item.get("objectType", ""),
                    item.get("_primaryMaterial", ""),
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
                sn = item.get("systemNumber", "")
                if sn not in seen:
                    seen.add(sn)
                    all_items.append(item)
            time.sleep(0.5)

        if self.max_items > 0:
            all_items = all_items[:self.max_items]

        logger.info(f"Processing {len(all_items)} unique items for {category}")
        downloaded = []
        for i, item in enumerate(all_items, 1):
            title = self._sanitize(item.get("_primaryTitle", "untitled"))
            sn = item.get("systemNumber", "unknown")
            filepath = self.base_dir / category / f"{sn}_{title}.jpg"
            logger.info(f"[{category}] {i}/{len(all_items)}: {item.get('_primaryTitle', '')}")
            if self.download_image(item["_download_url"], filepath):
                downloaded.append(item)
            time.sleep(0.25)
        if downloaded:
            self.save_metadata(downloaded, category)

    def scrape_all(self):
        for category in self.search_queries:
            self.scrape_category(category)
        logger.info("V&A Museum scrape complete.")


def load_config(config_path=None):
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Victoria & Albert Museum Scraper")
    parser.add_argument("--output", default="downloads/vanda")
    parser.add_argument("--max", type=int, default=0, help="Max items per category (0 = unlimited)")
    parser.add_argument("--config", default=None)
    args = parser.parse_args()
    cfg = load_config(args.config)
    src_cfg = cfg.get("vanda", {})
    scraper = VandAScraper(
        base_dir=args.output,
        max_items=args.max,
        search_queries=src_cfg.get("search_queries"),
    )
    scraper.scrape_all()
