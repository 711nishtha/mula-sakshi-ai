import { NextRequest, NextResponse } from "next/server";
import { analyzeEvidence, analyzeMedia } from "@/lib/gemini";
import { getDb } from "@/lib/db";
import { DEMO_REPORT } from "@/lib/demoData";
import type { AuditReport } from "@/types";

export const runtime = "nodejs";

function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("QUOTA_EXCEEDED") || msg.includes("429") || msg.includes("Many Requests");
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let submissionId: string | undefined;

  try {
    const body = await request.json();
    ({ submissionId } = body);
    const { evidenceText, mediaBase64, mediaMimeType, demoMode } = body;

    if (!evidenceText || typeof evidenceText !== "string") {
      return NextResponse.json({ error: "evidenceText is required" }, { status: 400 });
    }

    // Explicit demo mode
    if (demoMode === true) {
      const report = { ...DEMO_REPORT, caseId: submissionId ?? DEMO_REPORT.caseId };
      if (submissionId) {
        try {
          const db = await getDb();
          await db.updateSubmission(submissionId, {
            status: "complete", report, completedAt: new Date().toISOString(),
          });
        } catch { /* no-op */ }
      }
      return NextResponse.json({ success: true, report, submissionId, demo: true });
    }

    // Mark as processing
    if (submissionId) {
      try {
        const db = await getDb();
        await db.updateSubmission(submissionId, {
          status: "processing", processingStartedAt: new Date().toISOString(),
        });
      } catch { /* no-op */ }
    }

    // Optional media analysis
    let mediaDescription: string | undefined;
    if (mediaBase64 && mediaMimeType) {
      try {
        console.log(`[${submissionId}] Analyzing media (${mediaMimeType})…`);
        mediaDescription = await analyzeMedia(mediaBase64, mediaMimeType, evidenceText);
      } catch (mediaErr) {
        console.warn(`[${submissionId}] Media analysis skipped:`, mediaErr);
      }
    }

    // 3-stage pipeline
    let report: AuditReport;
    let usedFallback = false;

    try {
      console.log(`[${submissionId}] Starting 3-stage Gemini analysis…`);
      report = await analyzeEvidence(evidenceText, mediaDescription);
    } catch (geminiErr) {
      if (isQuotaError(geminiErr)) {
        // Quota exceeded — serve demo report with a clear note
        console.warn(`[${submissionId}] Quota exceeded — serving demo fallback`);
        report = {
          ...DEMO_REPORT,
          caseId: submissionId ?? `MS-FALLBACK-${Date.now().toString(36).toUpperCase()}`,
          timestamp: new Date().toISOString(),
          summary: "⚠️ API quota temporarily exceeded. This is a sample report showing system capabilities. Please retry in a few minutes for analysis of your specific evidence.\n\n" + DEMO_REPORT.summary,
        };
        usedFallback = true;
      } else {
        throw geminiErr;
      }
    }

    const totalMs = Date.now() - startTime;
    console.log(`[${submissionId}] Done in ${totalMs}ms. Verdict: ${report.verdict}${usedFallback ? " (fallback)" : ""}`);

    if (submissionId) {
      try {
        const db = await getDb();
        await db.updateSubmission(submissionId, {
          status: "complete",
          report: { ...report, caseId: submissionId },
          completedAt: new Date().toISOString(),
          totalProcessingMs: totalMs,
        });
      } catch { /* no-op */ }
    }

    return NextResponse.json({ success: true, report, submissionId, totalMs, fallback: usedFallback });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Analysis pipeline error:", message);

    if (submissionId) {
      try {
        const db = await getDb();
        await db.updateSubmission(submissionId, { status: "error", error: message });
      } catch { /* no-op */ }
    }

    return NextResponse.json({ error: "Analysis failed", details: message }, { status: 500 });
  }
}
