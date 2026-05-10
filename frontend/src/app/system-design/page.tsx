import Link from "next/link";
import type { Metadata } from "next";
import { getSystemDesignArticles } from "@/lib/api";

export const metadata: Metadata = {
  title: "System Design — Prompt Dairy",
  description: "Architecture-focused learning articles for AI systems and LLM workflows.",
};

export default async function SystemDesignPage() {
  const data = await getSystemDesignArticles().catch(() => ({ articles: [] }));
  const articles = Array.isArray(data?.articles) ? data.articles : [];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: "36px" }}>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, marginBottom: "12px" }}>
          🏛️ System Design
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
