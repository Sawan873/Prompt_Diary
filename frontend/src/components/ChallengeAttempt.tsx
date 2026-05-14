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
          display: "flex",
          alignItems: "center",
          gap: "7px",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Context / Input
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
          display: "flex",
          alignItems: "center",
          gap: "7px",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Expected Output Format
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
          <span style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"/><path d="M12 18v4"/><path d="M8 22h8"/></svg>
            Show Hints ({hints.length})
          </span>
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
            display: "flex",
            alignItems: "center",
            gap: "7px",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Your Prompt
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
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(59,130,246,0.2))", border: "2px solid rgba(124,58,237,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
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
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              textAlign: "left",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Auto-evaluation coming in Phase 4. A human reviewer or LLM will grade your prompt.
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
