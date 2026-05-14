import Link from "next/link";
import type { Metadata } from "next";
import { serverListSystemDesignArticles } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "System Design — Prompt Dairy",
  description: "Architecture-focused learning articles for AI systems and LLM workflows.",
};

export default async function SystemDesignPage() {
  const data = await serverListSystemDesignArticles();
  const articles = Array.isArray(data?.articles) ? data.articles : [];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: "36px" }}>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          System Design
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "640px" }}>
          Learn how production AI systems are designed, evaluated, and scaled.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {articles.map((article: { id: string; slug: string; title: string; excerpt: string }) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="glass-card"
            style={{ textDecoration: "none", color: "inherit", padding: "24px 28px" }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "8px" }}>{article.title}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
