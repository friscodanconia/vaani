import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/sarvam";

export async function POST(req: NextRequest) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SARVAM_API_KEY not set" }, { status: 500 });
  }

  try {
    const { text, targetLang, voice } = await req.json();
    if (!text || !targetLang || !voice) {
      return NextResponse.json({ error: "Missing text, targetLang, or voice" }, { status: 400 });
    }

    const audioBase64 = await synthesizeSpeech(text, targetLang, voice, apiKey);
    return NextResponse.json({ audio: audioBase64 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Synthesis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
