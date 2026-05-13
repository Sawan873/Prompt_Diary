"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface CmdItem {
  icon: string;
  label: string;
  href: string;
  hint?: string;
}

const allItems: CmdItem[] = [
  { icon: "📚", label: "Articles", href: "/articles", hint: "Learn" },
  { icon: "🎯", label: "Challenges", href: "/challenges", hint: "Practice" },
  { icon: "🗺️", label: "Roadmaps", href: "/roadmaps", hint: "Paths" },
  { icon: "🧪", label: "Playground", href: "/playground", hint: "Test" },
  { icon: "🏛️", label: "System Design", href: "/system-design", hint: "Arch" },
  { icon: "📊", label: "Dashboard", href: "/dashboard", hint: "Stats" },
  { icon: "🔍", label: "Search", href: "/search", hint: "Find" },
  { icon: "🏠", label: "Home", href: "/", hint: "Main" },
  { icon: "🧩", label: "Prompt Engineering", href: "/articles?category=fundamentals" },
  { icon: "⚡", label: "Zero/Few-Shot", href: "/articles?category=techniques" },
  { icon: "🏗️", label: "RAG Architecture", href: "/articles?category=architecture" },
  { icon: "🤖", label: "AI Agents", href: "/articles?category=agents" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          (item.hint?.toLowerCase().includes(query.toLowerCase()))
      )
    : allItems;

  const handleOpen = useCallback(() => {
    setOpen(true);
    setQuery("");
    setActiveIdx(0);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const navigate = useCallback(
    (href: string) => {
      handleClose();
      router.push(href);
    },
    [handleClose, router]
  );

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        open ? handleClose() : handleOpen();
      }
      if (e.key === "Escape" && open) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleOpen, handleClose]);

  // Focus input
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filtered[activeIdx]) {
      navigate(filtered[activeIdx].href);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="cmd-overlay" onClick={handleClose} />
      <div className="cmd-palette" onKeyDown={handleKeyDown}>
        <input
          ref={inputRef}
          className="cmd-input"
          placeholder="Search pages, topics..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIdx(0);
          }}
        />
        <div className="cmd-results">
          {filtered.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              No results found
            </div>
          ) : (
            filtered.map((item, i) => (
              <div
                key={item.href + item.label}
                className={`cmd-item ${i === activeIdx ? "active" : ""}`}
                onClick={() => navigate(item.href)}
                onMouseEnter={() => setActiveIdx(i)}
              >
                <span className="cmd-item-icon">{item.icon}</span>
                <span className="cmd-item-label">{item.label}</span>
                {item.hint && <span className="cmd-item-hint">{item.hint}</span>}
              </div>
            ))
          )}
        </div>
        <div className="cmd-footer">
          <span><kbd className="cmd-kbd">↑↓</kbd> navigate</span>
          <span><kbd className="cmd-kbd">↵</kbd> open</span>
          <span><kbd className="cmd-kbd">esc</kbd> close</span>
        </div>
      </div>
    </>
  );
}
