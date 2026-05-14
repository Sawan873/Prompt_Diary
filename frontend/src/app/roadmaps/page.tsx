import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmaps — Prompt Dairy",
  description:
    "Structured learning paths from beginner to advanced for prompt engineering and AI systems.",
};

const roadmaps = [
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
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
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
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
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
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #ef4444, #ec4899)",
  },
];

export default function RoadmapsPage() {
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
          Structured learning paths to take you from beginner to expert. Follow
          step by step.
        </p>
      </div>

      {/* Roadmap Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {roadmaps.map((roadmap, index) => (
          <div
            key={roadmap.id}
            id={`roadmap-${roadmap.id}`}
            className="glass-card animate-fade-in-up"
            style={{
              padding: "36px",
              opacity: 0,
              animationDelay: `${index * 0.15}s`,
              borderLeft: `3px solid ${roadmap.color}`,
            }}
          >
            {/* Header */}
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
                    ~{roadmap.estimated_hours} hours
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

            {/* Topics */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "10px",
                marginBottom: "24px",
              }}
            >
              {roadmap.topics.map((topic, i) => (
                <div
                  key={topic}
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
                      background: roadmap.gradient,
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
                  <span style={{ color: "var(--text-secondary)" }}>
                    {topic}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              className="btn-primary"
              style={{
                padding: "10px 24px",
                fontSize: "0.9rem",
                background: roadmap.gradient,
              }}
            >
              Start Learning →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
