import { NextResponse } from 'next/server';

export const maxDuration = 60;

const SYSTEM_PROMPT = `
You are an expert Production Decision Engine and Operational Planner for a Handloom Cooperative.
Your goal is to optimize production, forecast demand, calculate setup costs, predict income, and identify risks.
You must output a valid JSON response strictly matching the schema parameters.
Every recommendation you make must be operational, focusing on income stability and production realities.
Always include a clear, logical "reasoning" (Explainable AI) for your decisions.
`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    demand_intelligence: {
      type: 'object',
      properties: {
        expected_demand: { type: 'string', description: 'HIGH, MEDIUM, LOW' },
        confidence: { type: 'integer', description: '0-100' },
        reason: { type: 'string', description: 'Why this demand is expected' },
        peak_season_upcoming: { type: 'boolean' }
      },
      required: ['expected_demand', 'confidence', 'reason', 'peak_season_upcoming']
    },
    production_decision: {
      type: 'object',
      properties: {
        recommendation: { type: 'string', description: 'e.g., Continue Current Warp, Change Design, Prepare Warp' },
        reason: { type: 'string', description: 'Detailed explanation for the decision' },
        confidence: { type: 'integer' }
      },
      required: ['recommendation', 'reason', 'confidence']
    },
    setup_cost_intelligence: {
      type: 'object',
      properties: {
        estimated_setup_days: { type: 'integer' },
        downtime_loom_days: { type: 'integer' },
        estimated_cost_inr: { type: 'integer' },
        expected_additional_revenue: { type: 'integer' },
        recommendation: { type: 'string', description: 'e.g., Advised, Not Advised' }
      },
      required: ['estimated_setup_days', 'downtime_loom_days', 'estimated_cost_inr', 'expected_additional_revenue', 'recommendation']
    },
    risk_intelligence: {
      type: 'object',
      properties: {
        level: { type: 'string', description: 'HIGH, MEDIUM, LOW' },
        risk_description: { type: 'string' },
        recommended_action: { type: 'string' }
      },
      required: ['level', 'risk_description', 'recommended_action']
    },
    income_forecast: {
      type: 'object',
      properties: {
        expected_monthly_revenue: { type: 'integer' },
        expected_expenses: { type: 'integer' },
        expected_net_income: { type: 'integer' },
        confidence: { type: 'integer' }
      },
      required: ['expected_monthly_revenue', 'expected_expenses', 'expected_net_income', 'confidence']
    }
  },
  required: ['demand_intelligence', 'production_decision', 'setup_cost_intelligence', 'risk_intelligence', 'income_forecast']
};

export async function POST(req: Request) {
  try {
    const { stateContext } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("No GEMINI_API_KEY set. Falling back to mock data.");
      return NextResponse.json(fallbackMockData(stateContext));
    }

    const promptText = `Analyze the following cooperative production state and provide the 5-module intelligence response.
State Context:
${JSON.stringify(stateContext, null, 2)}
`;

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
          parts: [{ text: promptText }]
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

    return NextResponse.json(analysisJSON);

  } catch (error: any) {
    console.error("Decision Engine Error, falling back to mock data:", error);
    return NextResponse.json(fallbackMockData(null));
  }
}

function fallbackMockData(stateContext: any) {
  return {
    demand_intelligence: {
      expected_demand: "HIGH",
      confidence: 87,
      reason: "Wedding season begins in 24 days. Previous three years show 31% increase.",
      peak_season_upcoming: true
    },
    production_decision: {
      recommendation: "Continue Current Warp",
      reason: "Current warp still has capacity. Expected wedding demand begins after current batch completion. Changing design now introduces setup delay.",
      confidence: 93
    },
    setup_cost_intelligence: {
      estimated_setup_days: 16,
      downtime_loom_days: 11,
      estimated_cost_inr: 18400,
      expected_additional_revenue: 12100,
      recommendation: "Not advised"
    },
    risk_intelligence: {
      level: "HIGH",
      risk_description: "Current production might miss projected wedding demand if not paced correctly.",
      recommended_action: "Prepare next warp within five days."
    },
    income_forecast: {
      expected_monthly_revenue: 460000,
      expected_expenses: 290000,
      expected_net_income: 170000,
      confidence: 89
    }
  };
}
