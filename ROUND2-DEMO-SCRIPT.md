# BrandForge: 2–3 Minute Judge Demo Script
### Inkloom AI Brand Governance Challenge — Round 2 (The Build)
**Participant:** Vishal S Sollapure  
**Team Name:** BrandForge  
**Live URL:** [https://brandforge-inkloom.netlify.app/](https://brandforge-inkloom.netlify.app/)  
**Target Duration:** 2 minutes 30 seconds  

---

## Demo Overview & Presenter Setup
This script provides an exact, reproducible sequence designed for live hackathon judging or recorded video walkthroughs. It demonstrates every critical capability built into the Round 2 MVP using the active, live production application.

> **Pre-demo Quick Check:**
> - Open `https://brandforge-inkloom.netlify.app/` in Chrome, Firefox, or Edge.
> - Ensure your screen resolution is 1920x1080 or 1440x900 for optimal presentation.
> - No login, build step, or API keys required.

---

## Timed Walkthrough Sequence

### ⏱️ Segment 1: Introduction & The Core Problem (0:00 – 0:25)
- **Action:** Open `https://brandforge-inkloom.netlify.app/`. Point to the header, active guidelines badge (*"Brand: Inkloom AI (Enterprise B2B)"*), and dark plum/rose/clay visual hierarchy.
- **Spoken Script:**
  > *"Hello judges, I’m Vishal Sollapure presenting BrandForge — an intelligent, pre-publication brand governance workbench.  
  > In enterprise marketing, AI-generated drafts and decentralized teams often introduce unverified superlatives, off-brand colloquialisms, and regulatory liabilities before anyone catches them.  
  > BrandForge intercepts marketing copy before publication, executing an explainable, deterministic governance audit with full policy traceability and human sign-off."*

---

### ⏱️ Segment 2: Realistic Campaign Ingestion & Brand Audit (0:25 – 0:55)
- **Action:**
  1. Click the **"Load Sample Campaign"** button above the editor.
  2. Point out that the title (*"BrandForge 2.0 Enterprise Launch Announcement"*), content format (*"Press Release"*), and 78-word copy populate immediately.
  3. Note the live word and character counters at the bottom of the editor.
  4. Click the primary **"Run Brand Check"** button.
- **What Appears on Screen:**
  - Brief loading progress bar.
  - Compliance Score updates to **42% (Needs Revision)**.
  - Results show **6 Issues Detected (4 High, 2 Medium)**.
- **Spoken Script:**
  > *"Rather than forcing you to type, I’ll load a realistic press release draft containing common enterprise pitfalls.  
  > In one click, BrandForge scans the content across five governance dimensions.  
  > Notice our compliance score is 42% — flagged with 4 High-severity and 2 Medium-severity findings.  
  > Every finding provides explicit policy traceability: you see the exact policy section tag, such as 'Prohibited Terminology' or 'Factual Claims & Verification', the quoted violation, the rationale, and the recommended replacement."*

---

### ⏱️ Segment 3: Claim Verification vs. Rule Mismatches & Visual Diff (0:55 – 1:30)
- **Action:**
  1. Scroll through the findings list. Point to the finding: **`Claim Requiring Verification: "100%"`** with the amber badge **`⚠️ Claim Requires Supporting Evidence`**.
  2. Contrast that with **`Prohibited Terminology: "cheap tool"`** and **`Prohibited Terminology: "bulletproof"`**.
  3. Scroll to the **Suggested Revision** section and click the **"Compare with Original"** button.
- **What Appears on Screen:**
  - The **Side-by-Side Visual Diff Comparison** modal opens.
  - Left panel: Original draft with avoided terms wrapped in **red strikethrough tags** (`<span class="diff-del">cheap tool</span>`, `bulletproof`).
  - Right panel: Revised draft with approved replacements wrapped in **green insertion tags** (`<span class="diff-ins">cost-effective solution</span>`, `robust and enterprise-ready`).
  - Top badge displays: **"4 Replacements Applied"**.
- **Spoken Script:**
  > *"Notice how BrandForge separates brand policy mismatches from factual claims. An unverified claim like '100% uptime' is not falsely marked as 'illegal' — it is transparently flagged as requiring documentary proof before publishing.  
  > Now, let’s click 'Compare with Original'.  
  > This side-by-side visual diff shows the original draft with deletions in red strikethrough alongside our synthesized revision with enterprise replacements in green. The author’s intent and structure remain completely intact."*

---

### ⏱️ Segment 4: Revision Loop & Dual Human Decision (1:30 – 2:05)
- **Action:**
  1. Click **"Apply Revision to Editor"** inside the diff modal (or close and click **"Use Suggested Revision"**).
  2. Point out that the improved copy is now in the main editor.
  3. Click **"Run Brand Check"** again.
  4. Observe the score immediately elevates to **100% (Publication Ready)** with zero findings.
  5. Demonstrate the dual-action decision options:
     - Point to **"Request Changes"** (opens rejection modal allowing reviewer notes).
     - Click **"Approve This Version"**.
  6. The **Sign-Off Confirmation** modal appears. Review the disclaimer (clearly stating that brand approval does not constitute legal counsel or factual verification).
  7. Click **"Confirm & Save Approval"**.
- **Spoken Script:**
  > *"When we apply the suggested revision and re-run our brand check, our compliance score jumps from 42% straight to 100% — fully compliant.  
  > Crucially, BrandForge never autonomously publishes. Human review is mandatory.  
  > A reviewer can either click 'Request Changes' to send it back with notes, or click 'Approve This Version'.  
  > Our confirmation dialog explicitly reminds the team that brand sign-off assists editorial governance but does not replace legal counsel or empirical fact checking. Let's confirm approval."*

---

### ⏱️ Segment 5: Review History, Audit Export & Disclosed Limitations (2:05 – 2:30)
- **Action:**
  1. Click the **"Review History"** tab in the top navigation.
  2. Point out the newly recorded review at the top with timestamp, 100% score, and green `Approved` badge.
  3. Click the status filter buttons: **"All"**, **"Approved"**, and **"Changes Requested"** to show instant filtering.
  4. Click **"Inspect"** on a row to open the full detail view, then click **"Export This Record (JSON)"**.
  5. Close modal, click back to the Brand Checker, and click **"Export Report"** to show both formatted JSON and Markdown download options.
- **Spoken Script:**
  > *"In Review History, every evaluation is persisted in client storage with a complete audit trail. We can filter between Approved assets and revisions where changes were requested, and export records as structured JSON or executive Markdown for legal compliance archives.  
  > To be completely transparent about our limitations: this Round 2 MVP operates locally on single-browser localStorage and uses an English-language deterministic rules engine. It does not connect to an external LLM yet.  
  > For Round 3, our roadmap integrates production LLMs constrained by JSON schema, collaborative multi-user roles with server-side sync, and team-wide governance intelligence to detect friction across brand rules.  
  > Thank you, and I look forward to your questions!"*

---

## 🎯 Key Evidence Matrix for Judges
| Demonstrated Item | Where to Look in UI | Underlying Code / Evidence |
| :--- | :--- | :--- |
| **Deterministic Rules Evaluation** | Findings list after check | Regex token matchers in `app.js` line 410–548 |
| **Policy Section Traceability** | Tags like `[Prohibited Terminology]` on findings | `f.guidelineSection` in `app.js` line 428 |
| **Claim Verification Tagging** | Amber `⚠️ Claim Requires Supporting Evidence` | `isVerificationNeeded: true` in `app.js` line 468 |
| **Side-by-Side Visual Diff** | "Compare with Original" modal | `buildDiffData` in `app.js` line 586 |
| **Dual Human Governance** | Approve vs. Request Changes modals | `status: 'approved'` vs `status: 'rejected'` with `reviewerNotes` |
| **Audit Report Export** | "Export Report" button | Versioned JSON (`2.0-MVP`) & Markdown serializers |
| **Review History & Filtering** | "Review History" tab | Dynamic status filter pills & localStorage persistence |
| **Client-Side Privacy** | Network tab in DevTools | Zero outbound network calls for draft content |
