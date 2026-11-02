# BrandForge System Architecture

**Codex 48 Round 3 — The Finish**  
**Live Application:** [https://brandforge-inkloom.netlify.app/](https://brandforge-inkloom.netlify.app/)  
**GitHub Repository:** [https://github.com/vishal-s-sollapure/Inkloom-AI-BrandForge](https://github.com/vishal-s-sollapure/Inkloom-AI-BrandForge)

---

## 1. High-Level Architectural Overview

BrandForge is an intelligent pre-publication brand governance platform designed to prevent off-brand marketing drift, unverified promissory claims, and compliance discrepancies across enterprise teams. It unifies deterministic brand rule enforcement, serverless Gemini 1.5 Flash AI analysis, multi-role collaborative workflow, cryptographic compliance sealing, and real-time governance intelligence into a single cohesive system.

```mermaid
flowchart TD
    subgraph Client ["Client Browser (BrandForge SPA)"]
        UI[Interactive UI / Clay Design System]
        Engine[Deterministic Rules Engine]
        Intel[Governance Intelligence & Policy Friction Radar]
        SupabaseClient[Supabase JS Client v2 (Public Anon Key)]
    end

    subgraph Serverless ["Netlify Functions (Zero-Retention Backend)"]
        ReviewFn["/.netlify/functions/review-brand"]
        GeminiCore["reviewBrandCore.mjs"]
    end

    subgraph External ["External Managed Services"]
        GoogleAI["Google Gemini 1.5 Flash API"]
        SupabaseDB["Supabase PostgreSQL + RLS + GoTrue Auth"]
    end

    UI --> Engine
    UI --> Intel
    UI -- "POST /api/review-brand" --> ReviewFn
    ReviewFn --> GeminiCore
    GeminiCore -- "x-goog-api-key" --> GoogleAI
    UI -- "JWT Session + RLS" --> SupabaseDB
```

---

## 2. Frontend Structure & Active Entry Points

The production web runtime is hosted at the project root:
- [`index.html`](file:///c:/Users/VISHAL/OneDrive/Desktop/Inkloom-AI-BrandForge/index.html): Semantic HTML5 single-page application structure comprising 4 core operational views:
  1. **Content Checker (`#view-checker`)**: Draft authoring, multi-stage governance stepper, side-by-side diff comparison, and in-line reviewer annotation threads.
  2. **Brand Guidelines (`#view-guidelines`)**: Structured brand identity manager for preferred terms, avoided terms, approved facts, promissory claim triggers, accessibility limits, and visual rules.
  3. **Review History (`#view-history`)**: Team campaign queue, status filtering, inspection modal, and cloud vs. local persistence tracking.
  4. **Governance Intelligence & Policy Friction Radar (`#view-insights`)**: Real-time compliance health KPIs, lifecycle velocity analysis, recurring violation tracking, guideline ambiguity diagnosis, and exportable audit reporting.
- [`styles.css`](file:///c:/Users/VISHAL/OneDrive/Desktop/Inkloom-AI-BrandForge/styles.css): Bespoke clay/dark design system with CSS custom properties, WCAG 2.1 AA accessible contrast ratios, responsive grids, and subtle elevation tokens.
- [`app.js`](file:///c:/Users/VISHAL/OneDrive/Desktop/Inkloom-AI-BrandForge/app.js): Core frontend controller orchestrating DOM event handling, local storage fallback, cryptographic SHA-256 seal generation, and Supabase client synchronization.

---

## 3. Serverless Backend & API Layer

BrandForge uses secure Netlify Serverless Functions running on Node.js:
- **`netlify/functions/review-brand.mjs`**: Public gateway endpoint routing brand review requests and safe diagnostic probes.
  - Sanitizes API key lookups (`GEMINI_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_GEMINI_API_KEY`) by stripping whitespace and quotation artifacts.
  - Implements a hardened diagnostic probe (`?diagnostic=true`) returning `{ status: 'ok', geminiConfigured: boolean, model: string }` without leaking keys, prefixes, or character lengths.
- **`netlify/functions/reviewBrandCore.mjs`**: Core AI evaluation engine.
  - Constructs structured, grounded prompts containing the active guidelines and prohibited terms.
  - Enforces Google Gemini JSON response schema validation.
  - Gracefully falls back to the deterministic rules engine when the API key is missing, invalid (HTTP 400), or rate-limited (HTTP 429), clearly marking `isFallback: true` and `engine: 'deterministic_fallback'`.
- **`src/services/governanceIntelligenceCore.mjs`**: Reusable analytical engine powering the Governance Intelligence & Policy Friction Radar.

---

## 4. Supabase Database Schema & Multi-Tenant Model

The persistence layer runs on managed PostgreSQL in Supabase (`https://mkwpjspbetawtcbguozw.supabase.co`):

| Table Name | Primary Purpose | Row Level Security (RLS) Policy |
| :--- | :--- | :--- |
| `organizations` | Workspace isolation root | Read-only to authenticated users belonging to the organization |
| `profiles` | Extended user identity, role, and organization link | Users can read org profiles; self-updating cannot escalate role or org |
| `brand_guidelines` | Active organizational brand guidelines | Organization members read; Custodian/Admin write |
| `campaigns` | Campaign documents and lifecycle stage | Org members read; Creator insert/update; Custodian & Legal advance status |
| `campaign_revisions` | Versioned content, compliance score, and findings | Org members read; Creator/Custodian insert & update |
| `review_comments` | Contextual in-line annotations and comment threads | Org members read; Creator/Custodian/Legal insert; Author resolves |
| `audit_events` | Append-only governance audit log | Org members read; authenticated insert; updates & deletes forbidden |
| `compliance_seals` | Immutable cryptographic sign-off receipts | Org members read; restricted strictly to Legal Reviewer role |

### PostgreSQL Enums
- `user_role`: `creator`, `custodian`, `legal`, `admin`
- `campaign_status`: `drafting`, `in_review`, `changes_requested`, `brand_approved`, `legally_cleared`

---

## 5. Security & Isolation Boundaries

1. **Zero Secret Exposure:**
   - The browser client only accesses the public Supabase Anon key and user authentication tokens.
   - The Supabase Service-Role key is strictly forbidden and never present in client bundles, serverless functions, or Git commits.
2. **Server-Side Anti-Escalation Guards:**
   - `public.prevent_profile_escalation()` trigger prevents users from self-assigning administrative or legal roles via signup metadata or profile updates.
3. **Append-Only Audit Log:**
   - `public.audit_events` permits `INSERT` and `SELECT`, but provides no `UPDATE` or `DELETE` policies, guaranteeing non-repudiation.
4. **Search Path Hardening:**
   - Database functions enforce fixed `SET search_path = public, pg_temp` to mitigate search-path hijacking attacks.
5. **Cryptographic Integrity Sealing:**
   - Pre-publication compliance seals use SHA-256 (NIST FIPS 180-4) hashes binding draft content, active guidelines, dual signer IDs, and timestamps.

