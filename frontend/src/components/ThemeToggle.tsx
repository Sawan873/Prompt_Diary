"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={() =>
        setTheme(theme === "dark" ? "light" : "dark")
      }
      style={{
        padding: "8px 14px",
        borderRadius: "10px",
        border: "1px solid var(--border-medium)",
        background: "var(--bg-card)",
        color: "var(--text-primary)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  )
}