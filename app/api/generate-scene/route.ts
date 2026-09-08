import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, sceneId, sceneTitle, characters, colorEmphasis, style } = body;

    if (!prompt?.trim()) {
      return NextResponse.json(
        { success: false, error: "Scene prompt is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    let options: Array<{ id: string; image: string; label: string; description: string }> = [];

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const angles = [
          "Wide dramatic shot, establishing shot with atmospheric lighting",
          "Low-angle action composition, high tension and motion",
          "Cinematic medium close-up, focusing on emotional details and depth",
        ];

        // Try generating with Gemini Image API
        const generatedImages = await Promise.allSettled(
          angles.slice(0, 2).map(async (angle, index) => {
            const fullPrompt = `${prompt}. Visual Style: ${style || "Graphic Novel"}. Color accents: ${
              colorEmphasis || "Muted sepia and slate"
            }. Camera framing: ${angle}. High quality graphic novel illustration. No watermarks or typography text.`;

            const interaction = await ai.interactions.create({
              model: "gemini-3.1-flash-image",
              input: fullPrompt,
              response_format: {
                type: "image",
                aspect_ratio: "16:9",
                image_size: "1K",
              },
            });

            if (interaction.output_image?.data) {
              return {
                id: `opt_${index + 1}`,
                image: `data:image/png;base64,${interaction.output_image.data}`,
                label: `Option ${index + 1} (${index === 0 ? "Wide Framing" : "Dynamic Angle"})`,
                description: angle,
              };
            }
            return null;
          })
        );

        generatedImages.forEach((result) => {
          if (result.status === "fulfilled" && result.value) {
            options.push(result.value);
          }
        });
      } catch (geminiError) {
        console.warn("Gemini Image API fallback triggered:", geminiError);
      }
    }

    // Fallback or SVG option generation if Gemini API is offline/rate-limited
    if (options.length === 0) {
      options = [
        {
          id: "opt_1",
          image: generateSvgScene(sceneTitle, prompt, 1, "#090617", "#9b6cff"),
          label: "Option 1 (Atmospheric Wide)",
          description: "Wide establishing angle with fog and atmospheric depth",
        },
        {
          id: "opt_2",
          image: generateSvgScene(sceneTitle, prompt, 2, "#180a0a", "#ef4444"),
          label: "Option 2 (Dynamic Action)",
          description: "Low angle, intense high-contrast cinematic framing",
        },
        {
          id: "opt_3",
          image: generateSvgScene(sceneTitle, prompt, 3, "#041416", "#06b6d4"),
          label: "Option 3 (Intimate Perspective)",
          description: "Focus on character positioning and mood lighting",
        },
      ];
    }

    return NextResponse.json({
      success: true,
      sceneId,
      options,
      image: options[0].image,
      message: "Scene candidate options generated successfully.",
    });
  } catch (error) {
    console.error("Scene generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate scene.",
      },
      { status: 500 }
    );
  }
}

function generateSvgScene(
  sceneTitle: string,
  prompt: string,
  variant: number,
  skyColor: string,
  accentColor: string
): string {
  const title = escapeXml(sceneTitle || `Panel Option ${variant}`);
  const promptPreview = escapeXml(prompt.replace(/\s+/g, " ").trim().slice(0, 100));

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="sky_${variant}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${skyColor}" />
          <stop offset="60%" stop-color="#120e24" />
          <stop offset="100%" stop-color="#05040a" />
        </linearGradient>
        <radialGradient id="glow_${variant}" cx="${variant === 2 ? "30%" : "50%"}" cy="40%" r="60%">
          <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.4" />
          <stop offset="100%" stop-color="${accentColor}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#sky_${variant})" />
      <ellipse cx="800" cy="400" rx="700" ry="350" fill="url(#glow_${variant})" />

      ${
        variant === 1
          ? `<path d="M0 520 L300 450 L600 530 L900 440 L1200 510 L1600 460 L1600 650 L0 650 Z" fill="#0c0916"/>`
          : variant === 2
          ? `<path d="M0 480 L400 550 L800 420 L1200 540 L1600 430 L1600 650 L0 650 Z" fill="#140606"/>`
          : `<path d="M0 550 L350 490 L750 540 L1150 480 L1600 530 L1600 650 L0 650 Z" fill="#041215"/>`
      }

      <rect y="600" width="1600" height="300" fill="#030307" />

      <!-- Character Silhouettes -->
      <g fill="#07060c">
        <circle cx="${650 + variant * 30}" cy="540" r="32" />
        <path d="M${610 + variant * 30} 580 Q${650 + variant * 30} 550 ${690 + variant * 30} 580 L710 740 L590 740 Z" />
        <circle cx="${880 - variant * 20}" cy="560" r="28" />
        <path d="M${845 - variant * 20} 600 Q${880 - variant * 20} 575 ${915 - variant * 20} 600 L935 730 L825 730 Z" />
      </g>

      <!-- Panel Frame & Overlay Badge -->
      <rect x="30" y="30" width="1540" height="840" fill="none" stroke="${accentColor}" stroke-opacity="0.3" stroke-width="4" rx="16" />
      
      <rect x="60" y="60" width="220" height="36" rx="8" fill="#000000" fill-opacity="0.75" />
      <text x="75" y="83" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold">
        OPTION 0${variant} • FRAME PREVIEW
      </text>

      <text x="80" y="760" fill="#ffffff" font-family="sans-serif" font-size="36" font-weight="bold">${title}</text>
      <text x="80" y="810" fill="#ffffff" fill-opacity="0.6" font-family="sans-serif" font-size="18">${promptPreview}...</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}