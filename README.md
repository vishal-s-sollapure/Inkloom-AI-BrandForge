# BrandForge
### Intelligent Pre-Publication Brand Governance & Compliance Platform
**Inkloom AI Brand Governance Challenge — Round 3 (The Finish)**

[![Netlify Status](https://img.shields.io/badge/Netlify-Deployed%20Live-10B981?logo=netlify&logoColor=white)](https://brandforge-inkloom.netlify.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?logo=github&logoColor=white)](https://github.com/vishal-s-sollapure/Inkloom-AI-BrandForge)
[![Vanilla JS](https://img.shields.io/badge/Stack-HTML5%20%2F%20CSS3%20%2F%20JS-F7DF1E?logo=javascript&logoColor=black)](#)
[![Google Gemini](https://img.shields.io/badge/AI%20Engine-Gemini%20Flash-4285F4?logo=google&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Cloud%20DB-Supabase%20PostgreSQL%20%2B%20RLS-3ECF8E?logo=supabase&logoColor=white)](#)
[![Automated Tests](https://img.shields.io/badge/Tests-70%2F70%20Passed-10B981)](#)

---

## 📌 Executive Overview

**BrandForge** is an enterprise-grade pre-publication brand governance platform that evaluates marketing copy against approved brand guidelines, preferred terminology, verified facts, and tone rules before content is published.

In fast-paced organizations, marketing teams, external agencies, and generative AI tools frequently introduce off-brand terminology (*"cheap tool"*, *"our bot"*), unsubstantiated superlatives (*"100% foolproof"*, *"guarantees zero risk"*), and aggressive hype that damages brand trust and creates regulatory exposure.

In **Round 2 (The Build)**, BrandForge established its core foundation: a deterministic lexical rules engine, side-by-side visual diffs, and audit exports running client-side.

In **Round 3 (The Finish)**, BrandForge completes its transformation into a production-grade, collaborative, AI-powered brand governance product delivering **all three committed Round 3 improvements**:
1. **Evidence-Backed AI Brand Review** powered by Google Gemini with structured JSON schemas, policy grounding, claim-verification tagging, and deterministic fallback.
2. **Collaborative Multi-Role Governance Workflow** backed by Supabase PostgreSQL, Row-Level Security (RLS), 3 distinct stakeholder roles (`Content Creator`, `Brand Custodian`, `Legal & Compliance Officer`), in-line contextual comments on visual diffs, and cryptographic SHA-256 compliance seals.
3. **Governance Intelligence & Policy Friction Radar** providing aggregate analytics, guideline gap detection, and actionable clarity recommendations based on real review patterns.

---

## 👥 Team & Submission Details

- **Challenge:** Inkloom AI — Intelligent Brand Governance
- **Project Name:** BrandForge
- **Participant:** Vishal S Sollapure
- **Team Name:** BrandForge
- **Stage:** Round 3 — The Finish (Final Production Submission)
- **Live Deployed Application:** [https://brandforge-inkloom.netlify.app/](https://brandforge-inkloom.netlify.app/)
- **Source Code Repository:** [https://github.com/vishal-s-sollapure/Inkloom-AI-BrandForge](https://github.com/vishal-s-sollapure/Inkloom-AI-BrandForge)
- **Automated Test Coverage:** 70 / 70 tests passing across 4 comprehensive suites (100% success rate).

---

## 🚀 The Three Round 3 Improvements Delivered

### Improvement 1: Evidence-Backed AI Brand Review
- **Secure Serverless Proxy:** External LLM calls route through a serverless Netlify function (`/.netlify/functions/review`), ensuring API credentials (`GEMINI_API_KEY`) never leak to client browsers.
- **Strict Structured JSON Schema:** The model is constrained via Google Gemini Structured Outputs / JSON mode to return a strictly typed schema containing `findings` and `suggestedRevision`.
- **Policy Grounding & Attribution:** Active brand guidelines (voice, tone, prohibited terms, approved facts) are injected into the grounding prompt. Every critique is bound to an explicit `guidelineSection` and `ruleCitation`.
- **Factual Claims vs. Brand Violations:** Explicitly isolates claims requiring factual evidence (`factualVerificationRequired: true`) from straightforward stylistic or tone rule mismatches.
- **Deterministic Offline Fallback:** If the external AI service is unreachable, timed out, or unconfigured, the system automatically falls back to the deterministic engine without breaking the user's workflow.

### Improvement 2: Collaborative Multi-Role Governance Workflow
- **Role-Based Access Control (RBAC):** Three distinct stakeholder roles with cryptographically and schema-enforced boundaries:
  - **Content Creator (`creator`):** Ingests copy, runs AI checks, inspects visual diffs, and transitions drafts from `Drafting` ➔ `In Review`.
  - **Brand Custodian (`custodian`):** Evaluates voice and tone, leaves in-line comments, and grants `Brand Approved` or issues `Changes Requested`.
  - **Legal & Compliance Officer (`legal`):** Inspects factual claims, verifies evidence citations, and grants final `Legally Cleared` status.
- **5-Stage State Machine:** `Drafting` ➔ `In Review` ➔ `Changes Requested` ➔ `Brand Approved` ➔ `Legally Cleared`. Unauthorized state transitions (e.g., creator self-approving or legal skipping brand custodian approval) are blocked both in frontend state and at the PostgreSQL RLS level.
- **In-Line Contextual Comments on Visual Diffs:** Reviewers can highlight specific text spans in the side-by-side diff viewer to initiate threaded contextual discussions, complete with resolution toggles.
- **Cryptographic SHA-256 Pre-Publication Seal:** When legal clearance is granted, the platform hashes the canonical content, active guideline version, dual sign-off user IDs, and timestamps using Web Cryptography SHA-256, generating an immutable, tamper-evident compliance receipt.
- **Supabase Cloud Persistence & Row-Level Security:** 8 relational tables protected by PostgreSQL RLS policies, anti-escalation triggers (`prevent_profile_escalation`), search-path security (`SET search_path = public, pg_temp;`), and strictly append-only audit logs.
- **3-State Real-Time Connection Indicator:** Seamlessly transitions between 🟡 **Local Sandbox Mode** (isolated browser storage), 🔵 **Gateway Verified** (Supabase connected, sign-in required), and 🟢 **Live Authenticated** (PostgreSQL + RLS active).

### Improvement 3: Governance Intelligence & Policy Friction Radar
- **Recurring Violation Analytics:** Identifies high-frequency rule infractions across historical reviews.
- **Guideline Gap & Clarity Recommendations:** Heuristically detects ambiguous or overly restrictive rules where creators frequently trigger warnings, recommending editorial adjustments.
- **Approval Distribution & Risk Breakdown:** Visual progress indicators tracking first-pass approval rates, rejection patterns, and high-severity compliance blockers.

---

## 🛠️ Technology Stack & Architecture

BrandForge combines a lightweight, zero-build vanilla frontend with enterprise-grade cloud serverless services:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BrandForge Client App                           │
│     (HTML5 • CSS3 Plum/Rose Theme • Modular ES2022 JavaScript)         │
└──────────────────┬───────────────────────────────┬─────────────────────┘
                   │                               │
        PostgREST / Auth API                Serverless Proxy
     (Bearer JWT / Anon Key)              (POST /api/review)
                   │                               │
                   ▼                               ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       Supabase PostgreSQL 15+        │  │  Netlify Serverless Function │
│  • Row-Level Security (RLS)          │  │  • Environment Security      │
│  • 8 Relational Tables               │  │  • Input Validation          │
│  • Anti-Escalation Triggers          │  │  • JSON Schema Enforcement   │
│  • Append-Only Audit Trails          │  └──────────────┬───────────────┘
│  • GoTrue Email/Password Auth        │                 │
└──────────────────────────────────────┘                 ▼
                                          ┌──────────────────────────────┐
                                          │      Google Gemini API       │
                                          │  • Gemini 1.5 / 2.5 Flash    │
                                          │  • Structured JSON Output    │
                                          │  • Policy Grounding Context  │
                                          └──────────────────────────────┘
```

### Complete Project File Structure

```
Inkloom-AI-BrandForge/
├── index.html                 # Semantic application shell & accessible layout (Active runtime)
├── styles.css                 # Responsive design system (Plum, rose, clay palette)
├── app.js                     # Modular frontend logic, Supabase manager, diff builder & workflow engine
├── server.js                  # Local Node.js test & development static server (port 5173)
├── netlify.toml               # Netlify build, serverless functions, and header security config
├── package.json               # Test runners, scripts, and production dependencies
├── netlify/
│   └── functions/
│       ├── review.mjs         # Netlify serverless API endpoint for brand reviews
│       ├── geminiReview.mjs   # Grounding prompt, JSON schema, and Gemini SDK integration
│       └── supabaseClient.mjs # Server-side Supabase client configuration
├── supabase/
│   ├── schema.sql             # Complete 8-table relational schema with RLS and triggers
│   └── migration_security_patch.sql # Standalone security patch for role escalation guards
├── tests/
│   ├── rulesEngine.test.js    # 20 tests: Deterministic lexical engine & heuristic scoring
│   ├── aiReview.test.js       # 10 tests: Schema compliance, grounding, and fallbacks
│   ├── collaborativeWorkflow.test.js # 10 tests: RBAC, state machine, and SHA-256 seals
│   └── supabaseWorkflow.test.js      # 15 tests: RLS schema, UUIDs, and append-only audits
├── README.md                  # Comprehensive platform documentation & setup guide
├── ROUND_3_THE_FINISH.md      # Round 3 formal submission specifications
├── TEST-REPORT.md             # Empirical test results from all test suites
└── .env.example               # Template for required environment variables
```

---

## 🗄️ Relational Database Schema & Security Architecture

The platform's persistence layer is built on PostgreSQL with strict Row-Level Security:

| Table Name | Purpose | RLS Policy & Security Boundary |
| :--- | :--- | :--- |
| `public.organizations` | Multi-tenant organization boundaries | Users can only view their active organization. |
| `public.profiles` | User profiles, roles, and org bindings | Users view their own org; anti-escalation trigger blocks client-side role updates. |
| `public.brand_guidelines` | Versioned brand guidelines | Org members can view; only Brand Custodians can modify. |
| `public.campaigns` | Campaign metadata and lifecycle states | Org members view; creators create/edit drafts; custodians/legal execute approvals. |
| `public.campaign_revisions` | Versioned history of drafts & reviews | Append-only revisions tied to campaigns; viewable by org members. |
| `public.review_comments` | In-line contextual diff comment threads | Org members view; authors and custodians/legal can resolve. |
| `public.compliance_seals` | Cryptographic SHA-256 compliance receipts | Viewable across org; insertable **only by Legal Officers** upon final clearance. |
| `public.audit_events` | Immutable historical governance log | **Strictly append-only:** `UPDATE` and `DELETE` privileges revoked for all roles. |

---

## 📐 Scoring & Verification Methodology

BrandForge combines transparent deterministic heuristics with AI evaluation:

### Heuristic Scoring Formula
$$\text{Score} = \max\left(10, \; 100 - \sum \text{Deductions}\right)$$
- **High Severity Finding:** $-18$ points (Prohibited terminology, unverified absolute claims, critical legal risks).
- **Medium Severity Finding:** $-8$ points (Aggressive hype, juvenile tone, off-brand messaging).
- **Low Severity Finding:** $-3$ points (Accessibility issues, sentences $>30$ words, minor formatting).
- Minimum floor: 10 points (explicitly designated as a heuristic governance score, not a legal warranty).

---

## 🧪 Automated Testing Suite (55 / 55 Passed)

The platform is backed by 55 automated unit and integration tests executing across 4 specialized suites:

```bash
npm test
```

### Test Suite Breakdown:

#### 1. Rules Engine & Heuristic Verification (`tests/rulesEngine.test.js`)
- `TC-01`: Input validation rejects empty title or content &rarr; **PASS**
- `TC-02`: Detects prohibited terminology (`"cheap tool"`, `"bulletproof"`, `"foolproof"`) &rarr; **PASS**
- `TC-03`: Flags unapproved promissory claims for human verification (`"guaranteed"`, `"100%"`) &rarr; **PASS**
- `TC-04`: Flags juvenile hyperbole and aggressive hype (`"literally magic"`, `"total dominance"`) &rarr; **PASS**
- `TC-05`: Flags sentences exceeding the 30-word accessibility limit &rarr; **PASS**
- `TC-06`: Returns zero findings and 100% score for compliant content &rarr; **PASS**
- `TC-07`: Deducts score by severity: High (-18), Medium (-8), Low (-3) with floor of 10 &rarr; **PASS**
- `TC-08`: Generates transparent deterministic replacement preserving text structure &rarr; **PASS**
- `TC-09`: Accurately computes words and characters with whitespace handling &rarr; **PASS**
- `TC-10`: Safely escapes user-defined punctuation and special characters &rarr; **PASS**
- `TC-11`: Handles whitespace-only inputs without crashing &rarr; **PASS**
- `TC-12`: Handles disabled or throwing storage gracefully without breaking in-memory state &rarr; **PASS**
- `TC-13`: Search filter accurately matches records by title or content type &rarr; **PASS**
- `TC-14`: Workflow loop: Applying revision and re-running elevates score &rarr; **PASS**
- `TC-15`: Aggregates rule frequencies, approval distribution, and high risk findings &rarr; **PASS**
- `TC-16`: Validates input boundary conditions: title length, word count, character caps &rarr; **PASS**
- `TC-17`: Every finding contains an explicit guidelineSection attribution &rarr; **PASS**
- `TC-18`: buildDiffData generates HTML diff markup with deletions and insertions &rarr; **PASS**
- `TC-19`: Records explicit rejection (changes requested) with reviewer notes and status filtering &rarr; **PASS**
- `TC-20`: Audit serializer outputs valid, structured JSON and formatted Markdown &rarr; **PASS**

#### 2. AI Review Engine & Schemas (`tests/aiReview.test.js`)
- `TC-AI-01`: Input validation rejects empty title, title > 120 chars, and brief content &rarr; **PASS**
- `TC-AI-02`: Grounding prompt ingests active guidelines, avoided terms, and facts &rarr; **PASS**
- `TC-AI-03`: GEMINI_REVIEW_SCHEMA enforces required findings and suggested revision keys &rarr; **PASS**
- `TC-AI-04`: Deterministic fallback separates factual claims requiring evidence from violations &rarr; **PASS**
- `TC-AI-05`: Flags prohibited terminology with exact replacement and high severity &rarr; **PASS**
- `TC-AI-06`: Suggested revision substitutes avoided terms and preserves grammar &rarr; **PASS**
- `TC-AI-07`: Heuristic score deducts by severity and respects minimum floor of 10 &rarr; **PASS**
- `TC-AI-08`: reviewBrand() with forceEngine="deterministic" succeeds with full payload &rarr; **PASS**
- `TC-AI-09`: reviewBrand() cleanly falls back to deterministic engine when API key is unset &rarr; **PASS**
- `TC-AI-10`: reviewBrand() returns status 400 when title or content violates bounds &rarr; **PASS**

#### 3. Collaborative Workflow & State Machine (`tests/collaborativeWorkflow.test.js`)
- `TC-WF-01`: Three distinct stakeholder roles are defined with labels &rarr; **PASS**
- `TC-WF-02`: Content Creator can transition Drafting -> In Review and re-submit after changes &rarr; **PASS**
- `TC-WF-03`: Content Creator cannot unilaterally grant Brand Approval or Legal Clearance &rarr; **PASS**
- `TC-WF-04`: Brand Custodian can approve brand voice or request changes on review queue &rarr; **PASS**
- `TC-WF-05`: Legal Officer can grant legal clearance or request factual documentation &rarr; **PASS**
- `TC-WF-06`: Legal Officer cannot bypass Brand Custodian approval directly from Drafting or In Review &rarr; **PASS**
- `TC-WF-07`: In-line comment threads validate input and attach to review record &rarr; **PASS**
- `TC-WF-08`: Comment resolution toggle toggles resolved state &rarr; **PASS**
- `TC-WF-09`: generateComplianceSeal produces 64-char hex hash and binds dual sign-offs &rarr; **PASS**
- `TC-WF-10`: verifyComplianceSeal validates intact content and flags tampered drafts &rarr; **PASS**

#### 4. Supabase RLS & Persistence Security (`tests/supabaseWorkflow.test.js`)
- `TC-SB-01`: supabase/schema.sql exists and is non-empty &rarr; **PASS**
- `TC-SB-02`: Schema defines all 8 required relational tables &rarr; **PASS**
- `TC-SB-03`: Schema enables RLS and configures user roles and lifecycle enums &rarr; **PASS**
- `TC-SB-04`: Schema enforces append-only security for audit_events with no update/delete policies &rarr; **PASS**
- `TC-SB-05`: getSupabaseConfig accurately evaluates environment credentials &rarr; **PASS**
- `TC-SB-06`: LocalFallbackStore inserts campaign with status "drafting" and version 1 &rarr; **PASS**
- `TC-SB-07`: LocalFallbackStore records append-only audit event with actor role and state transitions &rarr; **PASS**
- `TC-SB-08`: LocalFallbackStore rejects audit event missing required fields &rarr; **PASS**
- `TC-SB-09`: LocalFallbackStore records compliance seal with SHA-256 hash and dual sign-offs &rarr; **PASS**
- `TC-SB-10`: LocalFallbackStore rejects compliance seal when signatures or hash are missing &rarr; **PASS**
- `TC-SB-11`: Security-definer functions enforce fixed search_path = public, pg_temp &rarr; **PASS**
- `TC-SB-12`: handle_new_user hardcodes default role 'creator' and does not trust client metadata &rarr; **PASS**
- `TC-SB-13`: Profiles table has trigger preventing client-side role or organization escalation &rarr; **PASS**
- `TC-SB-14`: supabase/migration_security_patch.sql exists and contains idempotent security hardening &rarr; **PASS**
- `TC-SB-15`: UUID validation accepts valid RFC 4122 UUIDs and rejects invalid strings &rarr; **PASS**
- `TC-SB-16`: Profiles update policy enforces self-ownership and anti-escalation guards &rarr; **PASS**
- `TC-SB-17`: RLS policies enforce strict organization isolation across all entity tables &rarr; **PASS**
- `TC-SB-18`: Compliance seal creation is restricted strictly to legal role in RLS policy &rarr; **PASS**
- `TC-SB-19`: Database connectivity check queries organizations table to prevent false HTTP 401s &rarr; **PASS**
- `TC-SB-20`: SupabaseManager cleanly distinguishes sandbox, connected, and authenticated states &rarr; **PASS**
- `TC-SB-21`: Campaigns update policy contains WITH CHECK clause permitting valid status transitions &rarr; **PASS**
- `TC-SB-22`: Campaign revisions table defines explicit UPDATE RLS policy to support upserts &rarr; **PASS**
- `TC-SB-23`: Status normalization correctly maps legacy statuses to valid campaign_status enums &rarr; **PASS**
- `TC-SB-24`: Database writes inspect Supabase errors and return explicit failure payloads &rarr; **PASS**
- `TC-SB-25`: Profiles selection policy includes id = auth.uid() self-recovery guard &rarr; **PASS**
- `TC-SB-26`: saveHistory does not trigger unawaited background cloud sync writes &rarr; **PASS**
- `TC-SB-27`: Approval modal guards success toast with verified cloud writes &rarr; **PASS**
- `TC-SB-28`: Legal clearance verifies sync, status update, and seal recording &rarr; **PASS**
- `TC-SB-29`: Review history displays cloud vs local persistence badges &rarr; **PASS**
- `TC-SB-30`: Gemini API key sanitization and safe diagnostic endpoint &rarr; **PASS**

**Overall Test Results: 70 / 70 Passed (100% Pass Rate)**

---

## 💻 How to Run Locally

### Option 1: Direct File Open (Zero Dependencies)
Simply open `index.html` directly in any modern browser. BrandForge operates in **Local Sandbox Mode** with in-memory / localStorage persistence.

### Option 2: Local Static Server (Node.js)
```bash
npm start
# or: node server.js
```
Open your browser at `http://localhost:5173/`.

### Option 3: Vite Dev Server
```bash
npm run dev
```

---

## 🌐 Environment Configuration

To configure the live cloud services, set the following environment variables (e.g. in your Netlify Site Configuration or local `.env`):

```bash
# Google Gemini API Key (Server-side only)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Project Credentials (Client and Serverless)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_public_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_private_service_role_key_here
```

---

## 🔒 Privacy, Security & AI Governance Disclosures

- **Stateless Serverless Proxy:** Marketing copy processed by the AI review engine is transmitted over HTTPS directly to the serverless function and evaluated via the Gemini API. Neither Netlify nor BrandForge permanently caches raw copy.
- **Client-Side Secrets Protection:** All API keys (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are strictly confined to server-side execution. Only the public `anon` key is used in the browser.
- **Append-Only Auditing:** Governance events (`audit_events`) can never be modified or deleted by normal authenticated users.
- **Anti-Escalation Architecture:** Regular users cannot self-assign higher roles (`custodian` or `legal`) via client requests; roles are governed by PostgreSQL triggers and administrative assignment.
- **Verifiable Cryptography:** Compliance seals use SHA-256 to guarantee that approved text has not been tampered with prior to publication.

---

## 📄 License & Attribution

Developed for the **Inkloom AI Brand Governance Challenge (Codex 48)**.  
Participant: **Vishal S Sollapure** | Team: **BrandForge**  
Live Application: [https://brandforge-inkloom.netlify.app/](https://brandforge-inkloom.netlify.app/)
