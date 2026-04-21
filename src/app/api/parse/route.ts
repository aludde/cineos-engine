import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PARSER_SYSTEM_PROMPT = `
You are an expert Line Producer. Extract a strict logistical breakdown from the script.
Return ONLY a raw, valid JSON object matching this structure:
{
  "title": "Project Name (infer if not explicit)",
  "agency": "Agency Name (if found)",
  "scenes": [
    {
      "id": "scene-1",
      "sceneNumber": "1",
      "setting": "INT or EXT",
      "location": "Brief location name",
      "timeOfDay": "DAY, NIGHT, or MAGIC HOUR",
      "actionSummary": "1 sentence describing action.",
      "assets": [
        {
          "category": "Cast | Prop | Wardrobe | Camera | Vehicle | Location",
          "description": "Specific item",
          "quantity": 1
        }
      ]
    }
  ]
}
`;

export async function POST(request: Request) {
  try {
    const { scriptText } = await request.json();
    if (!scriptText) return NextResponse.json({ error: "No script provided" }, { status: 400 });

    const prompt = `${PARSER_SYSTEM_PROMPT}\n\n=== SCRIPT ===\n${scriptText}`;
    
    // --- THE RETRY ENGINE ---
    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        // If successful, return the data and break the loop
        return NextResponse.json(JSON.parse(response.text || '{}'));
        
      } catch (apiError: any) {
        // If it's a 503 traffic error AND we haven't maxed out retries
        if (apiError?.status === 503 && attempt < MAX_RETRIES - 1) {
          attempt++;
          const delay = attempt * 2000; // Wait 2s, then 4s...
          console.warn(`[CineOS Engine] Server busy (503). Retrying in ${delay}ms... (Attempt ${attempt}/${MAX_RETRIES - 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue; // Loop around and try knocking again
        }
        
        // If it's a different error, or we ran out of retries, throw it to the outer catch
        throw apiError; 
      }
    }

  } catch (error: any) {
    console.error("Parser Engine Failure:", error);
    
    // Format the error nicely for the frontend
    const errorMessage = error?.status === 503 
      ? "AI servers are currently at maximum capacity. Please try again in a few seconds." 
      : "Failed to process script.";
      
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}