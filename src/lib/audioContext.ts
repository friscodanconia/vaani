let unlocked = false;

// Shared audio element — created and "unlocked" on user tap,
// then reused for later programmatic playback (bypasses mobile autoplay block).
let sharedAudio: HTMLAudioElement | null = null;

/**
 * Call this inside a click/tap handler to unlock audio playback on mobile.
 * Creates a shared Audio element and plays a tiny silence on it so the browser
 * marks it as user-gesture-initiated.
 */
export function unlockAudio(): void {
  if (unlocked) return;
  try {
    // AudioContext unlock
    const ctx = new AudioContext();
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    // HTMLAudioElement unlock — play a silent data URI
    sharedAudio = new Audio();
    sharedAudio.src =
      "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYlpnEhAAAAAAD/+1DEAAAHAAGf9AAAIgAANIAAAAQAAAAA//tQxBEAAADSAAAAAAAAANIAAAAAAAAA";
    sharedAudio.volume = 0;
    sharedAudio.play().catch(() => {});

    unlocked = true;
  } catch {
    unlocked = true;
  }
}

export function isAudioUnlocked(): boolean {
  return unlocked;
}

/**
 * Get the shared audio element (unlocked on user tap).
 * AnswerCard should use this instead of creating its own <audio>.
 */
export function getSharedAudio(): HTMLAudioElement {
  if (!sharedAudio) {
    sharedAudio = new Audio();
  }
  return sharedAudio;
}

export function playBase64Audio(base64: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audio = getSharedAudio();
      audio.volume = 1;
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio playback failed"));
      audio.src = `data:audio/mp3;base64,${base64}`;
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
