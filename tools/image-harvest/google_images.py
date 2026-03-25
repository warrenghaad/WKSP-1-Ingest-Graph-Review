#!/usr/bin/env python3
"""
Google Images Scraper (via Custom Search JSON API)

Uses the official Google Custom Search JSON API to find images.
Requires GOOGLE_API_KEY and GOOGLE_CSE_ID (free tier: 100 queries/day).
Get keys at: https://developers.google.com/custom-search/v1/overview
max_items=0 means unlimited — paginate through all available results.
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
        logging.FileHandler("google_images_scraper.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


class GoogleImagesScraper:
    BASE_URL = "https://www.googleapis.com/customsearch/v1"

    DEFAULT_SEARCH_QUERIES = {
        "mesopotamian_art": [
            "Mesopotamian cylinder seal",
            "Assyrian palace relief",
            "Sumerian ziggurat",
            "cuneiform tablet close up",
            "Babylonian boundary stone kudurru",
        ],
        "egyptian_art": [
            "Egyptian tomb painting",
            "hieroglyph inscription",
            "pharaoh sculpture",
            "Book of the Dead papyrus",
        ],
        "greek_roman_art": [
            "Greek black figure vase",
            "Roman floor mosaic geometric",
            "Parthenon frieze detail",
        ],
        "geometry_in_art": [
            "sacred geometry ancient",
            "Islamic geometric tile pattern",
            "mandala symmetry",
            "tessellation historical",
        ],
        "architecture": [
            "ziggurat reconstruction",
            "pyramid cross section diagram",
            "ancient temple floor plan",
        ],
    }

    def __init__(self, base_dir="downloads/google_images", max_items=0,
                 api_key=None, cse_id=None, search_queries=None):
        self.base_dir = Path(base_dir)
        self.max_items = max_items
        self.api_key = api_key or os.environ.get("GOOGLE_API_KEY", "")
        self.cse_id = cse_id or os.environ.get("GOOGLE_CSE_ID", "")
        self.search_queries = search_queries or self.DEFAULT_SEARCH_QUERIES
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "Mozilla/5.0 GoogleImagesScraper/1.0"})
        if not self.api_key or not self.cse_id:
            logger.warning("GOOGLE_API_KEY or GOOGLE_CSE_ID not set. "
                           "Get them at https://developers.google.com/custom-search/v1/overview")
        self._create_directories()

    def _create_directories(self):
        for cat in self.search_queries:
            (self.base_dir / cat).mkdir(parents=True, exist_ok=True)

    def search_images(self, query: str, max_results: int = 0) -> List[Dict]:
        if not self.api_key or not self.cse_id:
            return []
        all_results = []
        start = 1

        while True:
            if max_results > 0 and len(all_results) >= max_results:
                break
            if start > 91:
                break
            params = {
                "key": self.api_key,
                "cx": self.cse_id,
                "q": query,
                "searchType": "image",
                "num": 10,
                "start": start,
                "imgSize": "large",
                "safe": "active",
            }
            try:
                resp = self.session.get(self.BASE_URL, params=params, timeout=30)
                resp.raise_for_status()
                data = resp.json()
                items = data.get("items", [])
                if not items:
                    break
                for item in items:
                    all_results.append({
                        "title": item.get("title", ""),
                        "image_url": item.get("link", ""),
                        "thumbnail": item.get("image", {}).get("thumbnailLink", ""),
                        "context_url": item.get("image", {}).get("contextLink", ""),
                        "width": item.get("image", {}).get("width", 0),
                        "height": item.get("image", {}).get("height", 0),
                        "mime": item.get("mime", ""),
                        "snippet": item.get("snippet", ""),
                    })
                start += 10
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

    def _ext_from_url(self, url: str) -> str:
        parsed = urlparse(url)
        ext = Path(parsed.path).suffix.lower()
        if ext in (".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"):
            return ext
        return ".jpg"

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
            writer.writerow(["title", "image_url", "context_url", "width", "height", "mime", "snippet", "local_path"])
            for item in items:
                writer.writerow([
                    item.get("title", ""),
                    item.get("image_url", ""),
                    item.get("context_url", ""),
                    item.get("width", ""),
                    item.get("height", ""),
                    item.get("mime", ""),
                    item.get("snippet", ""),
                    item.get("local_path", ""),
                ])
        logger.info(f"Saved metadata for {len(items)} items to {csv_path}")

    def scrape_category(self, category: str):
        queries = self.search_queries.get(category, [])
        logger.info(f"Scraping category: {category}")
        seen_urls = set()
        all_items = []
        for query in queries:
            for item in self.search_images(query, self.max_items):
                url = item.get("image_url", "")
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    all_items.append(item)
            time.sleep(0.5)

        if self.max_items > 0:
            all_items = all_items[:self.max_items]

        logger.info(f"Processing {len(all_items)} unique images for {category}")
        downloaded = []
        for i, item in enumerate(all_items, 1):
            title = self._sanitize(item.get("title", "untitled"))
            ext = self._ext_from_url(item["image_url"])
            filepath = self.base_dir / category / f"google_{i:04d}_{title}{ext}"
            logger.info(f"[{category}] {i}/{len(all_items)}: {item.get('title', '')}")
            if self.download_image(item["image_url"], filepath):
                item["local_path"] = str(filepath)
                downloaded.append(item)
            time.sleep(0.3)
        if downloaded:
            self.save_metadata(downloaded, category)

    def scrape_all(self):
        for category in self.search_queries:
            self.scrape_category(category)
        logger.info("Google Images scrape complete.")


def load_config(config_path=None):
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Google Images Scraper (Custom Search API)")
    parser.add_argument("--output", default="downloads/google_images")
    parser.add_argument("--max", type=int, default=0, help="Max items per category (0 = unlimited)")
    parser.add_argument("--config", default=None)
    args = parser.parse_args()
    cfg = load_config(args.config)
    src_cfg = cfg.get("google_images", {})
    scraper = GoogleImagesScraper(
        base_dir=args.output,
        max_items=args.max,
        api_key=src_cfg.get("api_key"),
        cse_id=src_cfg.get("cse_id"),
        search_queries=src_cfg.get("search_queries"),
    )
    scraper.scrape_all()
