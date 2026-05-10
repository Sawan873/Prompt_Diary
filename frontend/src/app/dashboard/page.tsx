"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const modules = [
  { title: "Learning Articles", href: "/articles", icon: "📚" },
  { title: "Prompt Challenges", href: "/challenges", icon: "🎯" },
  { title: "Prompt Playground", href: "/playground", icon: "🧪" },
  { title: "Learning Roadmaps", href: "/roadmaps", icon: "🗺️" },
  { title: "System Design", href: "/system-design", icon: "🏛️" },
];

export default function DashboardPage() {
  const router = useRouter();

  if (typeof window !== "undefined") {
    const session = localStorage.getItem("promptDiarySession");
    if (!session) {
      router.replace("/login");
      return null;
    }
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, marginBottom: "12px" }}>
        Welcome to your Dashboard
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginBottom: "36px" }}>
        Choose a module to continue your learning journey.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
        {modules.map((module) => (
          <Link
            key={module.title}
            href={module.href}
            className="glass-card"
            style={{
              textDecoration: "none",
              color: "inherit",
              padding: "20px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>{module.icon}</span>
            <span style={{ fontWeight: 600 }}>{module.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
