-- ============================================================
-- Prompt Diary — Seed Data
-- Run this AFTER 001_initial_schema.sql to populate sample data
-- ============================================================

-- ============================================================
-- ARTICLES
-- ============================================================
INSERT INTO public.articles (title, slug, content, excerpt, category, difficulty, tags, published) VALUES

('Introduction to Prompt Engineering',
 'intro-to-prompt-engineering',
 '# Introduction to Prompt Engineering

Prompt engineering is the art and science of crafting effective prompts to get the best results from Large Language Models (LLMs).

## What is a Prompt?

A prompt is the input text you provide to an AI model to get a desired output.

## Why Does It Matter?

The quality of your prompt directly affects the quality of the AI''s response.

## Key Principles

1. **Be Specific** — Clearly state what you want
2. **Provide Context** — Give relevant background
3. **Set the Format** — Specify output structure
4. **Use Examples** — Show what good output looks like',
 'Learn the fundamentals of prompt engineering and why it matters in the age of AI.',
 'fundamentals', 'beginner',
 ARRAY['prompt-engineering', 'basics', 'llm'],
 true),

('Zero-Shot vs Few-Shot Prompting',
 'zero-shot-vs-few-shot',
 '# Zero-Shot vs Few-Shot Prompting

Understanding the difference between zero-shot and few-shot prompting is fundamental.

## Zero-Shot Prompting
Ask the model to perform a task without any examples.

## Few-Shot Prompting
Provide examples of the desired input-output pairs before the actual task.',
 'Master the two foundational prompting techniques.',
 'techniques', 'beginner',
 ARRAY['zero-shot', 'few-shot', 'techniques'],
 true),

('Chain-of-Thought Prompting',
 'chain-of-thought-prompting',
 '# Chain-of-Thought Prompting

Chain-of-Thought (CoT) prompting encourages the model to break down complex problems into intermediate reasoning steps.

## The Core Idea
Instead of asking for a direct answer, prompt the model to "think step by step."',
 'Learn how Chain-of-Thought prompting unlocks advanced reasoning.',
 'techniques', 'intermediate',
 ARRAY['chain-of-thought', 'reasoning'],
 true),

('RAG Architecture Deep Dive',
 'rag-architecture-deep-dive',
 '# RAG Architecture Deep Dive

Retrieval-Augmented Generation (RAG) combines information retrieval with text generation.

## Why RAG?
LLMs have knowledge cutoffs and can hallucinate. RAG grounds responses in real data.',
 'Understand the RAG architecture used in production AI systems.',
 'architecture', 'advanced',
 ARRAY['rag', 'architecture', 'vector-database'],
 true),

('Building AI Agent Systems',
 'building-ai-agent-systems',
 '# Building AI Agent Systems

AI agents are autonomous systems that can plan, reason, and take actions.

## Core Components
1. Planning Module
2. Tool Use
3. Memory
4. Reflection',
 'Learn how to design and build autonomous AI agent systems.',
 'architecture', 'advanced',
 ARRAY['agents', 'architecture', 'autonomous-ai'],
 true);

-- ============================================================
-- CHALLENGES
-- ============================================================
INSERT INTO public.challenges (title, description, difficulty, category, starter_prompt, hints, points) VALUES

('Summarize an Article',
 'Write a prompt that summarizes a long technical article into 3 key bullet points.',
 'easy', 'summarization',
 'Summarize the following article...',
 ARRAY['Specify the number of bullet points', 'Ask for key takeaways'],
 10),

('Extract JSON from Text',
 'Write a prompt that extracts structured JSON from an unstructured product review.',
 'medium', 'extraction',
 'Extract the following information...',
 ARRAY['Define the exact JSON schema', 'Provide an example output'],
 20),

('Multi-Step Reasoning',
 'Write a prompt that guides AI through a multi-step math word problem.',
 'medium', 'reasoning',
 'Solve the following problem step by step...',
 ARRAY['Use Chain-of-Thought', 'Ask to verify the answer'],
 20),

('Role-Based Prompt Design',
 'Create a system prompt for a senior code reviewer.',
 'hard', 'role-playing',
 'You are a senior software engineer...',
 ARRAY['Define the persona clearly', 'Include specific review criteria'],
 30),

('Build a Prompt Chain',
 'Design 3 connected prompts: analyze → generate → evaluate.',
 'hard', 'chaining',
 'Step 1: Analyze the following...',
 ARRAY['Clear objective per step', 'Define output format for each'],
 40);

-- ============================================================
-- ROADMAPS
-- ============================================================
INSERT INTO public.roadmaps (title, level, description, topics, estimated_hours) VALUES

('Prompt Engineering Beginner Path',
 'beginner',
 'Start your journey into prompt engineering.',
 '[
   {"order": 1, "title": "What are LLMs?", "description": "Understanding Large Language Models"},
   {"order": 2, "title": "Prompt Basics", "description": "Structure and components of a prompt"},
   {"order": 3, "title": "Zero-Shot Prompting", "description": "Prompting without examples"},
   {"order": 4, "title": "Few-Shot Prompting", "description": "Using examples to guide the model"},
   {"order": 5, "title": "Prompt Formatting", "description": "Best practices for formatting"},
   {"order": 6, "title": "Common Mistakes", "description": "Avoiding prompting pitfalls"}
 ]'::JSONB,
 8),

('Intermediate Prompt Techniques',
 'intermediate',
 'Level up with advanced techniques.',
 '[
   {"order": 1, "title": "Chain-of-Thought", "description": "Step-by-step reasoning"},
   {"order": 2, "title": "Role Prompting", "description": "Assigning personas to AI"},
   {"order": 3, "title": "Output Formatting", "description": "Getting structured outputs"},
   {"order": 4, "title": "Prompt Chaining", "description": "Connecting multiple prompts"},
   {"order": 5, "title": "Temperature & Parameters", "description": "Controlling model behavior"},
   {"order": 6, "title": "Evaluation", "description": "Evaluating prompt quality"}
 ]'::JSONB,
 12),

('Advanced AI Architecture',
 'advanced',
 'Master production AI systems.',
 '[
   {"order": 1, "title": "RAG Architecture", "description": "Retrieval-Augmented Generation"},
   {"order": 2, "title": "Vector Databases", "description": "Storing and searching embeddings"},
   {"order": 3, "title": "AI Agents", "description": "Building autonomous AI systems"},
   {"order": 4, "title": "Multi-Agent Systems", "description": "Coordinating multiple agents"},
   {"order": 5, "title": "Enterprise AI", "description": "Production deployment patterns"},
   {"order": 6, "title": "AI Safety", "description": "Guardrails and responsible AI"}
 ]'::JSONB,
 20);
