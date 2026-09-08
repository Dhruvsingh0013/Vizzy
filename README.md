# Vizzy 🎬🎨
### AI-Powered Graphic Novel & Visual Storyboard Creator

Vizzy is an interactive web application that transforms screenplays, story treatments, and director notes into living graphic novels and cinematic storyboards through a collaborative AI directing process.

---

## 🌟 Key Features

- **Collaborative AI Director**: Direct scene-by-scene with Vizzy in real-time chat. Propose visual ideas, dial in atmosphere, and explore story directions.
- **Three-Angle Framing Engine**: For every scene beat, Vizzy generates 3 framing candidate variations (Wide Shot, Dynamic Action, and Close-up/Intimate). Inspect candidates, refine prompts directly in chat, and lock your chosen take into the timeline.
- **Character Cast Studio**: Develop your story's cast with visual reference portraits. Character descriptions and reference details are incorporated into scene prompts to encourage visual consistency across panels.
- **Screenplay & Script Parser**: Paste raw screenplay text, scene outlines, or film notes. Vizzy utilizes Gemini 2.5 Flash to automatically detect scenes, extract dramatic actions, dialogue, captions, and camera angles into an ordered sequence.
- **Interactive Story Timeline**: Reorder panels, delete scenes, or hand-edit titles, descriptions, and dialogue anytime.
- **Dual Presentation & Export Formats**:
  - **Auto-Running Slideshow Loop**: Fullscreen cinematic playback with Web Audio atmospheric chime transitions, Ken Burns pan-and-zoom motion, comic dialogue bubbles, and adjustable playback speeds (Fast, 1X, Slow).
  - **Graphic Novel Page Spread**: Multi-panel spread layout engineered with dedicated `@media print` styles for clean "Print / Save as PDF" export directly through the browser.
- **Dynamic Studio Aesthetics**: Translucent glassmorphism with 5 rotating backdrop themes and a quick-toggle between Dark Studio Mode and Light Manga Paper Mode.
- **Transparent AI Operation**: Honest labeling across all visuals. In offline or development environments without an active Imagen quota, panels display a clear `Development Preview (AI unavailable)` badge and banner rather than masquerading as AI outputs.

---

## 🏗️ Architecture & Pages

- **`/` (Landing Page)**: Overview of the creative process from raw script to visual book, interactive particle trail, and quick links to the studio.
- **`/characters` (Cast Studio)**: Character builder with role assignment, appearance descriptions, and reference portrait generation.
- **`/studio` (Director Studio)**: Core creative workspace featuring:
  - Real-time director chat with Vizzy
  - Framing candidate preview and refinement cards
  - Story presets (D-Day Normandy, Cyberpunk 2088, Victorian Gothic Mystery)
  - Raw script import modal with automatic beat parsing
  - Timeline panel sequence editor
  - Slideshow player and graphic novel spread modals

---

## 🤖 AI Models & Integration

Vizzy leverages the official `@google/genai` SDK with server-side API routing:

1. **Scene Framing & Character Portraits**: Powered by Google's `imagen-3.0-generate-002`.
2. **Creative Director Chat & Script Parsing**: Powered by `gemini-2.5-flash` for high-speed, structured multimodal reasoning.
3. **Graceful Fallbacks**: If the Gemini API key is unconfigured, rate-limited, or unavailable, Vizzy falls back to structured development preview frames with explicit UI badges so work can proceed uninterrupted.

---

## 📋 Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)
- **Google Gemini API Key**: A valid key with access to Gemini 2.5 Flash and Imagen 3 (available via [Google AI Studio](https://aistudio.google.com/)).

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/vizzy.git
cd vizzy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Your Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```

Open `.env.local` and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

> **Note**: `GEMINI_API_KEY` is strictly used server-side in Next.js Route Handlers (`app/api/*`). It is never exposed in client bundles. `.env.local` is included in `.gitignore` and is never committed to source control.

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## ⚠️ Known Limitations

1. **Session-Based Storage**: Projects, characters, and panels are persisted in browser `sessionStorage`. Data persists across page reloads and between the `/characters` and `/studio` views within the same browser session. Closing the browser tab resets the session.
2. **Storage Quota**: Very long stories containing dozens of high-resolution images may reach browser storage limits (typically ~5MB for `sessionStorage`). Vizzy detects `QuotaExceededError` gracefully and alerts the user while keeping all panels active in live memory.
3. **Character Consistency**: Generative AI models generate new imagery per prompt. Character visual descriptions and reference notes are automatically injected into scene prompts to encourage visual consistency, but slight variations across panels can occur.
4. **Imagen 3 Availability**: Imagen 3 generation requires appropriate quota in Google AI Studio. If the API returns a quota error or is unavailable in your region, Vizzy switches to labeled development previews with visible retry buttons.
5. **PDF Export**: PDF creation uses the browser's native print engine (`window.print()`). For optimal results, select "Save as PDF", enable "Background graphics", and set margins to "None" in the print dialog.

---

## 🧪 Code Quality & Verification

The codebase adheres to strict TypeScript and ESLint standards:
```bash
# Run ESLint (0 errors)
npm run lint

# Run production build
npm run build
```

---

## 📄 License

MIT License. See `LICENSE` for details.
