#!/usr/bin/env python3
"""
Pinterest Image Scraper

Scrapes Pinterest search results for visual research.
No official API needed — uses Pinterest's internal search endpoint.
For personal research use only.
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
from urllib.parse import urlparse, quote_plus

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("pinterest_scraper.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


class PinterestScraper:
    SEARCH_URL = "https://www.pinterest.com/resource/BaseSearchResource/get/"

    DEFAULT_SEARCH_QUERIES = {
        "mesopotamian_art": [
            "Mesopotamian art cylinder seal",
            "Assyrian relief sculpture",
            "Sumerian art",
            "cuneiform tablet",
            "ancient Babylon",
        ],
        "egyptian_art": [
            "ancient Egyptian art",
            "Egyptian tomb painting",
            "hieroglyph art",
            "pharaoh sculpture",
        ],
        "geometry_patterns": [
            "sacred geometry pattern",
            "Islamic geometric art",
            "ancient tessellation",
            "mandala art",
        ],
        "educational_diagrams": [
            "ancient civilization diagram",
            "geometry teaching visual",
            "historical map illustration",
        ],
    }

    def __init__(self, base_dir="downloads/pinterest", max_items=0, search_queries=None):
        self.base_dir = Path(base_dir)
        self.max_items = max_items
        self.search_queries = search_queries or self.DEFAULT_SEARCH_QUERIES
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.pinterest.com/",
            "X-Requested-With": "XMLHttpRequest",
        })
        self._init_session()
        self._create_directories()

    def _init_session(self):
        try:
            resp = self.session.get("https://www.pinterest.com/", timeout=15)
            for cookie in self.session.cookies:
                if cookie.name == "csrftoken":
                    self.session.headers["X-CSRFToken"] = cookie.value
                    break
        except Exception as e:
            logger.warning(f"Could not init Pinterest session: {e}")

    def _create_directories(self):
        for cat in self.search_queries:
            (self.base_dir / cat).mkdir(parents=True, exist_ok=True)

    def search_pins(self, query: str, max_results: int = 0) -> List[Dict]:
        all_results = []
        bookmark = ""

        while True:
            if max_results > 0 and len(all_results) >= max_results:
                break

            options = {
                "query": query,
                "scope": "pins",
                "auto_correction_disabled": False,
                "rs": "typed",
            }
            if bookmark:
                options["bookmarks"] = [bookmark]

            params = {
                "source_url": f"/search/pins/?q={quote_plus(query)}&rs=typed",
                "data": json.dumps({"options": options, "context": {}}),
            }

            try:
                resp = self.session.get(self.SEARCH_URL, params=params, timeout=30)
                resp.raise_for_status()
                data = resp.json()

                resource = data.get("resource_response", {})
                results = resource.get("data", {}).get("results", [])
                if not results:
                    break

                for pin in results:
                    if not isinstance(pin, dict):
                        continue
                    images = pin.get("images", {})
                    orig = images.get("orig", {})
                    img_url = orig.get("url", "")
                    if not img_url:
                        fallback = images.get("736x", {})
                        img_url = fallback.get("url", "")
                    if not img_url:
                        continue

                    all_results.append({
                        "pin_id": pin.get("id", ""),
                        "description": pin.get("description", ""),
                        "image_url": img_url,
                        "width": orig.get("width", 0),
                        "height": orig.get("height", 0),
                        "link": pin.get("link", ""),
                        "board_name": pin.get("board", {}).get("name", "") if isinstance(pin.get("board"), dict) else "",
                        "pinner": pin.get("pinner", {}).get("username", "") if isinstance(pin.get("pinner"), dict) else "",
                        "domain": pin.get("domain", ""),
                    })

                bookmark = resource.get("bookmark", "")
                if not bookmark or bookmark == "-end-":
                    break
                time.sleep(1.0)
            except Exception as e:
                logger.error(f"Search failed for '{query}': {e}")
                break

        if max_results > 0:
            all_results = all_results[:max_results]
        return all_results

    def _sanitize(self, name: str) -> str:
        name = re.sub(r'[<>:"/\\|?*\n\r\t]', "_", name)
        return name[:150]

    def _ext_from_url(self, url: str) -> str:
        ext = Path(urlparse(url).path).suffix.lower()
        if ext in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
            return ext
        return ".jpg"

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
            writer.writerow(["pin_id", "description", "image_url", "width", "height",
                             "link", "board_name", "pinner", "domain", "local_path"])
            for item in items:
                writer.writerow([
                    item.get("pin_id", ""),
                    item.get("description", ""),
                    item.get("image_url", ""),
                    item.get("width", ""),
                    item.get("height", ""),
                    item.get("link", ""),
                    item.get("board_name", ""),
                    item.get("pinner", ""),
                    item.get("domain", ""),
                    item.get("local_path", ""),
                ])
        logger.info(f"Saved metadata for {len(items)} items to {csv_path}")

    def scrape_category(self, category: str):
        queries = self.search_queries.get(category, [])
        logger.info(f"Scraping category: {category}")
        seen = set()
        all_items = []
        for query in queries:
            for item in self.search_pins(query, self.max_items):
                pid = item.get("pin_id", "")
                if pid and pid not in seen:
                    seen.add(pid)
                    all_items.append(item)
            time.sleep(1.0)

        if self.max_items > 0:
            all_items = all_items[:self.max_items]

        logger.info(f"Processing {len(all_items)} unique pins for {category}")
        downloaded = []
        for i, item in enumerate(all_items, 1):
            desc = self._sanitize(item.get("description", "pin"))
            ext = self._ext_from_url(item["image_url"])
            filepath = self.base_dir / category / f"{item['pin_id']}_{desc}{ext}"
            logger.info(f"[{category}] {i}/{len(all_items)}: {item.get('description', '')[:60]}")
            if self.download_image(item["image_url"], filepath):
                item["local_path"] = str(filepath)
                downloaded.append(item)
            time.sleep(0.5)
        if downloaded:
            self.save_metadata(downloaded, category)

    def scrape_all(self):
        for category in self.search_queries:
            self.scrape_category(category)
        logger.info("Pinterest scrape complete.")


def load_config(config_path=None):
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Pinterest Image Scraper")
    parser.add_argument("--output", default="downloads/pinterest")
    parser.add_argument("--max", type=int, default=0, help="Max items per category (0 = unlimited)")
    parser.add_argument("--config", default=None)
    args = parser.parse_args()
    cfg = load_config(args.config)
    src_cfg = cfg.get("pinterest", {})
    scraper = PinterestScraper(
        base_dir=args.output,
        max_items=args.max,
        search_queries=src_cfg.get("search_queries"),
    )
    scraper.scrape_all()
