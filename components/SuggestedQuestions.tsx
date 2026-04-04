"use client";

const SUGGESTED_QUESTIONS = [
  "What's your biggest enterprise deal?",
  "How have you consistently hit quota?",
  "Tell me about your GTM experience",
  "What sales methodologies do you use?",
  "How did you build pipeline at Acoustic?",
  "What verticals have you opened?",
  "How did you displace Okta and OneLogin?",
  "Tell me about your experience at Series A startups",
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
