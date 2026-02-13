const SARVAM_BASE = "https://api.sarvam.ai";

export async function transcribeAudio(
  audioBlob: Blob,
  apiKey: string
): Promise<{ transcript: string; languageCode: string }> {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.wav");
  formData.append("language_code", "unknown");
  formData.append("model", "saaras:v3");
  formData.append("with_diarization", "false");
  formData.append("with_timestamps", "false");

  const res = await fetch(`${SARVAM_BASE}/speech-to-text`, {
    method: "POST",
    headers: { "api-subscription-key": apiKey },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`STT failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return {
    transcript: data.transcript || "",
    languageCode: data.language_code || "unknown",
  };
}

export async function detectLanguage(
  text: string,
  apiKey: string
): Promise<{ languageCode: string; scriptCode: string }> {
  const res = await fetch(`${SARVAM_BASE}/text-lid`, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: text }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Language ID failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return {
    languageCode: data.language_code || "unknown",
    scriptCode: data.script_code || "",
  };
}

export async function chatCompletion(
  documentText: string,
  question: string,
  apiKey: string
): Promise<string> {
  const res = await fetch(`${SARVAM_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sarvam-m",
      messages: [
        {
          role: "system",
          content: `You are a helpful document assistant. Answer questions based on the following document content. If the answer is not in the document, say so. Keep answers concise.\n\nDocument:\n${documentText}`,
        },
        {
          role: "user",
          content: question,
        },
      ],
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Chat failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string
): Promise<string> {
  const res = await fetch(`${SARVAM_BASE}/translate`, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text,
      source_language_code: sourceLang,
      target_language_code: targetLang,
      model: "mayura:v1",
      mode: "modern-colloquial",
      enable_preprocessing: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Translate failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.translated_text || "";
}

export async function synthesizeSpeech(
  text: string,
  targetLang: string,
  voice: string,
  apiKey: string
): Promise<string> {
  const res = await fetch(`${SARVAM_BASE}/text-to-speech`, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      target_language_code: targetLang,
      speaker: voice,
      model: "bulbul:v3",
      speech_sample_rate: 24000,
      output_audio_codec: "mp3",
      enable_preprocessing: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`TTS failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.audios?.[0] || "";
}

export async function parseDocument(
  file: Blob,
  apiKey: string
): Promise<{ text: string; pageCount: number }> {
  // Use Sarvam-M multimodal: send document as base64 image for text extraction
  // This is simpler than the job-based Document Intelligence API
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = file.type || "application/pdf";

  // For PDFs, we use a text extraction prompt via Sarvam-M
  // For images, we send as base64 in the chat completion
  const isImage = mimeType.startsWith("image/");

  if (isImage) {
    const res = await fetch(`${SARVAM_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sarvam-m",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract ALL text from this document image. Preserve the original language and formatting. Return only the extracted text, nothing else.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Document parse failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    return { text, pageCount: 1 };
  }

  // For PDFs: try the Document Intelligence API (job-based)
  // Step 1: Create a job
  const createRes = await fetch(`${SARVAM_BASE}/documents-intelligence/create-job`, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      file_type: "pdf",
      page_count: 0,
    }),
  });

  if (!createRes.ok) {
    // Fallback: treat PDF pages as images via a simpler approach
    // Just send the base64 to Sarvam-M with a text extraction prompt
    const res = await fetch(`${SARVAM_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sarvam-m",
        messages: [
          {
            role: "user",
            content: `Extract ALL text from this PDF document (provided as base64). Preserve the original language.\n\nBase64 PDF:\n${base64.substring(0, 50000)}`,
          },
        ],
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Document parse fallback failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    return { text, pageCount: 1 };
  }

  const jobData = await createRes.json();
  const jobId = jobData.job_id;

  // Step 2: Upload the file
  const uploadForm = new FormData();
  uploadForm.append("file", new Blob([arrayBuffer], { type: mimeType }), "document.pdf");

  const uploadRes = await fetch(`${SARVAM_BASE}/documents-intelligence/upload/${jobId}`, {
    method: "POST",
    headers: { "api-subscription-key": apiKey },
    body: uploadForm,
  });

  if (!uploadRes.ok) {
    throw new Error(`Document upload failed (${uploadRes.status})`);
  }

  // Step 3: Start the job
  const startRes = await fetch(`${SARVAM_BASE}/documents-intelligence/start/${jobId}`, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!startRes.ok) {
    throw new Error(`Job start failed (${startRes.status})`);
  }

  // Step 4: Poll for completion (max 30 seconds)
  let attempts = 0;
  while (attempts < 30) {
    await new Promise((r) => setTimeout(r, 1000));
    attempts++;

    const statusRes = await fetch(`${SARVAM_BASE}/documents-intelligence/status/${jobId}`, {
      method: "GET",
      headers: { "api-subscription-key": apiKey },
    });

    if (!statusRes.ok) continue;

    const statusData = await statusRes.json();
    if (statusData.status === "completed") {
      // Step 5: Download result
      const resultRes = await fetch(`${SARVAM_BASE}/documents-intelligence/download/${jobId}`, {
        method: "GET",
        headers: { "api-subscription-key": apiKey },
      });

      if (!resultRes.ok) {
        throw new Error(`Result download failed (${resultRes.status})`);
      }

      const resultData = await resultRes.json();
      return {
        text: resultData.text || resultData.content || JSON.stringify(resultData),
        pageCount: resultData.page_count || 1,
      };
    }

    if (statusData.status === "failed") {
      throw new Error(`Document processing failed: ${statusData.error || "unknown"}`);
    }
  }

  throw new Error("Document processing timed out (30s)");
}
