"use client";

import { useEffect, useState } from "react";
import { 
  adminGetAllArticles, 
  adminCreateArticle, 
  adminUpdateArticle, 
  adminDeleteArticle 
} from "@/lib/api";
import { Plus, Edit, Trash2, AlertCircle, Calendar, X, Save } from "lucide-react";
import { useToast } from "@/components/Toast";

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty?: string;
  published: boolean;
  tags?: string[];
  excerpt?: string;
  content: string;
  created_at: string;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Modal states for creating/editing an article
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("fundamentals");
  const [difficulty, setDifficulty] = useState("beginner");
  const [tagsInput, setTagsInput] = useState("");
  const [published, setPublished] = useState(false);
  
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation modal states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState<Article | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function loadArticles() {
    try {
      setLoading(true);
      const response = await adminGetAllArticles();
      if (response?.success && Array.isArray(response?.articles)) {
        setArticles(response.articles);
      } else {
        setError("Failed to load articles.");
      }
    } catch (err) {
      console.error("Failed to load articles for admin:", err);
      setError("An error occurred while fetching articles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  const openCreateModal = () => {
    setEditingArticleId(null);
    setTitle("");
    setContent("");
    setExcerpt("");
    setCategory("fundamentals");
    setDifficulty("beginner");
    setTagsInput("");
    setPublished(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (article: Article) => {
    setEditingArticleId(article.id);
    setTitle(article.title);
    setContent(article.content || "");
    setExcerpt(article.excerpt || "");
    setCategory(article.category);
    setDifficulty(article.difficulty || "beginner");
    setTagsInput(article.tags ? article.tags.join(", ") : "");
    setPublished(article.published);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !category) {
      setFormError("Title, content, and category are required.");
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    const tags = tagsInput
      ? tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    try {
      if (editingArticleId) {
        // Edit mode
        const result = await adminUpdateArticle(editingArticleId, {
          title,
          content,
          excerpt: excerpt || undefined,
          category,
          difficulty: difficulty || undefined,
          tags,
          published,
        });

        if (result) {
          setIsModalOpen(false);
          showToast("Article updated successfully!", "success");
          await loadArticles();
        } else {
          setFormError("Failed to update article.");
        }
      } else {
        // Create mode
        const result = await adminCreateArticle({
          title,
          content,
          excerpt: excerpt || undefined,
          category,
          difficulty: difficulty || undefined,
          tags,
        });

        // If user wants it published, call update immediately after creation
        if (result && published) {
          await adminUpdateArticle(result.id, { published: true });
        }

        if (result) {
          setIsModalOpen(false);
          showToast("Article created successfully!", "success");
          await loadArticles();
        } else {
          setFormError("Failed to create article.");
        }
      }
    } catch (err: any) {
      console.error("Error saving article:", err);
      setFormError(err.message || "An error occurred while saving the article.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDeleteModal = (article: Article) => {
    setDeletingArticle(article);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!deletingArticle) return;
    setDeleteSubmitting(true);
    setDeleteError(null);

    try {
      const success = await adminDeleteArticle(deletingArticle.id);
      if (success) {
        setIsDeleteOpen(false);
        setDeletingArticle(null);
        showToast("Article deleted successfully!", "success");
        await loadArticles();
      } else {
        setDeleteError("Failed to delete article.");
      }
    } catch (err: any) {
      console.error("Error deleting article:", err);
      setDeleteError(err.message || "An error occurred while deleting the article.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (loading && articles.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ height: "28px", width: "160px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", marginBottom: "8px", animation: "pulse-glow 1.5s infinite" }} />
            <div style={{ height: "16px", width: "220px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", animation: "pulse-glow 1.5s infinite" }} />
          </div>
          <div style={{ height: "40px", width: "140px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", animation: "pulse-glow 1.5s infinite" }} />
        </div>

        {/* Skeleton Table */}
        <div className="glass-card" style={{ padding: "24px", minHeight: "200px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <div style={{ height: "20px", flex: 3, background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                <div style={{ height: "20px", flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                <div style={{ height: "20px", flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                <div style={{ height: "20px", flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
                <div style={{ height: "30px", width: "80px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }} />
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
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f87171" }}>Error Loading Articles</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "4px" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.025em", marginBottom: "6px" }}>
            Manage Articles
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Add, edit, or delete platform educational articles.
          </p>
        </div>
        <button 
          className="btn-primary" 
          onClick={openCreateModal}
          style={{
            padding: "10px 20px",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Plus size={16} />
          Create New
        </button>
      </div>

      {/* Articles Table Card */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        {articles.length > 0 ? (
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
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Title</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Category</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Difficulty</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Status</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Created Date</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr 
                    key={article.id} 
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
                    {/* Title */}
                    <td style={{ padding: "16px 24px", fontWeight: 600 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{article.title}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>/{article.slug}</span>
                      </div>
                    </td>
                    
                    {/* Category */}
                    <td style={{ padding: "16px 24px" }}>
                      <span 
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "var(--text-secondary)",
                          background: "rgba(255,255,255,0.04)",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {article.category}
                      </span>
                    </td>

                    {/* Difficulty */}
                    <td style={{ padding: "16px 24px" }}>
                      {article.difficulty ? (
                        <span className={`badge badge-${article.difficulty}`} style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                          {article.difficulty}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "16px 24px" }}>
                      <span 
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: "12px",
                          background: article.published ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                          color: article.published ? "#34d399" : "#fbbf24",
                          border: article.published ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(245, 158, 11, 0.2)",
                        }}
                      >
                        {article.published ? "Published" : "Draft"}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Calendar size={14} style={{ color: "var(--text-muted)" }} />
                        <span>{new Date(article.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button 
                          className="btn-secondary" 
                          onClick={() => openEditModal(article)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          aria-label="Edit article"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button 
                          className="btn-secondary" 
                          onClick={() => openDeleteModal(article)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            borderColor: "rgba(239, 68, 68, 0.2)",
                            color: "#f87171",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
                          }}
                          aria-label="Delete article"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              No articles found. Click &quot;Create New&quot; to add your first article.
            </p>
          </div>
        )}
      </div>

      {/* Creation / Editing Modal Backdrop */}
      {isModalOpen && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(6, 7, 13, 0.82)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          {/* Modal Card */}
          <div 
            className="glass-card animate-fade-in-up" 
            style={{
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(0, 229, 255, 0.2)",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {editingArticleId ? "Edit Article Details" : "Create New Article Draft"}
              </h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setFormError(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: "4px",
                }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div 
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  fontSize: "0.825rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Title */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Advanced Prompt Techniques"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: "white",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                  required
                />
              </div>

              {/* Grid for Category and Difficulty */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Category Dropdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-medium)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "white",
                      fontSize: "0.875rem",
                      outline: "none",
                    }}
                  >
                    <option value="fundamentals" style={{ background: "#0d1120" }}>Fundamentals</option>
                    <option value="techniques" style={{ background: "#0d1120" }}>Techniques</option>
                    <option value="architecture" style={{ background: "#0d1120" }}>Architecture</option>
                  </select>
                </div>

                {/* Difficulty Dropdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Difficulty</label>
                  <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-medium)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "white",
                      fontSize: "0.875rem",
                      outline: "none",
                    }}
                  >
                    <option value="beginner" style={{ background: "#0d1120" }}>Beginner</option>
                    <option value="intermediate" style={{ background: "#0d1120" }}>Intermediate</option>
                    <option value="advanced" style={{ background: "#0d1120" }}>Advanced</option>
                  </select>
                </div>
              </div>

              {/* Excerpt */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Excerpt</label>
                <input 
                  type="text" 
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A short summary of the article..."
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: "white",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Tags */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Tags (Comma-separated)</label>
                <input 
                  type="text" 
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. prompt-engineering, basics, llm"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: "white",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Content Markdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Content (Markdown supported)</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# Enter your article header here..."
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    color: "white",
                    fontSize: "0.875rem",
                    outline: "none",
                    minHeight: "160px",
                    fontFamily: "monospace",
                    lineHeight: "1.5",
                  }}
                  required
                />
              </div>

              {/* Published Switch */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 0" }}>
                <input 
                  type="checkbox" 
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  style={{
                    width: "18px",
                    height: "18px",
                    accentColor: "#00e5ff",
                    cursor: "pointer",
                  }}
                />
                <label 
                  htmlFor="published" 
                  style={{ 
                    fontSize: "0.85rem", 
                    fontWeight: 600, 
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    userSelect: "none"
                  }}
                >
                  Publish immediately (make visible on user feed)
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormError(null);
                  }}
                  style={{ padding: "10px 20px", fontSize: "0.85rem" }}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ 
                    padding: "10px 20px", 
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  disabled={formSubmitting}
                >
                  <Save size={16} />
                  {formSubmitting ? "Saving..." : editingArticleId ? "Save Changes" : "Save Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Backdrop */}
      {isDeleteOpen && deletingArticle && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(6, 7, 13, 0.82)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          {/* Modal Card */}
          <div 
            className="glass-card animate-fade-in-up" 
            style={{
              maxWidth: "480px",
              width: "100%",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f87171" }}>
                Delete Article
              </h2>
              <button 
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeletingArticle(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: "4px",
                }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Message */}
            {deleteError && (
              <div 
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  fontSize: "0.825rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertCircle size={16} />
                <span>{deleteError}</span>
              </div>
            )}

            <div>
              <p style={{ color: "var(--text-primary)", fontSize: "0.9rem", lineHeight: "1.5" }}>
                Are you sure you want to delete article <strong>{deletingArticle.title}</strong>?
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "12px", lineHeight: "1.5" }}>
                This action is permanent and cannot be undone. All user reading progress statistics associated with this article will be reset.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeletingArticle(null);
                }}
                style={{ padding: "10px 20px", fontSize: "0.85rem" }}
                disabled={deleteSubmitting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={handleDeleteSubmit}
                style={{ 
                  padding: "10px 20px", 
                  fontSize: "0.85rem",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  boxShadow: "0 10px 30px rgba(239, 68, 68, 0.25)",
                }}
                disabled={deleteSubmitting}
              >
                {deleteSubmitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
