import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDb();
    const submissions = await db.listSubmissions(500);

    const total    = submissions.length;
    const complete = submissions.filter((s: Record<string, unknown>) => s.status === "complete").length;
    const withReport = submissions.filter((s: Record<string, unknown>) => s.report) as Array<Record<string, unknown>>;

    let contradictionsFound = 0;
    withReport.forEach((s) => {
      const report = s.report as Record<string, unknown> | undefined;
      const contras = report?.contradictions as unknown[] | undefined;
      contradictionsFound += Array.isArray(contras) ? contras.length : 0;
    });

    return NextResponse.json({
      totalSubmissions: total,
      completedAnalyses: complete,
      contradictionsFound,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Return baseline numbers if no submissions yet
    return NextResponse.json({
      totalSubmissions: 0,
      completedAnalyses: 0,
      contradictionsFound: 0,
      timestamp: new Date().toISOString(),
    });
  }
}
