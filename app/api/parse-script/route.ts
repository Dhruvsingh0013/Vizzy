import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { ScriptParsedBeat } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scriptText } = body;

    if (!scriptText || typeof scriptText !== "string" || !scriptText.trim()) {
      return NextResponse.json(
        { success: false, error: "Script text is required." },
        { status: 400 }
      );
    }

    const trimmed = scriptText.trim().slice(0, 8000);
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Analyze this screenplay / story outline text and break it down into sequential visual scene beats for a graphic novel or storyboard.

Script Text:
"""
${trimmed}
"""

Return a strict JSON array of objects (no markdown, no backticks, just valid JSON array). Each object must have:
- "title": Short scene title (e.g. "Approach to Omaha")
- "description": Concrete visual description for illustration (composition, key subjects, action, lighting)
- "caption": 1-2 sentence narrative caption
- "dialogue": Spoken dialogue line if any in the scene (or empty string if none)
- "camera": Suggested framing (e.g. "Wide establishing shot", "Low-angle action", "Medium close-up")
- "mood": Visual atmosphere (e.g. "Cold, fog, intense tension")
- "location": Setting name (e.g. "Normandy Beach")`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        const rawText = response.text || "";
        const cleanedJson = rawText.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedJson);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const beats: ScriptParsedBeat[] = parsed.slice(0, 10).map((item, idx) => ({
            title: typeof item.title === "string" ? item.title.slice(0, 100) : `Scene ${idx + 1}`,
            description: typeof item.description === "string" ? item.description.slice(0, 500) : `Scene ${idx + 1} action`,
            caption: typeof item.caption === "string" ? item.caption.slice(0, 200) : undefined,
            dialogue: typeof item.dialogue === "string" && item.dialogue.trim() ? item.dialogue.slice(0, 200) : undefined,
            camera: typeof item.camera === "string" ? item.camera.slice(0, 100) : undefined,
            mood: typeof item.mood === "string" ? item.mood.slice(0, 100) : undefined,
            location: typeof item.location === "string" ? item.location.slice(0, 100) : undefined,
          }));

          return NextResponse.json({
            success: true,
            beats,
            parsedBy: "gemini",
          });
        }
      } catch (geminiError) {
        console.warn("Gemini script analysis fallback to basic parser:", geminiError instanceof Error ? geminiError.message : "");
      }
    }

    // Heuristic fallback scene splitting
    const beats = fallbackHeuristicParse(trimmed);

    return NextResponse.json({
      success: true,
      beats,
      parsedBy: "heuristic",
    });
  } catch (error) {
    console.error("Script parse route error:", error instanceof Error ? error.message : "");
    return NextResponse.json(
      { success: false, error: "Failed to parse script text." },
      { status: 500 }
    );
  }
}

function fallbackHeuristicParse(text: string): ScriptParsedBeat[] {
  const segments = text
    .split(/(?:SCENE \d+:?|\n\n|\d+\.\s+)/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const rawBeats = segments.length > 0 ? segments : [text];

  return rawBeats.slice(0, 10).map((segment, idx) => {
    const lines = segment.split("\n").map((l) => l.trim()).filter(Boolean);
    const title = lines[0]?.slice(0, 60) || `Scene ${idx + 1}`;
    const dialogueMatch = segment.match(/["'](.*?)["']/);

    return {
      title,
      description: segment,
      caption: lines.length > 1 ? lines[1].slice(0, 160) : segment.slice(0, 120),
      dialogue: dialogueMatch ? dialogueMatch[1].slice(0, 160) : undefined,
      camera: "Cinematic medium framing",
      mood: "Dramatic tension",
    };
  });
}
