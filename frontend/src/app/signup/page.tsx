"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await signup({ email, password, username });
      localStorage.setItem(
        "promptDiarySession",
        JSON.stringify({ email, username, loggedInAt: new Date().toISOString() })
      );
      setMessage(response.message || "Account created successfully!");
      router.push("/dashboard");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setLoading(false);
    }
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
          Create Account
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Start your prompt engineering journey
        </p>
      </div>

      <form
        onSubmit={handleSignup}
        className="glass-card"
        style={{ padding: "32px" }}
      >
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="signup-username"
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              marginBottom: "8px",
            }}
          >
            Username
          </label>
          <input
            id="signup-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="prompt_master"
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

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="signup-email"
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
            id="signup-email"
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
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="signup-password"
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
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
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
          <p
            style={{
              marginTop: "6px",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            Minimum 6 characters
          </p>
        </div>

        {message && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              background: isError
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(16, 185, 129, 0.1)",
              border: isError
                ? "1px solid rgba(239, 68, 68, 0.25)"
                : "1px solid rgba(16, 185, 129, 0.2)",
              color: isError ? "#f87171" : "#34d399",
              fontSize: "0.85rem",
              marginBottom: "20px",
            }}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          id="signup-submit"
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
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "var(--text-muted)",
            fontSize: "0.9rem",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 500 }}
          >
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}
