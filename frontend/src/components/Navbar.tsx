"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { getMe, updateProfile } from "@/lib/api";
import {
  BookOpen,
  Target,
  Map,
  Code2,
  Store,
  Network,
  Search,
  LayoutDashboard,
  Menu,
  X,
  ShieldCheck,
  User,
  Settings,
  LogOut,
} from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Settings form state
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    bio: "",
    avatar_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setProfile(null);
      return;
    }

    async function fetchUserProfile() {
      try {
        const response = await getMe();
        if (response?.success) {
          const userProfile = response.user?.profile;
          setProfile(userProfile);
          if (userProfile?.is_admin) {
            setIsAdmin(true);
          }
          // Pre-populate form data
          setFormData({
            username: userProfile?.username || "",
            display_name: userProfile?.display_name || "",
            bio: userProfile?.bio || "",
            avatar_url: userProfile?.avatar_url || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch user profile in Navbar:", err);
      }
    }

    fetchUserProfile();
  }, [user]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { href: "/articles", label: "Articles", Icon: BookOpen },
    { href: "/challenges", label: "Challenges", Icon: Target },
    { href: "/roadmaps", label: "Roadmaps", Icon: Map },
    { href: "/playground", label: "Playground", Icon: Code2 },
    { href: "/marketplace", label: "Marketplace", Icon: Store },
    { href: "/system-design", label: "System Design", Icon: Network },
    { href: "/search", label: "Search", Icon: Search },
  ];

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    setDropdownOpen(false);
    router.push("/");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await updateProfile({
        username: formData.username || undefined,
        display_name: formData.display_name || undefined,
        bio: formData.bio || undefined,
        avatar_url: formData.avatar_url || undefined,
      });

      if (response?.success) {
        setSuccessMsg("Profile updated successfully!");
        // Refresh profile data
        const updated = await getMe();
        if (updated?.success) {
          setProfile(updated.user?.profile);
        }
        setTimeout(() => setSettingsOpen(false), 1200);
      } else {
        setErrorMsg("Failed to update profile.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Get user display info
  const displayName =
    profile?.display_name ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "";

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <nav
      id="main-navigation"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "var(--nav-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(148,163,184,0.14)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
      }}
    >
      <div
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
        }}
      >
        {/* Logo */}
        <Link
          href={user ? "/dashboard" : "/"}
          id="nav-logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Logo size={34} showText={true} textSize="1.25rem" />
        </Link>

        {/* Desktop Navigation Links — Centered */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            justifyContent: "center",
            flex: 1,
            margin: "0 24px",
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const Icon = link.Icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                id={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "9px 14px",
                  borderRadius: "12px",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                  transition: "all 0.2s ease",
                  border: "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.055)";
                  e.currentTarget.style.borderColor = "rgba(148,163,184,0.14)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <Icon size={16} strokeWidth={2} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Controls (Theme Toggle & Settings dropdown) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
          className="desktop-nav"
        >
          <ThemeToggle />

          <div style={{ width: "2px" }} />

          {/* Auth buttons — conditional on login state */}
          {loading ? (
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                border: "2px solid rgba(148, 163, 184, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  border: "2px solid #00e5ff",
                  borderTopColor: "transparent",
                  animation: "nav-spinner 0.8s linear infinite",
                }}
              />
            </div>
          ) : user ? (
            /* Logged in — show dropdown controller */
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen((prev) => !prev);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  borderRadius: "50%",
                }}
                id="nav-user-menu"
                aria-label="User Settings"
                title="User Settings"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: dropdownOpen
                        ? "2px solid #00e5ff"
                        : "2px solid rgba(0,229,255,0.3)",
                      objectFit: "cover",
                      transition: "all 0.2s ease",
                      boxShadow: dropdownOpen ? "0 0 10px rgba(0,229,255,0.4)" : "none",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(176,38,255,0.2))",
                      border: dropdownOpen
                        ? "2px solid #00e5ff"
                        : "2px solid rgba(0,229,255,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#00e5ff",
                      transition: "all 0.2s ease",
                      boxShadow: dropdownOpen ? "0 0 10px rgba(0,229,255,0.4)" : "none",
                    }}
                  >
                    {displayName ? displayName.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="profile-dropdown"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    top: "48px",
                    right: 0,
                    width: "260px",
                    background: "rgba(10, 15, 30, 0.94)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRadius: "16px",
                    border: "1px solid rgba(0, 229, 255, 0.15)",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.02)",
                    overflow: "hidden",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    zIndex: 50,
                  }}
                >
                  {/* User Settings Header */}
                  <div style={{ padding: "4px 8px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontWeight: 800, fontSize: "0.82rem", color: "#00e5ff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                      User Settings
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {displayName}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: "2px" }}>
                      {user?.email}
                    </div>
                  </div>

                  {/* Links */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        id="dropdown-admin"
                        onClick={() => setDropdownOpen(false)}
                        className="dropdown-item"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          color: "#00e5ff",
                          textDecoration: "none",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          transition: "all 0.2s ease",
                        }}
                      >
                        <ShieldCheck size={16} />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      id="dropdown-settings"
                      onClick={() => {
                        setDropdownOpen(false);
                        setSettingsOpen(true);
                      }}
                      className="dropdown-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        color: "var(--text-secondary)",
                        border: "none",
                        background: "transparent",
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Settings size={16} />
                      Profile Settings
                    </button>
                  </div>

                  <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />

                  {/* Sign Out */}
                  <button
                    id="dropdown-signout"
                    onClick={handleSignOut}
                    className="dropdown-item-danger"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      color: "rgba(239, 68, 68, 0.85)",
                      border: "none",
                      background: "transparent",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Not logged in — show login/signup */
            <>
              <Link
                href="/login"
                id="nav-login"
                className="btn-secondary"
                style={{ padding: "8px 20px", fontSize: "0.85rem" }}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                id="nav-signup"
                className="btn-primary"
                style={{ padding: "8px 20px", fontSize: "0.85rem" }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Actions (Theme Toggle + Menu Toggle) */}
        <div
          style={{
            display: "none",
            alignItems: "center",
            gap: "8px",
          }}
          className="mobile-actions"
        >
          <ThemeToggle />
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(148,163,184,0.16)",
              borderRadius: "12px",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          style={{
            padding: "16px 24px 24px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            animation: "slideDown 0.3s ease-out",
            background: "rgba(8, 10, 18, 0.96)",
          }}
          className="mobile-menu"
        >
          {navLinks.map((link) => {
            const Icon = link.Icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(148,163,184,0.12)",
                }}
              >
                <Icon size={17} strokeWidth={2} />
                {link.label}
              </Link>
            );
          })}

          {/* Mobile auth buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px", width: "100%" }}>
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px",
                      background: "rgba(0, 229, 255, 0.1)",
                      border: "1px solid rgba(0, 229, 255, 0.3)",
                      color: "#00e5ff",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      borderRadius: "12px",
                      textDecoration: "none",
                    }}
                  >
                    <ShieldCheck size={16} />
                    Admin Panel
                  </Link>
                )}
                <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setSettingsOpen(true);
                    }}
                    className="btn-secondary"
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      padding: "10px",
                    }}
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="btn-primary"
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      padding: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    padding: "10px",
                  }}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary"
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    padding: "10px",
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {settingsOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(12px)",
            animation: "fadeIn 0.25s ease-out",
          }}
        >
          <div
            style={{
              background: "rgba(8, 12, 24, 0.95)",
              border: "1px solid rgba(0, 229, 255, 0.2)",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 25px 50px -12px rgba(0, 229, 255, 0.15)",
              overflow: "hidden",
              animation: "slideUp 0.3s ease-out",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                <Settings size={20} style={{ color: "#00e5ff" }} />
                Profile Settings
              </h2>
              <button
                onClick={() => {
                  setSettingsOpen(false);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "4px",
                }}
                aria-label="Close settings"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleUpdateProfile} style={{ padding: "24px" }}>
              {errorMsg && (
                <div style={{ color: "#ef4444", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px" }}>
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div style={{ color: "#10b981", fontSize: "0.85rem", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px" }}>
                  {successMsg}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Display Name */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="Jane Doe"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(148,163,184,0.16)",
                      color: "#fff",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                {/* Username */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="janedoe"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(148,163,184,0.16)",
                      color: "#fff",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                {/* Avatar URL */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
                    Avatar Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(148,163,184,0.16)",
                      color: "#fff",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                {/* Bio */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(148,163,184,0.16)",
                      color: "#fff",
                      fontSize: "0.9rem",
                      resize: "none",
                    }}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="btn-secondary"
                  style={{ padding: "10px 20px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{
                    padding: "10px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes nav-spinner {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .dropdown-item:hover {
          color: var(--text-primary) !important;
          background: rgba(255, 255, 255, 0.05);
        }
        .dropdown-item-danger:hover {
          color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.08);
        }
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-actions {
            display: flex !important;
            align-items: center;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
