import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { Character, PanelCandidate } from "@/types";

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
    const {
      prompt,
      sceneId,
      sceneTitle,
      characters,
      colorEmphasis,
      style,
      refinementPrompt,
      baseDescription,
    } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: "Scene prompt is required." },
        { status: 400 }
      );
    }

    if (prompt.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Prompt exceeds maximum allowed length (2000 characters)." },
        { status: 400 }
      );
    }

    const safeTitle = typeof sceneTitle === "string" ? sceneTitle.slice(0, 200) : "Scene";
    const safeStyle = typeof style === "string" ? style.slice(0, 100) : "Graphic Novel";
    const safeColor = typeof colorEmphasis === "string" ? colorEmphasis.slice(0, 200) : "Muted tones";

    // Build character context for visual consistency
    let characterContext = "";
    if (Array.isArray(characters) && characters.length > 0) {
      const charDescriptions = (characters as Character[])
        .slice(0, 6)
        .filter((c) => c && c.name)
        .map((c) => `${c.name} (${c.role}): ${c.description || "Distinctive appearance"}`)
        .join("; ");
      if (charDescriptions) {
        characterContext = ` Key character reference descriptions to incorporate for visual continuity: ${charDescriptions}.`;
      }
    }

    // Handle refinement
    let sceneDescription = prompt.trim();
    if (refinementPrompt && typeof refinementPrompt === "string") {
      const base = baseDescription || prompt;
      sceneDescription = `Refinement of previous scene [${base.slice(0, 400)}]. Modification: ${refinementPrompt.slice(0, 500)}. Maintain visual style, character identities, and key lighting while applying the requested change.`;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const options: PanelCandidate[] = [];

    const angleConfigs = [
      {
        label: "Option 1 (Wide Framing)",
        anglePrompt: "Wide dramatic establishing angle, atmospheric depth, cinematic perspective",
        desc: "Wide establishing angle with atmospheric depth and environmental framing",
        caption: `${safeTitle}: Establishing wide shot capturing atmospheric depth.`,
        dialogue: "Look at the horizon. Stay in formation.",
      },
      {
        label: "Option 2 (Dynamic Action)",
        anglePrompt: "Dynamic low-angle action composition, high tension and motion blur",
        desc: "Low angle, intense high-contrast action composition",
        caption: `${safeTitle}: Tension rises as the action surges forward.`,
        dialogue: "Move now! Keep low and press forward!",
      },
      {
        label: "Option 3 (Intimate Perspective)",
        anglePrompt: "Cinematic medium close-up, dramatic character presence, intense emotional focus",
        desc: "Medium close-up focusing on character emotion and immediate presence",
        caption: `${safeTitle}: Focused perspective highlighting the human tension.`,
        dialogue: "Steady now... this is the moment.",
      },
    ];

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const results = await Promise.allSettled(
          angleConfigs.map(async (cfg, index) => {
            const fullPrompt = `${sceneDescription}.${characterContext} Visual Style: ${safeStyle}. Color accents: ${safeColor}. Camera framing: ${cfg.anglePrompt}. High quality graphic novel illustration. Clean rendering without watermarks, text, or letters.`;

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
                label: cfg.label,
                description: `${cfg.desc} — ${sceneDescription.slice(0, 120)}`,
                source: "gemini" as const,
                caption: cfg.caption,
                dialogue: cfg.dialogue,
              };
            }
            return null;
          })
        );

        results.forEach((res) => {
          if (res.status === "fulfilled" && res.value) {
            options.push(res.value);
          }
        });
      } catch (geminiError) {
        console.warn("Gemini Image API unavailable or rate-limited. Falling back to development preview.", geminiError instanceof Error ? geminiError.message : "");
      }
    }

    const source: "gemini" | "development-fallback" =
      options.length > 0 ? "gemini" : "development-fallback";

    // If Gemini returned no options or key was absent, use development fallback previews
    if (options.length === 0) {
      const colorSchemes = [
        { sky: "#090617", accent: "#9b6cff" },
        { sky: "#180a0a", accent: "#ef4444" },
        { sky: "#041416", accent: "#06b6d4" },
      ];

      angleConfigs.forEach((cfg, idx) => {
        options.push({
          id: `opt_${idx + 1}`,
          image: generateSvgScene(
            safeTitle,
            sceneDescription,
            idx + 1,
            colorSchemes[idx].sky,
            colorSchemes[idx].accent
          ),
          label: `${cfg.label} [Dev Preview]`,
          description: `${cfg.desc} (Development preview — AI image generation unavailable)`,
          source: "development-fallback",
          caption: cfg.caption,
          dialogue: cfg.dialogue,
        });
      });
    }

    return NextResponse.json({
      success: true,
      sceneId,
      options,
      image: options[0].image,
      source,
      message:
        source === "gemini"
          ? "Scene candidate options generated successfully via Gemini."
          : "Development Preview — AI image generation unavailable. Showing structured preview frames.",
    });
  } catch (error) {
    console.error("Scene generation route error:", error instanceof Error ? error.message : "Unknown error");
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

      <!-- Silhouettes -->
      <g fill="#07060c">
        <circle cx="${650 + variant * 30}" cy="540" r="32" />
        <path d="M${610 + variant * 30} 580 Q${650 + variant * 30} 550 ${690 + variant * 30} 580 L710 740 L590 740 Z" />
        <circle cx="${880 - variant * 20}" cy="560" r="28" />
        <path d="M${845 - variant * 20} 600 Q${880 - variant * 20} 575 ${915 - variant * 20} 600 L935 730 L825 730 Z" />
      </g>

      <!-- Panel Frame & Explicit Dev Preview Badge -->
      <rect x="30" y="30" width="1540" height="840" fill="none" stroke="${accentColor}" stroke-opacity="0.3" stroke-width="4" rx="16" />
      
      <!-- Prominent, Honest Development Preview Label -->
      <rect x="60" y="60" width="520" height="40" rx="8" fill="#000000" fill-opacity="0.88" stroke="#eab308" stroke-width="1.5" />
      <text x="80" y="85" fill="#facc15" font-family="sans-serif" font-size="14" font-weight="bold">
        DEVELOPMENT PREVIEW — AI image generation unavailable
      </text>

      <rect x="60" y="110" width="160" height="28" rx="6" fill="#000000" fill-opacity="0.75" />
      <text x="75" y="129" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">
        OPTION 0${variant} PREVIEW
      </text>

      <text x="80" y="760" fill="#ffffff" font-family="sans-serif" font-size="36" font-weight="bold">${title}</text>
      <text x="80" y="810" fill="#ffffff" fill-opacity="0.6" font-family="sans-serif" font-size="18">${promptPreview}...</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
