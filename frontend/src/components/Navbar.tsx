"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/articles", label: "Articles", icon: "📚" },
    { href: "/challenges", label: "Challenges", icon: "🎯" },
    { href: "/roadmaps", label: "Roadmaps", icon: "🗺️" },
    { href: "/playground", label: "Playground", icon: "🧪" },
  ];

  return (
    <nav
      id="main-navigation"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(10, 10, 15, 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          id="nav-logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <span
            style={{
              fontSize: "28px",
              lineHeight: 1,
            }}
          >
            🧠
          </span>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
            className="gradient-text"
          >
            Prompt Dairy
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              id={`nav-${link.label.toLowerCase()}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "10px",
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 500,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "16px" }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}

          <div
            style={{
              width: "1px",
              height: "24px",
              background: "var(--border-subtle)",
              margin: "0 8px",
            }}
          />

          <Link href="/login" id="nav-login" className="btn-secondary" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
            Log In
          </Link>
          <Link href="/signup" id="nav-signup" className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "var(--text-primary)",
            fontSize: "24px",
            cursor: "pointer",
            padding: "8px",
          }}
          className="mobile-toggle"
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          style={{
            padding: "16px 24px 24px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            animation: "slideDown 0.3s ease-out",
          }}
          className="mobile-menu"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                borderRadius: "10px",
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: 500,
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <Link href="/login" className="btn-secondary" style={{ flex: 1, justifyContent: "center", padding: "10px" }}>
              Log In
            </Link>
            <Link href="/signup" className="btn-primary" style={{ flex: 1, justifyContent: "center", padding: "10px" }}>
              Sign Up
            </Link>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
