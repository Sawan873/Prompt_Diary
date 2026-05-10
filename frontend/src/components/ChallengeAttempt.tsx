"use client";

import { useState } from "react";

interface Hint {
  text: string;
}

interface ChallengeAttemptProps {
  challengeId: string;
  title: string;
  exampleContext: string;
  expectedOutput: string;
  hints: Hint[];
  points: number;
  difficulty: string;
}

export default function ChallengeAttempt({
  exampleContext,
  expectedOutput,
  hints,
  points,
  difficulty,
}: ChallengeAttemptProps) {
  const [prompt, setPrompt] = useState("");
  const [hintsOpen, setHintsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const difficultyColor: Record<string, string> = {
    easy: "#34d399",
    medium: "#fbbf24",
    hard: "#f87171",
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleSubmit = () => {
    if (prompt.trim().length < 10) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setPrompt("");
    setCharCount(0);
    setSubmitted(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── Example Context ── */}
      <div className="glass-card" style={{ padding: "24px 28px" }}>
        <h2 style={{
          fontSize: "0.78rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-muted)",
          marginBottom: "14px",
        }}>
          📄 Context / Input
        </h2>
        <div style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: "10px",
          padding: "16px 20px",
          border: "1px solid rgba(255,255,255,0.06)",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "0.83rem",
          lineHeight: 1.75,
          color: "#cbd5e1",
          whiteSpace: "pre-wrap",
        }}>
          {exampleContext}
        </div>
      </div>

      {/* ── Expected Output ── */}
      <div className="glass-card" style={{ padding: "24px 28px" }}>
        <h2 style={{
          fontSize: "0.78rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-muted)",
          marginBottom: "14px",
        }}>
          ✅ Expected Output Format
        </h2>
        <div style={{
          background: "rgba(16,185,129,0.05)",
          borderRadius: "10px",
          padding: "16px 20px",
          border: "1px solid rgba(16,185,129,0.15)",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "0.83rem",
          lineHeight: 1.75,
          color: "#6ee7b7",
          whiteSpace: "pre-wrap",
        }}>
          {expectedOutput}
        </div>
      </div>

      {/* ── Hints Toggle ── */}
      <div className="glass-card" style={{ padding: "0" }}>
        <button
          onClick={() => setHintsOpen(!hintsOpen)}
          style={{
            width: "100%",
            padding: "18px 28px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#fbbf24",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          <span>💡 Show Hints ({hints.length})</span>
          <span style={{
            transition: "transform 0.2s ease",
            display: "inline-block",
            transform: hintsOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}>▼</span>
        </button>

        {hintsOpen && (
          <div style={{
            padding: "0 28px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}>
            {hints.map((hint, i) => (
              <div key={i} style={{
                display: "flex",
                gap: "12px",
                alignItems: "start",
                padding: "12px 16px",
                background: "rgba(251,191,36,0.05)",
                borderRadius: "8px",
                border: "1px solid rgba(251,191,36,0.12)",
              }}>
                <span style={{ color: "#fbbf24", fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}.
                </span>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                  {hint.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Prompt Editor ── */}
      <div className="glass-card" style={{ padding: "24px 28px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
          flexWrap: "wrap",
          gap: "8px",
        }}>
          <h2 style={{
            fontSize: "0.78rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
          }}>
            ✍️ Your Prompt
          </h2>
          <span style={{
            fontSize: "0.75rem",
            color: charCount > 50 ? "#34d399" : "var(--text-muted)",
          }}>
            {charCount} characters
          </span>
        </div>

        {submitted ? (
          /* ── Submitted State ── */
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🎉</div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>
              Prompt Submitted!
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "8px" }}>
              Great work! You earned
            </p>
            <div style={{
              fontSize: "2rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "20px",
            }}>
              +{points} pts
            </div>
            <p style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginBottom: "24px",
              padding: "10px 16px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "8px",
              border: "1px solid var(--border-subtle)",
            }}>
              ⚠️ Auto-evaluation coming in Phase 4. A human reviewer or LLM will grade your prompt.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={handleReset} className="btn-secondary" style={{ fontSize: "0.85rem", padding: "10px 22px" }}>
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <textarea
              value={prompt}
              onChange={handleChange}
              placeholder={`Write your prompt here...\n\nExample: "You are an expert summarizer. Given the following text, extract exactly 3 key bullet points..."`}
              style={{
                width: "100%",
                minHeight: "180px",
                background: "rgba(0,0,0,0.3)",
                border: `1px solid ${prompt.length > 10 ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "10px",
                padding: "16px",
                color: "var(--text-primary)",
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "0.875rem",
                lineHeight: 1.7,
                resize: "vertical",
                outline: "none",
                transition: "border-color 0.2s ease",
                boxSizing: "border-box",
              }}
            />

            <div style={{ marginTop: "16px", display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              {prompt.length > 0 && (
                <button
                  onClick={() => { setPrompt(""); setCharCount(0); }}
                  style={{
                    padding: "10px 20px",
                    background: "transparent",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "10px",
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={prompt.trim().length < 10}
                className="btn-primary"
                style={{
                  padding: "10px 28px",
                  fontSize: "0.9rem",
                  opacity: prompt.trim().length < 10 ? 0.5 : 1,
                  cursor: prompt.trim().length < 10 ? "not-allowed" : "pointer",
                }}
              >
                Submit Prompt →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
