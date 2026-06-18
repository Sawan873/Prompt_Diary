-- ============================================================
-- Prompt Dairy — Marketplace Schema
-- Run this in Supabase SQL Editor to add marketplace tables
-- ============================================================

-- ============================================================
-- 1. MARKETPLACE PROMPTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.marketplace_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    model TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id),
    author_name TEXT DEFAULT 'Community',
    prompt_text TEXT NOT NULL,
    example_output TEXT,
    usage_count INT DEFAULT 0,
    is_free BOOLEAN DEFAULT TRUE,
    tags TEXT[],
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. MARKETPLACE FAVORITES TABLE (users can save prompts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.marketplace_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES public.marketplace_prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, prompt_id)
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON public.marketplace_prompts(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_model ON public.marketplace_prompts(model);
CREATE INDEX IF NOT EXISTS idx_marketplace_published ON public.marketplace_prompts(published);
CREATE INDEX IF NOT EXISTS idx_marketplace_usage ON public.marketplace_prompts(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_tags ON public.marketplace_prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_marketplace_favorites_user ON public.marketplace_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_favorites_prompt ON public.marketplace_favorites(prompt_id);

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS
ALTER TABLE public.marketplace_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_favorites ENABLE ROW LEVEL SECURITY;

-- Published prompts are viewable by everyone
CREATE POLICY "Published marketplace prompts are viewable by everyone"
    ON public.marketplace_prompts FOR SELECT
    USING (published = true);

-- Authors can insert prompts
CREATE POLICY "Authors can insert marketplace prompts"
    ON public.marketplace_prompts FOR INSERT
    WITH CHECK (auth.uid() = author_id);

-- Authors can update own prompts
CREATE POLICY "Authors can update own marketplace prompts"
    ON public.marketplace_prompts FOR UPDATE
    USING (auth.uid() = author_id);

-- Users can view own favorites
CREATE POLICY "Users can view own marketplace favorites"
    ON public.marketplace_favorites FOR SELECT
    USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add marketplace favorites"
    ON public.marketplace_favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can remove own favorites
CREATE POLICY "Users can delete own marketplace favorites"
    ON public.marketplace_favorites FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- 5. UPDATED_AT TRIGGER
-- ============================================================
CREATE TRIGGER update_marketplace_prompts_updated_at
    BEFORE UPDATE ON public.marketplace_prompts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 6. SEED DATA (12 curated prompts)
-- ============================================================
INSERT INTO public.marketplace_prompts (title, excerpt, description, category, model, author_name, prompt_text, example_output, usage_count, is_free, tags) VALUES
(
    'Professional Email Writer',
    'Generate polished, context-aware professional emails for any business scenario.',
    'This prompt helps you craft professional emails that are clear, concise, and appropriately toned. Simply provide the context (recipient, purpose, key points) and get a ready-to-send email.',
    'business', 'ChatGPT', 'PromptDiary Team',
    E'You are a professional email writer. I need you to write an email with the following details:\n\n**Recipient:** {{recipient}}\n**Purpose:** {{purpose}}\n**Key Points to Cover:**\n{{key_points}}\n**Tone:** {{tone: formal/friendly/urgent}}\n\nWrite a clear, professional email with proper greeting, body paragraphs, and closing.',
    E'Subject: Q3 Strategy Meeting - Agenda & Preparation\n\nDear Sarah,\n\nI hope this email finds you well...',
    342, true, ARRAY['email', 'business', 'writing', 'professional']
),
(
    'Code Review Assistant',
    'Get thorough code reviews with actionable feedback on bugs, performance, and best practices.',
    'Submit your code and get a detailed review covering: potential bugs, performance issues, security concerns, readability improvements, and best practice suggestions.',
    'code', 'GPT-4', 'PromptDiary Team',
    E'You are an expert code reviewer. Please review the following code thoroughly:\n\n```{{language}}\n{{code}}\n```\n\nProvide your review in sections: Bugs, Performance, Security, Readability, Best Practices. Rate overall quality 1-10.',
    E'## Bugs & Issues\n- Line 12: Potential null reference\n\n## Performance\n- Consider memoizing filterResults()\n\n**Overall: 6/10**',
    521, true, ARRAY['code', 'review', 'debugging', 'best-practices']
),
(
    'SEO Blog Post Generator',
    'Create SEO-optimized blog posts with proper heading structure, keywords, and meta descriptions.',
    'Generate complete, SEO-friendly blog posts with H1/H2/H3 headings, keyword placement, meta description, and internal linking suggestions.',
    'marketing', 'ChatGPT', 'PromptDiary Team',
    E'You are an expert SEO content writer. Write a comprehensive blog post on:\n\n**Topic:** {{topic}}\n**Target Keywords:** {{keywords}}\n**Word Count:** {{word_count}}\n\nInclude: SEO title, meta description, proper heading structure, natural keyword placement, and CTA.',
    E'**Title:** 10 Proven Prompt Engineering Techniques\n**Meta:** Learn 10 expert prompt engineering techniques...',
    289, true, ARRAY['seo', 'content', 'marketing', 'blog']
),
(
    'JSON Data Extractor',
    'Extract structured JSON data from unstructured text — reviews, articles, documents.',
    'Feed in any unstructured text and extract clean, structured JSON data. Perfect for data pipelines and automated analysis.',
    'data', 'GPT-4', 'PromptDiary Team',
    E'You are a data extraction specialist. Extract structured information from the following text and return it as valid JSON.\n\n**Text:** {{text}}\n**Required Fields:** {{fields}}\n\nRules: Return ONLY valid JSON, use null for missing fields, normalize dates to ISO 8601.',
    E'{"product_name": "MacBook Pro", "brand": "Apple", "price": 2499.00, "rating": 4.7}',
    478, true, ARRAY['json', 'data', 'extraction', 'structured-output']
),
(
    'Chain-of-Thought Reasoning',
    'Solve complex problems step-by-step with explicit reasoning chains for better accuracy.',
    'This meta-prompt forces any LLM to reason step-by-step through complex problems. Dramatically improves accuracy on math, logic, and analytical tasks.',
    'education', 'Universal', 'PromptDiary Team',
    E'Solve the following problem step by step. Show your complete reasoning process.\n\n**Problem:** {{problem}}\n\nInstructions:\n1. Restate the problem\n2. Identify given information\n3. Break down into steps\n4. Show work\n5. Verify answer\n6. State final answer clearly.',
    E'**Problem Restated:** We need to find how many ways to arrange...\n\n**Step 1:** First, consider the distribution...\n\n**Final Answer:** 150 unique arrangements',
    634, true, ARRAY['reasoning', 'chain-of-thought', 'problem-solving', 'math']
),
(
    'Social Media Content Calendar',
    'Generate a week of social media posts across platforms with hashtags and timing.',
    'Create a comprehensive social media content calendar with platform-specific posts for Twitter/X, LinkedIn, and Instagram.',
    'marketing', 'ChatGPT', 'PromptDiary Team',
    E'Create a 7-day social media content calendar for:\n\n**Brand/Topic:** {{brand}}\n**Platforms:** Twitter/X, LinkedIn, Instagram\n**Tone:** {{tone}}\n**Goal:** {{goal}}\n\nFor each day provide: post text, hashtags, posting time, content type, engagement hook.',
    E'## Monday — Educational Content\n\n**Twitter/X (9:00 AM EST):**\nThread: 5 prompt engineering mistakes...',
    198, true, ARRAY['social-media', 'content', 'calendar', 'marketing']
),
(
    'API Documentation Generator',
    'Auto-generate clean API documentation from endpoint definitions with examples.',
    'Provide your API endpoint details and get professional documentation with request/response examples, error codes, and usage guidelines.',
    'code', 'GPT-4', 'PromptDiary Team',
    E'You are a technical writer. Generate comprehensive documentation for:\n\n**Endpoint:** {{method}} {{path}}\n**Description:** {{description}}\n**Auth Required:** {{auth}}\n\nInclude: summary, auth requirements, params table, request/response schema, curl example, error codes.',
    E'## POST /api/v1/playground/run\n\nExecute a prompt against an AI model.\n\n### Request Body\n| Field | Type | Required |\n|-------|------|----------|',
    267, true, ARRAY['api', 'documentation', 'technical-writing', 'code']
),
(
    'Creative Story Builder',
    'Generate immersive short stories with customizable genre, characters, and plot elements.',
    'Build captivating short stories by specifying genre, characters, setting, and plot elements with proper pacing and vivid descriptions.',
    'creative', 'ChatGPT', 'PromptDiary Team',
    E'Write a short story with:\n\n**Genre:** {{genre}}\n**Setting:** {{setting}}\n**Main Character:** {{character}}\n**Conflict:** {{conflict}}\n\nRequirements: engaging hook, show-dont-tell, natural dialogue, three-act structure, unexpected twist.',
    E'The coffee was cold by the time Maya noticed it.\n\nShe had been staring at the same line of code for forty-seven minutes...',
    156, true, ARRAY['creative-writing', 'story', 'fiction', 'narrative']
),
(
    'System Prompt Engineer',
    'Design effective system prompts that define AI behavior, constraints, and response patterns.',
    'Meta-prompt for creating system prompts. Define the AI role, capabilities, constraints, and response format for custom assistants.',
    'text-generation', 'Universal', 'PromptDiary Team',
    E'Help me design a system prompt for an AI assistant with:\n\n**Role:** {{role}}\n**Purpose:** {{purpose}}\n**Target Users:** {{users}}\n**Capabilities:** {{capabilities}}\n**Constraints:** {{constraints}}\n\nCreate a comprehensive system prompt under 500 words.',
    E'## System Prompt\n\nYou are CodeMentor, a senior software engineer AI assistant specializing in Python and JavaScript...',
    445, true, ARRAY['system-prompt', 'meta-prompt', 'chatbot', 'ai-design']
),
(
    'Data Analysis Report Builder',
    'Transform raw data insights into structured analytical reports with visualizations.',
    'Provide your data findings and get a professional analysis report with executive summary, key findings, and recommendations.',
    'data', 'GPT-4', 'PromptDiary Team',
    E'You are a data analyst. Create a report from:\n\n**Dataset:** {{dataset}}\n**Key Metrics:** {{metrics}}\n**Time Period:** {{period}}\n\nStructure: Executive Summary, Key Findings (top 5), Trend Analysis, Anomalies, Visualization Suggestions, Recommendations.',
    E'# Q2 2026 User Engagement Report\n\n## Executive Summary\nMonthly active users grew 23% QoQ to 45,000...',
    189, true, ARRAY['data-analysis', 'report', 'analytics', 'business-intelligence']
),
(
    'Learning Path Designer',
    'Create structured learning roadmaps for any technical skill with resources and milestones.',
    'Design a comprehensive learning path for any technical topic with weekly breakdown, resources, exercises, and checkpoints.',
    'education', 'Universal', 'PromptDiary Team',
    E'Design a learning path for:\n\n**Skill:** {{skill}}\n**Level:** {{level}}\n**Time:** {{hours_per_week}} hrs/week\n**Duration:** {{weeks}} weeks\n\nFor each week: topic, resources, exercises, mini-project, knowledge check questions.',
    E'# Prompt Engineering — 8-Week Learning Path\n\n## Week 1: Foundations\n**Objective:** Understand how LLMs process text...',
    312, true, ARRAY['learning', 'education', 'roadmap', 'skill-development']
),
(
    'Prompt Optimizer & Debugger',
    'Improve existing prompts — fix vagueness, add constraints, optimize tokens.',
    'Paste your underperforming prompt and get an optimized version with diagnosis of issues and improvement tips.',
    'text-generation', 'Universal', 'PromptDiary Team',
    E'You are a prompt engineering expert. Analyze and optimize this prompt:\n\n**Original Prompt:** {{prompt}}\n**Issue:** {{issue}}\n\nProvide: Diagnosis, Optimized Prompt, Changes Made, Tips, A/B Test Suggestion.',
    E'## Diagnosis\nThe original prompt is too vague — lacks output format, length constraints, and role definition.\n\n## Optimized Prompt\n```\nYou are a senior technical writer...\n```',
    567, true, ARRAY['optimization', 'debugging', 'meta-prompt', 'improvement']
);
