interface Props {
  inline?: boolean;
}

const METRICS = [
  {
    value: "£450k",
    label: "Largest deal closed",
    sub: "IQVIA — largest in peer group",
  },
  {
    value: "104%",
    label: "Quota attainment",
    sub: "Futr.ai Series A · £300k target",
  },
  {
    value: "300%",
    label: "Meetings uplift",
    sub: "Apollo implementation · Futr.ai",
  },
  {
    value: "$1.5M",
    label: "Pipeline generated",
    sub: "Acoustic · cold outbound",
  },
  {
    value: "9+",
    label: "Years in enterprise SaaS",
    sub: "AI · Data · Cybersecurity · Fintech",
  },
  {
    value: "21",
    label: "Net new logos won",
    sub: "Genisys · displaced Softcat",
  },
];

export default function MetricsSidebar({ inline = false }: Props) {
  if (inline) {
    // Horizontal scroll row for mobile
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 bg-gold rounded-full" />
          <h2 className="text-xs tracking-[0.2em] text-muted uppercase font-mono">
            Key Numbers
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {METRICS.map((m) => (
            <div
              key={m.value}
              className="metric-card flex-shrink-0 w-40 border border-border rounded-lg bg-surface p-4 transition-all duration-200"
            >
              <p className="font-display text-2xl font-bold text-gold leading-none mb-1">
                {m.value}
              </p>
              <p className="text-xs text-ink mb-1 leading-snug">{m.label}</p>
              <p className="text-xs text-muted leading-snug">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vertical sidebar for desktop
  return (
    <aside className="sticky top-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-4 bg-gold rounded-full" />
        <h2 className="text-xs tracking-[0.2em] text-muted uppercase font-mono">
          Key Numbers
        </h2>
      </div>
      <div className="space-y-3">
        {METRICS.map((m) => (
          <div
            key={m.value}
            className="metric-card border border-border rounded-lg bg-surface p-4 transition-all duration-200"
          >
            <p className="font-display text-3xl font-bold text-gold leading-none mb-1.5">
              {m.value}
            </p>
            <p className="text-xs text-ink mb-1 leading-snug">{m.label}</p>
            <p className="text-xs text-muted leading-snug">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* LinkedIn CTA */}
      <div className="mt-5 p-4 border border-gold/20 rounded-lg bg-gold/5">
        <p className="text-xs text-ink mb-2 leading-relaxed">
          Seen enough? Let&apos;s talk.
        </p>
        <a
          href="mailto:jtaitwalker@gmail.com"
          className="block text-center text-xs font-mono uppercase tracking-wide text-gold border border-gold/40 rounded px-3 py-2 hover:bg-gold/10 transition-colors"
        >
          Get in touch →
        </a>
        <a
          href="https://linkedin.com/in/jamal-walker-cloud"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs font-mono uppercase tracking-wide text-muted border border-border rounded px-3 py-2 hover:text-ink hover:border-gold/30 transition-colors mt-2"
        >
          LinkedIn ↗
        </a>
      </div>
    </aside>
  );
}
