#!/usr/bin/env python3
"""
EUCLID Image Pipeline — Museum API Search Engine

Searches Met Museum, Wikimedia Commons, and Smithsonian Open Access APIs
for artifact images matching research queries.

Usage:
    python3 museum_search.py --query "mesopotamia circle" --limit 10
    python3 museum_search.py --accession "42.638" --museum met
    python3 museum_search.py --query "shamash tablet" --all-museums --output results.json
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.parse
import urllib.error


# ─── API Endpoints ────────────────────────────────────────────────────────────

MET_SEARCH = "https://collectionapi.metmuseum.org/public/collection/v1/search"
MET_OBJECT = "https://collectionapi.metmuseum.org/public/collection/v1/objects"

WIKI_API = "https://commons.wikimedia.org/w/api.php"

SMITHSONIAN_API = "https://api.si.edu/openaccess/api/v1.0/search"

# Department IDs for Met Museum
MET_DEPARTMENTS = {
    "mesopotamia": 3,    # Ancient Near Eastern Art
    "egypt": 10,
    "greece": 13,
    "rome": 13,
    "china": 2,
    "india": 2,
    "japan": 2,
    "islamic": 14,
    "mesoamerica": 5,
    "africa": 5,
}


def fetch_json(url, timeout=15):
    """Fetch JSON from URL with error handling."""
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'EUCLID-Research-Pipeline/0.1 (Educational; Contact: smajeed3@gmail.com)'
        })
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code} for {url[:80]}...")
        return None
    except urllib.error.URLError as e:
        print(f"  URL error for {url[:80]}...: {e.reason}")
        return None
    except Exception as e:
        print(f"  Error fetching {url[:80]}...: {e}")
        return None


# ─── Metropolitan Museum ──────────────────────────────────────────────────────

def search_met(query, limit=10, department_id=None):
    """Search Met Museum Open Access API."""
    results = []
    params = {
        'q': query,
        'hasImages': 'true',
    }
    if department_id:
        params['departmentId'] = department_id

    url = f"{MET_SEARCH}?{urllib.parse.urlencode(params)}"
    print(f"[Met Museum] Searching: {query}")
    data = fetch_json(url)

    if not data or data.get('total', 0) == 0:
        print(f"  No results found")
        return results

    object_ids = data.get('objectIDs', [])[:limit]
    print(f"  Found {data['total']} results, fetching top {len(object_ids)}")

    for oid in object_ids:
        time.sleep(0.2)  # rate limiting
        obj_url = f"{MET_OBJECT}/{oid}"
        obj = fetch_json(obj_url)

        if not obj:
            continue

        # Only include public domain images
        if not obj.get('isPublicDomain', False):
            continue

        image_url = obj.get('primaryImage', '')
        if not image_url:
            continue

        results.append({
            'source': 'Met Museum',
            'object_id': str(oid),
            'title': obj.get('title', 'Unknown'),
            'date': obj.get('objectDate', 'Unknown'),
            'culture': obj.get('culture', 'Unknown'),
            'period': obj.get('period', ''),
            'medium': obj.get('medium', ''),
            'dimensions': obj.get('dimensions', ''),
            'accession': obj.get('accessionNumber', ''),
            'department': obj.get('department', ''),
            'image_url': image_url,
            'thumbnail_url': obj.get('primaryImageSmall', ''),
            'additional_images': obj.get('additionalImages', []),
            'is_public_domain': True,
            'credit_line': obj.get('creditLine', ''),
            'gallery': obj.get('GalleryNumber', ''),
            'url': f"https://www.metmuseum.org/art/collection/search/{oid}",
        })

    print(f"  {len(results)} public domain results with images")
    return results


# ─── Wikimedia Commons ────────────────────────────────────────────────────────

def search_wikimedia(query, limit=10):
    """Search Wikimedia Commons for images."""
    results = []
    params = {
        'action': 'query',
        'list': 'search',
        'srsearch': query,
        'srnamespace': '6',  # File namespace
        'srlimit': str(limit),
        'format': 'json',
    }
    url = f"{WIKI_API}?{urllib.parse.urlencode(params)}"
    print(f"[Wikimedia] Searching: {query}")
    data = fetch_json(url)

    if not data or 'query' not in data:
        print(f"  No results found")
        return results

    search_results = data['query'].get('search', [])
    print(f"  Found {len(search_results)} results")

    for item in search_results:
        title = item.get('title', '')
        if not title.startswith('File:'):
            continue

        # Get image info
        time.sleep(0.2)
        info_params = {
            'action': 'query',
            'titles': title,
            'prop': 'imageinfo',
            'iiprop': 'url|size|mime|extmetadata',
            'format': 'json',
        }
        info_url = f"{WIKI_API}?{urllib.parse.urlencode(info_params)}"
        info_data = fetch_json(info_url)

        if not info_data or 'query' not in info_data:
            continue

        pages = info_data['query'].get('pages', {})
        for page_id, page in pages.items():
            imageinfo = page.get('imageinfo', [{}])[0]
            ext_meta = imageinfo.get('extmetadata', {})

            image_url = imageinfo.get('url', '')
            if not image_url:
                continue

            # Extract license
            license_name = ext_meta.get('LicenseShortName', {}).get('value', 'Unknown')

            results.append({
                'source': 'Wikimedia Commons',
                'object_id': title,
                'title': title.replace('File:', '').rsplit('.', 1)[0].replace('_', ' '),
                'date': ext_meta.get('DateTimeOriginal', {}).get('value', 'Unknown'),
                'culture': '',
                'period': '',
                'medium': '',
                'dimensions': f"{imageinfo.get('width', '?')}x{imageinfo.get('height', '?')}",
                'accession': '',
                'department': '',
                'image_url': image_url,
                'thumbnail_url': imageinfo.get('thumburl', ''),
                'additional_images': [],
                'is_public_domain': 'public domain' in license_name.lower(),
                'license': license_name,
                'credit_line': ext_meta.get('Credit', {}).get('value', ''),
                'url': f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(title)}",
            })

    print(f"  {len(results)} results with images")
    return results


# ─── Smithsonian ──────────────────────────────────────────────────────────────

def search_smithsonian(query, limit=10):
    """Search Smithsonian Open Access API."""
    results = []
    params = {
        'q': query,
        'online_media_type': 'Images',
        'rows': str(limit),
    }
    url = f"{SMITHSONIAN_API}?{urllib.parse.urlencode(params)}"
    print(f"[Smithsonian] Searching: {query}")
    data = fetch_json(url)

    if not data or 'response' not in data:
        print(f"  No results found")
        return results

    rows = data['response'].get('rows', [])
    print(f"  Found {len(rows)} results")

    for row in rows:
        content = row.get('content', {})
        desc = content.get('descriptiveNonRepeating', {})
        freetext = content.get('freetext', {})

        title = desc.get('title', {}).get('content', 'Unknown')

        # Get image URL from online media
        online_media = desc.get('online_media', {}).get('media', [])
        image_url = ''
        for media in online_media:
            if media.get('type') == 'Images':
                image_url = media.get('content', '')
                break

        if not image_url:
            continue

        # Extract date from freetext
        date_entries = freetext.get('date', [])
        date = date_entries[0].get('content', 'Unknown') if date_entries else 'Unknown'

        results.append({
            'source': 'Smithsonian',
            'object_id': row.get('id', ''),
            'title': title,
            'date': date,
            'culture': '',
            'period': '',
            'medium': '',
            'dimensions': '',
            'accession': '',
            'department': '',
            'image_url': image_url,
            'thumbnail_url': '',
            'additional_images': [],
            'is_public_domain': True,  # Smithsonian OA is CC0
            'credit_line': 'Smithsonian Open Access',
            'url': desc.get('record_link', ''),
        })

    print(f"  {len(results)} results with images")
    return results


# ─── Composite Search ─────────────────────────────────────────────────────────

def search_all(query, limit=10, civilization=None):
    """Search all museum APIs and combine results."""
    all_results = []

    # Met Museum
    dept_id = MET_DEPARTMENTS.get(civilization.lower()) if civilization else None
    all_results.extend(search_met(query, limit, dept_id))

    # Wikimedia
    all_results.extend(search_wikimedia(query, limit))

    # Smithsonian
    all_results.extend(search_smithsonian(query, limit))

    # Deduplicate by title similarity
    seen_titles = set()
    unique_results = []
    for r in all_results:
        title_key = r['title'].lower().strip()[:50]
        if title_key not in seen_titles:
            seen_titles.add(title_key)
            unique_results.append(r)

    return unique_results


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="EUCLID Museum API Search")
    parser.add_argument("--query", required=True, help="Search query (keep BROAD: 1-2 keywords)")
    parser.add_argument("--limit", type=int, default=10, help="Max results per source")
    parser.add_argument("--museum", choices=["met", "wiki", "smithsonian", "all"], default="all")
    parser.add_argument("--civilization", help="Civilization filter (maps to Met department)")
    parser.add_argument("--accession", help="Search by accession number")
    parser.add_argument("--output", help="Output JSON file path")

    args = parser.parse_args()

    query = args.accession if args.accession else args.query

    if args.museum == "met":
        results = search_met(query, args.limit)
    elif args.museum == "wiki":
        results = search_wikimedia(query, args.limit)
    elif args.museum == "smithsonian":
        results = search_smithsonian(query, args.limit)
    else:
        results = search_all(query, args.limit, args.civilization)

    # Summary
    print(f"\n{'='*60}")
    print(f"SEARCH SUMMARY")
    print(f"  Query: {query}")
    print(f"  Total results: {len(results)}")

    by_source = {}
    for r in results:
        by_source[r['source']] = by_source.get(r['source'], 0) + 1
    for source, count in by_source.items():
        print(f"  {source}: {count}")

    pd_count = sum(1 for r in results if r.get('is_public_domain'))
    print(f"  Public domain: {pd_count}")
    print(f"{'='*60}\n")

    # Output
    output = {
        "query": query,
        "civilization": args.civilization,
        "total_results": len(results),
        "by_source": by_source,
        "public_domain_count": pd_count,
        "results": results,
    }

    if args.output:
        os.makedirs(os.path.dirname(args.output) if os.path.dirname(args.output) else '.', exist_ok=True)
        with open(args.output, 'w') as f:
            json.dump(output, f, indent=2)
        print(f"Results saved to: {args.output}")
    else:
        # Print to stdout
        print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
