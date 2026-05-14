"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

// ── SVG Icon Components ────────────────────────────────────────────────────────
const IconArticles = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const IconChallenges = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

const IconRoadmaps = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17l4-4 4 4 4-8 4 4"/>
    <path d="M21 21H3"/>
  </svg>
);

const IconPlayground = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>
);

const IconSystemDesign = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconDashboard = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Nav links config ───────────────────────────────────────────────────────────
const navLinks = [
  { href: "/articles",      label: "Articles",      icon: <IconArticles /> },
  { href: "/challenges",    label: "Challenges",    icon: <IconChallenges /> },
  { href: "/roadmaps",      label: "Roadmaps",      icon: <IconRoadmaps /> },
  { href: "/playground",    label: "Playground",    icon: <IconPlayground /> },
  { href: "/system-design", label: "System Design", icon: <IconSystemDesign /> },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    router.push("/");
  };

  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "";

  const avatarUrl = user?.user_metadata?.avatar_url;
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <nav
        id="main-navigation"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "var(--nav-bg)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid var(--border-subtle)",
          transition: "background 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "68px",
            gap: "16px",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            id="nav-logo"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "inherit",
              flexShrink: 0,
            }}
          >
            <Logo size={32} showText={true} textSize="1.2rem" />
          </Link>

          {/* Desktop Nav — centre */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2px", flex: 1, justifyContent: "center" }}>
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  id={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`nav-link-pro${active ? " nav-link-active" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "7px 14px",
                    borderRadius: "10px",
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: active ? 600 : 450,
                    letterSpacing: "0.01em",
                    transition: "all 0.18s ease",
                    background: active ? "rgba(0,229,255,0.08)" : "transparent",
                    border: active ? "1px solid rgba(0,229,255,0.18)" : "1px solid transparent",
                    position: "relative",
                  }}
                >
                  <span style={{ opacity: active ? 1 : 0.7, transition: "opacity 0.18s" }}>{link.icon}</span>
                  {link.label}
                  {active && (
                    <span style={{
                      position: "absolute",
                      bottom: "6px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "18px",
                      height: "2px",
                      background: "linear-gradient(90deg, #00e5ff, #4d7cff)",
                      borderRadius: "2px",
                    }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            {/* Search shortcut */}
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
              className="nav-search-btn"
              aria-label="Open search (Ctrl+K)"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 11px",
                borderRadius: "8px",
                border: "1px solid var(--border-medium)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-muted)",
                fontSize: "0.78rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "var(--font-geist-mono), monospace",
                whiteSpace: "nowrap",
              }}
            >
              <IconSearch />
              <span style={{ opacity: 0.55 }}>Ctrl K</span>
            </button>

            <ThemeToggle />

            <div style={{ width: "1px", height: "22px", background: "var(--border-subtle)", margin: "0 2px" }} />

            {/* Auth section */}
            {loading ? (
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", animation: "pulse-glow 1.5s ease-in-out infinite" }} />
            ) : user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Link
                  href="/dashboard"
                  id="nav-dashboard"
                  className="nav-link-pro"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "10px",
                    color: isActive("/dashboard") ? "var(--text-primary)" : "var(--text-secondary)",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    border: "1px solid transparent",
                    transition: "all 0.18s ease",
                    background: isActive("/dashboard") ? "rgba(0,229,255,0.08)" : "transparent",
                  }}
                >
                  <IconDashboard />
                  Dashboard
                </Link>
                <button
                  id="nav-signout"
                  onClick={handleSignOut}
                  className="btn-secondary"
                  style={{ padding: "7px 16px", fontSize: "0.82rem", cursor: "pointer" }}
                >
                  Sign Out
                </button>
                <Link href="/dashboard" style={{ textDecoration: "none" }}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      style={{
                        width: "34px", height: "34px", borderRadius: "50%",
                        border: "2px solid rgba(0,229,255,0.3)", objectFit: "cover",
                        cursor: "pointer", transition: "border-color 0.2s ease",
                        display: "block",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,255,0.7)")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)")}
                    />
                  ) : (
                    <div
                      style={{
                        width: "34px", height: "34px", borderRadius: "50%",
                        background: "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(176,38,255,0.2))",
                        border: "2px solid rgba(0,229,255,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", fontWeight: 700, color: "#00e5ff",
                        cursor: "pointer", transition: "border-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,255,0.7)")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)")}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" id="nav-login" className="btn-secondary" style={{ padding: "7px 18px", fontSize: "0.85rem" }}>
                  Log In
                </Link>
                <Link href="/signup" id="nav-signup" className="btn-primary" style={{ padding: "7px 18px", fontSize: "0.85rem" }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-toggle"
            style={{
              display: "none",
              background: "none",
              border: "1px solid var(--border-medium)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "6px",
              transition: "all 0.2s ease",
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            id="mobile-menu"
            className="mobile-menu"
            style={{
              padding: "12px 16px 20px",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              animation: "slideDown 0.25s ease-out",
              background: "var(--nav-bg)",
            }}
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: active ? 600 : 450,
                    background: active ? "rgba(0,229,255,0.07)" : "rgba(255,255,255,0.02)",
                    border: active ? "1px solid rgba(0,229,255,0.15)" : "1px solid transparent",
                    transition: "all 0.18s ease",
                  }}
                >
                  <span style={{ opacity: 0.8 }}>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
            <div style={{ height: "1px", background: "var(--border-subtle)", margin: "8px 0" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              {user ? (
                <>
                  <Link href="/dashboard" className="btn-secondary" onClick={() => setMobileOpen(false)} style={{ flex: 1, justifyContent: "center", padding: "10px" }}>
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="btn-primary" style={{ flex: 1, justifyContent: "center", padding: "10px", cursor: "pointer" }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary" style={{ flex: 1, justifyContent: "center", padding: "10px" }}>
                    Log In
                  </Link>
                  <Link href="/signup" className="btn-primary" style={{ flex: 1, justifyContent: "center", padding: "10px" }}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <style>{`
        .nav-link-pro:hover {
          color: var(--text-primary) !important;
          background: rgba(255,255,255,0.05) !important;
          border-color: rgba(255,255,255,0.08) !important;
        }
        .nav-search-btn:hover {
          border-color: rgba(0,229,255,0.4) !important;
          background: rgba(0,229,255,0.05) !important;
          color: var(--text-secondary) !important;
        }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
        @media (min-width: 901px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </>
  );
}
