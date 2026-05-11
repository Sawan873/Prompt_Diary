"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useState, useEffect } from "react";
import { getUserStats } from "@/lib/api";

const modules = [
  { title: "Learning Articles", href: "/articles", icon: "📚", desc: "Read in-depth guides" },
  { title: "Prompt Challenges", href: "/challenges", icon: "🎯", desc: "Practice prompts" },
  { title: "Prompt Playground", href: "/playground", icon: "🧪", desc: "Test your prompts" },
  { title: "Learning Roadmaps", href: "/roadmaps", icon: "🗺️", desc: "Structured paths" },
  { title: "System Design", href: "/system-design", icon: "🏛️", desc: "AI architectures" },
];

interface UserStatsData {
  articles_completed: number;
  challenges_completed: number;
  total_points: number;
  level: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getUserStats();
        if (data?.success && data.stats) {
          setStats(data.stats);
        }
      } catch {
        // Stats fetch failed — show defaults
      } finally {
        setStatsLoading(false);
      }
    }

    if (user) {
      loadStats();
    }
  }, [user]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "48px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "3px solid rgba(0,229,255,0.2)",
              borderTopColor: "#00e5ff",
              animation: "orbit 0.8s linear infinite",
            }}
          />
          <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (!user) {
    return null;
  }

  // Get display name from user metadata or email
  const displayName =
    user.user_metadata?.display_name ||
    user.user_metadata?.username ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Learner";

  const avatarUrl = user.user_metadata?.avatar_url;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const levelColors: Record<string, string> = {
    Newcomer: "#6b7280",
    Beginner: "#10b981",
    Intermediate: "#3b82f6",
    Advanced: "#a855f6",
    Expert: "#f59e0b",
  };

  const currentLevel = stats?.level || "Newcomer";
  const levelColor = levelColors[currentLevel] || "#6b7280";

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
      {/* Welcome header with user info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "36px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                border: `3px solid ${levelColor}`,
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${levelColor}33, rgba(176,38,255,0.2))`,
                border: `3px solid ${levelColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: 700,
                color: levelColor,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 800,
                marginBottom: "4px",
              }}
            >
              Welcome, <span className="gradient-text">{displayName}</span>
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                {user.email}
              </p>
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  background: `${levelColor}20`,
                  color: levelColor,
                  border: `1px solid ${levelColor}40`,
                }}
              >
                {currentLevel}
              </span>
            </div>
          </div>
        </div>

        <button
          id="dashboard-logout"
          onClick={handleSignOut}
          className="btn-secondary"
          style={{
            padding: "8px 20px",
            fontSize: "0.85rem",
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginBottom: "36px",
        }}
      >
        {[
          {
            label: "Articles Read",
            value: statsLoading ? "—" : (stats?.articles_completed ?? 0),
            icon: "📚",
            gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
          },
          {
            label: "Challenges Solved",
            value: statsLoading ? "—" : (stats?.challenges_completed ?? 0),
            icon: "🎯",
            gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)",
          },
          {
            label: "Total Points",
            value: statsLoading ? "—" : (stats?.total_points ?? 0),
            icon: "⭐",
            gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
          },
          {
            label: "Level",
            value: statsLoading ? "—" : currentLevel,
            icon: "🏆",
            gradient: `linear-gradient(135deg, ${levelColor}, ${levelColor}99)`,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card"
            style={{
              padding: "20px",
              textAlign: "center",
              borderTop: `2px solid ${stat.gradient.includes("#") ? stat.gradient.match(/#[0-9a-fA-F]{6}/)?.[0] || "transparent" : "transparent"}`,
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>{stat.icon}</div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "4px",
              }}
              className="gradient-text"
            >
              {stat.value}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "1.05rem",
          marginBottom: "24px",
        }}
      >
        Choose a module to continue your learning journey.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
        }}
      >
        {modules.map((module) => (
          <Link
            key={module.title}
            href={module.href}
            className="glass-card"
            style={{
              textDecoration: "none",
              color: "inherit",
              padding: "24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "1.6rem" }}>{module.icon}</span>
            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{module.title}</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{module.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
