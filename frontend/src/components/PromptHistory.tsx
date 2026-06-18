"use client";

import { useState, useEffect } from "react";
import { History, Trash2, RotateCcw, X, Clock } from "lucide-react";

interface HistoryEntry {
  id: string;
  prompt: string;
  model: string;
  output: string;
  timestamp: number;
}

const STORAGE_KEY = "prompt-diary-playground-history";
const MAX_HISTORY = 20;

export default function PromptHistory({
  onReplay,
  isOpen,
  onClose,
}: {
  onReplay: (prompt: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        setHistory([]);
      }
    }
  }, [isOpen]);

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }

  function deleteEntry(id: string) {
    const updated = history.filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setHistory(updated);
  }

  if (!isOpen) return null;

  return (
    <div
      id="prompt-history-panel"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "400px",
        maxWidth: "90vw",
        height: "100vh",
        background: "rgba(8, 10, 18, 0.96)",
        backdropFilter: "blur(20px)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        animation: "slideInRight 0.25s ease-out",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <History size={18} />
          Prompt History
          <span
            style={{
              fontSize: "0.7rem",
              padding: "2px 8px",
              borderRadius: "10px",
              background: "rgba(124,58,237,0.15)",
              color: "#a78bfa",
              fontWeight: 600,
            }}
          >
            {history.length}
          </span>
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 10px",
                borderRadius: "8px",
                border: "1px solid rgba(239,68,68,0.2)",
                background: "rgba(239,68,68,0.08)",
                color: "#f87171",
                fontSize: "0.72rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Trash2 size={12} />
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* History List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
        }}
      >
        {history.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "var(--text-muted)",
            }}
          >
            <History
              size={36}
              strokeWidth={1.5}
              style={{ marginBottom: "12px", opacity: 0.5 }}
            />
            <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              No history yet
            </p>
            <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>
              Your prompt runs will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {history.map((entry) => (
              <div
                key={entry.id}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(124,58,237,0.3)";
                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.06)";
                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.03)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "#a78bfa",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: "rgba(124,58,237,0.12)",
                    }}
                  >
                    {entry.model}
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Clock size={10} />
                    {new Date(entry.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-primary)",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    marginBottom: "10px",
                  }}
                >
                  {entry.prompt}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => onReplay(entry.prompt)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid rgba(0,229,255,0.2)",
                      background: "rgba(0,229,255,0.08)",
                      color: "#67e8f9",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <RotateCcw size={11} />
                    Replay
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEntry(entry.id);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid rgba(239,68,68,0.15)",
                      background: "transparent",
                      color: "var(--text-muted)",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={11} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Save a prompt run to localStorage history.
 */
export function saveToHistory(
  prompt: string,
  model: string,
  output: string
) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const history: HistoryEntry[] = stored ? JSON.parse(stored) : [];

    const newEntry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      prompt,
      model,
      output,
      timestamp: Date.now(),
    };

    // Add to front, cap at MAX_HISTORY
    const updated = [newEntry, ...history].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be full or unavailable
  }
}
