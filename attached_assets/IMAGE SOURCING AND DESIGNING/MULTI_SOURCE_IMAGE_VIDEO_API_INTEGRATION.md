# Multi-Source Image & Video API Integration Guide
**Created**: 2026-01-11
**Updated**: 2026-01-11 (Added CapCut, Adobe CC Suite)
**Services**: Adobe Firefly, DALL-E 3, iStock, InVideo, CapCut, Adobe Premiere Pro, Illustrator, Photoshop

---

## 1. ADOBE FIREFLY API

### Overview
- **Provider**: Adobe
- **Type**: Generative AI for images, video, and effects
- **Commercial Use**: Yes (with proper license)
- **Training Data**: Ethically sourced, commercially safe content

### Getting Started

**Authentication Requirements**:
1. Adobe Developer Console account
2. Access Token (OAuth)
3. API Key

**Official Documentation**: https://developer.adobe.com/firefly-services/docs/

### Key APIs Available

| API | Purpose | Status (2025) |
|-----|---------|---------------|
| Generate Images | Create images from text prompts | ✅ Available |
| Generate Similar Images | Variations of existing images | ✅ Available |
| Generate Video | Video generation from prompts | ✅ NEW (2025) |
| Translate | Language translation | ✅ Available |
| Lip-Sync | Audio synchronization | ✅ Available |
| Reframe | Image reframing/cropping | ✅ Available |
| Custom Models | Train custom Firefly models | ✅ Available |

### Node.js Integration

**Installation**:
```bash
npm install @adobe/firefly-services-sdk
```

**Basic Usage**:
```javascript
import { FireflyClient } from '@adobe/firefly-services-sdk';

const client = new FireflyClient({
  clientId: process.env.ADOBE_CLIENT_ID,
  clientSecret: process.env.ADOBE_CLIENT_SECRET
});

// Authenticate
await client.authenticate();

// Generate Image
const result = await client.generateImages({
  prompt: "Ancient Mesopotamian temple with circular sun disk",
  contentClass: "photo", // or "art"
  n: 1,
  size: {
    width: 2048,
    height: 2048
  },
  model: "firefly-v4" // Image Model 4 (latest as of 2025)
});

console.log(result.images[0].url); // Download URL
```

### Image Model 4 Features (2025)
- Higher quality and photorealism
- Better prompt understanding
- Improved composition
- Commercial safety guarantees

### Pricing Model
- Credit-based system
- Different credit costs per operation
- Enterprise pricing available
- Contact Adobe for educational/non-profit rates

### Best For
- ✅ Educational content (commercially safe)
- ✅ Historical reconstructions
- ✅ Culturally sensitive imagery
- ✅ Video generation (NEW)

### Integration into Your System

```javascript
// File: adobe-firefly-service.js
import { FireflyClient } from '@adobe/firefly-services-sdk';

export class AdobeFireflyService {
  constructor(clientId, clientSecret) {
    this.client = new FireflyClient({ clientId, clientSecret });
  }

  async initialize() {
    await this.client.authenticate();
  }

  async generateEducationalImage(prompt, options = {}) {
    const result = await this.client.generateImages({
      prompt: `Educational illustration: ${prompt}. High quality, suitable for textbook.`,
      contentClass: options.contentClass || 'photo',
      n: 1,
      size: options.size || { width: 2048, height: 2048 },
      model: 'firefly-v4'
    });

    return {
      url: result.images[0].url,
      prompt: prompt,
      generatedAt: new Date().toISOString(),
      source: 'adobe-firefly',
      model: 'firefly-v4'
    };
  }

  async generateVideo(prompt, durationSeconds = 5) {
    const result = await this.client.generateVideo({
      prompt: prompt,
      duration: durationSeconds,
      aspectRatio: '16:9'
    });

    return {
      url: result.video.url,
      duration: durationSeconds,
      source: 'adobe-firefly-video'
    };
  }
}
```

---

## 2. DALL-E 3 API (OpenAI)

### Overview
- **Provider**: OpenAI
- **Type**: Generative AI for images
- **Commercial Use**: Yes
- **Training Data**: Internet-sourced

### Status
✅ **ALREADY INTEGRATED** in your system (`ai-image-services.js`)

### Current Implementation
```javascript
// File: ai-image-services.js (existing)
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateImage(prompt, options = {}) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1, // DALL-E 3 only supports n=1
    size: options.size || "1024x1024", // "1024x1024", "1792x1024", "1024x1792"
    quality: options.quality || "standard", // "standard" or "hd"
    style: options.style || "vivid" // "vivid" or "natural"
  });

  return response.data[0].url;
}
```

### Key Parameters

| Parameter | Options | Notes |
|-----------|---------|-------|
| `model` | "dall-e-3" | Latest model |
| `size` | "1024x1024", "1792x1024", "1024x1792" | Different aspect ratios |
| `quality` | "standard", "hd" | HD costs more |
| `style` | "vivid", "natural" | Vivid = more creative, Natural = more realistic |
| `n` | 1 only | DALL-E 3 limitation |

### Pricing (as of 2025)
- **Standard 1024×1024**: ~$0.040 per image
- **Standard 1024×1792 or 1792×1024**: ~$0.080 per image
- **HD 1024×1024**: ~$0.080 per image
- **HD 1024×1792 or 1792×1024**: ~$0.120 per image

### Best For
- ✅ Quick image generation
- ✅ Educational illustrations
- ✅ Storyboard scenes
- ✅ Concept art

### Limitations
- URLs expire in 1 hour (must download immediately)
- Only 1 image per request (n=1)
- Rate limits apply
- Automatic prompt enhancement (can't disable)

---

## 3. iStock API (Getty Images)

### Overview
- **Provider**: Getty Images (iStock division)
- **Type**: Stock photography/illustrations
- **Commercial Use**: Yes (with license purchase)
- **Content**: Professional photography, vectors, illustrations

### Getting Started

**Requirements**:
1. Getty Images Developer account: https://developers.gettyimages.com
2. iStock Affiliates account: https://www.istockphoto.com/affiliates
3. API Key & Secret
4. Affiliate ID (for earning commission)

**Official API**: https://openapi.istock.info/

### API Capabilities

**Search Endpoints**:
- Image search
- Video search
- Creative search (illustrations, vectors)
- Editorial search

**Metadata Access**:
- Image details
- Pricing information
- Licensing details
- Similar image recommendations

### Node.js Integration

```javascript
// File: istock-service.js
import fetch from 'node-fetch';

export class IStockService {
  constructor(apiKey, apiSecret, affiliateId) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.affiliateId = affiliateId;
    this.baseUrl = 'https://api.gettyimages.com/v3';
  }

  async authenticate() {
    const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');

    const response = await fetch('https://api.gettyimages.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    this.accessToken = data.access_token;
  }

  async searchImages(query, options = {}) {
    const params = new URLSearchParams({
      phrase: query,
      fields: 'id,title,preview,comp,thumb,detail',
      page_size: options.limit || 20,
      ...(options.orientation && { orientations: options.orientation }),
      ...(options.ethnicity && { ethnicity: options.ethnicity })
    });

    const response = await fetch(`${this.baseUrl}/search/images?${params}`, {
      headers: {
        'Api-Key': this.apiKey,
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    const data = await response.json();

    return data.images.map(img => ({
      id: img.id,
      title: img.title,
      previewUrl: img.display_sizes?.[0]?.uri,
      thumbUrl: img.display_sizes?.find(d => d.name === 'thumb')?.uri,
      affiliate_link: `https://www.istockphoto.com/${img.id}?affiliate_id=${this.affiliateId}`,
      license_required: true,
      source: 'istock'
    }));
  }

  async getImageDetails(imageId) {
    const response = await fetch(`${this.baseUrl}/images/${imageId}`, {
      headers: {
        'Api-Key': this.apiKey,
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    return await response.json();
  }
}
```

### Usage Flow

1. **Search** for images using API
2. **Display** preview/comp images (watermarked)
3. **Redirect** users to iStock to purchase license
4. **Earn commission** via affiliate ID
5. **Download** purchased images directly from iStock

### Important Notes

⚠️ **Cannot download images directly via API without purchasing license**

The API is for:
- Searching catalog
- Displaying previews
- Facilitating purchases
- NOT for bulk downloading

### Pricing
- Free API access
- Pay per image license purchased
- Earn affiliate commission on referrals
- Subscription plans available for frequent use

### Best For
- ✅ Professional photography
- ✅ Mesopotamian artifacts (real photos)
- ✅ Historical imagery
- ✅ High-quality illustrations
- ❌ NOT for automated bulk downloads

---

## 4. InVideo API

### Overview
- **Provider**: InVideo
- **Type**: Video creation and editing
- **Commercial Use**: Yes (with subscription)
- **Content**: Text-to-video, templates, AI voices

### Getting Started

**Requirements**:
1. InVideo account
2. API access (contact InVideo for access)
3. Access Token

**Official API**: https://invideo.biz/api

### Authentication

```javascript
// POST to /authorize
const response = await fetch('https://invideo.biz/api/authorize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: process.env.INVIDEO_EMAIL,
    password: process.env.INVIDEO_PASSWORD
  })
});

const { access_token, account_id } = await response.json();
```

**Token Expiration**: 1 hour of inactivity

### API Capabilities

| Feature | Status | Notes |
|---------|--------|-------|
| Create Video | ✅ | From templates or text |
| Upload Media | ✅ | Custom images/videos |
| Edit Timeline | ✅ | Programmatic editing |
| Export Video | ✅ | MP4 output |
| AI Voiceover | ✅ | Text-to-speech |
| Templates | ✅ | Access template library |

### Node.js Integration

```javascript
// File: invideo-service.js
import fetch from 'node-fetch';

export class InVideoService {
  constructor() {
    this.baseUrl = 'https://invideo.biz/api';
    this.accessToken = null;
    this.accountId = null;
  }

  async authenticate(email, password) {
    const response = await fetch(`${this.baseUrl}/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    this.accountId = data.account_id;
  }

  async createVideoFromText(scriptText, options = {}) {
    const response = await fetch(`${this.baseUrl}/video/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: JSON.stringify({
        account_id: this.accountId,
        text: scriptText,
        template_id: options.templateId,
        voice: options.voice || 'en-US-Neural',
        music: options.includeMusic || false,
        aspect_ratio: options.aspectRatio || '16:9'
      })
    });

    const data = await response.json();
    return data.video_id;
  }

  async uploadMedia(fileBuffer, fileName) {
    const formData = new FormData();
    formData.append('file', fileBuffer, fileName);
    formData.append('account_id', this.accountId);

    const response = await fetch(`${this.baseUrl}/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: formData
    });

    return await response.json();
  }

  async exportVideo(videoId, format = 'mp4') {
    const response = await fetch(`${this.baseUrl}/video/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: JSON.stringify({
        account_id: this.accountId,
        video_id: videoId,
        format: format,
        quality: 'high'
      })
    });

    const data = await response.json();
    return data.download_url;
  }
}
```

### Use Cases for Your System

**Myth Videos (A1 Section)**:
```javascript
const invideoService = new InVideoService();
await invideoService.authenticate(email, password);

const mythScript = `
In the beginning, the world was dark.
Then Shamash appeared, holding the perfect circle of the sun.
Light spread across the land, bringing order and knowledge.
`;

const videoId = await invideoService.createVideoFromText(mythScript, {
  templateId: 'educational-narration',
  voice: 'en-US-Neural',
  aspectRatio: '16:9',
  includeMusic: true
});

const downloadUrl = await invideoService.exportVideo(videoId);
```

### Pricing
- Subscription-based
- Different tiers (Business, Unlimited, etc.)
- API access may require business/enterprise plan
- Export limits based on plan

### Best For
- ✅ Myth storyboard videos (A1)
- ✅ Narrated educational content
- ✅ Template-based lesson videos
- ✅ Automated video production

### Limitations
- ⚠️ API documentation limited (may need support contact)
- ⚠️ Token expires after 1 hour inactivity
- ⚠️ Subscription required
- ⚠️ Export time varies (rendering queue)

---

## COMPARISON MATRIX

| Feature | Adobe Firefly | DALL-E 3 | iStock | InVideo |
|---------|--------------|----------|--------|---------|
| **Image Generation** | ✅ Yes | ✅ Yes | ❌ Search only | ❌ No |
| **Video Generation** | ✅ Yes (NEW 2025) | ❌ No | ❌ No | ✅ Yes |
| **Commercial Use** | ✅ Yes | ✅ Yes | ✅ With license | ✅ Yes |
| **Real Photos** | ❌ No | ❌ No | ✅ Yes | ❌ No |
| **AI Art** | ✅ Yes | ✅ Yes | ⚠️ Some | ❌ No |
| **Pricing Model** | Credits | Pay per image | License purchase | Subscription |
| **API Maturity** | ✅ Excellent | ✅ Excellent | ✅ Good | ⚠️ Limited docs |
| **URL Expiration** | Unknown | 1 hour | N/A | Varies |
| **Batch Generation** | ✅ Yes | ⚠️ n=1 only | N/a | ✅ Yes |
| **Already Integrated** | ❌ No | ✅ YES | ❌ No | ❌ No |

---

## RECOMMENDED INTEGRATION STRATEGY

### For Your Mesopotamia Curriculum System

**1. Keep DALL-E 3 for:**
- Quick image generation
- Educational illustrations
- Storyboard scenes
- Existing working pipeline

**2. Add Adobe Firefly for:**
- Higher quality images (Firefly v4)
- Commercial safety guarantees
- Video generation (NEW - for myth videos!)
- When you need ethically sourced content

**3. Add iStock for:**
- Real Mesopotamian artifact photos
- Professional photography
- Museum-quality imagery
- Replace manual museum searches

**4. Add InVideo for:**
- A1 Myth videos (automated)
- Narrated lesson introductions
- Storyboard animation
- Section summary videos

### Implementation Priority

**Phase 1 (Immediate):**
1. ✅ Keep DALL-E 3 (already working)
2. ✅ Add Adobe Firefly for quality images

**Phase 2 (Short term):**
3. ✅ Add InVideo for myth videos (A1 sections)

**Phase 3 (Medium term):**
4. ✅ Add iStock for real artifact photos

---

## UNIFIED MULTI-SOURCE SERVICE

```javascript
// File: unified-media-service.js
import { AdobeFireflyService } from './adobe-firefly-service.js';
import { IStockService } from './istock-service.js';
import { InVideoService } from './invideo-service.js';
import { generateImage as dalleGenerate } from './ai-image-services.js';

export class UnifiedMediaService {
  constructor() {
    this.firefly = new AdobeFireflyService(
      process.env.ADOBE_CLIENT_ID,
      process.env.ADOBE_CLIENT_SECRET
    );
    this.istock = new IStockService(
      process.env.GETTY_API_KEY,
      process.env.GETTY_API_SECRET,
      process.env.ISTOCK_AFFILIATE_ID
    );
    this.invideo = new InVideoService();
  }

  async initialize() {
    await Promise.all([
      this.firefly.initialize(),
      this.istock.authenticate(),
      this.invideo.authenticate(
        process.env.INVIDEO_EMAIL,
        process.env.INVIDEO_PASSWORD
      )
    ]);
  }

  async generateImage(prompt, options = {}) {
    const source = options.source || 'dalle'; // 'dalle', 'firefly'

    if (source === 'firefly') {
      return await this.firefly.generateEducationalImage(prompt, options);
    } else {
      const url = await dalleGenerate(prompt, options);
      return { url, source: 'dalle', prompt };
    }
  }

  async searchStockPhotos(query, options = {}) {
    return await this.istock.searchImages(query, options);
  }

  async createMythVideo(scriptText, options = {}) {
    return await this.invideo.createVideoFromText(scriptText, options);
  }

  async generateVideo(prompt, duration = 5) {
    return await this.firefly.generateVideo(prompt, duration);
  }
}
```

---

## ENVIRONMENT VARIABLES NEEDED

Add to `.env`:

```bash
# Adobe Firefly
ADOBE_CLIENT_ID=your_client_id
ADOBE_CLIENT_SECRET=your_client_secret

# DALL-E 3 (already have)
OPENAI_API_KEY=your_existing_key

# iStock / Getty Images
GETTY_API_KEY=your_api_key
GETTY_API_SECRET=your_api_secret
ISTOCK_AFFILIATE_ID=your_affiliate_id

# InVideo
INVIDEO_EMAIL=your_email
INVIDEO_PASSWORD=your_password
```

---

## COST ESTIMATES (Monthly)

**Scenario**: Generate 2,400 images for full curriculum

| Service | Cost | Notes |
|---------|------|-------|
| DALL-E 3 | ~$96-288 | $0.04-0.12 per image |
| Adobe Firefly | ~$240-480 | Credit-based, estimate |
| iStock | Varies | Per-license, no API cost |
| InVideo | $15-60/month | Subscription tier |

**Total Estimated**: $350-800 one-time + $15-60/month

---

## NEXT STEPS

1. **Sign up for Adobe Developer Console**
   - Get Firefly API credentials
   - Test image generation

2. **Register for Getty/iStock API**
   - Get API key
   - Set up affiliate account

3. **Contact InVideo for API Access**
   - May need business/enterprise plan
   - Request API documentation

4. **Implement Unified Service**
   - Create `unified-media-service.js`
   - Add environment variables
   - Test each integration

5. **Update Image Generation Pipeline**
   - Add source selection to UI
   - Allow choosing DALL-E vs Firefly
   - Add iStock search to artifact finder

---

**Document Status**: COMPLETE
**Last Updated**: 2026-01-11
**Services Researched**: 4/4
