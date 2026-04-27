import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function getSeverityColor(severity: string): string {
  const map: Record<string, string> = {
    critical: "#e8445a",
    high:     "#D4A853",
    medium:   "#6C63FF",
    low:      "#2EC4B6",
  };
  return map[severity] ?? "#6C63FF";
}

export function getVerdictEmoji(verdict: string): string {
  const map: Record<string, string> = {
    CONTRADICTION_FOUND: "🔴",
    VERIFIED:            "✅",
    INCONCLUSIVE:        "🟡",
  };
  return map[verdict] ?? "❓";
}
