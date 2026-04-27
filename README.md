# ⚖️ Mūla Śākṣī — Zero-Trust AI Audit System

> **Mūla Śākṣī** (Sanskrit: *Root Witness*) — an AI-powered contradiction detection system that cross-references citizen-submitted evidence against government records to surface fraud, discrepancies, and systemic irregularities.

[![Google Solution Challenge 2026](https://img.shields.io/badge/Google%20Solution%20Challenge-2026-4285F4?style=flat-square&logo=google)](https://developers.google.com/community/gdsc-solution-challenge)
[![Gemini 1.5 Pro](https://img.shields.io/badge/Gemini-1.5%20Pro-EA4335?style=flat-square&logo=google)](https://ai.google.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render)](https://render.com/)

---

## The Problem

India's welfare systems lose billions annually to PDS grain diversion, pension siphoning, inflated tenders, ghost scholarship beneficiaries, and manipulated land records. Citizens who witness irregularities have no systematic way to verify or document them.

## The Solution

Mūla Śākṣī gives every citizen access to a **forensic AI audit pipeline** powered by Gemini 1.5 Pro:

1. **Extracts every verifiable claim** from evidence using structured AI analysis
2. **Cross-references** those claims against government records + 70-witness consensus dataset
3. **Generates a legal-grade audit report** with contradiction score, risk score, integrity heatmap, and escalation path

---

## Architecture

```
Next.js Frontend → API Routes → Gemini 1.5 Pro (3-Stage Chain) → File-based JSON Store
                                      │
                              Synthetic Dataset
                              (70 witness entries)
```

### AI Pipeline

| Stage | Name | Description |
|-------|------|-------------|
| 1 | Claim Extraction | Extracts entities, events, quantities, locations with confidence scores |
| 2 | Contradiction Engine | Cross-references against gov records + 70 witnesses; classifies by type/severity |
| 3 | Report Generator | Produces legal verdict, risk score, recommendation, legal notice |

---

## Project Structure

```
mula-sakshi/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   ├── submit/page.tsx               # Evidence upload + processing animation
│   ├── report/[id]/page.tsx          # Animated report reveal
│   └── api/
│       ├── analyze/route.ts          # POST — 3-stage Gemini pipeline
│       ├── submissions/route.ts      # POST/GET — submission management
│       └── reports/[id]/route.ts     # GET — fetch report
├── components/
│   ├── ui/
│   │   ├── ScoreMeter.tsx            # SVG gauge (animated)
│   │   ├── IntegrityHeatmap.tsx      # 9-domain heatmap
│   │   └── ProcessingAnimation.tsx   # Pipeline stage animation
│   └── report/
│       ├── ContradictionCard.tsx     # Expandable citizen vs official view
│       └── EscalationBanner.tsx      # Auto-escalation trigger
├── lib/
│   ├── gemini.ts                     # Full 3-stage Gemini pipeline
│   ├── firebase-admin.ts             # Thin shim → delegates to db.ts
│   ├── db.ts                         # File-backed JSON store (no external DB needed)
│   ├── demoData.ts                   # Pre-built demo report + 5 cases
│   └── utils.ts                      # Shared helpers
├── data/
│   └── witnesses.ts                  # 70 synthetic witness entries
├── types/index.ts                    # Full TypeScript types
├── styles/globals.css                # Grain, cursors, gradients
└── render.yaml                       # Render deployment blueprint
```

---

## Quick Start

### 1. Install

```bash
git clone https://github.com/your-username/mula-sakshi.git
cd mula-sakshi
npm install
```

### 2. Configure

```bash
cp .env.example .env.local
# Edit .env.local — add at minimum: GEMINI_API_KEY
```

Get a free Gemini key at: https://aistudio.google.com/app/apikey

### 3. Run

```bash
npm run dev
# Open http://localhost:3000
```

### 4. Demo (no API key needed for UI)

```
http://localhost:3000/report/demo
```

---


*Built for Google Solution Challenge 2026. "The root witness never lies."*
