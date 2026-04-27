"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Shield, Eye, FileText, ChevronRight, Lock, Zap, Globe, BarChart3, Users, AlertTriangle } from "lucide-react";

const TAGLINE_WORDS = ["Contradictions.", "Discrepancies.", "Fabrications.", "Anomalies."];

const STATS = [
  { value: "3", suffix: "-Stage", label: "Gemini AI Pipeline" },
  { value: "70", suffix: "+", label: "Synthetic Witnesses" },
  { value: "100", suffix: "%", label: "Google Stack" },
  { value: "0", suffix: "-Trust", label: "Verification Model" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: FileText,
    title: "Submit Evidence",
    description: "Upload images, documents, or describe your evidence in text. Our system accepts any medium.",
    color: "#6C63FF",
  },
  {
    step: "02",
    icon: Zap,
    title: "3-Stage AI Analysis",
    description: "Gemini 1.5 Pro runs claim extraction, cross-references against government records, then generates a legal verdict.",
    color: "#D4A853",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Audit Report",
    description: "Receive a contradiction score, integrity heatmap, and legal-grade report with actionable escalation path.",
    color: "#2EC4B6",
  },
];

export default function HomePage() {
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [taglineVisible, setTaglineVisible] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineVisible(false);
      setTimeout(() => {
        setTaglineIdx((i) => (i + 1) % TAGLINE_WORDS.length);
        setTaglineVisible(true);
      }, 350);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-obsidian text-text-primary overflow-x-hidden">
      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 border-b border-border/50 glass-panel">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-gold/50 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-gold rounded-full animate-pulse-glow" />
          </div>
          <span className="font-display text-lg font-bold tracking-wide">
            Mūla <span className="gold-gradient-text">Śākṣī</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary font-body">
          <a href="#how" className="hover:text-text-primary transition-colors duration-200">How It Works</a>
          <a href="#tech" className="hover:text-text-primary transition-colors duration-200">Technology</a>
          <a href="#impact" className="hover:text-text-primary transition-colors duration-200">Impact</a>
        </div>
        <Link
          href="/submit"
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gold/10 border border-gold/30 rounded-full text-gold hover:bg-gold/20 hover:border-gold/60 transition-all duration-200 glow-gold"
        >
          Submit Evidence <ChevronRight size={14} />
        </Link>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-6 md:px-10 flex flex-col items-center text-center min-h-screen justify-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(108, 99, 255, 0.07) 0%, transparent 70%)" }}
        />

        {/* Badge */}
        <div className="animate-reveal stagger-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet/30 bg-violet/5 text-violet text-xs font-mono tracking-widest uppercase mb-8">
          <Zap size={10} />
          Google Solution Challenge 2026 · Zero-Trust AI Audit
        </div>

        {/* Title */}
        <h1 className="animate-reveal stagger-2 font-display text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-6">
          <span className="block text-text-primary mb-2">Expose the</span>
          <span
            className="block gold-gradient-text text-glow-gold transition-all duration-300"
            style={{ opacity: taglineVisible ? 1 : 0, transform: taglineVisible ? "translateY(0)" : "translateY(8px)" }}
          >
            {TAGLINE_WORDS[taglineIdx]}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="animate-reveal stagger-3 max-w-2xl text-text-secondary text-lg leading-relaxed mb-12 font-body">
          Mūla Śākṣī is a zero-trust AI audit system that cross-references citizen-submitted evidence
          against government records — surfacing contradictions, scoring integrity, and generating
          legal-grade audit reports using a 3-stage Gemini pipeline.
        </p>

        {/* CTAs */}
        <div className="animate-reveal stagger-4 flex flex-col sm:flex-row gap-4 items-center mb-20">
          <Link
            href="/submit"
            className="group flex items-center gap-3 px-8 py-4 bg-gold text-obsidian font-bold rounded-full hover:bg-gold-bright transition-all duration-200 glow-gold text-sm"
          >
            <Shield size={17} />
            Submit Evidence
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/submit?demo=true"
            className="flex items-center gap-3 px-8 py-4 bg-surface border border-border rounded-full text-text-secondary hover:text-text-primary hover:border-border-bright transition-all duration-200 text-sm font-medium"
          >
            <Eye size={17} />
            View Demo Report
          </Link>
        </div>

        {/* Stats */}
        <div
          ref={statsRef}
          className="animate-reveal stagger-5 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl"
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 text-center transition-all duration-300 hover:border-border-bright"
              style={{ background: "#12121f", border: "1px solid #1e1e38" }}
            >
              <div className="font-display text-3xl font-black gold-gradient-text mb-1">
                {stat.value}
                <span className="text-xl">{stat.suffix}</span>
              </div>
              <div className="text-xs text-text-muted font-body">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-pulse-glow">
          <span className="text-xs text-text-muted font-mono tracking-widest uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-border to-transparent" />
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────── */}
      <section id="how" className="py-28 px-6 md:px-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet/30 bg-violet/5 text-violet text-xs font-mono mb-4">
            THE PROCESS
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary">
            How <span className="violet-gradient-text">Mūla Śākṣī</span> Works
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={i}
              className="rounded-2xl p-7 border border-border hover:border-border-bright transition-all duration-300 group"
              style={{ background: "#12121f" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="font-mono text-xs text-text-muted">{step.step}</span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ background: step.color + "15", border: `1px solid ${step.color}30` }}
                >
                  <step.icon size={18} style={{ color: step.color }} />
                </div>
              </div>
              <h3 className="font-display text-xl font-bold text-text-primary mb-3">{step.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed font-body">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Pipeline ──────────────────────────────────────────── */}
      <section id="tech" className="py-28 px-6 md:px-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-mono mb-4">
            UNDER THE HOOD
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary">
            The <span className="gold-gradient-text">Gemini Pipeline</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-12 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px bg-gradient-to-r from-violet via-gold to-teal hidden md:block" />

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                stage: "Stage 1", color: "#6C63FF", icon: "🔍",
                title: "Claim Extraction",
                points: ["Entity recognition", "Quantity extraction", "Location tagging", "Confidence scoring"],
                output: "Structured JSON claims",
              },
              {
                stage: "Stage 2", color: "#D4A853", icon: "⚡",
                title: "Contradiction Engine",
                points: ["Gov record cross-ref", "70-witness consensus", "Severity classification", "Legal implication"],
                output: "Contradiction matrix",
              },
              {
                stage: "Stage 3", color: "#2EC4B6", icon: "📋",
                title: "Report Generator",
                points: ["Legal verdict draft", "Risk score (0–100)", "Action recommendations", "Escalation trigger"],
                output: "Legal-grade audit report",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-2xl border p-7 transition-all duration-300 hover:scale-[1.02]"
                style={{ background: s.color + "08", borderColor: s.color + "30" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl" style={{ background: s.color + "15", border: `1px solid ${s.color}30` }}>
                    {s.icon}
                  </div>
                  <div>
                    <div className="text-xs font-mono" style={{ color: s.color }}>{s.stage}</div>
                    <div className="font-display font-bold text-text-primary">{s.title}</div>
                  </div>
                </div>
                <ul className="space-y-2 mb-5">
                  {s.points.map((p, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="text-xs font-mono px-3 py-1.5 rounded-full inline-block" style={{ background: s.color + "15", color: s.color, border: `1px solid ${s.color}30` }}>
                  → {s.output}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Impact ────────────────────────────────────────────────── */}
      <section id="impact" className="py-28 px-6 md:px-10 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-border p-10 md:p-16 text-center relative overflow-hidden" style={{ background: "#12121f" }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(212, 168, 83, 0.05) 0%, transparent 70%)"
          }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-mono">
              <AlertTriangle size={10} />
              THE PROBLEM WE SOLVE
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Corruption is systemic.<br />
              <span className="gold-gradient-text">Detection should be too.</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed mb-10 font-body">
              India loses billions annually to PDS fraud, land record manipulation, and ghost beneficiaries.
              Citizens lack tools to prove what they see. Mūla Śākṣī changes that — giving anyone the power
              to submit evidence and receive an AI-validated, legally-grounded contradiction analysis.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              {[
                { icon: "🌾", stat: "₹36,000 Cr", label: "Lost to PDS diversion annually" },
                { icon: "🏛️", stat: "40%+", label: "Land records with discrepancies" },
                { icon: "👻", stat: "Crores", label: "Ghost scholarship beneficiaries" },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-5 border border-border" style={{ background: "#0d0d1a" }}>
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-display text-2xl font-bold gold-gradient-text">{item.stat}</div>
                  <div className="text-xs text-text-muted mt-1 font-body">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA strip ─────────────────────────────────────────────── */}
      <section className="py-16 px-6 md:px-10 flex flex-col items-center text-center border-t border-border">
        <h2 className="font-display text-3xl font-bold text-text-primary mb-4">
          Have evidence of irregularity?
        </h2>
        <p className="text-text-secondary mb-8 max-w-md font-body">
          Submit it now. The AI analyses it in seconds and produces a legally-sound audit report.
        </p>
        <Link
          href="/submit"
          className="group flex items-center gap-3 px-10 py-4 bg-gold text-obsidian font-bold rounded-full hover:bg-gold-bright transition-all duration-200 glow-gold text-sm"
        >
          <Shield size={18} />
          Start Analysis
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 md:px-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border border-gold/40 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-gold rounded-full" />
          </div>
          <span className="text-sm font-display font-semibold text-text-secondary">
            Mūla <span className="gold-gradient-text">Śākṣī</span>
          </span>
        </div>
        <div className="text-xs text-text-muted font-body text-center">
          Google Solution Challenge 2026 · Built with Gemini 1.5 Pro · Firebase · Next.js
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-body">
          <Lock size={10} />
          Zero-Trust · Privacy-First
        </div>
      </footer>
    </div>
  );
}
