# BrandForge Testing Documentation

**Codex 48 Round 3 — The Finish**  
**Repository:** [https://github.com/vishal-s-sollapure/Inkloom-AI-BrandForge](https://github.com/vishal-s-sollapure/Inkloom-AI-BrandForge)  
**Live Application:** [https://brandforge-inkloom.netlify.app/](https://brandforge-inkloom.netlify.app/)  
**Overall Automated Test Status:** **85 / 85 PASSED (100% Success Rate)**

---

## 1. Test Execution Commands

To execute the entire test suite locally:

```bash
# Run all 85 automated tests across 5 test suites
npm test

# Run production build and type check
npm run build
```

To run individual test suites independently:

```bash
# 1. Deterministic Rules Engine (20 tests)
node tests/rulesEngine.test.js

# 2. Serverless AI Review & Fallback Engine (10 tests)
node tests/aiReview.test.js

# 3. Collaborative Workflow & Cryptographic Seals (10 tests)
node tests/collaborativeWorkflow.test.js

# 4. Supabase RLS, Persistence & Security (30 tests)
node tests/supabaseWorkflow.test.js

# 5. Governance Intelligence & Policy Friction Radar (15 tests)
node tests/governanceIntelligence.test.js
```

---

## 2. Test Suite Breakdown & Test Matrix

BrandForge maintains 85 automated tests written in Node.js with zero external test framework bloat, executing in **under 2 seconds**:

| Test Suite | File | Count | Pass Rate | Focus Areas |
| :--- | :--- | :---: | :---: | :--- |
| **Deterministic Rules Engine** | [`tests/rulesEngine.test.js`](file:///c:/Users/VISHAL/OneDrive/Desktop/Inkloom-AI-BrandForge/tests/rulesEngine.test.js) | 20 | 100% (20/20) | Prohibited terms, promissory claims, hyperbole, sentence length limits, score deductions, diff generation, audit serialization. |
| **AI Review Engine** | [`tests/aiReview.test.js`](file:///c:/Users/VISHAL/OneDrive/Desktop/Inkloom-AI-BrandForge/tests/aiReview.test.js) | 10 | 100% (10/10) | Gemini prompt grounding, structured JSON schema, deterministic fallback, factual claims extraction, safe diagnostics. |
| **Collaborative Workflow** | [`tests/collaborativeWorkflow.test.js`](file:///c:/Users/VISHAL/OneDrive/Desktop/Inkloom-AI-BrandForge/tests/collaborativeWorkflow.test.js) | 10 | 100% (10/10) | 3 distinct roles, role transition matrices, review queues, in-line comment threads, SHA-256 seal generation and tamper detection. |
| **Supabase RLS & Cloud Sync** | [`tests/supabaseWorkflow.test.js`](file:///c:/Users/VISHAL/OneDrive/Desktop/Inkloom-AI-BrandForge/tests/supabaseWorkflow.test.js) | 30 | 100% (30/30) | Schema verification, RLS policies on all 8 tables, anti-escalation triggers, status enum normalization, write failure handling, zero secret exposure. |
| **Governance Intelligence & Friction Radar** | [`tests/governanceIntelligence.test.js`](file:///c:/Users/VISHAL/OneDrive/Desktop/Inkloom-AI-BrandForge/tests/governanceIntelligence.test.js) | 15 | 15/15 (100%) | 8 KPI computations, lifecycle stage distribution, velocity bottlenecks, recurring brand drift, policy friction scanner, advisory rule rewrites, export serializers. |
| **Total** | | **85** | **100% (85/85)** | |

---

## 3. Detailed Test Catalog

### Suite 1: Deterministic Rules Engine (`tests/rulesEngine.test.js`)
- **TC-01:** Input validation rejects empty title or content.
- **TC-02:** Detects prohibited terminology (e.g., `"bulletproof"`, `"foolproof"`, `"cheap tool"`).
- **TC-03:** Flags unapproved promissory claims for human verification (e.g., `"guaranteed"`, `"100%"`).
- **TC-04:** Flags juvenile hyperbole and aggressive hype (e.g., `"literally magic"`, `"total dominance"`).
- **TC-05:** Flags sentences exceeding the 30-word accessibility limit.
- **TC-06:** Returns zero findings and 100% score for compliant content.
- **TC-07:** Deducts score by severity: High (-18), Medium (-8), Low (-3) with floor of 10.
- **TC-08:** Generates transparent deterministic replacement preserving text structure.
- **TC-09:** Accurately computes words and characters with whitespace handling.
- **TC-10:** Safely escapes user-defined punctuation and special characters.
- **TC-11:** Handles whitespace-only inputs without crashing.
- **TC-12:** Handles disabled or throwing storage gracefully without breaking in-memory state.
- **TC-13:** Search filter accurately matches records by title or content type.
- **TC-14:** Workflow loop: Applying revision and re-running elevates score.
- **TC-15:** Aggregates rule frequencies, approval distribution, and high-risk findings.
- **TC-16:** Validates input boundary conditions: title length, word count, character caps.
- **TC-17:** Every finding contains an explicit `guidelineSection` attribution.
- **TC-18:** `buildDiffData` generates HTML diff markup with deletions and insertions.
- **TC-19:** Records explicit rejection (changes requested) with reviewer notes and status filtering.
- **TC-20:** Audit serializer outputs valid, structured JSON and formatted Markdown.

### Suite 2: AI Review Engine (`tests/aiReview.test.js`)
- **TC-AI-01:** Input validation rejects empty title, title > 120 chars, and brief content.
- **TC-AI-02:** Grounding prompt ingests active guidelines, avoided terms, and facts.
- **TC-AI-03:** `GEMINI_REVIEW_SCHEMA` enforces required findings and suggested revision keys.
- **TC-AI-04:** Deterministic fallback separates factual claims requiring evidence from violations.
- **TC-AI-05:** Flags prohibited terminology with exact replacement and high severity.
- **TC-AI-06:** Suggested revision substitutes avoided terms and preserves grammar.
- **TC-AI-07:** Heuristic score deducts by severity and respects minimum floor of 10.
- **TC-AI-08:** `reviewBrand()` with `forceEngine="deterministic"` succeeds with full payload.
- **TC-AI-09:** `reviewBrand()` cleanly falls back to deterministic engine when API key is unset.
- **TC-AI-10:** `reviewBrand()` returns status 400 when title or content violates bounds.

### Suite 3: Collaborative Workflow (`tests/collaborativeWorkflow.test.js`)
- **TC-WF-01:** Three distinct stakeholder roles are defined with labels (`creator`, `custodian`, `legal`).
- **TC-WF-02:** Content Creator can transition `drafting` -> `in_review` and re-submit after changes.
- **TC-WF-03:** Content Creator cannot unilaterally grant Brand Approval or Legal Clearance.
- **TC-WF-04:** Brand Custodian can approve brand voice or request changes on review queue.
- **TC-WF-05:** Legal Officer can grant legal clearance or request factual documentation.
- **TC-WF-06:** Legal Officer cannot bypass Brand Custodian approval directly from Drafting or In Review.
- **TC-WF-07:** In-line comment threads validate input and attach to review record.
- **TC-WF-08:** Comment resolution toggle toggles resolved state.
- **TC-WF-09:** `generateComplianceSeal` produces 64-char hex hash and binds dual sign-offs.
- **TC-WF-10:** `verifyComplianceSeal` validates intact content and flags tampered drafts.

### Suite 4: Supabase RLS & Cloud Sync (`tests/supabaseWorkflow.test.js`)
- **TC-SB-01:** `supabase/schema.sql` exists and is non-empty.
- **TC-SB-02:** Schema defines all 8 required relational tables.
- **TC-SB-03:** Schema enables RLS and configures user roles and lifecycle enums.
- **TC-SB-04:** Schema enforces append-only security for `audit_events` with no update/delete policies.
- **TC-SB-05:** `getSupabaseConfig` accurately evaluates environment credentials.
- **TC-SB-06:** `LocalFallbackStore` inserts campaign with status `"drafting"` and version 1.
- **TC-SB-07:** `LocalFallbackStore` records append-only audit event with actor role and state transitions.
- **TC-SB-08:** `LocalFallbackStore` rejects audit event missing required fields.
- **TC-SB-09:** `LocalFallbackStore` records compliance seal with SHA-256 hash and dual sign-offs.
- **TC-SB-10:** `LocalFallbackStore` rejects compliance seal when signatures or hash are missing.
- **TC-SB-11:** Security-definer functions enforce fixed `search_path = public, pg_temp`.
- **TC-SB-12:** `handle_new_user` hardcodes default role `'creator'` and does not trust client metadata.
- **TC-SB-13:** `profiles` table has trigger preventing client-side role or organization escalation.
- **TC-SB-14:** `supabase/migration_security_patch.sql` exists and contains idempotent security hardening.
- **TC-SB-15:** UUID validation accepts valid RFC 4122 UUIDs and rejects invalid strings.
- **TC-SB-16:** Profiles update policy enforces self-ownership and anti-escalation guards.
- **TC-SB-17:** RLS policies enforce strict organization isolation across all entity tables.
- **TC-SB-18:** Compliance seal creation is restricted strictly to legal role in RLS policy.
- **TC-SB-19:** Database connectivity check queries organizations table to prevent false HTTP 401s.
- **TC-SB-20:** `SupabaseManager` cleanly distinguishes sandbox, connected, and authenticated states.
- **TC-SB-21:** Campaigns update policy contains `WITH CHECK` clause permitting valid status transitions.
- **TC-SB-22:** Campaign revisions table defines explicit `UPDATE` RLS policy to support upserts.
- **TC-SB-23:** Status normalization correctly maps legacy statuses to valid `campaign_status` enums.
- **TC-SB-24:** Database writes inspect Supabase errors and return explicit failure payloads.
- **TC-SB-25:** Profiles selection policy includes `id = auth.uid()` self-recovery guard.
- **TC-SB-26:** `saveHistory` does not trigger unawaited background cloud sync writes.
- **TC-SB-27:** Approval modal guards success toast with verified cloud writes.
- **TC-SB-28:** Legal clearance verifies sync, status update, and seal recording.
- **TC-SB-29:** Review history displays cloud vs. local persistence badges.
- **TC-SB-30:** Gemini API key sanitization and safe diagnostic endpoint (no leaked prefixes/lengths).

### Suite 5: Governance Intelligence & Friction Radar (`tests/governanceIntelligence.test.js`)
- **TC-GI-01:** Status normalizer strictly maps legacy and variant statuses to enum values.
- **TC-GI-02:** Date range filtering scopes records by time window (7d, 30d, 90d, all).
- **TC-GI-03:** Governance metrics calculates accurate counts and compliance rate.
- **TC-GI-04:** Returns meaningful empty states when dataset is empty.
- **TC-GI-05:** Recurring violation detector groups and ranks violations by frequency and drift trend.
- **TC-GI-06:** Review efficiency accurately computes turnaround time and pending queue age.
- **TC-GI-07:** Bottleneck detector flags warning when review backlog grows.
- **TC-GI-08:** Policy Friction Radar detects subjective adjectives (`"modern"`, `"appropriate"`, `"clean"`, `"professional"`).
- **TC-GI-09:** Policy Friction Radar identifies conflict between sentence limits and legal disclosures.
- **TC-GI-10:** Policy Friction Radar flags rules with empirical review disagreement history.
- **TC-GI-11:** Every friction finding provides a concrete proposed rule rewrite and recommendation.
- **TC-GI-12:** Synthesizes prioritized governance recommendations.
- **TC-GI-13:** Serializes comprehensive report to Markdown and JSON formats.
- **TC-GI-14:** Engine is strictly non-destructive and preserves original guidelines object.
- **TC-GI-15:** Detects conflicting terms listed in both avoid and preferred lists.

---

## 4. Manual Verification Checklist

For live staging and production verification on [https://brandforge-inkloom.netlify.app/](https://brandforge-inkloom.netlify.app/):

### Flow 1: Authentication & Connection Check
1. Open application in browser.
2. Observe Cloud Sync badge in header:
   - Green indicator: **"Cloud Connected"** (Supabase reachable with anon key).
3. Click user profile in top-right to open Auth Modal.
4. Sign in with test account:
   - Creator: `eator@test.com` (Alex Creator)
   - Custodian: `custodian@test.com` (Sam Custodian)
   - Legal: `legal@test.com` (Dana Legal)
5. Verify profile role is loaded directly from Supabase `profiles` table.

### Flow 2: Creator Submission & AI Brand Review
1. Sign in as Creator (`eator@test.com`).
2. Go to **Content Checker** tab.
3. Paste test copy containing prohibited buzzwords:
   ```text
   Our bulletproof cloud platform guarantees 100% uptime with literally magic results.
   ```
4. Click **"Run Brand Review"**.
5. Verify findings are generated:
   - Avoided term `"bulletproof"` flagged with High severity.
   - Promissory claim `"guarantees 100%"` flagged for legal evidence.
   - Hyperbole `"literally magic"` flagged with High severity.
6. Click **"Submit for Review"**.
7. Confirm status changes to `in_review` and is persisted to Supabase `campaigns` table.

### Flow 3: Brand Custodian Review & Approval
1. Sign in as Custodian (`custodian@test.com`).
2. Go to **Review History** tab.
3. Observe campaign in `In Review` state.
4. Click **"Inspect"** -> **"Open in Checker"**.
5. Custodian can add an in-line feedback comment or click **"Approve Brand Voice"**.
6. Verify status transitions to `brand_approved`.
7. Confirm Review History shows `[Cloud Persisted]` badge.

### Flow 4: Legal Clearance & Cryptographic Compliance Seal
1. Sign in as Legal Officer (`legal@test.com`).
2. Open the `brand_approved` campaign.
3. Notice Legal Clearance button is now unlocked (dual-gate prerequisite fulfilled).
4. Click **"Grant Legal Clearance"**.
5. Verify SHA-256 compliance seal is computed:
   - Hash is logged in `compliance_seals` table.
   - Dual sign-off records Custodian and Legal IDs.
6. Verify status changes to `legally_cleared`.

### Flow 5: Governance Intelligence & Policy Friction Radar
1. Navigate to **"Intelligence & Radar"** tab.
2. Inspect the 8 KPI Ribbon:
   - Total Audited Campaigns, Clean First-Pass Rate, Avg Review Turnaround, Active Policy Friction Points.
3. Inspect Collaborative Lifecycle Pipeline:
   - Drafting, In Review, Changes Requested, Brand Approved, Legally Cleared distribution.
4. Inspect Velocity & Bottleneck Radar:
   - Turnaround metrics and queue aging.
5. Inspect Recurring Violations & Brand Drift Radar:
   - Top recurring rule breaches with direct link to inspect campaign.
6. Inspect Policy Friction Radar:
   - View subjective/ambiguous rules flagged with severity.
   - Click **"Copy Rule"** to copy the concrete measurable rewrite.
7. Click **"Export Governance Report"**:
   - Preview Markdown format.
   - Toggle JSON format.
   - Click **"Copy Report"** or **"Download Report"**.
