# Vaani — Talk to Any Document in Any Indian Language

## What This Is
A Next.js app that lets users upload a document (PDF/image), ask questions about it by speaking in any Indian language, and hear answers spoken back in their language. Powered by 6 Sarvam AI APIs.

Demo: watch an animated walkthrough. Try It: upload your own doc and talk to it live.

## Stack
- **Framework**: Next.js 16 (App Router) with React 19, TypeScript
- **Styling**: Tailwind CSS v4 with CSS custom properties for theming
- **Fonts**: Playfair Display (display) + DM Sans (body) via Google Fonts
- **APIs**: All 6 Sarvam AI APIs (see Pipeline below)
- **Env**: `SARVAM_API_KEY` in `.env.local`

## Architecture

### Pipeline (6 stages, in order)
| Stage | API | What It Does |
|-------|-----|-------------|
| `parse` | Document Intelligence | OCR — extracts text from PDF/image |
| `stt` | Saarika (v3) | Speech-to-text — transcribes user's voice |
| `lid` | Language ID | Detects which language user spoke |
| `llm` | Sarvam-M | Answers the question using document context |
| `translate` | Mayura (v1) | Translates English answer to user's language |
| `tts` | Bulbul (v3) | Text-to-speech — speaks the answer aloud |

### File Structure
```
src/
├── app/
│   ├── page.tsx          # Main page — mode switcher (demo/try), "Try It" flow
│   ├── layout.tsx        # HTML shell, fonts
│   ├── globals.css       # Theme variables, glass-card styles, animations
│   └── api/              # Server-side route handlers (one per Sarvam API)
│       ├── ask/route.ts          # LLM (chat completion)
│       ├── detect-language/route.ts  # LID
│       ├── parse-document/route.ts   # Document Intelligence
│       ├── synthesize/route.ts       # TTS
│       ├── transcribe/route.ts       # STT
│       └── translate/route.ts        # Translation
├── components/
│   ├── DemoView.tsx      # Animated demo — multi-turn conversation walkthrough
│   ├── AgentSwarmView.tsx # "The Crew" — 6 agent cards in a relay chain
│   ├── AnswerCard.tsx    # Answer display with language badge + audio play
│   ├── DocumentViewer.tsx # Document preview card
│   ├── DocumentUpload.tsx # File upload dropzone
│   ├── VoiceInput.tsx    # Mic button with recording/processing states
│   ├── LanguageBadge.tsx # Language indicator pill
│   └── PipelineView.tsx  # Legacy pipeline view (not used in demo mode)
└── lib/
    ├── constants.ts      # Languages, pipeline stages, agent personas
    ├── demoData.ts       # Demo scenarios, timing configs, multi-turn data
    ├── sarvam.ts         # Sarvam API client functions
    └── audioRecorder.ts  # Browser MediaRecorder wrapper
```

### Key Patterns

**Theme system**: CSS custom properties in `globals.css` (warm light palette — cream, clay, terracotta). All components use `var(--accent)`, `var(--text-primary)`, etc. Glass-card effect via `.glass-card` class.

**Demo mode (DemoView.tsx)**: Multi-turn animated demo showing 2 conversation turns per language.
- Turn 1: Full pipeline (parse → stt → lid → llm → translate → tts) with animated crew cards
- Turn 2: Follow-up question — parse stays "done", other stages reset and re-animate with faster timing
- `DEMO_STAGE_TIMING` for turn 1, `DEMO_STAGE_TIMING_FOLLOWUP` for turn 2 (skips parse, faster durations)
- `chatHistory` accumulates completed turns; output renders as a chat thread with "Turn N" badges
- 5 languages: Tamil, Hindi, Bengali, Telugu, Kannada — each with 2 pre-scripted Q&A turns
- The demo auto-plays on load and auto-advances between turns with a 1.5s pause

**DemoScenario data structure** (`demoData.ts`):
```ts
interface DemoTurn { question, questionEnglish, answer, translatedAnswer }
interface DemoScenario { languageCode, languageName, nativeName, turns: DemoTurn[] }
```

**Agent Crew (AgentSwarmView.tsx)**: 6 named agents (Arjun, Priya, Kavi, Vidya, Maya, Rahi) shown as cards in a horizontal relay chain (desktop) or 2-column grid (mobile). Flow labels dynamically update based on selected language.

**Try It mode (page.tsx)**: Real pipeline — upload PDF → record voice → stages fire sequentially via API calls → answer card with audio playback. Q&A history stacks (newest first).

**Sarvam API client** (`sarvam.ts`): Functions for each API. Document parsing supports images (multimodal via Sarvam-M) and PDFs (Document Intelligence job-based API with polling, fallback to Sarvam-M).

## Design Language
- Warm light palette: cream background, clay/terracotta accents
- `.glass-card` for all card containers
- Animations: `anim-slide-up`, `anim-fade-in`, `anim-float` (CSS keyframes)
- Typography: Playfair Display italic for "Vaani" title, DM Sans for everything else
- Section labels with numbered step circles and horizontal rules

## Running Locally
```bash
npm install
# Create .env.local with: SARVAM_API_KEY=your_key_here
npm run dev
# Open http://localhost:3000
```

## Current State (Feb 2026)
- Multi-turn demo conversation: 2 turns per language showing follow-up questions
- All 6 Sarvam APIs integrated and working
- Warm light theme finalized
- Agent Crew visualization with relay arrows
- Ready for Vercel deployment (just needs env var)
