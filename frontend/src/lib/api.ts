/**
 * API client utility for communicating with the FastAPI backend.
 *
 * Automatically attaches the Supabase JWT token to authenticated requests.
 * In development, this points to localhost:8000.
 * In production, set NEXT_PUBLIC_API_URL to your deployed backend URL.
 */

import { createClient } from "@/lib/supabase";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface FetchOptions {
  method?: string;
  body?: Record<string, unknown>;
  token?: string;
  /** If true, automatically attach the Supabase session token */
  authenticated?: boolean;
}

/**
 * Get the current Supabase session token (if logged in).
 */
async function getSessionToken(): Promise<string | null> {
  try {
    const supabase = createClient();
    if (!supabase) return null;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * Custom API error class with status code for downstream handling.
 */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Pause execution for the given number of milliseconds.
 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Core fetch wrapper with:
 * - Automatic retry (2 retries with exponential backoff) for transient errors
 * - 15-second request timeout
 * - Structured ApiError with HTTP status codes
 * - Auth token attachment
 */
async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const { method = "GET", body, authenticated = false } = options;
  let { token } = options;

  // Auto-attach token for authenticated requests
  if (!token && authenticated) {
    token = (await getSessionToken()) ?? undefined;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const MAX_RETRIES = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ detail: "Request failed" }));
        const errorMsg = errorBody.detail || `HTTP ${res.status}: Something went wrong`;

        // Don't retry 4xx errors (client errors) — they won't succeed on retry
        if (res.status >= 400 && res.status < 500) {
          throw new ApiError(errorMsg, res.status);
        }

        // 5xx errors are retryable
        throw new ApiError(errorMsg, res.status);
      }

      return res.json();
    } catch (error) {
      lastError = error as Error;

      // Don't retry client errors (4xx) or AbortError from timeout
      const isClientError = error instanceof ApiError && error.status >= 400 && error.status < 500;
      const isAbort = error instanceof DOMException && error.name === "AbortError";

      if (isClientError) {
        throw error;
      }

      // If we have retries left, wait with exponential backoff
      if (attempt < MAX_RETRIES) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 4000);
        console.warn(
          `[API] Request to ${endpoint} failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${backoffMs}ms...`,
          isAbort ? "Timeout" : (error as Error).message
        );
        await delay(backoffMs);
      }
    }
  }

  // All retries exhausted
  throw lastError || new ApiError("Request failed after retries", 0);
}

// =====================
// Articles
// =====================

export async function getArticles(params?: {
  category?: string;
  difficulty?: string;
}) {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.difficulty) query.set("difficulty", params.difficulty);
  const queryString = query.toString();
  return fetchAPI(`/articles${queryString ? `?${queryString}` : ""}`);
}

export async function getArticle(id: string) {
  return fetchAPI(`/articles/${id}`);
}

export async function getArticleBySlug(slug: string) {
  return fetchAPI(`/articles/slug/${slug}`);
}

export async function getSystemDesignArticles() {
  return fetchAPI("/articles/system-design");
}

// =====================
// Challenges
// =====================

export async function getChallenges(params?: {
  difficulty?: string;
  category?: string;
}) {
  const query = new URLSearchParams();
  if (params?.difficulty) query.set("difficulty", params.difficulty);
  if (params?.category) query.set("category", params.category);
  const queryString = query.toString();
  return fetchAPI(`/challenges${queryString ? `?${queryString}` : ""}`);
}

export async function getChallenge(id: string) {
  return fetchAPI(`/challenges/${id}`);
}

// =====================
// Roadmaps
// =====================

export async function getRoadmaps(params?: { level?: string }) {
  const query = new URLSearchParams();
  if (params?.level) query.set("level", params.level);
  const queryString = query.toString();
  return fetchAPI(`/roadmaps${queryString ? `?${queryString}` : ""}`);
}

export async function getRoadmap(id: string) {
  return fetchAPI(`/roadmaps/${id}`);
}

// =====================
// Auth (uses Supabase JWT)
// =====================

/**
 * Get the current user's profile from the backend.
 * Automatically uses the Supabase session token.
 */
export async function getMe(token?: string) {
  return fetchAPI("/auth/me", { token, authenticated: true });
}

/**
 * Update the current user's profile.
 */
export async function updateProfile(
  data: {
    username?: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string;
  },
  token?: string
) {
  return fetchAPI("/auth/profile", {
    method: "PUT",
    body: data,
    token,
    authenticated: true,
  });
}

/**
 * Check authentication status against the backend.
 */
export async function checkAuthStatus(token?: string) {
  return fetchAPI("/auth/status", { token, authenticated: true });
}

// =====================
// User Progress (protected)
// =====================

/**
 * Get the current user's complete learning progress.
 */
export async function getUserProgress() {
  return fetchAPI("/user-progress", { authenticated: true });
}

/**
 * Get the current user's aggregated stats.
 */
export async function getUserStats() {
  return fetchAPI("/user-progress/stats", { authenticated: true });
}

/**
 * Mark an article as completed.
 */
export async function markArticleCompleted(articleId: string) {
  return fetchAPI("/user-progress/article", {
    method: "POST",
    body: { article_id: articleId },
    authenticated: true,
  });
}

/**
 * Mark a challenge as completed.
 */
export async function markChallengeCompleted(
  challengeId: string,
  score?: number
) {
  return fetchAPI("/user-progress/challenge", {
    method: "POST",
    body: { challenge_id: challengeId, score },
    authenticated: true,
  });
}

// =====================
// Search
// =====================

/**
 * Search across articles, challenges, and roadmaps.
 */
export async function searchContent(
  query: string,
  type?: "articles" | "challenges" | "roadmaps"
) {
  const params = new URLSearchParams({ q: query });
  if (type) params.set("type", type);
  return fetchAPI(`/search?${params.toString()}`);
}

// =====================
// Playground
// =====================

/**
 * Run a prompt against a model (simulated or real).
 */
export async function runPrompt(data: {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
}) {
  return fetchAPI("/playground/run", {
    method: "POST",
    body: data,
  });
}

/**
 * Get the list of available models for the playground.
 */
export async function getPlaygroundModels() {
  return fetchAPI("/playground/models");
}

// =====================
// Marketplace
// =====================

export interface MarketplacePrompt {
  id: string;
  title: string;
  excerpt: string;
  description: string;
  category: string;
  model: string;
  author: string;
  promptText: string;
  exampleOutput: string;
  usageCount: number;
  isFree: boolean;
  tags: string[];
  createdAt: string;
}

/**
 * Seed data for the marketplace when backend API is unavailable.
 */
const MARKETPLACE_SEED_DATA: MarketplacePrompt[] = [
  {
    id: "1",
    title: "Professional Email Writer",
    excerpt: "Generate polished, context-aware professional emails for any business scenario.",
    description: "This prompt helps you craft professional emails that are clear, concise, and appropriately toned. Simply provide the context (recipient, purpose, key points) and get a ready-to-send email. Works with any LLM.",
    category: "business",
    model: "ChatGPT",
    author: "PromptDiary Team",
    promptText: "You are a professional email writer. I need you to write an email with the following details:\n\n**Recipient:** {{recipient}}\n**Purpose:** {{purpose}}\n**Key Points to Cover:**\n{{key_points}}\n**Tone:** {{tone: formal/friendly/urgent}}\n\nWrite a clear, professional email with proper greeting, body paragraphs, and closing. Keep it concise but thorough.",
    exampleOutput: "Subject: Q3 Strategy Meeting - Agenda & Preparation\n\nDear Sarah,\n\nI hope this email finds you well. I'm writing to share the agenda for our upcoming Q3 strategy meeting scheduled for next Thursday.\n\nKey Discussion Points:\n1. Revenue performance vs. targets\n2. Product roadmap updates\n3. Team expansion plans\n\nPlease review the attached deck beforehand. Looking forward to a productive discussion.\n\nBest regards,\nJohn",
    usageCount: 342,
    isFree: true,
    tags: ["email", "business", "writing", "professional"],
    createdAt: "2026-05-15",
  },
  {
    id: "2",
    title: "Code Review Assistant",
    excerpt: "Get thorough code reviews with actionable feedback on bugs, performance, and best practices.",
    description: "Submit your code and get a detailed review covering: potential bugs, performance issues, security concerns, readability improvements, and best practice suggestions. Supports multiple programming languages.",
    category: "code",
    model: "GPT-4",
    author: "PromptDiary Team",
    promptText: "You are an expert code reviewer. Please review the following code thoroughly:\n\n```{{language}}\n{{code}}\n```\n\nProvide your review in this format:\n\n## 🐛 Bugs & Issues\n- List any bugs or logical errors\n\n## ⚡ Performance\n- Suggest performance improvements\n\n## 🔒 Security\n- Flag any security concerns\n\n## 📝 Readability\n- Suggest readability improvements\n\n## ✅ Best Practices\n- Recommend best practice changes\n\nRate the overall code quality from 1-10.",
    exampleOutput: "## 🐛 Bugs & Issues\n- Line 12: Potential null reference when `user.profile` is undefined\n- Line 28: Missing error handling for async database call\n\n## ⚡ Performance\n- Consider memoizing the `filterResults()` function (called in render loop)\n- The N+1 query on line 35 should use batch fetching\n\n## 🔒 Security\n- Line 8: User input not sanitized before SQL query — use parameterized queries\n\n## 📝 Readability\n- Extract the complex condition on line 22 into a named variable\n\n## ✅ Best Practices\n- Add TypeScript types for the return value\n\n**Overall: 6/10** — Functional but needs security and error handling fixes.",
    usageCount: 521,
    isFree: true,
    tags: ["code", "review", "debugging", "best-practices"],
    createdAt: "2026-05-10",
  },
  {
    id: "3",
    title: "SEO Blog Post Generator",
    excerpt: "Create SEO-optimized blog posts with proper heading structure, keywords, and meta descriptions.",
    description: "Generate complete, SEO-friendly blog posts. Provide the topic, target keywords, and desired length. The prompt produces structured content with H1/H2/H3 headings, keyword placement, meta description, and internal linking suggestions.",
    category: "marketing",
    model: "ChatGPT",
    author: "PromptDiary Team",
    promptText: "You are an expert SEO content writer. Write a comprehensive blog post on:\n\n**Topic:** {{topic}}\n**Target Keywords:** {{keywords}}\n**Word Count:** {{word_count}}\n**Target Audience:** {{audience}}\n\nInclude:\n1. SEO-optimized title (60 chars max)\n2. Meta description (155 chars max)\n3. Proper H1, H2, H3 heading structure\n4. Natural keyword placement (2-3% density)\n5. Engaging introduction with hook\n6. Actionable tips/insights\n7. Strong conclusion with CTA\n8. 3 suggested internal link anchors",
    exampleOutput: "**Title:** 10 Proven Prompt Engineering Techniques for Better AI Results\n\n**Meta:** Learn 10 expert prompt engineering techniques that improve AI output quality. Master zero-shot, few-shot, and chain-of-thought prompting today.\n\n# 10 Proven Prompt Engineering Techniques for Better AI Results\n\nAI is only as good as the prompts you give it...",
    usageCount: 289,
    isFree: true,
    tags: ["seo", "content", "marketing", "blog"],
    createdAt: "2026-05-18",
  },
  {
    id: "4",
    title: "JSON Data Extractor",
    excerpt: "Extract structured JSON data from unstructured text — reviews, articles, documents.",
    description: "Feed in any unstructured text and this prompt will extract clean, structured JSON data. Perfect for data pipelines, content processing, and automated analysis. Customizable schema output.",
    category: "data",
    model: "GPT-4",
    author: "PromptDiary Team",
    promptText: "You are a data extraction specialist. Extract structured information from the following text and return it as valid JSON.\n\n**Text:**\n{{text}}\n\n**Required Fields:**\n{{fields}}\n\nRules:\n- Return ONLY valid JSON, no markdown\n- Use null for missing fields\n- Normalize dates to ISO 8601\n- Extract all entities matching the schema\n- If multiple items found, return an array",
    exampleOutput: '{\n  "product_name": "MacBook Pro 16\\"",\n  "brand": "Apple",\n  "price": 2499.00,\n  "currency": "USD",\n  "rating": 4.7,\n  "sentiment": "positive",\n  "key_features": ["M3 Pro chip", "18hr battery", "Liquid Retina XDR"],\n  "pros": ["Excellent performance", "Long battery life"],\n  "cons": ["Expensive", "Heavy"]\n}',
    usageCount: 478,
    isFree: true,
    tags: ["json", "data", "extraction", "structured-output"],
    createdAt: "2026-05-12",
  },
  {
    id: "5",
    title: "Chain-of-Thought Reasoning",
    excerpt: "Solve complex problems step-by-step with explicit reasoning chains for better accuracy.",
    description: "This meta-prompt forces any LLM to reason step-by-step through complex problems. Dramatically improves accuracy on math, logic, and analytical tasks by making the model show its work.",
    category: "education",
    model: "Universal",
    author: "PromptDiary Team",
    promptText: "Solve the following problem step by step. Show your complete reasoning process.\n\n**Problem:** {{problem}}\n\nInstructions:\n1. First, restate the problem in your own words\n2. Identify what information is given and what is asked\n3. Break down the solution into numbered steps\n4. Show your work for each step\n5. Verify your answer by checking it against the original problem\n6. State your final answer clearly\n\nThink carefully and be precise.",
    exampleOutput: "**Problem Restated:** We need to find how many ways to arrange...\n\n**Given:** 5 books, 3 shelves\n**Find:** Total arrangements\n\n**Step 1:** First, let's consider the distribution...\n**Step 2:** For each distribution, calculate permutations...\n**Step 3:** Sum all valid arrangements...\n\n**Verification:** Checking with smaller case (2 books, 2 shelves)...\n\n**Final Answer:** 150 unique arrangements",
    usageCount: 634,
    isFree: true,
    tags: ["reasoning", "chain-of-thought", "problem-solving", "math"],
    createdAt: "2026-05-08",
  },
  {
    id: "6",
    title: "Social Media Content Calendar",
    excerpt: "Generate a week's worth of social media posts across platforms with hashtags and timing.",
    description: "Create a comprehensive social media content calendar with platform-specific posts for Twitter/X, LinkedIn, and Instagram. Includes post text, hashtags, optimal posting times, and content themes.",
    category: "marketing",
    model: "ChatGPT",
    author: "PromptDiary Team",
    promptText: "Create a 7-day social media content calendar for:\n\n**Brand/Topic:** {{brand}}\n**Platforms:** Twitter/X, LinkedIn, Instagram\n**Tone:** {{tone}}\n**Goal:** {{goal}}\n\nFor each day, provide:\n- Platform-specific post text\n- Relevant hashtags (5-8 per post)\n- Suggested posting time (EST)\n- Content type (text/image/carousel/video)\n- Engagement hook\n\nVary content types and themes throughout the week.",
    exampleOutput: "## 📅 Monday — Educational Content\n\n**Twitter/X (9:00 AM EST):**\n🧵 Thread: 5 prompt engineering mistakes that are costing you hours...\n\n1/ Most people write prompts like Google searches. Here's why that fails with LLMs:\n#PromptEngineering #AI #LLM #TechTips\n\n**LinkedIn (11:00 AM EST):**\nThe ROI of prompt engineering is staggering...",
    usageCount: 198,
    isFree: true,
    tags: ["social-media", "content", "calendar", "marketing"],
    createdAt: "2026-05-20",
  },
  {
    id: "7",
    title: "API Documentation Generator",
    excerpt: "Auto-generate clean API documentation from endpoint definitions with examples.",
    description: "Provide your API endpoint details and get professional documentation with request/response examples, error codes, authentication notes, and usage guidelines. OpenAPI compatible.",
    category: "code",
    model: "GPT-4",
    author: "PromptDiary Team",
    promptText: "You are a technical writer specializing in API documentation. Generate comprehensive documentation for this API endpoint:\n\n**Endpoint:** {{method}} {{path}}\n**Description:** {{description}}\n**Auth Required:** {{auth}}\n**Request Body/Params:** {{params}}\n**Response Format:** {{response}}\n\nGenerate documentation including:\n1. Endpoint summary\n2. Authentication requirements\n3. Request parameters table\n4. Request body schema (if applicable)\n5. Response schema\n6. Example request (curl)\n7. Example response (JSON)\n8. Error codes table\n9. Rate limiting notes",
    exampleOutput: "## POST /api/v1/playground/run\n\nExecute a prompt against an AI model.\n\n### Authentication\nOptional — Anonymous users can access with rate limits.\n\n### Request Body\n| Field | Type | Required | Description |\n|-------|------|----------|-------------|\n| prompt | string | ✅ | The prompt text (1-10000 chars) |\n| model | string | ❌ | Model ID (default: gpt-4) |",
    usageCount: 267,
    isFree: true,
    tags: ["api", "documentation", "technical-writing", "code"],
    createdAt: "2026-05-14",
  },
  {
    id: "8",
    title: "Creative Story Builder",
    excerpt: "Generate immersive short stories with customizable genre, characters, and plot elements.",
    description: "Build captivating short stories by specifying genre, characters, setting, and plot elements. The prompt creates well-structured narratives with proper pacing, dialogue, and vivid descriptions.",
    category: "creative",
    model: "ChatGPT",
    author: "PromptDiary Team",
    promptText: "Write a short story with the following elements:\n\n**Genre:** {{genre}}\n**Setting:** {{setting}}\n**Main Character:** {{character}}\n**Conflict:** {{conflict}}\n**Tone:** {{tone}}\n**Length:** {{length: short/medium/long}}\n\nStory requirements:\n- Engaging opening hook (first sentence must grab attention)\n- Show, don't tell — use vivid sensory details\n- Natural dialogue with distinct character voices\n- Clear three-act structure (setup, confrontation, resolution)\n- Satisfying ending (can be open-ended if appropriate)\n- Include at least one unexpected twist",
    exampleOutput: "The coffee was cold by the time Maya noticed it.\n\nShe'd been staring at the same line of code for forty-seven minutes, the cursor blinking like a heartbeat she couldn't quite sync with. Outside her window, Neo-Tokyo hummed with its usual 3 AM energy...",
    usageCount: 156,
    isFree: true,
    tags: ["creative-writing", "story", "fiction", "narrative"],
    createdAt: "2026-05-22",
  },
  {
    id: "9",
    title: "System Prompt Engineer",
    excerpt: "Design effective system prompts that define AI behavior, constraints, and response patterns.",
    description: "Meta-prompt for creating system prompts. Define the AI's role, capabilities, constraints, and response format. Perfect for building custom AI assistants and chatbots.",
    category: "text-generation",
    model: "Universal",
    author: "PromptDiary Team",
    promptText: "Help me design a system prompt for an AI assistant with these requirements:\n\n**Role:** {{role}}\n**Purpose:** {{purpose}}\n**Target Users:** {{users}}\n**Key Capabilities:** {{capabilities}}\n**Constraints/Rules:** {{constraints}}\n**Response Format:** {{format}}\n**Tone:** {{tone}}\n\nCreate a comprehensive system prompt that:\n1. Clearly defines the AI's identity and role\n2. Lists specific capabilities and limitations\n3. Includes response formatting guidelines\n4. Adds safety guardrails\n5. Provides example interaction patterns\n6. Is under 500 words for token efficiency",
    exampleOutput: "## System Prompt\n\nYou are CodeMentor, a senior software engineer AI assistant specializing in Python and JavaScript.\n\n### Role\nYou help developers debug code, review implementations, and learn best practices.\n\n### Rules\n1. Always explain WHY, not just what to change\n2. Include code examples in your responses\n3. Flag potential security issues proactively\n4. If unsure, say so — never fabricate solutions...",
    usageCount: 445,
    isFree: true,
    tags: ["system-prompt", "meta-prompt", "chatbot", "ai-design"],
    createdAt: "2026-05-06",
  },
  {
    id: "10",
    title: "Data Analysis Report Builder",
    excerpt: "Transform raw data insights into structured analytical reports with visualizations.",
    description: "Provide your data findings and this prompt generates a professional analysis report with executive summary, methodology, key findings, charts suggestions, and recommendations.",
    category: "data",
    model: "GPT-4",
    author: "PromptDiary Team",
    promptText: "You are a data analyst. Create a comprehensive analysis report from these findings:\n\n**Dataset:** {{dataset_description}}\n**Key Metrics:** {{metrics}}\n**Time Period:** {{period}}\n**Audience:** {{audience: executive/technical/general}}\n\nReport Structure:\n1. **Executive Summary** (3-4 sentences)\n2. **Key Findings** (top 5, with numbers)\n3. **Trend Analysis** (describe patterns)\n4. **Anomalies** (flag unusual data points)\n5. **Visualization Suggestions** (recommend chart types)\n6. **Recommendations** (actionable next steps)\n7. **Appendix** (methodology notes)",
    exampleOutput: "# Q2 2026 User Engagement Report\n\n## Executive Summary\nMonthly active users grew 23% QoQ to 45,000. Engagement time increased by 12 minutes per session. Mobile traffic now accounts for 67% of all visits, up from 54%.\n\n## Key Findings\n1. 📈 DAU/MAU ratio: 0.42 (healthy engagement)\n2. 🔄 Retention D7: 38% (+5pp vs Q1)...",
    usageCount: 189,
    isFree: true,
    tags: ["data-analysis", "report", "analytics", "business-intelligence"],
    createdAt: "2026-05-16",
  },
  {
    id: "11",
    title: "Learning Path Designer",
    excerpt: "Create structured learning roadmaps for any technical skill with resources and milestones.",
    description: "Design a comprehensive learning path for any technical topic. Includes weekly breakdown, recommended resources (free), practice exercises, milestone checkpoints, and estimated time commitments.",
    category: "education",
    model: "Universal",
    author: "PromptDiary Team",
    promptText: "Design a structured learning path for:\n\n**Skill:** {{skill}}\n**Current Level:** {{level: beginner/intermediate/advanced}}\n**Time Available:** {{hours_per_week}} hours/week\n**Duration:** {{weeks}} weeks\n**Goal:** {{goal}}\n\nFor each week provide:\n1. Topic focus and learning objectives\n2. Free resources (articles, videos, docs)\n3. Hands-on exercises (1-2 per week)\n4. Mini-project idea\n5. Knowledge check questions (3-5)\n6. Estimated time breakdown\n\nInclude milestone checkpoints every 2 weeks.",
    exampleOutput: "# 🗺️ Prompt Engineering — 8-Week Learning Path\n**Level:** Beginner → Intermediate\n**Commitment:** 10 hrs/week\n\n## Week 1: Foundations\n**Objective:** Understand how LLMs process text\n\n📚 **Resources:**\n- Read: \"What are Large Language Models?\" (Google AI)\n- Watch: 3Blue1Brown — Neural Networks (30 min)\n\n💻 **Exercise:**\n- Write 10 different prompts for the same task, compare outputs...",
    usageCount: 312,
    isFree: true,
    tags: ["learning", "education", "roadmap", "skill-development"],
    createdAt: "2026-05-09",
  },
  {
    id: "12",
    title: "Prompt Optimizer & Debugger",
    excerpt: "Improve existing prompts for better results — fix vagueness, add constraints, optimize tokens.",
    description: "Paste your underperforming prompt and get an optimized version. The optimizer identifies issues (vagueness, missing context, poor structure) and rewrites the prompt for better LLM output.",
    category: "text-generation",
    model: "Universal",
    author: "PromptDiary Team",
    promptText: "You are a prompt engineering expert. Analyze and optimize this prompt:\n\n**Original Prompt:**\n{{prompt}}\n\n**Issue:** {{issue: vague output/too long/wrong format/inconsistent}}\n\nProvide:\n1. **Diagnosis**: What's wrong with the original prompt (be specific)\n2. **Optimized Prompt**: Rewritten version with improvements\n3. **Changes Made**: Bullet list of what you changed and why\n4. **Tips**: 3 general prompt writing tips relevant to this case\n5. **A/B Test Suggestion**: How to compare original vs optimized",
    exampleOutput: "## Diagnosis\nThe original prompt is too vague — it lacks:\n- Output format specification\n- Length constraints\n- Role/persona definition\n- Success criteria\n\n## Optimized Prompt\n```\nYou are a senior technical writer. Summarize the following article in exactly 3 bullet points...\n```\n\n## Changes Made\n- Added role (\"senior technical writer\") for expertise framing\n- Specified exact output format (3 bullet points)\n- Added length constraint...",
    usageCount: 567,
    isFree: true,
    tags: ["optimization", "debugging", "meta-prompt", "improvement"],
    createdAt: "2026-05-05",
  },
];

/**
 * Get all marketplace prompts. Falls back to seed data if backend is unavailable.
 */
export async function getMarketplacePrompts(params?: {
  category?: string;
  model?: string;
  search?: string;
}): Promise<{ prompts: MarketplacePrompt[]; total: number }> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.model) query.set("model", params.model);
    if (params?.search) query.set("q", params.search);
    const queryString = query.toString();
    return await fetchAPI(`/marketplace${queryString ? `?${queryString}` : ""}`);
  } catch {
    // Fallback to seed data with client-side filtering
    let filtered = [...MARKETPLACE_SEED_DATA];
    if (params?.category) {
      filtered = filtered.filter((p) => p.category === params.category);
    }
    if (params?.model) {
      filtered = filtered.filter((p) => p.model === params.model);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }
    return { prompts: filtered, total: filtered.length };
  }
}

/**
 * Get a single marketplace prompt by ID. Falls back to seed data.
 */
export async function getMarketplacePromptById(
  id: string
): Promise<MarketplacePrompt | null> {
  try {
    return await fetchAPI(`/marketplace/${id}`);
  } catch {
    return MARKETPLACE_SEED_DATA.find((p) => p.id === id) || null;
  }
}
