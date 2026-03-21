# IMAGE SOURCES - Expanded Database System

**Created:** January 8, 2026
**Status:** ✅ Live at http://localhost:3001/image-manager.html
**Total Sources:** 6 Major Museum APIs + 3 AI Generation Providers

---

## 🎯 OVERVIEW

The Image Manager provides a unified interface for browsing, searching, and acquiring images from multiple museum databases and generating custom images via AI.

**Total Estimated Images Available:** 245-330 from museum APIs
**AI Generation Capacity:** 160 custom images/month (with subscriptions)
**Target Coverage:** All 9 deities + 21 geometric elements

---

## 🏛️ MUSEUM & ACADEMIC SOURCES

### 1. **Metropolitan Museum of Art (Open Access)**
- **Collection Size:** 406,000+ public domain images
- **API:** https://collectionapi.metmuseum.org/public/collection/v1/
- **License:** CC0 (Public Domain)
- **Rate Limit:** 80 requests/second
- **Mesopotamian Artifacts:** ~80-100 images
- **Best For:** Cylinder seals, sculptures, reliefs, artifacts
- **Status:** ✅ No API key required

**Example Searches:**
- "Shamash sun disk mesopotamia"
- "Akkadian cylinder seal"
- "Ishtar gate babylon"

---

### 2. **Yale Babylonian Collection**
- **Collection Focus:** Mathematical tablets, cuneiform
- **Access:** Direct web access
- **License:** Educational Use
- **Estimated Images:** 15-20 mathematical tablets
- **Best For:** Mathematical content, cuneiform numerals, clay tablets
- **Status:** ✅ Public access

**Example Searches:**
- "YBC 7289" (square root approximation)
- "Plimpton 322" (Pythagorean triples)
- Mathematical cuneiform tablets

---

### 3. **British Museum**
- **Collection Focus:** Mesopotamian artifacts, cylinder seals
- **API:** Web scraping + collection API
- **License:** Check per-image (many research-friendly)
- **Estimated Images:** 60-80 artifacts
- **Best For:** Cylinder seals, deity depictions, sacred artifacts
- **Status:** ✅ Research use available

**Key Artifacts:**
- Adda Seal (Shamash, Ishtar, Enki)
- Tablet of Shamash
- Burney Relief (Ishtar)
- Ninurta cylinder seals

**Search URL:** https://www.britishmuseum.org/collection

---

### 4. **Wikimedia Commons**
- **Collection Size:** Massive open image repository
- **API:** MediaWiki REST API
- **License:** CC0, CC-BY-SA, CC-BY
- **Estimated Images:** 40-60 mixed quality
- **Best For:** Historical photos, archaeological site images
- **Status:** ✅ No API key required

**Categories:**
- Category:Shamash (41 files)
- Category:Enlil (21 files)
- Category:Enki (35 files)
- Category:Mesopotamian mythology

**API Endpoint:** https://commons.wikimedia.org/w/api.php

---

### 5. **Smithsonian Open Access**
- **Collection Size:** 3 million+ images
- **API:** Smithsonian Open Access API
- **License:** CC0 (Public Domain)
- **Estimated Images:** 30-40 tools and artifacts
- **Best For:** Ancient tools, construction implements, daily life artifacts
- **Status:** ✅ No API key required

**API Endpoint:** https://api.si.edu/openaccess/api/v1.0

**Example Searches:**
- "Mesopotamian pottery"
- "Ancient measuring tools"
- "Clay tablets"

---

### 6. **CDLI (Cuneiform Digital Library Initiative)**
- **Collection Focus:** Cuneiform tablets, primary sources
- **Access:** Direct web + API
- **License:** Educational use
- **Estimated Images:** 20-30 tablets
- **Best For:** Writing systems, Nisaba content, mathematical notation
- **Status:** ✅ Academic database

**Website:** https://cdli.ucla.edu/
**Best For:** Authentic cuneiform examples, primary sources

---

## 🤖 AI IMAGE GENERATION

### 1. **DALL-E Nano**
- **Provider:** OpenAI
- **Best For:** Geometric constructions, diagrams, simple scenes
- **Resolution:** Up to 1792x1024
- **Monthly Quota:** 100 images (with subscription)
- **Cost:** ~$0.08/image (standard)
- **Status:** ⚠️ Requires API key

**Recommended Uses:**
- Geometric pattern generation
- Tessellation designs
- Architectural diagrams
- Abstract deity symbols

---

### 2. **Adobe Firefly**
- **Provider:** Adobe
- **Best For:** High-quality artifact imagery, scene generation
- **Resolution:** Up to 1280x720
- **Monthly Quota:** 50 images (with subscription)
- **Cost:** Subscription-based
- **Status:** ⚠️ Requires API key

**Recommended Uses:**
- Realistic artifact recreations
- Mythological scenes
- Deity depictions in historical style
- Environmental backgrounds

---

### 3. **InVideo AI**
- **Provider:** InVideo
- **Best For:** Video generation for narrative scenes
- **Resolution:** 1280x720 (16:9)
- **Monthly Quota:** 10 videos (with subscription)
- **Status:** ⚠️ Requires API key

**Recommended Uses:**
- Animated myth retellings
- Narrative sequences
- Time-lapse constructions
- Story-based content

---

## 🔧 IMAGE MANAGER FEATURES

### Search & Acquire
- **Query Builder:** Filter by deity, object type, source
- **Custom Queries:** Free-text search across all sources
- **Batch Selection:** Select multiple results at once
- **Bulk Download:** Download all selected images
- **Auto-naming:** Systematic file naming on acquisition

### Gallery Management
- **Visual Browser:** Grid view of acquired images
- **Filtering:** By deity, type, source, date
- **Sorting:** Multiple sort criteria
- **Metadata Display:** Full attribution and licensing info

### AI Generation
- **Template Selection:** Geometric, scene, artifact, pattern, architectural
- **Deity Association:** Tag generated images with deities
- **Provider Selection:** Choose DALL-E, Firefly, or InVideo
- **Queue Management:** Track generation jobs

### Batch Processing
- **Batch Download:** Acquire multiple images simultaneously
- **Batch Metadata:** Add/update metadata for multiple images
- **Batch Resize:** Optimize images for web delivery
- **Batch Export:** Export library to CSV
- **File Organization:** Organize by deity, grade, lesson code
- **Library Validation:** Check for missing images and incomplete metadata

---

## 🔗 INTEGRATION WITH AUTO-TAGGING

**Workflow:**
1. **Search & Acquire** images via Image Manager
2. **Auto-tag** via Content Ingestion system
3. **Validate** tags and metadata
4. **Export** to curriculum database

**Connected Systems:**
- `/image-manager.html` - Browse and acquire images
- `/content-ingest.html` - Auto-tag acquired images
- `/deity-element-database.js` - Reference database for tagging

---

## 📊 STATISTICS & CAPACITY

### Current Sources:
- **Museum APIs:** 6 sources
- **Total Museum Images:** 245-330 estimated
- **AI Providers:** 3 services
- **AI Generation Capacity:** 160/month

### Coverage Goals:
- **9 Deities:** 25-30 images each = 225-270 total
- **21 Geometric Elements:** 2-5 examples each = 42-105 total
- **Composite Images:** Combining deity + element = 50-80 total

**Total Target:** 317-455 images
**Current Capacity:** 245-330 (museum) + 160 (AI) = **405-490 images**

✅ **Sufficient capacity to meet all curriculum needs**

---

## 🚀 RECOMMENDED WORKFLOW

### Phase 1: Museum Collection (Week 1)
1. Start with **Met Museum API** (largest collection)
2. Search all 9 deities individually
3. Acquire 10-15 images per deity
4. **Expected Output:** 90-135 images

### Phase 2: Academic Sources (Week 1)
5. **Yale Babylonian** - Focus on mathematical tablets
6. **CDLI** - Cuneiform and writing content
7. **British Museum** - Fill gaps in deity coverage
8. **Expected Output:** 40-60 additional images

### Phase 3: Supplemental (Week 2)
9. **Wikimedia Commons** - Archaeological sites, reconstructions
10. **Smithsonian** - Tools and daily life artifacts
11. **Expected Output:** 30-50 images

### Phase 4: AI Generation (Week 2-3)
12. Identify gaps in coverage
13. Generate custom images for missing content
14. Focus on geometric constructions and patterns
15. **Expected Output:** 60-100 custom images

### Phase 5: Processing (Week 3-4)
16. Auto-tag all images via Content Ingestion
17. Validate metadata completeness
18. Organize by deity and grade level
19. Export to curriculum database
20. Final validation and quality checks

---

## 💡 OPTIMIZATION TIPS

### Search Strategy:
- Use specific deity names in searches
- Include "mesopotamia" or "babylon" to narrow results
- Search by artifact type (cylinder seal, relief, tablet)
- Filter by license (CC0 preferred for unrestricted use)

### Batch Processing:
- Download in batches of 20-30 images
- Auto-tag immediately after download
- Organize files before starting next batch
- Validate regularly to catch errors early

### AI Generation:
- Generate in batches to maximize quota efficiency
- Use detailed prompts with historical context
- Specify "mesopotamian style" or "akkadian period" for authenticity
- Request geometric accuracy for mathematical content

---

## 🔐 API KEYS & CONFIGURATION

**Required for Full Functionality:**
- OpenAI API Key (DALL-E generation)
- Adobe Firefly API Key (high-quality generation)
- InVideo API Key (video generation)

**Optional:**
- Wikimedia User Agent (for identification)
- Rate limiting preferences (for Met Museum)

**Configuration Location:**
- Settings → API Config
- Settings → AI Subscriptions

---

## 📈 TRACKING & VALIDATION

**Image Manager Tracks:**
- Images acquired per source
- Images generated per provider
- Deity coverage completeness (0/9 → 9/9)
- License compliance
- Metadata completeness

**Validation Checks:**
- Missing deity coverage
- Incomplete metadata
- License verification
- Image quality assessment
- File organization consistency

---

## 🎯 SUCCESS METRICS

**For Thursday Presentation:**
- ✅ All 9 deities have representative images (10+ each)
- ✅ All 21 geometric elements have examples (2+ each)
- ✅ All images properly tagged and attributed
- ✅ Gallery view functional and impressive
- ✅ Metadata complete and exportable

**Total Images Needed for Presentation:** ~100-150 well-curated images
**Time to Acquire:** 2-3 days with focused effort
**Status:** Achievable before Thursday deadline

---

**Created for:** Project Euclid - Mesopotamian Curriculum System
**Integration Status:** ✅ Live at http://localhost:3001/image-manager.html
**Last Updated:** January 8, 2026
