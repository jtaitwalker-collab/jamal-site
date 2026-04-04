"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDeepgram } from "@/hooks/useDeepgram";
import SuggestedQuestions from "./SuggestedQuestions";

type AskState = "idle" | "asking" | "answering" | "done" | "error";

export default function VoiceInterface() {
  const {
    transcript,
    interimTranscript,
    status: micStatus,
    errorMessage: micError,
    startListening,
    stopListening,
    reset: resetMic,
    isListening,
    isConnecting,
  } = useDeepgram();

  const [typedInput, setTypedInput] = useState("");
  const [activeQuestion, setActiveQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [askState, setAskState] = useState<AskState>("idle");
  const [askError, setAskError] = useState("");
  const answerRef = useRef<HTMLDivElement>(null);

  // Combine voice transcript with typed input
  const voiceText = transcript + (interimTranscript ? ` ${interimTranscript}` : "");

  const canSubmit =
    askState !== "asking" &&
    askState !== "answering" &&
    (voiceText.trim() || typedInput.trim());

  const submitQuestion = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q) return;

      setActiveQuestion(q);
      setAnswer("");
      setAskState("asking");
      setAskError("");

      // Stop mic if active
      if (isListening) stopListening();

      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }

        if (!res.body) throw new Error("No response body.");

        setAskState("answering");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setAnswer(accumulated);
          // Auto-scroll as answer streams in
          answerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }

        setAskState("done");
      } catch (err) {
        console.error("[VoiceInterface] ask error", err);
        setAskError(
          err instanceof Error ? err.message : "Something went wrong."
        );
        setAskState("error");
      }
    },
    [isListening, stopListening]
  );

  const handleMicToggle = () => {
    if (isListening || isConnecting) {
      stopListening();
    } else {
      setTypedInput(""); // clear typed when starting voice
      submitQuestion(""); // no-op if empty; just reset state
      resetMic();
      startListening();
    }
  };

  const handleSubmit = () => {
    const q = voiceText.trim() || typedInput.trim();
    if (q) {
      submitQuestion(q);
      setTypedInput("");
      resetMic();
    }
  };

  const handleSuggested = (q: string) => {
    resetMic();
    setTypedInput("");
    submitQuestion(q);
  };

  const handleNewQuestion = () => {
    setAskState("idle");
    setActiveQuestion("");
    setAnswer("");
    setAskError("");
    setTypedInput("");
    resetMic();
  };

  // Submit on Enter (not Shift+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Scroll into view when answering starts
  useEffect(() => {
    if (askState === "answering" || askState === "done") {
      answerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [askState]);

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-5 bg-gold rounded-full" />
        <h2 className="text-xs tracking-[0.2em] text-muted uppercase font-mono">
          Ask Me Anything
        </h2>
      </div>

      <div className="border border-border rounded-lg bg-surface overflow-hidden">
        {/* Input area */}
        <div className="p-5 border-b border-border">
          <p className="text-sm text-muted mb-4 leading-relaxed">
            Hit the mic and ask a question out loud, or type below. Claude
            answers based only on my CV.
          </p>

          {/* Voice + text row */}
          <div className="flex gap-3 items-start">
            {/* Mic button */}
            <button
              onClick={handleMicToggle}
              disabled={askState === "asking" || askState === "answering"}
              aria-label={isListening ? "Stop recording" : "Start voice input"}
              className={[
                "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 border",
                isListening
                  ? "bg-gold/10 border-gold text-gold shadow-[0_0_20px_rgba(201,168,76,0.2)]"
                  : isConnecting
                  ? "bg-surface-2 border-border text-muted animate-pulse"
                  : "bg-surface-2 border-border text-muted hover:border-gold/50 hover:text-ink",
                (askState === "asking" || askState === "answering") &&
                  "opacity-40 cursor-not-allowed",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {isListening ? (
                <WaveformIcon />
              ) : isConnecting ? (
                <SpinnerIcon />
              ) : (
                <MicIcon />
              )}
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                value={
                  isListening || isConnecting
                    ? voiceText || "Listening…"
                    : typedInput
                }
                onChange={
                  isListening || isConnecting
                    ? undefined
                    : (e) => setTypedInput(e.target.value)
                }
                onKeyDown={handleKeyDown}
                readOnly={isListening || isConnecting}
                placeholder="Type your question here…"
                rows={2}
                className={[
                  "w-full bg-surface-2 border border-border rounded-md px-4 py-3 text-sm text-ink placeholder:text-muted-2 resize-none",
                  "focus:outline-none focus:border-gold/40 transition-colors",
                  (isListening || isConnecting) && "text-muted italic",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={[
                "flex-shrink-0 h-12 px-4 rounded-md border text-xs tracking-wide font-mono uppercase transition-all",
                canSubmit
                  ? "border-gold text-gold hover:bg-gold/10"
                  : "border-border text-muted-2 cursor-not-allowed",
              ].join(" ")}
            >
              Ask
            </button>
          </div>

          {/* Mic error */}
          {micError && (
            <p className="mt-2 text-xs text-red-400">{micError}</p>
          )}

          {/* Voice transcript preview */}
          {(isListening || isConnecting) && voiceText && (
            <div className="mt-3 px-3 py-2 bg-surface-2 rounded border border-border">
              <p className="text-xs text-muted mb-1 font-mono">Transcript</p>
              <p className="text-sm text-ink">{voiceText}</p>
            </div>
          )}
        </div>

        {/* Suggested questions */}
        {askState === "idle" && (
          <div className="px-5 py-4 border-b border-border">
            <SuggestedQuestions onSelect={handleSuggested} />
          </div>
        )}

        {/* Answer area */}
        {(askState === "asking" ||
          askState === "answering" ||
          askState === "done" ||
          askState === "error") && (
          <div ref={answerRef} className="p-5">
            {/* Question shown */}
            <div className="mb-4">
              <p className="text-xs text-muted font-mono mb-1 tracking-wide uppercase">
                Question
              </p>
              <p className="text-sm text-ink/80 italic">
                &ldquo;{activeQuestion}&rdquo;
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-border mb-4" />

            {/* Answer or error */}
            {askState === "error" ? (
              <p className="text-sm text-red-400">{askError}</p>
            ) : (
              <div>
                <p className="text-xs text-gold font-mono mb-2 tracking-wide uppercase">
                  Answer
                </p>
                <div
                  className={[
                    "text-sm text-ink leading-relaxed whitespace-pre-wrap",
                    askState === "answering" && "cursor",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {askState === "asking" ? (
                    <span className="text-muted animate-pulse">
                      Thinking…
                    </span>
                  ) : (
                    answer
                  )}
                </div>
              </div>
            )}

            {/* New question button */}
            {(askState === "done" || askState === "error") && (
              <button
                onClick={handleNewQuestion}
                className="mt-5 text-xs text-muted hover:text-gold font-mono uppercase tracking-wide border border-border hover:border-gold/40 px-3 py-1.5 rounded transition-colors"
              >
                ← New question
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function MicIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function WaveformIcon() {
  return (
    <div className="flex items-center gap-0.5 h-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`bar-${i} block w-0.5 bg-gold rounded-full`}
          style={{ height: "100%" }}
        />
      ))}
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
