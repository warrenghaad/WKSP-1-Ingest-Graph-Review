# Express.js API Endpoints for Reconciliation Dashboard

Base URL: `http://localhost:3001/api`

## Lesson Endpoints

### GET /lessons/:lessonId/sections
Returns all sections for a lesson with their current state.

```json
{
  "lesson_id": "meso_ob_circle_grade3",
  "civilization": "Mesopotamia",
  "period": "Old Babylonian",
  "element": "GEA.circle",
  "deity": "Shamash",
  "grade": 3,
  "sections": [
    {
      "code": "A1",
      "name": "Mythological Introduction",
      "status": "approved",
      "content_levels": {
        "level_5": { "status": "present", "word_count": 342 },
        "level_4": { "status": "present", "word_count": 218 },
        "level_3": { "status": "present", "word_count": 45 },
        "level_2": { "status": "present", "word_count": 32 },
        "level_1": { "status": "present", "word_count": 28 }
      },
      "images": {
        "required": 1,
        "present": 1,
        "broken": 0
      },
      "flags": []
    }
  ]
}
```

### GET /lessons/:lessonId/sections/:code
Returns full detail for a single section including content at all levels.

### GET /lessons/:lessonId/images
Returns all images associated with a lesson.

```json
{
  "images": [
    {
      "id": "meso_ob_A_001_img_1",
      "section": "A1",
      "type": "MUS",
      "title": "Shamash Tablet",
      "museum": "British Museum",
      "accession": "BM 91000",
      "status": "sourced",
      "quality_score": 22,
      "has_overlay": false,
      "path": "/data/images/museum/bm/meso_ob_circle_tablet_bm91000.jpg",
      "path_valid": true
    }
  ]
}
```

### GET /lessons/:lessonId/gaps
Returns the most recent gap report.

### GET /lessons/:lessonId/dedup
Returns the most recent deduplication report.

### GET /lessons/:lessonId/status
Returns summary statistics.

```json
{
  "lesson_id": "meso_ob_circle_grade3",
  "sections_total": 15,
  "sections_approved": 3,
  "sections_needs_review": 5,
  "sections_in_progress": 4,
  "sections_not_started": 3,
  "levels_total": 75,
  "levels_drafted": 37,
  "images_total": 52,
  "images_ready": 18,
  "gaps_critical": 2,
  "gaps_high": 5,
  "gaps_medium": 8,
  "gaps_low": 3,
  "redundancy_instances": 1
}
```

## Approval Endpoints

### POST /lessons/:lessonId/sections/:code/approve
```json
{ "reviewer": "sami", "notes": "Looks good" }
```

### POST /lessons/:lessonId/sections/:code/reject
```json
{ "reviewer": "sami", "notes": "A2 principle not visible in artifact", "target_skill": "content-drafter" }
```

### POST /lessons/:lessonId/sections/:code/revise
```json
{ "reviewer": "sami", "notes": "Need more carrier diversity in A3", "target_skill": "research-director" }
```

### POST /lessons/:lessonId/images/:imageId/approve
```json
{ "reviewer": "sami" }
```

### POST /lessons/:lessonId/images/:imageId/reject
```json
{ "reviewer": "sami", "notes": "Too low resolution", "action": "recreate" }
```

## Pipeline Endpoints

### POST /lessons/:lessonId/reconcile
Triggers a full reconciliation run — runs gap-assessor and semantic-deduplicator, updates all status.

### POST /lessons/:lessonId/export
Exports all approved content to The Face (Engine 4) HTML template system. Only sections with status "approved" are exported.

```json
{
  "exported_sections": ["A1", "A2", "A6", "B1"],
  "skipped_sections": ["A3", "A4", "A5", "A7", "B2", "B3", "B4", "B5", "B6", "B7", "B8"],
  "export_path": "/path/to/the-face/lessons/meso_ob_circle_grade3/"
}
```
