import Link from "next/link";
import type { Metadata } from "next";
import ChallengeAttempt from "@/components/ChallengeAttempt";
import { serverGetChallenge, type ApiChallenge } from "@/lib/server-api";
import { ArrowLeft, Award, Folder, Lightbulb, Target } from "lucide-react";

type UiChallenge = {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  points: number;
  exampleContext: string;
  expectedOutput: string;
  hints: { text: string }[];
};

function mapApiChallenge(challenge: ApiChallenge): UiChallenge {
  const rawDifficulty = challenge.difficulty;
  const difficulty =
    rawDifficulty === "easy" || rawDifficulty === "medium" || rawDifficulty === "hard"
      ? rawDifficulty
      : "medium";
  const rawHints = challenge.hints ?? [];
  const hints =
    rawHints.length > 0
      ? rawHints.map((hint) => ({
          text: typeof hint === "string" ? hint : String(hint),
        }))
      : [{ text: "Use the challenge description to shape your prompt." }];

  return {
    title: challenge.title,
    description: challenge.description,
    difficulty,
    category: challenge.category?.trim() || "general",
    points: challenge.points ?? 10,
    exampleContext:
      challenge.starter_prompt?.trim() ||
      challenge.description ||
      "Use the description above as context for your prompt.",
    expectedOutput:
      challenge.expected_output?.trim() ||
      "Produce output that satisfies the challenge constraints.",
    hints,
  };
}

async function resolveChallenge(id: string): Promise<UiChallenge | null> {
  const apiChallenge = await serverGetChallenge(id);
  if (apiChallenge?.title) return mapApiChallenge(apiChallenge);
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const challenge = await resolveChallenge(id);

  if (!challenge) return { title: "Challenge Not Found — Prompt Diary" };

  return {
    title: `${challenge.title} — Prompt Diary`,
    description: challenge.description,
  };
}

const difficultyColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  easy: {
    bg: "rgba(16,185,129,0.12)",
    text: "#34d399",
    border: "rgba(16,185,129,0.2)",
  },
  medium: {
    bg: "rgba(245,158,11,0.12)",
    text: "#fbbf24",
    border: "rgba(245,158,11,0.2)",
  },
  hard: {
    bg: "rgba(239,68,68,0.12)",
    text: "#f87171",
    border: "rgba(239,68,68,0.2)",
  },
};

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = await resolveChallenge(id);

  if (!challenge) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "120px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "22px",
            margin: "0 auto 24px",
            background:
              "linear-gradient(135deg, rgba(0,229,255,0.12), rgba(124,58,237,0.14))",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Target size={34} strokeWidth={1.8} />
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px" }}>
          Challenge Not Found
        </h1>

        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          This challenge does not exist yet.
        </p>

        <Link href="/challenges" className="btn-primary">
          Back to Challenges
        </Link>
      </div>
    );
  }

  const dc = difficultyColors[challenge.difficulty];

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px 80px" }}>
      <nav
        style={{
          marginBottom: "36px",
          fontSize: "0.83rem",
          color: "var(--text-muted)",
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
          Home
        </Link>
        <span>/</span>
        <Link
          href="/challenges"
          style={{ color: "var(--text-muted)", textDecoration: "none" }}
        >
          Challenges
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-secondary)" }}>{challenge.title}</span>
      </nav>

      <header style={{ marginBottom: "36px" }}>
        <div
          style={{
            width: "58px",
            height: "58px",
            borderRadius: "18px",
            background:
              "linear-gradient(135deg, rgba(0,229,255,0.14), rgba(124,58,237,0.18))",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
            boxShadow: "0 0 30px rgba(0,229,255,0.08)",
          }}
        >
          <Target size={28} strokeWidth={1.8} />
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "18px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: "20px",
              background: dc.bg,
              color: dc.text,
              border: `1px solid ${dc.border}`,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
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

        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            lineHeight: 1.2,
            marginBottom: "16px",
          }}
        >
          {challenge.title}
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1rem",
            lineHeight: 1.75,
            maxWidth: "700px",
            marginBottom: "20px",
          }}
        >
          {challenge.description}
        </p>

        <div
          style={{
            display: "flex",
            gap: "14px",
            alignItems: "center",
            flexWrap: "wrap",
            color: "var(--text-muted)",
            fontSize: "0.82rem",
            paddingBottom: "20px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
            <Award size={15} strokeWidth={1.8} />
            <strong style={{ color: "#a78bfa", fontSize: "1rem" }}>
              {challenge.points}
            </strong>
            points
          </span>

          <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
            <Lightbulb size={15} strokeWidth={1.8} />
            {challenge.hints.length} hints available
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              textTransform: "capitalize",
            }}
          >
            <Folder size={15} strokeWidth={1.8} />
            {challenge.category}
          </span>
        </div>
      </header>

      <ChallengeAttempt
        challengeId={id}
        title={challenge.title}
        exampleContext={challenge.exampleContext}
        expectedOutput={challenge.expectedOutput}
        hints={challenge.hints}
        points={challenge.points}
        difficulty={challenge.difficulty}
      />

      <div style={{ marginTop: "36px" }}>
        <Link
          href="/challenges"
          className="btn-secondary"
          style={{
            fontSize: "0.9rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ArrowLeft size={15} strokeWidth={1.8} />
          Back to Challenges
        </Link>
      </div>
    </div>
  );
}
