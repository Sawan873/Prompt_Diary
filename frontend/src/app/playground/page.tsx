"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getPlaygroundModels, API_BASE_URL } from "@/lib/api";
import PromptHistory, { saveToHistory } from "@/components/PromptHistory";
import {
  Bot,
  ChevronDown,
  ClipboardList,
  Copy,
  Check,
  Eraser,
  FileInput,
  FileOutput,
  Gauge,
  History,
  Lightbulb,
  Loader2,
  Play,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Columns,
  Square,
  Zap,
} from "lucide-react";

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  available: boolean;
  description: string;
}

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [model, setModel] = useState("liquid-lfm-free");
  const [modelB, setModelB] = useState("cohere-north-free");
  const [temperature, setTemperature] = useState(0.7);
  const [isCompareMode, setIsCompareMode] = useState(false);

  // Output states
  const [output, setOutput] = useState("");
  const [outputB, setOutputB] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isRunningB, setIsRunningB] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [copiedOutputB, setCopiedOutputB] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Stats states
  const [lastUsage, setLastUsage] = useState<{
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    latency_ms: number;
  } | null>(null);

  const [lastUsageB, setLastUsageB] = useState<{
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
        // Use defaults when backend is not available
      }
    }

    loadModels();

    // Load prompt from URL query params (from marketplace "Try in Playground")
    const urlPrompt = searchParams.get("prompt");
    if (urlPrompt) {
      setPrompt(decodeURIComponent(urlPrompt));
    }
  }, [searchParams]);

  // Helper to read SSE stream
  const runStreamRequest = async (
    targetModel: string,
    onChunk: (text: string) => void,
    onFinish: (text: string, elapsedMs: number) => void,
    onError: (err: string) => void
  ) => {
    const startTime = Date.now();
    let accumulatedText = "";

    try {
      const response = await fetch(`${API_BASE_URL}/playground/run-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: targetModel,
          temperature,
          system_prompt: systemPrompt.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(cleanLine.slice(6));
                if (parsed.error) {
                  onError(parsed.error);
                  return;
                } else if (parsed.content) {
                  accumulatedText += parsed.content;
                  onChunk(accumulatedText);
                }
              } catch {
                // ignore chunk format errors
              }
            }
          }
        }
        onFinish(accumulatedText, Date.now() - startTime);
      } else {
        throw new Error("No response body reader available");
      }
    } catch (e: any) {
      onError(e.message || "Request failed");
    }
  };

  const handleRun = async () => {
    if (!prompt.trim()) return;

    if (!isCompareMode) {
      setIsRunning(true);
      setOutput("");
      setLastUsage(null);

      await runStreamRequest(
        model,
        (text) => setOutput(text),
        (text, elapsed) => {
          setIsRunning(false);
          saveToHistory(prompt.trim(), model, text);
          setLastUsage({
            input_tokens: Math.ceil(prompt.length / 4),
            output_tokens: Math.ceil(text.length / 4),
            total_tokens: Math.ceil(prompt.length / 4) + Math.ceil(text.length / 4),
            latency_ms: elapsed,
          });
        },
        (err) => {
          setIsRunning(false);
          setOutput(`Error calling API: ${err}\n\nFalling back to local simulation...`);
          // simulate local fallback response
          setTimeout(() => {
            const text = `[Simulated Local Fallback]\n\nYour prompt was:\n"${prompt}"\n\nError received: ${err}`;
            setOutput(text);
            setLastUsage({
              input_tokens: Math.ceil(prompt.length / 4),
              output_tokens: Math.ceil(text.length / 4),
              total_tokens: Math.ceil(prompt.length / 4) + Math.ceil(text.length / 4),
              latency_ms: 1000,
            });
          }, 500);
        }
      );
    } else {
      // Compare mode - run both models concurrently
      setIsRunning(true);
      setIsRunningB(true);
      setOutput("");
      setOutputB("");
      setLastUsage(null);
      setLastUsageB(null);

      // Run Model A
      runStreamRequest(
        model,
        (text) => setOutput(text),
        (text, elapsed) => {
          setIsRunning(false);
          saveToHistory(prompt.trim(), model, text);
          setLastUsage({
            input_tokens: Math.ceil(prompt.length / 4),
            output_tokens: Math.ceil(text.length / 4),
            total_tokens: Math.ceil(prompt.length / 4) + Math.ceil(text.length / 4),
            latency_ms: elapsed,
          });
        },
        (err) => {
          setIsRunning(false);
          setOutput(`Error: ${err}`);
        }
      );

      // Run Model B
      runStreamRequest(
        modelB,
        (text) => setOutputB(text),
        (text, elapsed) => {
          setIsRunningB(false);
          saveToHistory(prompt.trim(), modelB, text);
          setLastUsageB({
            input_tokens: Math.ceil(prompt.length / 4),
            output_tokens: Math.ceil(text.length / 4),
            total_tokens: Math.ceil(prompt.length / 4) + Math.ceil(text.length / 4),
            latency_ms: elapsed,
          });
        },
        (err) => {
          setIsRunningB(false);
          setOutputB(`Error: ${err}`);
        }
      );
    }
  };

  const handleClear = () => {
    setPrompt("");
    setOutput("");
    setOutputB("");
    setLastUsage(null);
    setLastUsageB(null);
    setSystemPrompt("");
    setCopiedOutput(false);
    setCopiedOutputB(false);
  };

  const handleCopyOutput = (isPanelB: boolean) => {
    const textToCopy = isPanelB ? outputB : output;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    if (isPanelB) {
      setCopiedOutputB(true);
      setTimeout(() => setCopiedOutputB(false), 2000);
    } else {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", marginBottom: "30px" }}>
        <div>
          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 2.5rem)",
              fontWeight: 800,
              marginBottom: "8px",
              letterSpacing: "-0.03em",
              background: "linear-gradient(to right, #ffffff, #94a3b8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Prompt Playground
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Test prompts in real-time or compare two cloud models side-by-side with live streaming.
          </p>
        </div>

        {/* Global Toolbar */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setIsCompareMode(!isCompareMode)}
            className="btn-secondary"
            style={{
              padding: "10px 16px",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderColor: isCompareMode ? "rgba(0, 229, 255, 0.4)" : undefined,
              background: isCompareMode ? "rgba(0, 229, 255, 0.1)" : undefined,
              color: isCompareMode ? "#67e8f9" : undefined,
            }}
          >
            <Columns size={16} />
            {isCompareMode ? "Single Model View" : "Split-Screen Compare"}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary"
            style={{
              padding: "10px 16px",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderColor: showSettings ? "rgba(124, 58, 237, 0.4)" : undefined,
              background: showSettings ? "rgba(124, 58, 237, 0.1)" : undefined,
              color: showSettings ? "#a78bfa" : undefined,
            }}
          >
            <Settings2 size={16} />
            Advanced Settings
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn-secondary"
            style={{
              padding: "10px 16px",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <History size={16} />
            History
          </button>
        </div>
      </div>

      {/* Collapsible Advanced Settings (Drawer / Top-Panel layout) */}
      {showSettings && (
        <div
          className="glass-card animate-slide-down"
          style={{
            padding: "20px",
            marginBottom: "24px",
            border: "1px solid rgba(124,58,237,0.18)",
            display: "grid",
            gridTemplateColumns: "1fr 250px",
            gap: "24px",
          }}
        >
          <div>
            <label
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <SlidersHorizontal size={14} />
              System Prompt (Defines model behavior & persona)
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="e.g. You are a precise software architect. Keep explanations technical and concise."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(0,0,0,0.3)",
                color: "var(--text-primary)",
                fontSize: "0.85rem",
                resize: "vertical",
                minHeight: "60px",
                outline: "none",
                fontFamily: "var(--font-geist-mono), monospace",
              }}
            />
          </div>

          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: "24px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <label
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <Gauge size={14} />
              Temperature: {temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={{ width: "100%", cursor: "pointer" }}
            />
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "6px" }}>
              Lower = deterministic; Higher = creative.
            </span>
          </div>
        </div>
      )}

      {/* Main Workspace Panels */}
      {!isCompareMode ? (
        /* Single Model Layout: Input Left, Output Right */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="playground-grid">
          {/* Input Box */}
          <div className="glass-card" style={{ padding: "22px", display: "flex", flexDirection: "column", border: "1px solid rgba(0,229,255,0.12)" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, marginBottom: "14px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <FileInput size={16} />
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
              placeholder={`Type your prompt here...\n\nPress Ctrl+Enter to run instantly.`}
              style={{
                flex: 1,
                padding: "16px",
                borderRadius: "12px",
                border: prompt ? "1px solid rgba(0,229,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
                background: "rgba(0,0,0,0.25)",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                lineHeight: 1.6,
                resize: "none",
                outline: "none",
                fontFamily: "var(--font-geist-mono), monospace",
                minHeight: "350px",
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <span>{prompt.length} chars · ~{Math.ceil(prompt.length / 4)} tokens</span>
              <span>Press Ctrl+Enter to run</span>
            </div>

            <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
              <button onClick={handleClear} className="btn-secondary" style={{ flex: 1, padding: "10px" }}>
                <Eraser size={14} style={{ marginRight: "6px" }} />
                Clear
              </button>

              <button
                onClick={handleRun}
                disabled={isRunning || !prompt.trim()}
                className="btn-primary"
                style={{ flex: 2, padding: "10px", opacity: isRunning || !prompt.trim() ? 0.5 : 1 }}
              >
                {isRunning ? (
                  <>
                    <Loader2 size={14} className="animate-spin" style={{ marginRight: "6px" }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play size={14} style={{ marginRight: "6px" }} />
                    Run Prompt
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Card */}
          <div className="glass-card" style={{ padding: "22px", display: "flex", flexDirection: "column", border: "1px solid rgba(124,58,237,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Bot size={16} color="#a78bfa" />
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(0,0,0,0.3)",
                    color: "var(--text-primary)",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {models.length > 0 ? (
                    models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="liquid-lfm-free">Liquid LFM 1.2B (Free)</option>
                      <option value="cohere-north-free">Cohere North Mini (Free)</option>
                    </>
                  )}
                </select>
              </div>

              {output && (
                <button onClick={() => handleCopyOutput(false)} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.75rem" }}>
                  {copiedOutput ? <Check size={12} style={{ marginRight: "4px" }} /> : <Copy size={12} style={{ marginRight: "4px" }} />}
                  {copiedOutput ? "Copied!" : "Copy"}
                </button>
              )}
            </div>

            <div
              style={{
                flex: 1,
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.05)",
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "0.85rem",
                lineHeight: 1.6,
                color: output ? "var(--text-primary)" : "var(--text-muted)",
                whiteSpace: "pre-wrap",
                overflow: "auto",
                minHeight: "350px",
              }}
            >
              {output || "Output will stream here..."}
            </div>

            {lastUsage && (
              <div style={{ display: "flex", gap: "10px", marginTop: "14px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <span className="usage-pill">
                  <Zap size={12} style={{ marginRight: "4px" }} />
                  {lastUsage.latency_ms} ms
                </span>
                <span>·</span>
                <span>~{lastUsage.output_tokens} output tokens</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Compare Layout: Full Width Input on top, side-by-side output streams below */
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Top Panel - Full Width Input */}
          <div className="glass-card" style={{ padding: "20px", border: "1px solid rgba(0,229,255,0.12)" }}>
            <textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type comparison prompt here..."
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(0,0,0,0.2)",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                minHeight: "100px",
                resize: "vertical",
                outline: "none",
                fontFamily: "var(--font-geist-mono), monospace",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {prompt.length} characters · ~{Math.ceil(prompt.length / 4)} tokens
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={handleClear} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
                  Clear
                </button>
                <button
                  onClick={handleRun}
                  disabled={isRunning || isRunningB || !prompt.trim()}
                  className="btn-primary"
                  style={{ padding: "8px 24px", fontSize: "0.85rem", opacity: (isRunning || isRunningB) || !prompt.trim() ? 0.5 : 1 }}
                >
                  {isRunning || isRunningB ? "Running Streams..." : "Compare Models"}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row - Side-by-side Compare Columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="playground-grid">
            {/* Model A Column */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", border: "1px solid rgba(124,58,237,0.12)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Bot size={15} color="#818cf8" />
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(0,0,0,0.3)",
                      color: "var(--text-primary)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                {output && (
                  <button onClick={() => handleCopyOutput(false)} className="btn-secondary" style={{ padding: "4px 10px", fontSize: "0.72rem" }}>
                    {copiedOutput ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>

              <div
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: "0.82rem",
                  lineHeight: 1.55,
                  minHeight: "300px",
                  color: output ? "var(--text-primary)" : "var(--text-muted)",
                  whiteSpace: "pre-wrap",
                  overflow: "auto",
                }}
              >
                {output || "Waiting for comparison stream..."}
              </div>

              {lastUsage && (
                <div style={{ display: "flex", gap: "10px", marginTop: "12px", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  <span>Latency: {lastUsage.latency_ms} ms</span>
                  <span>·</span>
                  <span>~{lastUsage.output_tokens} tokens</span>
                </div>
              )}
            </div>

            {/* Model B Column */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", border: "1px solid rgba(0,229,255,0.12)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Bot size={15} color="#22d3ee" />
                  <select
                    value={modelB}
                    onChange={(e) => setModelB(e.target.value)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(0,0,0,0.3)",
                      color: "var(--text-primary)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                {outputB && (
                  <button onClick={() => handleCopyOutput(true)} className="btn-secondary" style={{ padding: "4px 10px", fontSize: "0.72rem" }}>
                    {copiedOutputB ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>

              <div
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: "0.82rem",
                  lineHeight: 1.55,
                  minHeight: "300px",
                  color: outputB ? "var(--text-primary)" : "var(--text-muted)",
                  whiteSpace: "pre-wrap",
                  overflow: "auto",
                }}
              >
                {outputB || "Waiting for comparison stream..."}
              </div>

              {lastUsageB && (
                <div style={{ display: "flex", gap: "10px", marginTop: "12px", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  <span>Latency: {lastUsageB.latency_ms} ms</span>
                  <span>·</span>
                  <span>~{lastUsageB.output_tokens} tokens</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Footnote */}
      <div
        className="glass-card"
        style={{
          marginTop: "30px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(251,191,36,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Lightbulb size={16} color="#fbbf24" />
        </div>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          <strong>Streaming Playground:</strong> Response streams live from the model via OpenRouter. You can turn on <strong>Split-Screen Compare</strong> mode above to query both selected models at the same time and compare their outputs.
        </span>
      </div>

      {/* Collapsible History Drawer */}
      <PromptHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onReplay={(p) => {
          setPrompt(p);
          setShowHistory(false);
        }}
      />
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
        <Loader2 size={36} className="animate-spin" color="#00e5ff" />
      </div>
    }>
      <PlaygroundContent />
    </Suspense>
  );
}
