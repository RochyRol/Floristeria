"use client";

import { useEffect, useState } from "react";

interface Petal {
  id: number;
  x: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  type: number;
  rotate: number;
  drift: number;
}

function PetalSVG({ type, size, color }: { type: number; size: number; color: string }) {
  if (type === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2 C12 2 18 8 18 13 C18 16.3 15.3 19 12 19 C8.7 19 6 16.3 6 13 C6 8 12 2 12 2Z"
          fill={color}
          opacity="0.6"
        />
      </svg>
    );
  }
  if (type === 1) {
    return (
      <svg width={size} height={size * 0.7} viewBox="0 0 30 20" fill="none">
        <ellipse cx="15" cy="10" rx="14" ry="9" fill={color} opacity="0.5" />
        <path d="M1 10 Q15 2 29 10" stroke={color} strokeWidth="0.4" opacity="0.3" fill="none" />
        <path d="M1 10 Q15 18 29 10" stroke={color} strokeWidth="0.4" opacity="0.3" fill="none" />
      </svg>
    );
  }
  if (type === 2) {
    return (
      <svg width={size * 0.5} height={size} viewBox="0 0 12 28" fill="none">
        <path d="M6 0 Q10 7 6 14 Q2 7 6 0Z" fill={color} opacity="0.45" />
        <path d="M6 14 Q10 21 6 28 Q2 21 6 14Z" fill={color} opacity="0.35" />
      </svg>
    );
  }
  if (type === 3) {
    return (
      <svg width={size * 1.2} height={size} viewBox="0 0 32 24" fill="none">
        <path
          d="M16 12 C16 12 8 4 4 8 C0 12 8 20 16 12Z"
          fill={color} opacity="0.4"
        />
        <path
          d="M16 12 C16 12 24 4 28 8 C32 12 24 20 16 12Z"
          fill={color} opacity="0.4"
        />
        <path
          d="M16 12 C16 12 8 20 12 24 C16 28 24 20 16 12Z"
          fill={color} opacity="0.3"
        />
        <path
          d="M16 12 C16 12 24 20 20 24 C16 28 8 20 16 12Z"
          fill={color} opacity="0.3"
        />
      </svg>
    );
  }
  // type 4 — tiny dot / seed
  return (
    <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 8 8" fill="none">
      <circle cx="4" cy="4" r="3" fill={color} opacity="0.3" />
    </svg>
  );
}

const GOLD = "#A87C3A";
const PARCHMENT = "#EDE8DF";

export function FloatingPetals({ count = 9 }: { count?: number }) {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    setPetals(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: 8 + Math.random() * 20,
        opacity: 0.042 + Math.random() * 0.084,
        duration: 18 + Math.random() * 28,
        delay: -Math.random() * 30,
        type: Math.floor(Math.random() * 5),
        rotate: Math.random() * 360,
        drift: (Math.random() - 0.5) * 120,
      }))
    );
  }, [count]);

  if (petals.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(110vh) translateX(0px) rotate(var(--r0)); opacity: 0; }
          5%   { opacity: var(--op); }
          90%  { opacity: var(--op); }
          100% { transform: translateY(-12vh) translateX(var(--dx)) rotate(var(--r1)); opacity: 0; }
        }
        @keyframes sway {
          0%, 100% { margin-left: 0; }
          33%       { margin-left: 18px; }
          66%       { margin-left: -14px; }
        }
      `}</style>
      {petals.map((p) => {
        const color = p.type === 3 ? GOLD : p.type === 4 ? GOLD : PARCHMENT;
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              bottom: 0,
              opacity: p.opacity,
              animation: `floatUp ${p.duration}s ${p.delay}s linear infinite, sway ${p.duration * 0.6}s ${p.delay}s ease-in-out infinite`,
              ["--r0" as string]: `${p.rotate}deg`,
              ["--r1" as string]: `${p.rotate + 200}deg`,
              ["--dx" as string]: `${p.drift}px`,
              ["--op" as string]: String(p.opacity),
            }}
          >
            <PetalSVG type={p.type} size={p.size} color={color} />
          </div>
        );
      })}
    </div>
  );
}
