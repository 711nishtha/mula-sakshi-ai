"use client";

import { useEffect, useState } from "react";
import type { AnalysisPhase } from "@/types";

interface ProcessingAnimationProps {
  phase: AnalysisPhase;
  currentStage?: 1 | 2 | 3;
  message: string;
  progress: number;
}

const STAGE_CONFIG = [
  {
    stage: 1 as const,
    label:       "Claim Extraction",
    description: "Parsing evidence — entities, events, quantities",
    icon:        "🔍",
    color:       "#6C63FF",
    statLabel:   "claims",
    maxStat:     6,
  },
  {
    stage: 2 as const,
    label:       "Contradiction Engine",
    description: "Cross-referencing 70 witness accounts + gov records",
    icon:        "⚡",
    color:       "#D4A853",
    statLabel:   "records checked",
    maxStat:     70,
  },
  {
    stage: 3 as const,
    label:       "Report Generator",
    description: "Composing legal-grade audit verdict",
    icon:        "📋",
    color:       "#2EC4B6",
    statLabel:   "sections compiled",
    maxStat:     5,
  },
];

const MESSAGE_SEQUENCES: Record<number, string[]> = {
  1: [
    "Parsing submitted evidence…",
    "Extracting verifiable claims…",
    "Tagging entities and locations…",
    "Assigning confidence scores…",
  ],
  2: [
    "Querying government database…",
    "Cross-referencing official records…",
    "Applying 70-witness consensus layer…",
    "Classifying contradiction types…",
    "Measuring discrepancy severity…",
  ],
  3: [
    "Assembling forensic verdict…",
    "Computing risk score…",
    "Drafting legal implications…",
    "Formatting audit report…",
  ],
};

export function ProcessingAnimation({ phase, currentStage, message, progress }: ProcessingAnimationProps) {
  const [msgIdx,    setMsgIdx]    = useState(0);
  const [dots,      setDots]      = useState(".");
  const [liveStats, setLiveStats] = useState<number[]>([0, 0, 0]);
  const [stageMsg,  setStageMsg]  = useState("");

  // Rotating dots
  useEffect(() => {
    const i = setInterval(() => setDots((d) => d.length >= 3 ? "." : d + "."), 380);
    return () => clearInterval(i);
  }, []);

  // Stage-specific messages
  useEffect(() => {
    if (!currentStage) return;
    const msgs = MESSAGE_SEQUENCES[currentStage] ?? [];
    let idx = 0;
    setMsgIdx(0);
    setStageMsg(msgs[0] ?? "");

    const i = setInterval(() => {
      idx = (idx + 1) % msgs.length;
      setStageMsg(msgs[idx]);
    }, 1800);
    return () => clearInterval(i);
  }, [currentStage]);

  // Animate live stat counters per stage
  useEffect(() => {
    if (!currentStage) return;
    const cfg = STAGE_CONFIG[currentStage - 1];
    if (!cfg) return;

    let n = 0;
    const target = cfg.maxStat;
    const step   = target / 30;
    const i = setInterval(() => {
      n = Math.min(n + step, target);
      setLiveStats((prev) => {
        const next = [...prev];
        next[currentStage - 1] = Math.round(n);
        return next;
      });
      if (n >= target) clearInterval(i);
    }, 60);
    return () => clearInterval(i);
  }, [currentStage]);

  return (
    <div className="flex flex-col items-center gap-8 py-12 px-6 max-w-lg mx-auto text-center">
      {/* Central orb */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-2 border-violet/30 flex items-center justify-center relative">
          {/* Triple rotating rings */}
          <div
            className="absolute inset-[-8px] rounded-full border border-violet/25 animate-spin"
            style={{ animationDuration: "3s" }}
          />
          <div
            className="absolute inset-[-16px] rounded-full border border-gold/15 animate-spin"
            style={{ animationDuration: "5s", animationDirection: "reverse" }}
          />
          <div
            className="absolute inset-[-24px] rounded-full border border-teal/12 animate-spin"
            style={{ animationDuration: "8s" }}
          />

          {/* Core */}
          <div className="w-16 h-16 rounded-full bg-violet/10 border border-violet/30 flex items-center justify-center animate-pulse-glow">
            <span className="text-2xl">⚖️</span>
          </div>
        </div>

        {/* Scan line */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet/70 to-transparent animate-scan" />
        </div>
      </div>

      {/* Status text */}
      <div className="space-y-1.5 min-h-[3.5rem]">
        <div className="text-text-primary font-display text-xl font-semibold">
          Analyzing Evidence{dots}
        </div>
        <div className="text-text-secondary text-sm font-body transition-all duration-300 min-h-[1.5rem]">
          {stageMsg || message}
        </div>
      </div>

      {/* Stage tracker */}
      <div className="w-full space-y-2.5">
        {STAGE_CONFIG.map((s) => {
          const isActive   = currentStage === s.stage;
          const isComplete = currentStage !== undefined && s.stage < currentStage;
          const isPending  = currentStage === undefined || s.stage > currentStage;
          const stat       = liveStats[s.stage - 1];

          return (
            <div
              key={s.stage}
              className="flex items-center gap-3 p-3 rounded-xl transition-all duration-500"
              style={{
                background: isActive ? `${s.color}10` : "transparent",
                border:     `1px solid ${isActive ? s.color + "40" : "#1e1e38"}`,
                opacity:    isPending ? 0.35 : 1,
              }}
            >
              {/* Icon node */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm transition-all duration-300"
                style={{
                  background: isComplete ? "#34d39918" : isActive ? `${s.color}18` : "#1e1e38",
                  border:     `1px solid ${isComplete ? "#34d399" : isActive ? s.color : "#2a2a50"}`,
                }}
              >
                {isComplete ? "✓" : s.icon}
              </div>

              {/* Info */}
              <div className="flex-1 text-left">
                <div
                  className="text-xs font-medium"
                  style={{ color: isActive ? s.color : isComplete ? "#34d399" : "#55536a" }}
                >
                  Stage {s.stage} · {s.label}
                </div>
                {isActive && (
                  <div className="text-xs text-text-muted font-mono mt-0.5">{s.description}</div>
                )}
              </div>

              {/* Live stat counter — NEW */}
              {(isActive || isComplete) && stat > 0 && (
                <div
                  className="text-xs font-mono px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    color:      isComplete ? "#34d399" : s.color,
                    background: isComplete ? "#34d39912" : `${s.color}12`,
                    border:     `1px solid ${isComplete ? "#34d39930" : s.color + "30"}`,
                  }}
                >
                  {stat} {s.statLabel}
                </div>
              )}

              {/* Active spinner */}
              {isActive && (
                <div
                  className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
                  style={{ borderColor: `${s.color}40`, borderTopColor: s.color }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full space-y-1.5">
        <div className="flex justify-between text-xs text-text-muted font-mono">
          <span>PIPELINE PROGRESS</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width:      `${progress}%`,
              background: "linear-gradient(90deg, #6C63FF, #D4A853, #2EC4B6)",
              boxShadow:  "0 0 8px rgba(108,99,255,0.4)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
