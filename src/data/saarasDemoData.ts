export interface SaarasScenario {
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  transcript: string;
  languageTags: string[];
  durationLabel: string;
}

export const SAARAS_SCENARIOS: SaarasScenario[] = [
  {
    title: "Code-Mixed Conversation",
    subtitle: "Hindi + English",
    icon: "🗣️",
    description: "A customer support call where the speaker switches between Hindi and English mid-sentence.",
    transcript:
      "Haan, mujhe ek problem hai mere account mein... basically I can't login since morning. Maine password reset try kiya but woh bhi kaam nahi kar raha. Can you please check my account? Mera email hai sharma.rahul@gmail.com... haan, R-A-H-U-L dot sharma.",
    languageTags: ["Hindi", "English", "Code-Mixed"],
    durationLabel: "12 seconds",
  },
  {
    title: "Meeting with Diarization",
    subtitle: "Multi-speaker Tamil",
    icon: "👥",
    description: "A team meeting in Tamil with three speakers discussing a project timeline.",
    transcript:
      "[Speaker 1] அடுத்த வாரம் deadline இருக்கு, நாம ready-ஆ?\n\n[Speaker 2] Backend ready, ஆனா frontend testing pending.\n\n[Speaker 3] QA team-கிட்ட நான் already சொல்லிட்டேன், tomorrow-ல start பண்ணுவாங்க.\n\n[Speaker 1] Okay, daily standup-ல update பண்ணுங்க.",
    languageTags: ["Tamil", "English", "3 Speakers"],
    durationLabel: "18 seconds",
  },
  {
    title: "Noisy Phone Call",
    subtitle: "Bengali in traffic",
    icon: "📱",
    description: "A Bengali phone call recorded in heavy Kolkata traffic — horns, engines, and wind noise.",
    transcript:
      "হ্যালো? হ্যাঁ দাদা, আমি এখন Park Street-এ আছি... [traffic noise] ...হ্যাঁ, medicine টা কিনে নিয়ে আসছি। Doctor বলেছেন দিনে দুবার খেতে হবে... [horn]... হ্যাঁ হ্যাঁ, রাতে আসব, worry করবেন না।",
    languageTags: ["Bengali", "Noisy Environment"],
    durationLabel: "9 seconds",
  },
];
