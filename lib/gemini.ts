/**
 * Mūla Śākṣī — Gemini AI Pipeline
 * Three-stage prompt chain:
 *   Stage 1 → Claim Extraction  (structured JSON)
 *   Stage 2 → Contradiction Engine (domain-matched cross-reference)
 *   Stage 3 → Report Generator (legal-grade audit verdict)
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import type { AuditReport, ExtractedClaim, Contradiction, WitnessStatement, ProcessingStage } from "@/types";
import { WITNESS_DATASET, computeWitnessConsensus } from "@/data/witnesses";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL = "gemini-2.0-flash";

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

function getModel(temperature = 0.15) {
  return genAI.getGenerativeModel({
    model: MODEL,
    safetySettings,
    generationConfig: {
      temperature,
      topP: 0.8,
      maxOutputTokens: 4096,
    } as Record<string, unknown>,
  });
}

// ─── Robust JSON parser — handles thinking model output ────────────────────────
// Gemini 2.5-pro (thinking model) wraps responses in <thinking>...</thinking>.
// This parser strips all pre-JSON content reliably.
function parseJSON<T>(raw: string, fallback: T): T {
  try {
    let text = raw;

    // 1. Strip thinking tags (Gemini 2.5-pro thinking model)
    text = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "");

    // 2. Strip markdown code fences
    text = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "");

    // 3. Find the outermost JSON object or array
    const objStart  = text.indexOf("{");
    const arrStart  = text.indexOf("[");
    let start = -1;
    if (objStart === -1 && arrStart === -1) throw new Error("No JSON found");
    if (objStart === -1) start = arrStart;
    else if (arrStart === -1) start = objStart;
    else start = Math.min(objStart, arrStart);

    // 4. Find matching end brace
    const opener  = text[start];
    const closer  = opener === "{" ? "}" : "]";
    let depth = 0;
    let end   = -1;
    for (let i = start; i < text.length; i++) {
      if (text[i] === opener) depth++;
      else if (text[i] === closer) {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end === -1) throw new Error("Unbalanced JSON");

    const jsonStr = text.slice(start, end + 1);
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("[parseJSON] Failed:", e instanceof Error ? e.message : e, "\nRaw snippet:", raw.slice(0, 400));
    return fallback;
  }
}

// ─── Retry wrapper — fails fast, max 2 retries ────────────────────────────────
async function generateWithRetry(
  model: ReturnType<typeof getModel>,
  prompt: string | unknown[],
  maxRetries = 2
): Promise<string> {
  const delays = [4000, 8000];
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt as string);
      return result.response.text();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isQuota = msg.includes("429") || msg.includes("quota") || msg.includes("Many Requests");
      if (isQuota && attempt < maxRetries) {
        const wait = delays[attempt] ?? 8000;
        console.warn(`[Gemini] Rate limit — retrying in ${wait / 1000}s (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, wait));
      } else {
        throw err;
      }
    }
  }
  throw new Error("QUOTA_EXCEEDED: Gemini rate limit. Please wait a moment and try again.");
}

// ─── Domain-matched Government Records ────────────────────────────────────────
// Only the relevant domain record is passed to Stage 2 — this ensures
// pension evidence produces pension contradictions (not land record ones).
const ALL_GOV_RECORDS: Record<string, string> = {
  land:       "Plot No. 247-B, Survey No. 14, Mahesana District. Registered owner: Ramesh Patel. Area: 2.3 acres. Registration date: 14-Feb-2019. Market value: ₹42,00,000. Last mutation: 2021.",
  ration:     "BPL Ration Card #GJ-MH-2847. Issued: 2018. Valid through: 2026. Beneficiaries: 4 members. Monthly allocation: 20kg wheat, 5kg rice = 25kg total. Scheme: NFSA 2013.",
  pension:    "Old Age Pension Scheme. Beneficiary: Savitaben Mehta (DOB: 12/03/1948). Monthly disbursement: ₹1,200. Last recorded disbursement: 01-October-2023. Status: Active.",
  tender:     "Road Construction Tender GJ-NH-2024-0078. Awarded to: Bharat Infra Pvt. Ltd. Original contract: ₹3.8 crore. Completion target: December 2024. Inspector: Dept of Roads, Gujarat. Status: In Progress.",
  scholarship:"SC/ST Scholarship Scheme. Disbursement to Student ID GJ-SC-2023-4821 (Ronak Patel). Amount: ₹75,000 for FY 2023-24. Disbursed: September 2023. Enrollment status: Active as per dept records.",
  employment: "MGNREGS Job Card #GJ-DH-2023-1147. Days recorded: 100. Payment released: ₹22,200 (100 days × ₹222). Disbursed to account: XXXXX7142. Status: Closed.",
  health:     "Primary Health Camp — Camp ID PHC-VAL-2024-003. Beneficiaries recorded: 500. Medicine allocation: 500 units. District: Valsad. Date: March 2024.",
};

// ─── Prompts ───────────────────────────────────────────────────────────────────

const STAGE1_PROMPT = `You are a forensic AI analyst for the Mūla Śākṣī government audit system. Extract ALL verifiable factual claims from citizen-submitted evidence.

IMPORTANT: Return ONLY raw JSON. No explanation, no markdown, no <thinking>.

EXTRACTION RULES:
- Extract every verifiable fact: dates, amounts, names, locations, document IDs, events, policies
- Each claim needs: entity, event, quantity (if any), location (if any)
- Confidence: 0.9+ = explicit statement, 0.7–0.9 = clearly implied, 0.5–0.7 = inferred
- sourceQuote: verbatim text from evidence

EXAMPLE OUTPUT:
{
  "claims": [
    {"id":"C1","type":"amount","entity":"Land Registration Plot 247-B","event":"Area recorded","quantity":"3.5 acres","location":"Plot 247-B","content":"Land registration records 3.5 acres","confidence":0.95,"sourceQuote":"registration shows 3.5 acres"},
    {"id":"C2","type":"document","entity":"Patta Document","event":"Area in patta","quantity":"2.1 acres","location":"Plot 247-B","content":"Patta shows 2.1 acres","confidence":0.95,"sourceQuote":"my patta says 2.1 acres"}
  ]
}

EVIDENCE TO ANALYZE:
`;

const STAGE2_PROMPT = `You are a senior government auditor AI for the Mūla Śākṣī zero-trust audit system.

IMPORTANT: Return ONLY raw JSON. No explanation, no markdown, no <thinking>.

GOVERNMENT RECORD FOR THIS DOMAIN:
{GOV_RECORD}

EXTRACTED CLAIMS FROM EVIDENCE:
{CLAIMS}

WITNESS CONSENSUS:
{WITNESS_DATA}

Cross-reference EACH claim against the government record above. For every real discrepancy found, produce a contradiction entry.
Be specific to THIS evidence — do not invent contradictions not supported by the claims above.

CONTRADICTION TYPES: direct_conflict | omission | fabrication | date_mismatch | amount_discrepancy | identity_fraud | policy_violation
SEVERITY: critical (FIR-level) | high (>₹1 lakh / >10%) | medium (notable) | low (minor)

REQUIRED OUTPUT (include reasoningTrace for every contradiction):
{
  "contradictions": [
    {
      "claimId": "C1",
      "claim": "exact citizen claim text",
      "officialRecord": "what the government record actually says",
      "contradictionType": "amount_discrepancy",
      "severity": "high",
      "explanation": "specific explanation of the discrepancy and why it matters",
      "confidence": 0.88,
      "legalImplication": "specific law sections applicable",
      "heatmapWeight": 7,
      "reasoningTrace": [
        {"step":1,"label":"Claim located","detail":"Citizen states X","verdict":"neutral"},
        {"step":2,"label":"Record retrieved","detail":"Official record says Y","verdict":"neutral"},
        {"step":3,"label":"Discrepancy measured","detail":"Difference is Z","verdict":"flag"},
        {"step":4,"label":"Witness consensus","detail":"N witnesses confirm discrepancy","verdict":"flag"},
        {"step":5,"label":"Contradiction confirmed","detail":"Records cannot both be accurate","verdict":"flag"}
      ]
    }
  ]
}

If no real contradictions exist, return: {"contradictions": []}
`;

const STAGE3_PROMPT = `You are Chief Audit Officer of Mūla Śākṣī generating an official legal-grade audit report.

IMPORTANT: Return ONLY raw JSON. No explanation, no markdown, no <thinking>.

CASE ID: {CASE_ID}
EVIDENCE DOMAIN: {DOMAIN}
CONTRADICTIONS FOUND: {CONTRADICTION_COUNT}
CONTRADICTION DETAILS:
{CONTRADICTIONS}

CLAIMS ANALYZED:
{CLAIMS_SUMMARY}

WITNESS SUPPORT: {WITNESS_SUMMARY}

Calculate scores PRECISELY from the data above. Do NOT default to generic values.

SCORING RULES (mandatory):
- riskScore: sum of (severityWeight × confidence) for each contradiction, normalized to 0-100
  severityWeight: critical=25, high=15, medium=8, low=3
- contradictionScore: percentage of claims that have confirmed contradictions × average confidence
- If 0 contradictions: riskScore=0, contradictionScore=0, verdict="VERIFIED"
- If contradictionScore > 40 AND confidence > 0.6: verdict="CONTRADICTION_FOUND"
- Otherwise: verdict="INCONCLUSIVE"

Return ONLY this JSON:
{
  "summary": "2-3 sentences: specific findings for THIS case, not generic",
  "verdict": "CONTRADICTION_FOUND" | "VERIFIED" | "INCONCLUSIVE",
  "overallConfidence": 0.0-1.0,
  "riskScore": 0-100,
  "contradictionScore": 0-100,
  "recommendation": "specific actionable steps naming the relevant government departments and applicable laws",
  "legalNotice": "formal language citing specific applicable sections of IPC/CrPC/relevant acts"
}
`;

// ─── Main Pipeline ────────────────────────────────────────────────────────────

export async function analyzeEvidence(
  evidenceText: string,
  mediaDescription?: string
): Promise<AuditReport> {
  const model = getModel();
  const caseId = `MS-${Date.now().toString(36).toUpperCase()}`;
  const stages: ProcessingStage[] = [];

  const fullEvidence = mediaDescription
    ? `${evidenceText}\n\n[MEDIA ANALYSIS]: ${mediaDescription}`
    : evidenceText;

  // ── STAGE 1: Claim Extraction ───────────────────────────────────────────────
  const s1Start = Date.now();
  stages.push({ stage: 1, name: "Claim Extraction", status: "processing" });

  const claimsRaw  = await generateWithRetry(model, STAGE1_PROMPT + fullEvidence);
  const claimsParsed = parseJSON<{ claims: ExtractedClaim[] }>(claimsRaw, { claims: [] });

  let claims: ExtractedClaim[] = (claimsParsed.claims || []).map((c, i) => ({
    id:          c.id || `C${i + 1}`,
    type:        c.type || "event",
    entity:      c.entity || "Unknown",
    event:       c.event || c.content || "Event detected",
    quantity:    c.quantity || undefined,
    location:    c.location || undefined,
    content:     c.content || "",
    confidence:  typeof c.confidence === "number" ? c.confidence : 0.7,
    sourceQuote: c.sourceQuote || c.content || "",
    timestamp:   new Date().toISOString(),
  }));

  if (claims.length === 0) {
    claims = [{
      id: "C1", type: "event", entity: "Evidence", event: "Submitted evidence",
      content: fullEvidence.slice(0, 300), confidence: 0.6,
      sourceQuote: fullEvidence.slice(0, 150), timestamp: new Date().toISOString(),
    }];
  }

  stages[0] = {
    stage: 1, name: "Claim Extraction", status: "complete",
    durationMs: Date.now() - s1Start, outputSummary: `${claims.length} claims extracted`,
  };

  // ── STAGE 2: Contradiction Detection ───────────────────────────────────────
  const s2Start   = Date.now();
  stages.push({ stage: 2, name: "Contradiction Engine", status: "processing" });

  // Domain detection — key to avoiding cross-domain false positives
  const domain     = detectDomain(fullEvidence);
  const govRecord  = ALL_GOV_RECORDS[domain] ?? ALL_GOV_RECORDS.land;
  const claimsStr  = claims.map(c =>
    `- [${c.id}][${c.type}] ${c.content} (entity: ${c.entity}, qty: ${c.quantity ?? "n/a"}, confidence: ${c.confidence})`
  ).join("\n");

  const consensus  = computeWitnessConsensus(domain, fullEvidence);
  const witnessStr = `Domain: ${domain} | ${consensus.supportingCount}/${consensus.totalRelevant} domain witnesses contradict official records | Avg credibility: ${Math.round(consensus.consensusScore)}%`;

  const s2Prompt = STAGE2_PROMPT
    .replace("{GOV_RECORD}", govRecord)
    .replace("{CLAIMS}",     claimsStr)
    .replace("{WITNESS_DATA}", witnessStr);

  const contraRaw    = await generateWithRetry(model, s2Prompt);
  const contraParsed = parseJSON<{ contradictions: Contradiction[] }>(contraRaw, { contradictions: [] });

  const contradictions: Contradiction[] = (contraParsed.contradictions || []).map((c, i) => ({
    claimId:          c.claimId  || claims[i % claims.length]?.id || "C1",
    claim:            c.claim    || claims[i % claims.length]?.content || "",
    officialRecord:   c.officialRecord || "Government record inconsistency detected",
    contradictionType: c.contradictionType || "direct_conflict",
    severity:         c.severity || "medium",
    explanation:      c.explanation || "Discrepancy between evidence and official records",
    confidence:       typeof c.confidence === "number" ? c.confidence : 0.75,
    legalImplication: c.legalImplication || "Further investigation required",
    heatmapWeight:    c.heatmapWeight || deriveSeverityWeight(c.severity || "medium"),
    reasoningTrace:   c.reasoningTrace || [],
  }));

  stages[1] = {
    stage: 2, name: "Contradiction Engine", status: "complete",
    durationMs: Date.now() - s2Start, outputSummary: `${contradictions.length} contradictions detected`,
  };

  // ── STAGE 3: Report Generation ─────────────────────────────────────────────
  const s3Start = Date.now();
  stages.push({ stage: 3, name: "Report Generator", status: "processing" });

  const witnessStatements = buildWitnessStatements(consensus);

  const s3Prompt = STAGE3_PROMPT
    .replace("{CASE_ID}",            caseId)
    .replace("{DOMAIN}",             domain)
    .replace("{CONTRADICTION_COUNT}", String(contradictions.length))
    .replace("{CONTRADICTIONS}",     JSON.stringify(contradictions, null, 2))
    .replace("{CLAIMS_SUMMARY}",     claimsStr)
    .replace("{WITNESS_SUMMARY}",    witnessStr);

  const reportRaw    = await generateWithRetry(model, s3Prompt);
  const reportParsed = parseJSON<{
    summary: string; verdict: string; overallConfidence: number;
    riskScore: number; contradictionScore: number; recommendation: string; legalNotice: string;
  }>(reportRaw, {
    summary:           "Analysis complete. Evidence cross-referenced with government records.",
    verdict:           contradictions.length > 0 ? "CONTRADICTION_FOUND" : "INCONCLUSIVE",
    overallConfidence: contradictions.length > 0 ? 0.75 : 0.5,
    riskScore:         Math.min(contradictions.reduce((s, c) => s + deriveSeverityWeight(c.severity) * 10 * c.confidence, 0), 100),
    contradictionScore: computeContradictionScore(contradictions),
    recommendation:    "Refer findings to relevant district authority for formal investigation.",
    legalNotice:       "This AI-generated report is preliminary. Human legal review required before formal proceedings.",
  });

  stages[2] = {
    stage: 3, name: "Report Generator", status: "complete",
    durationMs: Date.now() - s3Start, outputSummary: `Verdict: ${reportParsed.verdict}`,
  };

  const escalationTriggered = (reportParsed.riskScore || 0) > 70 || contradictions.some(c => c.severity === "critical");

  return {
    caseId,
    timestamp: new Date().toISOString(),
    claims,
    contradictions,
    witnessCorroboration: witnessStatements,
    summary:             reportParsed.summary,
    verdict:             (reportParsed.verdict as AuditReport["verdict"]) || "INCONCLUSIVE",
    overallConfidence:   Math.min(Math.max(reportParsed.overallConfidence || 0.65, 0), 1),
    riskScore:           Math.min(Math.round(reportParsed.riskScore || 0), 100),
    contradictionScore:  Math.min(Math.round(reportParsed.contradictionScore || computeContradictionScore(contradictions)), 100),
    recommendation:      reportParsed.recommendation,
    legalNotice:         reportParsed.legalNotice,
    escalationTriggered,
    processingStages:    stages,
  };
}

// ─── Media Analysis ────────────────────────────────────────────────────────────

export async function analyzeMedia(base64Data: string, mimeType: string, contextText?: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: MODEL, safetySettings });

  const prompt = `You are a forensic document analyst. Analyze this evidence for a government audit.
Describe ALL relevant content: document numbers, dates, amounts, stamps, signatures, names, locations.
Note any visible inconsistencies, altered dates, or suspicious elements.
${contextText ? `Submitter context: ${contextText}` : ""}
Provide a precise forensic description (3-5 paragraphs). Be factual and specific. Return only the description.`;

  const result = await generateWithRetry(model, [
    prompt,
    { inlineData: { data: base64Data, mimeType } },
  ] as unknown as string);
  return result;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function detectDomain(text: string): "land" | "ration" | "pension" | "tender" | "scholarship" | "health" | "employment" {
  const t = text.toLowerCase();
  if (t.includes("land") || t.includes("plot") || t.includes("patta") || t.includes("acre") || t.includes("survey")) return "land";
  if (t.includes("ration") || t.includes("pds") || t.includes("fair price") || t.includes("grain") || t.includes("wheat") || t.includes("rice")) return "ration";
  if (t.includes("pension") || t.includes("disburs") || t.includes("elderly") || t.includes("savita")) return "pension";
  if (t.includes("tender") || t.includes("contract") || t.includes("road") || t.includes("crore") || t.includes("infra")) return "tender";
  if (t.includes("scholarship") || t.includes("student") || t.includes("college") || t.includes("education")) return "scholarship";
  if (t.includes("mgnregs") || t.includes("job card") || t.includes("100 days") || t.includes("nregs")) return "employment";
  if (t.includes("health") || t.includes("medicine") || t.includes("camp") || t.includes("hospital")) return "health";
  return "land";
}

function deriveSeverityWeight(severity: string): number {
  const map: Record<string, number> = { critical: 10, high: 7, medium: 4, low: 2 };
  return map[severity] ?? 4;
}

function computeContradictionScore(contradictions: Contradiction[]): number {
  if (contradictions.length === 0) return 0;
  const total = contradictions.reduce((sum, c) => sum + deriveSeverityWeight(c.severity) * c.confidence, 0);
  return Math.min(Math.round((total / (contradictions.length * 10)) * 100), 100);
}

function buildWitnessStatements(consensus: ReturnType<typeof computeWitnessConsensus>): WitnessStatement[] {
  return consensus.topWitnesses.map(w => ({
    witnessId:      w.id,
    alias:          w.alias,
    region:         w.region,
    language:       w.language,
    corroborates:   !w.corroboratesOfficial,
    statement:      w.statement,
    credibilityScore: w.credibilityScore,
  }));
}
