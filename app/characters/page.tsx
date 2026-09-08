"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  UserRound,
  Image as ImageIcon,
  X,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Character = {
  id: string;
  name: string;
  role: string;
  description: string;
  image?: string;
};

type ProjectData = {
  title: string;
  storyType: string;
  idea: string;
};

const roles = [
  "Protagonist",
  "Supporting Character",
  "Antagonist",
  "Side Character",
  "Other",
];

export default function CharactersPage() {
  const router = useRouter();

  const [project, setProject] = useState<ProjectData | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);

  const [name, setName] = useState("");
  const [role, setRole] = useState("Protagonist");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);

  const [generatedImage, setGeneratedImage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedProject = sessionStorage.getItem("vizzy-project");
    const savedCharacters = sessionStorage.getItem("vizzy-characters");

    if (savedProject) {
      setProject(JSON.parse(savedProject));
    }

    if (savedCharacters) {
      setCharacters(JSON.parse(savedCharacters));
    }
  }, []);

  const saveCharacters = (updated: Character[]) => {
    setCharacters(updated);
    sessionStorage.setItem("vizzy-characters", JSON.stringify(updated));
  };

  const resetForm = () => {
    setName("");
    setRole("Protagonist");
    setDescription("");
    setEditingId(null);
    setGeneratedImage("");
    setError("");
  };

  const openCreator = () => {
    resetForm();
    setShowCreator(true);
  };

  const editCharacter = (character: Character) => {
    setName(character.name);
    setRole(character.role);
    setDescription(character.description);
    setGeneratedImage(character.image || "");
    setEditingId(character.id);
    setError("");
    setShowCreator(true);
  };

  const deleteCharacter = (id: string) => {
    const updated = characters.filter(
      (character) => character.id !== id
    );

    saveCharacters(updated);
  };

  const generateCharacter = async () => {
    if (!name.trim()) {
      setError("Please enter a character name.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe the character first.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/generate-character", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          role,
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Character generation failed."
        );
      }

      if (!data.image) {
        throw new Error("Gemini did not return an image.");
      }

      setGeneratedImage(data.image);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating the character."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCharacter = () => {
    if (!name.trim()) {
      setError("Please enter a character name.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe the character.");
      return;
    }

    const character: Character = {
      id: editingId || `character_${Date.now()}`,
      name: name.trim(),
      role,
      description: description.trim(),
      image: generatedImage || undefined,
    };

    if (editingId) {
      const updated = characters.map((item) =>
        item.id === editingId ? character : item
      );

      saveCharacters(updated);
    } else {
      saveCharacters([...characters, character]);
    }

    setShowCreator(false);
    resetForm();
  };

  const enterStudio = () => {
    router.push("/studio");
  };

  return (
    <main className="min-h-screen bg-[#070510] text-white overflow-hidden relative">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -50, 0],
            opacity: [0.15, 0.27, 0.15],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-52 -left-40 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[140px]"
        />

        <motion.div
          animate={{
            x: [0, -70, 0],
            y: [0, 50, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-64 -right-40 w-[650px] h-[650px] rounded-full bg-fuchsia-600/15 blur-[150px]"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 md:px-12 py-7">
        <button
          onClick={() => router.push("/")}
          className="group flex items-center gap-2 text-white/45 hover:text-white transition"
        >
          <ArrowLeft
            size={17}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Home
        </button>

        <div className="flex items-center gap-2">
          <Sparkles size={17} className="text-purple-300" />
          <span className="text-sm font-medium tracking-[0.25em] uppercase text-white/70">
            Vizzy
          </span>
        </div>

        <div className="text-xs text-white/30 tracking-widest uppercase">
          Character Studio
        </div>
      </header>

      {/* Main */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <p className="text-purple-300/80 text-sm tracking-[0.3em] uppercase mb-5">
            Build your cast
          </p>

          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95]">
            Give your story
            <br />
            <span className="text-white/35">a face.</span>
          </h1>

          <p className="mt-7 text-white/45 text-base md:text-lg max-w-2xl leading-relaxed">
            Create the characters who will inhabit your world. Their visual
            references can later be used when generating scenes.
          </p>

          {project && (
            <div className="mt-6 text-sm text-white/30">
              Building characters for{" "}
              <span className="text-white/60">{project.title}</span>
            </div>
          )}
        </motion.div>

        {/* Characters */}
        <div className="mt-16">
          <AnimatePresence mode="popLayout">
            {characters.length > 0 && (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {characters.map((character, index) => (
                  <motion.div
                    key={character.id}
                    layout
                    initial={{
                      opacity: 0,
                      y: 30,
                      scale: 0.96,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.05,
                    }}
                    className="group relative min-h-[360px] rounded-3xl overflow-hidden border border-white/10 bg-white/[0.035]"
                  >
                    <div className="absolute inset-0">
                      {character.image ? (
                        <img
                          src={character.image}
                          alt={character.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-950/70 via-[#100b20] to-black">
                          <UserRound
                            size={80}
                            strokeWidth={1}
                            className="text-white/15"
                          />
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                    {/* Controls */}
                    <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => editCharacter(character)}
                        className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() =>
                          deleteCharacter(character.id)
                        }
                        className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-red-500/20"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="text-xs uppercase tracking-[0.2em] text-purple-300/70 mb-2">
                        {character.role}
                      </div>

                      <h2 className="text-2xl font-medium">
                        {character.name}
                      </h2>

                      <p className="mt-2 text-sm text-white/45 line-clamp-2">
                        {character.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add */}
          <motion.button
            onClick={openCreator}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className={`group relative overflow-hidden ${
              characters.length > 0
                ? "mt-6 w-full min-h-[150px]"
                : "w-full max-w-2xl min-h-[260px]"
            } rounded-3xl border border-dashed border-white/15 hover:border-purple-400/50 bg-white/[0.02] hover:bg-purple-500/[0.04] transition-all flex flex-col items-center justify-center`}
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center mb-4"
            >
              <Plus size={24} className="text-white/50" />
            </motion.div>

            <span className="text-white/60 group-hover:text-white transition">
              Add a character
            </span>

            <span className="text-xs text-white/25 mt-2">
              Build your cast one character at a time
            </span>
          </motion.button>
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-white/30">
            {characters.length === 0
              ? "Create your characters or continue to the studio."
              : `${characters.length} character${
                  characters.length === 1 ? "" : "s"
                } ready for your story.`}
          </div>

          <button
            onClick={enterStudio}
            className="group flex items-center gap-3 px-7 py-4 rounded-full bg-white text-black font-medium hover:bg-purple-100 transition"
          >
            Enter Studio
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </section>

      {/* Creator modal */}
      <AnimatePresence>
        {showCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center p-5 overflow-y-auto"
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 40,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 30,
                scale: 0.96,
              }}
              className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0d0917] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-7 py-6 border-b border-white/10">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-purple-300/70">
                    Character creation
                  </p>

                  <h2 className="text-2xl font-medium mt-1">
                    {editingId
                      ? "Edit character"
                      : "Create a character"}
                  </h2>
                </div>

                <button
                  onClick={() => {
                    setShowCreator(false);
                    resetForm();
                  }}
                  className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="grid md:grid-cols-2">
                {/* Form */}
                <div className="p-7 space-y-7">
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-white/35">
                      Character name
                    </label>

                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Elias"
                      className="mt-3 w-full bg-transparent border-b border-white/15 focus:border-purple-400/60 outline-none py-3 text-xl placeholder:text-white/15"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-white/35">
                      Role
                    </label>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {roles.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setRole(item)}
                          className={`px-4 py-2 rounded-full text-sm border transition ${
                            role === item
                              ? "bg-purple-500/20 border-purple-400/40 text-purple-200"
                              : "bg-white/[0.02] border-white/10 text-white/40 hover:text-white/70"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-white/35">
                      Appearance & personality
                    </label>

                    <textarea
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value)
                      }
                      placeholder="Describe their appearance, clothing, age, personality, hairstyle, etc."
                      rows={6}
                      className="mt-3 w-full resize-none rounded-2xl bg-white/[0.035] border border-white/10 focus:border-purple-400/40 outline-none p-4 text-sm leading-relaxed placeholder:text-white/15"
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-400/20 bg-red-500/5 px-4 py-3 text-sm text-red-300/80">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={generateCharacter}
                    disabled={isGenerating}
                    className="w-full py-4 rounded-2xl bg-purple-500 hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Generating character...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Generate Character
                      </>
                    )}
                  </button>

                  {generatedImage && (
                    <button
                      type="button"
                      onClick={saveCharacter}
                      className="w-full py-4 rounded-2xl bg-white text-black font-medium hover:bg-purple-100 transition"
                    >
                      Save Character
                    </button>
                  )}
                </div>

                {/* Image preview */}
                <div className="min-h-[520px] bg-black/30 border-l border-white/10 relative flex items-center justify-center overflow-hidden">
                  {isGenerating ? (
                    <div className="text-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.4, 0.8, 0.4],
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                        }}
                        className="absolute w-48 h-48 rounded-full bg-purple-500/20 blur-3xl"
                      />

                      <Sparkles
                        size={42}
                        className="relative mx-auto text-purple-300"
                      />

                      <p className="relative mt-5 text-white/60">
                        Vizzy is creating your character...
                      </p>

                      <p className="relative mt-2 text-xs text-white/25">
                        This can take a little while.
                      </p>
                    </div>
                  ) : generatedImage ? (
                    <motion.img
                      initial={{
                        opacity: 0,
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      src={generatedImage}
                      alt={`${name} character portrait`}
                      className="w-full h-full min-h-[520px] object-cover"
                    />
                  ) : (
                    <div className="text-center px-10">
                      <ImageIcon
                        size={48}
                        strokeWidth={1}
                        className="mx-auto text-white/10"
                      />

                      <p className="mt-5 text-white/30">
                        Your character portrait will appear here.
                      </p>

                      <p className="mt-2 text-xs text-white/15 leading-relaxed">
                        Describe the character on the left, then
                        generate their visual reference.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}