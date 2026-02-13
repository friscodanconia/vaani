import { NextRequest, NextResponse } from "next/server";
import { detectLanguage } from "@/lib/sarvam";

export async function POST(req: NextRequest) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SARVAM_API_KEY not set" }, { status: 500 });
  }

  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const result = await detectLanguage(text, apiKey);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Language detection failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
