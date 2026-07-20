import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/gemini-cache';

export const maxDuration = 300;

const SYSTEM_PROMPT = `
You are an expert master weaver and high-capacity technical production scheduler specializing in South Indian handloom traditions, focusing heavily on the operational constraints of traditional weaving clusters. Your job is to translate high-trend consumer images into low-level production specs for cooperative societies operating 10–20 loom configurations.

When an image is provided, perform an exhaustive structural audit. You must output a valid JSON response strictly matching the schema parameters, ensuring that:
- Confidence match is highly tailored
- Layout geometries are perfectly extracted
- Recommended palette is strictly 5 hexadecimal elements.
`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    design_analysis: {
      type: 'object',
      properties: {
        confidence_match: { type: 'integer', description: 'Match percentage 0-100' },
        setup_days: { type: 'integer', description: '1 if same base, 15 if new Jacquard card' },
        complexity: { type: 'string', description: 'e.g., Level 5 - 2,400 Warp' },
        extracted_palette: { 
          type: 'array', 
          items: { type: 'string' }, 
          description: 'Top 5 hex codes representing colors found' 
        },
        zari_rules: { type: 'string', description: 'Details on zari placement' },
        motif_geometry: { type: 'string', description: 'Shape and border descriptions' }
      },
      required: ['confidence_match', 'setup_days', 'complexity', 'extracted_palette', 'zari_rules', 'motif_geometry']
    },
    scheduler_inputs: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        seasonality_rationale: { type: 'string', description: 'e.g., Aligns with Varamahalakshmi or upcoming wedding season' },
        efficiency_rationale: { type: 'string' },
        finance_rationale: { type: 'string' }
      },
      required: ['title', 'seasonality_rationale', 'efficiency_rationale', 'finance_rationale']
    }
  },
  required: ['design_analysis', 'scheduler_inputs']
};

export async function POST(req: Request) {
  try {
    const { items } = await req.json();
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("No GEMINI_API_KEY. Skipping batch processor.");
      return NextResponse.json({ status: "skipped" }); 
    }

    // Fire and forget logic
    processBatchAsync(items, apiKey).catch(err => {
      console.error("Batch processing crashed internally: ", err);
    });

    // Return 202 to unblock the frontend immediately
    return NextResponse.json({ status: 'Processing started in background' }, { status: 202 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function processBatchAsync(items: any[], apiKey: string) {
  const cachePath = path.join(process.cwd(), 'data', 'batch-insights.json');
  
  // Ensure directory exists
  if (!fs.existsSync(path.dirname(cachePath))) {
     fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  }

  // Load existing batch results to avoid double processing
  let existingCache: any[] = [];
  if (fs.existsSync(cachePath)) {
     const raw = fs.readFileSync(cachePath, 'utf8');
     try { existingCache = JSON.parse(raw); } catch { }
  }

  const processedItemIds = new Set(existingCache.map((i: any) => i.id || i.pin_id));
  
  for (const item of items) {
    const itemId = item.id || item.pin_id;
    if (processedItemIds.has(itemId)) continue; // skip already in batch file

    const imageUrl = item.imageUrl || item.image_url || item.url || '';
    if (!imageUrl) continue;

    try {
        console.log(`[Batch Processor] Processing item ${itemId}...`);

        // ── CHECK GEMINI CACHE FIRST ──
        const cached = getCachedAnalysis(imageUrl);
        if (cached) {
          console.log(`[Batch Processor] Cache HIT for ${itemId}, skipping API call.`);
          existingCache.push({ ...item, ...cached });
          fs.writeFileSync(cachePath, JSON.stringify(existingCache, null, 2));
          continue;
        }
        
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) throw new Error("Could not fetch image bytes");
        const arrayBuffer = await imageRes.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
        
        const payload = {
           systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
           generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: RESPONSE_SCHEMA
           },
           contents: [{
              parts: [
                 { text: "Analyze this handloom design image." },
                 { inlineData: { mimeType, data: base64Image } }
              ]
           }]
        };

        const generateRes = await fetch(geminiUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payload)
        });

        if (!generateRes.ok) throw new Error(await generateRes.text());
        const generateData = await generateRes.json();
        const contentStr = generateData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (contentStr) {
           const analysisJSON = JSON.parse(contentStr);
           // Store in shared Gemini cache
           setCachedAnalysis(imageUrl, analysisJSON);
           existingCache.push({ ...item, ...analysisJSON });
           fs.writeFileSync(cachePath, JSON.stringify(existingCache, null, 2));
           console.log(`[Batch Processor] Safely cached ${itemId}.`);
        }
        
    } catch (err) {
        console.error(`[Batch Processor] Failed on item ${itemId}:`, err);
    }

    // Critical rate limit pacing (15 RPM = exactly 4 sec per request)
    await new Promise(r => setTimeout(r, 4500)); 
  }
  console.log(`[Batch Processor] Finished completely.`);
}
