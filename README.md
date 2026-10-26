# BrandForge
### Intelligent Pre-Publication Brand Governance Platform
**Inkloom AI Brand Governance Challenge — Round 2 (The Build)**

[![Netlify Status](https://img.shields.io/badge/Netlify-Deployed%20Live-10B981?logo=netlify&logoColor=white)](https://brandforge-inkloom.netlify.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?logo=github&logoColor=white)](https://github.com/vishal-s-sollapure/Inkloom-AI-BrandForge)
[![Vanilla JS](https://img.shields.io/badge/Stack-HTML5%20%2F%20CSS3%20%2F%20JS-F7DF1E?logo=javascript&logoColor=black)](#)
[![Zero Build](https://img.shields.io/badge/Build-Zero%20Dependencies-10B981)](#)
[![Automated Tests](https://img.shields.io/badge/Tests-15%2F15%20Passed-10B981)](#)

---

## 📌 Project Overview

**BrandForge** is a pre-publication brand governance platform that reviews marketing copy against approved brand guidelines, preferred terminology, verified facts, and tone rules before content is published.

In fast-paced organizations, marketing teams, external agencies, and generative AI tools frequently introduce off-brand terminology (*"cheap tool"*, *"our bot"*), unsubstantiated superlatives (*"100% foolproof"*, *"guarantees zero risk"*), and aggressive hype that damages brand trust and creates regulatory exposure.

BrandForge solves this problem by providing an explainable, human-centered review workbench that flags issues, cites active brand rules, differentiates rule mismatches from unverified factual claims, and generates editable, brand-aligned suggested revisions.

---

## 👥 Team & Submission Details

- **Challenge:** Inkloom AI — Intelligent Brand Governance
- **Project Name:** BrandForge
- **Participant:** Vishal S Sollapure
- **Team Name:** BrandForge
- **Stage:** Round 2 — Functional Minimum Viable Product (MVP)
- **Live Deployed Application:** [https://brandforge-inkloom.netlify.app/](https://brandforge-inkloom.netlify.app/)
- **Source Code Repository:** [https://github.com/vishal-s-sollapure/Inkloom-AI-BrandForge](https://github.com/vishal-s-sollapure/Inkloom-AI-BrandForge)
- **Submission Date:** October 26, 2026

---

## 🚀 Key Features Implemented & Verified

1. **Brand Checker Workbench:**
   - Content title and format selector (*Press Release, Social Post, Email Newsletter, Digital Ad, Landing Page, Thought Leadership Blog*).
   - Rich draft editor with live word and character counters.
   - **Load Sample Campaign:** Instantly populates realistic marketing copy with intentional brand inconsistencies for demonstration.
2. **Explainable Deterministic Rules Engine:**
   - Detects avoided terminology with direct replacements.
   - Flags missing preferred brand terminology.
   - Identifies aggressive marketing hype and out-of-character tone.
   - Detects unsupported superlatives and promissory assertions.
   - **Claim Verification Tagging:** Explicitly distinguishes confirmed rule mismatches from claims requiring human verification.
   - Flags accessibility issues (sentences exceeding 30 words).
3. **Heuristic Compliance Score:**
   - Dynamic 0–100 score weighted by finding severity (High: -18, Medium: -8, Low: -3) with a minimum floor of 10. Explicitly labeled as a heuristic indicator, not a legal guarantee.
4. **Suggested Revision Generator:**
   - Synthesizes an editable suggested revision replacing avoided terms and softening hyperbole while preserving author voice and structure.
   - Actions to "Use Suggested Revision", "Copy Text", and "Re-run Check".
5. **Human-in-the-Loop Approval Workflow:**
   - Confirmation modal required before signing off and recording approved content into review history.
6. **Brand Guidelines Configuration:**
   - Custom editor for brand name, voice, preferred terms, avoided terms with replacements, approved facts, verification claims, and accessibility rules.
   - Persists in browser `localStorage` with defensive fallbacks and "Restore Defaults".
7. **Local Review History:**
   - Searchable log of past checks with date, title, format, score, findings count, status, and an inspection modal.
9. **Defensive Storage Resilience:**
   - Graceful in-memory fallback ensures the application continues operating smoothly if `localStorage` is disabled or blocked.

### 🔍 Feature Implementation Categories
- **A. Fully Implemented & Verified:** Features 1–9 above are 100% functional and tested in the current codebase.
- **B. Scoped / Partially Implemented:** English-language copy focus; single-browser profile `localStorage` persistence.
- **C. Excluded / Untested:** No external LLM API connection; no external web fact-checking; no legal compliance guarantees; no image OCR.
- **D. Planned Roadmap (Round 3):** Collaborative roles, visual diffs, cryptographic audit seals, and constrained production LLM integration.

---

## 🛠️ Technology Stack & Architecture

- **Structure:** Semantic HTML5 (`index.html`) with accessible ARIA landmarks, roles, and modals.
- **Styling:** CSS3 (`styles.css`) featuring a bespoke dark, polished **plum, rose, and warm clay palette** (`#110913`, `#180D1C`, `#D9778F`, `#E0A899`, `#6E3358`). Fully responsive across desktop, tablet, and mobile, with visible focus indicators (`:focus-visible`) and reduced-motion support.
- **Logic:** Vanilla JavaScript (`app.js`, ES2022) with a modular deterministic rules engine. DOM-safe element rendering prevents XSS vulnerabilities.
- **Persistence:** Browser `localStorage` with defensive in-memory fallback if storage is disabled.
- **Zero Build Requirement:** No npm compilation, Node dependencies, or paid APIs required to run the application.

### Project File Structure

```
Inkloom-AI-BrandForge/
├── index.html                 # Semantic application structure & accessible layout
├── styles.css                 # Responsive stylesheet (Plum, rose, & clay palette)
├── app.js                     # Modular application logic & rules engine
├── server.js                  # Optional zero-dependency local static server
├── netlify.toml               # Zero-build Netlify deployment configuration
├── README.md                  # Comprehensive setup, architecture, and guide
├── ROUND2-SUBMISSION-NOTES.md # Submission checklist & honest feature status report
├── ROUND2-PROJECT-SUMMARY.md  # 2–3 page summary formatted for PDF conversion
├── TEST-REPORT.md             # Empirical test results from real checks executed
└── tests/
    └── rulesEngine.test.js    # Automated unit test suite (15/15 passed)
```

---

## 📐 Rules Engine & Scoring Methodology

BrandForge uses a transparent, deterministic rules engine:

### 1. Evaluation Functions
- `validateInput(title, text)`: Ensures required content fields are present and non-empty.
- `matchGuidelines(text, guidelines)`: Evaluates avoided words, verification claims, tone, and sentence length.
- `calculateScore(findings)`: Calculates the heuristic compliance score.
- `generateSuggestedRevision(text, findings, guidelines)`: Generates an editable draft replacing flagged terms.

### 2. Scoring Formula
The compliance score is a **heuristic indicator**, not a guarantee of legal or brand compliance:
$$\text{Score} = \max\left(10, \; 100 - \sum \text{Deductions}\right)$$
- **High Severity Finding:** $-18$ points (e.g. prohibited terminology, unverified absolute guarantees).
- **Medium Severity Finding:** $-8$ points (e.g. juvenile tone, aggressive marketing hype).
- **Low Severity Finding:** $-3$ points (e.g. sentence $>30$ words, missing official brand name).

---

## 💻 How to Run Locally

### Option 1: Direct File Open (Zero Dependencies)
Simply double-click `index.html` or open it directly in any modern browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

### Option 2: Local Static Server (Node.js)
```bash
node server.js
```
Open your browser at `http://localhost:5173/` or `http://127.0.0.1:5173/`.

### Option 3: Python Static Server
```bash
python -m http.server 5173
```
Open `http://localhost:5173/`.

---

## 🌐 Deployment Information

### Live Production Deployment
- **Active URL:** [https://brandforge-inkloom.netlify.app/](https://brandforge-inkloom.netlify.app/)
- **Configuration:** Handled via [`netlify.toml`](file:///c:/Users/VISHAL/OneDrive/Desktop/Inkloom-AI-BrandForge/netlify.toml) with `publish = "."` and zero build commands.

### Deploying to GitHub Pages
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete BrandForge Round 2 MVP"
   git push origin main
   ```
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Branch**, select `main` and root folder `/`. Click **Save**.

---

## 🧪 Testing Instructions & Results

An automated unit test suite verifies the rules engine, scoring, and text utilities:
```bash
node tests/rulesEngine.test.js
```

### Actual Test Results (from `TEST-REPORT.md`):
- `TC-01`: Input validation rejects empty title or content &rarr; **PASS**
- `TC-02`: Detects prohibited terminology (`"cheap tool"`, `"bulletproof"`, `"foolproof"`) &rarr; **PASS**
- `TC-03`: Flags unapproved promissory claims for human verification (`"guaranteed"`, `"100%"`) &rarr; **PASS**
- `TC-04`: Flags juvenile hyperbole and aggressive hype (`"literally magic"`, `"total dominance"`) &rarr; **PASS**
- `TC-05`: Flags sentences exceeding the 30-word accessibility limit &rarr; **PASS**
- `TC-06`: Returns zero findings and 100% score for compliant content &rarr; **PASS**
- `TC-07`: Deducts score by severity with floor of 10 &rarr; **PASS**
- `TC-08`: Generates transparent deterministic replacement preserving text structure &rarr; **PASS**
- `TC-09`: Accurately computes words and characters with whitespace handling &rarr; **PASS**
- `TC-10`: Safely escapes user-defined punctuation and special characters &rarr; **PASS**
- `TC-11`: Handles whitespace-only inputs without crashing &rarr; **PASS**
- `TC-12`: Handles disabled or throwing storage gracefully without breaking in-memory state &rarr; **PASS**
- `TC-13`: Search filter accurately matches records by title or content type &rarr; **PASS**
- `TC-14`: Workflow loop: Applying revision and re-running elevates score &rarr; **PASS**
- `TC-15`: Aggregates rule frequencies, approval distribution, and high risk findings &rarr; **PASS**

**Result: 15 / 15 Tests Passed (100% Pass Rate).** Full details are documented in [`TEST-REPORT.md`](file:///c:/Users/VISHAL/OneDrive/Desktop/Inkloom-AI-BrandForge/TEST-REPORT.md).

---

## 🔒 Privacy, Security & Architectural Disclosures

- **100% Client-Side:** All checking, revision generation, and storage occurs in local browser memory and `localStorage`.
- **Zero Third-Party Model Training:** Draft marketing copy is never transmitted across the network or shared with external generative AI APIs.
- **LocalStorage Boundary:** `localStorage` is local to the single browser profile on a specific machine. It is **not** a shared team database and does not sync across multiple users or devices.
- **No Real LLM:** The Round 2 MVP operates strictly on deterministic JavaScript heuristics. It does not connect to a live LLM service.
- **No External Fact-Checking or Legal Guarantees:** BrandForge verifies text against configured brand rules; it does not claim to verify external factual reality or guarantee legal compliance.
- **No Autonomous Overrides:** BrandForge never alters author text without explicit human review and confirmation.
- **Impact Hypothesis Disclosure:** The proposed 80%+ review-time reduction is a conceptual design objective and engineering hypothesis, not an empirically measured production benchmark. No formal user time studies have been conducted for this MVP.

---

## 🔮 Three Major Round 3 Improvements (Roadmap)

The following three capabilities represent our planned roadmap for Round 3 (The Finish) and are not current features of the Round 2 MVP:

1. **Evidence-Backed AI Brand Review:**
   - Integrate a production LLM service constrained by structured JSON schemas and approved brand documentation with citations to exact rules.
   - Separate confirmed rule mismatches from claims that require external factual documentation.
2. **Collaborative Governance Workflow:**
   - Multi-user roles (Content Creator, Brand Custodian, Legal Counsel) with approval stages and assignment queues.
   - In-line contextual comments and side-by-side visual diff comparison.
   - Cryptographic SHA-256 pre-publication seals.
3. **Governance Intelligence & Analytics:**
   - Detect recurring team-wide brand violations over time.
   - Identify ambiguous or contradictory guidelines where authors frequently request exemptions.