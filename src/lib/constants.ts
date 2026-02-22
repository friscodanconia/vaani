export const SUPPORTED_LANGUAGES: Record<string, { name: string; voice: string; nativeName: string }> = {
  "hi-IN": { name: "Hindi", nativeName: "हिन्दी", voice: "priya" },
  "ta-IN": { name: "Tamil", nativeName: "தமிழ்", voice: "priya" },
  "te-IN": { name: "Telugu", nativeName: "తెలుగు", voice: "priya" },
  "kn-IN": { name: "Kannada", nativeName: "ಕನ್ನಡ", voice: "priya" },
  "ml-IN": { name: "Malayalam", nativeName: "മലയാളം", voice: "priya" },
  "bn-IN": { name: "Bengali", nativeName: "বাংলা", voice: "priya" },
  "gu-IN": { name: "Gujarati", nativeName: "ગુજરાતી", voice: "priya" },
  "mr-IN": { name: "Marathi", nativeName: "मराठी", voice: "priya" },
  "pa-IN": { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", voice: "priya" },
  "or-IN": { name: "Odia", nativeName: "ଓଡ଼ିଆ", voice: "priya" },
  "en-IN": { name: "English", nativeName: "English", voice: "priya" },
};

export type PipelineStage = "parse" | "stt" | "llm" | "translate" | "tts";

export const PIPELINE_STAGES: { id: PipelineStage; label: string; apiName: string }[] = [
  { id: "parse", label: "OCR", apiName: "Sarvam Vision" },
  { id: "stt", label: "STT", apiName: "Saaras" },
  { id: "llm", label: "LLM", apiName: "Sarvam-M" },
  { id: "translate", label: "Trans", apiName: "Mayura" },
  { id: "tts", label: "TTS", apiName: "Bulbul" },
];

export type StageStatus = "idle" | "active" | "done" | "error";

export const AGENT_PERSONAS: {
  id: PipelineStage; name: string; role: string; tagline: string;
  icon: string; apiName: string; flowIn: string; flowOut: string;
}[] = [
  { id: "parse", name: "Arjun", role: "Document Reader", tagline: "Extracts text from any document", icon: "\u{1F4C4}", apiName: "Sarvam Vision", flowIn: "Hindi PDF", flowOut: "Hindi text" },
  { id: "stt", name: "Priya", role: "Voice Transcriber", tagline: "Turns speech into text", icon: "\u{1F399}\uFE0F", apiName: "Saaras", flowIn: "Tamil voice", flowOut: "Tamil text" },
  { id: "llm", name: "Vidya", role: "Knowledge Engine", tagline: "Finds answers in documents", icon: "\u{1F9E0}", apiName: "Sarvam-M", flowIn: "Hindi doc + Tamil Q", flowOut: "English answer" },
  { id: "translate", name: "Maya", role: "Translator", tagline: "Translates between languages", icon: "\u{1F504}", apiName: "Mayura", flowIn: "English answer", flowOut: "Tamil answer" },
  { id: "tts", name: "Rahi", role: "Voice Artist", tagline: "Speaks the answer back to you", icon: "\u{1F50A}", apiName: "Bulbul", flowIn: "Tamil text", flowOut: "Tamil audio" },
];
