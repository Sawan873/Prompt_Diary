"use client";

import { useEffect, useState } from "react";
import { adminGetStats } from "@/lib/api";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
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
    }

    fetchStats();
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
    </div>
  );
}
