/**
 * MULTI-SOURCE IMAGE API
 * 
 * Unified API for searching images across multiple databases and sources
 * Integrates with existing mesopotamia-backend infrastructure
 * 
 * Sources:
 * - Museum APIs (Met, AIC, Cleveland, British Museum, Yale, Penn, Louvre)
 * - Open Archives (Wikimedia, Internet Archive, Europeana)
 * - Academic (CDLI, Oriental Institute)
 * - Stock Photos (Unsplash, Pexels)
 * - AI Generation (DALL-E 3, Stable Diffusion)
 * - Local PPT extracts
 */

import express from 'express';
import axios from 'axios';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Initialize services
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    const err = new Error(`${name} not configured`);
    err.statusCode = 503;
    throw err;
  }
  return value;
}

async function geminiGenerateContent({ model, parts }) {
  const apiKey = requireEnv('GEMINI_API_KEY');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.4,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 2048
      }
    })
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Gemini API error (${resp.status}): ${text.slice(0, 240)}`);
  }

  return await resp.json();
}

// Cache configuration
const CACHE_DIR = path.join(__dirname, 'image-cache');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Source configurations
 */
const SOURCES = {
  // Museum APIs
  met: {
    name: 'Metropolitan Museum',
    search: async (query) => {
      const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(query)}&hasImages=true`;
      const response = await axios.get(searchUrl);
      
      if (!response.data.objectIDs || response.data.objectIDs.length === 0) {
        return [];
      }
      
      // Get first 20 results
      const results = [];
      const ids = response.data.objectIDs.slice(0, 20);
      
      for (const id of ids) {
        try {
          const objResponse = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
          const obj = objResponse.data;
          
          if (obj.primaryImage) {
            results.push({
              id: `met-${id}`,
              title: obj.title,
              imageUrl: obj.primaryImage,
              thumbnail: obj.primaryImageSmall,
              source: 'Metropolitan Museum',
              url: obj.objectURL,
              metadata: {
                period: obj.period,
                culture: obj.culture,
                medium: obj.medium,
                department: obj.department,
                artistDisplayName: obj.artistDisplayName
              }
            });
          }
        } catch (error) {
          console.error(`Met object ${id} fetch error:`, error.message);
        }
      }
      
      return results;
    }
  },

  getty: {
    name: 'Getty (Open Content via search.getty.edu)',
    search: async (query) => {
      try {
        const searchUrl =
          `https://search.getty.edu/gateway/search?q=${encodeURIComponent(query)}` +
          `&f=${encodeURIComponent('"Open Content Images"')}` +
          `&rows=20&srt=a&dir=s&pg=1`;

        const response = await axios.get(searchUrl, {
          timeout: 12000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Educational Research) mesopotamia-backend',
            Accept: 'text/html,application/xhtml+xml'
          }
        });

        const html = String(response.data || '');
        const results = [];

        // Example span:
        // <span class="st_sharethis_custom" st_url="http://search.getty.edu/gateway/landing?sr=2&recordIDs=info:getty/object/11268"
        //   st_title="Cylinder Seal ..." st_image="https://media.getty.edu/iiif/image/<uuid>/full/!600,600/0/default.jpg">
        const re = /st_url="([^"]*recordIDs=[^"]+)"[^>]*st_title="([^"]+)"[^>]*st_image="([^"]+)"/g;
        let match;
        while ((match = re.exec(html)) !== null) {
          const rawUrl = match[1] || '';
          const title = (match[2] || '').trim();
          const thumb = (match[3] || '').trim();
          if (!thumb || !rawUrl) continue;

          const url = rawUrl.replace(/^http:\/\//i, 'https://');
          const recordIdMatch = rawUrl.match(/recordIDs=([^&"]+)/);
          const recordId = recordIdMatch ? decodeURIComponent(recordIdMatch[1]) : null;

          // Promote to a larger IIIF size when possible.
          const imageUrl = thumb.replace(/\/full\/!600,600\//, '/full/!2400,2400/');

          results.push({
            id: recordId ? `getty-${recordId.replace(/[^a-z0-9]+/gi, '-')}` : `getty-${results.length + 1}`,
            title: title || 'Untitled',
            imageUrl,
            thumbnail: thumb,
            source: 'Getty',
            url,
            metadata: {
              recordId: recordId || null,
              note: 'Scraped from Getty Search Gateway (Open Content Images).'
            }
          });
        }

        // De-dupe by imageUrl
        const seen = new Set();
        return results.filter((r) => {
          if (!r?.imageUrl) return false;
          if (seen.has(r.imageUrl)) return false;
          seen.add(r.imageUrl);
          return true;
        });
      } catch (error) {
        console.error('Getty search error:', error.message);
        // Fallback to a clickable search URL if scraping fails.
        return [{
          id: 'getty-search',
          title: `Getty search for: ${query}`,
          imageUrl: 'https://www.getty.edu/favicon.ico',
          source: 'Getty',
          url: `https://search.getty.edu/gateway/search?q=${encodeURIComponent(query)}&f=${encodeURIComponent('"Open Content Images"')}`,
          metadata: { note: 'Click to search on Getty. Scrape/API may have changed.' }
        }];
      }
    }
  },

  aic: {
    name: 'Art Institute of Chicago',
    search: async (query) => {
      try {
        const response = await axios.get('https://api.artic.edu/api/v1/artworks/search', {
          timeout: 10000,
          params: {
            q: query,
            limit: 20,
            fields: [
              'id',
              'title',
              'image_id',
              'is_public_domain',
              'artist_title',
              'date_display',
              'place_of_origin',
              'medium_display',
              'department_title'
            ].join(',')
          }
        });

        const iiif = response?.data?.config?.iiif_url || 'https://www.artic.edu/iiif/2';
        const items = Array.isArray(response?.data?.data) ? response.data.data : [];

        return items
          .filter((item) => item?.image_id)
          .filter((item) => item?.is_public_domain !== false)
          .map((item) => {
            const imageId = item.image_id;
            const imageUrl = `${iiif}/${imageId}/full/843,/0/default.jpg`;
            const thumbnail = `${iiif}/${imageId}/full/200,/0/default.jpg`;
            return {
              id: `aic-${item.id}`,
              title: item.title || 'Untitled',
              imageUrl,
              thumbnail,
              source: 'Art Institute of Chicago',
              url: `https://www.artic.edu/artworks/${item.id}`,
              metadata: {
                isPublicDomain: item.is_public_domain ?? null,
                artist: item.artist_title || null,
                date: item.date_display || null,
                origin: item.place_of_origin || null,
                medium: item.medium_display || null,
                department: item.department_title || null,
                iiif
              }
            };
          });
      } catch (error) {
        console.error('AIC API error:', error.message);
        return [];
      }
    }
  },

  cleveland: {
    name: 'Cleveland Museum of Art (Open Access)',
    search: async (query) => {
      try {
        const response = await axios.get('https://openaccess-api.clevelandart.org/api/artworks/', {
          timeout: 10000,
          params: {
            q: query,
            has_image: 1,
            limit: 20
          }
        });

        const items = Array.isArray(response?.data?.data) ? response.data.data : [];

        return items
          .filter((item) => item?.images?.web?.url || item?.images?.print?.url || item?.images?.full?.url)
          .map((item) => {
            const imageUrl = item?.images?.print?.url || item?.images?.web?.url || item?.images?.full?.url;
            const thumbnail = item?.images?.web?.url || item?.images?.print?.url || item?.images?.full?.url;
            return {
              id: `cleveland-${item.id}`,
              title: item.title || 'Untitled',
              imageUrl,
              thumbnail,
              source: 'Cleveland Museum of Art',
              url: item.url || null,
              metadata: {
                share_license_status: item.share_license_status || null,
                culture: item.culture || null,
                department: item.department || null,
                collection: item.collection || null,
                type: item.type || null,
                technique: item.technique || null,
                creation_date: item.creation_date || null,
                tombstone: item.tombstone || null
              }
            };
          });
      } catch (error) {
        console.error('Cleveland API error:', error.message);
        return [];
      }
    }
  },

  wikimedia: {
    name: 'Wikimedia Commons',
    search: async (query) => {
      const params = {
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: query,
        srnamespace: 6, // File namespace
        srlimit: 20
      };
      
      const url = 'https://commons.wikimedia.org/w/api.php';
      const response = await axios.get(url, { params });
      
      const results = [];
      
      for (const item of response.data.query.search || []) {
        try {
          const imageInfoResponse = await axios.get(url, {
            params: {
              action: 'query',
              format: 'json',
              titles: item.title,
              prop: 'imageinfo',
              iiprop: 'url|extmetadata|size',
              iiurlwidth: 300
            }
          });
          
          const pages = imageInfoResponse.data.query.pages;
          const page = Object.values(pages)[0];
          
          if (page.imageinfo && page.imageinfo[0]) {
            const info = page.imageinfo[0];
            results.push({
              id: `wiki-${page.pageid}`,
              title: item.title.replace('File:', ''),
              imageUrl: info.url,
              thumbnail: info.thumburl || info.url,
              source: 'Wikimedia Commons',
              url: info.descriptionurl,
              metadata: {
                description: info.extmetadata?.ImageDescription?.value || '',
                license: info.extmetadata?.LicenseShortName?.value || 'Unknown',
                author: info.extmetadata?.Artist?.value || 'Unknown',
                width: info.width,
                height: info.height
              }
            });
          }
        } catch (error) {
          console.error(`Wikimedia item ${item.title} error:`, error.message);
        }
      }
      
      return results;
    }
  },

  yale: {
    name: 'Yale Babylonian Collection',
    search: async (query) => {
      // Yale NELC API (if available) or web scraping fallback
      try {
        const searchUrl = `https://babylonian-collection.yale.edu/api/search?q=${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl, { timeout: 5000 });
        
        return (response.data.results || []).map(item => ({
          id: `yale-${item.id}`,
          title: item.title,
          imageUrl: item.image_url,
          thumbnail: item.thumb_url,
          source: 'Yale Babylonian',
          url: item.url,
          metadata: {
            period: item.period,
            provenience: item.provenience,
            material: item.material,
            accession: item.accession_number
          }
        }));
      } catch (error) {
        console.log('Yale API not available, using fallback');
        return [];
      }
    }
  },

  penn: {
    name: 'Penn Museum',
    search: async (query) => {
      // Penn Museum API
      try {
        const searchUrl = `https://www.penn.museum/api/objects/search?q=${encodeURIComponent(query)}&has_image=true`;
        const response = await axios.get(searchUrl, { timeout: 5000 });
        
        return (response.data.objects || []).slice(0, 20).map(item => ({
          id: `penn-${item.object_number}`,
          title: item.object_name,
          imageUrl: item.image_url,
          thumbnail: item.thumbnail_url,
          source: 'Penn Museum',
          url: `https://www.penn.museum/collections/object/${item.object_number}`,
          metadata: {
            period: item.period,
            culture: item.culture,
            material: item.material,
            description: item.description
          }
        }));
      } catch (error) {
        console.log('Penn Museum API error:', error.message);
        return [];
      }
    }
  },

  british: {
    name: 'British Museum',
    search: async (query) => {
      // British Museum doesn't have a public API, so we generate search URLs
      const searchUrl = `https://www.britishmuseum.org/collection/search?keyword=${encodeURIComponent(query)}&image=true&view=grid`;
      
      return [{
        id: 'bm-search',
        title: `British Museum search for: ${query}`,
        imageUrl: 'https://www.britishmuseum.org/favicon.ico',
        source: 'British Museum',
        url: searchUrl,
        metadata: {
          note: 'Direct API not available. Click to search on British Museum website.'
        }
      }];
    }
  },

  louvre: {
    name: 'Louvre Collections',
    search: async (query) => {
      // Louvre Collections API (if available)
      try {
        const searchUrl = `https://collections.louvre.fr/api/search?q=${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl, { timeout: 5000 });
        
        return (response.data.results || []).slice(0, 20).map(item => ({
          id: `louvre-${item.id}`,
          title: item.title,
          imageUrl: item.image,
          thumbnail: item.thumbnail,
          source: 'Louvre',
          url: item.url,
          metadata: {
            period: item.period,
            department: item.department,
            inventory: item.inventory_number
          }
        }));
      } catch (error) {
        // Fallback to search URL
        return [{
          id: 'louvre-search',
          title: `Louvre search for: ${query}`,
          imageUrl: 'https://www.louvre.fr/favicon.ico',
          source: 'Louvre',
          url: `https://collections.louvre.fr/en/recherche?q=${encodeURIComponent(query)}`,
          metadata: {
            note: 'Click to search on Louvre Collections website.'
          }
        }];
      }
    }
  },

  europeana: {
    name: 'Europeana',
    search: async (query) => {
      if (!process.env.EUROPEANA_API_KEY) {
        return [];
      }
      
      try {
        const params = {
          query: query,
          qf: 'TYPE:IMAGE',
          media: true,
          reusability: 'open',
          rows: 20,
          wskey: process.env.EUROPEANA_API_KEY
        };
        
        const response = await axios.get('https://api.europeana.eu/record/v2/search.json', { params });
        
        return (response.data.items || []).map(item => ({
          id: `europeana-${item.id}`,
          title: item.title?.[0] || 'Untitled',
          imageUrl: item.edmIsShownBy?.[0] || item.edmPreview?.[0],
          thumbnail: item.edmPreview?.[0],
          source: 'Europeana',
          url: item.guid,
          metadata: {
            provider: item.dataProvider?.[0],
            rights: item.rights?.[0],
            type: item.type
          }
        }));
      } catch (error) {
        console.error('Europeana API error:', error.message);
        return [];
      }
    }
  },

  cdli: {
    name: 'CDLI (Cuneiform Digital Library)',
    search: async (query) => {
      // CDLI search
      try {
        const searchUrl = `https://cdli.ucla.edu/search/search_results.php?SearchMode=Text&PrimaryPublication=&Author=&PublicationDate=&SecondaryPublication=&Collection=&AccessionNumber=&MuseumNumber=&Provenience=&ExcavationNumber=&Period=&DatesReferenced=&ObjectType=&ObjectRemarks=&Material=&Language=&Genre=&SubGenre=&CompositeNumber=&SealID=&ObjectID=&ATFSource=&CatalogueSource=&TranslationSource=&requestFrom=Search&order=ObjectID&Text=${encodeURIComponent(query)}`;
        
        return [{
          id: 'cdli-search',
          title: `CDLI search for: ${query}`,
          imageUrl: 'https://cdli.ucla.edu/favicon.ico',
          source: 'CDLI',
          url: searchUrl,
          metadata: {
            note: 'Cuneiform Digital Library - specialized database for cuneiform tablets'
          }
        }];
      } catch (error) {
        return [];
      }
    }
  },

  unsplash: {
    name: 'Unsplash',
    search: async (query) => {
      if (!process.env.UNSPLASH_ACCESS_KEY) {
        return [];
      }
      
      try {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
          params: {
            query: query + ' mesopotamia ancient',
            per_page: 20
          },
          headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
          }
        });
        
        return (response.data.results || []).map(item => ({
          id: `unsplash-${item.id}`,
          title: item.description || item.alt_description || 'Untitled',
          imageUrl: item.urls.regular,
          thumbnail: item.urls.thumb,
          source: 'Unsplash',
          url: item.links.html,
          metadata: {
            author: item.user.name,
            authorUrl: item.user.links.html,
            license: 'Unsplash License',
            width: item.width,
            height: item.height
          }
        }));
      } catch (error) {
        console.error('Unsplash API error:', error.message);
        return [];
      }
    }
  },

  ppt: {
    name: 'Local PPT Extracts',
    search: async (query) => {
      // Search in local PPT extracted images
      const taggedFile = path.join(__dirname, 'tagged-images', 'tagged-images.json');
      
      if (!fs.existsSync(taggedFile)) {
        return [];
      }
      
      const taggedData = JSON.parse(fs.readFileSync(taggedFile, 'utf-8'));
      const queryLower = query.toLowerCase();
      const results = [];
      
      for (const image of taggedData.taggedImages || []) {
        const analysis = image.analysis;
        if (!analysis) continue;
        
        // Check if query matches image content or tags
        const contentMatch = analysis.imageContent?.toLowerCase().includes(queryLower);
        const tagMatch = analysis.suggestedTags?.some(tag => 
          tag.toLowerCase().includes(queryLower)
        );
        
        if (contentMatch || tagMatch) {
          results.push({
            id: `ppt-${image.filename}`,
            title: analysis.imageContent || image.filename,
            imageUrl: `file://${image.fullPath}`,
            thumbnail: `file://${image.fullPath}`,
            source: 'PPT Extract',
            metadata: {
              filename: image.filename,
              sourcePresentation: image.source,
              tags: analysis.suggestedTags,
              matches: analysis.matches
            }
          });
        }
      }
      
      return results.slice(0, 20);
    }
  }
};

/**
 * Cache helper functions
 */
function getCacheKey(source, query) {
  const q = String(query || '').toLowerCase();
  const hash = crypto.createHash('sha1').update(q).digest('hex').slice(0, 12);
  const slug = q
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
  return `${source}-${slug || 'query'}-${hash}.json`;
}

async function getFromCache(source, query) {
  const cacheFile = path.join(CACHE_DIR, getCacheKey(source, query));
  
  if (fs.existsSync(cacheFile)) {
    const stats = fs.statSync(cacheFile);
    const age = Date.now() - stats.mtimeMs;
    
    if (age < CACHE_DURATION) {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    }
  }
  
  return null;
}

async function saveToCache(source, query, data) {
  const cacheFile = path.join(CACHE_DIR, getCacheKey(source, query));
  fs.writeFileSync(cacheFile, JSON.stringify(data), 'utf-8');
}

/**
 * Main search endpoint - searches across all enabled sources
 */
export async function multiSourceSearch({ query, sources, saveToDb = false }) {
  const safeQuery = String(query || '').trim();
  const safeSources = Array.isArray(sources) && sources.length
    ? sources.map((s) => String(s).trim()).filter(Boolean)
    : ['getty', 'british', 'cleveland', 'met', 'aic', 'yale', 'penn', 'cdli', 'wikimedia', 'ppt'];

  if (!safeQuery) {
    const err = new Error('Query is required');
    err.statusCode = 400;
    throw err;
  }

  console.log(`🔍 Multi-source search for: "${safeQuery}"`);
  console.log(`   Sources: ${safeSources.join(', ')}`);

  // Search all sources in parallel
  const searchPromises = safeSources.map(async (sourceId) => {
    const source = SOURCES[sourceId];
    if (!source) {
      return { source: sourceId, name: sourceId, results: [], count: 0, error: 'unknown source' };
    }

    try {
      // Check cache first
      let results = await getFromCache(sourceId, safeQuery);

      if (!results) {
        // Perform search
        results = await source.search(safeQuery);

        // Cache results
        await saveToCache(sourceId, safeQuery, results);
      }

      return {
        source: sourceId,
        name: source.name,
        results: results,
        count: results.length
      };
    } catch (error) {
      console.error(`Error searching ${sourceId}:`, error.message);
      return {
        source: sourceId,
        name: source.name,
        results: [],
        error: error.message
      };
    }
  });

  const searchResults = await Promise.allSettled(searchPromises);

  // Combine results
  const response = {
    query: safeQuery,
    timestamp: new Date().toISOString(),
    sources: {},
    totalResults: 0,
    allImages: []
  };

  for (const result of searchResults) {
    if (result.status === 'fulfilled' && result.value) {
      const sourceData = result.value;
      response.sources[sourceData.source] = {
        name: sourceData.name,
        count: sourceData.count || 0,
        error: sourceData.error
      };

      if (sourceData.results) {
        response.allImages.push(...sourceData.results);
        response.totalResults += sourceData.results.length;
      }
    }
  }

  if (saveToDb && supabase) {
    try {
      await supabase.from('image_searches').insert({
        query: safeQuery,
        sources: safeSources,
        results_count: response.totalResults,
        results: response
      });
    } catch (dbError) {
      console.error('Database save error:', dbError);
    }
  }

  console.log(`   Total results: ${response.totalResults}`);
  return response;
}

router.post('/search/multi', async (req, res) => {
  try {
    const { query, sources } = req.body || {};
    const response = await multiSourceSearch({ query, sources, saveToDb: true });
    res.json(response);
  } catch (error) {
    console.error('Multi-search error:', error);
    res.status(error.statusCode || 500).json({
      error: 'Search failed',
      message: error.message
    });
  }
});

/**
 * Individual source search endpoint
 */
router.get('/search/:source', async (req, res) => {
  try {
    const { source } = req.params;
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const sourceConfig = SOURCES[source];
    if (!sourceConfig) {
      return res.status(400).json({ error: `Unknown source: ${source}` });
    }
    
    // Check cache
    let results = await getFromCache(source, query);
    
    if (!results) {
      // Perform search
      results = await sourceConfig.search(query);
      
      // Cache results
      await saveToCache(source, query, results);
    }
    
    res.json({
      source: sourceConfig.name,
      query: query,
      count: results.length,
      results: results
    });
    
  } catch (error) {
    console.error(`Search error for ${req.params.source}:`, error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
});

/**
 * AI generation endpoint
 */
router.post('/generate/artifact', async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({
        error: 'OpenAI not configured',
        message: 'Set OPENAI_API_KEY to enable image generation.'
      });
    }

    const { 
      artifact, 
      description, 
      style = 'educational',
      model = 'dall-e-3'
    } = req.body;
    
    if (!artifact) {
      return res.status(400).json({ error: 'Artifact name is required' });
    }
    
    // Build appropriate prompt based on style
    let prompt = '';
    
    if (style === 'educational') {
      prompt = `Create a clear educational diagram or illustration showing: ${artifact}.
        ${description ? `Additional context: ${description}` : ''}
        Style: Professional educational material for elementary school.
        Include labels and annotations where appropriate.
        Historically accurate based on archaeological evidence from ancient Mesopotamia.`;
    } else if (style === 'museum') {
      prompt = `Create a museum-quality archaeological illustration of ${artifact}.
        ${description ? `Details: ${description}` : ''}
        Style: Detailed archaeological drawing as would appear in a museum catalog.
        Show material, texture, and craftsmanship clearly.
        Based on actual artifacts from ancient Mesopotamian civilizations.`;
    } else if (style === 'reconstruction') {
      prompt = `Create a historical reconstruction showing ${artifact} in its original context.
        ${description ? `Context: ${description}` : ''}
        Style: Realistic reconstruction based on archaeological evidence.
        Show how it would have appeared in ancient Mesopotamia.
        Include environmental and cultural context.`;
    }
    
    console.log(`🎨 Generating ${style} image for: ${artifact}`);
    
    const response = await openai.images.generate({
      model: model,
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: model === 'dall-e-3' ? 'vivid' : undefined
    });
    
    if (response.data && response.data[0]) {
      const imageData = response.data[0];
      
      // Save to database
      if (supabase) {
        await supabase.from('generated_images').insert({
          artifact: artifact,
          description: description,
          style: style,
          model: model,
          prompt: prompt,
          revised_prompt: imageData.revised_prompt,
          image_url: imageData.url
        });
      }
      
      res.json({
        success: true,
        artifact: artifact,
        imageUrl: imageData.url,
        prompt: prompt,
        revisedPrompt: imageData.revised_prompt
      });
    } else {
      throw new Error('No image generated');
    }
    
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      error: 'Generation failed',
      message: error.message
    });
  }
});

/**
 * AI prompt/spec builder for diagrams (Gemini text)
 * Returns a distilled prompt + optional caption/tags suggestions.
 */
router.post('/spec/diagram', async (req, res) => {
  try {
    const model = process.env.GEMINI_TEXT_MODEL || 'gemini-2.0-flash';
    const {
      artifact,
      sectionTitle,
      sectionText,
      grade,
      assetType = 'diagram',
      constraints
    } = req.body || {};

    const focus = String(artifact || sectionTitle || '').trim();
    if (!focus) return res.status(400).json({ error: 'artifact or sectionTitle required' });

    const text = String(sectionText || '').trim();
    const constraintsText = constraints ? String(constraints).trim() : '';

    const prompt = [
      `You are a technical illustrator prompt engineer.`,
      `Goal: produce ONE image prompt for a kid-safe educational ${assetType}.`,
      grade ? `Audience: Grade ${grade}.` : '',
      `Focus: ${focus}.`,
      sectionTitle ? `Section title: ${sectionTitle}` : '',
      text ? `Section excerpt (may be long):\n${text.slice(0, 3500)}` : '',
      constraintsText ? `Constraints:\n${constraintsText.slice(0, 1500)}` : '',
      ``,
      `Return strict JSON with keys:`,
      `{ "prompt": string, "caption": string|null, "negative_prompt": string|null, "aspect": "square"|"landscape"|"portrait", "tags": string[] }`
    ].filter(Boolean).join('\n');

    const data = await geminiGenerateContent({
      model,
      parts: [{ text: prompt }]
    });

    const outText = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n') || '';
    let parsed = null;
    try {
      parsed = JSON.parse(outText);
    } catch {
      // Try to find a JSON object in the text
      const match = outText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    if (!parsed?.prompt) {
      return res.status(502).json({
        error: 'Spec parse failed',
        message: 'Gemini did not return parseable JSON',
        raw: outText.slice(0, 2000)
      });
    }

    res.json({
      success: true,
      provider: 'gemini',
      model,
      spec: {
        prompt: String(parsed.prompt),
        caption: parsed.caption ? String(parsed.caption) : null,
        negative_prompt: parsed.negative_prompt ? String(parsed.negative_prompt) : null,
        aspect: ['square', 'landscape', 'portrait'].includes(parsed.aspect) ? parsed.aspect : 'landscape',
        tags: Array.isArray(parsed.tags) ? parsed.tags.map((t) => String(t)).filter(Boolean).slice(0, 30) : []
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: 'Spec failed', message: error.message });
  }
});

/**
 * Generate an image via OpenAI Images API using a raw prompt.
 * Returns a temporary URL (client should ingest immediately).
 */
router.post('/generate/openai', async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({
        error: 'OpenAI not configured',
        message: 'Set OPENAI_API_KEY to enable image generation.'
      });
    }

    const { prompt, size = '1792x1024', quality = 'standard', style = 'vivid', model = 'dall-e-3' } = req.body || {};
    const safePrompt = String(prompt || '').trim();
    if (!safePrompt) return res.status(400).json({ error: 'prompt required' });

    const response = await openai.images.generate({
      model,
      prompt: safePrompt,
      n: 1,
      size,
      quality,
      style: model === 'dall-e-3' ? style : undefined
    });

    const imageUrl = response?.data?.[0]?.url || null;
    if (!imageUrl) throw new Error('no image url returned');

    res.json({
      success: true,
      provider: 'openai',
      model,
      imageUrl,
      revisedPrompt: response?.data?.[0]?.revised_prompt || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Generation failed', message: error.message });
  }
});

/**
 * Generate an image via Gemini Image model.
 * Returns base64 inlineData (client should upload/ingest).
 */
router.post('/generate/gemini-image', async (req, res) => {
  try {
    const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
    const { prompt } = req.body || {};
    const safePrompt = String(prompt || '').trim();
    if (!safePrompt) return res.status(400).json({ error: 'prompt required' });

    const data = await geminiGenerateContent({
      model,
      parts: [{ text: safePrompt }]
    });

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const inline = parts.find((p) => p?.inlineData?.data);
    const mimeType = inline?.inlineData?.mimeType || 'image/png';
    const b64 = inline?.inlineData?.data || null;
    if (!b64) {
      return res.status(502).json({
        error: 'No image data returned',
        message: 'Gemini response did not include inlineData',
        rawKeys: parts.map((p) => Object.keys(p || {}))
      });
    }

    res.json({
      success: true,
      provider: 'gemini',
      model,
      mimeType,
      b64
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: 'Generation failed', message: error.message });
  }
});

/**
 * Batch search for multiple artifacts
 */
router.post('/search/batch', async (req, res) => {
  try {
    const { artifacts, sources = ['met', 'wikimedia', 'yale', 'penn'] } = req.body;
    
    if (!artifacts || !Array.isArray(artifacts)) {
      return res.status(400).json({ error: 'Artifacts array is required' });
    }
    
    console.log(`📦 Batch search for ${artifacts.length} artifacts`);
    
    const results = [];
    
    for (const artifact of artifacts) {
      // Search for each artifact
      const searchPromises = sources.map(async (sourceId) => {
        const source = SOURCES[sourceId];
        if (!source) return null;
        
        try {
          const sourceResults = await source.search(artifact);
          return sourceResults.slice(0, 3); // Top 3 from each source
        } catch (error) {
          return null;
        }
      });
      
      const artifactResults = await Promise.allSettled(searchPromises);
      
      const images = [];
      for (const result of artifactResults) {
        if (result.status === 'fulfilled' && result.value) {
          images.push(...result.value);
        }
      }
      
      results.push({
        artifact: artifact,
        imageCount: images.length,
        images: images
      });
    }
    
    res.json({
      artifactCount: artifacts.length,
      results: results
    });
    
  } catch (error) {
    console.error('Batch search error:', error);
    res.status(500).json({
      error: 'Batch search failed',
      message: error.message
    });
  }
});

/**
 * Get available sources and their status
 */
router.get('/sources/status', async (req, res) => {
  const status = {};
  
  for (const [id, source] of Object.entries(SOURCES)) {
    status[id] = {
      name: source.name,
      available: true,
      cached_queries: 0
    };
    
    // Count cached queries
    try {
      const cacheFiles = fs.readdirSync(CACHE_DIR);
      status[id].cached_queries = cacheFiles.filter(f => f.startsWith(`${id}-`)).length;
    } catch (error) {
      // Cache directory doesn't exist
    }
    
    // Check if API keys are configured
    if (id === 'unsplash' && !process.env.UNSPLASH_ACCESS_KEY) {
      status[id].available = false;
      status[id].note = 'API key not configured';
    } else if (id === 'europeana' && !process.env.EUROPEANA_API_KEY) {
      status[id].available = false;
      status[id].note = 'API key not configured';
    }
  }
  
  res.json(status);
});

/**
 * Clear cache
 */
router.post('/cache/clear', async (req, res) => {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(CACHE_DIR, file));
    }
    
    res.json({
      success: true,
      message: `Cleared ${files.length} cached searches`
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

export default router;
