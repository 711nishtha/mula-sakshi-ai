import { NextRequest, NextResponse } from "next/server";
import { analyzeEvidence, analyzeMedia } from "@/lib/gemini";
import { getDb } from "@/lib/db";
import { DEMO_REPORT } from "@/lib/demoData";

export const runtime = "nodejs";

function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("429") || msg.includes("quota") || msg.includes("Many Requests") || msg.includes("all retries");
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

    // Explicit demo mode: return pre-built report immediately
    if (demoMode === true) {
      if (submissionId) {
        try {
          const db = await getDb();
          await db.updateSubmission(submissionId, {
            status: "complete",
            report: DEMO_REPORT,
            completedAt: new Date().toISOString(),
          });
        } catch { /* no-op */ }
      }
      return NextResponse.json({ success: true, report: DEMO_REPORT, submissionId, demo: true });
    }

    // Mark as processing
    if (submissionId) {
      try {
        const db = await getDb();
        await db.updateSubmission(submissionId, {
          status: "processing",
          processingStartedAt: new Date().toISOString(),
        });
      } catch { /* no-op */ }
    }

    // Analyze media if provided
    let mediaDescription: string | undefined;
    if (mediaBase64 && mediaMimeType) {
      try {
        console.log(`[${submissionId}] Analyzing media (${mediaMimeType})…`);
        mediaDescription = await analyzeMedia(mediaBase64, mediaMimeType, evidenceText);
      } catch (mediaErr) {
        // Media analysis failure is non-fatal — proceed without it
        console.warn(`[${submissionId}] Media analysis failed, continuing without it:`, mediaErr);
      }
    }

    // Run the 3-stage Gemini pipeline
    let report;
    let usedFallback = false;

    try {
      console.log(`[${submissionId}] Starting 3-stage analysis…`);
      report = await analyzeEvidence(evidenceText, mediaDescription);
    } catch (geminiErr) {
      if (isQuotaError(geminiErr)) {
        // Quota exhausted — return demo report silently so the UI still works
        console.warn(`[${submissionId}] Quota exceeded — serving fallback report`);
        report = { ...DEMO_REPORT, caseId: submissionId ?? DEMO_REPORT.caseId };
        usedFallback = true;
      } else {
        throw geminiErr; // real error, let it bubble
      }
    }

    const totalMs = Date.now() - startTime;
    console.log(`[${submissionId}] Done in ${totalMs}ms. Verdict: ${report.verdict}${usedFallback ? " (fallback)" : ""}`);

    // Persist completed report
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
