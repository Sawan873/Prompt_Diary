"use client";

import { useState } from "react";
import type { Metadata } from "next";

export default function PlaygroundPage() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-4");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    if (!prompt.trim()) return;
    setIsRunning(true);
    setOutput("");

    // Simulate AI response (Phase 4 will integrate real LLM APIs)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setOutput(
      `[Simulated Response from ${model}]\n\nThis is a placeholder response for the prompt playground. In Phase 4, this will connect to real AI models (OpenAI, Gemini, HuggingFace) and return actual completions.\n\nYour prompt was:\n"${prompt}"\n\n---\nTokens used: ~${Math.floor(prompt.length / 4)} input + ~50 output\nModel: ${model}\nLatency: 1.5s (simulated)`
    );
    setIsRunning(false);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
            fontWeight: 800,
            marginBottom: "12px",
          }}
        >
          🧪 Prompt Playground
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
          Test and iterate on your prompts. Real model integration coming in
          Phase 4.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          minHeight: "500px",
        }}
        className="playground-grid"
      >
        {/* Input Panel */}
        <div
          className="glass-card"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <h3 style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              ✏️ Prompt Input
            </h3>
            <select
              id="model-selector"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border-medium)",
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                fontSize: "0.85rem",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gemini-pro">Gemini Pro</option>
              <option value="claude-3">Claude 3</option>
              <option value="llama-3">Llama 3</option>
            </select>
          </div>

          {/* Textarea */}
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here...

Example: Write a function that calculates the factorial of a number. Explain your approach step by step."
            style={{
              flex: 1,
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid var(--border-subtle)",
              background: "rgba(0,0,0,0.3)",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              resize: "none",
              outline: "none",
              fontFamily: "var(--font-geist-mono), monospace",
              minHeight: "300px",
            }}
          />

          {/* Run Button */}
          <button
            id="run-prompt"
            onClick={handleRun}
            disabled={isRunning || !prompt.trim()}
            className="btn-primary"
            style={{
              marginTop: "16px",
              padding: "12px",
              fontSize: "0.95rem",
              justifyContent: "center",
              opacity: isRunning || !prompt.trim() ? 0.5 : 1,
              cursor: isRunning || !prompt.trim() ? "not-allowed" : "pointer",
            }}
          >
            {isRunning ? "⏳ Running..." : "▶ Run Prompt"}
          </button>
        </div>

        {/* Output Panel */}
        <div
          className="glass-card"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            📤 Output
          </h3>
          <div
            id="prompt-output"
            style={{
              flex: 1,
              padding: "16px",
              borderRadius: "12px",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid var(--border-subtle)",
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "0.85rem",
              lineHeight: 1.7,
              color: output
                ? "var(--text-primary)"
                : "var(--text-muted)",
              whiteSpace: "pre-wrap",
              overflow: "auto",
              minHeight: "300px",
            }}
          >
            {output ||
              "Output will appear here after you run a prompt.\n\nTip: Try different models and compare results!"}
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div
        className="glass-card"
        style={{
          marginTop: "24px",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "0.85rem",
          color: "var(--text-muted)",
        }}
      >
        <span style={{ fontSize: "16px" }}>💡</span>
        <span>
          <strong style={{ color: "var(--text-secondary)" }}>Phase 4 Feature:</strong>{" "}
          Real AI model integration (OpenAI, Gemini, HuggingFace) is planned for
          Week 4. Currently showing simulated responses.
        </span>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .playground-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
