import { NextRequest, NextResponse } from "next/server";
import { analyzeEvidence, analyzeMedia } from "@/lib/gemini";
import { getDb } from "@/lib/db";
import { DEMO_REPORT } from "@/lib/demoData";

export const runtime = "nodejs";

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

    // Demo mode: return pre-built report immediately
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
      console.log(`[${submissionId}] Analyzing media (${mediaMimeType})…`);
      mediaDescription = await analyzeMedia(mediaBase64, mediaMimeType, evidenceText);
    }

    // Run the 3-stage Gemini pipeline
    console.log(`[${submissionId}] Starting 3-stage analysis…`);
    const report = await analyzeEvidence(evidenceText, mediaDescription);

    const totalMs = Date.now() - startTime;
    console.log(`[${submissionId}] Analysis complete in ${totalMs}ms. Verdict: ${report.verdict}`);

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

    return NextResponse.json({ success: true, report, submissionId, totalMs });
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
