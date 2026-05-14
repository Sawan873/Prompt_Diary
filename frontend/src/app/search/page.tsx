"use client";

import { useState } from "react";
import Link from "next/link";
import { searchContent } from "@/lib/api";

interface SearchResult {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    difficulty: string;
  }>;
  challenges: Array<{
    id: string;
    title: string;
    description: string;
    difficulty: string;
    category: string;
    points: number;
  }>;
  roadmaps: Array<{
    id: string;
    title: string;
    description: string;
    level: string;
    estimated_hours: number;
  }>;
  total: number;
}

type FilterType = "all" | "articles" | "challenges" | "roadmaps";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim().length < 2) return;

    setLoading(true);
    setSearched(true);

    try {
      const data = await searchContent(
        query.trim(),
        filter === "all" ? undefined : filter
      );
      setResults(data);
    } catch {
      setResults({ articles: [], challenges: [], roadmaps: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const difficultyColors: Record<string, string> = {
    beginner: "#10b981",
    easy: "#10b981",
    intermediate: "#3b82f6",
    medium: "#f59e0b",
    advanced: "#ef4444",
    hard: "#ef4444",
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: "36px" }}>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Search
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.05rem",
            maxWidth: "600px",
          }}
        >
          Find articles, challenges, and roadmaps across the platform.
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for topics, techniques, architectures..."
          style={{
            flex: 1,
            padding: "14px 20px",
            borderRadius: "12px",
            border: "1px solid var(--border-medium)",
            background: "rgba(0,0,0,0.3)",
            color: "var(--text-primary)",
            fontSize: "0.95rem",
            outline: "none",
            transition: "border-color 0.2s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,255,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "")}
        />
        <button
          type="submit"
          id="search-submit"
          className="btn-primary"
          disabled={loading || query.trim().length < 2}
          style={{
            padding: "14px 28px",
            fontSize: "0.9rem",
            opacity: loading || query.trim().length < 2 ? 0.5 : 1,
            cursor: loading || query.trim().length < 2 ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "28px",
          flexWrap: "wrap",
        }}
      >
        {(
          [
            { key: "all",        label: "All",        icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
            { key: "articles",   label: "Articles",   icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg> },
            { key: "challenges", label: "Challenges", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> },
            { key: "roadmaps",   label: "Roadmaps",   icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l4-4 4 4 4-8 4 4"/><path d="M21 21H3"/></svg> },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setFilter(tab.key);
              if (searched) handleSearch();
            }}
            style={{ padding: "8px 16px", borderRadius: "10px", border: `1px solid ${filter === tab.key ? "rgba(0,229,255,0.5)" : "var(--border-subtle)"}`, background: filter === tab.key ? "rgba(0,229,255,0.1)" : "transparent", color: filter === tab.key ? "#00e5ff" : "var(--text-secondary)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <span style={{ display: "flex" }}>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "3px solid rgba(0,229,255,0.2)",
              borderTopColor: "#00e5ff",
              animation: "orbit 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "var(--text-muted)" }}>Searching...</p>
        </div>
      )}

      {!loading && searched && results && (
        <div>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              marginBottom: "20px",
            }}
          >
            {results.total} result{results.total !== 1 ? "s" : ""} found for &ldquo;{query}&rdquo;
          </p>

          {/* Articles Results */}
          {results.articles.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "7px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
                Articles ({results.articles.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {results.articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="glass-card"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      padding: "18px 22px",
                      display: "block",
                    }}
                  >
                    <div style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "center" }}>
                      <span className={`badge badge-${article.difficulty}`}>
                        {article.difficulty}
                      </span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                          textTransform: "capitalize",
                        }}
                      >
                        {article.category}
                      </span>
                    </div>
                    <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "4px" }}>
                      {article.title}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.5,
                      }}
                    >
                      {article.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Challenges Results */}
          {results.challenges.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "7px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                Challenges ({results.challenges.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {results.challenges.map((challenge) => (
                  <Link
                    key={challenge.id}
                    href={`/challenges/${challenge.id}`}
                    className="glass-card"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      padding: "18px 22px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "center" }}>
                        <span className={`badge badge-${challenge.difficulty}`}>
                          {challenge.difficulty}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
                          {challenge.category}
                        </span>
                      </div>
                      <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "4px" }}>
                        {challenge.title}
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        {challenge.description}
                      </p>
                    </div>
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <div className="gradient-text" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                        {challenge.points}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>PTS</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Roadmaps Results */}
          {results.roadmaps.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "7px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l4-4 4 4 4-8 4 4"/><path d="M21 21H3"/></svg>
                Roadmaps ({results.roadmaps.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {results.roadmaps.map((roadmap) => (
                  <Link
                    key={roadmap.id}
                    href="/roadmaps"
                    className="glass-card"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      padding: "18px 22px",
                      display: "block",
                      borderLeft: `3px solid ${difficultyColors[roadmap.level] || "#6b7280"}`,
                    }}
                  >
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "6px" }}>
                      <span className={`badge badge-${roadmap.level}`}>{roadmap.level}</span>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        ~{roadmap.estimated_hours} hours
                      </span>
                    </div>
                    <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "4px" }}>
                      {roadmap.title}
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {roadmap.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {results.total === 0 && (
            <div
              className="glass-card"
              style={{
                textAlign: "center",
                padding: "48px 24px",
              }}
            >
              <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "8px" }}>
                No results found
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Try different keywords or browse our{" "}
                <Link href="/articles" style={{ color: "#a78bfa", textDecoration: "none" }}>
                  articles
                </Link>{" "}
                directly.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Initial state */}
      {!searched && !loading && (
        <div
          className="glass-card"
          style={{
            textAlign: "center",
            padding: "60px 24px",
          }}
        >
          <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "12px" }}>
            Search the Platform
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "400px", margin: "0 auto" }}>
            Search across articles, challenges, and roadmaps to find exactly what you need.
          </p>
        </div>
      )}
    </div>
  );
}
