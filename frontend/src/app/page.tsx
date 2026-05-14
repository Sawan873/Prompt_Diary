import Hero from "@/components/Hero";
import Link from "next/link";
import ScrollRevealSection from "@/components/ScrollRevealSection";

// ── Inline SVG icons for topic cards ────────────────────────────────────────
const TopicIcon = ({ d, viewBox = "0 0 24 24" }: { d: string | React.ReactNode; viewBox?: string }) => (
  <svg width="22" height="22" viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const FeatureIcon = ({ children, gradient }: { children: React.ReactNode; gradient: string }) => (
  <div style={{
    width: "56px", height: "56px", borderRadius: "14px",
    background: gradient, display: "flex", alignItems: "center", justifyContent: "center",
    color: "white",
  }}>
    {children}
  </div>
);

// Feature card inline
function FeatureCard({ icon, title, description, href, gradient }: {
  icon: React.ReactNode; title: string; description: string; href: string; gradient: string;
}) {
  return (
    <Link href={href} className="glass-card gradient-border" style={{ display: "flex", flexDirection: "column", padding: "32px", textDecoration: "none", color: "inherit" }}>
      <FeatureIcon gradient={gradient}>{icon}</FeatureIcon>
      <h3 style={{ fontSize: "1.15rem", fontWeight: 600, margin: "20px 0 10px", letterSpacing: "-0.01em" }}>{title}</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, flex: 1 }}>{description}</p>
      <div style={{ marginTop: "20px", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
        Explore <span>→</span>
      </div>
    </Link>
  );
}

// Module card inline
function ModuleCard({ icon, title, description, href, status, itemCount }: {
  icon: React.ReactNode; title: string; description: string; href: string;
  status: "active" | "coming-soon"; itemCount?: number;
}) {
  return (
    <Link href={href} className="glass-card" style={{ display: "flex", alignItems: "center", gap: "20px", padding: "20px 24px", textDecoration: "none", color: "inherit" }}>
      <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--text-secondary)" }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "3px", display: "flex", alignItems: "center", gap: "8px" }}>
          {title}
          {status === "coming-soon" && (
            <span style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: "20px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24", fontWeight: 600, letterSpacing: "0.05em" }}>
              SOON
            </span>
          )}
          {itemCount !== undefined && status === "active" && (
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 400 }}>{itemCount} items</span>
          )}
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{description}</div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </Link>
  );
}

export default function Home() {
  // ── SVG icon nodes for features
  const featureIcons = {
    articles: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    challenges: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
    roadmaps: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l4-4 4 4 4-8 4 4"/><path d="M21 21H3"/></svg>,
    playground: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  };

  // ── SVG icon nodes for modules
  const moduleIcons = {
    articles: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>,
    challenges: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
    roadmaps: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l4-4 4 4 4-8 4 4"/><path d="M21 21H3"/></svg>,
    playground: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    systemDesign: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  };

  // ── Topic cards — SVG icons replacing emojis
  const topics = [
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>, topic: "Prompt Engineering", tag: "fundamentals" },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, topic: "Zero/Few-Shot", tag: "techniques" },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>, topic: "Chain-of-Thought", tag: "techniques" },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>, topic: "RAG Architecture", tag: "architecture" },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>, topic: "AI Agents", tag: "architecture" },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>, topic: "Prompt Chaining", tag: "techniques" },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, topic: "Role Prompting", tag: "techniques" },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>, topic: "Output Formatting", tag: "techniques" },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, topic: "Vector Search", tag: "architecture" },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, topic: "AI Safety", tag: "architecture" },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, topic: "Evaluation", tag: "techniques" },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, topic: "Enterprise AI", tag: "architecture" },
  ];

  return (
    <>
      <Hero />

      {/* Features Section */}
      <section id="features" style={{ padding: "40px 24px 100px", maxWidth: "1200px", margin: "0 auto" }}>
        <ScrollRevealSection>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "16px" }}>
              Everything You Need to{" "}
              <span className="gradient-text-secondary">Master AI</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: "560px", margin: "0 auto" }}>
              From fundamentals to advanced architectures — learn, practice, and build with AI.
            </p>
          </div>
        </ScrollRevealSection>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          <ScrollRevealSection delay={0}>
            <FeatureCard icon={featureIcons.articles} title="Learning Articles" description="In-depth articles on prompt engineering, AI architectures, agent systems, and LLM workflows." href="/articles" gradient="linear-gradient(135deg, #7c3aed, #a78bfa)" />
          </ScrollRevealSection>
          <ScrollRevealSection delay={100}>
            <FeatureCard icon={featureIcons.challenges} title="Prompt Challenges" description="Practice writing effective prompts with hands-on challenges. From summarization to multi-step reasoning." href="/challenges" gradient="linear-gradient(135deg, #3b82f6, #60a5fa)" />
          </ScrollRevealSection>
          <ScrollRevealSection delay={200}>
            <FeatureCard icon={featureIcons.roadmaps} title="Learning Roadmaps" description="Structured learning paths from beginner to advanced. Know exactly what to learn and in what order." href="/roadmaps" gradient="linear-gradient(135deg, #06b6d4, #22d3ee)" />
          </ScrollRevealSection>
          <ScrollRevealSection delay={300}>
            <FeatureCard icon={featureIcons.playground} title="Prompt Playground" description="Interactive environment to test and iterate on your prompts with multiple AI models." href="/playground" gradient="linear-gradient(135deg, #f59e0b, #fbbf24)" />
          </ScrollRevealSection>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" style={{ padding: "80px 24px", background: "linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.03) 50%, transparent 100%)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <ScrollRevealSection>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, marginBottom: "12px" }}>Platform Modules</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Explore different areas of the platform</p>
            </div>
          </ScrollRevealSection>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { icon: moduleIcons.articles,      title: "Learning Platform",  description: "Articles, tutorials, and prompt pattern library",         href: "/articles",       status: "active" as const,      itemCount: 5 },
              { icon: moduleIcons.challenges,    title: "Prompt Challenges",  description: "Practice writing prompts with real-world scenarios",      href: "/challenges",     status: "active" as const,      itemCount: 5 },
              { icon: moduleIcons.roadmaps,      title: "Learning Roadmaps",  description: "Structured paths from beginner to advanced",             href: "/roadmaps",       status: "active" as const,      itemCount: 3 },
              { icon: moduleIcons.playground,    title: "Prompt Playground",  description: "Test prompts with multiple AI models",                   href: "/playground",     status: "coming-soon" as const            },
              { icon: moduleIcons.systemDesign,  title: "System Design",      description: "AI architecture and enterprise workflow guides",          href: "/system-design",  status: "active" as const,      itemCount: 2 },
            ].map((mod, i) => (
              <ScrollRevealSection key={mod.title} direction="left" delay={i * 80}>
                <ModuleCard {...mod} />
              </ScrollRevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Topics Preview */}
      <section id="topics" style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <ScrollRevealSection>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, marginBottom: "12px" }}>What You&apos;ll Learn</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Core topics covered in our learning platform</p>
          </div>
        </ScrollRevealSection>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {topics.map((item, i) => (
            <ScrollRevealSection key={item.topic} delay={i * 50}>
              <div className="glass-card tilt-card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ color: "var(--text-secondary)", flexShrink: 0, display: "flex" }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "2px" }}>{item.topic}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "capitalize" }}>{item.tag}</div>
                </div>
              </div>
            </ScrollRevealSection>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" style={{ padding: "80px 24px", textAlign: "center" }}>
        <ScrollRevealSection>
          <div className="glass-card" style={{ maxWidth: "700px", margin: "0 auto", padding: "56px 40px", background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(59,130,246,0.08), rgba(6,182,212,0.08))", border: "1px solid rgba(124,58,237,0.15)" }}>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 700, marginBottom: "16px" }}>
              Ready to{" "}<span className="gradient-text">Level Up</span>?
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginBottom: "32px", maxWidth: "460px", margin: "0 auto 32px" }}>
              Join the community and start mastering prompt engineering today. It&apos;s completely free.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/signup" id="cta-get-started" className="btn-primary" style={{ padding: "14px 36px", fontSize: "1rem" }}>
                Get Started Free →
              </Link>
              <Link href="/articles" id="cta-browse" className="btn-secondary" style={{ padding: "14px 36px", fontSize: "1rem" }}>
                Browse Articles
              </Link>
            </div>
          </div>
        </ScrollRevealSection>
      </section>
    </>
  );
}
