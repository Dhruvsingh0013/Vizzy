"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Users,
  Play,
  Check,
  FileText,
} from "lucide-react";

// Interactive canvas pointer trail
function PointerParticleTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      alpha: number;
      decay: number;
    }> = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const colors = [
      "rgba(121, 40, 202, ",  // purple
      "rgba(255, 0, 127, ",  // magenta
      "rgba(0, 223, 216, ",  // cyan
      "rgba(147, 51, 234, ", // indigo-purple
      "rgba(212, 197, 159, ", // gold/beige
    ];

    const handleMouseMove = (e: MouseEvent) => {
      for (let i = 0; i < 2; i++) {
        const colorBase = colors[Math.floor(Math.random() * colors.length)];
        particles.push({
          x: e.clientX,
          y: e.clientY + window.scrollY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.3,
          color: colorBase,
          size: Math.random() * 3.5 + 1.5,
          alpha: 0.9,
          decay: Math.random() * 0.015 + 0.015,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.size -= p.decay * 1.5;

        if (p.alpha <= 0 || p.size <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.shadowBlur = 6;
        ctx.shadowColor = `${p.color}${p.alpha})`;
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y - window.scrollY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} id="sparkle-canvas" className="fixed inset-0 pointer-events-none z-[9999]" />;
}

export default function Home() {

  return (
    <div className="min-h-screen bg-[#eae6e0] relative selection:bg-purple-200 selection:text-purple-900">
      {/* Canvas Particle Overlay */}
      <PointerParticleTrail />

      {/* FIXED PANEL HERO WRAPPER WITH MANGA BACKGROUND IMAGE */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat bg-right-top md:bg-right-center pointer-events-none z-0" 
        style={{ 
          backgroundImage: "url('/hero-bg.jpg')",
          minHeight: "100%",
        }}
      />
      
      {/* Left side overlay layout fade */}
      <div className="absolute inset-0 manga-overlay pointer-events-none z-0" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 rounded-xl bg-[#7928ca] text-white flex items-center justify-center shadow-md cursor-pointer"
          >
            <Sparkles size={20} />
          </motion.div>
          <span className="text-xl font-black tracking-tight text-[#111115] cursor-pointer">
            VIZZY
          </span>
        </div>

        {/* Center menu links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-[#111115]/80">
          <a href="#how-it-works" className="hover:text-purple-700 transition">How It Works</a>
          <Link href="/characters" className="hover:text-purple-700 transition">Character Cast</Link>
          <Link href="/studio" className="hover:text-purple-700 transition">Studio</Link>
        </div>

        {/* CTA Button */}
        <Link href="/characters">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#7928ca] hover:bg-[#621bb3] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer transition duration-300"
          >
            Start Creating
          </motion.button>
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
        <div className="max-w-xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full border border-purple-500/20 bg-purple-500/10 text-xs font-black text-purple-800 tracking-wide uppercase cursor-default"
          >
            <Sparkles size={12} className="text-purple-600" />
            AI Script-to-Visual Storyboard Creator
          </motion.div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#111115] tracking-tight leading-[0.95] flex flex-col uppercase">
            <span>Ideas in talk.</span>
            <span className="text-[#7928ca]">Worlds</span>
            <span className="text-[#111115]">in frames.</span>
          </h1>

          <p className="mt-8 text-lg font-medium text-zinc-700 leading-relaxed max-w-md">
            Transform your scripts, film notes, and story outlines into living graphic novels and cinematic storyboards through collaborative AI directing.
          </p>

          {/* Action buttons */}
          <div className="flex flex-row items-center gap-4 mt-10">
            <Link href="/characters">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 10px 20px -10px rgba(121,40,202,0.5)" }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-2 bg-[#7928ca] hover:bg-[#621bb3] text-white px-6 py-3 rounded-xl font-bold transition shadow-lg cursor-pointer"
              >
                Start Creating
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <Link href="/studio">
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "rgba(17,17,21,0.06)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#111115] text-[#111115] font-bold transition cursor-pointer"
              >
                <Play size={16} fill="currentColor" />
                Open Studio
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Comic Speech Bubble Layer overlaying background boy */}
        <div className="relative h-[250px] lg:h-[400px] w-full hidden md:block">
          <motion.div
            initial={{ scale: 0, rotate: -5 }}
            animate={{ scale: 1, rotate: 2 }}
            transition={{ type: "spring", delay: 0.8 }}
            className="speech-bubble absolute top-[25%] right-[22%] lg:right-[32%] xl:right-[36%] z-10"
          >
            What story will we tell today?
          </motion.div>
        </div>
      </header>



      {/* INTRODUCTORY EXPLAINER: SCRIPT-TO-PANEL WORKFLOW */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-24">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-4 rounded-full border border-purple-500/20 bg-purple-500/10 text-xs font-black text-purple-800 tracking-wide uppercase">
            <Sparkles size={12} className="text-purple-600" />
            The Creative Process
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#111115] tracking-tight uppercase">
            From Raw Script to <span className="text-[#7928ca]">Visual Book</span>
          </h2>
          <p className="mt-4 text-base font-medium text-zinc-700 leading-relaxed">
            Whether you have a completed movie screenplay, rough storyboard notes, or just a scene idea—Vizzy guides you step by step from text to stunning artwork.
          </p>
        </div>

        {/* 3 Step Explainer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white/80 backdrop-blur-sm border-2 border-black/10 rounded-3xl p-8 shadow-xl flex flex-col justify-between hover:border-purple-500/50 transition duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg mb-6 group-hover:scale-110 transition-transform">
                <FileText size={22} />
              </div>
              <span className="text-[11px] font-mono font-bold text-purple-700 uppercase tracking-widest block mb-2">
                STEP 01
              </span>
              <h3 className="text-xl font-black text-[#111115] mb-3">
                Input Script or Story Notes
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Paste your raw screenplay, scene beats, or high-level film notes. Vizzy automatically parses dramatic moments, character dialogue, and camera staging cues into an ordered sequence.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-black/5 flex items-center justify-between text-xs font-bold text-purple-800">
              <span>Automatic Beat Splitting</span>
              <Check size={16} className="text-emerald-600" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/80 backdrop-blur-sm border-2 border-black/10 rounded-3xl p-8 shadow-xl flex flex-col justify-between hover:border-purple-500/50 transition duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg mb-6 group-hover:scale-110 transition-transform">
                <Users size={22} />
              </div>
              <span className="text-[11px] font-mono font-bold text-purple-700 uppercase tracking-widest block mb-2">
                STEP 02
              </span>
              <h3 className="text-xl font-black text-[#111115] mb-3">
                Establish Cast & Visual Style
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Choose visual themes (e.g. Muted Wartime Olive, Cyberpunk Neon, Film Noir) and create character portraits. Character reference descriptions are incorporated into scene prompts to encourage visual consistency across frames.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-black/5 flex items-center justify-between text-xs font-bold text-purple-800">
              <span>Character References & Palettes</span>
              <Check size={16} className="text-emerald-600" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/80 backdrop-blur-sm border-2 border-black/10 rounded-3xl p-8 shadow-xl flex flex-col justify-between hover:border-purple-500/50 transition duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg mb-6 group-hover:scale-110 transition-transform">
                <Play size={22} fill="currentColor" />
              </div>
              <span className="text-[11px] font-mono font-bold text-purple-700 uppercase tracking-widest block mb-2">
                STEP 03
              </span>
              <h3 className="text-xl font-black text-[#111115] mb-3">
                Direct Frames & Dual Export
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Vizzy generates 3 framing options per beat. Refine in chat, approve into the timeline, and export as a printable Graphic Novel page spread or launch the auto-running slideshow loop with audio SFX.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-black/5 flex items-center justify-between text-xs font-bold text-purple-800">
              <span>Printable PDF & Slideshow Loop</span>
              <Check size={16} className="text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Action Callout Banner */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-[#111115] via-[#1a1727] to-[#111115] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl border border-white/10">
          <div>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
              Ready to bring your script to life?
            </h3>
            <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-xl">
              Start by building your character cast or jump straight into the studio to paste your screenplay.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/characters">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3.5 rounded-xl bg-[#7928ca] hover:bg-[#621bb3] text-white font-bold text-sm shadow-lg shadow-purple-900/50 flex items-center gap-2 cursor-pointer transition"
              >
                <Users size={16} /> Create Character Cast
              </motion.button>
            </Link>

            <Link href="/studio">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm flex items-center gap-2 cursor-pointer transition"
              >
                <Play size={15} fill="currentColor" /> Open Studio Directly
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/10 py-8 px-6 md:px-12 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-zinc-600">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#7928ca] text-white flex items-center justify-center">
            <Sparkles size={11} />
          </div>
          <span className="font-bold text-[#111115]">VIZZY</span>
          <span>— Collaborative Graphic Novel & Storyboard Creator</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="hover:text-purple-700 transition">How It Works</a>
          <Link href="/characters" className="hover:text-purple-700 transition">Characters</Link>
          <Link href="/studio" className="hover:text-purple-700 transition">Studio</Link>
        </div>
      </footer>
    </div>
  );
}
