import type { PipelineStage } from "./constants";

export interface DemoTurn {
  question: string;
  questionEnglish: string;
  answer: string;
  translatedAnswer: string;
}

export interface DemoScenario {
  languageCode: string;
  languageName: string;
  nativeName: string;
  turns: DemoTurn[];
}

export const DEMO_DOCUMENT = {
  fileName: "PM-KISAN_Application_Form.pdf",
  textLength: 2840,
  pageCount: 2,
  textSnippet:
    "प्रधानमंत्री किसान सम्मान निधि योजना — आवेदन पत्र\n\nयोजना का उद्देश्य: छोटे और सीमांत किसानों को प्रति वर्ष ₹6,000 की आर्थिक सहायता...",
};

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    languageCode: "ta-IN",
    languageName: "Tamil",
    nativeName: "தமிழ்",
    turns: [
      {
        question: "இந்த படிவத்தை யார் நிரப்ப வேண்டும்?",
        questionEnglish: "Who should fill this form?",
        answer: "This form should be filled by small and marginal farmers who own cultivable land up to 2 hectares.",
        translatedAnswer: "இந்தப் படிவத்தை 2 ஹெக்டேர் வரை சாகுபடி நிலம் வைத்திருக்கும் சிறு மற்றும் குறு விவசாயிகள் நிரப்ப வேண்டும்.",
      },
      {
        question: "எவ்வளவு பணம் கிடைக்கும்?",
        questionEnglish: "How much money will I get?",
        answer: "You will receive ₹6,000 per year, paid in three equal installments of ₹2,000 every four months directly to your bank account.",
        translatedAnswer: "நீங்கள் ஆண்டுக்கு ₹6,000 பெறுவீர்கள், ஒவ்வொரு நான்கு மாதங்களுக்கும் ₹2,000 வீதம் மூன்று சம தவணைகளில் உங்கள் வங்கிக் கணக்கில் நேரடியாக செலுத்தப்படும்.",
      },
    ],
  },
  {
    languageCode: "hi-IN",
    languageName: "Hindi",
    nativeName: "हिन्दी",
    turns: [
      {
        question: "इस फॉर्म को कौन भर सकता है?",
        questionEnglish: "Who can fill this form?",
        answer: "This form should be filled by small and marginal farmers who own cultivable land up to 2 hectares.",
        translatedAnswer: "इस फॉर्म को 2 हेक्टेयर तक खेती योग्य भूमि वाले छोटे और सीमांत किसान भर सकते हैं।",
      },
      {
        question: "कितना पैसा मिलेगा?",
        questionEnglish: "How much money will I get?",
        answer: "You will receive ₹6,000 per year, paid in three equal installments of ₹2,000 every four months directly to your bank account.",
        translatedAnswer: "आपको प्रति वर्ष ₹6,000 मिलेंगे, जो हर चार महीने में ₹2,000 की तीन समान किस्तों में सीधे आपके बैंक खाते में भेजे जाएंगे।",
      },
    ],
  },
  {
    languageCode: "bn-IN",
    languageName: "Bengali",
    nativeName: "বাংলা",
    turns: [
      {
        question: "এই ফর্মটি কে পূরণ করবে?",
        questionEnglish: "Who should fill this form?",
        answer: "This form should be filled by small and marginal farmers who own cultivable land up to 2 hectares.",
        translatedAnswer: "এই ফর্মটি ২ হেক্টর পর্যন্ত চাষযোগ্য জমির মালিক ক্ষুদ্র ও প্রান্তিক কৃষকদের পূরণ করতে হবে।",
      },
      {
        question: "কত টাকা পাওয়া যাবে?",
        questionEnglish: "How much money will I get?",
        answer: "You will receive ₹6,000 per year, paid in three equal installments of ₹2,000 every four months directly to your bank account.",
        translatedAnswer: "আপনি বছরে ₹৬,০০০ পাবেন, প্রতি চার মাসে ₹২,০০০ করে তিনটি সমান কিস্তিতে সরাসরি আপনার ব্যাংক অ্যাকাউন্টে পাঠানো হবে।",
      },
    ],
  },
  {
    languageCode: "te-IN",
    languageName: "Telugu",
    nativeName: "తెలుగు",
    turns: [
      {
        question: "ఈ ఫారమ్‌ను ఎవరు నింపాలి?",
        questionEnglish: "Who should fill this form?",
        answer: "This form should be filled by small and marginal farmers who own cultivable land up to 2 hectares.",
        translatedAnswer: "ఈ ఫారమ్‌ను 2 హెక్టార్ల వరకు సాగు భూమి ఉన్న చిన్న మరియు సన్నకారు రైతులు నింపాలి.",
      },
      {
        question: "ఎంత డబ్బు వస్తుంది?",
        questionEnglish: "How much money will I get?",
        answer: "You will receive ₹6,000 per year, paid in three equal installments of ₹2,000 every four months directly to your bank account.",
        translatedAnswer: "మీకు సంవత్సరానికి ₹6,000 అందుతుంది, ప్రతి నాలుగు నెలలకు ₹2,000 చొప్పున మూడు సమాన వాయిదాల్లో నేరుగా మీ బ్యాంకు ఖాతాలో జమ చేయబడుతుంది.",
      },
    ],
  },
  {
    languageCode: "kn-IN",
    languageName: "Kannada",
    nativeName: "ಕನ್ನಡ",
    turns: [
      {
        question: "ಈ ಫಾರ್ಮ್ ಅನ್ನು ಯಾರು ಭರ್ತಿ ಮಾಡಬೇಕು?",
        questionEnglish: "Who should fill this form?",
        answer: "This form should be filled by small and marginal farmers who own cultivable land up to 2 hectares.",
        translatedAnswer: "ಈ ಫಾರ್ಮ್ ಅನ್ನು 2 ಹೆಕ್ಟೇರ್ ವರೆಗೆ ಸಾಗುವಳಿ ಭೂಮಿ ಹೊಂದಿರುವ ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ರೈತರು ಭರ್ತಿ ಮಾಡಬೇಕು.",
      },
      {
        question: "ಎಷ್ಟು ಹಣ ಸಿಗುತ್ತದೆ?",
        questionEnglish: "How much money will I get?",
        answer: "You will receive ₹6,000 per year, paid in three equal installments of ₹2,000 every four months directly to your bank account.",
        translatedAnswer: "ನೀವು ವರ್ಷಕ್ಕೆ ₹6,000 ಪಡೆಯುತ್ತೀರಿ, ಪ್ರತಿ ನಾಲ್ಕು ತಿಂಗಳಿಗೆ ₹2,000 ಹಾಗೆ ಮೂರು ಸಮಾನ ಕಂತುಗಳಲ್ಲಿ ನೇರವಾಗಿ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಪಾವತಿಸಲಾಗುತ್ತದೆ.",
      },
    ],
  },
];

export const DEMO_STAGE_TIMING: { id: PipelineStage; delayBefore: number; duration: number }[] = [
  { id: "parse", delayBefore: 0, duration: 1400 },
  { id: "stt", delayBefore: 500, duration: 900 },
  { id: "llm", delayBefore: 200, duration: 2000 },
  { id: "translate", delayBefore: 200, duration: 700 },
  { id: "tts", delayBefore: 200, duration: 550 },
];

// Follow-up turn: skips parse, slightly faster
export const DEMO_STAGE_TIMING_FOLLOWUP: { id: PipelineStage; delayBefore: number; duration: number }[] = [
  { id: "stt", delayBefore: 0, duration: 800 },
  { id: "llm", delayBefore: 200, duration: 1600 },
  { id: "translate", delayBefore: 200, duration: 600 },
  { id: "tts", delayBefore: 200, duration: 500 },
];

export const DEMO_TOTAL_TIME_MS = 6300;

// Backwards compat — default scenario
export const DEMO = {
  document: DEMO_DOCUMENT,
  question: DEMO_SCENARIOS[0].turns[0].question,
  answer: DEMO_SCENARIOS[0].turns[0].answer,
  translatedAnswer: DEMO_SCENARIOS[0].turns[0].translatedAnswer,
  languageCode: DEMO_SCENARIOS[0].languageCode,
  stageTiming: DEMO_STAGE_TIMING,
  totalTimeMs: DEMO_TOTAL_TIME_MS,
};
