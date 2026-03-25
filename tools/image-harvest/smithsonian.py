#!/usr/bin/env python3
"""
Smithsonian Open Access Image Scraper

Downloads from 4.4+ million CC0 collection items.
Uses direct HTTP calls to the Smithsonian Open Access API.
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
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("smithsonian_scraper.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


@dataclass
class ImageMetadata:
    id: str
    title: str
    description: str
    culture: str
    date: str
    medium: str
    credit_line: str
    data_source: str
    url: str
    thumbnail_url: str
    download_date: str = ""
    local_path: str = ""


class SmithsonianImageScraper:
    API_URL = "https://api.si.edu/openaccess/api/v1.0/search"

    def __init__(
        self,
        api_key: str = None,
        base_dir: str = "downloads/smithsonian",
        delay: float = 0.5,
    ):
        self.api_key = api_key or os.environ.get("SMITHSONIAN_API_KEY", "DEMO_KEY")
        self.base_dir = Path(base_dir)
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update(
            {"User-Agent": "Mozilla/5.0 SmithsonianScraper/1.0"}
        )
        self.stats = {
            "total_searched": 0,
            "total_downloaded": 0,
            "failed_downloads": 0,
        }

        self.search_queries: Dict[str, List[str]] = {
            "mesopotamian_ancient_near_east": [
                "Mesopotamian art",
                "Assyrian relief",
                "Babylonian artifact",
                "Sumerian cylinder seal",
                "cuneiform tablet",
            ],
            "egyptian_art": [
                "Egyptian art ancient",
                "Egyptian hieroglyph",
                "Egyptian sculpture ancient",
                "pharaoh artifact",
            ],
            "greek_roman_art": [
                "Greek pottery ancient",
                "Roman mosaic",
                "Greek sculpture ancient",
                "Hellenistic art",
            ],
        }

        self._create_directories()

    def _create_directories(self):
        for category in self.search_queries.keys():
            (self.base_dir / category).mkdir(parents=True, exist_ok=True)

    def _rate_limit(self):
        time.sleep(self.delay)

    def search_images(self, query: str, max_results: int = 0) -> List[Dict[str, Any]]:
        logger.info(f"Searching for: '{query}'")
        all_results = []
        start = 0
        rows_per_request = 100

        while True:
            if max_results > 0 and len(all_results) >= max_results:
                break
            self._rate_limit()
            params = {
                "api_key": self.api_key,
                "q": query,
                "start": start,
                "rows": rows_per_request,
                "online_media_type": "Images",
            }
            try:
                response = self.session.get(self.API_URL, params=params, timeout=30)
                response.raise_for_status()
                data = response.json()
                rows = data.get("response", {}).get("rows", [])
                if not rows:
                    break
                all_results.extend(rows)
                start += rows_per_request
                self.stats["total_searched"] += len(rows)
                logger.info(f"  ... fetched {len(all_results)} results so far for '{query}'")
            except requests.exceptions.RequestException as e:
                logger.error(f"Search request failed for '{query}': {e}")
                break

        if max_results > 0:
            all_results = all_results[:max_results]
        logger.info(f"Found {len(all_results)} results for '{query}'")
        return all_results

    def extract_metadata(self, result: Dict[str, Any]) -> Optional[ImageMetadata]:
        try:
            content = result.get("content", {})
            descriptive = content.get("descriptiveNonRepeating", {})
            freetext = content.get("freetext", {})

            title = descriptive.get("title", {}).get("content", "Unknown")
            record_id = descriptive.get("record_ID", "")
            data_source = descriptive.get("data_source", "")

            online_media = descriptive.get("online_media", {})
            media_list = online_media.get("media", [])
            url = ""
            thumbnail_url = ""
            if media_list:
                media = media_list[0]
                url = media.get("content", "")
                thumbnail_url = media.get("thumbnail", "")

            if not url:
                return None

            def _get_freetext(key: str) -> str:
                entries = freetext.get(key, [])
                if entries and isinstance(entries, list):
                    return entries[0].get("content", "")
                return ""

            return ImageMetadata(
                id=record_id,
                title=title,
                description=_get_freetext("notes"),
                culture=_get_freetext("culture"),
                date=_get_freetext("date"),
                medium=_get_freetext("physicalDescription"),
                credit_line=_get_freetext("creditLine"),
                data_source=data_source,
                url=url,
                thumbnail_url=thumbnail_url,
            )
        except Exception as e:
            logger.error(f"Failed to extract metadata: {e}")
            return None

    def _sanitize_filename(self, name: str) -> str:
        invalid = '<>:"/\\|?*'
        for ch in invalid:
            name = name.replace(ch, "_")
        return name[:180]

    def download_image(self, metadata: ImageMetadata, category: str) -> bool:
        try:
            response = self.session.get(metadata.url, timeout=60)
            response.raise_for_status()
            safe_title = self._sanitize_filename(metadata.title)
            filename = f"{metadata.id}_{safe_title}.jpg"
            filepath = self.base_dir / category / filename
            filepath.parent.mkdir(parents=True, exist_ok=True)
            with open(filepath, "wb") as f:
                f.write(response.content)
            metadata.local_path = str(filepath)
            metadata.download_date = datetime.now().isoformat()
            self.stats["total_downloaded"] += 1
            logger.debug(f"Downloaded: {filepath.name}")
            return True
        except requests.exceptions.RequestException as e:
            self.stats["failed_downloads"] += 1
            logger.error(f"Failed to download {metadata.url}: {e}")
            return False

    def save_metadata_csv(self, metadata_list: List[ImageMetadata], category: str):
        csv_path = self.base_dir / category / "metadata.csv"
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(
                [
                    "id",
                    "title",
                    "description",
                    "culture",
                    "date",
                    "medium",
                    "credit_line",
                    "data_source",
                    "url",
                    "local_path",
                    "download_date",
                ]
            )
            for item in metadata_list:
                writer.writerow(
                    [
                        item.id,
                        item.title,
                        item.description,
                        item.culture,
                        item.date,
                        item.medium,
                        item.credit_line,
                        item.data_source,
                        item.url,
                        item.local_path,
                        item.download_date,
                    ]
                )
        logger.info(f"Saved metadata for {len(metadata_list)} items to {csv_path}")

    def bulk_download_category(
        self, category_name: str, max_images_per_query: int = 0
    ):
        if category_name not in self.search_queries:
            logger.error(f"Unknown category: {category_name}")
            return
        queries = self.search_queries[category_name]
        all_metadata: List[ImageMetadata] = []
        logger.info(f"Starting bulk download for category: {category_name}")

        for query in queries:
            results = self.search_images(query, max_images_per_query)
            for result in results:
                metadata = self.extract_metadata(result)
                if metadata:
                    all_metadata.append(metadata)

        unique_metadata: Dict[str, ImageMetadata] = {}
        for m in all_metadata:
            if m.id not in unique_metadata:
                unique_metadata[m.id] = m

        logger.info(f"Found {len(unique_metadata)} unique images for {category_name}")

        downloaded = []
        for metadata in unique_metadata.values():
            if self.download_image(metadata, category_name):
                downloaded.append(metadata)

        if downloaded:
            self.save_metadata_csv(downloaded, category_name)

    def bulk_download_all(self, max_images_per_query: int = 0):
        logger.info("Starting bulk download for all categories")
        for category in self.search_queries.keys():
            self.bulk_download_category(category, max_images_per_query)
            logger.info(f"Completed category: {category}")
        print(f"\nTotal searched: {self.stats['total_searched']}")
        print(f"Successfully downloaded: {self.stats['total_downloaded']}")
        print(f"Failed downloads: {self.stats['failed_downloads']}")


def load_config(config_path: str = None) -> Dict:
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Smithsonian Image Scraper")
    parser.add_argument(
        "--output", default="downloads/smithsonian", help="Output directory"
    )
    parser.add_argument("--max", type=int, default=0, help="Max items per query (0 = unlimited)")
    parser.add_argument("--config", default=None, help="Path to config.json")
    args = parser.parse_args()

    cfg = load_config(args.config)
    si_cfg = cfg.get("smithsonian", {})

    scraper = SmithsonianImageScraper(
        base_dir=args.output,
        api_key=si_cfg.get("api_key"),
    )
    if si_cfg.get("search_queries"):
        scraper.search_queries = si_cfg["search_queries"]

    scraper.bulk_download_all(max_images_per_query=args.max)
