"use client";

import { motion } from "framer-motion";
import { ORDER_PHASES } from "@/lib/utils";

interface OrderProgressProps {
  status: string;
  deliveryType?: "delivery" | "pickup";
  compact?: boolean;
}

const PHASE_INDEX: Record<string, number> = {
  RECEIVED: 0,
  ACCEPTED: 1,
  MAKING:   2,
  READY:    3,
  IN_ROUTE: 4,
  DELIVERED: 5,
};

export function OrderProgress({
  status,
  deliveryType = "delivery",
  compact = false,
}: OrderProgressProps) {
  const cancelled = status === "CANCELLED";
  const delivered = status === "DELIVERED";
  const currentIndex = PHASE_INDEX[status] ?? 0;

  const phases = ORDER_PHASES.map((p, i) => {
    // Last phase label changes based on delivery type
    if (i === 4) {
      return {
        ...p,
        label: deliveryType === "pickup" ? "Para recoger" : "En camino",
        icon: deliveryType === "pickup" ? "🏪" : "🛵",
      };
    }
    return p;
  });

  if (cancelled) {
    return (
      <div
        className="flex items-center gap-3 px-5 py-4 rounded-sm"
        style={{ background: "rgba(122,46,46,0.12)", border: "1px solid rgba(122,46,46,0.3)" }}
      >
        <span style={{ fontSize: 20 }}>❌</span>
        <div>
          <p style={{ color: "#EDE8DF", fontFamily: "var(--font-italiana, serif)", fontSize: 18 }}>
            Pedido cancelado
          </p>
          <p style={{ color: "rgba(237,232,223,0.5)", fontSize: 12, fontFamily: "var(--font-manrope, sans-serif)", marginTop: 2 }}>
            Si tienes dudas escríbenos por WhatsApp
          </p>
        </div>
      </div>
    );
  }

  if (delivered) {
    return (
      <div
        className="flex items-center gap-3 px-5 py-4 rounded-sm"
        style={{ background: "rgba(28,58,43,0.2)", border: "1px solid rgba(28,58,43,0.5)" }}
      >
        <span style={{ fontSize: 24 }}>🌸</span>
        <div>
          <p style={{ color: "#EDE8DF", fontFamily: "var(--font-italiana, serif)", fontSize: 18 }}>
            ¡Entregado con amor!
          </p>
          <p style={{ color: "rgba(237,232,223,0.5)", fontSize: 12, fontFamily: "var(--font-manrope, sans-serif)", marginTop: 2 }}>
            Gracias por confiar en Deco Imperio
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "py-2" : "py-4"}>
      {/* Desktop: horizontal */}
      <div className="hidden sm:block">
        <div className="relative flex items-start justify-between">
          {/* Background line */}
          <div
            className="absolute top-4 left-0 right-0 h-px"
            style={{ background: "rgba(237,232,223,0.12)", zIndex: 0 }}
          />
          {/* Progress line */}
          <motion.div
            className="absolute top-4 left-0 h-px"
            style={{ background: "linear-gradient(to right, #1C3A2B, #A87C3A)", zIndex: 1 }}
            initial={{ width: "0%" }}
            animate={{ width: currentIndex === 0 ? "0%" : `${(currentIndex / (phases.length - 1)) * 100}%` }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          />

          {phases.map((phase, i) => {
            const isCompleted = i < currentIndex;
            const isActive = i === currentIndex;
            const isFuture = i > currentIndex;

            return (
              <div key={phase.status} className="relative flex flex-col items-center" style={{ zIndex: 2, flex: 1 }}>
                {/* Node */}
                <div className="relative mb-3">
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: "#A87C3A", opacity: 0.3 }}
                      animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center relative"
                    style={{
                      background: isCompleted
                        ? "#1C3A2B"
                        : isActive
                        ? "#A87C3A"
                        : "rgba(237,232,223,0.06)",
                      border: isCompleted
                        ? "1.5px solid #1C3A2B"
                        : isActive
                        ? "1.5px solid #A87C3A"
                        : "1.5px solid rgba(237,232,223,0.15)",
                      transition: "all 0.5s ease",
                    }}
                  >
                    {isCompleted ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EDE8DF" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span style={{ fontSize: isActive ? 14 : 12, opacity: isFuture ? 0.3 : 1 }}>
                        {phase.icon}
                      </span>
                    )}
                  </div>
                </div>

                {/* Label */}
                <p
                  style={{
                    fontFamily: "var(--font-manrope, sans-serif)",
                    fontSize: compact ? 10 : 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: isCompleted
                      ? "rgba(237,232,223,0.7)"
                      : isActive
                      ? "#A87C3A"
                      : "rgba(237,232,223,0.25)",
                    textAlign: "center",
                    transition: "color 0.5s ease",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {phase.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: vertical */}
      <div className="sm:hidden flex flex-col gap-0">
        {phases.map((phase, i) => {
          const isCompleted = i < currentIndex;
          const isActive = i === currentIndex;
          const isFuture = i > currentIndex;
          const isLast = i === phases.length - 1;

          return (
            <div key={phase.status} className="flex gap-4">
              {/* Left: node + line */}
              <div className="flex flex-col items-center" style={{ width: 28 }}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isCompleted ? "#1C3A2B" : isActive ? "#A87C3A" : "rgba(237,232,223,0.06)",
                    border: `1.5px solid ${isCompleted ? "#1C3A2B" : isActive ? "#A87C3A" : "rgba(237,232,223,0.15)"}`,
                  }}
                >
                  {isCompleted ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#EDE8DF" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: 11, opacity: isFuture ? 0.3 : 1 }}>{phase.icon}</span>
                  )}
                </div>
                {!isLast && (
                  <div
                    className="flex-1 w-px my-1"
                    style={{ background: isCompleted ? "#1C3A2B" : "rgba(237,232,223,0.1)", minHeight: 20 }}
                  />
                )}
              </div>

              {/* Right: label */}
              <div className="pb-4">
                <p
                  style={{
                    fontFamily: "var(--font-manrope, sans-serif)",
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: isCompleted ? "rgba(237,232,223,0.6)" : isActive ? "#A87C3A" : "rgba(237,232,223,0.2)",
                    fontWeight: isActive ? 600 : 400,
                    paddingTop: 4,
                  }}
                >
                  {phase.label}
                </p>
                {isActive && (
                  <p style={{ color: "rgba(237,232,223,0.4)", fontSize: 10, fontFamily: "var(--font-manrope, sans-serif)", marginTop: 2 }}>
                    Estado actual
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
