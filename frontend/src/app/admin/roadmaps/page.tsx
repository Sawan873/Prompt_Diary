"use client";

import { useEffect, useState } from "react";
import { 
  getRoadmaps, 
  adminCreateRoadmap, 
  adminUpdateRoadmap, 
  adminDeleteRoadmap 
} from "@/lib/api";
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Calendar, 
  X, 
  Save, 
  BookOpen, 
  Clock, 
  ChevronUp, 
  ChevronDown 
} from "lucide-react";
import { useToast } from "@/components/Toast";

interface TopicItem {
  order: number;
  title: string;
  description?: string;
  article_slug?: string;
  completed?: boolean;
}

interface Roadmap {
  id: string;
  title: string;
  level?: "beginner" | "intermediate" | "advanced";
  description?: string;
  topics: TopicItem[];
  estimated_hours?: number;
  created_at: string;
}

export default function AdminRoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Form states for creating/editing a roadmap
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoadmapId, setEditingRoadmapId] = useState<string | null>(null);
  
  // Roadmap form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [estimatedHours, setEstimatedHours] = useState(5);
  const [topics, setTopics] = useState<TopicItem[]>([]);

  // Topic editor form fields (for adding/modifying topics in the list)
  const [topicTitle, setTopicTitle] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [topicArticleSlug, setTopicArticleSlug] = useState("");
  const [editingTopicIndex, setEditingTopicIndex] = useState<number | null>(null);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation modal states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingRoadmap, setDeletingRoadmap] = useState<Roadmap | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function loadRoadmaps() {
    try {
      setLoading(true);
      const response = await getRoadmaps();
      if (response && Array.isArray(response.roadmaps)) {
        setRoadmaps(response.roadmaps);
      } else {
        setError("Failed to load roadmaps.");
      }
    } catch (err) {
      console.error("Failed to load roadmaps for admin:", err);
      setError("An error occurred while fetching roadmaps.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const openCreateModal = () => {
    setEditingRoadmapId(null);
    setTitle("");
    setDescription("");
    setLevel("beginner");
    setEstimatedHours(5);
    setTopics([]);
    setTopicTitle("");
    setTopicDescription("");
    setTopicArticleSlug("");
    setEditingTopicIndex(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (roadmap: Roadmap) => {
    setEditingRoadmapId(roadmap.id);
    setTitle(roadmap.title);
    setDescription(roadmap.description || "");
    setLevel(roadmap.level || "beginner");
    setEstimatedHours(roadmap.estimated_hours || 5);
    // Deep copy topics to avoid direct state mutation issues
    setTopics(roadmap.topics ? roadmap.topics.map(t => ({ ...t })) : []);
    
    // Reset topic editor fields
    setTopicTitle("");
    setTopicDescription("");
    setTopicArticleSlug("");
    setEditingTopicIndex(null);
    
    setFormError(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (roadmap: Roadmap) => {
    setDeletingRoadmap(roadmap);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  // --- Topic List Editor Functions ---
  
  const handleAddOrSaveTopic = () => {
    const trimmedTitle = topicTitle.trim();
    if (!trimmedTitle) {
      alert("Topic Title is required to add/save.");
      return;
    }

    if (editingTopicIndex !== null) {
      // Edit existing topic in array
      const updated = [...topics];
      updated[editingTopicIndex] = {
        order: editingTopicIndex + 1,
        title: trimmedTitle,
        description: topicDescription.trim() || undefined,
        article_slug: topicArticleSlug.trim() || undefined,
      };
      setTopics(updated);
      setEditingTopicIndex(null);
    } else {
      // Add new topic to array
      const newTopic: TopicItem = {
        order: topics.length + 1,
        title: trimmedTitle,
        description: topicDescription.trim() || undefined,
        article_slug: topicArticleSlug.trim() || undefined,
      };
      setTopics([...topics, newTopic]);
    }

    // Reset topic editor fields
    setTopicTitle("");
    setTopicDescription("");
    setTopicArticleSlug("");
  };

  const startEditTopic = (index: number) => {
    const topic = topics[index];
    setTopicTitle(topic.title);
    setTopicDescription(topic.description || "");
    setTopicArticleSlug(topic.article_slug || "");
    setEditingTopicIndex(index);
  };

  const removeTopic = (index: number) => {
    const filtered = topics.filter((_, i) => i !== index);
    // Reorder remaining topics
    const reordered = filtered.map((t, idx) => ({
      ...t,
      order: idx + 1,
    }));
    setTopics(reordered);

    // Cancel topic editing if we just deleted the one being edited
    if (editingTopicIndex === index) {
      setEditingTopicIndex(null);
      setTopicTitle("");
      setTopicDescription("");
      setTopicArticleSlug("");
    } else if (editingTopicIndex !== null && editingTopicIndex > index) {
      setEditingTopicIndex(editingTopicIndex - 1);
    }
  };

  const moveTopicUp = (index: number) => {
    if (index === 0) return;
    const list = [...topics];
    const target = list[index];
    list[index] = list[index - 1];
    list[index - 1] = target;

    // Reassign order properties correctly
    const reordered = list.map((t, idx) => ({
      ...t,
      order: idx + 1,
    }));
    setTopics(reordered);

    // Adjust active editing index if necessary
    if (editingTopicIndex === index) {
      setEditingTopicIndex(index - 1);
    } else if (editingTopicIndex === index - 1) {
      setEditingTopicIndex(index);
    }
  };

  const moveTopicDown = (index: number) => {
    if (index === topics.length - 1) return;
    const list = [...topics];
    const target = list[index];
    list[index] = list[index + 1];
    list[index + 1] = target;

    // Reassign order properties correctly
    const reordered = list.map((t, idx) => ({
      ...t,
      order: idx + 1,
    }));
    setTopics(reordered);

    // Adjust active editing index if necessary
    if (editingTopicIndex === index) {
      setEditingTopicIndex(index + 1);
    } else if (editingTopicIndex === index + 1) {
      setEditingTopicIndex(index);
    }
  };

  const cancelTopicEdit = () => {
    setEditingTopicIndex(null);
    setTopicTitle("");
    setTopicDescription("");
    setTopicArticleSlug("");
  };

  // --- API Submit Handlers ---

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !level) {
      setFormError("Title and Level are required.");
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    // Prepare clean topics list for backend submission
    const cleanTopics = topics.map(t => ({
      order: t.order,
      title: t.title,
      description: t.description || "",
      article_slug: t.article_slug || undefined,
    }));

    try {
      if (editingRoadmapId) {
        // Edit Mode
        const result = await adminUpdateRoadmap(editingRoadmapId, {
          title,
          description: description || undefined,
          level,
          estimated_hours: Number(estimatedHours) || undefined,
          topics: cleanTopics,
        });

        if (result) {
          setIsModalOpen(false);
          showToast("Roadmap updated successfully!", "success");
          await loadRoadmaps();
        } else {
          setFormError("Failed to update roadmap.");
        }
      } else {
        // Create Mode
        const result = await adminCreateRoadmap({
          title,
          description: description || undefined,
          level,
          estimated_hours: Number(estimatedHours) || undefined,
          topics: cleanTopics,
        });

        if (result) {
          setIsModalOpen(false);
          showToast("Roadmap created successfully!", "success");
          await loadRoadmaps();
        } else {
          setFormError("Failed to create roadmap.");
        }
      }
    } catch (err: any) {
      console.error("Error saving roadmap:", err);
      setFormError(err.message || "An error occurred while saving the roadmap.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingRoadmap) return;
    setDeleteSubmitting(true);
    setDeleteError(null);

    try {
      await adminDeleteRoadmap(deletingRoadmap.id);
      setIsDeleteOpen(false);
      setDeletingRoadmap(null);
      showToast("Roadmap deleted successfully!", "success");
      await loadRoadmaps();
    } catch (err: any) {
      console.error("Error deleting roadmap:", err);
      setDeleteError(err.message || "An error occurred while deleting the roadmap.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (loading && roadmaps.length === 0) {
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
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#f87171" }}>Error Loading Roadmaps</h3>
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
            Manage Roadmaps
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Create, update, or remove learning roadmaps for users.
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

      {/* Roadmaps Table Card */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        {roadmaps.length > 0 ? (
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
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Level</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Estimated Hours</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Topics Count</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)" }}>Created Date</th>
                  <th style={{ padding: "16px 24px", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roadmaps.map((roadmap) => (
                  <tr 
                    key={roadmap.id} 
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
                        <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{roadmap.title}</span>
                        {roadmap.description && (
                          <span 
                            style={{ 
                              fontSize: "0.75rem", 
                              color: "var(--text-muted)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }}
                          >
                            {roadmap.description}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Level Badge */}
                    <td style={{ padding: "16px 24px" }}>
                      {roadmap.level ? (
                        <span className={`badge badge-${roadmap.level}`} style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                          {roadmap.level}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>

                    {/* Estimated Hours */}
                    <td style={{ padding: "16px 24px", fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)" }}>
                        <Clock size={14} style={{ color: "var(--text-muted)" }} />
                        <span>{roadmap.estimated_hours ?? 0} hrs</span>
                      </div>
                    </td>

                    {/* Topics Count */}
                    <td style={{ padding: "16px 24px", fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)" }}>
                        <BookOpen size={14} style={{ color: "#00e5ff" }} />
                        <span>{roadmap.topics?.length ?? 0} topics</span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Calendar size={14} style={{ color: "var(--text-muted)" }} />
                        <span>
                          {roadmap.created_at ? new Date(roadmap.created_at).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button 
                          className="btn-secondary" 
                          onClick={() => openEditModal(roadmap)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          aria-label="Edit roadmap"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button 
                          className="btn-secondary" 
                          onClick={() => openDeleteModal(roadmap)}
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
                          aria-label="Delete roadmap"
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
              No roadmaps found. Click &quot;Create New&quot; to add your first learning roadmap.
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
              maxWidth: "720px",
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
                {editingRoadmapId ? "Edit Roadmap Details" : "Create New Roadmap"}
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
                  placeholder="e.g. Prompt Engineering Mastery Path"
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
                  placeholder="Summarize what users will learn in this roadmap path..."
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
                />
              </div>

              {/* Level & Estimated Hours */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Level Dropdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Level</label>
                  <select 
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
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

                {/* Estimated Hours */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Estimated Hours</label>
                  <input 
                    type="number" 
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    min={1}
                    max={500}
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

              {/* ==================================================== */}
              {/* TOPIC LIST EDITOR SECTION */}
              {/* ==================================================== */}
              <div style={{ 
                border: "1px solid var(--border-subtle)", 
                borderRadius: "12px", 
                padding: "20px", 
                background: "rgba(255,255,255,0.015)",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <BookOpen size={16} style={{ color: "#00e5ff" }} />
                  Topic Path Steps Editor
                </h3>

                {/* Topic Input Sub-Form */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                    {editingTopicIndex !== null ? `Edit Topic #${editingTopicIndex + 1}` : "Add New Topic Step"}
                  </span>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Topic Title</label>
                      <input 
                        type="text" 
                        value={topicTitle}
                        onChange={(e) => setTopicTitle(e.target.value)}
                        placeholder="e.g. Zero-shot Prompting"
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          color: "white",
                          fontSize: "0.8rem",
                          outline: "none",
                        }}
                      />
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Article Slug (Optional Link)</label>
                      <input 
                        type="text" 
                        value={topicArticleSlug}
                        onChange={(e) => setTopicArticleSlug(e.target.value)}
                        placeholder="e.g. zero-shot-prompting"
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          color: "white",
                          fontSize: "0.8rem",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Topic Description</label>
                    <input 
                      type="text" 
                      value={topicDescription}
                      onChange={(e) => setTopicDescription(e.target.value)}
                      placeholder="e.g. Learn to construct prompts without prior training examples..."
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        color: "white",
                        fontSize: "0.8rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
                    {editingTopicIndex !== null && (
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={cancelTopicEdit}
                        style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem" }}
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button 
                      type="button" 
                      className="btn-primary" 
                      onClick={handleAddOrSaveTopic}
                      style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "0.75rem" }}
                    >
                      {editingTopicIndex !== null ? "Apply Changes" : "Add Topic"}
                    </button>
                  </div>
                </div>

                {/* Topics Display List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto", paddingRight: "4px" }}>
                  {topics.length > 0 ? (
                    topics.map((topic, index) => (
                      <div 
                        key={index} 
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          background: editingTopicIndex === index ? "rgba(0, 229, 255, 0.05)" : "rgba(255,255,255,0.02)",
                          border: editingTopicIndex === index ? "1px solid rgba(0, 229, 255, 0.3)" : "1px solid var(--border-subtle)",
                          borderRadius: "8px",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
                          {/* Reordering Chevrons */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <button 
                              type="button"
                              onClick={() => moveTopicUp(index)}
                              disabled={index === 0}
                              style={{ 
                                background: "transparent", 
                                border: "none", 
                                color: index === 0 ? "rgba(255,255,255,0.1)" : "var(--text-secondary)", 
                                cursor: index === 0 ? "not-allowed" : "pointer",
                                padding: "2px"
                              }}
                              title="Move Up"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => moveTopicDown(index)}
                              disabled={index === topics.length - 1}
                              style={{ 
                                background: "transparent", 
                                border: "none", 
                                color: index === topics.length - 1 ? "rgba(255,255,255,0.1)" : "var(--text-secondary)", 
                                cursor: index === topics.length - 1 ? "not-allowed" : "pointer",
                                padding: "2px"
                              }}
                              title="Move Down"
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#00e5ff", background: "rgba(0, 229, 255, 0.1)", padding: "1px 6px", borderRadius: "4px" }}>
                                {index + 1}
                              </span>
                              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{topic.title}</span>
                              {topic.article_slug && (
                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                                  [/{topic.article_slug}]
                                </span>
                              )}
                            </div>
                            {topic.description && (
                              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {topic.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Inline List Actions */}
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                          <button 
                            type="button" 
                            className="btn-secondary" 
                            onClick={() => startEditTopic(index)}
                            style={{ padding: "4px 8px", fontSize: "0.7rem", borderRadius: "6px" }}
                            title="Edit Step Details"
                          >
                            <Edit size={12} />
                          </button>
                          <button 
                            type="button" 
                            className="btn-secondary" 
                            onClick={() => removeTopic(index)}
                            style={{ 
                              padding: "4px 8px", 
                              fontSize: "0.7rem", 
                              borderRadius: "6px",
                              borderColor: "rgba(239,68,68,0.2)",
                              color: "#f87171"
                            }}
                            title="Remove Step"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "16px", textAlign: "center", border: "1px dashed var(--border-subtle)", borderRadius: "8px" }}>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        No topic path steps added yet. Add at least one step above.
                      </p>
                    </div>
                  )}
                </div>
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
                  {formSubmitting ? "Saving..." : editingRoadmapId ? "Save Changes" : "Save Roadmap"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Backdrop */}
      {isDeleteOpen && deletingRoadmap && (
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
                Delete Roadmap
              </h2>
              <button 
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeletingRoadmap(null);
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
                Are you sure you want to delete roadmap <strong>{deletingRoadmap.title}</strong>?
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "12px", lineHeight: "1.5" }}>
                This action is permanent and cannot be undone. All user roadmap learning progress statistics associated with this roadmap will be reset.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeletingRoadmap(null);
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
