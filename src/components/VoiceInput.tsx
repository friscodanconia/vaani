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
    <div className="flex flex-col items-center gap-3">
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
        className={`group relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 ${
          isRecording ? "recording-active" : ""
        }`}
        style={{
          background: isRecording
            ? "var(--accent)"
            : disabled
            ? "var(--warm-200)"
            : "var(--surface-raised)",
          border: `2px solid ${isRecording ? "var(--accent)" : disabled ? "var(--warm-200)" : "var(--warm-300)"}`,
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: isRecording ? "0 0 40px rgba(194, 101, 42, 0.3)" : "none",
        }}
      >
        {/* Pulse rings when recording */}
        {isRecording && (
          <>
            <span
              className="absolute inset-0 rounded-full"
              style={{
                border: "2px solid var(--accent)",
                animation: "pulse-ring 1.5s ease-out infinite",
              }}
            />
            <span
              className="absolute inset-0 rounded-full"
              style={{
                border: "2px solid var(--accent)",
                animation: "pulse-ring 1.5s ease-out infinite 0.5s",
              }}
            />
          </>
        )}

        {isProcessing ? (
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "var(--warm-300)", borderTopColor: "var(--accent)" }}
          />
        ) : (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isRecording ? "white" : disabled ? "var(--warm-300)" : "var(--warm-600)"}
            strokeWidth="2"
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

      <p className="text-xs" style={{ color: "var(--warm-400)" }}>
        {isProcessing
          ? "Processing..."
          : isRecording
          ? "Listening... release to send"
          : disabled
          ? "Upload a document first"
          : "Hold to speak · any Indian language"}
      </p>
    </div>
  );
}
