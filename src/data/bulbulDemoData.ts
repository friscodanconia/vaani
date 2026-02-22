export interface BulbulVoice {
  language: string;
  nativeName: string;
  languageCode: string;
  voice: string;
  audioFile: string;
  translation: string;
}

export const BULBUL_SOURCE_TEXT = "Welcome to India, a land of a thousand languages and a billion stories.";

// Cached output from the real Sarvam Translate + Bulbul TTS APIs
// Generated: 2026-02-22
export const BULBUL_VOICES: BulbulVoice[] = [
  {
    language: "Hindi",
    nativeName: "हिन्दी",
    languageCode: "hi-IN",
    voice: "priya",
    audioFile: "/bulbul-hi-IN.mp3",
    translation: "भारत, एक हज़ार भाषाओं और एक अरब कहानियों की भूमि, आपका स्वागत है।",
  },
  {
    language: "Tamil",
    nativeName: "தமிழ்",
    languageCode: "ta-IN",
    voice: "priya",
    audioFile: "/bulbul-ta-IN.mp3",
    translation: "ஆயிரம் மொழிகள் கொண்ட, ஒரு பில்லியன் கதைகளைக் கொண்ட இந்தியாவுக்கு வருக.",
  },
  {
    language: "Bengali",
    nativeName: "বাংলা",
    languageCode: "bn-IN",
    voice: "priya",
    audioFile: "/bulbul-bn-IN.mp3",
    translation: "এক হাজার ভাষা এবং একশো গল্পের দেশ ভারতে আপনাকে স্বাগত।",
  },
  {
    language: "Telugu",
    nativeName: "తెలుగు",
    languageCode: "te-IN",
    voice: "priya",
    audioFile: "/bulbul-te-IN.mp3",
    translation: "వెయ్యి భాషలకు, కోట్లాది కథలకు నిలయమైన భారతదేశానికి స్వాగతం.",
  },
  {
    language: "Kannada",
    nativeName: "ಕನ್ನಡ",
    languageCode: "kn-IN",
    voice: "priya",
    audioFile: "/bulbul-kn-IN.mp3",
    translation: "ಭಾರತಕ್ಕೆ ನೂರಾರು ಭಾಷೆಗಳಿರುವ ಮತ್ತು ನೂರಾರು ಕಥೆಗಳಿರುವ ನಾಡಿಗೆ ಸ್ವಾಗತ.",
  },
];
