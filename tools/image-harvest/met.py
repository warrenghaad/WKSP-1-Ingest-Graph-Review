#!/usr/bin/env python3
"""
Metropolitan Museum of Art Open Access Image Downloader

Downloads CC0 licensed images with full metadata preservation.
Can be run standalone or via run.py master runner.
max_items=0 means unlimited — fetch everything the API returns.
"""

import json
import time
import csv
import logging
import requests
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("met_scraper.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


@dataclass
class ArtworkMetadata:
    object_id: int
    title: str
    artist_display_name: str
    culture: str
    period: str
    date: str
    medium: str
    department: str
    classification: str
    object_url: str
    primary_image: str
    additional_images: List[str]
    tags: List[str]
    is_public_domain: bool


class MetMuseumAPI:
    BASE_URL = "https://collectionapi.metmuseum.org/public/collection/v1"
    RATE_LIMIT = 0.0125

    DEPARTMENTS = {
        "islamic_art": 14,
        "egyptian_art": 10,
        "greek_roman_art": 13,
        "asian_art": 6,
        "european_decorative": 12,
        "ancient_near_east": 3,
    }

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(
            {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        )
        self.last_request_time = 0

    def _rate_limit(self):
        elapsed = time.time() - self.last_request_time
        if elapsed < self.RATE_LIMIT:
            time.sleep(self.RATE_LIMIT - elapsed)
        self.last_request_time = time.time()

    def _make_request(self, url: str, params: Dict = None) -> Dict:
        self._rate_limit()
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed for {url}: {e}")
            return {}

    def search_objects(
        self, query: str, department_id: int = None, has_images: bool = True
    ) -> List[int]:
        url = f"{self.BASE_URL}/search"
        params = {"q": query, "hasImages": "true" if has_images else "false"}
        if department_id:
            params["departmentId"] = department_id
        logger.info(f"Searching for: {query}")
        data = self._make_request(url, params)
        if not data or "objectIDs" not in data:
            return []
        object_ids = data["objectIDs"]
        logger.info(f"Found {data.get('total', 0)} objects")
        return object_ids

    def get_object_details(self, object_id: int) -> Optional[ArtworkMetadata]:
        url = f"{self.BASE_URL}/objects/{object_id}"
        data = self._make_request(url)
        if not data or not data.get("isPublicDomain"):
            return None
        tags = [tag.get("term", "") for tag in data.get("tags", [])]
        try:
            return ArtworkMetadata(
                object_id=data.get("objectID"),
                title=data.get("title", "Unknown"),
                artist_display_name=data.get("artistDisplayName", "Unknown"),
                culture=data.get("culture", ""),
                period=data.get("period", ""),
                date=data.get("objectDate", ""),
                medium=data.get("medium", ""),
                department=data.get("department", ""),
                classification=data.get("classification", ""),
                object_url=data.get("objectURL", ""),
                primary_image=data.get("primaryImage", ""),
                additional_images=data.get("additionalImages", []),
                tags=tags,
                is_public_domain=True,
            )
        except Exception as e:
            logger.error(f"Failed to parse object {object_id}: {e}")
            return None


class ImageDownloader:
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.session = requests.Session()

    def _sanitize_filename(self, filename: str) -> str:
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            filename = filename.replace(char, "_")
        return filename[:200]

    def download_image(self, url: str, filepath: Path) -> bool:
        if not url:
            return False
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

    def download_artwork_images(
        self, metadata: ArtworkMetadata, category: str
    ) -> List[str]:
        category_path = self.base_path / category
        downloaded_files = []
        if metadata.primary_image:
            title = self._sanitize_filename(metadata.title)
            filename = f"{metadata.object_id}_{title}_primary.jpg"
            filepath = category_path / filename
            if self.download_image(metadata.primary_image, filepath):
                downloaded_files.append(str(filepath))
        for i, img_url in enumerate(metadata.additional_images):
            title = self._sanitize_filename(metadata.title)
            filename = f"{metadata.object_id}_{title}_additional_{i + 1}.jpg"
            filepath = category_path / filename
            if self.download_image(img_url, filepath):
                downloaded_files.append(str(filepath))
        return downloaded_files


class MetMuseumScraper:
    DEFAULT_SEARCH_QUERIES = {
        "mesopotamian_art": {
            "department": "ancient_near_east",
            "queries": [
                "Mesopotamia",
                "cuneiform",
                "cylinder seal",
                "Assyrian",
                "Babylonian",
                "Sumerian",
                "relief",
                "Akkadian",
            ],
        },
        "egyptian_art": {
            "department": "egyptian_art",
            "queries": [
                "hieroglyph",
                "papyrus",
                "relief",
                "sarcophagus",
                "amulet",
                "stela",
                "tomb painting",
                "pharaoh",
            ],
        },
        "greek_pottery": {
            "department": "greek_roman_art",
            "queries": [
                "vase",
                "pottery",
                "amphora",
                "krater",
                "kylix",
                "geometric pattern",
                "ceramic",
            ],
        },
    }

    def __init__(
        self,
        base_path: str = "downloads/met",
        max_items: int = 0,
        search_queries: Dict = None,
    ):
        self.api = MetMuseumAPI()
        self.downloader = ImageDownloader(base_path)
        self.base_path = Path(base_path)
        self.max_items = max_items
        self.search_queries = search_queries or self.DEFAULT_SEARCH_QUERIES
        for category in self.search_queries.keys():
            (self.base_path / category).mkdir(parents=True, exist_ok=True)

    def save_metadata(self, metadata_list: List[ArtworkMetadata], category: str):
        csv_path = self.base_path / category / "metadata.csv"
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(
                [
                    "object_id",
                    "title",
                    "artist",
                    "culture",
                    "period",
                    "date",
                    "medium",
                    "department",
                    "url",
                    "tags",
                ]
            )
            for item in metadata_list:
                writer.writerow(
                    [
                        item.object_id,
                        item.title,
                        item.artist_display_name,
                        item.culture,
                        item.period,
                        item.date,
                        item.medium,
                        item.department,
                        item.object_url,
                        "|".join(item.tags),
                    ]
                )
        logger.info(f"Saved metadata for {len(metadata_list)} items to {csv_path}")

    def scrape_category(self, category: str) -> List[ArtworkMetadata]:
        config = self.search_queries[category]
        dept_id = self.api.DEPARTMENTS.get(config["department"])
        logger.info(f"Starting scrape for category: {category}")
        all_object_ids: set = set()
        all_metadata = []
        for query in config["queries"]:
            object_ids = self.api.search_objects(
                query=query, department_id=dept_id, has_images=True
            )
            all_object_ids.update(object_ids)
            time.sleep(0.1)
        object_ids_list = list(all_object_ids)
        if self.max_items > 0:
            object_ids_list = object_ids_list[:self.max_items]
        logger.info(f"Processing {len(object_ids_list)} unique objects for {category}")
        for i, object_id in enumerate(object_ids_list, 1):
            logger.info(f"Processing {i}/{len(object_ids_list)}: ID {object_id}")
            metadata = self.api.get_object_details(object_id)
            if metadata:
                all_metadata.append(metadata)
                self.downloader.download_artwork_images(metadata, category)
        if all_metadata:
            self.save_metadata(all_metadata, category)
        return all_metadata

    def scrape_all(self):
        results = {}
        for category in self.search_queries.keys():
            results[category] = self.scrape_category(category)
        total_items = sum(len(items) for items in results.values())
        logger.info(f"Complete! Total items: {total_items}")
        return results


def load_config(config_path: str = None) -> Dict:
    if config_path and Path(config_path).exists():
        with open(config_path) as f:
            return json.load(f)
    return {}


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Met Museum Image Scraper")
    parser.add_argument("--output", default="downloads/met", help="Output directory")
    parser.add_argument("--max", type=int, default=0, help="Max items per category (0 = unlimited)")
    parser.add_argument("--config", default=None, help="Path to config.json")
    args = parser.parse_args()

    cfg = load_config(args.config)
    queries = cfg.get("met", {}).get("search_queries", None)

    scraper = MetMuseumScraper(
        base_path=args.output,
        max_items=args.max,
        search_queries=queries,
    )
    scraper.scrape_all()
