# IMAGE SOURCING SYSTEM FOR PROJECT EUCLID
## Automated Content-to-Image Matching via Metadata Tags

---

## SYSTEM OVERVIEW

**Problem**: 48 lessons × 5 days × multiple content sections = 1,000+ images needed
**Solution**: Automated sourcing mechanism that queries museum APIs + curated databases based on lesson metadata tags

**Your Existing Tags** → **Image Sources** → **Automatic Matching** → **Delivery to Lesson**

---

## LAYER 1: TAG STRUCTURE ANALYSIS

### What You Already Have (Based on Your Curriculum)

**Content Tags** (What the lesson is about):
```
civilization: "mesopotamia" | "egypt" | "greece" | "indus"
period: "3500-3000-BCE" | "early-dynastic" | "ur-iii"
concept: "cylinder-seal" | "base-60" | "cuneiform" | "ziggurat"
geometry: "register" | "spiral" | "pyramid" | "grid"
material: "clay-tablet" | "brick" | "pottery" | "seal-stone"
```

**Pedagogical Tags** (How it's being taught):
```
grade-level: "K-2" | "3-5" | "6-8"
day-type: "myth" | "art" | "math" | "problem" | "revelation"
activity-type: "observation" | "hands-on" | "calculation" | "comparison"
learning-objective: "pattern-recognition" | "proportion" | "symmetry"
```

**Image Requirement Tags** (What kind of image needed):
```
image-type: "artifact" | "diagram" | "map" | "portrait" | "architecture"
view-type: "detail" | "full-object" | "context" | "comparison"
license-required: "cc0" | "educational-use" | "attribution"
resolution-min: "1200px" | "2400px" | "print-quality"
```

---

## LAYER 2: SOURCE PRIORITIZATION MATRIX

### Tier 1: Museum API Sources (Automated, Free, Legal)

#### **METROPOLITAN MUSEUM OPEN ACCESS API**
- **Coverage**: 500,000+ CC0 images
- **Strong for**: Egyptian, Greek, Mesopotamian, Medieval, Renaissance
- **API Endpoint**: `https://collectionapi.metmuseum.org/public/collection/v1/`
- **Query Method**: Tag-based search
- **License**: CC0 (no restrictions)
- **Your Tag Mapping**:
  - `civilization:mesopotamia` → `q=mesopotamia&departmentId=3` (Ancient Near East)
  - `concept:cylinder-seal` → `q=cylinder seal&objectName=seal`
  - `material:clay-tablet` → `q=cuneiform tablet&medium=clay`

**Example API Call**:
```javascript
// Search for Mesopotamian cylinder seals
fetch('https://collectionapi.metmuseum.org/public/collection/v1/search?q=cylinder seal mesopotamia&departmentId=3')
  .then(response => response.json())
  .then(data => {
    // Returns object IDs
    // Then fetch individual object details
    data.objectIDs.forEach(id => {
      fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
        .then(obj => {
          // Returns: title, image URL, date, culture, medium, dimensions, license
        })
    })
  })
```

#### **RIJKSMUSEUM API** (Netherlands)
- **Coverage**: 700,000+ images
- **Strong for**: Dutch art, Asian art, prints, drawings
- **API Key**: Free registration at data.rijksmuseum.nl
- **License**: Mix of Public Domain and CC licenses
- **Your Tag Mapping**:
  - `geometry:spiral` → `imgonly=True&q=spiral`
  - `art-style:islamic` → `culture=islamic&type=painting`

#### **SMITHSONIAN OPEN ACCESS**
- **Coverage**: 2.8 million images
- **Strong for**: American history, ethnography, natural history
- **API**: `api.si.edu/openaccess/api/v1.0/`
- **License**: CC0
- **Your Tag Mapping**:
  - `civilization:mesoamerica` → `q=maya&unit_code=NMAI` (National Museum American Indian)

#### **BRITISH LIBRARY / BRITISH MUSEUM COLLECTIONS**
- **Coverage**: Massive manuscript/artifact collections
- **API Access**: Limited but improving
- **Alternative**: Use Wikimedia Commons (many BM items uploaded)

---

### Tier 2: Wikimedia Commons (Semi-Automated)

#### **WIKIMEDIA COMMONS API**
- **Coverage**: 90+ million files
- **Includes**: Museum collections, archaeological photos, diagrams
- **API**: `https://commons.wikimedia.org/w/api.php`
- **License**: Varies (filter by license type)
- **Your Tag Mapping** via Categories:
  - `civilization:egypt` → `Category:Ancient_Egypt`
  - `concept:pyramid` → `Category:Pyramids_of_Egypt`
  - `geometry:spiral` → `Category:Spirals_in_art`

**Example API Call**:
```python
import requests

def search_wikimedia(search_term, license_filter='cc0|public-domain'):
    params = {
        'action': 'query',
        'format': 'json',
        'list': 'search',
        'srsearch': f'{search_term} filetype:bitmap',
        'srlimit': 20,
        'srnamespace': 6  # File namespace
    }
    response = requests.get('https://commons.wikimedia.org/w/api.php', params=params)
    return response.json()

# Your tag: civilization:mesopotamia, concept:ziggurat
results = search_wikimedia("ziggurat mesopotamia")
```

---

### Tier 3: Specialized Databases

#### **CDLI (Cuneiform Digital Library Initiative)**
- **URL**: cdli.ucla.edu
- **Coverage**: 340,000+ cuneiform tablets
- **Access**: Search interface + bulk download
- **Best for**: Your Mesopotamian mathematical tablets
- **Your Tag Mapping**:
  - `concept:base-60` → Search for "mathematical tablets"
  - `artifact:plimpton-322` → Direct object lookup

#### **EUROPEANA**
- **Coverage**: 50+ million items from European museums
- **API**: Free with registration
- **Best for**: Renaissance, Medieval, Ancient Mediterranean

#### **WORLD HISTORY ENCYCLOPEDIA**
- **Coverage**: Historical images with educational focus
- **License**: Some CC, some educational use
- **Best for**: Contextual/educational images

---

## LAYER 3: AUTOMATED MATCHING LOGIC

### The Image Sourcing Algorithm

```python
# PSEUDO-CODE FOR YOUR SYSTEM

def get_images_for_lesson_section(tags_dict):
    """
    Input: Your lesson section metadata tags
    Output: Ranked list of image URLs with metadata
    """
    
    # STEP 1: Build search query from tags
    primary_query = f"{tags_dict['civilization']} {tags_dict['concept']}"
    
    # STEP 2: Check pre-curated library first (fastest)
    cached_image = check_curated_library(tags_dict)
    if cached_image:
        return cached_image  # Already vetted, ready to use
    
    # STEP 3: Query museum APIs in priority order
    results = []
    
    # Try Met Museum first (best for ancient civilizations)
    if tags_dict['civilization'] in ['mesopotamia', 'egypt', 'greece', 'rome']:
        met_results = query_met_api(primary_query, tags_dict)
        results.extend(met_results)
    
    # Try Rijksmuseum for specific art styles
    if tags_dict.get('art-style') in ['islamic', 'dutch', 'asian']:
        rijks_results = query_rijks_api(primary_query, tags_dict)
        results.extend(rijks_results)
    
    # Fallback to Wikimedia Commons (broadest coverage)
    if len(results) < 3:
        wiki_results = query_wikimedia_commons(primary_query, tags_dict)
        results.extend(wiki_results)
    
    # STEP 4: Filter by requirements
    filtered = filter_by_license(results, tags_dict['license-required'])
    filtered = filter_by_resolution(filtered, tags_dict['resolution-min'])
    filtered = filter_by_date_range(filtered, tags_dict['period'])
    
    # STEP 5: Rank by relevance score
    ranked = rank_by_relevance(filtered, tags_dict)
    
    # STEP 6: Return top 5 candidates for human review
    return ranked[:5]


def rank_by_relevance(images, tags):
    """Score each image based on metadata match"""
    for img in images:
        score = 0
        
        # Exact concept match = +10 points
        if tags['concept'].lower() in img['title'].lower():
            score += 10
        
        # Correct civilization/culture = +8 points
        if tags['civilization'].lower() in img['culture'].lower():
            score += 8
        
        # Date range match = +5 points
        if date_in_range(img['date'], tags['period']):
            score += 5
        
        # Material match = +3 points
        if tags.get('material') and tags['material'] in img['medium']:
            score += 3
        
        # High resolution bonus = +2 points
        if img['resolution'] >= 2400:
            score += 2
        
        # Museum tier bonus (Met, BM, Louvre) = +2 points
        if img['source'] in ['Metropolitan Museum', 'British Museum', 'Louvre']:
            score += 2
        
        img['relevance_score'] = score
    
    return sorted(images, key=lambda x: x['relevance_score'], reverse=True)
```

---

## LAYER 4: CURATED LIBRARY SYSTEM

### Pre-Vetted Image Database (Your Safety Net)

**Why You Need This**:
- Not all concepts have good API results
- Some lessons need SPECIFIC images (e.g., Ishtar Gate)
- Quality control before deployment
- Faster than API calls for repeated use

**Database Structure**:

```json
{
  "image_id": "EUCLID_MESOP_001",
  "filename": "cylinder_seal_akkadian_met329090.jpg",
  "source_url": "https://www.metmuseum.org/art/collection/search/329090",
  "local_path": "/images/mesopotamia/seals/akkadian_hunting.jpg",
  
  "metadata": {
    "title": "Cylinder seal: hunting scene",
    "civilization": "mesopotamia",
    "period": "akkadian",
    "date_range": ["2350-BCE", "2150-BCE"],
    "concept": ["cylinder-seal", "register", "hunting", "cuneiform"],
    "geometry": ["horizontal-register", "bilateral-symmetry"],
    "material": ["stone", "hematite"],
    "object_type": "artifact",
    "museum": "Metropolitan Museum",
    "accession": "329090",
    "license": "CC0",
    "resolution": "4200x3800"
  },
  
  "pedagogical_tags": {
    "grade_appropriate": ["K-2", "3-5", "6-8"],
    "teaching_focus": ["identity", "bureaucracy", "register-system", "symmetry"],
    "activity_type": ["observation", "comparison", "measurement"],
    "complexity_level": "medium"
  },
  
  "curriculum_usage": {
    "lesson_ids": ["MESOP_W1_D2", "MESOP_W2_D4"],
    "slide_numbers": [12, 18, 34],
    "worksheet_refs": ["WS_MESOP_Seals_K2", "WS_MESOP_Registers_35"]
  },
  
  "alt_text": "Ancient Mesopotamian cylinder seal showing hunter between trees with ibex, carved in stone with cuneiform inscription",
  
  "caption_templates": {
    "K-2": "This tiny cylinder was rolled on wet clay to make pictures and tell stories!",
    "3-5": "Akkadian cylinder seal (2350-2150 BCE) showing hunting scene with cuneiform name inscription",
    "6-8": "Professional seal of Balu-ili (cupbearer) demonstrating register system and Akkadian artistic style"
  },
  
  "discussion_questions": {
    "K-2": ["What shapes do you see?", "How many animals are there?"],
    "3-5": ["Why would someone need a 'signature' in ancient times?", "How does the register organize the story?"],
    "6-8": ["What does this seal tell us about Akkadian bureaucracy?", "How does size indicate importance?"]
  }
}
```

**Building Your Curated Library**:

1. **Manual Curation Phase** (First 100 "Core Images"):
   - One person spends ~2 weeks sourcing best images for most common tags
   - Create JSON records like above
   - Download and store locally
   - These become your "go-to" images

2. **API Augmentation Phase**:
   - For less common tag combinations, API searches
   - Human reviews API results
   - Best results added to curated library

3. **Continuous Growth**:
   - As you create lessons, save good finds
   - Tag them comprehensively
   - Library grows organically

---

## LAYER 5: TECHNICAL IMPLEMENTATION OPTIONS

### Option A: Simple Spreadsheet System (LOW-TECH)

**Tool**: Google Sheets
**Time to Setup**: 1 day
**Maintenance**: Low
**Best For**: Small team, getting started quickly

**Structure**:

| image_id | filename | civilization | period | concept | geometry | grade_level | source_url | license | local_path | notes |
|----------|----------|--------------|--------|---------|----------|-------------|------------|---------|------------|-------|
| MESOP_001 | akkad_seal.jpg | mesopotamia | akkadian | cylinder-seal | register | K-8 | met.org/329090 | CC0 | /images/mesop/seals/ | Perfect for Day 2 |

**Search Method**:
- Filter columns by tags: `civilization=mesopotamia AND concept=cylinder-seal`
- Manually browse results
- Copy filename to lesson

**Pros**: 
- No coding required
- Visual/easy to understand
- Shareable with team

**Cons**:
- Manual searching
- Doesn't scale beyond ~500 images
- No automation

---

### Option B: Airtable Database (MEDIUM-TECH)

**Tool**: Airtable (free up to 1,200 records)
**Time to Setup**: 2-3 days
**Maintenance**: Medium
**Best For**: Growing library, collaborative team

**Features**:
- Image thumbnails visible in database
- Multi-select tag fields (click to filter)
- Linked records (image → lessons that use it)
- Gallery view for visual browsing
- API access for automation

**Setup**:

**Base Structure**:
- **Images Table**: One record per image with all metadata
- **Lessons Table**: One record per lesson section
- **Tags Table**: Master list of all tags

**Linking**:
- Images → Lessons (many-to-many)
- Images → Tags (many-to-many)
- Auto-populate lesson sections with tagged images

**Search/Filter**:
- Click tag filters: "Show me all mesopotamia + cylinder-seal + K-2 appropriate"
- Results display with thumbnails
- Drag image into lesson planning view

**Pros**:
- Visual interface
- No coding for basic use
- API available for advanced automation
- Collaborative

**Cons**:
- 1,200 image limit on free plan
- Monthly cost for unlimited ($20/user)

---

### Option C: Custom Database + Python Scripts (HIGH-TECH)

**Tool**: PostgreSQL database + Python automation
**Time to Setup**: 1-2 weeks
**Maintenance**: Medium-High
**Best For**: Large-scale, fully automated system

**Architecture**:

```
┌─────────────────┐
│  Lesson Planner │ (Input: lesson tags)
└────────┬────────┘
         │
         ↓
┌─────────────────────┐
│  Image Matcher      │ (Algorithm: tag matching)
│  - Check cache      │
│  - Query APIs       │
│  - Rank results     │
└────────┬────────────┘
         │
         ↓
┌─────────────────────┐
│  Image Database     │
│  - Curated library  │
│  - API results      │
│  - Usage tracking   │
└────────┬────────────┘
         │
         ↓
┌─────────────────────┐
│  Lesson Output      │ (Images inserted automatically)
└─────────────────────┘
```

**Key Scripts**:

**1. API Harvester** (`harvest_images.py`):
```python
# Runs nightly, queries APIs for common tag combinations
# Downloads images, stores metadata, adds to database
# Flags for human review
```

**2. Tag Matcher** (`match_images.py`):
```python
# Takes lesson section tags as input
# Returns ranked image suggestions
# Can auto-insert top match or present options
```

**3. Usage Tracker** (`track_usage.py`):
```python
# Records which images used in which lessons
# Identifies gaps (tags with no good images)
# Suggests similar images when exact match unavailable
```

**Database Schema**:

```sql
CREATE TABLE images (
    image_id SERIAL PRIMARY KEY,
    filename VARCHAR(255),
    source_url TEXT,
    local_path TEXT,
    museum VARCHAR(100),
    license VARCHAR(50),
    resolution_width INT,
    resolution_height INT,
    date_added TIMESTAMP,
    reviewed BOOLEAN,
    quality_score INT
);

CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    tag_type VARCHAR(50),  -- 'civilization', 'concept', 'geometry', etc.
    tag_value VARCHAR(100)  -- 'mesopotamia', 'cylinder-seal', etc.
);

CREATE TABLE image_tags (
    image_id INT REFERENCES images(image_id),
    tag_id INT REFERENCES tags(tag_id),
    PRIMARY KEY (image_id, tag_id)
);

CREATE TABLE lessons (
    lesson_id VARCHAR(50) PRIMARY KEY,
    lesson_name VARCHAR(255),
    grade_level VARCHAR(10)
);

CREATE TABLE lesson_images (
    lesson_id VARCHAR(50) REFERENCES lessons(lesson_id),
    image_id INT REFERENCES images(image_id),
    usage_context TEXT,  -- "Day 2, Slide 5" or "Worksheet header"
    PRIMARY KEY (lesson_id, image_id)
);
```

**Search Query Example**:
```sql
-- Find images matching: mesopotamia + cylinder-seal + CC0 license + min 1200px
SELECT i.* 
FROM images i
JOIN image_tags it1 ON i.image_id = it1.image_id
JOIN tags t1 ON it1.tag_id = t1.tag_id
JOIN image_tags it2 ON i.image_id = it2.image_id
JOIN tags t2 ON it2.tag_id = t2.tag_id
WHERE t1.tag_value = 'mesopotamia'
  AND t2.tag_value = 'cylinder-seal'
  AND i.license = 'CC0'
  AND i.resolution_width >= 1200
ORDER BY i.quality_score DESC
LIMIT 10;
```

**Pros**:
- Fully automated
- Scales infinitely
- Advanced querying
- Integration with lesson builder

**Cons**:
- Requires programming knowledge
- Setup time intensive
- Hosting/maintenance costs

---

## LAYER 6: HYBRID WORKFLOW (RECOMMENDED)

**Phase 1: Manual Foundation (Weeks 1-2)**
- Google Sheets with 100 core images
- Hand-curated for quality
- Covers most common tag combinations

**Phase 2: Airtable Expansion (Weeks 3-4)**
- Migrate to Airtable
- Add 200 more images from API searches
- Team can browse/add images visually

**Phase 3: API Integration (Weeks 5-8)**
- Connect Airtable to Met Museum API via Zapier or custom script
- When lesson planner searches for tags not in database:
  - Trigger API search
  - Return results for human review
  - One-click add to database
  
**Phase 4: Automation (Month 3+)**
- Python script reads lesson files
- Extracts tags automatically
- Suggests images from database
- Auto-inserts with option to override
- Flags gaps for manual sourcing

---

## LAYER 7: SPECIFIC TOOLS & SERVICES

### Image Management Tools

**1. Resourcespace** (Open-Source Digital Asset Management)
- **URL**: resourcespace.com
- **Free**: Yes (self-hosted)
- **Features**: Tagging, metadata, collections, API
- **Best For**: Large libraries (1000+ images)

**2. Tropy** (Research Photo Management)
- **URL**: tropy.org
- **Free**: Yes
- **Features**: Metadata, tagging, notes, export
- **Best For**: Academic/archival organization

**3. Adobe Bridge** (Comes with Creative Cloud)
- **Features**: Batch tagging, metadata templates, visual browsing
- **Best For**: If you already have Adobe subscription

### API Integration Tools

**1. Postman** (API Testing)
- Test museum APIs before coding
- Save queries as templates
- Export to code

**2. Zapier** (No-Code Automation)
- **Trigger**: New row in Google Sheets (lesson created)
- **Action**: Search Met Museum API for tags
- **Result**: Email image URLs or add to Airtable

**3. IFTTT** (Simple Automation)
- Connect APIs to spreadsheets
- RSS feeds from museum collections

---

## LAYER 8: IMPLEMENTATION ROADMAP

### Week 1: Setup & Core Images
**Tasks**:
- [ ] Create Google Sheet with fields: image_id, civilization, period, concept, geometry, source_url, license, filename
- [ ] Manually source 25 "hero images" (most iconic for each civilization)
- [ ] Download and organize in folder structure: `/images/[civilization]/[concept]/[filename].jpg`
- [ ] Test: Can you find image for "mesopotamia + cylinder-seal" in <30 seconds?

### Week 2: API Exploration
**Tasks**:
- [ ] Register for Met Museum API (instant, free)
- [ ] Test 10 different search queries matching your tag combinations
- [ ] Document which tags work well, which need refinement
- [ ] Add 50 images from API results to spreadsheet

### Week 3: Airtable Migration
**Tasks**:
- [ ] Create Airtable base
- [ ] Import Google Sheet data
- [ ] Set up image thumbnail column
- [ ] Create filtered views for each civilization
- [ ] Test: Team members can browse and select images

### Week 4: Workflow Integration
**Tasks**:
- [ ] Create lesson template with [TAG] placeholders
- [ ] Manual process: Copy tags → Search Airtable → Insert image
- [ ] Track time: How long to image one lesson section?
- [ ] Identify bottlenecks

### Week 5-8: Automation (Optional)
**Tasks**:
- [ ] Connect Airtable API to lesson builder
- [ ] Script to auto-suggest images based on tags
- [ ] One-click image insertion
- [ ] Measure time saved

---

## LAYER 9: TAG STANDARDIZATION (CRITICAL!)

### Your Tag Dictionary (Master List)

**Civilization Tags** (Exact strings only):
```
mesopotamia
egypt
indus-valley
greece-classical
rome
china-ancient
mesoamerica
islamic-golden-age
medieval-europe
renaissance
```

**Concept Tags** (Specific artifacts/ideas):
```
cylinder-seal
cuneiform
base-60
ziggurat
pyramid-egypt
pyramid-mesoamerica
hieroglyphics
oracle-bones
parthenon
colosseum
```

**Geometry Tags** (Mathematical concepts):
```
spiral
circle
triangle
square
rectangle
pentagon
hexagon
octagon
register-horizontal
register-vertical
symmetry-bilateral
symmetry-radial
golden-ratio
fibonacci
tessellation
```

**Material Tags** (Physical medium):
```
clay-tablet
stone-carved
brick-fired
pottery-painted
metal-bronze
metal-gold
papyrus
parchment
mosaic
```

**WHY STANDARDIZATION MATTERS**:
- "mesopotamia" works, "Mesopotamia" breaks the system
- "cylinder-seal" works, "cylinder seal" (space) returns no results
- Use hyphens, not spaces or underscores
- All lowercase
- Create master list document
- Use data validation in spreadsheet (dropdown menus only)

---

## LAYER 10: QUALITY CONTROL CHECKLIST

**Before Adding Image to Library**:

☐ **License Verified**: CC0, Public Domain, or Educational Use clearly stated
☐ **Resolution Adequate**: Minimum 1200px on longest side
☐ **Culturally Appropriate**: No sacred/sensitive imagery without context
☐ **Historically Accurate**: Matches period/civilization tags
☐ **Age-Appropriate**: Suitable for youngest grade level tagged
☐ **Clear Subject**: Main concept visible, not cluttered
☐ **Metadata Complete**: All required fields filled
☐ **Attribution Recorded**: Museum, accession number, photographer (if required)
☐ **Alt Text Written**: Descriptive for accessibility
☐ **Download Link Works**: Source URL active (not broken link)

**Quality Scoring** (0-10 scale):
- 10: Perfect match, exceptional quality, multiple uses
- 7-9: Good match, clear image, useful
- 4-6: Acceptable, usable but not ideal
- 1-3: Poor match, low quality, use only if no alternatives
- 0: Reject, don't add to library

---

## LAYER 11: SAMPLE IMPLEMENTATION

### Scenario: You're building Mesopotamia Week 1, Day 2 (Art Day)

**Your Lesson Tags**:
```yaml
lesson_id: MESOP_W1_D2
civilization: mesopotamia
period: early-dynastic, akkadian, ur-iii
day_type: art
concepts: [cylinder-seal, register-system, symmetry]
geometry: [horizontal-register, bilateral-symmetry]
activities: [observation, seal-rolling, pattern-recognition]
grade_level: 3-5
images_needed: 8
```

**Step 1: Query Your System**

**Google Sheets Method**:
- Filter: `civilization=mesopotamia AND concept CONTAINS cylinder-seal`
- Results: 12 images
- Manually review, select 8 best

**Airtable Method**:
- Click filters: `mesopotamia` + `cylinder-seal` + `3-5`
- Gallery view shows thumbnails
- Drag 8 images into "MESOP_W1_D2" linked field

**Automated Method**:
```python
# Run matching algorithm
images = get_images_for_lesson_section({
    'civilization': 'mesopotamia',
    'concept': 'cylinder-seal',
    'geometry': 'horizontal-register',
    'grade_level': '3-5'
})

# Returns ranked list:
# 1. Met Museum #329090 (Score: 28/30) - Akkadian hunting scene
# 2. Met Museum #324572 (Score: 26/30) - Sumerian banquet
# 3. Met Museum #329060 (Score: 24/30) - Neo-Sumerian presentation
# ... (8 total)
```

**Step 2: Review & Insert**
- Top match auto-inserted
- Review other 7 for variety (different periods, styles)
- Override if needed (e.g., want female figures for diversity)

**Step 3: Document Usage**
- System records: MESOP_W1_D2 uses images #329090, #324572, etc.
- Future searches can say "Show me similar to what worked in W1_D2"

**Result**: 
- **Manual**: 20-30 minutes to find 8 images
- **Airtable**: 5-10 minutes
- **Automated**: 30 seconds + 2 minutes review = 2.5 minutes total

**Time Saved Across 48 Lessons**:
- Manual: 48 × 25 min = 20 hours
- Airtable: 48 × 7 min = 5.6 hours (14.4 hours saved)
- Automated: 48 × 2.5 min = 2 hours (18 hours saved)

---

## LAYER 12: ADVANCED FEATURES (FUTURE)

### AI-Powered Enhancements

**1. Computer Vision Auto-Tagging**
- Upload image
- AI identifies: "Contains: cylinder shape, carved stone, ancient text, horizontal bands"
- Suggests tags: `cylinder-seal`, `register-system`, `stone-carved`

**2. Similarity Search**
- "Find images visually similar to this Akkadian seal"
- AI matches style, composition, color palette
- Good for "show me 3 more like this" requests

**3. Caption Generation**
- AI reads image metadata
- Generates grade-appropriate captions
- "This 4,000-year-old cylinder seal shows..." (K-2)
- "Akkadian period cylinder seal (2350-2150 BCE) depicting..." (6-8)

**Tools**:
- Google Cloud Vision API (auto-tagging)
- OpenAI CLIP (similarity search)
- GPT-4 Vision (caption generation)

---

## YOUR NEXT STEPS (Actionable Plan)

### This Week:
1. **Create master tag dictionary** (2 hours)
   - List all civilizations, concepts, geometry terms you'll use
   - Standardize format (lowercase, hyphens)
   - Share with team

2. **Setup Google Sheet** (1 hour)
   - Create columns: image_id, tags, source_url, license, filename
   - Add data validation (dropdown menus from tag dictionary)

3. **Source 25 core images** (4 hours)
   - 5 images each: Mesopotamia, Egypt, Greece, Indus Valley, China
   - Download high-res from Met Museum
   - Fill out metadata sheet

### Next Week:
4. **Test workflow** (3 hours)
   - Take existing lesson outline
   - Use sheet to find images
   - Time how long it takes
   - Note pain points

5. **API exploration** (2 hours)
   - Sign up for Met Museum API
   - Test 10 searches matching your tags
   - Document what works

### Week 3:
6. **Decide on tool** (1 hour meeting)
   - Stick with Google Sheets (simple, fast)?
   - Upgrade to Airtable (scalable, visual)?
   - Build custom system (long-term, automated)?

7. **Expand library to 100 images** (8 hours)
   - 20 images × 5 civilizations
   - Mix of artifacts, architecture, art, diagrams

---

## APPENDIX: API Quick Reference

### Met Museum API

**Search**:
```
GET https://collectionapi.metmuseum.org/public/collection/v1/search?q=YOUR_QUERY
Returns: { "total": 1234, "objectIDs": [329090, 324572, ...] }
```

**Get Object**:
```
GET https://collectionapi.metmuseum.org/public/collection/v1/objects/329090
Returns: {
  "objectID": 329090,
  "title": "Cylinder seal: hunting scene",
  "culture": "Akkadian",
  "period": "Akkadian",
  "objectDate": "ca. 2350–2150 B.C.",
  "medium": "Hematite",
  "primaryImage": "https://images.metmuseum.org/...",
  "primaryImageSmall": "https://images.metmuseum.org/.../web-large.jpg",
  "isPublicDomain": true,
  ...
}
```

**No API Key Required!**

---

## QUESTIONS TO ANSWER

To refine this system for YOUR specific needs:

1. **How many images per lesson?** (This determines library size needs)

2. **How much time can you invest upfront?** (Determines manual vs. automated approach)

3. **Technical skill level?** (Can you/your team code, or need no-code solution?)

4. **Team size?** (Collaborative tools if multiple people building curriculum)

5. **Budget?** (Free tools only, or can you pay for Airtable/hosting?)

6. **Most common tag combinations?** (Helps prioritize which images to source first)

Let me know these answers and I can give you a SPECIFIC implementation plan tailored to your exact situation!

---

*This system is designed to scale from simple spreadsheet to full automation, starting wherever you are and growing as your curriculum grows.*
