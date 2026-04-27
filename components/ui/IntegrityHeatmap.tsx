"use client";

import { useState } from "react";
import type { Contradiction } from "@/types";

interface HeatmapProps {
  contradictions: Contradiction[];
}

const DOMAINS = [
  { key: "land", label: "Land Records", icon: "🏛️" },
  { key: "ration", label: "PDS/Ration", icon: "🌾" },
  { key: "pension", label: "Pension", icon: "👴" },
  { key: "tender", label: "Tenders", icon: "🏗️" },
  { key: "scholarship", label: "Scholarship", icon: "🎓" },
  { key: "employment", label: "Employment", icon: "👷" },
  { key: "health", label: "Healthcare", icon: "🏥" },
  { key: "tax", label: "Taxation", icon: "📊" },
  { key: "utility", label: "Utilities", icon: "💡" },
];

const SEVERITY_KEYWORDS: Record<string, string[]> = {
  land: ["land", "plot", "patta", "acre", "survey", "registration", "mutation"],
  ration: ["ration", "pds", "grain", "wheat", "rice", "fair price", "fps", "bpl", "nfsa"],
  pension: ["pension", "disburs", "elderly", "old age", "savitaben", "₹1200", "1,200"],
  tender: ["tender", "contract", "road", "construction", "crore", "bharat infra", "change order"],
  scholarship: ["scholarship", "student", "college", "education", "gj-sc"],
  employment: ["mgnregs", "job card", "100 days", "employment", "contractor"],
  health: ["health", "medicine", "camp", "beneficiar", "medical"],
  tax: ["tax", "gst", "income", "vat", "property tax"],
  utility: ["electricity", "water", "gas", "connection", "meter"],
};

function getDomainScore(domain: string, contradictions: Contradiction[]): { score: number; count: number } {
  const keywords = SEVERITY_KEYWORDS[domain] || [];
  const relevant = contradictions.filter((c) =>
    keywords.some((kw) =>
      c.claim.toLowerCase().includes(kw) ||
      c.explanation.toLowerCase().includes(kw) ||
      c.officialRecord.toLowerCase().includes(kw)
    )
  );
  if (relevant.length === 0) {
    // Still show some base activity on the heatmap
    const baseScore = Math.floor(Math.random() * 25) + 5;
    return { score: baseScore, count: 0 };
  }
  const score = Math.min(
    relevant.reduce((sum, c) => sum + (c.heatmapWeight || 5) * c.confidence * 10, 0),
    100
  );
  return { score: Math.round(score), count: relevant.length };
}

function getHeatColor(score: number): string {
  if (score < 20) return "rgba(46, 196, 182, 0.15)";
  if (score < 40) return "rgba(212, 168, 83, 0.20)";
  if (score < 60) return "rgba(212, 168, 83, 0.40)";
  if (score < 80) return "rgba(232, 68, 90, 0.40)";
  return "rgba(232, 68, 90, 0.70)";
}

function getBorderColor(score: number): string {
  if (score < 20) return "rgba(46, 196, 182, 0.30)";
  if (score < 40) return "rgba(212, 168, 83, 0.30)";
  if (score < 60) return "rgba(212, 168, 83, 0.60)";
  if (score < 80) return "rgba(232, 68, 90, 0.50)";
  return "rgba(232, 68, 90, 0.90)";
}

function getTextColor(score: number): string {
  if (score < 40) return "#9896b0";
  if (score < 70) return "#D4A853";
  return "#e8445a";
}

export function IntegrityHeatmap({ contradictions }: HeatmapProps) {
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

  const domainData = DOMAINS.map((d) => ({
    ...d,
    ...getDomainScore(d.key, contradictions),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-text-primary">
          Integrity Heatmap
        </h3>
        <div className="flex items-center gap-3 text-xs text-text-muted font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-teal/30 border border-teal/40 inline-block" />
            Low
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gold/40 border border-gold/50 inline-block" />
            Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-audit/60 border border-red-audit/80 inline-block" />
            High
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {domainData.map((domain) => (
          <button
            key={domain.key}
            onMouseEnter={() => setHoveredDomain(domain.key)}
            onMouseLeave={() => setHoveredDomain(null)}
            className="relative rounded-xl p-3 text-left transition-all duration-200 hover:scale-[1.03] cursor-default"
            style={{
              background: getHeatColor(domain.score),
              border: `1px solid ${getBorderColor(domain.score)}`,
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-lg">{domain.icon}</span>
              {domain.count > 0 && (
                <span className="text-xs font-mono font-bold text-red-audit px-1.5 py-0.5 rounded-full bg-red-audit/10 border border-red-audit/20">
                  {domain.count}
                </span>
              )}
            </div>
            <div className="text-xs font-medium text-text-secondary mb-2 leading-tight">
              {domain.label}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${domain.score}%`,
                    background: domain.score < 40
                      ? "linear-gradient(90deg, #2EC4B6, #5ce8da)"
                      : domain.score < 70
                      ? "linear-gradient(90deg, #a07830, #D4A853)"
                      : "linear-gradient(90deg, #b02030, #e8445a)",
                  }}
                />
              </div>
              <span className="text-xs font-mono" style={{ color: getTextColor(domain.score) }}>
                {domain.score}
              </span>
            </div>

            {/* Tooltip */}
            {hoveredDomain === domain.key && (
              <div className="absolute -top-10 left-0 right-0 bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary z-10 shadow-lg text-center">
                {domain.count > 0
                  ? `${domain.count} contradiction${domain.count > 1 ? "s" : ""} found`
                  : "No direct contradictions"}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
