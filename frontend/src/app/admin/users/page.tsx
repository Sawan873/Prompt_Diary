"use client";

import { useEffect, useState } from "react";
import { adminGetUsers } from "@/lib/api";
import { Search, User, ShieldAlert, ShieldCheck, Calendar, AlertCircle, X } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  is_admin: boolean;
  created_at: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  async function loadUsers(search?: string) {
    try {
      setLoading(true);
      const response = await adminGetUsers(search);
      if (response?.success && Array.isArray(response?.users)) {
        setUsers(response.users);
      } else {
        setError("Failed to load users list.");
      }
    } catch (err) {
      console.error("Failed to fetch users for admin:", err);
      setError("An error occurred while loading user list.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    loadUsers("");
  };

  if (loading && users.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ height: "28px", width: "180px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", marginBottom: "8px", animation: "pulse-glow 1.5s infinite" }} />
            <div style={{ height: "16px", width: "240px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", animation: "pulse-glow 1.5s infinite" }} />
          </div>
        </div>

        {/* Skeleton Search Bar */}
        <div style={{ height: "46px", width: "320px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", animation: "pulse-glow 1.5s infinite" }} />

        {/* Skeleton Table */}
        <div className="glass-card" style={{ padding: "24px", minHeight: "200px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <div style={{ height: "20px", flex: 2, background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                <div style={{ height: "20px", flex: 2, background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                <div style={{ height: "20px", flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                <div style={{ height: "20px", flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                <div style={{ height: "30px", width: "100px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }} />
              </div>
            ))}
          </div>
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
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f87171" }}>Error Loading Users</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "4px" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Row */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: "6px" }}>
          User Management
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Monitor user registrations, administrator status, and progress details.
        </p>
      </div>

      {/* Search Bar Row */}
      <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "12px", maxWidth: "480px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search 
            size={16} 
            style={{ 
              position: "absolute", 
              left: "14px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "var(--text-muted)" 
            }} 
          />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email, username, or name..."
            style={{
              width: "100%",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-medium)",
              borderRadius: "10px",
              padding: "10px 14px 10px 38px",
              color: "white",
              fontSize: "0.875rem",
              outline: "none",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "2px"
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
          Search
        </button>
      </form>

      {/* Users Table Card */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        {users.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table 
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.01)" }}>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>User Info</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Username</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Role</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Joined Date</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr 
                    key={user.id} 
                    style={{ 
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.015)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {/* User Info (Display Name + Email) */}
                    <td style={{ padding: "16px 24px", fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: user.is_admin ? "rgba(0, 229, 255, 0.1)" : "rgba(255, 255, 255, 0.05)",
                          border: user.is_admin ? "1px solid rgba(0, 229, 255, 0.2)" : "1px solid var(--border-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: user.is_admin ? "#00e5ff" : "var(--text-secondary)"
                        }}>
                          <User size={16} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
                            {user.display_name || "Anonymous Student"}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Username */}
                    <td style={{ padding: "16px 24px", color: "var(--text-primary)" }}>
                      {user.username ? (
                        <span style={{ fontWeight: 500 }}>@{user.username}</span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>

                    {/* Role Badge */}
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {user.is_admin ? (
                          <span 
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              color: "#00e5ff",
                              background: "rgba(0, 229, 255, 0.1)",
                              border: "1px solid rgba(0, 229, 255, 0.2)",
                              padding: "2px 8px",
                              borderRadius: "8px",
                            }}
                          >
                            <ShieldCheck size={12} />
                            Admin
                          </span>
                        ) : (
                          <span 
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              color: "var(--text-secondary)",
                              background: "rgba(255, 255, 255, 0.04)",
                              border: "1px solid var(--border-subtle)",
                              padding: "2px 8px",
                              borderRadius: "8px",
                            }}
                          >
                            Student
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Calendar size={14} style={{ color: "var(--text-muted)" }} />
                        <span>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <button 
                        className="btn-secondary" 
                        onClick={() => alert(`View details for user: ${user.id}`)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              No users found matching the search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
