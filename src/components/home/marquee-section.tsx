export function MarqueeSection() {
  const items = [
    "Rosas de jardín", "Peonías francesas", "Tulipanes parrot",
    "Iris violeta", "Hortensias", "Ranúnculos", "Lisianthus",
    "Anémonas", "Eucalipto plateado", "Orquídeas silvestres",
  ];
  const seq = [...items, ...items];

  return (
    <div
      className="overflow-hidden"
      style={{
        borderTop: "1px solid rgba(247,241,234,0.14)",
        borderBottom: "1px solid rgba(247,241,234,0.14)",
        padding: "22px 0",
        background: "#0a0807",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 64,
          whiteSpace: "nowrap",
          animation: "marquee 38s linear infinite",
          fontFamily: "var(--font-italiana), 'Italiana', serif",
          fontSize: 22,
          letterSpacing: "0.18em",
          color: "#f7f1ea",
          alignItems: "center",
        }}
      >
        {seq.map((s, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
            {s}
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                background: "#c9a27a",
                borderRadius: "50%",
                margin: "0 32px",
                flexShrink: 0,
              }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
