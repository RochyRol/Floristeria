"use client";

const PRESS = ["VOGUE", "ARCHITECTURAL DIGEST", "ELLE DECOR", "CONDÉ NAST", "AD ESPAÑA"];

export function PressSection() {
  return (
    <div
      style={{
        maxWidth: 1440,
        margin: "0 auto",
        padding: "0 48px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 48,
          padding: "48px 0",
          borderBottom: "1px solid rgba(247,241,234,0.14)",
          flexWrap: "wrap",
        }}
      >
        {PRESS.map((p) => (
          <div
            key={p}
            style={{
              fontFamily: "var(--font-italiana), 'Italiana', serif",
              fontSize: 22,
              letterSpacing: "0.2em",
              color: "#bfb5ab",
              transition: "color 0.3s",
              cursor: "default",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f7f1ea")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#bfb5ab")}
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}
