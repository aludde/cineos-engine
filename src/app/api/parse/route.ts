import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
You are a master First Assistant Director and Line Producer specializing in Commercial and Advertisement production. Your job is to read the provided commercial script text and extract a strict, literal, and comprehensive logistical breakdown. 

CRITICAL RULES:
1. ADVERTISEMENT FOCUS: Pay special attention to "Hero" products, brand-specific props, and agency notes. If a specific brand product or packaging is mentioned, extract it meticulously. 
2. BE LITERAL: Do not assume or invent props, wardrobe, or vehicles that are not explicitly written on the page or physically required by the literal action.
3. SLUGLINE PARSING (MANDATORY): You must extract the Setting, Location, and Time of Day from the scene headings. 
   - Example Heading: "EXT. DOWNTOWN COFFEE SHOP - MAGIC HOUR"
   - Result -> Setting: "EXT", Location: "Downtown Coffee Shop", TimeOfDay: "MAGIC HOUR".
4. BACKGROUND CAST: Group non-speaking background actors under "Cast" with the prefix "[BG]" (e.g., "[BG] Pedestrians").
5. ACCURACY: If a category has no items in a scene, omit the items rather than hallucinating them.
6. Do NOT output duplicate assets within the same scene. If a prop or cast appears multiple times in the script, list it exactly once. Aggregate all identical items.

Return ONLY a raw, valid JSON object matching this exact structure:

{
  "title": "Project Name (infer if not explicit, otherwise 'Unknown')",
  "agency": "Agency Name (if found, otherwise 'Unknown')",
  "scenes": [
    {
      "id": "scene-1",
      "sceneNumber": "1",
      "setting": "INT or EXT",
      "location": "Specific location from the slugline",
      "timeOfDay": "DAY, NIGHT, etc.",
      "actionSummary": "One concise sentence describing the literal action.",
      "assets": [
        {
          "category": "Cast | Prop | Wardrobe | Camera | Vehicle",
          "description": "Specific item name",
          "quantity": 1
        }
      ]
    }
  ]
}

ACTUAL SCRIPT TO BREAK DOWN:
`;

export async function POST(request: Request) {
  try {
    const { scriptText } = await request.json();
    if (!scriptText) return NextResponse.json({ error: "No script provided" }, { status: 400 });

    const prompt = `${SYSTEM_PROMPT}\n\n=== SCRIPT ===\n${scriptText}`;
    
    // --- THE RETRY ENGINE ---
    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${SYSTEM_PROMPT}\n\n${scriptText}`,
            config: { 
              responseMimeType: "application/json",
              temperature: 0.1,  }
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