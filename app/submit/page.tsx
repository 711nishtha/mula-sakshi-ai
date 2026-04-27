"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { Upload, FileText, ChevronRight, ArrowLeft, X, Zap, Shield } from "lucide-react";
import { ProcessingAnimation } from "@/components/ui/ProcessingAnimation";
import { DEMO_CASES } from "@/lib/demoData";
import type { AnalysisPhase, AnalysisState } from "@/types";

const CATEGORIES = [
  "Land Records",
  "Public Distribution (PDS/Ration)",
  "Pension & Social Welfare",
  "Government Tenders",
  "Scholarship & Education",
  "Employment (MGNREGS)",
  "Healthcare",
  "Other",
];

const STAGE_MESSAGES: Record<string, string> = {
  uploading: "Uploading evidence securely…",
  stage1:    "Stage 1: Extracting claims from evidence…",
  stage2:    "Stage 2: Cross-referencing government records…",
  stage3:    "Stage 3: Generating legal audit report…",
  complete:  "Analysis complete. Preparing your report…",
  error:     "An error occurred during analysis.",
};

const STAGE_PROGRESS: Record<string, number> = {
  idle: 0, uploading: 8, stage1: 28, stage2: 62, stage3: 88, complete: 100, error: 0,
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function SubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get("demo") === "true";

  const [evidenceText, setEvidenceText] = useState("");
  const [category, setCategory]         = useState(CATEGORIES[0]);
  const [file, setFile]                 = useState<File | null>(null);
  const [filePreview, setFilePreview]   = useState<string | null>(null);
  const [analysis, setAnalysis]         = useState<AnalysisState>({
    phase: "idle", progress: 0, message: "",
  });

  useEffect(() => {
    if (isDemoMode) {
      const demo = DEMO_CASES[0];
      setEvidenceText(demo.description);
      setCategory(demo.category);
    }
  }, [isDemoMode]);

  const onDrop = useCallback((accepted: File[]) => {
    if (!accepted[0]) return;
    const f = accepted[0];
    setFile(f);
    if (f.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(f));
    } else {
      setFilePreview(null);
    }
    toast.success(`File attached: ${f.name}`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [], "audio/*": [] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
  });

  async function fileToBase64(f: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  }

  function advanceStage(phase: AnalysisPhase) {
    setAnalysis({
      phase,
      progress: STAGE_PROGRESS[phase] ?? 0,
      message: STAGE_MESSAGES[phase] ?? "",
      currentStage: phase === "stage1" ? 1 : phase === "stage2" ? 2 : phase === "stage3" ? 3 : undefined,
    });
  }

  async function handleSubmit() {
    if (evidenceText.trim().length < 30) {
      toast.error("Please provide at least 30 characters of evidence description.");
      return;
    }

    try {
      advanceStage("uploading");

      // Create submission record
      const subRes = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidenceText, category }),
      });
      const subData = await subRes.json();
      if (!subRes.ok) throw new Error(subData.error || "Submission failed");
      const { submissionId } = subData;

      // Media
      let mediaBase64: string | undefined;
      let mediaMimeType: string | undefined;
      if (file) {
        mediaBase64   = await fileToBase64(file);
        mediaMimeType = file.type;
      }

      // Stage 1
      advanceStage("stage1");
      await sleep(700);

      // Call analyze
      advanceStage("stage2");
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          evidenceText,
          mediaBase64,
          mediaMimeType,
          demoMode: isDemoMode,
        }),
      });

      advanceStage("stage3");
      await sleep(600);

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || "Analysis failed");

      advanceStage("complete");
      await sleep(800);

      toast.success("Analysis complete!");
      router.push(`/report/${submissionId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Error: ${message}`);
      setAnalysis({ phase: "error", progress: 0, message });
    }
  }

  const isProcessing = ["uploading", "stage1", "stage2", "stage3", "complete"].includes(analysis.phase);

  return (
    <div className="min-h-screen bg-obsidian text-text-primary">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 border-b border-border/50 glass-panel">
        <Link href="/" className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft size={16} />
          <span className="font-display text-sm">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-audit animate-pulse" />
          <span className="text-xs font-mono text-text-muted">SECURE · ZERO-TRUST</span>
        </div>
        <span className="font-display text-sm font-bold">
          Mūla <span className="gold-gradient-text">Śākṣī</span>
        </span>
      </nav>

      <div className="pt-24 pb-16 px-6 md:px-10 max-w-3xl mx-auto">
        {isProcessing ? (
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-lg rounded-3xl border border-border p-2" style={{ background: "#12121f" }}>
              <ProcessingAnimation
                phase={analysis.phase}
                currentStage={analysis.currentStage}
                message={analysis.message}
                progress={analysis.progress}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-10">
              {isDemoMode && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-mono mb-5">
                  <Zap size={10} />
                  DEMO MODE — Pre-filled with sample case
                </div>
              )}
              <h1 className="font-display text-4xl md:text-5xl font-black text-text-primary mb-3">
                Submit <span className="gold-gradient-text">Evidence</span>
              </h1>
              <p className="text-text-secondary font-body leading-relaxed">
                Describe the contradiction you&apos;ve observed. Our AI cross-references it against government records and produces a legal-grade audit report.
              </p>
            </div>

            {/* Demo selectors */}
            {isDemoMode && (
              <div className="mb-6 p-5 rounded-2xl border border-violet/30 bg-violet/5">
                <p className="text-xs font-mono text-violet mb-3">QUICK DEMO — Select a case:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEMO_CASES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setEvidenceText(c.description); setCategory(c.category); }}
                      className="text-left text-xs p-3 rounded-xl border border-border hover:border-violet/40 hover:bg-violet/5 transition-all text-text-secondary hover:text-text-primary"
                    >
                      <span className="font-mono text-violet block mb-0.5">{c.category}</span>
                      {c.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-5">
              {/* Category */}
              <div>
                <label className="block text-xs font-mono text-text-muted mb-2 tracking-widest uppercase">Category</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm font-body text-text-primary border border-border bg-surface focus:outline-none focus:border-violet/60 transition-colors appearance-none"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Evidence text */}
              <div>
                <label className="block text-xs font-mono text-text-muted mb-2 tracking-widest uppercase">
                  Evidence Description *
                </label>
                <textarea
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  rows={9}
                  placeholder="Describe the discrepancy in detail. Include: document numbers, dates, amounts, names of officials or entities involved, and what the official record says vs. what you observed…"
                  className="w-full rounded-xl px-5 py-4 text-sm font-body text-text-primary border border-border bg-surface focus:outline-none focus:border-violet/60 transition-colors resize-none leading-relaxed placeholder-text-muted"
                />
                <div className="flex justify-between mt-1.5 text-xs font-mono">
                  <span className="text-text-muted">{evidenceText.length} characters</span>
                  <span className={evidenceText.length < 30 ? "text-red-audit" : "text-green-audit"}>
                    {evidenceText.length < 30 ? `${30 - evidenceText.length} more needed` : "✓ Ready"}
                  </span>
                </div>
              </div>

              {/* File upload */}
              <div>
                <label className="block text-xs font-mono text-text-muted mb-2 tracking-widest uppercase">
                  Attach Document / Image (Optional)
                </label>
                <div
                  {...getRootProps()}
                  className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive ? "drop-zone-active" : "border-border hover:border-border-bright"
                  }`}
                  style={{ background: isDragActive ? "rgba(108,99,255,0.04)" : "#0d0d1a" }}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {filePreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={filePreview} alt="preview" className="w-12 h-12 object-cover rounded-lg" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-violet/10 border border-violet/20 flex items-center justify-center">
                            <FileText size={20} className="text-violet" />
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-sm text-text-primary">{file.name}</p>
                          <p className="text-xs text-text-muted font-mono">{(file.size / 1024).toFixed(0)} KB · {file.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); setFilePreview(null); }}
                        className="text-text-muted hover:text-red-audit transition-colors p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={24} className="mx-auto text-text-muted mb-2" />
                      <p className="text-sm text-text-secondary">
                        {isDragActive ? "Drop it here…" : "Drag & drop or click to upload"}
                      </p>
                      <p className="text-xs text-text-muted mt-1 font-mono">Images · PDFs · Audio — up to 10 MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={evidenceText.trim().length < 30}
                className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gold text-obsidian font-bold rounded-xl hover:bg-gold-bright disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 glow-gold text-sm"
              >
                <Shield size={18} />
                {isDemoMode ? "Run Demo Analysis" : "Submit for Analysis"}
                <ChevronRight size={16} />
              </button>

              <p className="text-center text-xs text-text-muted font-body leading-relaxed">
                Your submission is encrypted and processed securely. No personal data is stored without consent.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
