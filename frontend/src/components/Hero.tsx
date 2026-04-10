"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        padding: "80px 24px 100px",
        maxWidth: "1200px",
        margin: "0 auto",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {/* Decorative grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      {/* Badge */}
      <div
        className="animate-fade-in-up"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 18px",
          borderRadius: "24px",
          background: "rgba(124, 58, 237, 0.1)",
          border: "1px solid rgba(124, 58, 237, 0.2)",
          color: "#a78bfa",
          fontSize: "0.85rem",
          fontWeight: 500,
          marginBottom: "32px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#a78bfa",
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
        />
        Open Source Learning Platform
      </div>

      {/* Main heading */}
      <h1
        className="animate-fade-in-up delay-100"
        style={{
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          marginBottom: "24px",
          opacity: 0,
        }}
      >
        Master the Art of
        <br />
        <span className="gradient-text">Prompt Engineering</span>
      </h1>

      {/* Subtitle */}
      <p
        className="animate-fade-in-up delay-200"
        style={{
          fontSize: "clamp(1rem, 2vw, 1.25rem)",
          color: "var(--text-secondary)",
          maxWidth: "640px",
          margin: "0 auto 40px",
          lineHeight: 1.7,
          opacity: 0,
        }}
      >
        Learn prompt engineering theory, practice writing prompts, explore AI
        architectures, and experiment in our interactive playground — all for
        free.
      </p>

      {/* CTA buttons */}
      <div
        className="animate-fade-in-up delay-300"
        style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "64px",
          opacity: 0,
        }}
      >
        <Link href="/articles" id="cta-start-learning" className="btn-primary" style={{ padding: "14px 32px", fontSize: "1rem" }}>
          Start Learning →
        </Link>
        <Link href="/playground" id="cta-try-playground" className="btn-secondary" style={{ padding: "14px 32px", fontSize: "1rem" }}>
          🧪 Try Playground
        </Link>
      </div>

      {/* Stats */}
      <div
        className="animate-fade-in-up delay-400"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "48px",
          flexWrap: "wrap",
          opacity: 0,
        }}
      >
        {[
          { value: "50+", label: "Articles" },
          { value: "25+", label: "Challenges" },
          { value: "3", label: "Roadmaps" },
          { value: "Free", label: "Always" },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                marginBottom: "4px",
              }}
              className="gradient-text"
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                fontWeight: 500,
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
