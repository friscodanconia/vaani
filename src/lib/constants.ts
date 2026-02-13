export const SUPPORTED_LANGUAGES: Record<string, { name: string; voice: string; nativeName: string }> = {
  "hi-IN": { name: "Hindi", nativeName: "हिन्दी", voice: "ananya" },
  "ta-IN": { name: "Tamil", nativeName: "தமிழ்", voice: "ananya" },
  "te-IN": { name: "Telugu", nativeName: "తెలుగు", voice: "ananya" },
  "kn-IN": { name: "Kannada", nativeName: "ಕನ್ನಡ", voice: "ananya" },
  "ml-IN": { name: "Malayalam", nativeName: "മലയാളം", voice: "ananya" },
  "bn-IN": { name: "Bengali", nativeName: "বাংলা", voice: "ananya" },
  "gu-IN": { name: "Gujarati", nativeName: "ગુજરાતી", voice: "ananya" },
  "mr-IN": { name: "Marathi", nativeName: "मराठी", voice: "ananya" },
  "pa-IN": { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", voice: "ananya" },
  "or-IN": { name: "Odia", nativeName: "ଓଡ଼ିଆ", voice: "ananya" },
  "en-IN": { name: "English", nativeName: "English", voice: "ananya" },
};

export type PipelineStage = "parse" | "stt" | "lid" | "llm" | "translate" | "tts";

export const PIPELINE_STAGES: { id: PipelineStage; label: string; apiName: string }[] = [
  { id: "parse", label: "OCR", apiName: "Document Intelligence" },
  { id: "stt", label: "STT", apiName: "Saarika" },
  { id: "lid", label: "LID", apiName: "Language ID" },
  { id: "llm", label: "LLM", apiName: "Sarvam-M" },
  { id: "translate", label: "Trans", apiName: "Mayura" },
  { id: "tts", label: "TTS", apiName: "Bulbul" },
];

export type StageStatus = "idle" | "active" | "done" | "error";
