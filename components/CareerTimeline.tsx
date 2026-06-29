const PROFESSIONAL = [
  {
    company: "Acoustic",
    title: "Account Executive / Account Director",
    period: "May 2024 – Aug 2025",
    type: "Enterprise SaaS",
    highlights: [
      "$1.5M pipeline via cold outbound & newly activated partnerships",
      "$432k ARR closed — Phoenix Group (FTSE 100) £92k, Truworths £158k",
      "Dual quota: net new ARR + migration of 13 existing accounts",
    ],
  },
  {
    company: "PitchBook",
    title: "Account Executive",
    period: "Jun 2023 – Apr 2024",
    type: "Data & Analytics",
    highlights: [
      "$230k pipeline in first 90 days, zero inherited accounts",
      "91% ramp quota — displacing competitors via Value Selling",
    ],
  },
  {
    company: "Futr.ai",
    title: "Account Executive",
    period: "Apr 2021 – Jun 2023",
    type: "Series A · AI SaaS",
    highlights: [
      "104% of £300k quota — founding AE, no inherited pipeline or playbook",
      "Opened retail, fintech & travel verticals → 15% ARR uplift",
      "Apollo implementation: 300% meetings uplift, £550k incremental pipeline",
      "POC framework reduced sales cycle by 30 days, lifted conversion 25%",
    ],
  },
  {
    company: "My1Login",
    title: "Account Executive",
    period: "Feb 2020 – Apr 2021",
    type: "Series A · Cybersecurity",
    highlights: [
      "Displaced Okta & OneLogin: NHS Trust, Fire Dept, Local Authority, Holland & Barrett",
      "Built government sector strategy, AE Handbook & MQL workflows from scratch",
    ],
  },
  {
    company: "IQVIA",
    title: "Account Executive",
    period: "Jan 2018 – Feb 2020",
    type: "Pharma Data & Analytics",
    highlights: [
      "£450k deal — largest in peer group, 3-year contract, multi-departmental displacement",
      "16 net new logos; £1M+ pipeline via cold calling & LinkedIn",
      "105% quota FY18, 92% FY19",
    ],
  },
  {
    company: "Genisys Group",
    title: "BDR → Account Executive",
    period: "May 2015 – Jan 2018",
    type: "IT Reseller",
    highlights: [
      "Promoted BDR → AE in 12 months after 124% meeting target",
      "21 net new accounts displacing Softcat; £236k quota at 118% FY17",
      "Built Cisco Meraki vendor partnership as primary revenue driver",
    ],
  },
];

const ADVISORY = [
  {
    company: "Adjustable",
    title: "Founding Commercial Partner (Advisory, Part-time, Equity)",
    period: "May 2026 – Present",
    type: "UK Web Accessibility SaaS",
    highlights: [
      "Built LinkedIn outreach engine and email sequencing infrastructure across Apollo, Dripify and Aimfox",
      "Developed competitive positioning against incumbent accessibility vendors for UK mid-market and enterprise buyers",
    ],
  },
  {
    company: "Orchestrys",
    title: "GTM Advisor (Part-time)",
    period: "Aug 2025 – Present",
    type: "Advisory",
    highlights: [
      "UK, EMEA & APAC market entry for Brazilian engineering and AI services company with no prior international presence",
      "Implemented Apollo as primary outbound platform; designed pipeline motion targeting $30k ACV deals",
      "Advising founder on UK ICP definition, buyer personas and outbound sequencing",
    ],
  },
];

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-5 bg-gold rounded-full" />
      <h2 className="text-xs tracking-[0.2em] text-muted uppercase font-mono">
        {label}
      </h2>
    </div>
  );
}

function RoleCard({ role, isFirst }: { role: (typeof PROFESSIONAL)[number]; isFirst: boolean }) {
  return (
    <div className="relative pl-7">
      {/* Dot */}
      <div
        className={[
          "absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0",
          isFirst
            ? "border-gold bg-gold/20 shadow-[0_0_8px_rgba(201,168,76,0.4)]"
            : "border-muted-2 bg-bg",
        ].join(" ")}
      />

      {/* Card */}
      <div className="border border-border rounded-lg bg-surface p-4 hover:border-gold/20 transition-all duration-200 group">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-ink group-hover:text-gold transition-colors">
              {role.company}
            </h3>
            <p className="text-xs text-muted mt-0.5">{role.title}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-muted font-mono">{role.period}</p>
            <span className="inline-block mt-1 text-[10px] text-gold/70 border border-gold/20 rounded px-1.5 py-0.5 bg-gold/5">
              {role.type}
            </span>
          </div>
        </div>

        {/* Highlights */}
        <ul className="space-y-1.5">
          {role.highlights.map((h, j) => (
            <li key={j} className="flex gap-2 text-xs text-muted leading-relaxed">
              <span className="text-gold/50 flex-shrink-0 mt-0.5">›</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function CareerTimeline() {
  return (
    <section>
      {/* ── Professional Experience ── */}
      <SectionHeader label="Professional Experience" />

      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-px timeline-line" />

        <div className="space-y-8">
          {PROFESSIONAL.map((role, i) => (
            <RoleCard key={role.company} role={role} isFirst={i === 0} />
          ))}
        </div>

        {/* Education tail */}
        <div className="relative pl-7 mt-8">
          <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-muted-2 bg-bg" />
          <div className="border border-border rounded-lg bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Nottingham Trent University
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  BA (Hons) Business Management &amp; Marketing — 2:1
                </p>
              </div>
              <span className="text-[10px] text-muted font-mono border border-border rounded px-1.5 py-0.5">
                Education
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Advisory Engagements ── */}
      <div className="mt-12">
        <SectionHeader label="Advisory Engagements" />

        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px timeline-line" />

          <div className="space-y-8">
            {ADVISORY.map((role, i) => (
              <RoleCard key={role.company} role={role} isFirst={i === 0} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Interests strip ── */}
      <div className="mt-8 p-4 border border-border rounded-lg bg-surface">
        <p className="text-xs text-muted font-mono uppercase tracking-wide mb-2">
          Beyond sales
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "7-a-side football organiser",
            "Soup for the Soul co-founder",
          ].map((tag) => (
            <span
              key={tag}
              className="text-xs text-muted border border-border rounded px-2.5 py-1 bg-surface-2"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
