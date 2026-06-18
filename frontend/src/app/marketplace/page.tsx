"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Store, Sparkles } from "lucide-react";
import PromptCard from "@/components/PromptCard";
import {
  getMarketplacePrompts,
  MarketplacePrompt,
} from "@/lib/api";

const CATEGORIES = [
  { id: "all", label: "All Prompts" },
  { id: "text-generation", label: "Text Generation" },
  { id: "code", label: "Code" },
  { id: "marketing", label: "Marketing" },
  { id: "data", label: "Data" },
  { id: "education", label: "Education" },
  { id: "business", label: "Business" },
  { id: "creative", label: "Creative" },
  { id: "image", label: "Image" },
];

const SORT_OPTIONS = [
  { id: "popular", label: "Most Popular" },
  { id: "newest", label: "Newest" },
  { id: "name", label: "Alphabetical" },
];

export default function MarketplacePage() {
  const [prompts, setPrompts] = useState<MarketplacePrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    loadPrompts();
  }, [activeCategory]);

  async function loadPrompts() {
    setLoading(true);
    try {
      const params: { category?: string; search?: string } = {};
      if (activeCategory !== "all") params.category = activeCategory;
      if (searchQuery) params.search = searchQuery;
      const data = await getMarketplacePrompts(params);
      setPrompts(data.prompts);
    } catch {
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadPrompts();
  }

  const sortedPrompts = [...prompts].sort((a, b) => {
    if (sortBy === "popular") return b.usageCount - a.usageCount;
    if (sortBy === "newest")
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return a.title.localeCompare(b.title);
  });

  return (
    <main
      id="marketplace-page"
      style={{ minHeight: "100vh", padding: "0 24px 80px" }}
    >
      {/* Hero Section */}
      <section
        id="marketplace-hero"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "60px 0 40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "999px",
            background: "rgba(124, 58, 237, 0.12)",
            border: "1px solid rgba(124, 58, 237, 0.25)",
            color: "#a78bfa",
            fontSize: "0.8rem",
            fontWeight: 700,
            marginBottom: "20px",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          <Sparkles size={14} />
          Prompt Marketplace
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            marginBottom: "16px",
          }}
        >
          Discover{" "}
          <span className="gradient-text">Ready-to-Use</span> Prompts
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.1rem",
            maxWidth: "600px",
            margin: "0 auto 36px",
            lineHeight: 1.7,
          }}
        >
          Browse curated prompt templates for every use case — from code reviews
          to marketing copy. Copy, customize, and use them in the Playground.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "4px",
              transition: "border-color 0.25s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                color: "var(--text-muted)",
              }}
            >
              <Search size={18} />
            </div>
            <input
              id="marketplace-search"
              type="text"
              placeholder="Search prompts... (e.g., email, code review, SEO)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                padding: "14px 0",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: "10px 24px",
                fontSize: "0.85rem",
                borderRadius: "12px",
                whiteSpace: "nowrap",
              }}
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {/* Category Filters + Sort */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {/* Category Pills */}
          <div
            id="category-filters"
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                id={`filter-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "999px",
                  border: `1px solid ${
                    activeCategory === cat.id
                      ? "rgba(0,229,255,0.5)"
                      : "rgba(255,255,255,0.08)"
                  }`,
                  background:
                    activeCategory === cat.id
                      ? "rgba(0,229,255,0.12)"
                      : "rgba(255,255,255,0.03)",
                  color:
                    activeCategory === cat.id
                      ? "#67e8f9"
                      : "var(--text-secondary)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <SlidersHorizontal
              size={15}
              color="var(--text-muted)"
              strokeWidth={2}
            />
            <select
              id="marketplace-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "8px 14px",
                color: "var(--text-secondary)",
                fontSize: "0.82rem",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Results Grid */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Results count */}
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            marginBottom: "20px",
          }}
        >
          {loading
            ? "Loading prompts..."
            : `${sortedPrompts.length} prompt${sortedPrompts.length !== 1 ? "s" : ""} found`}
        </p>

        {loading ? (
          /* Skeleton Grid */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="glass-card"
                style={{
                  padding: "24px",
                  height: "220px",
                  animation: "pulse-glow 1.5s ease-in-out infinite",
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "22px",
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.06)",
                    marginBottom: "16px",
                  }}
                />
                <div
                  style={{
                    width: "75%",
                    height: "18px",
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.06)",
                    marginBottom: "10px",
                  }}
                />
                <div
                  style={{
                    width: "100%",
                    height: "14px",
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.04)",
                    marginBottom: "6px",
                  }}
                />
                <div
                  style={{
                    width: "90%",
                    height: "14px",
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.04)",
                  }}
                />
              </div>
            ))}
          </div>
        ) : sortedPrompts.length === 0 ? (
          /* Empty State */
          <div
            className="glass-card"
            style={{
              padding: "60px 40px",
              textAlign: "center",
            }}
          >
            <Store
              size={48}
              strokeWidth={1.5}
              style={{ color: "var(--text-muted)", marginBottom: "16px" }}
            />
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              No prompts found
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Try adjusting your filters or search query.
            </p>
          </div>
        ) : (
          /* Prompt Cards Grid */
          <div
            id="marketplace-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {sortedPrompts.map((prompt, index) => (
              <div
                key={prompt.id}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  opacity: 0,
                }}
              >
                <PromptCard
                  id={prompt.id}
                  title={prompt.title}
                  excerpt={prompt.excerpt}
                  category={prompt.category}
                  model={prompt.model}
                  author={prompt.author}
                  usageCount={prompt.usageCount}
                  isFree={prompt.isFree}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
