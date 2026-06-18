"use client";

import { useEffect, useState } from "react";
import { 
  getChallenges, 
  adminCreateChallenge, 
  adminUpdateChallenge, 
  adminDeleteChallenge 
} from "@/lib/api";
import { Plus, Edit, Trash2, AlertCircle, Calendar, Trophy, X, Save } from "lucide-react";
import { useToast } from "@/components/Toast";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category?: string;
  points: number;
  starter_prompt?: string;
  expected_output?: string;
  hints?: string[];
  created_at: string;
}

export default function AdminChallengesPage() {
  const { showToast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for creating/editing a challenge
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [category, setCategory] = useState("summarization");
  const [starterPrompt, setStarterPrompt] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [newHint, setNewHint] = useState("");
  const [points, setPoints] = useState(10);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation modal states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingChallenge, setDeletingChallenge] = useState<Challenge | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function loadChallenges() {
    try {
      setLoading(true);
      const response = await getChallenges();
      if (response?.challenges && Array.isArray(response?.challenges)) {
        setChallenges(response.challenges);
      } else {
        setError("Failed to load challenges.");
      }
    } catch (err) {
      console.error("Failed to load challenges for admin:", err);
      setError("An error occurred while fetching challenges.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadChallenges();
  }, []);

  const openCreateModal = () => {
    setEditingChallengeId(null);
    setTitle("");
    setDescription("");
    setDifficulty("easy");
    setCategory("summarization");
    setStarterPrompt("");
    setExpectedOutput("");
    setHints([]);
    setNewHint("");
    setPoints(10);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (challenge: Challenge) => {
    setEditingChallengeId(challenge.id);
    setTitle(challenge.title);
    setDescription(challenge.description || "");
    setDifficulty(challenge.difficulty);
    setCategory(challenge.category || "summarization");
    setStarterPrompt(challenge.starter_prompt || "");
    setExpectedOutput(challenge.expected_output || "");
    setHints(challenge.hints || []);
    setNewHint("");
    setPoints(challenge.points);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (challenge: Challenge) => {
    setDeletingChallenge(challenge);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const addHint = () => {
    const trimmed = newHint.trim();
    if (!trimmed) return;
    setHints([...hints, trimmed]);
    setNewHint("");
  };

  const removeHint = (index: number) => {
    setHints(hints.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !difficulty || !category) {
      setFormError("Title, description, difficulty, and category are required.");
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      if (editingChallengeId) {
        // Edit mode
        const result = await adminUpdateChallenge(editingChallengeId, {
          title,
          description,
          difficulty,
          category: category || undefined,
          starter_prompt: starterPrompt || undefined,
          expected_output: expectedOutput || undefined,
          hints: hints.length > 0 ? hints : undefined,
          points: Number(points) || 10,
        });

        if (result) {
          setIsModalOpen(false);
          showToast("Challenge updated successfully!", "success");
          await loadChallenges();
        } else {
          setFormError("Failed to update challenge.");
          showToast("Failed to update challenge.", "error");
        }
      } else {
        // Create mode
        const result = await adminCreateChallenge({
          title,
          description,
          difficulty,
          category: category || undefined,
          starter_prompt: starterPrompt || undefined,
          expected_output: expectedOutput || undefined,
          hints: hints.length > 0 ? hints : undefined,
          points: Number(points) || 10,
        });

        if (result) {
          setIsModalOpen(false);
          showToast("Challenge created successfully!", "success");
          await loadChallenges();
        } else {
          setFormError("Failed to create challenge.");
          showToast("Failed to create challenge.", "error");
        }
      }
    } catch (err: any) {
      console.error("Error saving challenge:", err);
      const errMsg = err.message || "An error occurred while saving the challenge.";
      setFormError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingChallenge) return;
    setDeleteSubmitting(true);
    setDeleteError(null);

    try {
      const success = await adminDeleteChallenge(deletingChallenge.id);
      if (success) {
        setIsDeleteOpen(false);
        setDeletingChallenge(null);
        showToast("Challenge deleted successfully!", "success");
        await loadChallenges();
      } else {
        setDeleteError("Failed to delete challenge.");
        showToast("Failed to delete challenge.", "error");
      }
    } catch (err: any) {
      console.error("Error deleting challenge:", err);
      const errMsg = err.message || "An error occurred while deleting the challenge.";
      setDeleteError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (loading && challenges.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ height: "28px", width: "180px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", marginBottom: "8px", animation: "pulse-glow 1.5s infinite" }} />
            <div style={{ height: "16px", width: "240px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", animation: "pulse-glow 1.5s infinite" }} />
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
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f87171" }}>Error Loading Challenges</h3>
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
            Manage Challenges
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Create, update, or remove prompt challenges for users.
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

      {/* Challenges Table Card */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        {challenges.length > 0 ? (
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
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Difficulty</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Category</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Points</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Created Date</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((challenge) => (
                  <tr 
                    key={challenge.id} 
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
                    {/* Title & Description preview */}
                    <td style={{ padding: "16px 24px", fontWeight: 600, maxWidth: "240px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{challenge.title}</span>
                        <span 
                          style={{ 
                            fontSize: "0.75rem", 
                            color: "var(--text-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {challenge.description}
                        </span>
                      </div>
                    </td>
                    
                    {/* Difficulty Badge */}
                    <td style={{ padding: "16px 24px" }}>
                      <span className={`badge badge-${challenge.difficulty}`} style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                        {challenge.difficulty}
                      </span>
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
                        {challenge.category || "General"}
                      </span>
                    </td>

                    {/* Points */}
                    <td style={{ padding: "16px 24px", fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)" }}>
                        <Trophy size={14} style={{ color: "#fbbf24" }} />
                        <span>{challenge.points} XP</span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Calendar size={14} style={{ color: "var(--text-muted)" }} />
                        <span>
                          {challenge.created_at ? new Date(challenge.created_at).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button 
                          className="btn-secondary" 
                          onClick={() => openEditModal(challenge)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          aria-label="Edit challenge"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button 
                          className="btn-secondary" 
                          onClick={() => openDeleteModal(challenge)}
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
                          aria-label="Delete challenge"
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
              No challenges found. Click &quot;Create New&quot; to add your first challenge.
            </p>
          </div>
        )}
      </div>

      {/* Creation/Editing Modal Backdrop */}
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
                {editingChallengeId ? "Edit Challenge Details" : "Create New Challenge"}
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
                  placeholder="e.g. JSON Data Extraction"
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

              {/* Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the challenge objectives to the user..."
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    color: "white",
                    fontSize: "0.875rem",
                    outline: "none",
                    minHeight: "80px",
                  }}
                  required
                />
              </div>

              {/* Grid for Difficulty, Category and Points */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                {/* Difficulty Dropdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Difficulty</label>
                  <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
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
                    <option value="easy" style={{ background: "#0d1120" }}>Easy</option>
                    <option value="medium" style={{ background: "#0d1120" }}>Medium</option>
                    <option value="hard" style={{ background: "#0d1120" }}>Hard</option>
                  </select>
                </div>

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
                    <option value="summarization" style={{ background: "#0d1120" }}>Summarization</option>
                    <option value="extraction" style={{ background: "#0d1120" }}>Extraction</option>
                    <option value="reasoning" style={{ background: "#0d1120" }}>Reasoning</option>
                    <option value="role-playing" style={{ background: "#0d1120" }}>Role-Playing</option>
                    <option value="chaining" style={{ background: "#0d1120" }}>Chaining</option>
                    <option value="transformation" style={{ background: "#0d1120" }}>Transformation</option>
                  </select>
                </div>

                {/* Points */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Points (XP)</label>
                  <input 
                    type="number" 
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    min={5}
                    max={100}
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
              </div>

              {/* Starter Prompt */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Starter Prompt</label>
                <textarea 
                  value={starterPrompt}
                  onChange={(e) => setStarterPrompt(e.target.value)}
                  placeholder="Paste starter guidelines or structure..."
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    color: "white",
                    fontSize: "0.875rem",
                    outline: "none",
                    minHeight: "80px",
                    fontFamily: "monospace",
                  }}
                />
              </div>

              {/* Expected Output */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Expected Output (Reference)</label>
                <textarea 
                  value={expectedOutput}
                  onChange={(e) => setExpectedOutput(e.target.value)}
                  placeholder="What should the final target prompt output resemble?..."
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    color: "white",
                    fontSize: "0.875rem",
                    outline: "none",
                    minHeight: "80px",
                    fontFamily: "monospace",
                  }}
                />
              </div>

              {/* Hints Add/Remove section */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Hints List</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input 
                    type="text" 
                    value={newHint}
                    onChange={(e) => setNewHint(e.target.value)}
                    placeholder="Enter hints helper tip..."
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-medium)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "white",
                      fontSize: "0.875rem",
                      outline: "none",
                      flex: 1,
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={addHint}
                    className="btn-secondary"
                    style={{ padding: "10px 16px", borderRadius: "10px", fontSize: "0.85rem" }}
                  >
                    Add
                  </button>
                </div>
                {hints.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                    {hints.map((hint, idx) => (
                      <span 
                        key={idx} 
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          fontSize: "0.75rem",
                        }}
                      >
                        <span>{hint}</span>
                        <button 
                          type="button" 
                          onClick={() => removeHint(idx)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#f87171",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            padding: "2px",
                          }}
                          aria-label="Remove hint"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                  {formSubmitting ? "Saving..." : editingChallengeId ? "Save Changes" : "Save Challenge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Backdrop */}
      {isDeleteOpen && deletingChallenge && (
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
                Delete Challenge
              </h2>
              <button 
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeletingChallenge(null);
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
                Are you sure you want to delete challenge <strong>{deletingChallenge.title}</strong>?
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "12px", lineHeight: "1.5" }}>
                This action is permanent and cannot be undone. All user challenge completion statistics associated with this challenge will be reset.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeletingChallenge(null);
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
                  background: "rgba(239, 68, 68, 0.2)",
                  borderColor: "rgba(239, 68, 68, 0.4)",
                  color: "#f87171",
                }}
                disabled={deleteSubmitting}
              >
                {deleteSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
