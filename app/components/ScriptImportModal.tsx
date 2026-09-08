"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { SlidePanel } from "./SlideshowPlayer";

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

  if (!isOpen) return null;

  const handleParseScript = async () => {
    if (!scriptText.trim()) return;

    setIsParsing(true);

    try {
      // Split script text into scene segments (by numbered lines, 'SCENE', or double newlines)
      const segments = scriptText
        .split(/(?:SCENE \d+:?|\n\n|\d+\.\s+)/i)
        .map((s) => s.trim())
        .filter((s) => s.length > 15);

      const parsed: SlidePanel[] = (segments.length > 0 ? segments : [scriptText.trim()]).map(
        (segment, idx) => {
          const lines = segment.split("\n").map((l) => l.trim()).filter(Boolean);
          const title = lines[0]?.slice(0, 40) || `Scene ${idx + 1}`;
          const description = segment;
          const dialogueMatch = segment.match(/["'](.*?)["']/);
          const dialogue = dialogueMatch ? dialogueMatch[1] : undefined;

          return {
            id: `imported_panel_${Date.now()}_${idx}`,
            title: `Panel ${idx + 1}: ${title}`,
            description,
            caption: lines.length > 1 ? lines[1] : description.slice(0, 80),
            dialogue,
            image: generateImportedSvg(title, idx + 1),
          };
        }
      );

      onImport(parsed);
      onClose();
    } catch (e) {
      console.error(e);
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
                  Paste your full screenplay or scene notes to automatically create panels
                </p>
              </div>
            </div>

            <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
              <X size={18} />
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold text-purple-300 uppercase">
                Raw Script / Story Outline
              </label>
              <button
                type="button"
                onClick={loadExampleScript}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
              >
                Load D-Day Sample Script
              </button>
            </div>

            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder="Paste your screenplay, book chapters, or numbered scene notes here..."
              rows={8}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-[10px] text-zinc-500">
              Vizzy will extract characters, action, dialogue, and camera beats.
            </span>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleParseScript}
                disabled={!scriptText.trim() || isParsing}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg transition cursor-pointer"
              >
                {isParsing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Extracting Panels...
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
      <text x="80" y="780" fill="#ffffff" font-family="sans-serif" font-size="40" font-weight="bold">${title}</text>
      <text x="80" y="830" fill="#a78bfa" font-family="sans-serif" font-size="18">SCENE PANEL ${index} • READY FOR ART GENERATION</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
