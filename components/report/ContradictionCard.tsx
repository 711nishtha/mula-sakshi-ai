"use client";

import { useState, useRef, useEffect } from "react";
import type { Contradiction } from "@/types";
import { ChevronDown, AlertTriangle, Scale, Zap, GitBranch } from "lucide-react";
import { ReasoningTrace } from "./ReasoningTrace";

interface ContradictionCardProps {
  contradiction: Contradiction;
  index: number;
  initialExpanded?: boolean;
  animateTrace?: boolean;
}

const SEVERITY_CONFIG = {
  critical: { color: "#e8445a", bg: "#e8445a12", border: "#e8445a45", label: "CRITICAL", ring: "#e8445a30" },
  high:     { color: "#D4A853", bg: "#D4A85312", border: "#D4A85345", label: "HIGH",     ring: "#D4A85330" },
  medium:   { color: "#6C63FF", bg: "#6C63FF12", border: "#6C63FF45", label: "MEDIUM",   ring: "#6C63FF30" },
  low:      { color: "#2EC4B6", bg: "#2EC4B612", border: "#2EC4B645", label: "LOW",      ring: "#2EC4B630" },
};

const TYPE_LABELS: Record<string, string> = {
  direct_conflict:    "Direct Conflict",
  omission:           "Data Omission",
  fabrication:        "Potential Fabrication",
  date_mismatch:      "Date Mismatch",
  amount_discrepancy: "Amount Discrepancy",
  identity_fraud:     "Identity Fraud",
  policy_violation:   "Policy Violation",
};

// Animated highlight that pulses on contradiction reveal
function ContradictionHighlight({ children, color, animate }: { children: React.ReactNode; color: string; animate: boolean }) {
  const [pulsed, setPulsed] = useState(false);
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setPulsed(true), 600);
    return () => clearTimeout(t);
  }, [animate]);

  return (
    <span
      className="relative inline"
      style={{
        backgroundColor: pulsed ? `${color}18` : "transparent",
        borderRadius: "4px",
        padding: pulsed ? "1px 3px" : "0",
        transition: "background-color 0.6s ease, padding 0.3s ease",
      }}
    >
      {children}
    </span>
  );
}

export function ContradictionCard({
  contradiction,
  index,
  initialExpanded = false,
  animateTrace = false,
}: ContradictionCardProps) {
  const [expanded, setExpanded]   = useState(initialExpanded);
  const [showTrace, setShowTrace] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const config  = SEVERITY_CONFIG[contradiction.severity] ?? SEVERITY_CONFIG.medium;
  const confPct = Math.round(contradiction.confidence * 100);
  const hasTrace = contradiction.reasoningTrace && contradiction.reasoningTrace.length > 0;

  // When card expands, start trace after a short delay
  useEffect(() => {
    if (expanded && hasTrace) {
      const t = setTimeout(() => setShowTrace(true), 300);
      return () => clearTimeout(t);
    } else {
      setShowTrace(false);
    }
  }, [expanded, hasTrace]);

  return (
    <div
      ref={cardRef}
      className="rounded-2xl border overflow-hidden transition-all duration-300"
      style={{ background: config.bg, borderColor: config.border }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <button
        className="w-full flex items-center gap-4 p-5 text-left hover:opacity-90 transition-opacity"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Severity badge with subtle pulse ring */}
        <div className="relative flex-shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm z-10 relative"
            style={{ background: `${config.color}22`, color: config.color, border: `1px solid ${config.color}55` }}
          >
            #{index + 1}
          </div>
          {contradiction.severity === "critical" && (
            <div
              className="absolute inset-0 rounded-xl animate-ping-slow"
              style={{ background: config.ring }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
              style={{ color: config.color, background: `${config.color}18`, border: `1px solid ${config.color}40` }}
            >
              {config.label}
            </span>
            <span className="text-xs text-text-muted font-mono">
              {TYPE_LABELS[contradiction.contradictionType] ?? contradiction.contradictionType}
            </span>
            {hasTrace && (
              <span className="text-xs font-mono text-violet/70 flex items-center gap-1">
                <GitBranch size={9} />
                {contradiction.reasoningTrace!.length} steps
              </span>
            )}
            <span className="text-xs text-text-muted font-mono ml-auto">{confPct}% confidence</span>
          </div>
          <p className="text-sm text-text-primary font-body leading-snug line-clamp-2">
            {contradiction.claim}
          </p>
        </div>

        <ChevronDown
          size={16}
          className="text-text-muted flex-shrink-0 transition-transform duration-300"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {/* ── Expanded body ───────────────────────────────────────── */}
      {expanded && (
        <div
          className="border-t space-y-5 p-5"
          style={{ borderColor: config.border }}
        >
          {/* ── COMPARISON VIEW ── Citizen vs Official side-by-side */}
          <div>
            <div className="text-xs font-mono text-text-muted mb-2 tracking-widest uppercase">
              Contradiction Analysis
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Left — Citizen evidence */}
              <div className="rounded-xl p-4 border border-red-audit/20 bg-red-audit/5 relative overflow-hidden">
                {/* Animated left-border accent */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
                  style={{ background: "#e8445a", boxShadow: "0 0 8px #e8445a80" }}
                />
                <div className="flex items-center gap-2 mb-2.5 pl-2">
                  <AlertTriangle size={11} className="text-red-audit flex-shrink-0" />
                  <span className="text-xs font-mono text-red-audit font-semibold tracking-wide">
                    CITIZEN EVIDENCE
                  </span>
                </div>
                <p className="text-sm text-text-primary leading-relaxed pl-2">
                  <ContradictionHighlight color="#e8445a" animate={expanded}>
                    {contradiction.claim}
                  </ContradictionHighlight>
                </p>
              </div>

              {/* Right — Official record */}
              <div className="rounded-xl p-4 border border-violet/20 bg-violet/5 relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
                  style={{ background: "#6C63FF", boxShadow: "0 0 8px #6C63FF80" }}
                />
                <div className="flex items-center gap-2 mb-2.5 pl-2">
                  <Scale size={11} className="text-violet flex-shrink-0" />
                  <span className="text-xs font-mono text-violet font-semibold tracking-wide">
                    OFFICIAL RECORD
                  </span>
                </div>
                <p className="text-sm text-text-primary leading-relaxed pl-2">
                  <ContradictionHighlight color="#6C63FF" animate={expanded}>
                    {contradiction.officialRecord}
                  </ContradictionHighlight>
                </p>
              </div>
            </div>

            {/* Contradiction bridge indicator */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-px bg-gradient-to-r from-red-audit/40 via-transparent to-transparent" />
              <div
                className="text-xs font-mono px-2.5 py-1 rounded-full flex items-center gap-1.5"
                style={{
                  background: `${config.color}12`,
                  border:     `1px solid ${config.color}35`,
                  color:      config.color,
                }}
              >
                <Zap size={9} />
                {TYPE_LABELS[contradiction.contradictionType]}
              </div>
              <div className="flex-1 h-px bg-gradient-to-l from-violet/40 via-transparent to-transparent" />
            </div>
          </div>

          {/* ── AI Explanation ── */}
          <div className="rounded-xl p-4 bg-surface border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={11} className="text-gold" />
              <span className="text-xs font-mono text-gold font-semibold tracking-wide">AI FORENSIC ANALYSIS</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{contradiction.explanation}</p>
          </div>

          {/* ── REASONING TRACE ── NEW */}
          {hasTrace && showTrace && (
            <div className="rounded-xl p-4 border border-border bg-surface">
              <ReasoningTrace
                steps={contradiction.reasoningTrace!}
                animate={animateTrace}
                delayMs={100}
              />
            </div>
          )}

          {/* ── Legal implication ── */}
          <div
            className="rounded-xl p-4"
            style={{ background: `${config.color}08`, border: `1px solid ${config.color}30` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-semibold" style={{ color: config.color }}>
                ⚖️ LEGAL IMPLICATION
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: `${config.color}dd` }}>
              {contradiction.legalImplication}
            </p>
          </div>

          {/* ── Confidence bar ── */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted font-mono flex-shrink-0">AI CONFIDENCE</span>
            <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${confPct}%`,
                  background: `linear-gradient(90deg, ${config.color}99, ${config.color})`,
                  boxShadow: `0 0 6px ${config.color}60`,
                }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: config.color }}>{confPct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
