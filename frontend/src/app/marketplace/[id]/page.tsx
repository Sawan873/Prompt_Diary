"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Play,
  Tag,
  User,
  Calendar,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { getMarketplacePromptById, MarketplacePrompt } from "@/lib/api";

export default function MarketplaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prompt, setPrompt] = useState<MarketplacePrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [activeTab, setActiveTab] = useState<"prompt" | "output">("prompt");

  useEffect(() => {
    loadPrompt();
  }, [params.id]);

  async function loadPrompt() {
    setLoading(true);
    try {
      const data = await getMarketplacePromptById(params.id as string);
      setPrompt(data);
    } catch {
      setPrompt(null);
    } finally {
      setLoading(false);
    }
  }

  function handleCopyPrompt() {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt.promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  }

  function handleCopyOutput() {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt.exampleOutput);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  }

  function handleTryInPlayground() {
    if (!prompt) return;
    const encodedPrompt = encodeURIComponent(prompt.promptText);
    router.push(`/playground?prompt=${encodedPrompt}`);
  }

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: "40px 24px 80px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div
            style={{
              width: "120px",
              height: "18px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.06)",
              marginBottom: "32px",
            }}
          />
          <div
            style={{
              width: "60%",
              height: "36px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.06)",
              marginBottom: "16px",
            }}
          />
          <div
            style={{
              width: "80%",
              height: "18px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.04)",
              marginBottom: "32px",
            }}
          />
          <div
            className="glass-card"
            style={{
              height: "300px",
              animation: "pulse-glow 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </main>
    );
  }

  if (!prompt) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px" }}>
          Prompt not found
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "24px",
          }}
        >
          The prompt you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/marketplace" className="btn-primary">
          Back to Marketplace
        </Link>
      </main>
    );
  }

  const categoryColors: Record<string, string> = {
    "text-generation": "#a78bfa",
    code: "#60a5fa",
    image: "#f472b6",
    marketing: "#fbbf24",
    business: "#34d399",
    education: "#22d3ee",
    creative: "#f87171",
    data: "#818cf8",
  };

  return (
    <main
      id="marketplace-detail-page"
      style={{ minHeight: "100vh", padding: "0 24px 80px" }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto", paddingTop: "40px" }}>
        {/* Back button */}
        <Link
          href="/marketplace"
          id="back-to-marketplace"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "32px",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-secondary)")
          }
        >
          <ArrowLeft size={16} />
          Back to Marketplace
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            {/* Category badge */}
            <span
              style={{
                padding: "4px 14px",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                background: `${categoryColors[prompt.category] || "#94a3b8"}20`,
                color: categoryColors[prompt.category] || "#94a3b8",
                border: `1px solid ${categoryColors[prompt.category] || "#94a3b8"}40`,
              }}
            >
              {prompt.category.replace("-", " ")}
            </span>

            {/* Model */}
            <span
              style={{
                padding: "4px 14px",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: 600,
                background: "rgba(255,255,255,0.05)",
                color: "var(--text-secondary)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {prompt.model}
            </span>

            {/* Free badge */}
            {prompt.isFree && (
              <span
                style={{
                  padding: "4px 14px",
                  borderRadius: "20px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#34d399",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  textTransform: "uppercase",
                }}
              >
                Free
              </span>
            )}
          </div>

          <h1
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: "12px",
            }}
          >
            {prompt.title}
          </h1>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              marginBottom: "20px",
            }}
          >
            {prompt.description}
          </p>

          {/* Meta info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
              color: "var(--text-muted)",
              fontSize: "0.82rem",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <User size={14} />
              {prompt.author}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Calendar size={14} />
              {new Date(prompt.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ExternalLink size={14} />
              {prompt.usageCount} uses
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}
        >
          <button
            id="try-in-playground"
            onClick={handleTryInPlayground}
            className="btn-primary"
            style={{
              padding: "14px 28px",
              fontSize: "0.95rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Play size={18} />
            Try in Playground
          </button>

          <button
            id="copy-prompt-btn"
            onClick={handleCopyPrompt}
            className="btn-secondary"
            style={{
              padding: "14px 28px",
              fontSize: "0.95rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {copiedPrompt ? (
              <>
                <Check size={18} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy Prompt
              </>
            )}
          </button>
        </div>

        {/* Prompt / Output Tabs */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "2px",
          }}
        >
          <button
            onClick={() => setActiveTab("prompt")}
            style={{
              padding: "12px 24px",
              borderRadius: "12px 12px 0 0",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              background:
                activeTab === "prompt"
                  ? "rgba(255,255,255,0.06)"
                  : "transparent",
              color:
                activeTab === "prompt"
                  ? "var(--text-primary)"
                  : "var(--text-muted)",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            📝 Prompt Template
          </button>
          <button
            onClick={() => setActiveTab("output")}
            style={{
              padding: "12px 24px",
              borderRadius: "12px 12px 0 0",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              background:
                activeTab === "output"
                  ? "rgba(255,255,255,0.06)"
                  : "transparent",
              color:
                activeTab === "output"
                  ? "var(--text-primary)"
                  : "var(--text-muted)",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            💡 Example Output
          </button>
        </div>

        {/* Content Panel */}
        <div
          className="glass-card"
          style={{
            borderRadius: "0 16px 16px 16px",
            padding: "28px",
            position: "relative",
          }}
        >
          {/* Copy button inside panel */}
          <button
            onClick={
              activeTab === "prompt" ? handleCopyPrompt : handleCopyOutput
            }
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--text-secondary)",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {(activeTab === "prompt" ? copiedPrompt : copiedOutput) ? (
              <>
                <Check size={13} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={13} />
                Copy
              </>
            )}
          </button>

          <pre
            style={{
              fontFamily:
                'var(--font-jetbrains-mono), "JetBrains Mono", monospace',
              fontSize: "0.85rem",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
              paddingRight: "80px",
            }}
          >
            {activeTab === "prompt"
              ? prompt.promptText
              : prompt.exampleOutput}
          </pre>
        </div>

        {/* Tags */}
        <div style={{ marginTop: "28px" }}>
          <h3
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Tags
          </h3>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--text-secondary)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Tag size={11} />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="glass-card"
          style={{
            marginTop: "40px",
            padding: "36px",
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(59,130,246,0.08))",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          <Sparkles
            size={28}
            style={{
              color: "#a78bfa",
              marginBottom: "12px",
            }}
          />
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            Ready to try this prompt?
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              marginBottom: "20px",
            }}
          >
            Open it in the Playground to test with different models and parameters.
          </p>
          <button
            onClick={handleTryInPlayground}
            className="btn-primary"
            style={{
              padding: "14px 36px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Open in Playground →
          </button>
        </div>
      </div>
    </main>
  );
}
