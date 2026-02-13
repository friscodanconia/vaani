import { NextRequest, NextResponse } from "next/server";
import { parseDocument } from "@/lib/sarvam";

export async function POST(req: NextRequest) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SARVAM_API_KEY not set" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const result = await parseDocument(file, apiKey);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Document parsing failed";
    console.error("Parse document error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
