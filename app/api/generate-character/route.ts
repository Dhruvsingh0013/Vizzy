import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, role, description } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: "Character name and description are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const prompt = `
Create a character reference portrait for a visual storytelling project.

Character name: ${name}
Role: ${role}

Character description:
${description}

Create a polished, cinematic character portrait.

Important:
- Keep the character visually distinctive.
- Clearly show their face and important appearance details.
- Use consistent clothing and hairstyle based on the description.
- Neutral or subtle background.
- No text, captions, logos, or typography.
- This is a character reference image that will later be used
  to keep the character visually consistent across story scenes.
`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-image",
      input: prompt,
      response_format: {
        type: "image",
        aspect_ratio: "3:4",
        image_size: "1K",
      },
    });

    if (!interaction.output_image?.data) {
      return NextResponse.json(
        { error: "Gemini did not return an image." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image: `data:image/png;base64,${interaction.output_image.data}`,
    });
  } catch (error) {
    console.error("Character generation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate character.",
      },
      { status: 500 }
    );
  }
}