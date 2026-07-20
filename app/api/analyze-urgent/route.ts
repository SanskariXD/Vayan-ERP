import { NextResponse } from 'next/server';
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/gemini-cache';

export const maxDuration = 60;

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
      console.warn("No GEMINI_API_KEY set. Falling back to mock data array.");
      return NextResponse.json(fallbackMockData(items)); 
    }

    // Process items sequentially to respect rate limits
    const urgentItems = items.slice(0, 5);
    const enrichedItems: any[] = [];
    
    for (const item of urgentItems) {
      try {
        // E2E Test Override Pipeline
        if (process.env.E2E_TEST_MODE === 'true') {
           const fs = require('fs');
           const path = require('path');
           const mockPath = path.join(process.cwd(), 'tests', 'mockGeminiPayload.json');
           const mockData = JSON.parse(fs.readFileSync(mockPath, 'utf8'));
           await new Promise(r => setTimeout(r, 600)); 
           enrichedItems.push({ ...item, ...mockData });
           continue;
        }

        const imageUrl = item.imageUrl || item.image_url || item.url || '';
        if (!imageUrl) {
          enrichedItems.push({ ...item, error: 'No image URL found' });
          continue;
        }

        // ── CHECK CACHE FIRST ──
        const cached = getCachedAnalysis(imageUrl);
        if (cached) {
          enrichedItems.push({ ...item, ...cached });
          continue;
        }

        // ── CACHE MISS: Call Gemini API ──
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) throw new Error("Could not fetch image bytes");
        const arrayBuffer = await imageRes.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
        
        const payload = {
           systemInstruction: {
             parts: [{ text: SYSTEM_PROMPT }]
           },
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
        if (!contentStr) throw new Error("No structured text received.");

        const analysisJSON = JSON.parse(contentStr);

        // ── STORE IN CACHE ──
        setCachedAnalysis(imageUrl, analysisJSON);

        enrichedItems.push({ ...item, ...analysisJSON });

        // Rate limit pacing: wait 4s between Gemini calls
        await new Promise(r => setTimeout(r, 4000));

      } catch (err) {
        console.error(`Gemini failed for item ${item.id || item.pin_id}:`, err);
        enrichedItems.push({ ...item, error: 'Gemini Analysis Failed' });
      }
    }

    return NextResponse.json(enrichedItems);

  } catch (error: any) {
    console.error("Agent Backend Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function fallbackMockData(items: any[]) {
  return items.slice(0, 5).map(item => ({
    ...item,
    design_analysis: {
      confidence_match: 92,
      setup_days: 15,
      complexity: "Level 4 - Complex Jacquard",
      extracted_palette: ["#480d19", "#d69a25", "#f1ece4", "#1a251e", "#bd2f39"],
      zari_rules: "Heavy pallu integration required.",
      motif_geometry: "Intricate floral butis with geometric trailing."
    },
    scheduler_inputs: {
      title: item.motifName || item.title || "Mock Design Pattern",
      seasonality_rationale: "Aligns with approaching festival demands in Karnataka.",
      efficiency_rationale: "Requires full 15-day card punching. Best queued to idle looms.",
      finance_rationale: "Expected 24% gross regional margin on completion."
    }
  }));
}
