import type { AuditReport, Submission } from "@/types";

export const DEMO_CASES = [
  {
    id: "demo-land",
    title: "Land Record Discrepancy – Mahesana District",
    category: "Land Records",
    description: "My patta shows 2.1 acres for plot 247-B but the tahsildar office registration shows 3.5 acres. Stamp duty was paid in 2019 for 2.1 acres. The difference of 1.4 acres was later sold to Dhruv Constructions without my knowledge.",
  },
  {
    id: "demo-ration",
    title: "PDS Ration Diversion – Surat",
    category: "Public Distribution",
    description: "Our fair price shop shows 35kg monthly delivery on their register, but our BPL card entitlement is only 25kg. The extra 10kg is being diverted. This has been happening since January 2023 when they started falsifying records.",
  },
  {
    id: "demo-pension",
    title: "Pension Non-Disbursement – Rajkot",
    category: "Social Welfare",
    description: "Government records show monthly disbursement of ₹1200 to Savitaben Mehta but she has not received pension since October 2023. Bank statement confirms no deposits. Post office records show delivery confirmed — a clear contradiction.",
  },
  {
    id: "demo-tender",
    title: "Road Contract Inflation – Ahmedabad",
    category: "Infrastructure",
    description: "The tender for CG Road was awarded at ₹3.8 crore. Work certificate shows completion at ₹5.2 crore with change order dated March 2025. Road is still unpaved as of April 2026. Completion certificate is fraudulent.",
  },
  {
    id: "demo-scholarship",
    title: "Ghost Scholarship Beneficiary – Vadodara",
    category: "Education",
    description: "Scholarship was disbursed to student ID GJ-SC-2023-4821 for ₹75,000 per education department records. However, Ronak Patel withdrew from college in June 2023 before the eligibility period began.",
  },
];

export const DEMO_REPORT: AuditReport = {
  caseId: "MS-DEMO001",
  timestamp: new Date().toISOString(),
  verdict: "CONTRADICTION_FOUND",
  overallConfidence: 0.91,
  riskScore: 83,
  contradictionScore: 78,
  escalationTriggered: true,
  summary:
    "Analysis of submitted evidence reveals critical discrepancies between citizen-reported land records and official government database entries. Two high-severity contradictions have been identified involving area measurement fraud and unauthorized property transfer, both indicating systematic collusion between local officials and private developers in Mahesana District.",
  recommendation:
    "IMMEDIATE ACTION REQUIRED: (1) Suspend all pending property transactions for Plot No. 247-B pending investigation. (2) Escalate to District Collector and Anti-Corruption Bureau, Gandhinagar. (3) Commission independent physical survey of the plot. (4) Request Sub-Registrar office audit of records from 2019-2024. FIR under Prevention of Corruption Act 1988, Section 13(1)(d) may be warranted pending legal review by the District Prosecution Office.",
  legalNotice:
    "This report constitutes a preliminary AI audit finding under the Mūla Śākṣī Zero-Trust Governance Framework. The identified contradictions may constitute offenses under: Prevention of Corruption Act 1988 (S. 13), Indian Penal Code (S. 420 - Cheating, S. 465 - Forgery of valuable security), Registration Act 1908 (S. 82 - Fraudulent document registration). This document shall serve as evidentiary basis for formal investigation by competent authority. All parties named have right to due process under the Constitution of India.",
  claims: [
    {
      id: "C1", type: "amount", entity: "Land Registration - Plot 247-B",
      event: "Area recorded in registration document",
      quantity: "3.5 acres", location: "Mahesana District",
      content: "Land registration shows 3.5 acres for plot 247-B",
      confidence: 0.95, sourceQuote: "tahsildar office registration shows 3.5 acres",
      timestamp: new Date().toISOString(),
    },
    {
      id: "C2", type: "document", entity: "Patta Document - Plot 247-B",
      event: "Area recorded in patta",
      quantity: "2.1 acres", location: "Mahesana District",
      content: "Patta document shows 2.1 acres — 1.4 acres less than registration",
      confidence: 0.95, sourceQuote: "patta shows 2.1 acres",
      timestamp: new Date().toISOString(),
    },
    {
      id: "C3", type: "date", entity: "Stamp Duty Receipt",
      event: "Stamp duty payment for land transaction",
      quantity: null, location: null,
      content: "Stamp duty paid in 2019 for 2.1 acres — predates alleged expansion",
      confidence: 0.90, sourceQuote: "Stamp duty was paid in 2019 for 2.1 acres",
      timestamp: new Date().toISOString(),
    },
    {
      id: "C4", type: "event", entity: "Dhruv Constructions",
      event: "Unauthorized construction on disputed land area",
      quantity: "1.4 acres", location: "Plot 247-B",
      content: "Dhruv Constructions has begun construction on the 1.4-acre disputed land",
      confidence: 0.87, sourceQuote: "difference of 1.4 acres was later sold to Dhruv Constructions",
      timestamp: new Date().toISOString(),
    },
  ],
  contradictions: [
    {
      claimId: "C1",
      claim: "Land registration shows 3.5 acres for Plot 247-B",
      officialRecord: "Patta and stamp duty record indicate 2.1 acres for the same plot. Government land database: 2.3 acres (Survey No. 14, Mahesana).",
      contradictionType: "amount_discrepancy",
      severity: "critical",
      explanation: "A 1.4-acre discrepancy between registration (3.5 acres) and patta/survey records (2.1–2.3 acres) cannot be a clerical error. The surplus 1.4 acres appears to have been fraudulently added to the registration record post-facto, then sold to a developer. Witness consensus of 91% across 12 independent sources confirms the discrepancy.",
      confidence: 0.93,
      legalImplication: "Potential forgery of registration document under Registration Act 1908 (S.82). Unauthorized transfer of government/disputed land. FIR warranted under IPC S.420, S.465, and Prevention of Corruption Act 1988.",
      heatmapWeight: 10,
      reasoningTrace: [
        { step: 1, label: "Evidence located", detail: "Citizen's patta document explicitly states 2.1 acres for Plot 247-B, Survey No. 14.", verdict: "neutral" as const },
        { step: 2, label: "Official record retrieved", detail: "Tahsildar registration database shows 3.5 acres for the same plot reference number.", verdict: "neutral" as const },
        { step: 3, label: "Discrepancy measured", detail: "Delta of 1.4 acres (66% inflation). Cannot be attributable to measurement methodology differences.", verdict: "flag" as const },
        { step: 4, label: "Transaction trail detected", detail: "Builder Dhruv Constructions appears in concurrent records — inflated land sold post-registration alteration.", verdict: "flag" as const },
        { step: 5, label: "Witness consensus applied", detail: "12 of 12 relevant witnesses confirm original plot size as ~2.1 acres. Zero dissent.", verdict: "flag" as const },
        { step: 6, label: "Contradiction confirmed", detail: "Registration record is the anomalous document. Patta, stamp duty, survey, and witness consensus all align at 2.1–2.3 acres.", verdict: "flag" as const },
      ],
    },
    {
      claimId: "C4",
      claim: "Dhruv Constructions has begun unauthorized construction on 1.4 acres not owned by submitter",
      officialRecord: "Plot 247-B registered owner: Ramesh Patel (2.3 acres). No record of authorized transfer to Dhruv Constructions.",
      contradictionType: "direct_conflict",
      severity: "critical",
      explanation: "Private construction on land without authorized transfer record is a direct legal violation. The transaction appears to be a result of fraudulent registration inflation — inflating the plot from 2.1/2.3 to 3.5 acres, then selling the 'additional' 1.4 acres to a developer.",
      confidence: 0.88,
      legalImplication: "Unauthorized construction may violate Gujarat Town Planning Act. Fraudulent land sale under IPC S.420. Criminal conspiracy under IPC S.120-B if government official complicit.",
      heatmapWeight: 9,
      reasoningTrace: [
        { step: 1, label: "Construction activity confirmed", detail: "Citizen reports active construction by Dhruv Constructions on land adjacent to their boundary.", verdict: "neutral" as const },
        { step: 2, label: "Ownership record checked", detail: "Land transfer registry shows no sale or lease agreement from Ramesh Patel to Dhruv Constructions.", verdict: "flag" as const },
        { step: 3, label: "Planning permission searched", detail: "Gujarat Town Planning authority shows no approved building permit for this plot.", verdict: "flag" as const },
        { step: 4, label: "Connection to C1 established", detail: "Construction is occurring precisely on the 1.4-acre surplus created by registration inflation in C1.", verdict: "flag" as const },
        { step: 5, label: "Contradiction confirmed", detail: "Construction without ownership transfer or permit directly contradicts property law. Links to registration fraud.", verdict: "flag" as const },
      ],
    },
  ],
  witnessCorroboration: [
    {
      witnessId: "W001", alias: "Witness Alpha", region: "Mahesana, Gujarat", language: "Gujarati",
      corroborates: true,
      statement: "Maro plot 247-B ni nodhani ma 2.1 acre che pan tahsildar record ma 3.5 acre dikhave che. Farq khub moto che.",
      credibilityScore: 0.91,
    },
    {
      witnessId: "W006", alias: "Witness Zeta", region: "Gandhinagar, Gujarat", language: "English",
      corroborates: true,
      statement: "I work as a surveyor. A discrepancy of 1.4 acres cannot be a measurement error. Someone has altered the records.",
      credibilityScore: 0.96,
    },
    {
      witnessId: "W059", alias: "Witness Lambda-3", region: "Aravalli, Gujarat", language: "English",
      corroborates: true,
      statement: "I'm a retired IAS officer. The pattern described is consistent with systemic fraud in rural land records. Requires CBI investigation.",
      credibilityScore: 0.99,
    },
  ],
  processingStages: [
    { stage: 1, name: "Claim Extraction", status: "complete", durationMs: 1847, outputSummary: "4 claims extracted" },
    { stage: 2, name: "Contradiction Engine", status: "complete", durationMs: 2310, outputSummary: "2 contradictions detected" },
    { stage: 3, name: "Report Generator", status: "complete", durationMs: 1590, outputSummary: "Verdict: CONTRADICTION_FOUND" },
  ],
};
