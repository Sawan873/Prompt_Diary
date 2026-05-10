import Link from "next/link";
import type { Metadata } from "next";
import ChallengeAttempt from "@/components/ChallengeAttempt";

// ─── Static Data ─────────────────────────────────────────────────────────────

const challenges: Record<string, {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  points: number;
  exampleContext: string;
  expectedOutput: string;
  hints: { text: string }[];
}> = {
  "ch-001": {
    title: "Summarize an Article",
    description:
      "Write a prompt that instructs an AI to summarize a long technical article into exactly 3 key bullet points. Each bullet point should be concise, informative, and capture a distinct idea.",
    difficulty: "easy",
    category: "summarization",
    points: 10,
    exampleContext: `Large language models (LLMs) are AI systems trained on vast amounts of text data using a technique called self-supervised learning. They learn statistical patterns in language, enabling them to generate coherent text, answer questions, translate languages, and perform many other tasks. Models like GPT-4, Claude, and Gemini have billions of parameters and require enormous compute resources to train. Despite their power, LLMs can hallucinate facts, meaning they sometimes generate plausible-sounding but incorrect information. Researchers are actively working on solutions like retrieval-augmented generation (RAG) to ground model outputs in verified data sources.`,
    expectedOutput: `• [Key point 1 — main concept]\n• [Key point 2 — important detail]\n• [Key point 3 — takeaway or implication]`,
    hints: [
      { text: "Tell the AI exactly how many bullet points you want." },
      { text: "Specify what each bullet should focus on — e.g., 'each bullet should cover a different aspect'." },
      { text: "Try adding a constraint like 'each bullet must be under 20 words' to keep it concise." },
    ],
  },
  "ch-002": {
    title: "Extract JSON from Text",
    description:
      "Write a prompt that extracts structured JSON data from an unstructured product review. The JSON should contain specific fields: product name, rating (1–5), pros (array), and cons (array).",
    difficulty: "medium",
    category: "extraction",
    points: 20,
    exampleContext: `I bought the Sony WH-1000XM5 headphones last week and honestly they're incredible. The noise cancellation is the best I've ever experienced — totally blocks out my open-plan office. Sound quality is rich and detailed. Battery life is insane, I've been using them for 3 days without charging. My only complaints are that the ear cushions get warm after an hour, and they're quite expensive at $350. Overall I'd give them 5 out of 5 stars.`,
    expectedOutput: `{\n  "product": "Sony WH-1000XM5",\n  "rating": 5,\n  "pros": ["noise cancellation", "sound quality", "battery life"],\n  "cons": ["ear cushions get warm", "expensive"]\n}`,
    hints: [
      { text: "Specify the exact JSON schema you want — field names and data types." },
      { text: "Tell the model to output ONLY valid JSON with no extra text or explanation." },
      { text: "Mention that rating should be a number (1–5), not a string." },
    ],
  },
  "ch-003": {
    title: "Multi-Step Reasoning",
    description:
      "Write a prompt that guides the AI through a multi-step math word problem showing all intermediate work. The model must show each calculation step before giving the final answer.",
    difficulty: "medium",
    category: "reasoning",
    points: 20,
    exampleContext: `A bakery makes 240 cookies per batch. They use 3 batches of chocolate chip, 2 batches of oatmeal, and 1 batch of peanut butter. They sell chocolate chip for $2 each, oatmeal for $1.50 each, and peanut butter for $2.50 each. They sell 80% of all cookies. What is the total revenue?`,
    expectedOutput: `Step 1: Calculate total cookies per type\nStep 2: Calculate cookies sold (80%)\nStep 3: Calculate revenue per type\nStep 4: Sum all revenues\nFinal Answer: $[amount]`,
    hints: [
      { text: "Use 'Let's think step by step' — this is Chain-of-Thought prompting." },
      { text: "Ask the model to label each step clearly, e.g. 'Step 1:', 'Step 2:', etc." },
      { text: "Tell the model to show the calculation formula before the result." },
    ],
  },
  "ch-004": {
    title: "Role-Based Prompt Design",
    description:
      "Create a system prompt that makes the AI behave as a senior code reviewer. It should give specific, actionable feedback on code quality, not just say 'looks good'.",
    difficulty: "hard",
    category: "role-playing",
    points: 30,
    exampleContext: `function calculateTotal(items) {\n  let t = 0;\n  for (let i = 0; i < items.length; i++) {\n    t = t + items[i].p * items[i].q;\n  }\n  return t;\n}`,
    expectedOutput: `A senior code review covering:\n- Variable naming issues\n- Readability improvements\n- Edge case handling\n- Suggested refactored code`,
    hints: [
      { text: "Start with 'You are a senior software engineer with 10+ years of experience...'" },
      { text: "Tell the model what to look for: naming, readability, edge cases, performance." },
      { text: "Ask it to always provide a rewritten version of the code, not just comments." },
    ],
  },
  "ch-005": {
    title: "Build a Prompt Chain",
    description:
      "Design 3 connected prompts that work in sequence: first analyze a problem, then generate solutions, then evaluate and rank those solutions. Each prompt should use the output of the previous one.",
    difficulty: "hard",
    category: "chaining",
    points: 40,
    exampleContext: `Problem: A SaaS startup is losing 15% of customers every month (high churn). They have a freemium model. Most users sign up but never use core features. Their support team is overwhelmed.`,
    expectedOutput: `Prompt 1 → Problem Analysis (root causes)\nPrompt 2 → 5 Solution Ideas (uses Prompt 1 output)\nPrompt 3 → Ranked Solutions with pros/cons (uses Prompt 2 output)`,
    hints: [
      { text: "Each prompt should explicitly reference what it expects as input from the previous step." },
      { text: "Use placeholders like [ANALYSIS FROM STEP 1] to show where previous output goes." },
      { text: "Keep each prompt focused — one job per prompt, not everything in one." },
    ],
  },
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const challenge = challenges[id];
  if (!challenge) return { title: "Challenge Not Found — Prompt Dairy" };
  return {
    title: `${challenge.title} — Prompt Dairy`,
    description: challenge.description,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
  easy:   { bg: "rgba(16,185,129,0.12)",  text: "#34d399", border: "rgba(16,185,129,0.2)"  },
  medium: { bg: "rgba(245,158,11,0.12)",  text: "#fbbf24", border: "rgba(245,158,11,0.2)"  },
  hard:   { bg: "rgba(239,68,68,0.12)",   text: "#f87171", border: "rgba(239,68,68,0.2)"   },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = challenges[id];

  // 404
  if (!challenge) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "120px 24px", textAlign: "center" }}>
        <span style={{ fontSize: "64px", display: "block", marginBottom: "24px" }}>🎯</span>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px" }}>Challenge Not Found</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          This challenge doesn&apos;t exist yet.
        </p>
        <Link href="/challenges" className="btn-primary">← Back to Challenges</Link>
      </div>
    );
  }

  const dc = difficultyColors[challenge.difficulty];

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px 80px" }}>

      {/* ── Breadcrumb ── */}
      <nav style={{
        marginBottom: "36px",
        fontSize: "0.83rem",
        color: "var(--text-muted)",
        display: "flex",
        gap: "8px",
        alignItems: "center",
      }}>
        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Home</Link>
        <span>›</span>
        <Link href="/challenges" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Challenges</Link>
        <span>›</span>
        <span style={{ color: "var(--text-secondary)" }}>{challenge.title}</span>
      </nav>

      {/* ── Header ── */}
      <header style={{ marginBottom: "36px" }}>
        {/* Badges row */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            padding: "4px 12px",
            borderRadius: "20px",
            background: dc.bg,
            color: dc.text,
            border: `1px solid ${dc.border}`,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            {challenge.difficulty}
          </span>
          <span style={{
            fontSize: "0.75rem",
            padding: "4px 12px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.05)",
            color: "var(--text-muted)",
            textTransform: "capitalize",
          }}>
            {challenge.category}
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          fontWeight: 800,
          letterSpacing: "-0.025em",
          lineHeight: 1.2,
          marginBottom: "16px",
        }}>
          {challenge.title}
        </h1>

        {/* Description */}
        <p style={{
          color: "var(--text-secondary)",
          fontSize: "1rem",
          lineHeight: 1.75,
          maxWidth: "700px",
          marginBottom: "20px",
        }}>
          {challenge.description}
        </p>

        {/* Meta bar */}
        <div style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          flexWrap: "wrap",
          color: "var(--text-muted)",
          fontSize: "0.82rem",
          paddingBottom: "20px",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <span>
            🏆 <strong style={{ color: "#a78bfa", fontSize: "1rem" }}>{challenge.points}</strong> points
          </span>
          <span>🏷️ {challenge.hints.length} hints available</span>
          <span style={{ textTransform: "capitalize" }}>📂 {challenge.category}</span>
        </div>
      </header>

      {/* ── Interactive Challenge Area (Client Component) ── */}
      <ChallengeAttempt
        challengeId={id}
        title={challenge.title}
        exampleContext={challenge.exampleContext}
        expectedOutput={challenge.expectedOutput}
        hints={challenge.hints}
        points={challenge.points}
        difficulty={challenge.difficulty}
      />

      {/* ── Back Button ── */}
      <div style={{ marginTop: "36px" }}>
        <Link href="/challenges" className="btn-secondary" style={{ fontSize: "0.9rem" }}>
          ← Back to Challenges
        </Link>
      </div>
    </div>
  );
}
