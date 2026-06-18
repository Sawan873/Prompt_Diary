"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { getMe } from "@/lib/api";
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  Map, 
  Users, 
  ChevronLeft,
  ShieldAlert
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    async function verifyAdmin() {
      try {
        const response = await getMe();
        if (response?.success && response?.user?.profile?.is_admin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Admin validation failed:", err);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    }

    verifyAdmin();
  }, [user, authLoading, router]);

  if (authLoading || checkingAdmin) {
    return (
      <div 
        style={{
          display: "flex",
          height: "80vh",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-primary)",
        }}
      >
        <div style={{ textAlign: "center" }} className="space-y-4">
          <div 
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "3px solid rgba(0, 229, 255, 0.1)",
              borderTopColor: "#00e5ff",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          />
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Verifying administrator privileges...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div 
        style={{
          display: "flex",
          minHeight: "70vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          color: "var(--text-primary)",
        }}
      >
        <div 
          className="glass-card" 
          style={{
            maxWidth: "440px",
            width: "100%",
            padding: "32px",
            textAlign: "center",
            borderTop: "4px solid #ef4444",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div 
              style={{
                padding: "16px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderRadius: "50%",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
              }}
            >
              <ShieldAlert size={40} />
            </div>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.025em" }}>
            Access Denied
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: "1.5" }}>
            You do not have the required administrator privileges to view this section.
          </p>
          <div style={{ paddingTop: "16px" }}>
            <Link 
              href="/dashboard" 
              className="btn-primary" 
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                padding: "10px 0",
              }}
            >
              <ChevronLeft size={16} style={{ marginRight: "8px" }} />
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar navigation links
  const sidebarLinks = [
    { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
    { href: "/admin/articles", label: "Articles", Icon: BookOpen },
    { href: "/admin/challenges", label: "Challenges", Icon: Target },
    { href: "/admin/roadmaps", label: "Roadmaps", Icon: Map },
    { href: "/admin/users", label: "Users", Icon: Users },
  ];

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Header */}
        <div className="admin-sidebar-header">
          <span 
            style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#00e5ff",
            }}
          >
            Control Center
          </span>
        </div>

        {/* Links */}
        <nav className="admin-sidebar-nav">
          {sidebarLinks.map((link) => {
            const Icon = link.Icon;
            const isActive = link.exact 
              ? pathname === link.href 
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className="admin-sidebar-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  background: isActive ? "rgba(0, 229, 255, 0.08)" : "transparent",
                  color: isActive ? "#00e5ff" : "var(--text-secondary)",
                  border: isActive ? "1px solid rgba(0, 229, 255, 0.15)" : "1px solid transparent",
                  boxShadow: isActive ? "0 0 15px rgba(0, 229, 255, 0.04)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--text-primary)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          <div className="admin-main-inner">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .admin-container {
          display: flex;
          min-height: calc(100vh - 72px);
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        .admin-sidebar {
          width: 256px;
          border-right: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        .admin-sidebar-header {
          height: 64px;
          display: flex;
          align-items: center;
          padding: 0 24px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .admin-sidebar-nav {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .admin-main-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
          width: 100%;
        }

        @media (max-width: 768px) {
          .admin-container {
            flex-direction: column;
          }
          .admin-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid var(--border-subtle);
            flex-direction: column;
          }
          .admin-sidebar-header {
            height: auto;
            padding: 16px 24px 8px;
            border-bottom: none;
          }
          .admin-sidebar-nav {
            flex-direction: row;
            flex-wrap: wrap;
            padding: 8px 16px 16px;
            gap: 8px;
          }
          .admin-sidebar-link {
            flex: 1 1 calc(50% - 8px) !important;
            justify-content: center;
            padding: 10px 12px !important;
          }
        }

        @media (max-width: 480px) {
          .admin-sidebar-link {
            flex: 1 1 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
