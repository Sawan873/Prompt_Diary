"use client";

import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

interface PromptCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  model: string;
  author?: string;
  usageCount?: number;
  isFree?: boolean;
}

export default function PromptCard({
  id,
  title,
  excerpt,
  category,
  model,
  author = "Community",
  usageCount = 0,
  isFree = true,
}: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  const categoryColors: Record<string, string> = {
    "text-generation": "rgba(124, 58, 237, 0.2)",
    "code": "rgba(59, 130, 246, 0.2)",
    "image": "rgba(236, 72, 153, 0.2)",
    "marketing": "rgba(245, 158, 11, 0.2)",
    "business": "rgba(16, 185, 129, 0.2)",
    "education": "rgba(6, 182, 212, 0.2)",
    "creative": "rgba(239, 68, 68, 0.2)",
    "data": "rgba(99, 102, 241, 0.2)",
  };

  const categoryTextColors: Record<string, string> = {
    "text-generation": "#a78bfa",
    "code": "#60a5fa",
    "image": "#f472b6",
    "marketing": "#fbbf24",
    "business": "#34d399",
    "education": "#22d3ee",
    "creative": "#f87171",
    "data": "#818cf8",
  };

  const modelColors: Record<string, string> = {
    "ChatGPT": "#74aa9c",
    "GPT-4": "#74aa9c",
    "Gemini": "#4285f4",
    "Llama": "#6366f1",
    "Claude": "#d97706",
    "Stable Diffusion": "#a855f7",
    "Midjourney": "#2563eb",
    "Universal": "#94a3b8",
  };

  return (
    <Link
      href={`/marketplace/${id}`}
      id={`prompt-card-${id}`}
      className="glass-card marketplace-card"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "24px",
        textDecoration: "none",
        color: "inherit",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {/* Category + Free badge row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            background: categoryColors[category] || "rgba(148,163,184,0.15)",
            color: categoryTextColors[category] || "#94a3b8",
            border: `1px solid ${categoryTextColors[category] || "#94a3b8"}33`,
          }}
        >
          {category.replace("-", " ")}
        </span>

        {isFree && (
          <span
            style={{
              padding: "3px 10px",
              borderRadius: "20px",
              fontSize: "0.7rem",
              fontWeight: 700,
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Free
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: "1.05rem",
          fontWeight: 700,
          marginBottom: "8px",
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>

      {/* Excerpt */}
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.85rem",
          lineHeight: 1.6,
          marginBottom: "16px",
          flex: 1,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {excerpt}
      </p>

      {/* Bottom info row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "14px",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        {/* Model badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: modelColors[model] || "#94a3b8",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: modelColors[model] || "#94a3b8",
            }}
          />
          {model}
        </span>

        {/* Usage count */}
        <span
          style={{
            fontSize: "0.73rem",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <ExternalLink size={12} strokeWidth={2} />
          {usageCount > 0 ? `${usageCount} uses` : "New"}
        </span>
      </div>

      {/* Hover arrow indicator */}
      <div
        className="prompt-card-arrow"
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          opacity: 0,
          transform: "translateX(-6px)",
          transition: "all 0.25s ease",
        }}
      >
        <ExternalLink size={16} strokeWidth={2} color="var(--text-muted)" />
      </div>
    </Link>
  );
}
