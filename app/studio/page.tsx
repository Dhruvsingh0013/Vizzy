"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Send,
  Plus,
  Play,
  RotateCcw,
  Check,
  CheckCircle2,
  Users,
  Image as ImageIcon,
  Edit2,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Layers,
  Wand2,
  Download,
  Loader2,
  Eye,
  RefreshCw,
  Palette,
  X,
  FileText,
  Bookmark,
  UserPlus,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SlideshowPlayer, { SlidePanel } from "../components/SlideshowPlayer";
import GraphicNovelSpreadModal from "../components/GraphicNovelSpreadModal";
import ScriptImportModal from "../components/ScriptImportModal";

type ProjectData = {
  title: string;
  storyType: string;
  idea: string;
  world?: string;
  tone?: string;
  colorEmphasis?: string;
};

type Character = {
  id: string;
  name: string;
  role: string;
  description: string;
  image?: string;
};

type PanelCandidate = {
  id: string;
  image: string;
  label: string;
  description: string;
};

type ChatMessage = {
  id: string;
  sender: "vizzy" | "user";
  text: string;
  timestamp: string;
  candidates?: PanelCandidate[];
  selectedCandidateId?: string;
  approved?: boolean;
};

const studioBackgrounds = [
  {
    src: "/background/beach.jpg",
    name: "Ocean Escape",
  },
  {
    src: "/background/london.jpg",
    name: "1980s London",
  },
  {
    src: "/background/cyberpunk.jpg",
    name: "Neo City",
  },
  {
    src: "/background/winter-forest.jpg",
    name: "Winter Forest",
  },
  {
    src: "/background/sci-fi.jpg",
    name: "Future Worlds",
  },
];

const storyPresets = [
  {
    id: "dday",
    title: "D-Day: The Normandy Landing",
    storyType: "Graphic Novel",
    world: "Normandy Coast, June 6, 1944",
    tone: "Dramatic & Historical",
    colorEmphasis: "Muted Olive, Atlantic Slate & Ember",
    idea: "A World War II graphic novel following Allied troops storming Omaha Beach under heavy morning fog.",
    characters: [
      {
        id: "char_1",
        name: "Captain Miller",
        role: "Squad Leader",
        description: "Weathered squad leader with steady hands and a steel helmet.",
      },
      {
        id: "char_2",
        name: "Private Jackson",
        role: "Sharpshooter",
        description: "Young sharp-eyed soldier clutching an M1 Garand in cold sea spray.",
      },
    ],
    promptChips: [
      "🎖️ Landing Craft Ramp Drops under heavy fog",
      "⛰️ Squad climbing steep chalk cliffs at Pointe du Hoc",
      "💥 Pinned at the sea wall under machine gun fire",
      "📻 Radio operator calling in naval gunfire support",
    ],
  },
  {
    id: "cyberpunk",
    title: "Neo City 2088",
    storyType: "Storyboard",
    world: "Neo-Shinjuku Underbelly, 2088",
    tone: "Cyberpunk Noir",
    colorEmphasis: "Neon Cyan, Deep Violet & Magenta",
    idea: "A cybernetic investigator unravels a rogue artificial intelligence conspiracy in rain-slicked neon alleys.",
    characters: [
      {
        id: "char_c1",
        name: "Kaelen Vance",
        role: "Bounty Hunter",
        description: "Cynical detective with glowing cybernetic ocular implants and a weathered longcoat.",
      },
      {
        id: "char_c2",
        name: "Nyx-7",
        role: "Rogue Android",
        description: "Sleek synth with chrome skin and cracked purple LED optics.",
      },
    ],
    promptChips: [
      "🌧️ Flying spinners passing towering neon holograms in heavy rain",
      "🔍 Vance scanning biometric data in an abandoned cyber-lab",
      "⚡ Rooftop drone pursuit above the smog-filled megacity",
      "💥 Cyber-katana duel in an electric noodle alleyway",
    ],
  },
  {
    id: "deepspace",
    title: "Echoes of the Deep Space",
    storyType: "Visual Book",
    world: "Kepler-186f Orbit, 2240",
    tone: "Cosmic Wonder & Mystery",
    colorEmphasis: "Cosmic Nebula Purple, Solar Gold & Deep Void",
    idea: "An astronaut research vessel encounters a colossal derelict alien megastructure drifting near a dying pulsar.",
    characters: [
      {
        id: "char_s1",
        name: "Commander Astra",
        role: "Expedition Pilot",
        description: "Astronaut in an EVA pressure suit with a gold-tinted reflective visor.",
      },
      {
        id: "char_s2",
        name: "Dr. Chen",
        role: "Xenobiologist",
        description: "Curious scientist holding an active scanner displaying foreign energy signatures.",
      },
    ],
    promptChips: [
      "🚀 Research vessel entering the shadow of a colossal alien ring",
      "🌌 Spacewalk tethered above an ancient glowing energy conduit",
      "✨ Strange crystalline entities floating inside the derelict dome",
      "🛰️ Transmission received in an unknown mathematical frequency",
    ],
  },
];

const palettePresets = [
  {
    id: "dday",
    name: "D-Day Historical",
    emphasis: "Muted Olive, Atlantic Slate & Ember",
    colors: ["#2e3b2b", "#1e293b", "#475569", "#991b1b"],
  },
  {
    id: "cyberpunk",
    name: "Neo Cyberpunk",
    emphasis: "Neon Cyan, Deep Violet & Magenta",
    colors: ["#00dfd8", "#7928ca", "#ff007f", "#0f0e17"],
  },
  {
    id: "noir",
    name: "Film Noir",
    emphasis: "Monochrome Shadow & Amber Streetlights",
    colors: ["#09090b", "#27272a", "#71717a", "#d97706"],
  },
  {
    id: "golden",
    name: "Golden Hour Drama",
    emphasis: "Warm Sepia, Terracotta & Sunset Glow",
    colors: ["#78350f", "#b45309", "#d97706", "#fef3c7"],
  },
];

export default function StudioPage() {
  const router = useRouter();

  // Environment Background state (ported from create webpage)
  const [activeBackground, setActiveBackground] = useState(0);

  // Background slideshow interval
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBackground((current) =>
        current === studioBackgrounds.length - 1 ? 0 : current + 1
      );
    }, 9500);

    return () => clearInterval(interval);
  }, []);

  // Theme: "dark" or "light" (Paper Manga aesthetic)
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("vizzy-theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("vizzy-theme", next);
  };

  const isDark = theme === "dark";

  // Active Story Preset index
  const [selectedPresetId, setSelectedPresetId] = useState("dday");

  // Project and Bible state
  const [project, setProject] = useState<ProjectData>({
    title: storyPresets[0].title,
    storyType: storyPresets[0].storyType,
    idea: storyPresets[0].idea,
    world: storyPresets[0].world,
    tone: storyPresets[0].tone,
    colorEmphasis: storyPresets[0].colorEmphasis,
  });

  const [activePaletteIndex, setActivePaletteIndex] = useState(0);
  const [characters, setCharacters] = useState<Character[]>(storyPresets[0].characters);
  const [promptChips, setPromptChips] = useState<string[]>(storyPresets[0].promptChips);

  // Panels & Timeline
  const [panels, setPanels] = useState<SlidePanel[]>([
    {
      id: "panel_1",
      title: "Approach to Normandy",
      description: "Landing craft slicing through dark Atlantic ocean swells at 0600 hours.",
      caption: "0600 Hours. The Atlantic surf slammed against the cold steel hull.",
      dialogue: "Keep your heads down and check your gear!",
      image: generateInitialSvg("Approach to Normandy", "Landing craft in stormy morning sea", 1),
    },
    {
      id: "panel_2",
      title: "The Ramp Drops",
      description: "The steel ramp splashes into cold surf as smoke fills the coastline.",
      caption: "The ramp dropped into icy sea spray and thunderous gunfire.",
      dialogue: "Move! Move! Get to the sea wall!",
      image: generateInitialSvg("The Ramp Drops", "Steel ramp dropping into ocean surf with smoke", 2),
    },
  ]);

  // Chat message stream
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isGeneratingPanel, setIsGeneratingPanel] = useState(false);

  // Modals state
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [showBookSpread, setShowBookSpread] = useState(false);
  const [showScriptImport, setShowScriptImport] = useState(false);
  const [editingPanel, setEditingPanel] = useState<SlidePanel | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Switch Story Preset handler
  const handleSelectPreset = (presetId: string) => {
    const found = storyPresets.find((p) => p.id === presetId);
    if (!found) return;

    setSelectedPresetId(presetId);
    setProject({
      title: found.title,
      storyType: found.storyType,
      idea: found.idea,
      world: found.world,
      tone: found.tone,
      colorEmphasis: found.colorEmphasis,
    });
    setCharacters(found.characters);
    setPromptChips(found.promptChips);

    const presetGreeting: ChatMessage = {
      id: `msg_preset_${Date.now()}`,
      sender: "vizzy",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: `Switched active universe to **"${found.title}"** (${found.storyType})!

🎨 **World & Setting**: ${found.world}  
🎭 **Tone**: ${found.tone}  
🖌️ **Palette**: ${found.colorEmphasis}

Tell me what visual scene you'd like to compose next, or choose one of the prompt chips below!`,
    };

    setMessages((prev) => [...prev, presetGreeting]);
  };

  // Tag character into input box
  const handleTagCharacter = (char: Character) => {
    setInputText((prev) => {
      const addition = `Focus on ${char.name} (${char.description})`;
      return prev.trim() ? `${prev.trim()}, ${addition}` : addition;
    });
  };

  // Load state on mount
  useEffect(() => {
    const savedProject = sessionStorage.getItem("vizzy-project");
    const savedCharacters = sessionStorage.getItem("vizzy-characters");

    if (savedProject) {
      try {
        const parsed = JSON.parse(savedProject);
        setProject((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error(e);
      }
    }

    if (savedCharacters) {
      try {
        setCharacters(JSON.parse(savedCharacters));
      } catch (e) {
        console.error(e);
      }
    }

    // Welcome conversation from Vizzy
    const initialWelcome: ChatMessage = {
      id: "msg_welcome",
      sender: "vizzy",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: `Welcome to **Vizzy Studio**! I am your AI Creative Director.

We are developing a **${project.storyType}** titled **"${project.title}"**.

🎨 **Aesthetic Style**: High-contrast Graphic Novel  
🖌️ **Color Palette Emphasis**: ${project.colorEmphasis}  
📜 **Premise / Notes**: "${project.idea}"

I'm ready to craft **Panel ${panels.length + 1}** with you. What visual moment happens next, or would you like me to propose a scene?`,
    };

    setMessages([initialWelcome]);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiThinking, isGeneratingPanel]);

  // Send message handler
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isAiThinking) return;

    setInputText("");

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.sender, content: m.text })),
          project,
          mode: "panel",
          currentPanelIndex: panels.length,
        }),
      });

      const data = await response.json();
      setIsAiThinking(false);

      const vizzyReply: ChatMessage = {
        id: `msg_vizzy_${Date.now()}`,
        sender: "vizzy",
        text: data.reply || "Let's bring this scene to life visually!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, vizzyReply]);

      // Automatically trigger image candidate variations
      triggerPanelGeneration(textToSend);
    } catch (err) {
      console.error(err);
      setIsAiThinking(false);
    }
  };

  // Generate candidate panel options
  const triggerPanelGeneration = async (promptQuery: string) => {
    setIsGeneratingPanel(true);

    try {
      const response = await fetch("/api/generate-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptQuery,
          sceneTitle: `Panel ${panels.length + 1}`,
          style: project.storyType,
          colorEmphasis: project.colorEmphasis,
          characters,
        }),
      });

      const data = await response.json();
      setIsGeneratingPanel(false);

      const candidateMsg: ChatMessage = {
        id: `msg_candidates_${Date.now()}`,
        sender: "vizzy",
        text: `Here are 3 framing options for **Panel ${panels.length + 1}**. Pick your favorite or ask to refine:`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        candidates: data.options || [],
      };

      setMessages((prev) => [...prev, candidateMsg]);
    } catch (err) {
      console.error(err);
      setIsGeneratingPanel(false);
    }
  };

  // User selects candidate option
  const handleSelectCandidate = (msgId: string, candidateId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === msgId ? { ...msg, selectedCandidateId: candidateId } : msg))
    );
  };

  // User requests refinement of an option
  const handleRefineOption = (candidate: PanelCandidate) => {
    setInputText(`Refine ${candidate.label}: make the lighting darker, add heavier sea fog, and bring the camera closer.`);
  };

  // User approves candidate option into panel timeline
  const handleApprovePanel = (candidate: PanelCandidate) => {
    const newPanel: SlidePanel = {
      id: `panel_${Date.now()}`,
      title: `Panel ${panels.length + 1}: ${candidate.label}`,
      description: candidate.description,
      image: candidate.image,
      caption: `Panel ${panels.length + 1}: Troops push forward under intense fire.`,
      dialogue: "Spread out and advance! Take that ridge!",
    };

    setPanels((prev) => [...prev, newPanel]);

    const confirmMsg: ChatMessage = {
      id: `msg_approved_${Date.now()}`,
      sender: "vizzy",
      text: `🎉 **Panel ${panels.length + 1} locked into your sequence!**

We now have **${panels.length + 1} panels**. Preview the auto-running loop anytime with the top play button. What happens in the next panel?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, confirmMsg]);
  };

  // Timeline panel manipulation
  const movePanel = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= panels.length) return;
    const updated = [...panels];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setPanels(updated);
  };

  const deletePanel = (index: number) => {
    if (panels.length <= 1) return;
    setPanels(panels.filter((_, i) => i !== index));
  };

  const saveEditedPanel = () => {
    if (!editingPanel) return;
    setPanels(panels.map((p) => (p.id === editingPanel.id ? editingPanel : p)));
    setEditingPanel(null);
  };

  // Import script callback
  const handleImportPanels = (importedPanels: SlidePanel[]) => {
    setPanels((prev) => [...prev, ...importedPanels]);
    const notifyMsg: ChatMessage = {
      id: `msg_import_${Date.now()}`,
      sender: "vizzy",
      text: `📜 **Successfully parsed and imported ${importedPanels.length} new panels from your script!**

Your story timeline has been updated with these scene beats. You can now generate candidate artwork or edit captions for any panel.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, notifyMsg]);
  };

  return (
    <div
      className={`${
        isDark ? "text-white" : "text-zinc-900"
      } min-h-screen flex flex-col overflow-hidden relative selection:bg-purple-500 selection:text-white transition-colors duration-300`}
    >
      {/* BACKGROUND IMAGES LAYER (Full 100% vibrant images) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {studioBackgrounds.map((bg, index) => (
          <motion.div
            key={bg.src}
            initial={{ opacity: 0 }}
            animate={{
              opacity: index === activeBackground ? 1 : 0,
              scale: index === activeBackground ? 1.05 : 1,
            }}
            transition={{
              opacity: { duration: 1.8, ease: "easeInOut" },
              scale: { duration: 10.0, ease: "easeOut" },
            }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${bg.src})`,
            }}
          />
        ))}

        {/* 50% Translucent Glass Overlay Masking */}
        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            isDark
              ? "bg-black/40 bg-gradient-to-b from-black/55 via-transparent to-black/65"
              : "bg-white/45 bg-gradient-to-b from-white/55 via-transparent to-white/65"
          }`}
        />
      </div>

      {/* NAVBAR (50% Glass Translucency) */}
      <nav
        className={`${
          isDark
            ? "border-white/15 bg-black/45 text-white"
            : "border-black/10 bg-white/50 text-zinc-900 shadow-sm"
        } relative z-30 h-16 border-b backdrop-blur-md px-6 flex items-center justify-between transition-colors duration-300`}
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition">
              <Sparkles size={16} />
            </div>
            <span
              className={`font-black text-lg tracking-tight ${
                isDark ? "text-white" : "text-zinc-900"
              }`}
            >
              VIZZY STUDIO
            </span>
          </Link>

          <div className="h-4 w-px bg-white/20 hidden sm:block" />

          {/* Story Preset Switcher Dropdown */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition ${
              isDark
                ? "bg-black/40 border-white/15 backdrop-blur-sm"
                : "bg-white/60 border-black/10 shadow-sm backdrop-blur-sm"
            }`}
          >
            <Bookmark size={13} className="text-purple-400" />
            <select
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className={`bg-transparent text-xs font-bold outline-none cursor-pointer ${
                isDark ? "text-zinc-200" : "text-zinc-800"
              }`}
            >
              {storyPresets.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-[#100e1a] text-white">
                  {preset.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* THEME TOGGLE: LIGHT / DARK MODE */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center backdrop-blur-sm ${
              isDark
                ? "border-white/15 bg-black/40 text-amber-300 hover:bg-black/60 hover:text-amber-200"
                : "border-black/10 bg-white/70 text-purple-700 hover:bg-white shadow-sm"
            }`}
            title={isDark ? "Switch to Light Manga Paper Mode" : "Switch to Dark Studio Mode"}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Link to Characters page */}
          <Link
            href="/characters"
            className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer backdrop-blur-sm ${
              isDark
                ? "bg-black/40 hover:bg-black/60 border-white/15 text-zinc-200"
                : "bg-white/70 hover:bg-white border-black/10 text-zinc-800 shadow-sm"
            }`}
          >
            <Users size={14} /> Characters
          </Link>

          {/* Import Script Button */}
          <button
            onClick={() => setShowScriptImport(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer backdrop-blur-sm ${
              isDark
                ? "bg-black/40 hover:bg-black/60 border-white/15 text-zinc-200"
                : "bg-white/70 hover:bg-white border-black/10 text-zinc-800 shadow-sm"
            }`}
          >
            <FileText size={14} /> Import Script
          </button>

          {/* View Comic Book Page Spread */}
          <button
            onClick={() => setShowBookSpread(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition cursor-pointer backdrop-blur-sm ${
              isDark
                ? "bg-black/40 hover:bg-black/60 border-white/15 text-zinc-200"
                : "bg-white/70 hover:bg-white border-black/10 text-zinc-800 shadow-sm"
            }`}
          >
            <BookOpen size={14} /> Page Spread ({panels.length})
          </button>

          {/* Slideshow Player trigger */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowSlideshow(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 cursor-pointer transition"
          >
            <Play size={14} fill="currentColor" />
            Play Slideshow Loop
          </motion.button>
        </div>
      </nav>

      {/* THREE-COLUMN WORKSPACE GRID (50% Glass Translucency) */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] overflow-hidden">
        
        {/* LEFT SIDEBAR: STORY BIBLE, ENVIRONMENT & PALETTES */}
        <aside
          className={`hidden lg:flex flex-col border-r p-5 overflow-y-auto gap-5 select-none transition-colors duration-300 backdrop-blur-md ${
            isDark
              ? "border-white/15 bg-black/40 text-white"
              : "border-black/10 bg-white/45 text-zinc-900"
          }`}
        >
          {/* ENVIRONMENT BACKGROUND SELECTOR (From create page) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p
                className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                  isDark ? "text-purple-400" : "text-purple-700"
                }`}
              >
                STUDIO ENVIRONMENT
              </p>
              <span className="text-[9px] text-zinc-400 font-mono">
                {studioBackgrounds[activeBackground].name}
              </span>
            </div>

            <div className="flex gap-1.5 p-1 rounded-xl bg-black/30 border border-white/10 backdrop-blur-sm">
              {studioBackgrounds.map((bg, idx) => (
                <button
                  key={bg.src}
                  onClick={() => setActiveBackground(idx)}
                  className={`relative flex-1 h-8 rounded-lg overflow-hidden border cursor-pointer transition ${
                    idx === activeBackground
                      ? "border-purple-500 scale-105 shadow-md shadow-purple-950/40"
                      : "border-white/10 opacity-50 hover:opacity-100"
                  }`}
                  title={bg.name}
                >
                  <img src={bg.src} alt={bg.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p
              className={`text-[10px] font-mono font-bold tracking-widest uppercase mb-3 ${
                isDark ? "text-purple-400" : "text-purple-700"
              }`}
            >
              STORY BIBLE
            </p>

            <div
              className={`space-y-3 rounded-2xl p-4 border transition-colors backdrop-blur-sm ${
                isDark
                  ? "bg-black/30 border-white/10"
                  : "bg-white/60 border-black/10 shadow-sm"
              }`}
            >
              <div>
                <span className="text-[9px] text-zinc-400 font-bold block">PROJECT TITLE</span>
                <span
                  className={`text-xs font-bold ${
                    isDark ? "text-zinc-200" : "text-zinc-800"
                  }`}
                >
                  {project.title}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-400 font-bold block">FORMAT</span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-300">
                  {project.storyType}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-400 font-bold block">SETTING / WORLD</span>
                <span
                  className={`text-xs font-bold ${
                    isDark ? "text-zinc-200" : "text-zinc-800"
                  }`}
                >
                  {project.world}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-400 font-bold block">TONE</span>
                <span
                  className={`text-xs font-bold ${
                    isDark ? "text-zinc-200" : "text-zinc-800"
                  }`}
                >
                  {project.tone}
                </span>
              </div>
            </div>
          </div>

          {/* COLOR PALETTE PRESETS (CLICKABLE) */}
          <div>
            <p
              className={`text-[10px] font-mono font-bold tracking-widest uppercase mb-2 ${
                isDark ? "text-purple-400" : "text-purple-700"
              }`}
            >
              COLOR PALETTE EMPHASIS
            </p>
            <p className="text-[10px] text-zinc-400 mb-3">{project.colorEmphasis}</p>

            <div className="space-y-2">
              {palettePresets.map((pal, idx) => (
                <div
                  key={pal.id}
                  onClick={() => {
                    setActivePaletteIndex(idx);
                    setProject((prev) => ({ ...prev, colorEmphasis: pal.emphasis }));
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between backdrop-blur-sm ${
                    activePaletteIndex === idx
                      ? isDark
                        ? "bg-purple-600/30 border-purple-400 shadow-md"
                        : "bg-purple-100/80 border-purple-400 shadow-sm text-purple-900"
                      : isDark
                      ? "bg-black/30 border-white/10 hover:border-white/25 text-zinc-300"
                      : "bg-white/60 border-black/10 hover:border-black/20 text-zinc-800 shadow-sm"
                  }`}
                >
                  <span className="text-xs font-bold">{pal.name}</span>
                  <div className="flex gap-1.5">
                    {pal.colors.map((c, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border border-black/15 dark:border-white/20"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHARACTER CAST (WITH INJECTION) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p
                className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                  isDark ? "text-purple-400" : "text-purple-700"
                }`}
              >
                CHARACTERS ({characters.length})
              </p>
              <Link
                href="/characters"
                className="text-[9px] font-bold text-purple-600 dark:text-purple-300 hover:underline"
              >
                + Edit Cast
              </Link>
            </div>
            <div className="space-y-2">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border group transition backdrop-blur-sm ${
                    isDark
                      ? "bg-black/30 border-white/10 hover:border-purple-400/40"
                      : "bg-white/60 border-black/10 hover:border-purple-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-purple-600 dark:text-purple-300 font-bold text-xs shrink-0">
                      {char.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-bold truncate ${
                          isDark ? "text-zinc-200" : "text-zinc-800"
                        }`}
                      >
                        {char.name}
                      </p>
                      <p className="text-[9px] text-zinc-400 truncate">{char.role}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTagCharacter(char)}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600 text-[9px] font-bold text-purple-700 dark:text-purple-200 hover:text-white transition cursor-pointer"
                    title="Insert into chat prompt"
                  >
                    + Tag
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* MIDDLE: CHAT INTERFACE & MULTI-OPTION CARDS (50% Glass Translucency) */}
        <main
          className={`flex flex-col overflow-hidden relative transition-colors duration-300 backdrop-blur-sm ${
            isDark ? "bg-black/30" : "bg-white/30"
          }`}
        >
          {/* CHAT MESSAGES STREAM */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 items-start ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-md ${
                    msg.sender === "vizzy" ? "bg-purple-600" : "bg-zinc-700"
                  }`}
                >
                  {msg.sender === "vizzy" ? <Sparkles size={16} /> : <Users size={16} />}
                </div>

                {/* Message Content */}
                <div className={`max-w-2xl flex flex-col ${msg.sender === "user" ? "items-end" : ""}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className={`text-xs font-bold ${
                        isDark ? "text-zinc-200" : "text-zinc-700"
                      }`}
                    >
                      {msg.sender === "vizzy" ? "Vizzy" : "You"}
                    </span>
                    <span
                      className={`text-[9px] font-mono ${
                        isDark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-md ${
                      msg.sender === "user"
                        ? "bg-purple-600/90 text-white rounded-tr-none shadow-md"
                        : isDark
                        ? "bg-black/50 border border-white/15 text-zinc-100 rounded-tl-none shadow-md"
                        : "bg-white/70 border border-black/10 text-zinc-900 rounded-tl-none shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Multi-Option Candidate Cards */}
                  {msg.candidates && msg.candidates.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                      {msg.candidates.map((cand) => {
                        const isSelected = msg.selectedCandidateId === cand.id;
                        return (
                          <div
                            key={cand.id}
                            onClick={() => handleSelectCandidate(msg.id, cand.id)}
                            className={`rounded-xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col backdrop-blur-md ${
                              isSelected
                                ? "border-purple-500 shadow-[0_0_20px_rgba(121,40,202,0.4)] scale-[1.02]"
                                : isDark
                                ? "border-white/15 bg-black/55 hover:border-white/35"
                                : "border-black/10 bg-white/75 hover:border-black/25 shadow-sm"
                            }`}
                          >
                            <div className="aspect-video relative bg-black">
                              <img src={cand.image} alt={cand.label} className="w-full h-full object-cover" />
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center shadow">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              )}
                            </div>

                            <div className="p-3 flex-1 flex flex-col justify-between">
                              <div>
                                <p
                                  className={`text-xs font-bold ${
                                    isDark ? "text-purple-300" : "text-purple-700"
                                  }`}
                                >
                                  {cand.label}
                                </p>
                                <p
                                  className={`text-[10px] mt-1 line-clamp-2 ${
                                    isDark ? "text-zinc-300" : "text-zinc-600"
                                  }`}
                                >
                                  {cand.description}
                                </p>
                              </div>

                              <div className="mt-3 flex flex-col gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprovePanel(cand);
                                  }}
                                  className={`w-full py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                    isSelected
                                      ? "bg-purple-600 hover:bg-purple-500 text-white shadow"
                                      : isDark
                                      ? "bg-white/15 hover:bg-white/25 text-zinc-100"
                                      : "bg-black/5 hover:bg-black/10 text-zinc-800"
                                  }`}
                                >
                                  {isSelected ? "Approve Panel & Next" : "Select Option"}
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRefineOption(cand);
                                  }}
                                  className={`w-full py-1 text-[10px] transition ${
                                    isDark
                                      ? "text-zinc-400 hover:text-purple-300"
                                      : "text-zinc-600 hover:text-purple-700"
                                  }`}
                                >
                                  Refine in Chat ✍️
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* AI thinking indicator */}
            {(isAiThinking || isGeneratingPanel) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 items-center">
                <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-md">
                  <Sparkles size={16} className="animate-spin" />
                </div>
                <div
                  className={`rounded-2xl p-3 text-xs font-mono flex items-center gap-2 border backdrop-blur-md ${
                    isDark
                      ? "bg-black/50 border-white/15 text-purple-300"
                      : "bg-white/70 border-black/10 text-purple-700 shadow-sm"
                  }`}
                >
                  <Loader2 size={14} className="animate-spin" />
                  {isGeneratingPanel
                    ? "Vizzy is generating 3 visual panel options..."
                    : "Vizzy is analyzing your scene..."}
                </div>
              </motion.div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* PROMPT CHIPS & CHAT INPUT BAR (50% Glass Translucency) */}
          <div
            className={`p-4 border-t flex flex-col gap-3 transition-colors duration-300 backdrop-blur-md ${
              isDark
                ? "border-white/15 bg-black/45"
                : "border-black/10 bg-white/55"
            }`}
          >
            {/* Clickable prompt suggestions */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {promptChips.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(suggestion)}
                  className={`shrink-0 px-3 py-1.5 rounded-full border text-[11px] transition cursor-pointer backdrop-blur-sm ${
                    isDark
                      ? "bg-black/35 hover:bg-purple-600/30 border-white/15 text-zinc-200 hover:text-white"
                      : "bg-white/60 hover:bg-purple-100 border-black/10 text-zinc-800 hover:text-purple-900 shadow-sm"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Main Input Text Bar */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Describe your scene, mention a character, or refine an image..."
                className={`w-full rounded-2xl px-5 py-3.5 pr-14 text-sm focus:outline-none focus:border-purple-500/60 transition backdrop-blur-md ${
                  isDark
                    ? "bg-black/45 border border-white/15 text-zinc-100 placeholder:text-zinc-400"
                    : "bg-white/80 border border-black/15 text-zinc-900 placeholder:text-zinc-500 shadow-inner"
                }`}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isAiThinking}
                className="absolute right-2.5 w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white flex items-center justify-center shadow transition-colors cursor-pointer"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: STORY TIMELINE STRIP (50% Glass Translucency) */}
        <aside
          className={`hidden lg:flex flex-col border-l p-5 overflow-y-auto select-none justify-between transition-colors duration-300 backdrop-blur-md ${
            isDark
              ? "border-white/15 bg-black/40 text-white"
              : "border-black/10 bg-white/45 text-zinc-900"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <p
                className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                  isDark ? "text-purple-400" : "text-purple-700"
                }`}
              >
                STORY PANELS ({panels.length})
              </p>
              <button
                onClick={() => setShowSlideshow(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-300 hover:opacity-80 transition cursor-pointer"
              >
                <Play size={12} fill="currentColor" /> Play Loop
              </button>
            </div>

            <div className="space-y-3">
              {panels.map((panel, idx) => (
                <div
                  key={panel.id || idx}
                  className={`group rounded-xl border overflow-hidden transition flex flex-col backdrop-blur-sm ${
                    isDark
                      ? "border-white/15 bg-black/50 hover:border-purple-400/50"
                      : "border-black/10 bg-white/60 hover:border-purple-400 shadow-sm"
                  }`}
                >
                  <div className="aspect-video relative bg-zinc-900">
                    {panel.image && (
                      <img src={panel.image} alt={panel.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[8px] font-mono font-bold text-white border border-white/10">
                      0{idx + 1}
                    </div>

                    {/* Action buttons on hover */}
                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => movePanel(idx, "up")}
                        disabled={idx === 0}
                        className="w-6 h-6 rounded bg-black/70 text-white flex items-center justify-center hover:bg-purple-600 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        onClick={() => movePanel(idx, "down")}
                        disabled={idx === panels.length - 1}
                        className="w-6 h-6 rounded bg-black/70 text-white flex items-center justify-center hover:bg-purple-600 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown size={12} />
                      </button>
                      <button
                        onClick={() => setEditingPanel(panel)}
                        className="w-6 h-6 rounded bg-black/70 text-white flex items-center justify-center hover:bg-purple-600 cursor-pointer"
                        title="Edit Dialogue/Caption"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => deletePanel(idx)}
                        disabled={panels.length <= 1}
                        className="w-6 h-6 rounded bg-black/70 text-white flex items-center justify-center hover:bg-red-600 disabled:opacity-30 cursor-pointer"
                        title="Delete Panel"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5">
                    <p
                      className={`text-xs font-bold truncate ${
                        isDark ? "text-zinc-100" : "text-zinc-900"
                      }`}
                    >
                      {panel.title}
                    </p>
                    {panel.dialogue && (
                      <p className="text-[10px] text-purple-600 dark:text-purple-300 italic mt-0.5 line-clamp-1">
                        💬 "{panel.dialogue}"
                      </p>
                    )}
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-400 mt-0.5 line-clamp-1">{panel.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <button
              onClick={() => setShowBookSpread(true)}
              className={`w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition backdrop-blur-sm ${
                isDark
                  ? "border-white/15 bg-black/40 hover:bg-black/60 text-white"
                  : "border-black/10 bg-white/70 hover:bg-white text-zinc-800 shadow-sm"
              }`}
            >
              <BookOpen size={14} /> View Graphic Novel Spread
            </button>
            <button
              onClick={() => setShowSlideshow(true)}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Play size={14} fill="currentColor" /> Launch Auto-Running Loop
            </button>
          </div>
        </aside>
      </div>

      {/* SLIDESHOW MODAL */}
      <SlideshowPlayer
        isOpen={showSlideshow}
        onClose={() => setShowSlideshow(false)}
        storyTitle={project.title}
        storyStyle={project.storyType}
        panels={panels}
      />

      {/* GRAPHIC NOVEL PAGE SPREAD MODAL */}
      <GraphicNovelSpreadModal
        isOpen={showBookSpread}
        onClose={() => setShowBookSpread(false)}
        storyTitle={project.title}
        storyType={project.storyType}
        worldSetting={project.world}
        panels={panels}
      />

      {/* SCRIPT IMPORT MODAL */}
      <ScriptImportModal
        isOpen={showScriptImport}
        onClose={() => setShowScriptImport(false)}
        onImport={handleImportPanels}
      />

      {/* EDIT PANEL MODAL */}
      {editingPanel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 border ${
              isDark
                ? "bg-[#100e1a] border-white/10 text-white"
                : "bg-white border-zinc-300 text-zinc-900"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-3 ${
                isDark ? "border-white/10" : "border-zinc-200"
              }`}
            >
              <h3 className="text-sm font-bold">Edit Panel Text</h3>
              <button onClick={() => setEditingPanel(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-purple-600 dark:text-purple-300 uppercase block mb-1">
                Title
              </label>
              <input
                type="text"
                value={editingPanel.title}
                onChange={(e) => setEditingPanel({ ...editingPanel, title: e.target.value })}
                className={`w-full rounded-xl px-3 py-2 text-xs border ${
                  isDark
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-zinc-50 border-zinc-300 text-zinc-900"
                }`}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-purple-600 dark:text-purple-300 uppercase block mb-1">
                Speech Balloon Dialogue
              </label>
              <input
                type="text"
                value={editingPanel.dialogue || ""}
                onChange={(e) => setEditingPanel({ ...editingPanel, dialogue: e.target.value })}
                placeholder="What does the character say?"
                className={`w-full rounded-xl px-3 py-2 text-xs border ${
                  isDark
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-zinc-50 border-zinc-300 text-zinc-900"
                }`}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-purple-600 dark:text-purple-300 uppercase block mb-1">
                Narrative Caption Box
              </label>
              <textarea
                value={editingPanel.caption || ""}
                onChange={(e) => setEditingPanel({ ...editingPanel, caption: e.target.value })}
                placeholder="Narrator caption at bottom of panel..."
                rows={3}
                className={`w-full rounded-xl p-3 text-xs resize-none border ${
                  isDark
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-zinc-50 border-zinc-300 text-zinc-900"
                }`}
              />
            </div>

            <div
              className={`flex justify-end gap-2 pt-2 border-t ${
                isDark ? "border-white/10" : "border-zinc-200"
              }`}
            >
              <button
                onClick={() => setEditingPanel(null)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedPanel}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function generateInitialSvg(title: string, prompt: string, variant: number): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="sky_init_${variant}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${variant === 1 ? "#090617" : "#180a0a"}" />
          <stop offset="60%" stop-color="#120e24" />
          <stop offset="100%" stop-color="#05040a" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#sky_init_${variant})" />
      <rect y="550" width="1600" height="350" fill="#030307" />
      <circle cx="800" cy="500" r="30" fill="#0c0a18" />
      <text x="80" y="780" fill="#ffffff" font-family="sans-serif" font-size="38" font-weight="bold">${title}</text>
      <text x="80" y="830" fill="#a78bfa" font-family="sans-serif" font-size="18">${prompt}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}