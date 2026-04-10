import Link from "next/link";

// Static article data for Phase 1
const articles: Record<string, {
  title: string;
  category: string;
  difficulty: string;
  content: string;
  tags: string[];
  created_at: string;
}> = {
  "intro-to-prompt-engineering": {
    title: "Introduction to Prompt Engineering",
    category: "fundamentals",
    difficulty: "beginner",
    tags: ["prompt-engineering", "basics", "llm"],
    created_at: "January 1, 2025",
    content: `Prompt engineering is the art and science of crafting effective prompts to get the best results from Large Language Models (LLMs).

## What is a Prompt?

A prompt is the input text you provide to an AI model to get a desired output. It can be a question, instruction, or context that guides the model's response.

## Why Does It Matter?

The quality of your prompt directly affects the quality of the AI's response. A well-crafted prompt can:

- **Improve accuracy** — Get more precise and relevant answers
- **Save time** — Reduce the need for follow-up queries
- **Unlock capabilities** — Access advanced model features
- **Reduce costs** — Fewer tokens needed for good results

## Key Principles

### 1. Be Specific
Clearly state what you want. Instead of "Tell me about dogs", try "List the top 5 most popular dog breeds in the US with a brief description of each breed's temperament."

### 2. Provide Context
Give the model relevant background information. Context helps the model understand the domain and produce more relevant outputs.

### 3. Set the Format
Specify how you want the output structured. For example: "Format your response as a JSON object" or "Present this as a numbered list."

### 4. Use Examples
Show the model what good output looks like. This is known as "few-shot prompting" and can dramatically improve response quality.

## Getting Started

The best way to learn prompt engineering is through practice. Start with simple prompts and gradually increase complexity as you understand how models respond to different inputs.

**Next Steps:** Learn about Zero-Shot and Few-Shot Prompting →`,
  },
  "zero-shot-vs-few-shot": {
    title: "Zero-Shot vs Few-Shot Prompting",
    category: "techniques",
    difficulty: "beginner",
    tags: ["zero-shot", "few-shot", "techniques"],
    created_at: "January 15, 2025",
    content: `Understanding the difference between zero-shot and few-shot prompting is fundamental to effective prompt engineering.

## Zero-Shot Prompting

Zero-shot prompting means asking the model to perform a task **without any examples**. You rely purely on the model's pre-trained knowledge.

\`\`\`
Classify the sentiment of this review: "This product is amazing!"
\`\`\`

The model uses its training to understand what "classify sentiment" means and responds accordingly.

## Few-Shot Prompting

Few-shot prompting provides **examples** of the desired input-output pairs before the actual task.

\`\`\`
Classify the sentiment:
"I love this!" → Positive
"This is terrible" → Negative
"It's okay" → Neutral

"This product is amazing!" →
\`\`\`

## When to Use Which?

| Approach | Best For | Limitations |
|----------|----------|-------------|
| Zero-Shot | Simple, well-defined tasks | May lack precision |
| Few-Shot | Complex or nuanced tasks | Uses more tokens |

## Best Practices

- **Start with zero-shot** and add examples only if needed
- **Use 2-5 examples** for few-shot (more isn't always better)
- **Ensure examples are diverse** and representative of edge cases
- **Order matters** — put the most relevant examples last`,
  },
  "chain-of-thought-prompting": {
    title: "Chain-of-Thought Prompting",
    category: "techniques",
    difficulty: "intermediate",
    tags: ["chain-of-thought", "reasoning", "advanced-techniques"],
    created_at: "February 1, 2025",
    content: `Chain-of-Thought (CoT) prompting encourages the model to break down complex problems into intermediate reasoning steps.

## The Core Idea

Instead of asking for a direct answer, you prompt the model to "think step by step." This dramatically improves performance on mathematical reasoning, logic puzzles, multi-step problems, and complex analysis.

## Example

**Without CoT:** "If a store has 23 apples and receives 3 boxes of 12 apples each, how many apples total?"

**With CoT:** "If a store has 23 apples and receives 3 boxes of 12 apples each, how many apples total? Let's think step by step."

The model will now show its reasoning:
1. Starting apples: 23
2. Apples per box: 12
3. Number of boxes: 3
4. New apples: 12 × 3 = 36
5. Total: 23 + 36 = **59**

## Variants

### Zero-Shot CoT
Simply add "Let's think step by step" to any prompt. Surprisingly effective!

### Manual CoT
Provide worked examples with explicit reasoning chains before the actual problem.

### Self-Consistency
Generate multiple CoT paths and take the majority vote on the answer.`,
  },
  "rag-architecture-deep-dive": {
    title: "RAG Architecture Deep Dive",
    category: "architecture",
    difficulty: "advanced",
    tags: ["rag", "architecture", "vector-database"],
    created_at: "February 15, 2025",
    content: `Retrieval-Augmented Generation (RAG) is a hybrid architecture that combines information retrieval with text generation.

## Why RAG?

LLMs have a knowledge cutoff date and can hallucinate facts. RAG solves both problems by grounding responses in real, up-to-date data.

## Architecture Flow

\`\`\`
User Query → Embedding → Vector Search → Retrieved Context → LLM → Response
\`\`\`

## Core Components

### 1. Document Store
Your knowledge base — PDFs, documentation, databases, wikis, etc.

### 2. Embedding Model
Converts text to dense vector representations (e.g., OpenAI's text-embedding-3-small).

### 3. Vector Database
Stores and efficiently searches embeddings (e.g., Pinecone, Weaviate, ChromaDB).

### 4. Retriever
Given a query, finds the most relevant document chunks using similarity search.

### 5. Generator
An LLM that produces the final answer, grounded in the retrieved context.

## Implementation Steps

1. **Chunk** your documents into manageable pieces (500-1000 tokens)
2. **Generate embeddings** for each chunk
3. **Store** embeddings in a vector database
4. At query time, **embed** the user's question
5. **Retrieve** the most similar chunks (top-k)
6. **Feed** retrieved context + question to the LLM
7. **Return** the generated answer

## Best Practices

- Use overlapping chunks to avoid losing context at boundaries
- Implement hybrid search (semantic + keyword) for better recall
- Add metadata filtering to narrow results before semantic search
- Always include source citations in responses`,
  },
  "building-ai-agent-systems": {
    title: "Building AI Agent Systems",
    category: "architecture",
    difficulty: "advanced",
    tags: ["agents", "architecture", "autonomous-ai"],
    created_at: "March 1, 2025",
    content: `AI agents are autonomous systems that can plan, reason, and take actions to accomplish complex tasks.

## What is an AI Agent?

An AI agent is an LLM-powered system that can understand a goal, break it into sub-tasks, use tools to accomplish each task, and reflect on results.

## Agent Architecture

\`\`\`
Goal → Planning → Tool Selection → Execution → Observation → Reflection → (loop)
\`\`\`

## Core Components

### 1. Planning Module
The agent breaks down complex tasks into actionable steps using techniques like task decomposition and goal refinement.

### 2. Tool Use
Agents extend LLM capabilities by calling external tools:
- 🔍 Web search
- 💻 Code execution
- 🗄️ Database queries
- 🌐 API calls
- 📁 File operations

### 3. Memory
- **Short-term (Working)**: Current conversation and task context
- **Long-term (Persistent)**: Knowledge base, past experiences, learned preferences

### 4. Reflection
The agent evaluates its own outputs, identifies errors, and decides whether to iterate or conclude.

## Popular Frameworks

- **LangChain Agents** — Most popular, extensive tool ecosystem
- **CrewAI** — Multi-agent collaboration framework
- **AutoGen** — Microsoft's conversational agent framework
- **LlamaIndex** — Optimized for data-intensive agent tasks

## Design Patterns

### ReAct (Reasoning + Acting)
Interleave reasoning traces with actions. The agent thinks about what to do, does it, observes the result, and reasons about next steps.

### Plan-and-Execute
First generate a complete plan, then execute each step sequentially. Good for complex, multi-step tasks.

### Multi-Agent
Multiple specialized agents collaborate — one plans, one researches, one writes, one reviews.`,
  },
};

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles[slug];

  if (!article) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "120px 24px",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "64px", display: "block", marginBottom: "24px" }}>📄</span>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px" }}>
          Article Not Found
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          The article you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/articles" className="btn-primary">
          ← Back to Articles
        </Link>
      </div>
    );
  }

  // Simple markdown-like rendering (headings, bold, code blocks, lists)
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent = "";
    let key = 0;

    for (const line of lines) {
      key++;

      if (line.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={key}
              style={{
                background: "rgba(0,0,0,0.4)",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid var(--border-subtle)",
                overflow: "auto",
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "0.85rem",
                lineHeight: 1.6,
                margin: "16px 0",
                color: "#e2e8f0",
              }}
            >
              <code>{codeContent}</code>
            </pre>
          );
          codeContent = "";
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent += line + "\n";
        continue;
      }

      if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={key}
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              marginTop: "40px",
              marginBottom: "16px",
              color: "var(--text-primary)",
            }}
          >
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={key}
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              marginTop: "28px",
              marginBottom: "12px",
              color: "var(--text-primary)",
            }}
          >
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith("- ")) {
        elements.push(
          <li
            key={key}
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.95rem",
              marginLeft: "20px",
              marginBottom: "6px",
              lineHeight: 1.7,
            }}
            dangerouslySetInnerHTML={{
              __html: line
                .slice(2)
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>'),
            }}
          />
        );
      } else if (line.startsWith("|")) {
        // Simple table rendering
        elements.push(
          <div
            key={key}
            style={{
              overflowX: "auto",
              margin: "8px 0",
              fontSize: "0.85rem",
              fontFamily: "var(--font-geist-mono), monospace",
              color: "var(--text-secondary)",
              padding: "4px 0",
            }}
          >
            {line}
          </div>
        );
      } else if (line.match(/^\d+\./)) {
        elements.push(
          <li
            key={key}
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.95rem",
              marginLeft: "20px",
              marginBottom: "6px",
              lineHeight: 1.7,
              listStyleType: "decimal",
            }}
            dangerouslySetInnerHTML={{
              __html: line
                .replace(/^\d+\.\s*/, "")
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>'),
            }}
          />
        );
      } else if (line.trim() === "") {
        elements.push(<br key={key} />);
      } else {
        elements.push(
          <p
            key={key}
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.95rem",
              lineHeight: 1.8,
              marginBottom: "8px",
            }}
            dangerouslySetInnerHTML={{
              __html: line
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
                .replace(
                  /`([^`]+)`/g,
                  '<code style="background:rgba(124,58,237,0.15);padding:2px 8px;border-radius:4px;font-family:var(--font-geist-mono),monospace;font-size:0.85em;color:#c4b5fd">$1</code>'
                ),
            }}
          />
        );
      }
    }

    return elements;
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>
      {/* Breadcrumb */}
      <nav
        style={{
          marginBottom: "32px",
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <Link
          href="/articles"
          style={{ color: "var(--text-muted)", textDecoration: "none" }}
        >
          Articles
        </Link>
        <span>→</span>
        <span style={{ color: "var(--text-secondary)" }}>{article.title}</span>
      </nav>

      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          <span className={`badge badge-${article.difficulty}`}>
            {article.difficulty}
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              padding: "4px 12px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.05)",
              color: "var(--text-muted)",
              textTransform: "capitalize",
            }}
          >
            {article.category}
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: "16px",
            lineHeight: 1.2,
          }}
        >
          {article.title}
        </h1>

        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Published {article.created_at}
        </p>
      </div>

      {/* Content */}
      <article
        className="glass-card"
        style={{ padding: "40px", marginBottom: "32px" }}
      >
        {renderContent(article.content)}
      </article>

      {/* Tags */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
        {article.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: "0.75rem",
              padding: "4px 14px",
              borderRadius: "20px",
              background: "rgba(124, 58, 237, 0.1)",
              color: "#a78bfa",
              border: "1px solid rgba(124, 58, 237, 0.15)",
            }}
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Navigation */}
      <Link
        href="/articles"
        className="btn-secondary"
        style={{ fontSize: "0.9rem" }}
      >
        ← Back to Articles
      </Link>
    </div>
  );
}
