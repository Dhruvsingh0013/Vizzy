"use client";

import { AnimatePresence } from "framer-motion";
import { X, Printer, BookOpen } from "lucide-react";
import { SlidePanel } from "@/types";

interface GraphicNovelSpreadProps {
  isOpen: boolean;
  onClose: () => void;
  storyTitle: string;
  storyType?: string;
  storyStyle?: string;
  worldSetting?: string;
  panels: SlidePanel[];
}

export default function GraphicNovelSpreadModal({
  isOpen,
  onClose,
  storyTitle,
  storyType,
  storyStyle,
  worldSetting,
  panels,
}: GraphicNovelSpreadProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const effectiveType = storyType || storyStyle || "Graphic Novel";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col justify-between overflow-y-auto print:bg-white print:text-black print:overflow-visible">
        {/* HEADER BAR (Hidden on print) */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#0a0814]/90 border-b border-white/10 backdrop-blur-md print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-lg">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">{storyTitle}</h2>
              <p className="text-[10px] text-purple-300 font-mono uppercase tracking-wider">
                {effectiveType} • PRINTABLE GRAPHIC NOVEL LAYOUT ({panels.length} PANELS)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
            >
              <Printer size={14} /> Print / Save as PDF
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full border border-white/10 bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE COMIC BOOK SPREAD CONTAINER */}
        <div className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full print:p-0 print:max-w-none print:w-full">
          <div className="bg-[#0f0d1a] border-2 border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl print:border-none print:shadow-none print:bg-white print:p-0">
            
            {/* SPREAD TITLE HEADER */}
            <div className="text-center border-b-2 border-white/10 pb-8 mb-10 print:border-black print:pb-4 print:mb-6">
              <span className="text-xs font-mono font-bold tracking-[0.3em] text-purple-400 uppercase print:text-black">
                VIZZY VISUAL CHRONICLES
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase mt-2 text-white print:text-black">
                {storyTitle}
              </h1>
              {worldSetting && (
                <p className="text-sm text-zinc-400 italic mt-2 print:text-zinc-600">
                  Setting: {worldSetting}
                </p>
              )}
            </div>

            {/* SEQUENTIAL PANELS GRID (Classic 2-column comic layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-6 print:block">
              {panels.map((panel, idx) => (
                <div
                  key={panel.id || idx}
                  className="rounded-2xl border-2 border-white/15 bg-black/50 overflow-hidden flex flex-col justify-between shadow-xl print:border-black print:bg-white print:mb-6 print:break-inside-avoid print:page-break-inside-avoid"
                  style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                >
                  {/* Aspect-Ratio Panel Frame */}
                  <div className="aspect-[16/10] relative overflow-hidden bg-zinc-950 print:bg-zinc-100">
                    {panel.image && (
                      <img
                        src={panel.image}
                        alt={`Generated artwork for ${panel.title || `Panel ${idx + 1}`}`}
                        className="w-full h-full object-cover print:max-h-[350px]"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                        }}
                      />
                    )}

                    {/* Speech Bubble Overlay if present */}
                    {panel.dialogue && (
                      <div className="speech-bubble absolute top-4 right-4 text-xs max-w-[170px] shadow-lg print:border-black print:bg-white">
                        {panel.dialogue}
                      </div>
                    )}

                    {/* Panel index badge */}
                    <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/80 border border-white/20 text-[9px] font-mono font-bold text-white print:bg-black print:text-white">
                      PANEL {String(idx + 1).padStart(2, "0")}
                    </div>
                  </div>

                  {/* Panel Caption footer box */}
                  <div className="p-4 bg-zinc-900/90 border-t border-white/10 flex flex-col gap-1 print:bg-white print:border-black">
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wide print:text-black">
                      {panel.title}
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed print:text-zinc-800">
                      {panel.caption || panel.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* SPREAD FOOTER */}
            <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-500 font-mono print:border-black print:text-black">
              <span>CREATED WITH VIZZY • AI-POWERED STORYBOARD CREATOR</span>
              <span>STORYBOARD • {panels.length} {panels.length === 1 ? "PANEL" : "PANELS"}</span>
            </div>

          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
