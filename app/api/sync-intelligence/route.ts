import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = util.promisify(exec);
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
       console.warn("No GEMINI_API_KEY set for pipeline. Emitting fallback warnings.");
    }
    
    let rawTrendsJson: any[] = [];
    const cwdPath = path.join(process.cwd(), 'pinterest-scrapy-scraper-main');

    // [ Step 1: Ingestion ]
    console.log("[Pipeline] Starting Ingestion: Scrapy Engine");
    try {
       await execAsync('.venv\\bin\\scrapy crawl handloom_search -a mode=full', { cwd: cwdPath });
    } catch (e) {
       console.warn("[Pipeline] Scrapy not available. Using existing local JSON cache.");
    }

    // [ Step 2: Ranking ]
    console.log("[Pipeline] Starting Analytical Ranker");
    try {
       await execAsync('.venv\\bin\\python rank_trends.py', { cwd: cwdPath });
    } catch (e) {
       console.warn("[Pipeline] Python ranker not available. Using existing ranked file or mock fallback.");
    }

    // Always try to read from ranked file first (it may already exist from a previous run)
    const rankedPath = path.join(cwdPath, 'output', 'ranked_trends.json');
    if (fs.existsSync(rankedPath)) {
      try {
        const fileData = fs.readFileSync(rankedPath, 'utf8');
        rawTrendsJson = JSON.parse(fileData).trends || [];
        console.log(`[Pipeline] Loaded ${rawTrendsJson.length} trends from ranked_trends.json`);
      } catch (e) {
        console.warn("[Pipeline] Failed to parse ranked_trends.json:", e);
      }
    }

    // Fallback to mock data if nothing was loaded
    if (rawTrendsJson.length === 0) {
      console.warn("[Pipeline] No ranked trends found. Falling back to mock data.");
      const mockData = await import('@/lib/mock-data');
      rawTrendsJson = mockData.MOCK_TRENDS;
    }

    // [ Step 3: Urgent Lane — process top 5 instantly ]
    console.log("[Pipeline] Step 3: Urgent Lane Gemini Enrichment (Top 5)");
    const top5 = rawTrendsJson.slice(0, 5);
    
    const baseUrl = req.url.replace('/api/sync-intelligence', '');
    const urgentResponse = await fetch(`${baseUrl}/api/analyze-urgent`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ items: top5 })
    });
    
    const enrichedTop5 = urgentResponse.ok ? await urgentResponse.json() : top5;

    // [ Step 4: Background Lane — fire and forget remaining items ]
    console.log("[Pipeline] Step 4: Background catalog items...");
    const backgroundItems = rawTrendsJson.slice(5);
    if (backgroundItems.length > 0) {
       fetch(`${baseUrl}/api/analyze-batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: backgroundItems })
       }).catch(e => console.error("Silent background queue failure:", e));
    }

    return NextResponse.json({
       pipeline_status: 'SUCCESS',
       urgent_results: enrichedTop5,
       total_trends: rawTrendsJson.length,
       queued_background: backgroundItems.length
    });

  } catch (error: any) {
    console.error("Pipeline Orchestration Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
