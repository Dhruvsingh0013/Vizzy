import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let mode = "setup";
  let messages: Array<{ role: string; content: string }> = [];
  let project: any = {};
  let currentPanelIndex = 0;

  try {
    const body = await request.json();
    messages = body.messages || [];
    project = body.project || {};
    mode = body.mode || "setup";
    currentPanelIndex = body.currentPanelIndex || 0;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        reply: getFallbackReply(mode, messages, project, currentPanelIndex),
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are Vizzy, an expert AI Creative Director & Visual Storyteller.
Your job is to collaborate with the user to create a stunning graphic novel, comic book, visual book, or cinematic storyboard.

Current Project Context:
- Title: ${project?.title || "Untitled Story"}
- Format: ${project?.storyType || "Graphic Novel"}
- World/Setting: ${project?.world || "Unspecified"}
- Overall Tone: ${project?.tone || "Cinematic"}
- Color Emphasis: ${project?.colorEmphasis || "Custom Palette"}
- Premise / Script Notes: ${project?.idea || "None provided yet"}

Mode: ${mode || "general"}
Current Panel Index: ${currentPanelIndex ?? 0}

Behavior Guidelines:
1. Always stay in persona as "Vizzy" — inspiring, concise, structured, and visually evocative.
2. In 'setup' mode: Ask 1 or 2 targeted questions to nail down details (visual aesthetic, lighting, character details, or color accents).
3. In 'panel' mode: Suggest the visual description for the panel, camera shot framing, and write punchy dialogue or narration caption.
4. Keep responses readable with bullet points and clear bold headings when recommending panel details.`;

    const formattedPrompt = `${systemPrompt}\n\nUser Message History:\n${messages
      .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n")}\n\nVIZZY:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedPrompt,
    });

    const replyText = response.text || getFallbackReply(mode, messages, project, currentPanelIndex);

    return NextResponse.json({
      reply: replyText,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({
      reply: getFallbackReply(mode, messages, project, currentPanelIndex),
    });
  }
}

function getFallbackReply(
  mode: string,
  messages: Array<{ role: string; content: string }>,
  project: any,
  currentPanelIndex?: number
): string {
  const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";

  if (mode === "setup" || lastUserMsg.includes("d-day") || lastUserMsg.includes("ww2") || lastUserMsg.includes("world war")) {
    return `Welcome to **Vizzy Studio**! I'm thrilled to collaborate on **"${project?.title || "The Longest Morning"}"**.

For a World War II D-Day graphic novel, I suggest a dramatic, high-contrast visual style with **muted olive drab, dark ocean slate, and stark fiery ember accents**.

To nail down our visual bible:
1. **Pacing & Tone**: Should we focus on the raw suspense of the landing craft approach, or the intense action atop the Normandy cliffs?
2. **Key Characters**: Shall we follow a brave squad leader (e.g. Captain Miller) or tell the story through multiple perspective vignettes?

Tell me your thoughts or paste any script notes!`;
  }

  const panelNum = (currentPanelIndex ?? 0) + 1;
  return `Here is my proposal for **Panel ${panelNum}**:

📷 **Camera**: Low-angle wide shot looking out from the landing craft ramp as it drops into Normandy surf.
🎨 **Lighting & Mood**: Cold dawn fog breaking through heavy smoke, water splashing with intense tension.
💬 **Caption**: *"0630 Hours. Normandy coast. The air tasted like sea salt, diesel, and raw adrenaline."*

Would you like to proceed with this visual composition, or adjust any details before we generate the candidate frames?`;
}
