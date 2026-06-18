"use client";

import { useEffect, useState } from "react";
import { adminGetAllArticles } from "@/lib/api";
import { Plus, Edit, Trash2, AlertCircle, Calendar } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty?: string;
  published: boolean;
  created_at: string;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticles() {
      try {
        const response = await adminGetAllArticles();
        if (response?.success && Array.isArray(response?.articles)) {
          setArticles(response.articles);
        } else {
          setError("Failed to load articles.");
        }
      } catch (err) {
        console.error("Failed to load articles for admin:", err);
        setError("An error occurred while fetching articles.");
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ height: "28px", width: "160px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", marginBottom: "8px", animation: "pulse-glow 1.5s infinite" }} />
            <div style={{ height: "16px", width: "220px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", animation: "pulse-glow 1.5s infinite" }} />
          </div>
          <div style={{ height: "40px", width: "140px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", animation: "pulse-glow 1.5s infinite" }} />
        </div>

        {/* Skeleton Table */}
        <div className="glass-card" style={{ padding: "24px", minHeight: "200px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <div style={{ height: "20px", flex: 3, background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                <div style={{ height: "20px", flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                <div style={{ height: "20px", flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                <div style={{ height: "20px", flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                <div style={{ height: "30px", width: "80px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="glass-card" 
        style={{
          padding: "24px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          borderColor: "rgba(239, 68, 68, 0.3)",
          background: "rgba(239, 68, 68, 0.05)",
        }}
      >
        <AlertCircle style={{ color: "#ef4444" }} size={24} />
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f87171" }}>Error Loading Articles</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "4px" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: "6px" }}>
            Manage Articles
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Add, edit, or delete platform educational articles.
          </p>
        </div>
        <button 
          className="btn-primary" 
          style={{
            padding: "10px 20px",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Plus size={16} />
          Create New
        </button>
      </div>

      {/* Articles Table Card */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        {articles.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table 
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.01)" }}>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Title</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Category</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Difficulty</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Status</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Created Date</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr 
                    key={article.id} 
                    style={{ 
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.015)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {/* Title */}
                    <td style={{ padding: "16px 24px", fontWeight: 600 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{article.title}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>/{article.slug}</span>
                      </div>
                    </td>
                    
                    {/* Category */}
                    <td style={{ padding: "16px 24px" }}>
                      <span 
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "var(--text-secondary)",
                          background: "rgba(255,255,255,0.04)",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {article.category}
                      </span>
                    </td>

                    {/* Difficulty */}
                    <td style={{ padding: "16px 24px" }}>
                      {article.difficulty ? (
                        <span className={`badge badge-${article.difficulty}`} style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                          {article.difficulty}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "16px 24px" }}>
                      <span 
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: "12px",
                          background: article.published ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                          color: article.published ? "#34d399" : "#fbbf24",
                          border: article.published ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(245, 158, 11, 0.2)",
                        }}
                      >
                        {article.published ? "Published" : "Draft"}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Calendar size={14} style={{ color: "var(--text-muted)" }} />
                        <span>{new Date(article.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button 
                          className="btn-secondary" 
                          style={{
                            padding: "6px 10px",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          aria-label="Edit article"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{
                            padding: "6px 10px",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            borderColor: "rgba(239, 68, 68, 0.2)",
                            color: "#f87171",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
                          }}
                          aria-label="Delete article"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              No articles found. Click &quot;Create New&quot; to add your first article.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
