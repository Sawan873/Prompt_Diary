import Link from "next/link";
import type { Metadata } from "next";
import {
  serverListRoadmaps,
  roadmapTopicsToStrings,
  type ApiRoadmap,
} from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Roadmaps — Prompt Dairy",
  description:
    "Structured learning paths from beginner to advanced for prompt engineering and AI systems.",
};

const LEVEL_STYLE: Record<
  string,
  { color: string; gradient: string }
> = {
  beginner: {
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
  },
  intermediate: {
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  },
  advanced: {
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #ef4444, #ec4899)",
  },
};

const FALLBACK: ApiRoadmap[] = [
  {
    id: "rm-001",
    title: "Prompt Engineering Beginner Path",
    level: "beginner",
    description:
      "Start your journey. Learn the fundamentals of LLMs and how to craft effective prompts.",
    topics: [
      "What are LLMs?",
      "Prompt Basics",
      "Zero-Shot Prompting",
      "Few-Shot Prompting",
      "Prompt Formatting",
      "Common Mistakes",
    ],
    estimated_hours: 8,
  },
  {
    id: "rm-002",
    title: "Intermediate Prompt Techniques",
    level: "intermediate",
    description:
      "Level up with advanced techniques like Chain-of-Thought, role prompting, and prompt chaining.",
    topics: [
      "Chain-of-Thought",
      "Role Prompting",
      "Output Formatting",
      "Prompt Chaining",
      "Temperature & Parameters",
      "Evaluation",
    ],
    estimated_hours: 12,
  },
  {
    id: "rm-003",
    title: "Advanced AI Architecture",
    level: "advanced",
    description:
      "Master production AI systems — RAG pipelines, agent architectures, and enterprise workflows.",
    topics: [
      "RAG Architecture",
      "Vector Databases",
      "AI Agents",
      "Multi-Agent Systems",
      "Enterprise AI",
      "AI Safety",
    ],
    estimated_hours: 20,
  },
];

export default async function RoadmapsPage() {
  const api = await serverListRoadmaps();
  const roadmaps =
    api?.roadmaps?.length && api.roadmaps.every((r) => r.id && r.title)
      ? api.roadmaps
      : FALLBACK;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: "48px" }}>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l4-4 4 4 4-8 4 4"/><path d="M21 21H3"/></svg>
          Learning Roadmaps
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.05rem",
            maxWidth: "600px",
          }}
        >
          Structured learning paths to take you from beginner to expert. Follow step by step.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {roadmaps.map((roadmap, index) => {
          const style = LEVEL_STYLE[roadmap.level] ?? LEVEL_STYLE.beginner;
          const topicLabels = roadmapTopicsToStrings(roadmap.topics);

          return (
            <div
              key={roadmap.id}
              id={`roadmap-${roadmap.id}`}
              className="glass-card animate-fade-in-up"
              style={{
                padding: "36px",
                opacity: 0,
                animationDelay: `${index * 0.15}s`,
                borderLeft: `3px solid ${style.color}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "start",
                  justifyContent: "space-between",
                  gap: "16px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <span className={`badge badge-${roadmap.level}`}>
                      {roadmap.level}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      ~{roadmap.estimated_hours ?? "—"} hours
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      marginBottom: "8px",
                    }}
                  >
                    {roadmap.title}
                  </h3>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {roadmap.description}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "10px",
                  marginBottom: "24px",
                }}
              >
                {topicLabels.map((topic, i) => (
                  <div
                    key={`${roadmap.id}-${i}-${topic}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.03)",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: style.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>{topic}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/articles"
                className="btn-primary"
                style={{
                  padding: "10px 24px",
                  fontSize: "0.9rem",
                  background: style.gradient,
                  display: "inline-block",
                  textDecoration: "none",
                }}
              >
                Start Learning →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
