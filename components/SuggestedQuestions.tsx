"use client";

const SUGGESTED_QUESTIONS = [
  "Why has he moved between companies so often?",
  "Can he close enterprise deals or just SMB?",
  "Has he ever built a sales motion from scratch?",
  "What's the biggest pipeline he's ever generated?",
  "Would he need hand-holding or can he run independently?",
  "What's his actual track record on quota?",
  "Why is he looking for a new role right now?",
  "What makes him different from other senior AEs?",
];

interface Props {
  onSelect: (question: string) => void;
}

export default function SuggestedQuestions({ onSelect }: Props) {
  return (
    <div>
      <p className="text-xs text-muted font-mono uppercase tracking-wide mb-3">
        Suggested questions
      </p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="text-xs px-3 py-1.5 rounded border border-border text-muted hover:text-ink hover:border-gold/40 hover:bg-gold/5 transition-all duration-150 text-left"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
