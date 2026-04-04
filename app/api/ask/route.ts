import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// ── CV context ────────────────────────────────────────────────────────────────
// Edit this string to update the information Claude answers from.
const CV_CONTEXT = `
Jamal Tait Walker
Senior Account Executive | Enterprise SaaS | AI, Data & Fintech Platforms
London, UK | 07947886539 | jtaitwalker@gmail.com | linkedin.com/in/jamal-walker-cloud

SUMMARY:
Senior Account Executive with 9+ years closing six-figure ARR deals across AI, data analytics, cybersecurity and customer engagement SaaS platforms. Proven track record of net new business development through outbound prospecting, opening new verticals and displacing incumbent competitors including Okta, OneLogin and Softcat. Experienced across the full sales cycle from prospecting to negotiation and close using MEDDIC, Challenger and Value Selling frameworks across UK and EMEA territories. Strong GTM builder credentials: rebuilt sales functions from scratch, designed POC frameworks and implemented sales tech stacks in Series A environments.

COMMERCIAL IMPACT:
- $432k closed revenue at Acoustic (PE-backed) against $514k quota, including Phoenix Group (FTSE 100) worth $92k ARR and Truworths ($1.1B listed retailer) worth $158k ARR
- £450k enterprise deal closed at IQVIA, the largest in the peer group, displacing named competitor across C-suite, technical and procurement buying committee
- 104% quota attainment at Futr.ai Series A (£300k target): sold conversational AI pre-mainstream, opening 3 new verticals contributing 15% ARR uplift
- 105% attainment in ramp year at IQVIA | 118% quota FY18 at Genisys | 124% BDR meeting target
- Displaced Okta and OneLogin to close NHS Trust, Fire Department, Local Authority and Holland & Barrett at My1Login
- Implemented HubSpot and Apollo at Futr.ai, with booked meetings up 300%, generating £550k incremental pipeline
- $1.5M pipeline generated at Acoustic through cold outbound and newly activated partnership channel
- Promoted BDR to full-cycle AE within 12 months, winning 21 net new accounts displacing Softcat

PROFESSIONAL EXPERIENCE:

GTM Consultant | GOW Solutions | Aug 2025 to Present
Brazilian technology startup (on-demand engineering squads, AI and data solutions), building UK, EMEA and APAC go-to-market from scratch.
- Defining ICP, buyer personas and outbound sequences for international expansion with no prior market presence
- Implementing Apollo as primary outbound tool, building repeatable pipeline motion
- Directly engaging C-suite prospects to validate positioning and refine value proposition

Account Executive / Account Director | Acoustic | May 2024 to Aug 2025
PE-backed enterprise customer engagement and marketing automation SaaS, 700+ staff. $514k annual quota.
- Generated $1.5M pipeline through cold outbound and newly activated partnership channel
- Closed $432k ARR including Phoenix Group (FTSE 100) worth $92k ARR and Truworths ($1.1B listed retailer) worth $158k ARR
- Displaced named competitor across 3-5 person buying committee in 3-6 month sales cycle, ACV $30k-$60k
- Carried dual quota responsibility across new ARR and migration of 13 existing accounts simultaneously

Account Executive | PitchBook | June 2023 to Apr 2024
Morningstar subsidiary and leading private market data and analytics platform.
- Generated $230k pipeline within first 90 days with no inherited accounts
- Reached 91% of quota during ramp period, displacing named competitors through Value Selling
- Managed full sales cycle from prospecting to negotiation and close across $30k ACV deals

Account Executive | Futr.ai | Apr 2021 to June 2023
Series A conversational AI SaaS platform, under 20 staff, founding AE environment.
- Delivered 104% of £300k quota rebuilding sales from scratch with no inherited pipeline or playbook
- Applied Challenger methodology to sell conversational AI pre-mainstream into greenfield markets
- Opened retail, fintech and travel verticals contributing 15% ARR uplift
- Designed POC framework cutting sales cycle 30 days and lifting conversion 25%
- Implemented Apollo driving 300% meetings uplift and £550k incremental pipeline
- Implemented HubSpot CRM

Account Executive | My1Login | Feb 2020 to Apr 2021
Series A cybersecurity SaaS, under 20 staff, Single Sign-On solution. Sole dedicated AE.
- Closed NHS Trust, Fire Department and Local Authority displacing Okta and OneLogin
- Self-generated and closed Holland & Barrett against same named competitors
- Built government sector targeting strategy, AE Handbook and MQL workflows from scratch while carrying live quota

Account Executive | IQVIA | Jan 2018 to Feb 2020
Global pharmaceutical data and analytics leader, 1,000-5,000 staff. UK, USA and Nordic markets.
- Built £1M+ pipeline through cold calling and LinkedIn prospecting, closing 16 net new logos
- Closed largest deal in peer group: three-year £450k contract displacing named competitor across multi-departmental buying committee
- Delivered 105% quota attainment in FY18, sustained at 92% in FY19

Business Development Rep to Account Executive | Genisys Group | May 2015 to Jan 2018
IT reseller, Meraki networking and Mimecast security solutions.
- Promoted from BDR to full-cycle AE within 12 months after hitting 124% of meeting booking target
- Won 21 net new accounts displacing Softcat
- Delivered 118% quota in FY17 (£236k)
- Forged Cisco Meraki vendor partnership as primary revenue driver

SKILLS & TOOLS:
Sales Methodology: MEDDIC, Challenger Sale, SPIN Selling, Value Selling, Full-Cycle Enterprise Sales, Complex Multi-Stakeholder Deals, C-Suite Engagement
GTM Skills: ICP Definition, Persona Development, Outbound Sequencing, Pipeline Generation, POC Framework Design, Sales Playbook Creation
Tools: Salesforce CRM, HubSpot, Apollo, LinkedIn Sales Navigator, Outreach

EDUCATION:
Nottingham Trent University, BA (Hons) Business Management & Marketing, 2:1

INTERESTS:
Jazz saxophone (toured Croatia and France), Grade 8 Piano, 7-a-side football organiser, Co-founder Soup for the Soul (Nottingham homeless charity)
`.trim();

const SYSTEM_PROMPT = `You are an AI assistant embedded in Jamal Walker's personal hiring page. Hiring managers ask you questions about Jamal.

RULES:
1. Answer ONLY based on the CV information provided below. Do not invent, embellish or extrapolate beyond what is stated.
2. Be concise, confident and compelling — write like a sharp recruiter who knows Jamal well, not like a robot reading bullet points.
3. Use specific numbers and names from the CV where relevant. They matter.
4. If a question cannot be answered from the CV, say: "I don't have information on that in Jamal's CV — reach out to him directly at jtaitwalker@gmail.com."
5. Never claim Jamal said or thought something. Describe him in the third person.
6. Keep answers under 180 words unless the question genuinely requires more detail.

CV:
${CV_CONTEXT}`;

// ── Route handler ─────────────────────────────────────────────────────────────

const client = new Anthropic();

export async function POST(req: NextRequest) {
  let question: string;

  try {
    const body = await req.json();
    question = (body.question ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!question) {
    return NextResponse.json(
      { error: "Missing required field: question" },
      { status: 400 }
    );
  }

  if (question.length > 1000) {
    return NextResponse.json(
      { error: "Question too long (max 1000 characters)." },
      { status: 400 }
    );
  }

  try {
    // Stream the response so the UI can render tokens as they arrive
    const stream = await client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: question }],
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(
                new TextEncoder().encode(chunk.delta.text)
              );
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[/api/ask] Anthropic error:", err);
    return NextResponse.json(
      { error: "Failed to generate answer. Please try again." },
      { status: 500 }
    );
  }
}
