"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  difficulty: string;
  tags: string[];
  created_at: string;
}

interface ArticlesClientProps {
  articles: Article[];
  categories: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getBadgeClass(difficulty: string) {
  return `badge badge-${difficulty}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ArticlesClient({ articles, categories }: ArticlesClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  return (
    <>
      {/* ── Category Filter Bar ── */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "32px",
          flexWrap: "wrap",
        }}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              id={`filter-${cat}`}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "8px 20px",
                borderRadius: "10px",
                border: isActive
                  ? "1px solid rgba(124, 58, 237, 0.5)"
                  : "1px solid var(--border-medium)",
                background: isActive
                  ? "rgba(124, 58, 237, 0.18)"
                  : "transparent",
                color: isActive ? "#c4b5fd" : "var(--text-secondary)",
                fontSize: "0.85rem",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.2s ease",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--text-secondary)";
                }
              }}
            >
              {cat}
            </button>
          );
        })}

        {/* Article count */}
        <span
          style={{
            marginLeft: "auto",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            alignSelf: "center",
          }}
        >
          {filtered.length} article{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Article Cards ── */}
      {filtered.length === 0 ? (
        <div style={{ padding: "64px 32px", textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
            </svg>
          </div>
          <p style={{ fontSize: "1rem" }}>No articles in this category yet. Check back soon!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.map((article, index) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              id={`article-${article.slug}`}
              className="glass-card animate-fade-in-up"
              style={{
                padding: "28px 32px",
                textDecoration: "none",
                color: "inherit",
                opacity: 0,
                animationDelay: `${index * 0.08}s`,
                display: "block",
              }}
            >
              {/* Top row: badges + arrow */}
              <div
                style={{
                  display: "flex",
                  alignItems: "start",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1 }}>
                  {/* Difficulty + Category badges */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "10px",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <span className={getBadgeClass(article.difficulty)}>
                      {article.difficulty}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        background: "rgba(255,255,255,0.05)",
                        color: "var(--text-muted)",
                        textTransform: "capitalize",
                      }}
                    >
                      {article.category}
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {formatDate(article.created_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 600,
                      marginBottom: "8px",
                      lineHeight: 1.4,
                    }}
                  >
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {article.excerpt}
                  </p>
                </div>

                {/* Arrow */}
                <span
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "1.25rem",
                    flexShrink: 0,
                    marginTop: "4px",
                    transition: "transform 0.2s ease, color 0.2s ease",
                  }}
                >
                  →
                </span>
              </div>

              {/* Tags row */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "14px",
                  flexWrap: "wrap",
                }}
              >
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "0.7rem",
                      padding: "2px 10px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.04)",
                      color: "var(--text-muted)",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
