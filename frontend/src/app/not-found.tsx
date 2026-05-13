"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: `${3 + Math.random() * 5}px`,
            height: `${3 + Math.random() * 5}px`,
            borderRadius: "50%",
            background: ["#00e5ff", "#4d7cff", "#b026ff"][i % 3],
            opacity: 0.3 + Math.random() * 0.3,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Big 404 */}
      <div
        style={{
          fontSize: "clamp(6rem, 18vw, 12rem)",
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          marginBottom: "16px",
          position: "relative",
          animation: glitch ? "glitch 0.2s ease" : "none",
        }}
        className="gradient-text"
      >
        404
      </div>

      {/* Subtitle */}
      <h1
        style={{
          fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
          fontWeight: 700,
          marginBottom: "12px",
          color: "var(--text-primary)",
        }}
      >
        Lost in the Neural Network
      </h1>

      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "1rem",
          maxWidth: "420px",
          marginBottom: "40px",
          lineHeight: 1.7,
        }}
      >
        The page you&apos;re looking for has drifted into the void.
        Let&apos;s get you back on track.
      </p>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          className="btn-primary"
          style={{ padding: "14px 32px", fontSize: "1rem" }}
        >
          ← Back to Home
        </Link>
        <Link
          href="/articles"
          className="btn-secondary"
          style={{ padding: "14px 32px", fontSize: "1rem" }}
        >
          Browse Articles
        </Link>
      </div>

      {/* Suggested pages */}
      <div
        style={{
          marginTop: "56px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { icon: "📚", label: "Articles", href: "/articles" },
          { icon: "🎯", label: "Challenges", href: "/challenges" },
          { icon: "🗺️", label: "Roadmaps", href: "/roadmaps" },
          { icon: "🧪", label: "Playground", href: "/playground" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="glass-card"
            style={{
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              color: "var(--text-secondary)",
              fontSize: "0.88rem",
              fontWeight: 500,
            }}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Terminal-style message */}
      <div
        style={{
          marginTop: "48px",
          padding: "16px 24px",
          borderRadius: "12px",
          background: "rgba(0,0,0,0.3)",
          border: "1px solid var(--border-subtle)",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          maxWidth: "440px",
        }}
      >
        <span style={{ color: "#00e5ff" }}>$</span> find / -name &quot;page&quot;
        <br />
        <span style={{ color: "#f87171" }}>Error:</span> page not found in neural_network/
        <br />
        <span style={{ color: "#34d399" }}>Suggestion:</span> try{" "}
        <span style={{ color: "#00e5ff" }}>cd /home</span>
      </div>
    </div>
  );
}
