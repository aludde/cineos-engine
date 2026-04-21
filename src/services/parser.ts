import { Project, Scene } from '../types/production';

/**
 * THE SYSTEM PROMPT
 * This is the secret sauce. This strict prompt forces the AI to ignore fluff 
 * and only extract actionable, budgetable items in an exact JSON format.
 */
const PARSER_SYSTEM_PROMPT = `
You are an expert Line Producer working in the Indian Ad Film industry. 
Your job is to read a raw A/V Script or Director's Treatment and extract a strict logistical breakdown.

You must return ONLY a raw, valid JSON object. No markdown formatting, no introduction, no explanation.

Extract the data into this exact JSON structure:
{
  "title": "Project Name (infer if not explicit)",
  "agency": "Agency Name (if found)",
  "scenes": [
    {
      "id": "scene-1",
      "sceneNumber": "1",
      "setting": "INT or EXT",
      "location": "Brief location name (e.g., 'Modern Cafe')",
      "timeOfDay": "DAY, NIGHT, or MAGIC HOUR",
      "actionSummary": "1 sentence describing what happens.",
      "assets": [
        {
          "id": "asset-1",
          "category": "Cast | Prop | Wardrobe | Camera | Vehicle | Location",
          "description": "Specific item (e.g., 'Lead Actor', 'Vintage Bullet', 'Red Helmet')",
          "quantity": 1
        }
      ]
    }
  ]
}

Rules for Extraction:
1. Ignore camera angles (e.g., "Close up", "Wide shot") unless they require specific gear (e.g., "Drone", "Jimmy Jib").
2. Group all actors into the "Cast" category.
3. If an item appears in multiple scenes, extract it again for that specific scene.
4. Keep action summaries under 15 words.
`;

/**
 * THE EXTRACTION FUNCTION
 * In production, this text string will be sent to an OpenAI or Gemini API route.
 */
export async function extractScriptData(rawText: string): Promise<Project | null> {
  try {
    console.log("Engaging AI Parser...");
    
    // TODO: In the next step, we will wire this up to an actual LLM API call.
    // For now, we simulate the AI reading the text and returning the parsed JSON.
    
    // const response = await callLLM(PARSER_SYSTEM_PROMPT, rawText);
    // return JSON.parse(response);

    return null; 
  } catch (error) {
    console.error("Parser Engine Failure:", error);
    return null;
  }
}