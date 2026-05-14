import Link from "next/link";
import type { Metadata } from "next";
import { serverListChallenges, type ApiChallenge } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Challenges — Prompt Dairy",
  description:
    "Practice writing effective prompts with hands-on challenges. From summarization to multi-step reasoning.",
};

const FALLBACK: ApiChallenge[] = [
  {
    id: "ch-001",
    title: "Summarize an Article",
    description:
      "Write a prompt that instructs an AI to summarize a long technical article into 3 key bullet points.",
    difficulty: "easy",
    category: "summarization",
    points: 10,
    starter_prompt: "Summarize the following article...",
    hints: [],
    created_at: "",
  },
  {
    id: "ch-002",
    title: "Extract JSON from Text",
    description:
      "Write a prompt that extracts structured JSON data from an unstructured product review.",
    difficulty: "medium",
    category: "extraction",
    points: 20,
    starter_prompt: "Extract the following information...",
    hints: [],
    created_at: "",
  },
  {
    id: "ch-003",
    title: "Multi-Step Reasoning",
    description:
      "Write a prompt that guides the AI through a multi-step math word problem with step-by-step work.",
    difficulty: "medium",
    category: "reasoning",
    points: 20,
    starter_prompt: "Solve the following problem step by step...",
    hints: [],
    created_at: "",
  },
  {
    id: "ch-004",
    title: "Role-Based Prompt Design",
    description:
      "Create a system prompt that makes the AI act as a senior code reviewer with actionable feedback.",
    difficulty: "hard",
    category: "role-playing",
    points: 30,
    starter_prompt: "You are a senior software engineer...",
    hints: [],
    created_at: "",
  },
  {
    id: "ch-005",
    title: "Build a Prompt Chain",
    description:
      "Design 3 connected prompts: analyze → generate solutions → evaluate and rank.",
    difficulty: "hard",
    category: "chaining",
    points: 40,
    starter_prompt: "Step 1: Analyze the following...",
    hints: [],
    created_at: "",
  },
];

export default async function ChallengesPage() {
  const api = await serverListChallenges();
  const challenges =
    api?.challenges?.length && api.challenges.every((c) => c.id && c.title)
      ? api.challenges
      : FALLBACK;

  const totalPoints = challenges.reduce((s, c) => s + (c.points || 0), 0);
  const difficulties = new Set(challenges.map((c) => c.difficulty)).size;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: "48px" }}>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
          Prompt Challenges
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.05rem",
            maxWidth: "600px",
          }}
        >
          Practice writing effective prompts. Earn points and track your progress.
        </p>
      </div>

      <div
        className="glass-card"
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "24px",
          marginBottom: "32px",
          textAlign: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {[
          { label: "Total Challenges", value: String(challenges.length) },
          { label: "Total Points", value: String(totalPoints) },
          { label: "Difficulties", value: String(difficulties) },
        ].map((stat) => (
          <div key={stat.label}>
            <div
              style={{ fontSize: "1.5rem", fontWeight: 700 }}
              className="gradient-text"
            >
              {stat.value}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {challenges.map((challenge, index) => (
          <div
            key={challenge.id}
            id={`challenge-${challenge.id}`}
            className="glass-card animate-fade-in-up"
            style={{
              padding: "28px 32px",
              opacity: 0,
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "start",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span className={`badge badge-${challenge.difficulty}`}>
                    {challenge.difficulty}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--text-muted)",
                      textTransform: "capitalize",
                    }}
                  >
                    {challenge.category}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 600,
                    marginBottom: "8px",
                  }}
                >
                  {challenge.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                  }}
                >
                  {challenge.description}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                  }}
                  className="gradient-text"
                >
                  {challenge.points}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    fontWeight: 500,
                  }}
                >
                  POINTS
                </div>
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <Link
                href={`/challenges/${challenge.id}`}
                className="btn-secondary"
                style={{
                  padding: "8px 20px",
                  fontSize: "0.85rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Start Challenge →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
