export interface MayuraRound {
  original: string;
  originalLanguage: string;
  context: string;
  badTranslation: string;
  badNote: string;
  mayuraTranslation: string;
  mayuraNote: string;
}

export const MAYURA_ROUNDS: MayuraRound[] = [
  {
    original: "Bhai, kal ka plan pakka hai na? Chal, thoda jaldi aa, nahi toh sab bigad jayega.",
    originalLanguage: "Hindi (colloquial)",
    context: "Friends planning a trip",
    badTranslation: "Brother, is tomorrow's plan confirmed? Come a little early, otherwise everything will be spoiled.",
    badNote: "Literal: \"brother\", \"spoiled\" sound awkward. Misses the casual tone.",
    mayuraTranslation: "Hey, we're still on for tomorrow right? Come early, or the whole thing falls apart.",
    mayuraNote: "Natural English. Captures the casual urgency of the original.",
  },
  {
    original: "அக்கா, கொஞ்சம் தயிர் சாதம் இருக்கா? வயிறு கொஞ்சம் சரி இல்ல.",
    originalLanguage: "Tamil (spoken)",
    context: "Asking a family member for comfort food",
    badTranslation: "Elder sister, is there some curd rice? Stomach is a little not well.",
    badNote: "\"Elder sister\", \"not well\": grammatically correct but sounds robotic.",
    mayuraTranslation: "Akka, do you have some curd rice? My stomach's a bit off.",
    mayuraNote: "Keeps 'Akka' (culturally right), natural phrasing for feeling unwell.",
  },
  {
    original: "দাদা, একটু চা খাবেন? বাইরে তো বৃষ্টি পড়ছে, একটু জিরিয়ে নিন।",
    originalLanguage: "Bengali (warm, hospitable)",
    context: "Offering tea to a guest during rain",
    badTranslation: "Elder brother, will you eat some tea? Outside rain is falling, take some rest.",
    badNote: "\"Eat tea\" is a literal translation of চা খাবেন. Sounds bizarre in English.",
    mayuraTranslation: "Would you like some tea? It's raining outside, sit down, take a break.",
    mayuraNote: "Drops the literal honorific, fixes 'eat tea' to 'have tea', captures warmth.",
  },
];
