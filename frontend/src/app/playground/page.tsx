"use client";

import { useState, useEffect } from "react";
import { runPrompt, getPlaygroundModels } from "@/lib/api";

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  available: boolean;
  description: string;
}

export default function PlaygroundPage() {
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [model, setModel] = useState("gpt-4");
  const [temperature, setTemperature] = useState(0.7);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [lastUsage, setLastUsage] = useState<{
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    latency_ms: number;
  } | null>(null);

  useEffect(() => {
    async function loadModels() {
      try {
        const data = await getPlaygroundModels();
        if (data?.models) {
          setModels(data.models);
        }
      } catch {
        // Use defaults
      }
    }
    loadModels();
  }, []);

  const handleRun = async () => {
    if (!prompt.trim()) return;
    setIsRunning(true);
    setOutput("");
    setLastUsage(null);

    try {
      const data = await runPrompt({
        prompt: prompt.trim(),
        model,
        temperature,
        system_prompt: systemPrompt.trim() || undefined,
      });

      if (data?.success) {
        setOutput(data.response);
        setLastUsage({
          input_tokens: data.usage?.input_tokens || 0,
          output_tokens: data.usage?.output_tokens || 0,
          total_tokens: data.usage?.total_tokens || 0,
          latency_ms: data.latency_ms || 0,
        });
      } else {
        setOutput("Error: Failed to get response from the API.");
      }
    } catch (error) {
      // Fallback: simulate locally if backend is not available
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOutput(
        `[Simulated Response from ${model}]\n\nThe backend API is not reachable. This is a local fallback response.\n\nYour prompt was:\n"${prompt}"\n\n---\nTokens used: ~${Math.floor(prompt.length / 4)} input + ~50 output\nModel: ${model}\nLatency: 1.0s (simulated)`
      );
      setLastUsage({
        input_tokens: Math.floor(prompt.length / 4),
        output_tokens: 50,
        total_tokens: Math.floor(prompt.length / 4) + 50,
        latency_ms: 1000,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setPrompt("");
    setOutput("");
    setLastUsage(null);
    setSystemPrompt("");
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          Prompt Playground
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
          Test and iterate on your prompts with instant feedback.
        </p>
      </div>

      {/* Controls Bar */}
      <div
        className="glass-card"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          {/* Model Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
              Model
            </label>
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
              {models.length > 0
                ? models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </option>
                  ))
                : (
                  <>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="claude-3">Claude 3</option>
                    <option value="llama-3">Llama 3</option>
                  </>
                )}
            </select>
          </div>

          {/* Temperature */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
              Temp
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={{ width: "80px", cursor: "pointer" }}
            />
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", minWidth: "24px" }}>
              {temperature}
            </span>
          </div>

          {/* Settings toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", background: showSettings ? "rgba(0,229,255,0.1)" : "transparent", color: "var(--text-secondary)", fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s ease", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            System Prompt
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleClear}
            className="btn-secondary"
            style={{ padding: "6px 16px", fontSize: "0.8rem" }}
          >
            Clear
          </button>
          <button
            id="run-prompt"
            onClick={handleRun}
            disabled={isRunning || !prompt.trim()}
            className="btn-primary"
            style={{
              padding: "6px 20px",
              fontSize: "0.85rem",
              opacity: isRunning || !prompt.trim() ? 0.5 : 1,
              cursor: isRunning || !prompt.trim() ? "not-allowed" : "pointer",
            }}
          >
            {isRunning ? (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Running...
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Run
              </span>
            )}
          </button>
        </div>
      </div>

      {/* System Prompt (collapsible) */}
      {showSettings && (
        <div
          className="glass-card animate-slide-down"
          style={{ padding: "16px 20px", marginBottom: "20px" }}
        >
          <label
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              display: "block",
              marginBottom: "8px",
            }}
          >
            System Prompt (optional)
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="You are a helpful AI assistant..."
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)",
              background: "rgba(0,0,0,0.3)",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              lineHeight: 1.5,
              resize: "vertical",
              outline: "none",
              fontFamily: "var(--font-geist-mono), monospace",
              minHeight: "60px",
              maxHeight: "150px",
            }}
          />
        </div>
      )}

      {/* Main Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          minHeight: "450px",
        }}
        className="playground-grid"
      >
        {/* Input Panel */}
        <div
          className="glass-card"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "7px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Prompt Input
          </h3>

          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleRun();
              }
            }}
            placeholder={`Enter your prompt here...\n\nExamples:\n• Summarize this article into 3 bullet points\n• Extract JSON from this product review\n• Explain RAG architecture step by step\n\nTip: Press Ctrl+Enter to run`}
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

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            <span>{prompt.length} characters · ~{Math.ceil(prompt.length / 4)} tokens</span>
            <span>Ctrl+Enter to run</span>
          </div>
        </div>

        {/* Output Panel */}
        <div
          className="glass-card"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "7px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
            Output
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
            {isRunning ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    border: "2px solid rgba(0,229,255,0.2)",
                    borderTopColor: "#00e5ff",
                    animation: "orbit 0.8s linear infinite",
                  }}
                />
                <span>Generating response...</span>
              </div>
            ) : output ? (
              output
            ) : (
              "Output will appear here after you run a prompt.\n\nTip: Try different models and compare results!"
            )}
          </div>

          {/* Usage Stats */}
          {lastUsage && (
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginTop: "10px",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                flexWrap: "wrap",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
                {lastUsage.input_tokens} in
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 7 12 3 16 7"/><line x1="12" y1="21" x2="12" y2="3"/></svg>
                {lastUsage.output_tokens} out
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                {lastUsage.total_tokens} tokens
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                {lastUsage.latency_ms}ms
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info bar */}
      <div
        className="glass-card"
        style={{
          marginTop: "20px",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "0.82rem",
          color: "var(--text-muted)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"/><path d="M12 18v4"/><path d="M8 22h8"/></svg>
        </span>
        <span>
          <strong style={{ color: "var(--text-secondary)" }}>Smart Responses:</strong>{" "}
          The playground generates context-aware simulated responses. Try prompts about
          summarization, JSON extraction, code generation, or explanations for varied outputs.
          Real LLM integration (OpenAI, Gemini, HuggingFace) coming in Phase 4.
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
