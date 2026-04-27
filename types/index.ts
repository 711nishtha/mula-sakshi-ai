// ─── Core Domain Types for Mūla Śākṣī ────────────────────────────────────────

// ── Stage 1: Claim Extraction ─────────────────────────────────────────────────

export type ClaimType =
  | "date"
  | "amount"
  | "location"
  | "person"
  | "event"
  | "document"
  | "policy"
  | "quantity";

export interface ExtractedClaim {
  id: string;
  type: ClaimType;
  entity: string;        // Who/what the claim is about
  event: string;         // What happened
  quantity?: string;     // Any measurable amount
  location?: string;     // Where
  content: string;       // Full claim text
  confidence: number;    // 0–1
  sourceQuote: string;   // Verbatim from evidence
  timestamp?: string;
}

// ── Stage 2: Contradiction Detection ──────────────────────────────────────────

export type ContradictionType =
  | "direct_conflict"
  | "omission"
  | "fabrication"
  | "date_mismatch"
  | "amount_discrepancy"
  | "identity_fraud"
  | "policy_violation";

export type SeverityLevel = "critical" | "high" | "medium" | "low";

export type VerdictType = "CONTRADICTION_FOUND" | "VERIFIED" | "INCONCLUSIVE";

export interface ReasoningStep {
  step: number;
  label: string;   // e.g. "Evidence located", "Record cross-referenced", "Contradiction confirmed"
  detail: string;  // one-line explanation of what the AI found at this step
  verdict: "flag" | "match" | "neutral";
}

export interface Contradiction {
  claimId: string;
  claim: string;
  officialRecord: string;
  contradictionType: ContradictionType;
  severity: SeverityLevel;
  explanation: string;
  confidence: number;    // 0–1
  legalImplication: string;
  heatmapWeight: number; // 0–10 for heatmap visualization
  reasoningTrace?: ReasoningStep[]; // Step-by-step AI forensic reasoning
}

// ── Witness Data ───────────────────────────────────────────────────────────────

export interface WitnessStatement {
  witnessId: string;
  alias: string;
  region: string;
  language: string;
  corroborates: boolean;
  statement: string;
  credibilityScore: number; // 0–1
  noisyInput?: boolean;     // True if input had noise/OCR errors
}

// ── Stage 3: Audit Report ─────────────────────────────────────────────────────

export interface AuditReport {
  caseId: string;
  timestamp: string;
  summary: string;
  verdict: VerdictType;
  overallConfidence: number;  // 0–1
  claims: ExtractedClaim[];
  contradictions: Contradiction[];
  witnessCorroboration: WitnessStatement[];
  recommendation: string;
  legalNotice: string;
  riskScore: number;          // 0–100
  contradictionScore: number; // 0–100 (derived from contradictions)
  escalationTriggered: boolean;
  processingStages: ProcessingStage[];
}

export interface ProcessingStage {
  stage: 1 | 2 | 3;
  name: string;
  status: "pending" | "processing" | "complete" | "error";
  durationMs?: number;
  outputSummary?: string;
}

// ── Submission ────────────────────────────────────────────────────────────────

export type SubmissionStatus = "pending" | "processing" | "complete" | "error";

export interface Submission {
  id: string;
  evidenceText: string;
  mediaUrl?: string;
  mediaMimeType?: string;
  status: SubmissionStatus;
  createdAt: string;
  processingStartedAt?: string;
  completedAt?: string;
  report?: AuditReport;
  error?: string;
  submitterLocation?: string;
  category?: string;
}

// ── Heatmap ───────────────────────────────────────────────────────────────────

export interface HeatmapCell {
  domain: string;
  label: string;
  score: number;    // 0–100
  count: number;    // number of contradictions in this domain
  severity: SeverityLevel;
}

// ── UI State ──────────────────────────────────────────────────────────────────

export type AnalysisPhase =
  | "idle"
  | "uploading"
  | "stage1"
  | "stage2"
  | "stage3"
  | "complete"
  | "error";

export interface AnalysisState {
  phase: AnalysisPhase;
  progress: number;    // 0–100
  currentStage?: 1 | 2 | 3;
  message: string;
  submissionId?: string;
}
