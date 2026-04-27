"use client";

import { useEffect, useRef, useState } from "react";

interface ScoreMeterProps {
  score: number;
  label: string;
  sublabel?: string;
  size?: number;
  colorType?: "contradiction" | "confidence" | "risk";
  animate?: boolean;
  showGlowRing?: boolean;
}

const COLOR_MAP = {
  contradiction: {
    low:    { stroke: "#34d399", glow: "#34d39940", text: "Low" },
    medium: { stroke: "#D4A853", glow: "#D4A85340", text: "Medium" },
    high:   { stroke: "#e8445a", glow: "#e8445a40", text: "High"   },
  },
  confidence: {
    low:    { stroke: "#e8445a", glow: "#e8445a40", text: "Low"    },
    medium: { stroke: "#D4A853", glow: "#D4A85340", text: "Medium" },
    high:   { stroke: "#34d399", glow: "#34d39940", text: "High"   },
  },
  risk: {
    low:    { stroke: "#34d399", glow: "#34d39940", text: "Low"    },
    medium: { stroke: "#D4A853", glow: "#D4A85340", text: "Medium" },
    high:   { stroke: "#e8445a", glow: "#e8445a40", text: "High"   },
  },
};

function getBracket(score: number): "low" | "medium" | "high" {
  if (score < 35) return "low";
  if (score < 65) return "medium";
  return "high";
}

export function ScoreMeter({
  score,
  label,
  sublabel,
  size = 160,
  colorType = "contradiction",
  animate = true,
  showGlowRing = true,
}: ScoreMeterProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const [arcReady,     setArcReady]     = useState(!animate);
  const [glowActive,   setGlowActive]   = useState(false);

  const radius       = (size / 2) * 0.72;
  const strokeWidth  = Math.max(8, size * 0.062);
  const circumference = 2 * Math.PI * radius;
  const bracket      = getBracket(score);
  const colors       = COLOR_MAP[colorType][bracket];
  const filterId     = `glow-${colorType}-${bracket}-${Math.round(score)}`;

  // Animate counter + arc
  useEffect(() => {
    if (!animate) return;

    // Short delay so parent reveal transition finishes first
    const startTimer = setTimeout(() => {
      setArcReady(true);

      let current = 0;
      const totalFrames = 70;
      const increment   = score / totalFrames;

      const tick = () => {
        current = Math.min(current + increment, score);
        setDisplayScore(Math.round(current));
        if (current < score) requestAnimationFrame(tick);
        else setGlowActive(true); // activate outer glow ring when count finishes
      };
      requestAnimationFrame(tick);
    }, 350);

    return () => clearTimeout(startTimer);
  }, [score, animate]);

  const progress = (displayScore / 100) * circumference;
  const offset   = circumference - progress;

  const outerR   = radius + strokeWidth * 1.4;
  const outerC   = 2 * Math.PI * outerR;
  const outerOff = outerC - (displayScore / 100) * outerC;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          <defs>
            {/* Inner arc glow */}
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Outer ring glow */}
            <filter id={`${filterId}-outer`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer pulsing glow ring — NEW: appears after animation completes */}
          {showGlowRing && (
            <>
              {/* Track */}
              <circle
                cx={size / 2} cy={size / 2} r={outerR}
                fill="none"
                stroke={colors.glow}
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.3}
              />
              {/* Progress arc */}
              <circle
                cx={size / 2} cy={size / 2} r={outerR}
                fill="none"
                stroke={colors.stroke}
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray={outerC}
                strokeDashoffset={arcReady ? outerOff : outerC}
                opacity={glowActive ? 0.55 : 0}
                filter={`url(#${filterId}-outer)`}
                style={{
                  transition: arcReady
                    ? "stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease"
                    : "none",
                }}
              />
            </>
          )}

          {/* Background track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="#1e1e38"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Progress arc */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={arcReady ? offset : circumference}
            filter={`url(#${filterId})`}
            style={{
              transition: arcReady
                ? "stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
                : "none",
            }}
          />
        </svg>

        {/* Center number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono font-black tabular-nums leading-none"
            style={{ fontSize: size * 0.22, color: colors.stroke }}
          >
            {displayScore}
          </span>
          <span className="font-mono text-text-muted" style={{ fontSize: size * 0.085 }}>
            / 100
          </span>
          {glowActive && (
            <span
              className="font-mono font-semibold mt-0.5"
              style={{ fontSize: size * 0.075, color: `${colors.stroke}bb` }}
            >
              {colors.text}
            </span>
          )}
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <div className="text-sm font-medium text-text-secondary font-body">{label}</div>
        {sublabel && <div className="text-xs text-text-muted font-mono mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
}
