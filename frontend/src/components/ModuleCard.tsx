import Link from "next/link";

interface ModuleCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
  status: "active" | "coming-soon";
  itemCount?: number;
}

export default function ModuleCard({
  icon,
  title,
  description,
  href,
  status,
  itemCount,
}: ModuleCardProps) {
  return (
    <Link
      href={status === "active" ? href : "#"}
      className="glass-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        padding: "24px",
        textDecoration: "none",
        color: "inherit",
        opacity: status === "coming-soon" ? 0.5 : 1,
        cursor: status === "active" ? "pointer" : "default",
      }}
    >
      <span
        style={{
          fontSize: "32px",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "4px",
          }}
        >
          <h3
            style={{
              fontSize: "1.05rem",
              fontWeight: 600,
            }}
          >
            {title}
          </h3>
          {status === "coming-soon" && (
            <span
              style={{
                fontSize: "0.7rem",
                padding: "2px 10px",
                borderRadius: "12px",
                background: "rgba(245, 158, 11, 0.1)",
                color: "#fbbf24",
                fontWeight: 600,
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              COMING SOON
            </span>
          )}
        </div>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
          }}
        >
          {description}
        </p>
      </div>
      {status === "active" && (
        <span
          className="module-arrow"
          style={{
            fontSize: "1.1rem",
            color: "var(--text-muted)",
            flexShrink: 0,
          }}
        >
          →
        </span>
      )}
      {itemCount !== undefined && (
        <span
          style={{
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {itemCount} items
        </span>
      )}
    </Link>
  );
}
