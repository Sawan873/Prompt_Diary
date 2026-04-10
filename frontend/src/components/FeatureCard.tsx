import Link from "next/link";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
  gradient: string;
  delay?: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  href,
  gradient,
  delay = "",
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      className={`glass-card gradient-border animate-fade-in-up ${delay}`}
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "32px",
        textDecoration: "none",
        color: "inherit",
        opacity: 0,
        cursor: "pointer",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "14px",
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          marginBottom: "20px",
          boxShadow: `0 8px 24px ${gradient.includes("7c3aed") ? "rgba(124,58,237,0.2)" : gradient.includes("3b82f6") ? "rgba(59,130,246,0.2)" : gradient.includes("06b6d4") ? "rgba(6,182,212,0.2)" : "rgba(245,158,11,0.2)"}`,
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <h3
        style={{
          fontSize: "1.15rem",
          fontWeight: 600,
          marginBottom: "10px",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.9rem",
          lineHeight: 1.6,
          flex: 1,
        }}
      >
        {description}
      </p>

      {/* Arrow */}
      <div
        style={{
          marginTop: "20px",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 0.2s ease",
        }}
      >
        Explore →
      </div>
    </Link>
  );
}
