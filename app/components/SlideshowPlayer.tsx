"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Volume2,
  VolumeX,
  Sliders,
} from "lucide-react";

export type SlidePanel = {
  id: string;
  title: string;
  description: string;
  image?: string;
  caption?: string;
  dialogue?: string;
};

interface SlideshowPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  storyTitle: string;
  storyStyle: string;
  panels: SlidePanel[];
}

export default function SlideshowPlayer({
  isOpen,
  onClose,
  storyTitle,
  storyStyle,
  panels,
}: SlideshowPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(3.5); // Seconds per slide
  const [isLooping, setIsLooping] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [kenBurnsEnabled, setKenBurnsEnabled] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesize subtle cinematic sound on slide change using Web Audio API
  const playSlideTransitionSound = () => {
    if (!soundEnabled) return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      // Atmospheric soft chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio context might be restricted
    }
  };

  // Auto-run loop timer
  useEffect(() => {
    if (!isOpen || !isPlaying || panels.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev >= panels.length - 1 ? (isLooping ? 0 : prev) : prev + 1;
        playSlideTransitionSound();
        return next;
      });
    }, speed * 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, speed, isLooping, panels.length, soundEnabled]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % panels.length);
        playSlideTransitionSound();
      }
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + panels.length) % panels.length);
        playSlideTransitionSound();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, panels.length, soundEnabled]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const currentPanel = panels[currentIndex] || panels[0];

  if (!isOpen || panels.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#05040a] flex flex-col justify-between select-none overflow-hidden"
      >
        {/* TOP BAR */}
        <div className="relative z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/90 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-lg">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">{storyTitle}</h2>
              <p className="text-[10px] text-purple-300 font-mono uppercase tracking-widest">
                {storyStyle} • AUTO-RUNNING SLIDESHOW LOOP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Speed toggle */}
            <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-xs border border-white/10">
              <span className="text-zinc-400 text-[10px] font-mono mr-1">SPEED:</span>
              {[2, 3.5, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    speed === s ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {s === 2 ? "FAST" : s === 3.5 ? "1X" : "SLOW"}
                </button>
              ))}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-full border transition cursor-pointer ${
                soundEnabled
                  ? "bg-purple-600/20 border-purple-500 text-purple-300"
                  : "bg-white/5 border-white/10 text-zinc-500"
              }`}
              title={soundEnabled ? "Mute Atmospheric Sound" : "Enable Atmospheric Sound"}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            {/* Ken Burns Pan/Zoom Toggle */}
            <button
              onClick={() => setKenBurnsEnabled(!kenBurnsEnabled)}
              className={`p-2 rounded-full border transition cursor-pointer ${
                kenBurnsEnabled
                  ? "bg-purple-600/20 border-purple-500 text-purple-300"
                  : "bg-white/5 border-white/10 text-zinc-500"
              }`}
              title="Toggle Ken Burns Movement"
            >
              <Sliders size={15} />
            </button>

            {/* Loop Toggle */}
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded-full border transition cursor-pointer ${
                isLooping
                  ? "bg-purple-600/20 border-purple-500 text-purple-300"
                  : "bg-white/5 border-white/10 text-zinc-400"
              }`}
              title="Continuous Loop"
            >
              <RotateCcw size={15} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full border border-white/10 bg-white/5 text-zinc-300 hover:text-white transition cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-full border border-white/10 bg-white/10 text-white hover:bg-white/20 transition ml-2 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MAIN SLIDE VIEW CANVAS */}
        <div className="relative flex-1 flex items-center justify-center p-6 md:p-12 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPanel.id || currentIndex}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="relative max-w-5xl w-full aspect-video rounded-2xl overflow-hidden border border-white/15 shadow-[0_0_90px_rgba(121,40,202,0.35)] bg-black flex items-center justify-center"
            >
              {/* Image with optional Ken Burns Zoom */}
              {currentPanel.image ? (
                <motion.img
                  src={currentPanel.image}
                  alt={currentPanel.title}
                  animate={
                    kenBurnsEnabled
                      ? {
                          scale: [1, 1.07, 1],
                          x: [0, -10, 0],
                        }
                      : { scale: 1, x: 0 }
                  }
                  transition={{
                    duration: speed * 1.2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-950/60 to-black text-zinc-400 p-8 text-center">
                  <Sparkles size={40} className="text-purple-400 mb-4 animate-pulse" />
                  <h3 className="text-xl font-bold text-white">{currentPanel.title}</h3>
                  <p className="text-sm text-zinc-400 max-w-md mt-2">{currentPanel.description}</p>
                </div>
              )}

              {/* OVERLAY: Comic Dialogue Speech Bubble */}
              {currentPanel.dialogue && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.25, type: "spring" }}
                  className="speech-bubble absolute top-8 right-8 z-30 shadow-2xl"
                >
                  {currentPanel.dialogue}
                </motion.div>
              )}

              {/* OVERLAY: Narrative Caption Box at Bottom */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/85 to-transparent z-20"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                    PANEL {String(currentIndex + 1).padStart(2, "0")} / {String(panels.length).padStart(2, "0")} • {currentPanel.title}
                  </span>
                </div>
                <p className="text-sm md:text-base text-zinc-200 font-medium leading-relaxed max-w-3xl">
                  {currentPanel.caption || currentPanel.description}
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Previous / Next Overlay Arrows */}
          <button
            onClick={() => {
              setCurrentIndex((prev) => (prev - 1 + panels.length) % panels.length);
              playSlideTransitionSound();
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center hover:bg-purple-600 transition shadow-2xl z-30 cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={() => {
              setCurrentIndex((prev) => (prev + 1) % panels.length);
              playSlideTransitionSound();
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center hover:bg-purple-600 transition shadow-2xl z-30 cursor-pointer"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* BOTTOM TIMELINE THUMBNAILS & PLAYBACK CONTROL BAR */}
        <div className="relative z-20 bg-black/85 border-t border-white/10 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Play/Pause Control */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg transition cursor-pointer"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <span className="text-xs font-mono text-zinc-400">
              {isPlaying ? "AUTO-LOOPING" : "PAUSED"}
            </span>
          </div>

          {/* Strip of Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-2xl px-2">
            {panels.map((panel, idx) => (
              <button
                key={panel.id || idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  playSlideTransitionSound();
                }}
                className={`relative shrink-0 w-16 h-10 rounded-md overflow-hidden border transition cursor-pointer ${
                  idx === currentIndex
                    ? "border-purple-500 scale-105 shadow-[0_0_10px_rgba(121,40,202,0.6)]"
                    : "border-white/10 opacity-50 hover:opacity-100"
                }`}
              >
                {panel.image ? (
                  <img src={panel.image} alt={panel.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-[9px] font-mono">
                    {idx + 1}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Export Action */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white transition cursor-pointer"
          >
            <Download size={14} /> Export Sequence
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
