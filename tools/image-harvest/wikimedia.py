#!/usr/bin/env python3
"""
Wikimedia Commons Image Scraper

Downloads images from specified categories with metadata.
Can be run standalone or via run.py master runner.
max_items=0 means unlimited — paginate through all category members.
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
        logging.FileHandler("wikimedia_scraper.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


class WikimediaCommonsScraper:
    BASE_URL = "https://commons.wikimedia.org/w/api.php"

    DEFAULT_CATEGORIES = {
        "mesopotamian_art": "Category:Mesopotamian_art",
        "ancient_near_east": "Category:Ancient_Near_East",
        "assyrian_art": "Category:Assyrian_art",
        "sumerian_art": "Category:Sumerian_art",
        "cuneiform": "Category:Cuneiform",
        "egyptian_art": "Category:Ancient_Egyptian_art",
        "sacred_geometry": "Category:Sacred_geometry",
    }

    def __init__(
        self,
        base_dir: str = "downloads/wikimedia",
        categories: Dict[str, str] = None,
    ):
        self.base_dir = Path(base_dir)
        self.session = requests.Session()
        self.session.headers.update(
            {"User-Agent": "Mozilla/5.0 WikimediaScraper/1.0"}
        )
        self.categories = categories or self.DEFAULT_CATEGORIES
        self._create_directories()

    def _create_directories(self):
        for category_name in self.categories.keys():
            (self.base_dir / category_name).mkdir(parents=True, exist_ok=True)

    def get_category_files(self, category: str, limit: int = 0) -> List[str]:
        params = {
            "action": "query",
            "list": "categorymembers",
            "cmtitle": category,
            "cmtype": "file",
            "cmlimit": 500,
            "format": "json",
        }
        all_files = []
        try:
            while True:
                if limit > 0 and len(all_files) >= limit:
                    break
                response = self.session.get(self.BASE_URL, params=params, timeout=30)
                response.raise_for_status()
                data = response.json()
                members = data.get("query", {}).get("categorymembers", [])
                for item in members:
                    all_files.append(item["title"])
                cont = data.get("continue")
                if cont and "cmcontinue" in cont:
                    params["cmcontinue"] = cont["cmcontinue"]
                else:
                    break
                time.sleep(0.5)
            if limit > 0:
                return all_files[:limit]
            return all_files
        except Exception as e:
            logger.error(f"Error getting category files: {e}")
            return []

    def get_file_info(self, filename: str) -> Optional[Dict]:
        params = {
            "action": "query",
            "titles": filename,
            "prop": "imageinfo",
            "iiprop": "url|size|mime|extmetadata",
            "format": "json",
        }
        try:
            response = self.session.get(self.BASE_URL, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            pages = data.get("query", {}).get("pages", {})
            for page_id, page in pages.items():
                if page_id == "-1":
                    return None
                imageinfo = page.get("imageinfo", [])
                if imageinfo:
                    info = imageinfo[0]
                    extmeta = info.get("extmetadata", {})
                    return {
                        "title": page.get("title", ""),
                        "url": info.get("url", ""),
                        "size": info.get("size", 0),
                        "mime": info.get("mime", ""),
                        "description": extmeta.get("ImageDescription", {}).get(
                            "value", ""
                        ),
                        "artist": extmeta.get("Artist", {}).get("value", ""),
                        "license": extmeta.get("LicenseShortName", {}).get(
                            "value", ""
                        ),
                        "date": extmeta.get("DateTimeOriginal", {}).get("value", ""),
                    }
            return None
        except Exception as e:
            logger.error(f"Error getting file info for {filename}: {e}")
            return None

    def _sanitize_filename(self, name: str) -> str:
        invalid = '<>:"/\\|?*'
        for ch in invalid:
            name = name.replace(ch, "_")
        name = name.replace("File:", "").strip()
        return name[:200]

    def download_image(self, url: str, filepath: Path) -> bool:
        try:
            response = self.session.get(url, timeout=60)
            response.raise_for_status()
            filepath.parent.mkdir(parents=True, exist_ok=True)
            with open(filepath, "wb") as f:
                f.write(response.content)
            logger.debug(f"Downloaded: {filepath.name}")
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to download {url}: {e}")
            return False

    def save_metadata_csv(self, metadata_list: List[Dict], category: str):
        csv_path = self.base_dir / category / "metadata.csv"
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(
                ["title", "url", "size", "mime", "description", "artist", "license", "date", "local_path"]
            )
            for item in metadata_list:
                writer.writerow(
                    [
                        item.get("title", ""),
                        item.get("url", ""),
                        item.get("size", ""),
                        item.get("mime", ""),
                        item.get("description", ""),
                        item.get("artist", ""),
                        item.get("license", ""),
                        item.get("date", ""),
                        item.get("local_path", ""),
                    ]
                )
        logger.info(f"Saved metadata for {len(metadata_list)} items to {csv_path}")

    def scrape_category(self, category_name: str, limit: int = 0):
        if category_name not in self.categories:
            logger.error(f"Unknown category: {category_name}")
            return
        wiki_category = self.categories[category_name]
        logger.info(f"Scraping category: {category_name} ({wiki_category})")

        files = self.get_category_files(wiki_category, limit)
        logger.info(f"Found {len(files)} files in {wiki_category}")

        downloaded_metadata = []
        for i, filename in enumerate(files, 1):
            logger.info(f"Processing {i}/{len(files)}: {filename}")
            info = self.get_file_info(filename)
            if not info or not info.get("url"):
                continue
            safe_name = self._sanitize_filename(filename)
            ext = Path(info["url"]).suffix or ".jpg"
            filepath = self.base_dir / category_name / f"{safe_name}{ext}"
            if self.download_image(info["url"], filepath):
                info["local_path"] = str(filepath)
                downloaded_metadata.append(info)
            time.sleep(0.5)

        if downloaded_metadata:
            self.save_metadata_csv(downloaded_metadata, category_name)
        logger.info(
            f"Downloaded {len(downloaded_metadata)} images for {category_name}"
        )

    def scrape_all(self, limit_per_category: int = 0):
        for category_name in self.categories.keys():
            self.scrape_category(category_name, limit_per_category)
        logger.info("All Wikimedia categories complete.")


def load_config(config_path: str = None) -> Dict:
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Wikimedia Commons Image Scraper")
    parser.add_argument(
        "--output", default="downloads/wikimedia", help="Output directory"
    )
    parser.add_argument(
        "--max", type=int, default=0, help="Max items per category (0 = unlimited)"
    )
    parser.add_argument("--config", default=None, help="Path to config.json")
    args = parser.parse_args()

    cfg = load_config(args.config)
    wiki_cfg = cfg.get("wikimedia", {})

    scraper = WikimediaCommonsScraper(
        base_dir=args.output,
        categories=wiki_cfg.get("categories"),
    )
    scraper.scrape_all(limit_per_category=args.max)
