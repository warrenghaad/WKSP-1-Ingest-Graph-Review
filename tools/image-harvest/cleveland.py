#!/usr/bin/env python3
"""
Cleveland Museum of Art Image Scraper

Downloads images from CMA's open API. No authentication required.
Strong collection of ancient Near Eastern, Egyptian, and Asian art.
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
        logging.FileHandler("cleveland_scraper.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


class ClevelandMuseumScraper:
    BASE_URL = "https://openaccess-api.clevelandart.org/api/artworks"

    DEFAULT_SEARCH_QUERIES = {
        "mesopotamian_art": ["Mesopotamia", "Assyrian", "Babylonian", "Sumerian", "cuneiform"],
        "egyptian_art": ["Egyptian", "pharaoh", "hieroglyph", "sarcophagus", "ancient Egypt"],
        "greek_roman_art": ["Greek vase", "Roman", "amphora", "Hellenistic", "ancient Greece"],
        "asian_art": ["Chinese bronze", "Japanese scroll", "Buddhist", "Hindu sculpture", "mandala"],
        "african_art": ["African mask", "African textile", "Benin bronze", "Kente"],
        "medieval_art": ["medieval illumination", "Byzantine", "Romanesque", "Gothic sculpture"],
    }

    def __init__(self, base_dir="downloads/cleveland", max_items=0, search_queries=None):
        self.base_dir = Path(base_dir)
        self.max_items = max_items
        self.search_queries = search_queries or self.DEFAULT_SEARCH_QUERIES
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "Mozilla/5.0 ClevelandScraper/1.0"})
        self._create_directories()

    def _create_directories(self):
        for cat in self.search_queries:
            (self.base_dir / cat).mkdir(parents=True, exist_ok=True)

    def search_artworks(self, query: str, max_results: int = 0) -> List[Dict]:
        all_results = []
        skip = 0
        per_page = 100

        while True:
            if max_results > 0 and len(all_results) >= max_results:
                break
            params = {"q": query, "has_image": 1, "limit": per_page, "skip": skip}
            try:
                resp = self.session.get(self.BASE_URL, params=params, timeout=30)
                resp.raise_for_status()
                data = resp.json()
                items = []
                for item in data.get("data", []):
                    images = item.get("images", {})
                    web = images.get("web", {})
                    url = web.get("url", "")
                    if url:
                        item["_download_url"] = url
                        items.append(item)
                if not items:
                    break
                all_results.extend(items)
                info = data.get("info", {})
                total = info.get("total", 0)
                if skip + per_page >= total:
                    break
                skip += per_page
                time.sleep(0.25)
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
            writer.writerow(["id", "title", "creation_date", "culture", "type", "department", "technique", "url"])
            for item in items:
                writer.writerow([
                    item.get("id", ""),
                    item.get("title", ""),
                    item.get("creation_date", ""),
                    ",".join(item.get("culture", [])) if isinstance(item.get("culture"), list) else item.get("culture", ""),
                    item.get("type", ""),
                    item.get("department", ""),
                    item.get("technique", ""),
                    item.get("_download_url", ""),
                ])
        logger.info(f"Saved metadata for {len(items)} items to {csv_path}")

    def scrape_category(self, category: str):
        queries = self.search_queries.get(category, [])
        logger.info(f"Scraping category: {category}")
        seen = set()
        all_items = []
        for query in queries:
            for item in self.search_artworks(query, self.max_items):
                aid = item.get("id")
                if aid not in seen:
                    seen.add(aid)
                    all_items.append(item)
            time.sleep(0.25)

        if self.max_items > 0:
            all_items = all_items[:self.max_items]

        logger.info(f"Processing {len(all_items)} unique items for {category}")
        downloaded = []
        for i, item in enumerate(all_items, 1):
            title = self._sanitize(item.get("title", "untitled"))
            filepath = self.base_dir / category / f"{item['id']}_{title}.jpg"
            logger.info(f"[{category}] {i}/{len(all_items)}: {item.get('title', '')}")
            if self.download_image(item["_download_url"], filepath):
                downloaded.append(item)
            time.sleep(0.25)
        if downloaded:
            self.save_metadata(downloaded, category)

    def scrape_all(self):
        for category in self.search_queries:
            self.scrape_category(category)
        logger.info("Cleveland Museum scrape complete.")


def load_config(config_path=None):
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Cleveland Museum of Art Scraper")
    parser.add_argument("--output", default="downloads/cleveland")
    parser.add_argument("--max", type=int, default=0, help="Max items per category (0 = unlimited)")
    parser.add_argument("--config", default=None)
    args = parser.parse_args()
    cfg = load_config(args.config)
    src_cfg = cfg.get("cleveland", {})
    scraper = ClevelandMuseumScraper(
        base_dir=args.output,
        max_items=args.max,
        search_queries=src_cfg.get("search_queries"),
    )
    scraper.scrape_all()
