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

export default function FeatureCard({
  icon,
  title,
  description,
  href,
  gradient,
}: FeatureCardProps) {
  const [hovered, setHovered] = useState(false);

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
      {/* Icon */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "14px",
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          marginBottom: "20px",
          transform: hovered ? "scale(1.08) rotate(-3deg)" : "scale(1) rotate(0deg)",
          transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: hovered
            ? `0 12px 30px ${gradient.includes("7c3aed") ? "rgba(124,58,237,0.35)" : gradient.includes("3b82f6") ? "rgba(59,130,246,0.35)" : gradient.includes("06b6d4") ? "rgba(6,182,212,0.35)" : "rgba(245,158,11,0.35)"}`
            : `0 8px 24px ${gradient.includes("7c3aed") ? "rgba(124,58,237,0.2)" : gradient.includes("3b82f6") ? "rgba(59,130,246,0.2)" : gradient.includes("06b6d4") ? "rgba(6,182,212,0.2)" : "rgba(245,158,11,0.2)"}`,
        }}
      >
        {icon}
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
