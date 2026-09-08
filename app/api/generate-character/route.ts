import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Character name is required." },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "Character visual description is required." },
        { status: 400 }
      );
    }

    if (name.length > 100 || description.length > 1000) {
      return NextResponse.json(
        { error: "Name or description exceeds maximum length limits." },
        { status: 400 }
      );
    }

    const safeRole = typeof role === "string" ? role.slice(0, 100) : "Protagonist";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in server environment." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Create a character reference portrait for a visual storytelling project.

Character name: ${name.trim()}
Role: ${safeRole.trim()}

Character description:
${description.trim()}

Create a polished, cinematic character portrait.

Important guidelines:
- Keep the character visually distinctive.
- Clearly show their face and important appearance details.
- Use consistent clothing and hairstyle based on the description.
- Neutral or subtle background.
- Clean art with no text, captions, logos, or typography.
- This character reference description will be used across story scenes to encourage visual consistency.
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
        { error: "Gemini did not return image data." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${interaction.output_image.data}`,
    });
  } catch (error) {
    console.error("Character generation route error:", error instanceof Error ? error.message : "Unknown error");

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
