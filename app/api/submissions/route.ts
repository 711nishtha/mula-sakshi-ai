import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { evidenceText, category, submitterLocation } = body;

    if (!evidenceText || typeof evidenceText !== "string" || evidenceText.trim().length < 20) {
      return NextResponse.json(
        { error: "evidenceText must be at least 20 characters" },
        { status: 400 }
      );
    }

    const id = uuid();
    const now = new Date().toISOString();

    const submission = {
      id,
      evidenceText: evidenceText.trim(),
      category: category || "General",
      submitterLocation: submitterLocation || null,
      status: "pending",
      createdAt: now,
    };

    try {
      const db = await getDb();
      await db.setSubmission(id, submission);
    } catch (dbError) {
      console.warn("DB write failed, running in-memory only:", dbError);
    }

    return NextResponse.json({ success: true, submissionId: id, submission });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Submission creation error:", message);
    return NextResponse.json({ error: "Failed to create submission", details: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    try {
      const db = await getDb();
      const submissions = await db.listSubmissions(limit);
      return NextResponse.json({ submissions });
    } catch {
      return NextResponse.json({ submissions: [] });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch", details: message }, { status: 500 });
  }
}
