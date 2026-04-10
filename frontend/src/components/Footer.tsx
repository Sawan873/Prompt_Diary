"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Learn",
      links: [
        { href: "/articles", label: "Articles" },
        { href: "/roadmaps", label: "Roadmaps" },
        { href: "/challenges", label: "Challenges" },
        { href: "/playground", label: "Playground" },
      ],
    },
    {
      title: "Topics",
      links: [
        { href: "/articles?category=fundamentals", label: "Fundamentals" },
        { href: "/articles?category=techniques", label: "Techniques" },
        { href: "/articles?category=architecture", label: "Architecture" },
        { href: "/articles?category=agents", label: "AI Agents" },
      ],
    },
    {
      title: "Community",
      links: [
        { href: "#", label: "GitHub" },
        { href: "#", label: "Discord" },
        { href: "#", label: "Twitter" },
        { href: "#", label: "Blog" },
      ],
    },
  ];

  return (
    <footer
      id="main-footer"
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "rgba(10, 10, 15, 0.9)",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "64px 24px 32px",
        }}
      >
        {/* Top section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "48px",
            marginBottom: "48px",
          }}
        >
          {/* Brand */}
          <div>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
                color: "inherit",
                marginBottom: "16px",
              }}
            >
              <span style={{ fontSize: "24px" }}>🧠</span>
              <span
                style={{ fontSize: "1.15rem", fontWeight: 700 }}
                className="gradient-text"
              >
                Prompt Dairy
              </span>
            </Link>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.9rem",
                lineHeight: 1.6,
                maxWidth: "280px",
              }}
            >
              Learn prompt engineering, AI system design, and LLM workflows.
              Practice, experiment, and master the art of AI communication.
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-secondary)",
                  marginBottom: "16px",
                }}
              >
                {section.title}
              </h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {section.links.map((link) => (
                  <li key={link.label} style={{ marginBottom: "10px" }}>
                    <Link
                      href={link.href}
                      style={{
                        color: "var(--text-muted)",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        transition: "color 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--text-primary)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--text-muted)")
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            © {currentYear} Prompt Dairy. Built with ❤️ for the AI community.
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link
              href="#"
              style={{
                color: "var(--text-muted)",
                textDecoration: "none",
                fontSize: "0.85rem",
              }}
            >
              Privacy
            </Link>
            <Link
              href="#"
              style={{
                color: "var(--text-muted)",
                textDecoration: "none",
                fontSize: "0.85rem",
              }}
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
