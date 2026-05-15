export function QuoteSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        padding: "100px 0",
        background: "#120e0c",
        borderTop: "1px solid rgba(247,241,234,0.14)",
        borderBottom: "1px solid rgba(247,241,234,0.14)",
      }}
    >
      {/* Flower blur — right */}
      <div
        className="absolute"
        style={{
          right: -120,
          top: "50%",
          transform: "translateY(-50%)",
          width: 520,
          height: 520,
          backgroundImage: "url('https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=900&q=80&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "50%",
          opacity: 0.35,
          filter: "blur(2px) saturate(1.1)",
        }}
      />
      {/* Flower blur — left */}
      <div
        className="absolute"
        style={{
          left: -160,
          top: -80,
          width: 380,
          height: 380,
          backgroundImage: "url('https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=700&q=80&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "50%",
          opacity: 0.25,
          filter: "blur(2px)",
        }}
      />

      {/* Quote */}
      <div
        className="relative"
        style={{
          maxWidth: 980,
          margin: "0 auto",
          textAlign: "center",
          zIndex: 1,
          padding: "0 24px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-italiana), 'Italiana', serif",
            fontSize: 120,
            lineHeight: 1,
            color: "#c9a27a",
            marginBottom: -40,
          }}
        >
          "
        </div>
        <blockquote
          style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "clamp(28px, 3.8vw, 46px)",
            lineHeight: 1.25,
            color: "#f7f1ea",
            fontWeight: 300,
          }}
        >
          Una flor no piensa en competir con la flor de al lado.
          <br />
          Simplemente florece.
        </blockquote>
        <div
          style={{
            marginTop: 36,
            fontSize: 11,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#bfb5ab",
            fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
          }}
        >
          — Zen Shin · Maestro Floral
        </div>
      </div>
    </section>
  );
}
