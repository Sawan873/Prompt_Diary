"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Phase 1 stub — simulated login
    await new Promise((resolve) => setTimeout(resolve, 800));
    setMessage("Login successful! (Phase 1 stub — Supabase Auth coming in Phase 2)");
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: "440px",
        margin: "0 auto",
        padding: "80px 24px",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <span style={{ fontSize: "48px", display: "block", marginBottom: "16px" }}>🧠</span>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          Welcome Back
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Log in to track your progress
        </p>
      </div>

      <form
        onSubmit={handleLogin}
        className="glass-card"
        style={{ padding: "32px" }}
      >
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="login-email"
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              marginBottom: "8px",
            }}
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid var(--border-medium)",
              background: "rgba(0,0,0,0.3)",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              outline: "none",
              transition: "border-color 0.2s ease",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="login-password"
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              marginBottom: "8px",
            }}
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid var(--border-medium)",
              background: "rgba(0,0,0,0.3)",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
        </div>

        {message && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              color: "#34d399",
              fontSize: "0.85rem",
              marginBottom: "20px",
            }}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          id="login-submit"
          className="btn-primary"
          disabled={loading}
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "12px",
            fontSize: "0.95rem",
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "var(--text-muted)",
            fontSize: "0.9rem",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 500 }}
          >
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
