"use client";

interface VoiceInputProps {
  isRecording: boolean;
  isProcessing: boolean;
  disabled: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function VoiceInput({
  isRecording,
  isProcessing,
  disabled,
  onStart,
  onStop,
}: VoiceInputProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Outer glow ring */}
      <div className="relative">
        {/* Animated pulse rings */}
        {isRecording && (
          <>
            <span
              className="absolute inset-[-12px] rounded-full"
              style={{
                border: "1.5px solid var(--accent)",
                animation: "pulse-ring 2s ease-out infinite",
              }}
            />
            <span
              className="absolute inset-[-12px] rounded-full"
              style={{
                border: "1.5px solid var(--accent)",
                animation: "pulse-ring 2s ease-out infinite 0.7s",
              }}
            />
            <span
              className="absolute inset-[-12px] rounded-full"
              style={{
                border: "1.5px solid var(--accent)",
                animation: "pulse-ring 2s ease-out infinite 1.4s",
              }}
            />
          </>
        )}

        <button
          onMouseDown={onStart}
          onMouseUp={onStop}
          onTouchStart={(e) => {
            e.preventDefault();
            onStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onStop();
          }}
          disabled={disabled || isProcessing}
          className={`relative flex h-[72px] w-[72px] items-center justify-center rounded-full transition-all duration-500 ${
            isRecording ? "recording-active" : ""
          }`}
          style={{
            background: isRecording
              ? "linear-gradient(135deg, var(--accent), var(--accent-dim))"
              : disabled
              ? "var(--bg-tertiary)"
              : "var(--bg-elevated)",
            border: `1.5px solid ${
              isRecording ? "var(--accent)" : disabled ? "var(--border-subtle)" : "var(--border-visible)"
            }`,
            cursor: disabled ? "not-allowed" : "pointer",
            boxShadow: isRecording
              ? "0 0 50px var(--accent-glow-strong), 0 0 100px var(--accent-glow)"
              : "0 4px 30px rgba(0, 0, 0, 0.3)",
          }}
        >
          {isProcessing ? (
            <div
              className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: "var(--border-visible)", borderTopColor: "var(--accent)" }}
            />
          ) : (
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isRecording ? "white" : disabled ? "var(--text-tertiary)" : "var(--text-secondary)"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>
      </div>

      <p className="text-xs tracking-wide" style={{ color: "var(--text-tertiary)" }}>
        {isProcessing
          ? "Processing your question..."
          : isRecording
          ? "Listening — release to send"
          : disabled
          ? "Upload a document first"
          : "Hold to speak · any Indian language"}
      </p>
    </div>
  );
}
