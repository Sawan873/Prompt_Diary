"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminGetStats, getArticles, getChallenges } from "@/lib/api";
import { BookOpen, Target, Map, Users, AlertCircle } from "lucide-react";

interface StatsData {
  total_articles: number;
  published_articles: number;
  draft_articles: number;
  total_challenges: number;
  total_roadmaps: number;
  total_users: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [recentChallenges, setRecentChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      // Load stats
      try {
        const response = await adminGetStats();
        if (response?.success && response?.stats) {
          setStats(response.stats);
        } else {
          setError("Failed to fetch platform statistics.");
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
        setError("An error occurred while loading dashboard statistics.");
      } finally {
        setLoading(false);
      }

      // Load recent content
      try {
        const [articlesRes, challengesRes] = await Promise.all([
          getArticles(),
          getChallenges()
        ]);

        if (articlesRes?.articles) {
          setRecentArticles(articlesRes.articles.slice(0, 5));
        }
        if (challengesRes?.challenges) {
          setRecentChallenges(challengesRes.challenges.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load recent content:", err);
      } finally {
        setContentLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <div 
            style={{
              height: "28px",
              width: "180px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "4px",
              animation: "pulse-glow 1.5s ease-in-out infinite",
              marginBottom: "8px",
            }}
          />
          <div 
            style={{
              height: "16px",
              width: "280px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "4px",
              animation: "pulse-glow 1.5s ease-in-out infinite",
            }}
          />
        </div>

        {/* Skeleton Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="glass-card" 
              style={{
                height: "140px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ height: "14px", width: "100px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }} />
                <div style={{ height: "36px", width: "36px", background: "rgba(255,255,255,0.05)", borderRadius: "10px" }} />
              </div>
              <div style={{ height: "32px", width: "60px", background: "rgba(255,255,255,0.05)", borderRadius: "6px" }} />
            </div>
          ))}
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
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f87171" }}>Error Loading Stats</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "4px" }}>{error}</p>
        </div>
      </div>
    );
  }

  const statItems = [
    {
      label: "Total Articles",
      value: stats?.total_articles ?? 0,
      icon: BookOpen,
      color: "#a855f6", // Purple
      bgGlow: "rgba(168, 85, 246, 0.12)",
      borderColor: "rgba(168, 85, 246, 0.25)",
      details: `${stats?.published_articles ?? 0} Published • ${stats?.draft_articles ?? 0} Drafts`,
    },
    {
      label: "Total Challenges",
      value: stats?.total_challenges ?? 0,
      icon: Target,
      color: "#3b82f6", // Blue
      bgGlow: "rgba(59, 130, 246, 0.12)",
      borderColor: "rgba(59, 130, 246, 0.25)",
      details: "Practice challenges",
    },
    {
      label: "Total Roadmaps",
      value: stats?.total_roadmaps ?? 0,
      icon: Map,
      color: "#f97316", // Orange
      bgGlow: "rgba(249, 115, 22, 0.12)",
      borderColor: "rgba(249, 115, 22, 0.25)",
      details: "Structured paths",
    },
    {
      label: "Total Users",
      value: stats?.total_users ?? 0,
      icon: Users,
      color: "#06b6d4", // Cyan
      bgGlow: "rgba(6, 182, 212, 0.12)",
      borderColor: "rgba(6, 182, 212, 0.25)",
      details: "Registered members",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: "6px" }}>
          Dashboard
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Platform overview and core aggregates.
        </p>
      </div>

      {/* Grid of Stat Cards */}
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="glass-card shimmer-hover"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                borderTop: `2px solid ${item.color}`,
                boxShadow: `inset 0 0 12px ${item.bgGlow}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  {item.label}
                </span>
                <div 
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    background: item.bgGlow,
                    border: `1px solid ${item.borderColor}`,
                    color: item.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "2rem", fontWeight: 800, lineHeight: "1.1" }}>
                  {item.value}
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                  {item.details}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Quick Actions
        </h2>
        <div 
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <Link
            href="/admin/articles?create=true"
            className="glass-card shimmer-hover"
            style={{
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              textDecoration: "none",
              color: "inherit",
              fontWeight: 600,
              fontSize: "0.9rem",
              borderLeft: "3px solid #a855f6",
            }}
          >
            <span style={{ fontSize: "1.25rem" }}>✍️</span>
            <span>Create New Article</span>
          </Link>

          <Link
            href="/admin/challenges?create=true"
            className="glass-card shimmer-hover"
            style={{
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              textDecoration: "none",
              color: "inherit",
              fontWeight: 600,
              fontSize: "0.9rem",
              borderLeft: "3px solid #3b82f6",
            }}
          >
            <span style={{ fontSize: "1.25rem" }}>🏆</span>
            <span>Create New Challenge</span>
          </Link>

          <Link
            href="/admin/roadmaps?create=true"
            className="glass-card shimmer-hover"
            style={{
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              textDecoration: "none",
              color: "inherit",
              fontWeight: 600,
              fontSize: "0.9rem",
              borderLeft: "3px solid #f97316",
            }}
          >
            <span style={{ fontSize: "1.25rem" }}>🗺️</span>
            <span>Create New Roadmap</span>
          </Link>
        </div>
      </div>

      {/* Recent Content Columns */}
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Recent Articles */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen size={18} style={{ color: "#a855f6" }} />
            Recent Articles
          </h3>
          {contentLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: "40px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", animation: "pulse-glow 1.5s infinite" }} />
              ))}
            </div>
          ) : recentArticles.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/articles?edit=${article.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(168, 85, 246, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.04)";
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {article.title}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
                      {article.category} • {article.difficulty}
                    </span>
                  </div>
                  <span 
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: article.published ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                      color: article.published ? "#34d399" : "#fbbf24",
                      border: article.published ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(245, 158, 11, 0.2)",
                    }}
                  >
                    {article.published ? "Published" : "Draft"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
              No articles found.
            </p>
          )}
        </div>

        {/* Recent Challenges */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Target size={18} style={{ color: "#3b82f6" }} />
            Recent Challenges
          </h3>
          {contentLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: "40px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", animation: "pulse-glow 1.5s infinite" }} />
              ))}
            </div>
          ) : recentChallenges.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recentChallenges.map((challenge) => (
                <Link
                  key={challenge.id}
                  href={`/admin/challenges?edit=${challenge.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.04)";
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {challenge.title}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
                      {challenge.category} • {challenge.difficulty}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#60a5fa" }}>
                    {challenge.points} XP
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
              No challenges found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
