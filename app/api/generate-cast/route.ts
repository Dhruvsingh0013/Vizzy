import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { Character, GenerateCastResponse } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, storyline, storyType, colorEmphasis } = body;

    if (!storyline || typeof storyline !== "string" || !storyline.trim()) {
      return NextResponse.json(
        { success: false, error: "Storyline or premise is required." },
        { status: 400 }
      );
    }

    const storyTitle = typeof title === "string" && title.trim() ? title.trim().slice(0, 120) : "Untitled Story";
    const trimmedStoryline = storyline.trim().slice(0, 6000);
    const genre = typeof storyType === "string" && storyType.trim() ? storyType.trim().slice(0, 80) : "Graphic Novel";
    const palette = typeof colorEmphasis === "string" && colorEmphasis.trim() ? colorEmphasis.trim().slice(0, 80) : "Vibrant Dramatic Contrast";

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are a master casting director and storyboard artist for graphic novels.
Analyze the following story premise and extract or develop 2 to 4 distinct key characters who inhabit this storyline.

Story Title: "${storyTitle}"
Genre / Format: ${genre}
Aesthetic Palette: ${palette}
Storyline / Premise:
"""
${trimmedStoryline}
"""

Return a strict JSON object (no markdown formatting, no code fences, only valid raw JSON) with this exact schema:
{
  "characters": [
    {
      "name": "Character Name",
      "role": "Protagonist" | "Supporting Character" | "Antagonist" | "Side Character",
      "description": "Concrete visual description including approximate age, facial features, hair, physique, clothing/costume, distinctive props, and overall demeanor."
    }
  ],
  "openingSceneBeat": {
    "title": "Short title for the opening panel (e.g. Infiltration at Midnight)",
    "description": "Concrete visual action description for the first visual panel",
    "caption": "1-2 sentence dramatic narrative caption introducing the scene",
    "dialogue": "Spoken line of dialogue if applicable"
  }
}

Guidelines:
- Return between 2 and 4 characters maximum.
- Make descriptions vivid and visually specific so an illustrator/image generator can draw them consistently.
- Match the visual attire and mood to the genre (${genre}).`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        const rawText = response.text || "";
        const cleanedJson = rawText.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedJson);

        if (parsed && Array.isArray(parsed.characters) && parsed.characters.length > 0) {
          const characters: Character[] = parsed.characters.slice(0, 4).map((c: { name?: unknown; role?: unknown; description?: unknown }, idx: number) => ({
            id: `char_${Date.now()}_${idx + 1}`,
            name: typeof c.name === "string" && c.name.trim() ? c.name.trim().slice(0, 80) : `Character ${idx + 1}`,
            role: typeof c.role === "string" && c.role.trim() ? c.role.trim().slice(0, 50) : (idx === 0 ? "Protagonist" : "Supporting Character"),
            description: typeof c.description === "string" && c.description.trim() ? c.description.trim().slice(0, 800) : "A key character in the story.",
          }));

          const openingBeat = parsed.openingSceneBeat && typeof parsed.openingSceneBeat === "object" ? {
            title: typeof parsed.openingSceneBeat.title === "string" ? parsed.openingSceneBeat.title.slice(0, 100) : "Opening Scene",
            description: typeof parsed.openingSceneBeat.description === "string" ? parsed.openingSceneBeat.description.slice(0, 400) : "The journey begins.",
            caption: typeof parsed.openingSceneBeat.caption === "string" ? parsed.openingSceneBeat.caption.slice(0, 200) : "The story unfolds.",
            dialogue: typeof parsed.openingSceneBeat.dialogue === "string" ? parsed.openingSceneBeat.dialogue.slice(0, 160) : undefined,
          } : undefined;

          const res: GenerateCastResponse = {
            success: true,
            characters,
            openingSceneBeat: openingBeat,
            parsedBy: "gemini",
          };

          return NextResponse.json(res);
        }
      } catch (geminiError) {
        console.warn("Gemini cast generation fallback to heuristic:", geminiError instanceof Error ? geminiError.message : "");
      }
    }

    // Heuristic fallback
    const { characters, openingSceneBeat } = fallbackHeuristicCast(storyTitle, trimmedStoryline, genre);

    const fallbackRes: GenerateCastResponse = {
      success: true,
      characters,
      openingSceneBeat,
      parsedBy: "heuristic",
    };

    return NextResponse.json(fallbackRes);
  } catch (error) {
    console.error("Generate cast route error:", error instanceof Error ? error.message : "");
    return NextResponse.json(
      { success: false, error: "Failed to generate characters for this storyline." },
      { status: 500 }
    );
  }
}

function fallbackHeuristicCast(title: string, storyline: string, genre: string) {
  // Extract potential proper nouns or characters mentioned in text
  const words = storyline.split(/\s+/);
  const detectedNames: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i].replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    if (/^[A-Z][a-z]{2,15}$/.test(w) && !["The", "When", "Then", "After", "Before", "While", "There", "Here", "With", "From", "Into", "Over", "Under"].includes(w)) {
      if (!detectedNames.includes(w)) {
        detectedNames.push(w);
      }
    }
  }

  const primaryName = detectedNames[0] || "Alex";
  const secondaryName = detectedNames[1] || "Morgan";

  const char1Role = "Protagonist";
  let char1Desc = `The lead figure in "${title}". Focused and determined, wearing practical attire suited for a ${genre} narrative.`;
  const char2Role = "Supporting Character";
  let char2Desc = `An essential ally in the journey. Resourceful and observant, complementing the team with specialized knowledge.`;

  if (/cyberpunk|future|neon|sci-fi/i.test(`${genre} ${storyline}`)) {
    char1Desc = `A weathered operative with subtle cybernetic ocular augments, tactical dark trench coat, and neon fiber trim.`;
    char2Desc = `A nimble tech specialist with diagnostic datapad, street-smart posture, and customized reinforced flight jacket.`;
  } else if (/war|military|battle|normandy|soldier/i.test(`${genre} ${storyline}`)) {
    char1Desc = `A battle-hardened squad leader with scuffed steel helmet, field webbing, grease-stained fatigues, and focused gaze.`;
    char2Desc = `A dependable field radio scout with binoculars, canteen harness, and alert, scanning expression.`;
  } else if (/noir|detective|mystery|crime/i.test(`${genre} ${storyline}`)) {
    char1Desc = `A sharp-eyed private investigator in a rumpled wool coat, loosened tie, and fedora casting a deep facial shadow.`;
    char2Desc = `An enigmatic contact with vintage leather gloves, cigarette smoke trail, and calculating, discreet posture.`;
  }

  const characters: Character[] = [
    {
      id: `char_${Date.now()}_1`,
      name: primaryName,
      role: char1Role,
      description: char1Desc,
    },
    {
      id: `char_${Date.now()}_2`,
      name: secondaryName,
      role: char2Role,
      description: char2Desc,
    },
  ];

  const openingSceneBeat = {
    title: `Arrival at the Threshold`,
    description: `Opening wide shot establishing the visual environment of "${title}". ${primaryName} approaches the scene as the narrative begins.`,
    caption: `The stage was set. Every choice from this moment forward would shape what followed.`,
    dialogue: `Let's see what we're up against.`,
  };

  return { characters, openingSceneBeat };
}
