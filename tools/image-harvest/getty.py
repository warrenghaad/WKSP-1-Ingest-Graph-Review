#!/usr/bin/env python3
"""
Getty Open Content Image Scraper

Scrapes the Getty Search Gateway for Open Content images.
No API key needed — uses the public search gateway with an
"Open Content Images" filter to find CC-licensed works.
Parses HTML search results and downloads via IIIF image URLs.
max_items=0 means unlimited — paginate through all results.
"""

import json
import time
import csv
import re
import logging
import requests
from pathlib import Path
from typing import Dict, List
from urllib.parse import quote_plus

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("getty_scraper.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


class GettyScraper:
    SEARCH_URL = "https://search.getty.edu/gateway/search"

    DEFAULT_SEARCH_QUERIES = {
        "mesopotamian_art": [
            "Mesopotamia",
            "Assyrian",
            "Babylonian",
            "cylinder seal",
            "cuneiform",
        ],
        "egyptian_art": [
            "Egyptian ancient",
            "pharaoh",
            "hieroglyph",
            "sarcophagus",
        ],
        "greek_roman_art": [
            "Greek vase",
            "Roman sculpture",
            "amphora",
            "Hellenistic",
        ],
        "decorative_arts": [
            "Islamic tile",
            "mosaic",
            "textile pattern",
            "calligraphy",
        ],
    }

    def __init__(self, base_dir="downloads/getty", max_items=0, search_queries=None):
        self.base_dir = Path(base_dir)
        self.max_items = max_items
        self.search_queries = search_queries or self.DEFAULT_SEARCH_QUERIES
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        })
        self._create_directories()

    def _create_directories(self):
        for cat in self.search_queries:
            (self.base_dir / cat).mkdir(parents=True, exist_ok=True)

    def search_items(self, query: str, max_results: int = 0) -> List[Dict]:
        all_results = []
        page = 1
        rows = 20

        while True:
            if max_results > 0 and len(all_results) >= max_results:
                break

            params = {
                "q": query,
                "f": '"Open Content Images"',
                "rows": rows,
                "srt": "a",
                "dir": "s",
                "pg": page,
            }

            try:
                resp = self.session.get(self.SEARCH_URL, params=params, timeout=15)
                resp.raise_for_status()
                html = resp.text

                pattern = r'st_url="([^"]*recordIDs=[^"]+)"[^>]*st_title="([^"]+)"[^>]*st_image="([^"]+)"'
                matches = re.findall(pattern, html)

                if not matches:
                    break

                for raw_url, title, thumb in matches:
                    url = raw_url.replace("http://", "https://")
                    image_url = thumb.replace("/full/!600,600/", "/full/!2400,2400/")

                    record_match = re.search(r'recordIDs=([^&"]+)', raw_url)
                    record_id = record_match.group(1) if record_match else ""

                    all_results.append({
                        "record_id": record_id,
                        "title": title.strip(),
                        "image_url": image_url,
                        "thumbnail": thumb,
                        "page_url": url,
                    })

                if len(matches) < rows:
                    break
                page += 1
                time.sleep(1.0)
            except Exception as e:
                logger.error(f"Search failed for '{query}': {e}")
                break

        if max_results > 0:
            all_results = all_results[:max_results]
        return all_results

    def _sanitize(self, name: str) -> str:
        for ch in '<>:"/\\|?*\n\r\t':
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
            writer.writerow(["record_id", "title", "image_url", "page_url", "local_path"])
            for item in items:
                writer.writerow([
                    item.get("record_id", ""),
                    item.get("title", ""),
                    item.get("image_url", ""),
                    item.get("page_url", ""),
                    item.get("local_path", ""),
                ])
        logger.info(f"Saved metadata for {len(items)} items to {csv_path}")

    def scrape_category(self, category: str):
        queries = self.search_queries.get(category, [])
        logger.info(f"Scraping category: {category}")
        seen = set()
        all_items = []
        for query in queries:
            for item in self.search_items(query, self.max_items):
                rid = item.get("record_id", "")
                if rid and rid not in seen:
                    seen.add(rid)
                    all_items.append(item)
            time.sleep(1.0)

        if self.max_items > 0:
            all_items = all_items[:self.max_items]

        logger.info(f"Processing {len(all_items)} unique items for {category}")
        downloaded = []
        for i, item in enumerate(all_items, 1):
            title = self._sanitize(item.get("title", "untitled"))
            rid = re.sub(r'[^a-zA-Z0-9_-]', '_', item.get("record_id", "unknown"))
            filepath = self.base_dir / category / f"getty_{rid}_{title}.jpg"
            logger.info(f"[{category}] {i}/{len(all_items)}: {item.get('title', '')}")
            if self.download_image(item["image_url"], filepath):
                item["local_path"] = str(filepath)
                downloaded.append(item)
            time.sleep(0.5)
        if downloaded:
            self.save_metadata(downloaded, category)

    def scrape_all(self):
        for category in self.search_queries:
            self.scrape_category(category)
        logger.info("Getty Open Content scrape complete.")


def load_config(config_path=None):
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Getty Open Content Scraper")
    parser.add_argument("--output", default="downloads/getty")
    parser.add_argument("--max", type=int, default=0, help="Max items per category (0 = unlimited)")
    parser.add_argument("--config", default=None)
    args = parser.parse_args()
    cfg = load_config(args.config)
    src_cfg = cfg.get("getty", {})
    scraper = GettyScraper(
        base_dir=args.output,
        max_items=args.max,
        search_queries=src_cfg.get("search_queries"),
    )
    scraper.scrape_all()
