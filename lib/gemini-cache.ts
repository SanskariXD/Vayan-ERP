/**
 * gemini-cache.ts
 * ================
 * Persistent local caching layer for Gemini API analysis results.
 * 
 * Uses a JSON file at data/gemini-cache.json to store analysis results
 * keyed by a hash of the image URL. This prevents redundant API calls
 * and respects the Gemini Free Tier rate limits (15-20 RPM).
 * 
 * Cache format:
 * {
 *   "<sha256-of-image-url>": {
 *     image_url: string,
 *     cached_at: string (ISO),
 *     analysis: { design_analysis: {...}, scheduler_inputs: {...} }
 *   }
 * }
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CACHE_PATH = path.join(process.cwd(), 'data', 'gemini-cache.json');

export interface CachedAnalysis {
  image_url: string;
  cached_at: string;
  analysis: {
    design_analysis: {
      confidence_match: number;
      setup_days: number;
      complexity: string;
      extracted_palette: string[];
      zari_rules: string;
      motif_geometry: string;
    };
    scheduler_inputs: {
      title: string;
      seasonality_rationale: string;
      efficiency_rationale: string;
      finance_rationale: string;
    };
  };
}

/**
 * Generate a stable hash key from an image URL.
 */
export function hashImageUrl(url: string): string {
  return crypto.createHash('sha256').update(url.trim()).digest('hex');
}

/**
 * Load the entire cache from disk.
 */
export function loadCache(): Record<string, CachedAnalysis> {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      const raw = fs.readFileSync(CACHE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[gemini-cache] Failed to load cache, starting fresh:', (err as Error).message);
  }
  return {};
}

/**
 * Save the entire cache to disk.
 */
export function saveCache(cache: Record<string, CachedAnalysis>): void {
  try {
    const dir = path.dirname(CACHE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err) {
    console.error('[gemini-cache] Failed to save cache:', (err as Error).message);
  }
}

/**
 * Look up a cached analysis by image URL.
 * Returns the full analysis object if found, null otherwise.
 */
export function getCachedAnalysis(imageUrl: string): CachedAnalysis['analysis'] | null {
  const cache = loadCache();
  const key = hashImageUrl(imageUrl);
  const entry = cache[key];
  if (entry) {
    console.log(`[gemini-cache] HIT for ${imageUrl.slice(0, 60)}...`);
    return entry.analysis;
  }
  console.log(`[gemini-cache] MISS for ${imageUrl.slice(0, 60)}...`);
  return null;
}

/**
 * Store a Gemini analysis result in the cache.
 */
export function setCachedAnalysis(imageUrl: string, analysis: CachedAnalysis['analysis']): void {
  const cache = loadCache();
  const key = hashImageUrl(imageUrl);
  cache[key] = {
    image_url: imageUrl,
    cached_at: new Date().toISOString(),
    analysis,
  };
  saveCache(cache);
  console.log(`[gemini-cache] STORED ${imageUrl.slice(0, 60)}...`);
}

/**
 * Get cache stats for diagnostics.
 */
export function getCacheStats(): { totalEntries: number; cacheFilePath: string } {
  const cache = loadCache();
  return {
    totalEntries: Object.keys(cache).length,
    cacheFilePath: CACHE_PATH,
  };
}
