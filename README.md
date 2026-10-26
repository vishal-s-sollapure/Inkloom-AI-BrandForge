# BrandForge
### Intelligent Pre-Publication Brand Governance Platform
**Inkloom AI Brand Governance Challenge — Round 2 (The Build)**

---

## 📌 Project Overview

**BrandForge** is a pre-publication brand governance platform that reviews marketing copy against approved brand guidelines, preferred terminology, verified facts, and tone rules before content is published.

In fast-paced organizations, marketing teams, agencies, and generative AI tools frequently introduce off-brand terminology (*"cheap tool"*, *"our bot"*), unsubstantiated superlatives (*"100% foolproof"*, *"guarantees zero risk"*), and aggressive hype that damages brand trust and creates regulatory exposure.

BrandForge solves this problem by providing an explainable, human-centered review workbench that flags issues, cites active brand rules, differentiates rule mismatches from unverified factual claims, and generates editable, brand-aligned suggested revisions.

---

## 👥 Team & Challenge Details

- **Challenge:** Inkloom AI — Intelligent Brand Governance
- **Project Name:** BrandForge
- **Team Name:** BrandForge
- **Participant:** Vishal S Sollapure
- **Round:** 2 — Functional Minimum Viable Product (MVP)
- **Deployment Status:** *Pending Deployment* (Ready for zero-build deployment on GitHub Pages or Netlify)

---

## 🚀 Key Features Implemented

1. **Brand Checker Workbench:**
   - Content title and format selector (Press Release, Social Post, Email, Ad, Landing Page, Blog).
   - Rich draft editor with live word and character counters.
   - **Load Sample Campaign:** Instantly populates realistic marketing copy with intentional brand inconsistencies for demonstration.
2. **Explainable Deterministic Rules Engine:**
   - Detects avoided terminology with direct replacements.
   - Flags missing preferred brand terminology.
   - Identifies aggressive marketing hype and out-of-character tone.
   - Detects unsupported superlatives and promissory assertions.
   - **Verification Needed Tagging:** Explicitly distinguishes confirmed rule mismatches from claims requiring human verification.
   - Flags accessibility issues (sentences exceeding 30 words).
3. **Heuristic Compliance Score:**
   - Dynamic 0–100 score weighted by finding severity (High: -18, Medium: -8, Low: -3) with a minimum floor of 10.
4. **Suggested Revision Generator:**
   - Synthesizes an editable suggested revision replacing avoided terms and softening hyperbole while preserving author voice and structure.
   - Actions to "Use Suggested Revision", "Copy Text", and "Re-run Check".
5. **Human-in-the-Loop Approval Workflow:**
   - Confirmation modal before signing off and recording approved content.
6. **Brand Guidelines Configuration:**
   - Custom editor for brand name, voice, preferred terms, avoided terms with replacements, approved facts, verification claims, and accessibility rules.
   - Persists in browser `localStorage` with defensive fallbacks and "Restore Defaults".
7. **Local Review History:**
   - Searchable log of past checks with date, title, format, score, findings count, status, and an inspection modal.
8. **Governance Insights:**
   - Derived from real stored review history: most frequently triggered rules, high-priority unresolved findings, approval distribution, and guideline clarity advice.

---

## 🛠️ Technology Stack & Architecture

- **Structure:** HTML5 (Semantic, accessible markup)
- **Styling:** CSS3 (Vanilla design system with a dark, polished plum, rose, and warm clay palette; responsive across desktop, tablet, and mobile; reduced-motion support)
- **Logic:** Vanilla JavaScript (ES2022) with a modular deterministic rules engine
- **Persistence:** Browser `localStorage` (100% client-side privacy, zero data retention)
- **Zero Build Requirement:** No npm compilation, Node dependencies, or paid APIs required to run the application.

### Project File Structure

```
Inkloom-AI-BrandForge/
├── index.html                 # Complete semantic application structure & layout
├── styles.css                 # Responsive stylesheet (Plum, rose, & clay palette)
├── app.js                     # Modular application logic & rules engine
├── server.js                  # Optional zero-dependency local static server
├── README.md                  # Comprehensive setup, architecture, and guide
├── ROUND2-SUBMISSION-NOTES.md # Submission checklist & honest feature status report
├── ROUND2-PROJECT-SUMMARY.md  # 2–3 page summary formatted for PDF conversion
├── TEST-REPORT.md             # Empirical test results from real checks executed
└── tests/
    └── rulesEngine.test.js    # Automated unit test suite (10/10 passed)
```

---

## 📐 Rules Engine & Scoring Methodology

BrandForge uses a transparent, deterministic rules engine:

### 1. Evaluation Functions
- `validateInput(title, text)`: Ensures required content fields are present.
- `matchGuidelines(text, guidelines)`: Evaluates avoided words, verification claims, tone, and sentence length.
- `calculateScore(findings)`: Calculates the heuristic compliance score.
- `generateSuggestedRevision(text, findings, guidelines)`: Generates a softened draft replacing flagged terms.

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
If you have Node.js installed:
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

## 🌐 How to Deploy

### Deploy to GitHub Pages
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete BrandForge Round 2 MVP"
   git remote add origin https://github.com/<your-username>/BrandForge.git
   git branch -M main
   git push -u origin main
   ```
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Branch**, select `main` and root folder `/`. Click **Save**.
4. Your application will be live at `https://<your-username>.github.io/BrandForge/`.

### Deploy to Netlify
1. Log in to [Netlify](https://app.netlify.com/).
2. Drag and drop the `Inkloom-AI-BrandForge` directory into the Netlify Sites dashboard.
3. The site will deploy instantly with a live URL.

---

## 🧪 Testing Instructions & Results

We executed an automated unit test suite verifying the rules engine, scoring, and text utilities:
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

**Result: 10 / 10 Tests Passed (100% Pass Rate).** Full details are documented in [`TEST-REPORT.md`](file:///c:/Users/VISHAL/OneDrive/Desktop/Inkloom-AI-BrandForge/TEST-REPORT.md).

---

## 🔒 Privacy, Security & Disclosures

- **100% Client-Side:** All checking, revision generation, and storage occurs in local browser memory and `localStorage`.
- **Zero Third-Party Model Training:** Draft marketing copy is never transmitted across the network or shared with external LLM APIs.
- **No Secret Exposure:** Does not require API keys or environment variables.
- **Local Storage Advisory:** `localStorage` is suitable for local demonstration; sensitive or regulated enterprise data should not be placed in shared browser storage.
- **No Autonomous Overrides:** BrandForge never alters author text without explicit human review and confirmation.

---

## ⚠️ Known Limitations of Round 2 MVP

1. **Browser-Scoped Storage:** Records and guidelines reside in the active browser and do not synchronize across team members without a backend.
2. **Language Support:** Rules and terminology checks are currently optimized for English text.
3. **No External Fact-Checking:** BrandForge verifies text against configured brand rules; it does not claim to verify external reality or legal compliance automatically.

---

## 🔮 Three Major Round 3 Improvements (Roadmap)

1. **Evidence-Backed AI Brand Review:**
   - Integrate a production LLM service constrained by structured schemas and approved brand documentation with citations to exact rules.
   - Separate confirmed rule mismatches from claims that require external factual documentation.
2. **Collaborative Governance Workflow:**
   - Multi-user roles (Content Creator, Brand Custodian, Legal Counsel) with approval stages and assignment queues.
   - In-line contextual comments and side-by-side visual diff comparison.
   - Cryptographic SHA-256 pre-publication seals.
3. **Governance Intelligence & Analytics:**
   - Detect recurring team-wide brand violations over time.
   - Identify ambiguous or contradictory guidelines where authors frequently request exemptions.