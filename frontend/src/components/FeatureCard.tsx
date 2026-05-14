"use client";

import Link from "next/link";
import { useState } from "react";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
  gradient: string;
}

/* Inline SVG icons mapped by identifier */
function FeatureIcon({ icon, size = 26 }: { icon: string; size?: number }) {
  const s = `${size}`;
  const common = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (icon) {
    case "📚":
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="9" y1="7" x2="16" y2="7" />
          <line x1="9" y1="11" x2="14" y2="11" />
        </svg>
      );
    case "🎯":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case "🗺️":
      return (
        <svg {...common}>
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      );
    case "🧪":
      return (
        <svg {...common}>
          <path d="M9 3h6v5l4 7a2 2 0 0 1-1.7 3H6.7A2 2 0 0 1 5 15l4-7V3z" />
          <line x1="9" y1="3" x2="15" y2="3" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
          <circle cx="10" cy="13" r="0.7" fill="currentColor" />
        </svg>
      );
    default:
      return <span style={{ fontSize: "24px" }}>{icon}</span>;
  }
}

export default function FeatureCard({
  icon,
  title,
  description,
  href,
  gradient,
}: FeatureCardProps) {
  const [hovered, setHovered] = useState(false);

  // Extract primary color from gradient for glow
  const glowColor = gradient.includes("7c3aed")
    ? "rgba(124,58,237,0.35)"
    : gradient.includes("3b82f6")
    ? "rgba(59,130,246,0.35)"
    : gradient.includes("06b6d4")
    ? "rgba(6,182,212,0.35)"
    : "rgba(245,158,11,0.35)";

  return (
    <Link
      href={href}
      className="glass-card gradient-border"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "32px",
        textDecoration: "none",
        color: "inherit",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon with gradient background + glow */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            transform: hovered ? "scale(1.08) rotate(-3deg)" : "scale(1) rotate(0deg)",
            transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease",
            boxShadow: hovered
              ? `0 12px 30px ${glowColor}, 0 0 40px ${glowColor}`
              : `0 8px 24px ${glowColor.replace("0.35", "0.15")}`,
            position: "relative",
            zIndex: 1,
          }}
        >
          <FeatureIcon icon={icon} />
        </div>
        {/* Ambient glow behind icon */}
        <div
          style={{
            position: "absolute",
            inset: "-8px",
            borderRadius: "20px",
            background: gradient,
            opacity: hovered ? 0.2 : 0,
            filter: "blur(16px)",
            transition: "opacity 0.4s ease",
            zIndex: 0,
          }}
        />
      </div>

      {/* Content */}
      <h3
        style={{
          fontSize: "1.15rem",
          fontWeight: 600,
          marginBottom: "10px",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.9rem",
          lineHeight: 1.6,
          flex: 1,
        }}
      >
        {description}
      </p>

      {/* Arrow */}
      <div
        style={{
          marginTop: "20px",
          color: hovered ? "var(--text-primary)" : "var(--text-muted)",
          fontSize: "0.85rem",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 0.3s ease",
        }}
      >
        Explore{" "}
        <span
          style={{
            display: "inline-block",
            transform: hovered ? "translateX(4px)" : "translateX(0)",
            transition: "transform 0.3s ease",
          }}
        >
          →
        </span>
      </div>
    </Link>
  );
}

