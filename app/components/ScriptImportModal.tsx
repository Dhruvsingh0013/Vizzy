"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { SlidePanel, ParseScriptResponse } from "@/types";
import { postJson } from "@/lib/api";

interface ScriptImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (parsedPanels: SlidePanel[]) => void;
}

export default function ScriptImportModal({
  isOpen,
  onClose,
  onImport,
}: ScriptImportModalProps) {
  const [scriptText, setScriptText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParseScript = async () => {
    if (!scriptText.trim()) return;

    setIsParsing(true);
    setParseError(null);

    try {
      const data = await postJson<ParseScriptResponse>("/api/parse-script", {
        scriptText,
      });

      if (!data.beats || data.beats.length === 0) {
        throw new Error("No dramatic scene beats could be extracted.");
      }

      const timestamp = Date.now();
      const parsed: SlidePanel[] = data.beats.map((beat, idx) => ({
        id: `panel_import_${timestamp}_${idx}`,
        title: beat.title || `Panel ${idx + 1}`,
        description: beat.description,
        caption: beat.caption || beat.description.slice(0, 120),
        dialogue: beat.dialogue || undefined,
        source: "development-fallback",
        image: generateImportedSvg(beat.title, idx + 1),
      }));

      onImport(parsed);
      onClose();
    } catch (e) {
      console.warn("Script parsing warning:", e instanceof Error ? e.message : "");
      setParseError(e instanceof Error ? e.message : "Failed to parse script text. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const loadExampleScript = () => {
    setScriptText(`SCENE 1: APPROACH TO OMAHA
Landing craft slicing through dark Atlantic waves under dense dawn fog. Soldiers clutching rifles in heavy rain. Captain Miller looks through binoculars at the distant bluffs. "Keep low and don't stop until you reach the shingle!"

SCENE 2: THE RAMP DROPS
The heavy iron ramp splashes into churning sea foam. Intense tracer fire zips across the surface. Soldiers charge into waist-deep ocean water carrying gear and Bangalore torpedoes.

SCENE 3: AT THE SEA WALL
Pinned beneath the gravel embankment under mortar fire. Private Jackson spots an enemy machine gun bunker up on the cliff. Smoke grenades provide cover as the squad regroup. "Jackson, take out that gun nest!"

SCENE 4: SCALING POINTE DU HOC
Rangers firing grappling hooks up the 100-foot vertical limestone cliffs. Soldiers pulling themselves up ropes through artillery smoke to neutralize the heavy artillery battery.`);
    setParseError(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#100e1a] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4 text-white"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                <FileText size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Import Script / Story Notes</h3>
                <p className="text-[10px] text-zinc-400">
                  Parses scene beats, character dialogues, and camera cues into ordered panels
                </p>
              </div>
            </div>

            <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-300">
                Raw Script / Story Outline
              </span>
              <button
                type="button"
                onClick={loadExampleScript}
                className="text-[11px] text-purple-400 hover:text-purple-300 underline font-bold cursor-pointer"
              >
                Load D-Day Sample Script
              </button>
            </div>

            <textarea
              rows={8}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder={`Paste script or scene notes here...\n\nExample:\nSCENE 1: THE APPROACH\nCaptain Miller stands at the bow of the Higgins boat, dawn fog settling over the water. "Check your ammo!"\n\nSCENE 2: UNDER FIRE\nMortars explode along the waterline as the ramp falls.`}
              className="w-full rounded-xl bg-black/40 border border-white/10 p-3.5 text-xs text-zinc-200 placeholder-zinc-500 font-mono outline-none focus:border-purple-500/50 transition resize-none leading-relaxed"
            />

            {parseError && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                <AlertCircle size={14} className="shrink-0" />
                <span>{parseError}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-[10px] text-zinc-400 font-mono">
              Creates placeholder panels ready for AI image generation
            </span>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleParseScript}
                disabled={!scriptText.trim() || isParsing}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-xs font-bold transition shadow-lg cursor-pointer"
              >
                {isParsing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Analyzing Script...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Parse Into Story Panels
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function generateImportedSvg(title: string, index: number): string {
  const colors = ["#090617", "#140a0a", "#05131a", "#140c04"];
  const color = colors[(index - 1) % colors.length];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="imp_sky_${index}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" />
          <stop offset="65%" stop-color="#120e24" />
          <stop offset="100%" stop-color="#05040a" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#imp_sky_${index})" />
      <rect y="560" width="1600" height="340" fill="#040308" />
      <circle cx="800" cy="480" r="35" fill="#120f26" />
      
      <rect x="60" y="60" width="460" height="36" rx="8" fill="#000000" fill-opacity="0.8" stroke="#a78bfa" stroke-width="1.5" />
      <text x="80" y="83" fill="#c4b5fd" font-family="sans-serif" font-size="13" font-weight="bold">
        SCRIPT BEAT 0${index} • DEVELOPMENT PREVIEW
      </text>

      <text x="80" y="780" fill="#ffffff" font-family="sans-serif" font-size="36" font-weight="bold">${title}</text>
      <text x="80" y="830" fill="#a78bfa" font-family="sans-serif" font-size="16">READY FOR CANDIDATE SCENE GENERATION IN CHAT</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
