# Vizzy 🎬🎨
### AI Collaborative Graphic Novel & Storyboard Creator

Vizzy is an interactive visual book and cinematic storyboard creation suite powered by Google Gemini. Transform raw screenplays, scene treatments, and director notes into living graphic novels, multi-panel spreads, and auto-running slideshow loops.

---

## ✨ Features

- **Collaborative AI Director**: Converse with Vizzy in real-time to analyze scene beats, dial in atmospheric lighting, and direct camera angles.
- **Visual Character Development**: Build your story's cast with Gemini portrait generation, ensuring persistent facial features and costume continuity across panels.
- **Three-Framing Candidate Engine**: For each scene beat, Vizzy generates 3 distinct visual framing options (Wide Shot, Dynamic Action, Close-up / Intimate) to select or refine directly in chat.
- **Dynamic Studio Environments**: Immersive, translucent glassmorphic interface with 5 rotating animated background environments (Ocean Escape, 1980s London, Neo City, Winter Forest, Future Worlds).
- **Light & Dark Mode**: Toggle between high-contrast dark studio mode and manga paper light mode with one click.
- **Screenplay & Script Parser**: Paste raw screenplays or outline notes to auto-split scenes into sequential story panels.
- **Dual Presentation & Export Formats**:
  - **Auto-Running Slideshow Loop**: Cinematic playback with Web Audio transition sound effects, Ken Burns pan-and-zoom, dialogue speech bubbles, and speed controls.
  - **Graphic Novel Page Spread**: Multi-panel print-ready layout with "Print / Save as PDF" support.

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd vizzy
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Gemini API Key
Create a `.env.local` file in the project root:
```bash
cp .env.example .env.local
```

Open `.env.local` and insert your Gemini API Key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
> Get a free API key at [Google AI Studio](https://aistudio.google.com/).

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production
```bash
npm run build
npm run start
```

---

## 📁 Application Architecture

- `/` — Landing page with introductory guide to the script-to-visuals process.
- `/characters` — Cast creator with Gemini reference portrait generation.
- `/studio` — Collaborative workspace with chat director, script importer, timeline editor, slideshow loop player, and graphic novel page spread.

---

## 🔒 Security Note

Your `.env.local` containing `GEMINI_API_KEY` is listed in `.gitignore` and is **never** committed or pushed to remote repositories.
