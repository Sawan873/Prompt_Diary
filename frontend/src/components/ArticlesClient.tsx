"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Inbox, Sparkles, MessageSquare, Loader2, Send, Check } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

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

export default function ArticlesClient({
  articles,
  categories,
}: ArticlesClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  
  // RAG states
  const [isQaOpen, setIsQaOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSourced, setIsSourced] = useState(false);

  const filtered =
    activeCategory === "all"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  const handleAskRag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setAnswer("");
    setIsSourced(false);

    try {
      const res = await fetch(`${API_BASE_URL}/articles/qa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await res.json();
      setAnswer(data.answer);
      setIsSourced(data.sourced);
    } catch (err) {
      setAnswer("Failed to reach Prompt Diary Q&A Assistant. Please verify backend is running.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      {/* ── RAG Chat Assistant Panel ── */}
      <div
        className="glass-card"
        style={{
          padding: "24px",
          marginBottom: "36px",
          border: isQaOpen ? "1px solid rgba(0, 229, 255, 0.25)" : "1px solid rgba(255, 255, 255, 0.08)",
          background: isQaOpen 
            ? "linear-gradient(135deg, rgba(15,23,42,0.4), rgba(0,0,0,0.5))"
            : "linear-gradient(135deg, rgba(255,255,255,0.01), rgba(0,0,0,0.2))",
          boxShadow: isQaOpen ? "0 10px 30px rgba(0, 229, 255, 0.04)" : "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          onClick={() => setIsQaOpen(!isQaOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(0, 229, 255, 0.12)",
                border: "1px solid rgba(0, 229, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#67e8f9",
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>
                Ask Prompt Diary Q&A Assistant
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                Answers user questions dynamically from the articles database
              </p>
            </div>
          </div>
          
          <button
            className="btn-secondary"
            style={{
              padding: "6px 14px",
              fontSize: "0.8rem",
              borderRadius: "8px",
            }}
          >
            {isQaOpen ? "Collapse" : "Ask AI"}
          </button>
        </div>

        {isQaOpen && (
          <div className="animate-slide-down" style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
            <form onSubmit={handleAskRag} style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about Prompt Engineering (e.g. What is Chain-of-Thought prompting?)"
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(0,0,0,0.3)",
                  color: "var(--text-primary)",
                  fontSize: "0.88rem",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="btn-primary"
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  opacity: isSearching || !query.trim() ? 0.6 : 1,
                }}
              >
                {isSearching ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                Ask
              </button>
            </form>

            {/* Answer Display */}
            {(isSearching || answer) && (
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: "10px",
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(0, 229, 255, 0.08)",
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  fontSize: "0.88rem",
                  lineHeight: 1.65,
                }}
              >
                {isSearching ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)" }}>
                    <Loader2 size={16} className="animate-spin" color="#00e5ff" />
                    <span>Searching database and generating answer...</span>
                  </div>
                ) : (
                  <div>
                    <div style={{ color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>
                      {answer}
                    </div>
                    {isSourced && (
                      <div
                        style={{
                          marginTop: "12px",
                          fontSize: "0.72rem",
                          color: "#34d399",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Check size={12} />
                        Grounded in articles database
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Category Filter Bar ── */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "34px",
          flexWrap: "wrap",
          alignItems: "center",
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
                padding: "9px 20px",
                borderRadius: "12px",
                border: isActive
                  ? "1px solid rgba(0, 229, 255, 0.45)"
                  : "1px solid var(--border-medium)",
                background: isActive
                  ? "linear-gradient(135deg, rgba(0,229,255,0.16), rgba(124,58,237,0.18))"
                  : "rgba(255,255,255,0.02)",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                fontSize: "0.84rem",
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.2s ease",
                outline: "none",
                boxShadow: isActive
                  ? "0 0 24px rgba(0,229,255,0.08)"
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.borderColor = "var(--border-medium)";
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
            fontSize: "0.84rem",
            alignSelf: "center",
            letterSpacing: "0.02em",
          }}
        >
          {filtered.length} article{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Article Cards ── */}
      {filtered.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: "64px 32px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <div
            style={{
              width: "58px",
              height: "58px",
              margin: "0 auto 18px",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, rgba(0,229,255,0.12), rgba(124,58,237,0.14))",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Inbox size={26} strokeWidth={1.8} />
          </div>

          <p style={{ fontSize: "1rem" }}>
            No articles in this category yet. Check back soon!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
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
                border: "1px solid rgba(255,255,255,0.07)",
                transition:
                  "transform 0.2s ease, border-color 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = "rgba(0,229,255,0.28)";
                e.currentTarget.style.background = "rgba(255,255,255,0.045)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.background = "";
              }}
            >
              {/* Top row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "18px",
                }}
              >
                {/* Small icon box */}
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "13px",
                    background:
                      "linear-gradient(135deg, rgba(0,229,255,0.12), rgba(124,58,237,0.14))",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <FileText size={19} strokeWidth={1.8} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Difficulty + Category badges */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "11px",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <span className={getBadgeClass(article.difficulty)}>
                      {article.difficulty}
                    </span>

                    <span
                      style={{
                        fontSize: "0.74rem",
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
                        fontSize: "0.74rem",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(article.created_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: "1.14rem",
                      fontWeight: 700,
                      marginBottom: "8px",
                      lineHeight: 1.4,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                      lineHeight: 1.65,
                    }}
                  >
                    {article.excerpt}
                  </p>

                  {/* Tags row */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "15px",
                      flexWrap: "wrap",
                     }}
                  >
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: "0.7rem",
                          padding: "3px 10px",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.04)",
                          color: "var(--text-muted)",
                          border: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <span
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--text-muted)",
                    flexShrink: 0,
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ArrowRight size={17} strokeWidth={1.8} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
