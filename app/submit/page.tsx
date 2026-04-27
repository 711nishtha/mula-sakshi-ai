import { Suspense } from "react";
import SubmitClient from "./SubmitClient";

export const dynamic = "force-dynamic";

export default function SubmitPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-text-muted font-mono text-sm animate-pulse">Loading…</div>
      </div>
    }>
      <SubmitClient />
    </Suspense>
  );
}
