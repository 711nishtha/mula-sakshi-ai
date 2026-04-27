/**
 * Mūla Śākṣī — Gemini AI Pipeline
 * Three-stage prompt chain using gemini-1.5-pro:
 *   Stage 1 → Claim Extraction  (structured JSON)
 *   Stage 2 → Contradiction Engine (cross-reference vs. gov records + witnesses)
 *   Stage 3 → Report Generator (legal-grade audit verdict)
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import type { AuditReport, ExtractedClaim, Contradiction, WitnessStatement, ProcessingStage } from "@/types";
import { WITNESS_DATASET, computeWitnessConsensus } from "@/data/witnesses";

// ─── SDK Init ──────────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro";

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
    generationConfig: { temperature, topP: 0.8, maxOutputTokens: 4096 },
  });
}

// Retry wrapper — max 2 retries, short delays, fails fast
async function generateWithRetry(
  model: ReturnType<typeof getModel>,
  prompt: string | (string | object)[],
  maxRetries = 2
): Promise<string> {
  const delays = [3000, 6000];
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt as string);
      return result.response.text();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isQuota = msg.includes("429") || msg.includes("quota") || msg.includes("Many Requests");
      if (isQuota && attempt < maxRetries) {
        const wait = delays[attempt] ?? 6000;
        console.warn(`[Gemini] Rate limit — retrying in ${wait / 1000}s (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, wait));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Gemini quota exceeded. Please try again in a minute.");
}

// ─── Government Records Database (simulated) ──────────────────────────────────
const GOV_RECORDS = [
  {
    domain: "land",
    record: "Plot No. 247-B, Survey No. 14, Mahesana District. Registered owner: Ramesh Patel. Area: 2.3 acres. Registration date: 14-Feb-2019. Market value: ₹42,00,000. Last mutation: 2021.",
  },
  {
    domain: "ration",
    record: "BPL Ration Card #GJ-MH-2847. Issued: 2018. Valid through: 2026. Beneficiaries: 4 members. Monthly allocation: 20kg wheat, 5kg rice = 25kg total. Scheme: NFSA 2013.",
  },
  {
    domain: "pension",
    record: "Old Age Pension Scheme. Beneficiary: Savitaben Mehta (DOB: 12/03/1948). Monthly disbursement: ₹1,200. Last recorded disbursement: 01-October-2023. Status: Active.",
  },
  {
    domain: "tender",
    record: "Road Construction Tender GJ-NH-2024-0078. Awarded to: Bharat Infra Pvt. Ltd. Original contract: ₹3.8 crore. Completion target: December 2024. Inspector: Dept of Roads, Gujarat. Status: In Progress.",
  },
  {
    domain: "scholarship",
    record: "SC/ST Scholarship Scheme. Disbursement to Student ID GJ-SC-2023-4821 (Ronak Patel). Amount: ₹75,000 for FY 2023-24. Disbursed: September 2023. Enrollment status: Active as per dept records.",
  },
  {
    domain: "employment",
    record: "MGNREGS Job Card #GJ-DH-2023-1147. Days recorded: 100. Payment released: ₹22,200 (100 days × ₹222). Disbursed to account: XXXXX7142. Status: Closed.",
  },
  {
    domain: "health",
    record: "Primary Health Camp — Camp ID PHC-VAL-2024-003. Beneficiaries recorded: 500. Medicine allocation: 500 units. District: Valsad. Date: March 2024.",
  },
];

// ─── Stage 1: Claim Extraction ─────────────────────────────────────────────────

const STAGE1_PROMPT = `You are a forensic AI analyst for the Mūla Śākṣī government audit system. Your task is to extract ALL verifiable factual claims from citizen-submitted evidence.

EXTRACTION RULES:
- Extract every verifiable fact: dates, amounts, names, locations, document IDs, events, policies
- Do NOT interpret — only extract what is explicitly or clearly implied
- Each claim needs: entity (who/what), event (what happened), quantity (if any), location (if any)
- Confidence: 0.9+ = explicit statement, 0.7–0.9 = clearly implied, 0.5–0.7 = inferred
- sourceQuote: verbatim text from evidence that supports this claim

FEW-SHOT EXAMPLES:

INPUT: "The ration card was renewed in 2022, but we haven't received any grains since January 2023. The FPS officer told us the scheme was discontinued."
OUTPUT:
{
  "claims": [
    {"id":"C1","type":"date","entity":"BPL Ration Card","event":"Renewal","quantity":null,"location":null,"content":"Ration card renewed in 2022","confidence":0.92,"sourceQuote":"ration card was renewed in 2022"},
    {"id":"C2","type":"event","entity":"Citizen household","event":"Non-receipt of grain allocation","quantity":"0 kg","location":null,"content":"No grain received since January 2023","confidence":0.90,"sourceQuote":"haven't received any grains since January 2023"},
    {"id":"C3","type":"policy","entity":"FPS Officer","event":"Claim scheme discontinued","quantity":null,"location":"Fair Price Shop","content":"FPS officer claimed scheme was discontinued","confidence":0.75,"sourceQuote":"officer told us the scheme was discontinued"}
  ]
}

INPUT: "Land registration shows 3.5 acres for plot 247-B but my patta says 2.1 acres. Stamp duty paid receipt is from 2019. A builder named Dhruv Constructions has begun construction on the extra 1.4 acres."
OUTPUT:
{
  "claims": [
    {"id":"C1","type":"amount","entity":"Land Registration - Plot 247-B","event":"Area recorded in registration","quantity":"3.5 acres","location":"Plot 247-B","content":"Land registration shows 3.5 acres for plot 247-B","confidence":0.95,"sourceQuote":"Land registration shows 3.5 acres for plot 247-B"},
    {"id":"C2","type":"document","entity":"Patta Document - Plot 247-B","event":"Area recorded in patta","quantity":"2.1 acres","location":"Plot 247-B","content":"Patta document shows 2.1 acres for same plot","confidence":0.95,"sourceQuote":"my patta says 2.1 acres"},
    {"id":"C3","type":"date","entity":"Stamp Duty Receipt","event":"Stamp duty payment","quantity":null,"location":null,"content":"Stamp duty paid in 2019","confidence":0.90,"sourceQuote":"Stamp duty paid receipt is from 2019"},
    {"id":"C4","type":"event","entity":"Dhruv Constructions","event":"Unauthorized construction on disputed land","quantity":"1.4 acres","location":"Plot 247-B","content":"Dhruv Constructions is constructing on 1.4 acres beyond citizen entitlement","confidence":0.85,"sourceQuote":"builder named Dhruv Constructions has begun construction on the extra 1.4 acres"}
  ]
}

Now analyze this evidence and return ONLY valid JSON (no markdown, no explanation):

EVIDENCE:
`;

// ─── Stage 2: Contradiction Engine ────────────────────────────────────────────

const STAGE2_PROMPT = `You are a senior government auditor AI for the Mūla Śākṣī zero-trust audit system. Cross-reference extracted claims against official government records and identify contradictions.

GOVERNMENT RECORDS DATABASE:
{GOV_RECORDS}

EXTRACTED CLAIMS:
{CLAIMS}

WITNESS CONSENSUS DATA:
{WITNESS_DATA}

CONTRADICTION CLASSIFICATION:
- direct_conflict: Two facts cannot both be true
- omission: Official record hides a key fact the evidence reveals
- fabrication: One of the sources is entirely invented
- date_mismatch: Same event has different dates
- amount_discrepancy: Same measurement differs between sources
- identity_fraud: Person/entity does not exist or is misrepresented
- policy_violation: Action taken violates known government policy

SEVERITY LEVELS:
- critical: Criminal implication, FIR-level severity
- high: Significant financial discrepancy (>₹1 lakh or >10%)
- medium: Notable inconsistency requiring investigation
- low: Minor variance, could be administrative error

FEW-SHOT EXAMPLE:
Claim: "Ration card provides 35kg monthly"
Gov Record: "BPL Card: 20kg wheat + 5kg rice = 25kg"
Witness Consensus: 91% of witnesses deny receiving 35kg

REQUIRED OUTPUT SCHEMA — include ALL fields including reasoningTrace:
{
  "contradictions": [
    {
      "claimId": "C1",
      "claim": "Fair price shop claims to deliver 35kg",
      "officialRecord": "BPL Card monthly allocation is 25kg under NFSA 2013",
      "contradictionType": "amount_discrepancy",
      "severity": "high",
      "explanation": "A 10kg overstating per family per month. FPS records showing 35kg while entitlement is 25kg indicates systematic diversion of surplus stock to black market. Witness consensus of 91% confirms non-receipt.",
      "confidence": 0.91,
      "legalImplication": "Violation of National Food Security Act 2013, Section 12. Potential FIR under Essential Commodities Act 1955. Diversion of PDS stock is cognizable offense.",
      "heatmapWeight": 8,
      "reasoningTrace": [
        { "step": 1, "label": "Evidence located", "detail": "Citizen record states 35kg monthly PDS delivery by fair price shop.", "verdict": "neutral" },
        { "step": 2, "label": "Official record retrieved", "detail": "NFSA 2013 BPL entitlement is 20kg wheat + 5kg rice = 25kg maximum.", "verdict": "neutral" },
        { "step": 3, "label": "Discrepancy measured", "detail": "10kg surplus claimed per family. At scale, this constitutes systematic diversion.", "verdict": "flag" },
        { "step": 4, "label": "Witness consensus applied", "detail": "91% of 11 witnesses confirm they never received 35kg — corroborates fraud.", "verdict": "flag" },
        { "step": 5, "label": "Contradiction confirmed", "detail": "FPS records cannot show 35kg without either fraud or undisclosed supplemental scheme.", "verdict": "flag" }
      ]
    }
  ]
}

IMPORTANT: Every contradiction MUST include reasoningTrace with 4-6 steps. Each step must have: step (number), label (short title), detail (one sentence), verdict ("flag" | "match" | "neutral").
Return ONLY valid JSON. If no contradictions found, return {"contradictions": []}.

ANALYSIS:
`;

// ─── Stage 3: Report Generator ────────────────────────────────────────────────

const STAGE3_PROMPT = `You are the Chief Audit Officer of Mūla Śākṣī, generating an official legal-grade audit report.

CASE ID: {CASE_ID}
CONTRADICTIONS FOUND: {CONTRADICTION_COUNT}
CONTRADICTION DETAILS:
{CONTRADICTIONS}

CLAIMS ANALYZED:
{CLAIMS_SUMMARY}

WITNESS CORROBORATION:
{WITNESS_SUMMARY}

Generate a formal audit verdict. Be precise, authoritative, and legally sound.

Return ONLY valid JSON in this exact structure:
{
  "summary": "2-3 sentence executive summary of findings",
  "verdict": "CONTRADICTION_FOUND" | "VERIFIED" | "INCONCLUSIVE",
  "overallConfidence": 0.0-1.0,
  "riskScore": 0-100,
  "contradictionScore": 0-100,
  "recommendation": "Specific, actionable steps for authorities. Name departments. Cite laws.",
  "legalNotice": "Formal legal language. Reference applicable laws (IPC, CrPC, specific acts). State next steps."
}

Scoring guide:
- riskScore: 0=no risk, 100=maximum fraud risk. Base on: severity of contradictions × confidence × witness support
- contradictionScore: 0=fully consistent, 100=maximum contradiction. Direct function of how much evidence contradicts official records.
- verdict CONTRADICTION_FOUND if contradictionScore > 40 and confidence > 0.6
- verdict VERIFIED if contradictionScore < 20 and confidence > 0.7
- Otherwise INCONCLUSIVE

VERDICT:
`;

// ─── JSON Parser ──────────────────────────────────────────────────────────────

function parseJSON<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw
      .replace(/```json\n?|\n?```/g, "")
      .replace(/^[^{[]*/, "")
      .replace(/[^}\]]*$/, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.error("JSON parse error:", e, "\nRaw:", raw.slice(0, 200));
    return fallback;
  }
}

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

  const claimResult = await generateWithRetry(model, STAGE1_PROMPT + fullEvidence);
  const claimsRaw = claimResult;

  const claimsParsed = parseJSON<{ claims: ExtractedClaim[] }>(claimsRaw, { claims: [] });
  let claims: ExtractedClaim[] = (claimsParsed.claims || []).map((c, i) => ({
    id: c.id || `C${i + 1}`,
    type: c.type || "event",
    entity: c.entity || "Unknown",
    event: c.event || c.content || "Event detected",
    quantity: c.quantity || undefined,
    location: c.location || undefined,
    content: c.content || "",
    confidence: typeof c.confidence === "number" ? c.confidence : 0.7,
    sourceQuote: c.sourceQuote || c.content || "",
    timestamp: new Date().toISOString(),
  }));

  if (claims.length === 0) {
    // Minimum fallback claim if Gemini returns empty
    claims = [{
      id: "C1", type: "event", entity: "Evidence", event: "Submitted evidence",
      content: fullEvidence.slice(0, 300), confidence: 0.6,
      sourceQuote: fullEvidence.slice(0, 150), timestamp: new Date().toISOString(),
    }];
  }

  stages[0] = { stage: 1, name: "Claim Extraction", status: "complete", durationMs: Date.now() - s1Start, outputSummary: `${claims.length} claims extracted` };

  // ── STAGE 2: Contradiction Detection ───────────────────────────────────────
  const s2Start = Date.now();
  stages.push({ stage: 2, name: "Contradiction Engine", status: "processing" });

  const govRecordsStr = GOV_RECORDS.map((r) => `[${r.domain.toUpperCase()}]: ${r.record}`).join("\n");
  const claimsStr = claims.map((c) => `- [${c.id}][${c.type}] ${c.content} (entity: ${c.entity}, confidence: ${c.confidence})`).join("\n");

  // Build witness consensus data for the most relevant domain
  const domainGuess = detectDomain(fullEvidence);
  const consensus = computeWitnessConsensus(domainGuess, fullEvidence);
  const witnessStr = `Domain: ${domainGuess} | ${consensus.supportingCount}/${consensus.totalRelevant} witnesses contradict official records | Average credibility: ${Math.round(consensus.consensusScore)}%`;

  const s2Prompt = STAGE2_PROMPT
    .replace("{GOV_RECORDS}", govRecordsStr)
    .replace("{CLAIMS}", claimsStr)
    .replace("{WITNESS_DATA}", witnessStr);

  const contradictionResult = await generateWithRetry(model, s2Prompt);
  const contraRaw = contradictionResult;
  const contraParsed = parseJSON<{ contradictions: Contradiction[] }>(contraRaw, { contradictions: [] });

  const contradictions: Contradiction[] = (contraParsed.contradictions || []).map((c, i) => ({
    claimId: c.claimId || claims[i % claims.length]?.id || "C1",
    claim: c.claim || claims[i % claims.length]?.content || "",
    officialRecord: c.officialRecord || "Government record inconsistency detected",
    contradictionType: c.contradictionType || "direct_conflict",
    severity: c.severity || "medium",
    explanation: c.explanation || "Discrepancy identified between evidence and records",
    confidence: typeof c.confidence === "number" ? c.confidence : 0.75,
    legalImplication: c.legalImplication || "Further investigation required",
    heatmapWeight: c.heatmapWeight || deriveSeverityWeight(c.severity || "medium"),
  }));

  stages[1] = { stage: 2, name: "Contradiction Engine", status: "complete", durationMs: Date.now() - s2Start, outputSummary: `${contradictions.length} contradictions detected` };

  // ── STAGE 3: Report Generation ─────────────────────────────────────────────
  const s3Start = Date.now();
  stages.push({ stage: 3, name: "Report Generator", status: "processing" });

  const contradictionScore = computeContradictionScore(contradictions);
  const witnessStatements = buildWitnessStatements(consensus, contradictions.length);

  const s3Prompt = STAGE3_PROMPT
    .replace("{CASE_ID}", caseId)
    .replace("{CONTRADICTION_COUNT}", String(contradictions.length))
    .replace("{CONTRADICTIONS}", JSON.stringify(contradictions, null, 2))
    .replace("{CLAIMS_SUMMARY}", claimsStr)
    .replace("{WITNESS_SUMMARY}", witnessStr);

  const reportResult = await generateWithRetry(model, s3Prompt);
  const reportRaw = reportResult;
  const reportParsed = parseJSON<{
    summary: string; verdict: string; overallConfidence: number;
    riskScore: number; contradictionScore: number; recommendation: string; legalNotice: string;
  }>(reportRaw, {
    summary: "Analysis complete. Evidence has been cross-referenced with government records.",
    verdict: contradictions.length > 0 ? "CONTRADICTION_FOUND" : "INCONCLUSIVE",
    overallConfidence: 0.65,
    riskScore: contradictions.length * 20,
    contradictionScore,
    recommendation: "Further investigation recommended by the relevant district authority.",
    legalNotice: "This AI-generated report is for preliminary audit purposes. Formal proceedings require human legal review.",
  });

  stages[2] = { stage: 3, name: "Report Generator", status: "complete", durationMs: Date.now() - s3Start, outputSummary: `Verdict: ${reportParsed.verdict}` };

  const escalationTriggered = (reportParsed.riskScore || 0) > 70 || contradictions.some((c) => c.severity === "critical");

  return {
    caseId,
    timestamp: new Date().toISOString(),
    claims,
    contradictions,
    witnessCorroboration: witnessStatements,
    summary: reportParsed.summary,
    verdict: (reportParsed.verdict as AuditReport["verdict"]) || "INCONCLUSIVE",
    overallConfidence: reportParsed.overallConfidence || 0.65,
    riskScore: Math.min(Math.round(reportParsed.riskScore || 0), 100),
    contradictionScore: Math.min(Math.round(reportParsed.contradictionScore || contradictionScore), 100),
    recommendation: reportParsed.recommendation,
    legalNotice: reportParsed.legalNotice,
    escalationTriggered,
    processingStages: stages,
  };
}

// ─── Media Analysis ────────────────────────────────────────────────────────────

export async function analyzeMedia(base64Data: string, mimeType: string, contextText?: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: MODEL, safetySettings });

  const prompt = `You are a forensic document analyst for the Mūla Śākṣī government audit system. Analyze this evidence and describe ALL content relevant to a government audit:

- Document numbers, dates, amounts, stamps, signatures, seals visible
- Names of persons, institutions, officials
- Location identifiers, geographic references
- Any internal inconsistencies visible in the document (mismatched fonts, altered dates, blurred areas)
- Quality assessment: original, photocopy, digitally altered, or OCR-extracted?
- Key figures and data points that could contradict or support government records

${contextText ? `Context from submitter: ${contextText}` : ""}

Provide a precise forensic description (3-5 paragraphs) for use in automated claim extraction. Be factual and specific.`;

  const result = await generateWithRetry(model, [
    prompt,
    { inlineData: { data: base64Data, mimeType } },
  ] as unknown as string);
  return result;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function detectDomain(text: string): "land" | "ration" | "pension" | "tender" | "scholarship" | "health" | "employment" {
  const lower = text.toLowerCase();
  if (lower.includes("land") || lower.includes("plot") || lower.includes("patta") || lower.includes("acre")) return "land";
  if (lower.includes("ration") || lower.includes("pds") || lower.includes("fair price") || lower.includes("grain")) return "ration";
  if (lower.includes("pension") || lower.includes("disburs") || lower.includes("elderly")) return "pension";
  if (lower.includes("tender") || lower.includes("contract") || lower.includes("road") || lower.includes("construction")) return "tender";
  if (lower.includes("scholarship") || lower.includes("student") || lower.includes("college")) return "scholarship";
  if (lower.includes("mgnregs") || lower.includes("job card") || lower.includes("100 days")) return "employment";
  if (lower.includes("health") || lower.includes("medicine") || lower.includes("camp")) return "health";
  return "land"; // default
}

function deriveSeverityWeight(severity: string): number {
  const map: Record<string, number> = { critical: 10, high: 7, medium: 4, low: 2 };
  return map[severity] ?? 4;
}

function computeContradictionScore(contradictions: Contradiction[]): number {
  if (contradictions.length === 0) return 0;
  const total = contradictions.reduce((sum, c) => {
    const severityWeight = deriveSeverityWeight(c.severity);
    return sum + severityWeight * c.confidence;
  }, 0);
  return Math.min(Math.round((total / (contradictions.length * 10)) * 100), 100);
}

function buildWitnessStatements(
  consensus: ReturnType<typeof computeWitnessConsensus>,
  contradictionCount: number
): WitnessStatement[] {
  return consensus.topWitnesses.map((w) => ({
    witnessId: w.id,
    alias: w.alias,
    region: w.region,
    language: w.language,
    corroborates: !w.corroboratesOfficial,
    statement: w.statement,
    credibilityScore: w.credibilityScore,
  }));
}
