"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  BookOpen,
  Plus,
  Trash2,
  Loader2,
  ArrowRight,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Character, ProjectData, GenerateCastResponse } from "@/types";
import { postJson, ApiError } from "@/lib/api";

interface NewStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (
    project: ProjectData,
    characters: Character[],
    openingBeat?: {
      title: string;
      description: string;
      caption: string;
      dialogue?: string;
    }
  ) => void;
  isDark?: boolean;
}

const GENRE_OPTIONS = [
  "Graphic Novel",
  "Cyberpunk Manga",
  "Film Noir Mystery",
  "Historical War Drama",
  "Sci-Fi Odyssey",
  "Gothic Fantasy",
  "Post-Apocalyptic Survival",
];

const PALETTE_OPTIONS = [
  { name: "High-Contrast Graphic", emphasis: "Stark Inks, Bold Highlights & Saturated Primaries" },
  { name: "Neon Cyberpunk", emphasis: "Electric Cyan, Hot Magenta & Deep Void Black" },
  { name: "Muted Wartime Olive", emphasis: "Desaturated Drab, Trench Mud & Steel Grey" },
  { name: "Film Noir Shadows", emphasis: "Monochrome Chiaroscuro & Amber Streetlights" },
  { name: "Warm Golden Hour", emphasis: "Sepia Dusk, Terracotta & Crimson Sunsets" },
];

const ROLE_OPTIONS = [
  "Protagonist",
  "Supporting Character",
  "Antagonist",
  "Side Character",
];

export default function NewStoryModal({
  isOpen,
  onClose,
  onStoryCreated,
  isDark = true,
}: NewStoryModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [storyline, setStoryline] = useState("");
  const [storyType, setStoryType] = useState("Graphic Novel");
  const [colorEmphasis, setColorEmphasis] = useState(PALETTE_OPTIONS[0].emphasis);
  const [characters, setCharacters] = useState<Character[]>([]);

  const [isGeneratingCast, setIsGeneratingCast] = useState(false);
  const [castError, setCastError] = useState<string | null>(null);
  const [openingBeat, setOpeningBeat] = useState<{
    title: string;
    description: string;
    caption: string;
    dialogue?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleGenerateCast = async () => {
    if (!storyline.trim()) {
      setCastError("Please enter your storyline or story premise first.");
      return;
    }

    setIsGeneratingCast(true);
    setCastError(null);

    try {
      const data = await postJson<GenerateCastResponse>("/api/generate-cast", {
        title: title.trim() || "New Visual Story",
        storyline: storyline.trim(),
        storyType,
        colorEmphasis,
      });

      if (data.characters && data.characters.length > 0) {
        setCharacters(data.characters);
        if (data.openingSceneBeat) {
          setOpeningBeat(data.openingSceneBeat);
        }
      }
    } catch (err) {
      console.warn("Cast generation notice:", err);
      setCastError(
        err instanceof ApiError
          ? err.message
          : "Could not generate characters automatically. You can add characters manually below."
      );
    } finally {
      setIsGeneratingCast(false);
    }
  };

  const handleAddManualCharacter = () => {
    const newChar: Character = {
      id: `char_${Date.now()}_${characters.length + 1}`,
      name: "",
      role: characters.length === 0 ? "Protagonist" : "Supporting Character",
      description: "",
    };
    setCharacters([...characters, newChar]);
  };

  const handleUpdateCharacter = (id: string, field: keyof Character, val: string) => {
    setCharacters(
      characters.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const handleDeleteCharacter = (id: string) => {
    setCharacters(characters.filter((c) => c.id !== id));
  };

  const handleSubmit = (targetRoute: "studio" | "characters") => {
    const effectiveTitle = title.trim() || "Untitled Narrative";
    const effectiveStoryline = storyline.trim() || "A visual journey begins.";

    const finalProject: ProjectData = {
      title: effectiveTitle,
      storyType,
      idea: effectiveStoryline,
      world: `${storyType} Setting`,
      tone: "Dramatic & Cinematic",
      colorEmphasis,
    };

    // Filter out characters without names
    const finalCharacters = characters
      .map((c) => ({
        ...c,
        name: c.name.trim() || "Unnamed Character",
        description: c.description.trim() || `A character in ${effectiveTitle}.`,
      }));

    onStoryCreated(finalProject, finalCharacters, openingBeat || undefined);
    onClose();

    if (targetRoute === "characters") {
      router.push("/characters");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isDark
              ? "bg-[#0b0914]/95 border-white/15 text-white"
              : "bg-white/95 border-black/10 text-zinc-900"
          }`}
        >
          {/* HEADER */}
          <div
            className={`flex items-center justify-between px-7 py-5 border-b shrink-0 ${
              isDark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-black/[0.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-900/40">
                <BookOpen size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  Create New Story
                </h2>
                <p className="text-xs text-purple-400 font-mono tracking-wider uppercase mt-0.5">
                  Storyline Setup & AI Cast Generator
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer ${
                isDark ? "hover:bg-white/10 text-zinc-400 hover:text-white" : "hover:bg-black/5 text-zinc-600"
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="p-7 overflow-y-auto space-y-7 flex-1">
            {/* 1. TITLE & GENRE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400 block mb-2">
                  Story Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Whispering Fog of 1928"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold outline-none transition ${
                    isDark
                      ? "bg-white/[0.04] border-white/15 focus:border-purple-500 text-white placeholder:text-zinc-600"
                      : "bg-black/[0.03] border-black/10 focus:border-purple-600 text-zinc-900 placeholder:text-zinc-400"
                  }`}
                />
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400 block mb-2">
                  Genre / Format
                </label>
                <select
                  value={storyType}
                  onChange={(e) => setStoryType(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold outline-none cursor-pointer transition ${
                    isDark
                      ? "bg-[#141124] border-white/15 text-white"
                      : "bg-white border-black/10 text-zinc-900 shadow-sm"
                  }`}
                >
                  {GENRE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. STORYLINE / PREMISE */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400">
                  Storyline & Dramatic Premise
                </label>
                <span className="text-[10px] text-zinc-500">
                  Provide notes, plot beats, or script synopsis
                </span>
              </div>
              <textarea
                value={storyline}
                onChange={(e) => setStoryline(e.target.value)}
                placeholder="Describe your story's world, conflict, and key events... E.g., 'A rogue deep-sea salvage captain and her estranged navigator discover an ancient pre-war submarine submerged in the Mariana Trench that is emitting a repeating code...'"
                rows={4}
                className={`w-full p-4 rounded-2xl border text-sm leading-relaxed outline-none resize-none transition ${
                  isDark
                    ? "bg-white/[0.04] border-white/15 focus:border-purple-500 text-white placeholder:text-zinc-600"
                    : "bg-black/[0.03] border-black/10 focus:border-purple-600 text-zinc-900 placeholder:text-zinc-400"
                }`}
              />
            </div>

            {/* 3. COLOR PALETTE */}
            <div>
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400 block mb-2">
                Visual Aesthetic & Palette Emphasis
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {PALETTE_OPTIONS.map((pal) => (
                  <button
                    key={pal.name}
                    type="button"
                    onClick={() => setColorEmphasis(pal.emphasis)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      colorEmphasis === pal.emphasis
                        ? "border-purple-500 bg-purple-600/15"
                        : isDark
                        ? "border-white/10 bg-white/[0.02] hover:border-white/25"
                        : "border-black/10 bg-black/[0.02] hover:border-purple-400"
                    }`}
                  >
                    <span className="text-xs font-bold block">{pal.name}</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5 line-clamp-1">
                      {pal.emphasis}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. CHARACTERS SECTION */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <UserRound size={16} className="text-purple-400" />
                    Story Characters ({characters.length})
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Generate characters tailored to your narrative with AI or build your cast manually.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateCast}
                    disabled={isGeneratingCast || !storyline.trim()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-purple-900/30"
                  >
                    {isGeneratingCast ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Analyzing Storyline...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        ✨ Generate Characters from Storyline
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleAddManualCharacter}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      isDark ? "border-white/15 hover:bg-white/5" : "border-black/15 hover:bg-black/5"
                    }`}
                  >
                    <Plus size={14} /> Add Character
                  </button>
                </div>
              </div>

              {castError && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 mb-4">
                  {castError}
                </div>
              )}

              {/* Character list cards */}
              {characters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {characters.map((char) => (
                    <div
                      key={char.id}
                      className={`p-4 rounded-2xl border transition ${
                        isDark ? "bg-white/[0.03] border-white/10" : "bg-black/[0.02] border-black/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <input
                          type="text"
                          value={char.name}
                          onChange={(e) => handleUpdateCharacter(char.id, "name", e.target.value)}
                          placeholder="Character Name"
                          className={`text-sm font-bold bg-transparent outline-none border-b border-dashed ${
                            isDark ? "border-white/20 focus:border-purple-400" : "border-black/20 focus:border-purple-600"
                          } py-0.5 w-1/2`}
                        />

                        <div className="flex items-center gap-2">
                          <select
                            value={char.role}
                            onChange={(e) => handleUpdateCharacter(char.id, "role", e.target.value)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                              isDark ? "bg-[#141124] border-white/15 text-purple-300" : "bg-white border-black/10 text-purple-800"
                            }`}
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDeleteCharacter(char.id)}
                            className="text-zinc-500 hover:text-red-400 transition cursor-pointer p-1"
                            title="Remove Character"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={char.description}
                        onChange={(e) => handleUpdateCharacter(char.id, "description", e.target.value)}
                        placeholder="Visual appearance, age, attire, hairstyle, and demeanor..."
                        rows={3}
                        className={`w-full p-2.5 rounded-xl border text-xs leading-relaxed outline-none resize-none transition ${
                          isDark
                            ? "bg-black/30 border-white/10 focus:border-purple-500 text-zinc-200 placeholder:text-zinc-600"
                            : "bg-white border-black/10 focus:border-purple-600 text-zinc-800 placeholder:text-zinc-400"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`p-6 rounded-2xl border border-dashed text-center flex flex-col items-center justify-center ${
                    isDark ? "border-white/10 bg-white/[0.01]" : "border-black/10 bg-black/[0.01]"
                  }`}
                >
                  <UserRound size={32} className="text-zinc-600 mb-2" />
                  <p className="text-xs text-zinc-400 font-medium">
                    No characters added yet. Click <strong>✨ Generate Characters from Storyline</strong> to cast your characters automatically!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-7 py-5 border-t shrink-0 ${
              isDark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-black/[0.02]"
            }`}
          >
            <p className="text-xs text-zinc-400">
              {characters.length === 0
                ? "You can also add or generate characters inside the studio anytime."
                : `${characters.length} character${characters.length === 1 ? "" : "s"} ready for this narrative.`}
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSubmit("characters")}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  isDark
                    ? "border-white/15 bg-white/5 hover:bg-white/10 text-zinc-200"
                    : "border-black/10 bg-black/5 hover:bg-black/10 text-zinc-800"
                }`}
              >
                Save & Open Cast Studio
              </button>

              <button
                type="button"
                onClick={() => handleSubmit("studio")}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                Launch Story in Studio
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
