# Vizzy 🎬🎨

### AI-Powered Graphic Novel & Storyboard Creator

Vizzy is an interactive visual storytelling and storyboard creation suite powered by Google Gemini.

It helps transform story ideas, scene descriptions, director notes, and scripts into structured visual storyboards with characters, scene panels, cinematic framing options, slideshow playback, and graphic-novel layouts.

---

## ✨ Features

### 🤖 AI Creative Director

Interact with Vizzy's AI Creative Director to develop scenes, refine visual ideas, and explore cinematic composition.

The AI can help with:

- Scene development
- Visual descriptions
- Camera direction
- Lighting and atmosphere
- Story and panel refinement
- Creative suggestions

---

### 👤 Character Development

Create and manage characters for your story.

Each character can contain:

- Character name
- Role
- Appearance description
- Personality information
- Character reference image

Character information can be incorporated into scene prompts to encourage visual consistency across the storyboard.

> Note: Exact facial and costume consistency depends on the capabilities and availability of the configured image-generation model.

---

### 🎬 Scene & Storyboard Generation

Create visual scene candidates from your story descriptions.

Vizzy supports cinematic framing such as:

- Wide Shot
- Dynamic Action
- Close-Up
- Medium Shot
- Over-the-Shoulder
- Low Angle
- High Angle

Generated scene candidates can be reviewed, refined, and added to the storyboard timeline.

---

### 🎨 Visual Direction

Each scene can be controlled using visual direction settings including:

- Location
- Time of day
- Mood
- Camera
- Lighting
- Visual style

Available visual styles include:

- Cinematic
- Graphic Novel
- Comic Book
- Storyboard
- Anime
- Realistic

---

### 📝 Script & Scene Import

Vizzy supports importing screenplay-style text and scene notes into storyboard panels.

The importer can split structured text into sequential scene panels and extract basic dialogue and scene information.

> The current importer is a lightweight parser. It is not intended to replace a full screenplay-analysis system.

---

### 🎞️ Storyboard Timeline

Manage your story through an interactive panel timeline.

You can:

- Add panels
- Edit panels
- Delete panels
- Reorder panels
- Duplicate panels
- Select generated candidates
- Refine visual ideas
- Organize scenes into a visual sequence

---

### ▶️ Cinematic Slideshow

Preview your storyboard as an animated presentation.

The slideshow includes:

- Automatic scene playback
- Previous/next navigation
- Play/pause controls
- Playback speed controls
- Ken Burns pan-and-zoom animation
- Transition effects
- Optional Web Audio effects
- Fullscreen presentation

---

### 📖 Graphic Novel View

Vizzy includes a graphic-novel style presentation for viewing storyboard panels as a comic-style spread.

The layout can be used for:

- Story previews
- Presentation
- Visual planning
- Print / Save as PDF

---

### 🌌 Dynamic Studio Environment

The Studio uses an immersive glassmorphic interface with cinematic background environments.

The visual environments include:

- Ocean Escape
- 1980s London
- Neo City
- Winter Forest
- Future Worlds

---

### 🌓 Light & Dark Mode

Switch between:

- Dark cinematic studio mode
- Light paper/manga-inspired mode

---

## 🧠 AI Image Generation

Vizzy can use Google Gemini's image-generation capabilities for character and scene artwork when the configured Gemini model and account support image generation.

Image-generation availability depends on:

- The selected Gemini model
- API access
- Account quota
- Current Google AI service availability

If AI image generation is unavailable, Vizzy may use a clearly labelled **development preview** so the rest of the storyboard workflow can still be tested.

Development previews are not AI-generated artwork.

---

## 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

### AI

- Google Gemini API
- `@google/genai`

### Browser Storage

Vizzy currently uses browser session storage for prototype project state, including:

- Project information
- Characters
- Storyboard panels
- Generated image data

A production version could move this data to a database and object storage service.

---

## 📁 Application Architecture

```text
Vizzy/
│
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts
│   │   │
│   │   ├── generate-character/
│   │   │   └── route.ts
│   │   │
│   │   └── generate-scene/
│   │       └── route.ts
│   │
│   ├── characters/
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── GraphicNovelSpreadModal.tsx
│   │   ├── ScriptImportModal.tsx
│   │   ├── SlideshowPlayer.tsx
│   │   └── ...
│   │
│   ├── studio/
│   │   └── page.tsx
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── public/
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
