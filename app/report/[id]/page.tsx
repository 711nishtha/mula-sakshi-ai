"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, Clock, AlertTriangle, CheckCircle, HelpCircle, Download, Share2 } from "lucide-react";
import { ScoreMeter } from "@/components/ui/ScoreMeter";
import { IntegrityHeatmap } from "@/components/ui/IntegrityHeatmap";
import { ContradictionCard } from "@/components/report/ContradictionCard";
import { EscalationBanner } from "@/components/report/EscalationBanner";
import { VerdictStamp } from "@/components/report/VerdictStamp";
import type { AuditReport } from "@/types";
import { DEMO_REPORT } from "@/lib/demoData";

type LoadState = "loading" | "polling" | "ready" | "error";

const VERDICT_CONFIG = {
  CONTRADICTION_FOUND: {
    icon: AlertTriangle,
    label: "Contradiction Found",
    color: "#e8445a",
    bg: "rgba(232, 68, 90, 0.08)",
    border: "rgba(232, 68, 90, 0.35)",
  },
  VERIFIED: {
    icon: CheckCircle,
    label: "Verified — No Contradiction",
    color: "#34d399",
    bg: "rgba(52, 211, 153, 0.08)",
    border: "rgba(52, 211, 153, 0.35)",
  },
  INCONCLUSIVE: {
    icon: HelpCircle,
    label: "Inconclusive",
    color: "#D4A853",
    bg: "rgba(212, 168, 83, 0.08)",
    border: "rgba(212, 168, 83, 0.35)",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" });
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [report, setReport] = useState<AuditReport | null>(null);
  const [showStamp, setShowStamp] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    if (id === "demo" || id === "MS-DEMO001") {
      setReport(DEMO_REPORT);
      setLoadState("ready");
      setShowStamp(true);
      return;
    }

    let attempts = 0;
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${id}`);
        if (!res.ok) {
          if (res.status === 404 && attempts < 3) {
            attempts++;
            setTimeout(fetchReport, 1500);
            return;
          }
          throw new Error("Report not found");
        }
        const data = await res.json();
        const submission = data.submission;
        if (!submission) throw new Error("Empty response");

        if (submission.status === "complete" && submission.report) {
          setReport(submission.report);
          setLoadState("ready");
          setShowStamp(true);
          return;
        }
        if (submission.status === "error") throw new Error(submission.error || "Analysis failed");

        if (attempts < 40) {
          attempts++;
          setLoadState("polling");
          setTimeout(fetchReport, 2500);
        } else {
          throw new Error("Timed out waiting for analysis");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoadState("error");
      }
    }
    fetchReport();
  }, [id]);

  if (loadState === "loading" || loadState === "polling") {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-2 border-violet/30 border-t-violet animate-spin mx-auto" />
          <p className="text-text-secondary font-body">
            {loadState === "polling" ? "Waiting for analysis…" : "Loading report…"}
          </p>
        </div>
      </div>
    );
  }

  if (loadState === "error" || !report) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center px-6">
        <div className="text-center space-y-5 max-w-md">
          <div className="text-5xl">⚠️</div>
          <h1 className="font-display text-2xl font-bold text-text-primary">Report Unavailable</h1>
          <p className="text-text-secondary font-body">{error || "This report could not be found."}</p>
          <Link href="/submit" className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-obsidian font-semibold rounded-full text-sm">
            Submit New Evidence
          </Link>
        </div>
      </div>
    );
  }

  const vcfg = VERDICT_CONFIG[report.verdict] || VERDICT_CONFIG.INCONCLUSIVE;
  const VIcon = vcfg.icon;
  const totalDuration = report.processingStages.reduce((s, p) => s + (p.durationMs || 0), 0);

  return (
    <div className="min-h-screen bg-obsidian text-text-primary">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 border-b border-border/50 glass-panel">
        <Link href="/" className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft size={16} />
          <span className="font-display text-sm">Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-gold" />
          <span className="text-xs font-mono text-text-muted">AUDIT REPORT</span>
        </div>
        <button
          id="share-btn"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href).then(() => {
              const btn = document.getElementById("share-btn");
              if (btn) { btn.textContent = "✓ Copied!"; setTimeout(() => { btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share'; }, 2000); }
            });
          }}
          className="flex items-center gap-2 text-xs font-mono text-text-muted hover:text-text-secondary transition-colors"
        >
          <Share2 size={13} />Share
        </button>
      </nav>

      {/* Verdict Stamp — cinematic reveal before full report */}
      {showStamp && report && (
        <VerdictStamp
          verdict={report.verdict}
          contradictionScore={report.contradictionScore}
          caseId={report.caseId}
          onComplete={() => {
            setShowStamp(false);
            setTimeout(() => setRevealed(true), 100);
          }}
        />
      )}

      <div className="pt-24 pb-20 px-4 md:px-6 max-w-5xl mx-auto">
        {/* Header card */}
        <div
          className="rounded-3xl border p-8 md:p-10 mb-6 transition-all duration-700"
          style={{ background: vcfg.bg, borderColor: vcfg.border, opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(24px)" }}
        >
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4 flex-wrap text-xs font-mono text-text-muted">
                <span>{report.caseId}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock size={10} />{formatDate(report.timestamp)}</span>
                {totalDuration > 0 && <><span>·</span><span>{(totalDuration / 1000).toFixed(1)}s pipeline</span></>}
              </div>

              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-5"
                style={{ background: vcfg.color + "15", border: `1px solid ${vcfg.color}40`, color: vcfg.color }}>
                <VIcon size={16} />
                <span className="font-mono font-bold text-sm">{vcfg.label}</span>
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-black text-text-primary mb-4">AI Audit Report</h1>
              <p className="text-text-secondary font-body leading-relaxed">{report.summary}</p>
            </div>

            <div className="flex gap-5 justify-center flex-shrink-0">
              <ScoreMeter score={report.contradictionScore} label="Contradiction" sublabel="evidence vs records" size={115} colorType="contradiction" animate={revealed} />
              <ScoreMeter score={Math.round(report.overallConfidence * 100)} label="AI Confidence" sublabel="pipeline certainty" size={115} colorType="confidence" animate={revealed} />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-3 gap-3">
            {report.processingStages.map((s) => (
              <div key={s.stage} className="text-center">
                <div className="text-xs text-green-audit font-mono mb-0.5">✓ Stage {s.stage}</div>
                <div className="text-xs text-text-muted">{s.name}</div>
                {s.durationMs && <div className="text-xs font-mono text-text-muted">{(s.durationMs / 1000).toFixed(1)}s</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Escalation */}
        {report.escalationTriggered && (
          <div className="mb-6 transition-all duration-700" style={{ opacity: revealed ? 1 : 0, transitionDelay: "100ms" }}>
            <EscalationBanner riskScore={report.riskScore} caseId={report.caseId} verdict={report.verdict} />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: contradictions + claims + legal */}
          <div className="lg:col-span-2 space-y-6">

            {/* Contradictions */}
            <div style={{ opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(24px)", transition: "all 0.7s 0.2s" }}>
              <h2 className="font-display text-xl font-bold text-text-primary mb-4">
                Contradictions Detected
                {report.contradictions.length > 0 && <span className="ml-2 text-sm font-mono text-red-audit">({report.contradictions.length})</span>}
              </h2>
              {report.contradictions.length === 0 ? (
                <div className="rounded-2xl border border-green-audit/30 bg-green-audit/5 p-8 text-center">
                  <CheckCircle size={32} className="text-green-audit mx-auto mb-3" />
                  <p className="text-text-primary font-display font-semibold mb-1">No Contradictions Found</p>
                  <p className="text-text-secondary text-sm">Evidence appears consistent with available records.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {report.contradictions.map((c, i) => (
                    <div key={c.claimId + i} style={{ transition: `all 0.5s ${300 + i * 100}ms`, opacity: revealed ? 1 : 0 }}>
                      <ContradictionCard contradiction={c} index={i} initialExpanded={i === 0} animateTrace={i === 0 && revealed} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Claims */}
            <div style={{ opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(24px)", transition: "all 0.7s 0.3s" }}>
              <h2 className="font-display text-xl font-bold text-text-primary mb-4">
                Extracted Claims <span className="text-sm font-mono text-text-muted">({report.claims.length})</span>
              </h2>
              <div className="rounded-2xl border border-border overflow-hidden" style={{ background: "#12121f" }}>
                {report.claims.map((claim, i) => (
                  <div key={claim.id} className={`flex items-start gap-4 p-4 ${i !== report.claims.length - 1 ? "border-b border-border" : ""}`}>
                    <div className="w-8 h-8 rounded-lg bg-violet/10 border border-violet/20 flex items-center justify-center flex-shrink-0 text-xs font-mono text-violet">
                      {claim.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface border border-border text-text-muted capitalize">{claim.type}</span>
                        {claim.entity && <span className="text-xs text-text-muted truncate">{claim.entity}</span>}
                        <span className="ml-auto text-xs font-mono text-text-muted">{Math.round(claim.confidence * 100)}%</span>
                      </div>
                      <p className="text-sm text-text-primary">{claim.content}</p>
                      {claim.sourceQuote && claim.sourceQuote !== claim.content && (
                        <p className="text-xs text-text-muted font-mono mt-1 italic truncate">&ldquo;{claim.sourceQuote}&rdquo;</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal notice */}
            <div style={{ opacity: revealed ? 1 : 0, transition: "all 0.7s 0.4s", background: "#0d0d1a" }}
              className="rounded-2xl border border-border p-6">
              <div className="text-xs font-mono text-gold mb-3">⚖️ LEGAL NOTICE</div>
              <p className="text-xs text-text-secondary leading-relaxed">{report.legalNotice}</p>
            </div>
          </div>

          {/* Right: scores + heatmap + witnesses */}
          <div className="space-y-6">
            {/* Risk score */}
            <div style={{ opacity: revealed ? 1 : 0, transition: "all 0.7s 0.1s", background: "#12121f" }}
              className="rounded-2xl border border-border p-6">
              <div className="flex justify-center mb-2">
                <ScoreMeter score={report.riskScore} label="Risk Score" sublabel="escalation threshold" size={140} colorType="risk" animate={revealed} />
              </div>
              <div className={`text-center text-xs font-mono mt-2 ${report.riskScore > 70 ? "text-red-audit" : report.riskScore > 40 ? "text-gold" : "text-green-audit"}`}>
                {report.riskScore > 70 ? "HIGH — Escalation Recommended" : report.riskScore > 40 ? "MODERATE — Investigation Needed" : "LOW RISK"}
              </div>
            </div>

            {/* Heatmap */}
            <div style={{ opacity: revealed ? 1 : 0, transition: "all 0.7s 0.2s", background: "#12121f" }}
              className="rounded-2xl border border-border p-6">
              <IntegrityHeatmap contradictions={report.contradictions} />
            </div>

            {/* Recommendation */}
            <div style={{ opacity: revealed ? 1 : 0, transition: "all 0.7s 0.3s", background: "rgba(212, 168, 83, 0.05)" }}
              className="rounded-2xl border border-gold/20 p-6">
              <div className="text-xs font-mono text-gold mb-3">📋 RECOMMENDED ACTION</div>
              <p className="text-sm text-text-secondary leading-relaxed">{report.recommendation}</p>
            </div>

            {/* Witnesses */}
            {report.witnessCorroboration.length > 0 && (
              <div style={{ opacity: revealed ? 1 : 0, transition: "all 0.7s 0.4s", background: "#12121f" }}
                className="rounded-2xl border border-border p-6">
                <h3 className="font-display text-base font-bold text-text-primary mb-4">Witness Corroboration</h3>
                <div className="space-y-3">
                  {report.witnessCorroboration.map((w) => (
                    <div key={w.witnessId} className="rounded-xl p-3 border border-border bg-surface">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-text-muted">{w.alias}</span>
                        <span className={`text-xs font-mono ${w.corroborates ? "text-red-audit" : "text-green-audit"}`}>
                          {w.corroborates ? "Contradicts" : "Supports"}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">{w.statement}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1 rounded-full bg-border">
                          <div className="h-full rounded-full bg-violet/60" style={{ width: `${Math.round(w.credibilityScore * 100)}%` }} />
                        </div>
                        <span className="text-xs font-mono text-text-muted">{Math.round(w.credibilityScore * 100)}%</span>
                      </div>
                      <div className="text-xs text-text-muted mt-1 font-mono">{w.region}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ opacity: revealed ? 1 : 0, transition: "all 0.7s 0.5s" }} className="space-y-2">
              <Link href="/submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gold text-obsidian font-bold rounded-xl text-sm hover:bg-gold-bright transition-all">
                Submit New Evidence
              </Link>
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 border border-border text-text-secondary rounded-xl text-sm hover:border-border-bright hover:text-text-primary transition-all">
                <Download size={15} />Download Report (PDF)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
