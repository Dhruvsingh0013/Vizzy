"use client";

import React, { useEffect, useRef } from "react";

export default function PointerParticleTrail() {
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
      maxSize: number;
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
      "rgba(168, 85, 247, ",  // soft purple
      "rgba(236, 72, 153, ",  // soft pink
      "rgba(59, 130, 246, ",  // soft blue
      "rgba(6, 182, 212, ",   // soft cyan
      "rgba(139, 92, 246, ",  // soft violet
    ];

    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      // Only spawn if mouse has moved a small distance to keep density low and subtle
      if (dist > 8) {
        lastX = e.clientX;
        lastY = e.clientY;

        const colorBase = colors[Math.floor(Math.random() * colors.length)];
        const initialSize = Math.random() * 2 + 1.5;

        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 4,
          y: e.clientY + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 1.0,
          vy: (Math.random() - 0.5) * 1.0 - 0.4, // subtle upward drift
          color: colorBase,
          size: initialSize,
          maxSize: initialSize + Math.random() * 2 + 1,
          alpha: 0.5, // Reduced starting intensity
          decay: Math.random() * 0.02 + 0.018, // Fades out faster & smoother
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

        if (p.size < p.maxSize) {
          p.size += 0.08;
        }

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Soft subtle glow
        ctx.shadowBlur = 4;
        ctx.shadowColor = `${p.color}${p.alpha * 0.5})`;

        // Main bubble body (lower opacity)
        ctx.fillStyle = `${p.color}${p.alpha * 0.45})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Delicate inner highlight
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x - p.size * 0.25, p.y - p.size * 0.25, Math.max(0.8, p.size * 0.2), 0, Math.PI * 2);
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

  return (
    <canvas
      ref={canvasRef}
      id="sparkle-canvas"
      className="fixed inset-0 pointer-events-none z-[9999]"
    />
  );
}
