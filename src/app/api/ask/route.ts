import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/sarvam";

export async function POST(req: NextRequest) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SARVAM_API_KEY not set" }, { status: 500 });
  }

  try {
    const { documentText, question } = await req.json();
    if (!documentText || !question) {
      return NextResponse.json({ error: "Missing documentText or question" }, { status: 400 });
    }

    const answer = await chatCompletion(documentText, question, apiKey);
    return NextResponse.json({ answer });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Chat completion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
