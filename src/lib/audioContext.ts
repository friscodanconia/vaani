let audioCtx: AudioContext | null = null;
let unlocked = false;

export function unlockAudio(): void {
  if (unlocked) return;
  try {
    audioCtx = new AudioContext();
    // Create a silent buffer to unlock autoplay
    const buffer = audioCtx.createBuffer(1, 1, 22050);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start(0);
    unlocked = true;
  } catch {
    // Fallback: mark as unlocked anyway, Audio elements will work on subsequent taps
    unlocked = true;
  }
}

export function isAudioUnlocked(): boolean {
  return unlocked;
}

export function playBase64Audio(base64: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(`data:audio/mp3;base64,${base64}`);
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio playback failed"));
      audio.play().catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}

// Cache for TTS results
const ttsCache = new Map<string, string>();

export function getCachedAudio(key: string): string | undefined {
  return ttsCache.get(key);
}

export function setCachedAudio(key: string, base64: string): void {
  ttsCache.set(key, base64);
}
