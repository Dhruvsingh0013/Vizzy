import type { Metadata } from "next";
import "./globals.css";
import PointerParticleTrail from "./PointerParticleTrail";

const geistSans = { variable: "--font-geist-sans" };
const geistMono = { variable: "--font-geist-mono" };

export const metadata: Metadata = {
  title: "Vizzy - Visual Storytelling Platform",
  description: "AI-Powered Visual Storytelling Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <PointerParticleTrail />
        {children}
      </body>
    </html>
  );
}
