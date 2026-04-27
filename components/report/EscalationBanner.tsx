"use client";

import { useEffect, useState } from "react";
import { AlertOctagon, X, ExternalLink, ChevronRight, Siren } from "lucide-react";

interface EscalationBannerProps {
  riskScore: number;
  caseId: string;
  verdict: string;
}

const ESCALATION_LEVELS = {
  emergency: { threshold: 85, color: "#e8445a", label: "AUTO-ESCALATION TRIGGERED",   icon: "🚨", pulse: true  },
  high:      { threshold: 70, color: "#D4A853", label: "ESCALATION RECOMMENDED",       icon: "⚠️", pulse: false },
};

export function EscalationBanner({ riskScore, caseId, verdict }: EscalationBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [visible,   setVisible]   = useState(false);
  const [tick,      setTick]      = useState(true);

  const isEmergency = riskScore > ESCALATION_LEVELS.emergency.threshold;
  const level       = isEmergency ? ESCALATION_LEVELS.emergency : ESCALATION_LEVELS.high;

  useEffect(() => {
    if (riskScore <= 70) return;
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, [riskScore]);

  // Heartbeat tick for emergency
  useEffect(() => {
    if (!isEmergency) return;
    const i = setInterval(() => setTick((t) => !t), 800);
    return () => clearInterval(i);
  }, [isEmergency]);

  if (dismissed || riskScore <= 70) return null;

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all duration-700"
      style={{
        background:   `${level.color}08`,
        borderColor:  `${level.color}45`,
        opacity:      visible ? 1 : 0,
        transform:    visible ? "translateY(0)" : "translateY(12px)",
        boxShadow:    isEmergency && tick ? `0 0 30px ${level.color}25` : "none",
        transition:   visible
          ? "box-shadow 0.8s ease, opacity 0.7s ease, transform 0.7s ease"
          : "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      {/* Top accent strip */}
      <div
        className="h-0.5 w-full"
        style={{
          background: isEmergency
            ? `linear-gradient(90deg, transparent, ${level.color}, transparent)`
            : `linear-gradient(90deg, ${level.color}40, ${level.color}90, ${level.color}40)`,
          opacity: isEmergency && tick ? 1 : 0.6,
          transition: "opacity 0.8s ease",
        }}
      />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="relative flex-shrink-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
              style={{
                background: `${level.color}15`,
                border:     `1px solid ${level.color}35`,
              }}
            >
              {level.icon}
            </div>
            {isEmergency && (
              <div
                className="absolute inset-0 rounded-xl animate-ping-slow"
                style={{ background: `${level.color}20` }}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className="text-xs font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5"
                style={{
                  color:      level.color,
                  background: `${level.color}18`,
                  border:     `1px solid ${level.color}40`,
                }}
              >
                {isEmergency && <Siren size={9} className="animate-pulse" />}
                {level.label}
              </span>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{ color: level.color, background: `${level.color}10`, border: `1px solid ${level.color}25` }}
              >
                Risk {riskScore}/100
              </span>
            </div>

            {/* Title */}
            <h3 className="font-display font-bold text-text-primary text-base mb-1.5">
              {isEmergency
                ? "Immediate Official Action Required"
                : "Case Flagged for Priority Review"}
            </h3>

            {/* Description */}
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              {isEmergency
                ? `Risk Score ${riskScore}/100 exceeds critical threshold. Case `
                : `Risk Score ${riskScore}/100 exceeds escalation threshold. Case `}
              <span className="font-mono text-xs text-text-primary">{caseId}</span>
              {isEmergency
                ? " has been automatically flagged for urgent referral to the District Anti-Corruption Bureau and State Vigilance Commission."
                : " has been flagged for priority review by the District Collector and relevant department head."}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                className="flex items-center gap-1.5 text-xs font-mono px-3.5 py-2 rounded-lg transition-all duration-200 hover:opacity-80"
                style={{
                  background: `${level.color}18`,
                  color:      level.color,
                  border:     `1px solid ${level.color}40`,
                }}
              >
                <ExternalLink size={11} />
                {isEmergency ? "File Complaint Now" : "Initiate Formal Review"}
                <ChevronRight size={11} />
              </button>
              <button
                className="flex items-center gap-1.5 text-xs font-mono px-3.5 py-2 rounded-lg border border-border text-text-muted hover:text-text-secondary hover:border-border-bright transition-all duration-200"
              >
                Download Report PDF
              </button>
              {isEmergency && (
                <button
                  className="flex items-center gap-1.5 text-xs font-mono px-3.5 py-2 rounded-lg transition-all duration-200 hover:opacity-80"
                  style={{
                    background: "rgba(232,68,90,0.08)",
                    color:      "#e8445a",
                    border:     "1px solid rgba(232,68,90,0.30)",
                  }}
                >
                  <AlertOctagon size={11} />
                  Alert District Collector
                </button>
              )}
            </div>
          </div>

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="text-text-muted hover:text-text-secondary transition-colors flex-shrink-0 p-1"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
