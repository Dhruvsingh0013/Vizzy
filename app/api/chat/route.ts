import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { ProjectData } from "@/types";

interface ChatRequestMessage {
  role: string;
  content: string;
}

export async function POST(request: Request) {
  let mode = "setup";
  let messages: ChatRequestMessage[] = [];
  let project: ProjectData = {
    title: "Untitled Story",
    storyType: "Graphic Novel",
    idea: "",
  };
  let currentPanelIndex = 0;

  try {
    const body = await request.json();
    messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
    project = body.project || project;
    mode = typeof body.mode === "string" ? body.mode : "setup";
    currentPanelIndex = typeof body.currentPanelIndex === "number" ? body.currentPanelIndex : 0;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        reply: getFallbackReply(mode, messages, project, currentPanelIndex),
        source: "fallback",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are Vizzy, an AI Creative Director & Visual Storyteller.
Your job is to direct and develop a visual book, graphic novel, or storyboard with the user.

Current Story Bible:
- Title: ${project.title || "Untitled Story"}
- Format: ${project.storyType || "Graphic Novel"}
- World / Setting: ${project.world || "Unspecified"}
- Tone: ${project.tone || "Cinematic"}
- Color Palette: ${project.colorEmphasis || "Custom Palette"}
- Premise / Script Notes: ${project.idea || "None provided yet"}

Mode: ${mode}
Current Panel Index: ${currentPanelIndex}

Guidelines:
1. Speak as Vizzy: inspiring, structured, concise, and visually evocative.
2. In 'setup' mode: Ask 1 or 2 targeted questions to nail down aesthetic style, character focus, or atmospheric lighting.
3. In 'panel' mode: Propose a specific visual composition with camera angle, key lighting, caption, and dialogue.
4. Keep replies formatted with clean markdown bullet points.`;

    const formattedHistory = messages
      .map((m) => `${m.role.toUpperCase()}: ${String(m.content).slice(0, 1000)}`)
      .join("\n");

    const fullPrompt = `${systemPrompt}\n\nUser Dialogue History:\n${formattedHistory}\n\nVIZZY:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    const replyText = response.text || getFallbackReply(mode, messages, project, currentPanelIndex);

    return NextResponse.json({
      reply: replyText,
      source: "gemini",
    });
  } catch (error) {
    console.warn("Chat API error, using structured director fallback:", error instanceof Error ? error.message : "");
    return NextResponse.json({
      reply: getFallbackReply(mode, messages, project, currentPanelIndex),
      source: "fallback",
    });
  }
}

function getFallbackReply(
  mode: string,
  messages: ChatRequestMessage[],
  project: ProjectData,
  currentPanelIndex?: number
): string {
  const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";

  if (mode === "setup" || lastUserMsg.includes("d-day") || lastUserMsg.includes("ww2") || lastUserMsg.includes("world war")) {
    return `Welcome to **Vizzy Studio**! I am your AI Creative Director for **"${project.title || "The Longest Morning"}"**.

For a World War II D-Day graphic novel, I recommend high-contrast visuals with **muted olive drab, stormy ocean slate, and stark fiery ember accents**.

To lock down our visual language:
1. **Pacing & Framing**: Should we open inside the claustrophobic landing craft, or showcase the vast armada stretching to the horizon?
2. **Character Focus**: Shall we anchor the scene to a specific protagonist (e.g. Captain Miller) to maintain continuity?

Tell me what you'd like to visualize next, or choose a prompt chip below!`;
  }

  const panelNum = (currentPanelIndex ?? 0) + 1;
  return `Here is my creative direction for **Panel ${panelNum}**:

- 📷 **Camera**: Low-angle wide shot looking past the soldiers as the steel ramp drops into foaming surf.
- 🎨 **Lighting & Mood**: Cold dawn fog breaking through coastal artillery smoke; intense motion.
- 💬 **Caption**: *"0630 Hours. The cold Atlantic was deafening under relentless fire."*
- 🗣️ **Dialogue**: *"Keep low! Don't bunch up on the beach!"*

Would you like to generate visual framing candidates for this scene now?`;
}
