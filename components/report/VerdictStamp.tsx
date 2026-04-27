"use client";

import { useEffect, useState } from "react";
import type { VerdictType } from "@/types";

interface VerdictStampProps {
  verdict: VerdictType;
  contradictionScore: number;
  caseId: string;
  onComplete: () => void;
}

const VERDICT_DATA = {
  CONTRADICTION_FOUND: {
    emoji:     "⚠",
    label:     "CONTRADICTION FOUND",
    sublabel:  "Government records contradict submitted evidence",
    color:     "#e8445a",
    glow:      "#e8445a",
    bg:        "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(232,68,90,0.12) 0%, transparent 70%)",
    scanColor: "rgba(232,68,90,0.15)",
  },
  VERIFIED: {
    emoji:     "✓",
    label:     "EVIDENCE VERIFIED",
    sublabel:  "No material contradictions detected in official records",
    color:     "#34d399",
    glow:      "#34d399",
    bg:        "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(52,211,153,0.1) 0%, transparent 70%)",
    scanColor: "rgba(52,211,153,0.12)",
  },
  INCONCLUSIVE: {
    emoji:     "◎",
    label:     "INCONCLUSIVE",
    sublabel:  "Insufficient data for definitive contradiction verdict",
    color:     "#D4A853",
    glow:      "#D4A853",
    bg:        "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,168,83,0.1) 0%, transparent 70%)",
    scanColor: "rgba(212,168,83,0.12)",
  },
};

export function VerdictStamp({ verdict, contradictionScore, caseId, onComplete }: VerdictStampProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const [score,  setScore]  = useState(0);
  const [lines,  setLines]  = useState(0); // scan-line count for data-feed effect

  const data = VERDICT_DATA[verdict] ?? VERDICT_DATA.INCONCLUSIVE;

  useEffect(() => {
    // Phase 1: Enter + scan
    const scanInterval = setInterval(() => setLines((n) => Math.min(n + 1, 8)), 80);

    // Phase 2: Score count-up
    const countTimer = setTimeout(() => {
      let n = 0;
      const step = contradictionScore / 40;
      const countInterval = setInterval(() => {
        n = Math.min(n + step, contradictionScore);
        setScore(Math.round(n));
        if (n >= contradictionScore) clearInterval(countInterval);
      }, 25);
    }, 400);

    // Phase 3: Hold then exit
    const holdTimer = setTimeout(() => setPhase("hold"), 600);
    const exitTimer = setTimeout(() => {
      setPhase("exit");
      clearInterval(scanInterval);
      setTimeout(onComplete, 600);
    }, 2600);

    return () => {
      clearInterval(scanInterval);
      clearTimeout(countTimer);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, [contradictionScore, onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(7,7,15,0.96)",
        opacity:    phase === "exit" ? 0 : 1,
        transition: phase === "exit" ? "opacity 0.5s ease" : "none",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Ambient bg glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: data.bg }} />

      {/* Scan lines — data feed feel */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px"
            style={{
              top: `${10 + i * 10}%`,
              background: `linear-gradient(90deg, transparent, ${data.scanColor}, transparent)`,
              opacity: 0.6 - i * 0.06,
              transition: "opacity 0.3s",
            }}
          />
        ))}
      </div>

      {/* Central content */}
      <div
        className="flex flex-col items-center gap-6 text-center px-8"
        style={{
          opacity:   phase === "enter" ? 0 : 1,
          transform: phase === "enter" ? "scale(0.92) translateY(12px)" : "scale(1) translateY(0)",
          transition: "opacity 0.4s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          transitionDelay: "0.15s",
        }}
      >
        {/* Emoji icon with glow */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
          style={{
            background: `${data.color}12`,
            border:     `2px solid ${data.color}40`,
            boxShadow:  `0 0 40px ${data.glow}30, inset 0 0 20px ${data.glow}08`,
          }}
        >
          {data.emoji}
        </div>

        {/* Verdict label */}
        <div>
          <div
            className="font-mono text-2xl md:text-3xl font-black tracking-[0.2em] mb-1"
            style={{
              color:      data.color,
              textShadow: `0 0 30px ${data.glow}60`,
            }}
          >
            {data.label}
          </div>
          <div className="text-text-secondary font-body text-sm max-w-xs">
            {data.sublabel}
          </div>
        </div>

        {/* Contradiction score count-up */}
        <div
          className="flex flex-col items-center gap-1 px-8 py-4 rounded-2xl"
          style={{
            background: `${data.color}08`,
            border:     `1px solid ${data.color}30`,
          }}
        >
          <span className="text-xs font-mono text-text-muted tracking-widest uppercase">
            Contradiction Score
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className="font-mono font-black tabular-nums"
              style={{ fontSize: "3.5rem", lineHeight: 1, color: data.color }}
            >
              {score}
            </span>
            <span className="text-2xl font-mono text-text-muted">/100</span>
          </div>
          {/* Score bar */}
          <div className="w-40 h-1.5 rounded-full bg-border overflow-hidden mt-1">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width:      `${score}%`,
                background: `linear-gradient(90deg, ${data.color}80, ${data.color})`,
                boxShadow:  `0 0 6px ${data.color}80`,
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
          </div>
        </div>

        {/* Case ID + loading hint */}
        <div className="flex items-center gap-3 text-xs font-mono text-text-muted">
          <span>{caseId}</span>
          <span>·</span>
          <span className="animate-pulse">Loading full report…</span>
        </div>
      </div>
    </div>
  );
}
