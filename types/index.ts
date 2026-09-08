export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  image?: string;
}

export interface ProjectData {
  title: string;
  storyType: string;
  idea: string;
  world?: string;
  tone?: string;
  colorEmphasis?: string;
}

export interface PanelCandidate {
  id: string;
  image: string;
  label: string;
  description: string;
  source: "gemini" | "development-fallback";
  caption?: string;
  dialogue?: string;
}

export interface SlidePanel {
  id: string;
  title: string;
  description: string;
  image: string;
  caption?: string;
  dialogue?: string;
  source?: "gemini" | "development-fallback";
}

export interface ChatMessage {
  id: string;
  sender: "vizzy" | "user";
  text: string;
  timestamp: string;
  candidates?: PanelCandidate[];
  selectedCandidateId?: string;
  approved?: boolean;
  isError?: boolean;
  canRetry?: boolean;
  retryPrompt?: string;
}

export interface ScriptParsedBeat {
  title: string;
  description: string;
  caption?: string;
  dialogue?: string;
  characters?: string[];
  camera?: string;
  mood?: string;
  location?: string;
}

export interface GenerateSceneResponse {
  success: boolean;
  sceneId?: string;
  options: PanelCandidate[];
  image?: string;
  source: "gemini" | "development-fallback";
  message?: string;
  error?: string;
}

export interface ParseScriptResponse {
  success: boolean;
  beats: ScriptParsedBeat[];
  parsedBy: "gemini" | "heuristic";
  error?: string;
}

export interface GenerateCastRequest {
  title: string;
  storyline: string;
  storyType?: string;
  colorEmphasis?: string;
}

export interface GenerateCastResponse {
  success: boolean;
  characters: Character[];
  openingSceneBeat?: {
    title: string;
    description: string;
    caption: string;
    dialogue?: string;
  };
  parsedBy: "gemini" | "heuristic";
  error?: string;
}

