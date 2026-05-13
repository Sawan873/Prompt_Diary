"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useState, useEffect } from "react";
import { getUserStats } from "@/lib/api";
import Skeleton from "@/components/Skeleton";

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

/* Progress Ring SVG component */
function ProgressRing({ progress, size = 72, color = "#00e5ff", label = "" }: {
  progress: number; size?: number; color?: string; label?: string;
}) {
  const stroke = 5;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          className="progress-ring-circle"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color }}>{progress}%</span>
        {label && <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{label}</span>}
      </div>
    </div>
  );
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

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Skeleton loading state
  if (loading) {
    return (
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "36px" }}>
          <Skeleton variant="avatar" />
          <div style={{ flex: 1 }}>
            <Skeleton variant="title" width="200px" />
            <Skeleton variant="text" width="160px" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "36px" }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="card" height="140px" />)}
        </div>
        <Skeleton variant="title" width="300px" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginTop: "16px" }}>
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="card" height="120px" />)}
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName =
    user.user_metadata?.display_name ||
    user.user_metadata?.username ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Learner";

  const avatarUrl = user.user_metadata?.avatar_url;
  const handleSignOut = async () => { await signOut(); router.push("/"); };

  const levelColors: Record<string, string> = {
    Newcomer: "#6b7280", Beginner: "#10b981", Intermediate: "#3b82f6",
    Advanced: "#a855f6", Expert: "#f59e0b",
  };
  const currentLevel = stats?.level || "Newcomer";
  const levelColor = levelColors[currentLevel] || "#6b7280";

  // Gamification data
  const streak = 5; // Would come from API
  const xp = stats?.total_points ?? 0;
  const nextLevelXp = currentLevel === "Newcomer" ? 100 : currentLevel === "Beginner" ? 300 : currentLevel === "Intermediate" ? 700 : 1500;
  const xpProgress = Math.min(Math.round((xp / nextLevelXp) * 100), 100);

  const recentActivity = [
    { icon: "📚", text: "Read \"Prompt Engineering Fundamentals\"", time: "2h ago", color: "#7c3aed" },
    { icon: "🎯", text: "Completed Summarization Challenge", time: "5h ago", color: "#3b82f6" },
    { icon: "⭐", text: "Earned 50 XP", time: "5h ago", color: "#f59e0b" },
    { icon: "🗺️", text: "Started Beginner Roadmap", time: "1d ago", color: "#06b6d4" },
  ];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
      {/* Welcome header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" style={{ width: "56px", height: "56px", borderRadius: "50%", border: `3px solid ${levelColor}`, objectFit: "cover" }} />
          ) : (
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `linear-gradient(135deg, ${levelColor}33, rgba(176,38,255,0.2))`, border: `3px solid ${levelColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 700, color: levelColor }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, marginBottom: "4px" }}>
              Welcome, <span className="gradient-text">{displayName}</span>
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{user.email}</p>
              <span style={{ padding: "2px 10px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: `${levelColor}20`, color: levelColor, border: `1px solid ${levelColor}40` }}>
                {currentLevel}
              </span>
            </div>
          </div>
        </div>
        <button id="dashboard-logout" onClick={handleSignOut} className="btn-secondary" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>Sign Out</button>
      </div>

      {/* Streak + XP Progress Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
        {/* Streak Card */}
        <div className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: "2.5rem" }}><span className="streak-fire">🔥</span></div>
          <div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#f59e0b" }}>{streak}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>Day Streak</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
            {[...Array(7)].map((_, i) => (
              <div key={i} style={{
                width: "8px", height: i < streak ? "24px" : "12px", borderRadius: "4px",
                background: i < streak ? "linear-gradient(to top, #f59e0b, #ef4444)" : "rgba(255,255,255,0.06)",
                transition: "height 0.3s ease", alignSelf: "flex-end",
              }} />
            ))}
          </div>
        </div>

        {/* XP Progress Card */}
        <div className="glass-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
          <ProgressRing progress={xpProgress} color={levelColor} label="to next" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>XP Progress</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{xp} <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 400 }}>/ {nextLevelXp} XP</span></div>
            <div style={{ marginTop: "8px", height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${xpProgress}%`, background: `linear-gradient(90deg, ${levelColor}, ${levelColor}99)`, borderRadius: "3px", transition: "width 1s ease" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning Banner */}
      <div className="glass-card hud-panel" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>📖</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Continue: Prompt Engineering Fundamentals</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>You&apos;re 40% through this article</div>
          </div>
        </div>
        <Link href="/articles" className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>Continue →</Link>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "36px" }}>
        {[
          { label: "Articles Read", value: statsLoading ? "—" : (stats?.articles_completed ?? 0), icon: "📚", gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)" },
          { label: "Challenges Solved", value: statsLoading ? "—" : (stats?.challenges_completed ?? 0), icon: "🎯", gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)" },
          { label: "Total Points", value: statsLoading ? "—" : (stats?.total_points ?? 0), icon: "⭐", gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)" },
          { label: "Level", value: statsLoading ? "—" : currentLevel, icon: "🏆", gradient: `linear-gradient(135deg, ${levelColor}, ${levelColor}99)` },
        ].map((stat) => (
          <div key={stat.label} className="glass-card" style={{ padding: "20px", textAlign: "center", borderTop: `2px solid ${stat.gradient.match(/#[0-9a-fA-F]{6}/)?.[0] || "transparent"}` }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>{stat.icon}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "4px" }} className="gradient-text">{stat.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{ marginBottom: "36px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px" }}>Recent Activity</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {recentActivity.map((item, i) => (
            <div key={i} className="glass-card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${item.color}15`, border: `1px solid ${item.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                {item.icon}
              </div>
              <span style={{ flex: 1, fontSize: "0.88rem", fontWeight: 500 }}>{item.text}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", flexShrink: 0 }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginBottom: "24px" }}>
        Choose a module to continue your learning journey.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
        {modules.map((module) => (
          <Link key={module.title} href={module.href} className="glass-card" style={{ textDecoration: "none", color: "inherit", padding: "24px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "1.6rem" }}>{module.icon}</span>
            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{module.title}</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{module.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
