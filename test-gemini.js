const apiKey = process.env.GEMINI_API_KEY || "";

const SYSTEM_PROMPT = "You are a master weaver. Provide a structured design audit.";

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    design_analysis: {
      type: 'object',
      properties: {
        confidence_match: { type: 'integer' },
        complexity: { type: 'string' },
      },
      required: ['confidence_match', 'complexity']
    }
  },
  required: ['design_analysis']
};

async function test() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: {
           responseMimeType: 'application/json',
           responseSchema: RESPONSE_SCHEMA
        },
        contents: [{ parts: [{ text: "Analyze a red saree pattern with gold zari border." }] }]
      })
    });
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
       console.log("Structured text:", data.candidates[0].content.parts[0].text);
    }
  } catch (err) {
    console.error("Error generating content:", err);
  }
}

test();
