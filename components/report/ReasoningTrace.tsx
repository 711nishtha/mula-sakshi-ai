"use client";

import { useEffect, useState } from "react";
import type { ReasoningStep } from "@/types";

interface ReasoningTraceProps {
  steps: ReasoningStep[];
  animate?: boolean;
  delayMs?: number; // stagger start delay
}

const VERDICT_CONFIG = {
  flag:    { icon: "⚑", color: "#e8445a", bg: "rgba(232,68,90,0.08)",  border: "rgba(232,68,90,0.25)",  label: "Flagged" },
  match:   { icon: "✓", color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)", label: "Match"   },
  neutral: { icon: "◎", color: "#9896b0", bg: "rgba(152,150,176,0.06)",border: "rgba(152,150,176,0.15)",label: "Neutral" },
};

export function ReasoningTrace({ steps, animate = true, delayMs = 0 }: ReasoningTraceProps) {
  const [visibleCount, setVisibleCount] = useState(animate ? 0 : steps.length);
  const [typingIdx, setTypingIdx]       = useState<number | null>(animate ? 0 : null);

  useEffect(() => {
    if (!animate) return;

    let current = 0;
    const reveal = () => {
      if (current >= steps.length) { setTypingIdx(null); return; }
      setVisibleCount(current + 1);
      setTypingIdx(current);
      current++;
      setTimeout(reveal, 420);
    };

    const t = setTimeout(reveal, delayMs);
    return () => clearTimeout(t);
  }, [animate, steps.length, delayMs]);

  const flagCount   = steps.filter((s) => s.verdict === "flag").length;
  const matchCount  = steps.filter((s) => s.verdict === "match").length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-xs font-mono text-gold tracking-widest uppercase">AI Reasoning Trace</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          {flagCount  > 0 && <span className="text-red-audit">{flagCount} flagged</span>}
          {matchCount > 0 && <span className="text-green-audit">{matchCount} matched</span>}
          <span className="text-text-muted">{steps.length} steps</span>
        </div>
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Connector line */}
        <div className="absolute left-[14px] top-4 bottom-4 w-px bg-gradient-to-b from-border via-border to-transparent" />

        <div className="space-y-2">
          {steps.map((step, i) => {
            const cfg      = VERDICT_CONFIG[step.verdict];
            const visible  = i < visibleCount;
            const isTyping = typingIdx === i;

            return (
              <div
                key={step.step}
                className="flex items-start gap-3 transition-all duration-400"
                style={{
                  opacity:   visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(-8px)",
                  transitionDelay: `${i * 30}ms`,
                }}
              >
                {/* Step node */}
                <div
                  className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold transition-all duration-300"
                  style={{
                    background: visible ? cfg.bg    : "rgba(30,30,56,0.8)",
                    border:     `1px solid ${visible ? cfg.border : "#1e1e38"}`,
                    color:      visible ? cfg.color : "#55536a",
                    boxShadow:  isTyping ? `0 0 12px ${cfg.color}60` : "none",
                  }}
                >
                  {visible ? cfg.icon : step.step}
                </div>

                {/* Content */}
                <div
                  className="flex-1 rounded-xl px-3 py-2.5 min-h-[2.5rem] transition-all duration-300"
                  style={{
                    background: visible ? cfg.bg    : "transparent",
                    border:     `1px solid ${visible ? cfg.border : "transparent"}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono font-semibold" style={{ color: visible ? cfg.color : "#55536a" }}>
                      {step.label}
                    </span>
                    {isTyping && (
                      <span className="inline-flex gap-0.5">
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className="w-1 h-1 rounded-full bg-gold animate-bounce"
                            style={{ animationDelay: `${d * 120}ms` }}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                  {visible && (
                    <p className="text-xs text-text-secondary leading-relaxed font-body">{step.detail}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary bar */}
      {visibleCount === steps.length && steps.length > 0 && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg mt-1 animate-fade-in"
          style={{ background: "rgba(212,168,83,0.06)", border: "1px solid rgba(212,168,83,0.2)" }}
        >
          <span className="text-xs font-mono text-gold">Trace complete —</span>
          <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(flagCount / steps.length) * 100}%`,
                background: "linear-gradient(90deg, #D4A853, #e8445a)",
              }}
            />
          </div>
          <span className="text-xs font-mono text-text-muted">
            {Math.round((flagCount / steps.length) * 100)}% anomalous
          </span>
        </div>
      )}
    </div>
  );
}
