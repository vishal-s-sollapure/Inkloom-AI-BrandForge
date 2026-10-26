# BrandForge by Inkloom AI
### Intelligent Pre-Publication Brand Governance & Compliance Platform

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![WCAG 2.1](https://img.shields.io/badge/WCAG-2.1%20AA%2FAAA-10B981)](#)
[![Zero Data Retention](https://img.shields.io/badge/Privacy-Zero%20Data%20Retention-10B981)](#)
[![SHA-256 Seals](https://img.shields.io/badge/Verification-WebCrypto%20SHA--256-6366F1)](#)

---

## 🎯 Executive Overview

Growing organizations produce content across distributed teams, advertising agencies, freelance copywriters, and generative AI tools. Without centralized automated guardrails, **unsupported promotional claims, outdated statistics, off-brand terminology, and inaccessible visual assets** slip into published channels—eroding brand trust and exposing organizations to legal liability.

**BrandForge by Inkloom AI** is an intelligent, explainable brand-governance platform that reviews content *prior to publication* against approved guidelines, verified facts, and design standards. Instead of functioning as a black-box gatekeeper, BrandForge provides transparent citations, context-preserving rewrites, a multi-role collaborative workflow, and organizational governance analytics.

---

## 📑 Official Submission Documents

This repository contains comprehensive documentation corresponding to each judging round:

- 📋 [**ROUND_1_THE_PLAN.md**](file:///c:/Users/VISHAL/OneDrive/Desktop/Inkloom-AI-BrandForge/ROUND_1_THE_PLAN.md): Problem definition, empirical research, personas, system architecture, planned features, privacy/security, and impact model (100 Points).
- 🛠️ [**ROUND_2_THE_BUILD.md**](file:///c:/Users/VISHAL/OneDrive/Desktop/Inkloom-AI-BrandForge/ROUND_2_THE_BUILD.md): Product architecture, technical decisions, datasets/APIs, **The Three Named Improvements**, user testing evidence, and contributions (100 Points).
- 🏆 [**ROUND_3_THE_FINISH.md**](file:///c:/Users/VISHAL/OneDrive/Desktop/Inkloom-AI-BrandForge/ROUND_3_THE_FINISH.md): Product completeness audit, reliability benchmarks, usability evidence, ethical AI disclosures, and 2027 roadmap (100 Points).

---

## 🌟 The 6 Governance Pillars Evaluated in Real-Time

BrandForge analyzes content concurrently across 6 distinct dimensions:

| Pillar | Focus Area | Example Flagged Issue & Resolution |
| :--- | :--- | :--- |
| **1. Tone & Voice** | Brand personality & demeanor | Flags aggressive hype (*"100% foolproof"*, *"literally magic"*); suggests measured enterprise phrasing. |
| **2. Terminology** | Nomenclature & forbidden lexicons | Flags deprecated or demeaning terms (*"cheap tool"*, *"our bot"*); suggests approved brand names (*"BrandForge platform"*). |
| **3. Facts & Claims** | Substantiation of statistics & ROI | Matches numbers against the **Approved Facts Vault**; flags unverified assertions (*"$100 billion savings"*) under FTC rules. |
| **4. Messaging** | Strategic value proposition | Enforces required compliance disclaimers (e.g. ISO/IEC 27001 references on press releases). |
| **5. Visual Assets** | Color fidelity & safe zones | Verifies brand palette adherence and logo safe-zone clear space (1x icon height). |
| **6. Accessibility** | Readability & WCAG contrast | Computes Flesch-Kincaid grade level and evaluates foreground/background contrast ratios against WCAG 2.1 AA (4.5:1) and AAA (7:1). |

---

## 🚀 The Three Named Improvements (Judging Criteria)

1. **Context-Preserving Semantic Intent Engine**: Rather than robotic word-substitution, the engine analyzes rhetorical intent and syntactic context to suggest natural rewrites that preserve creator voice while eliminating legal and policy violations.
2. **Guideline Ambiguity & Friction Radar**: Identifies brand rules that generate the most creator pushback, exemption requests, or repeat violations—turning governance into a continuous guideline improvement loop for brand custodians.
3. **Cryptographic Pre-Publication Compliance Seal**: Issues an immutable, tamper-evident SHA-256 digital certificate binding approved text, reviewer signatures, and active brand rule versions.

---

## 🏗️ System Architecture

```
+-----------------------------------------------------------------------------------+
|                           BRANDFORGE FRONTEND RUNTIME                             |
|                                                                                   |
|  [Header & Brand Vault Selector]   [Role Switcher: Creator / Manager / Legal]     |
|                                                                                   |
|  +------------------------+  +------------------------+  +---------------------+  |
|  |  Pre-Publication Studio|  | Visual & WCAG Inspector|  | Brand Vault Manager |  |
|  +------------------------+  +------------------------+  +---------------------+  |
|  |  Review & Approvals Hub|  | Governance Analytics   |  | AI Ethics Sandbox   |  |
|  +------------------------+  +------------------------+  +---------------------+  |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        6-PILLAR CLIENT INTELLIGENCE ENGINE                        |
|                                                                                   |
|  * Tone & Valence Evaluator            * Terminology AST Matcher                  |
|  * Approved Facts Verifier             * sRGB Luminance Contrast Calculator       |
|  * Flesch-Kincaid Readability Parser   * Native Web Crypto SHA-256 Engine         |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     SECURE CLIENT-SIDE VAULT & AUDIT TRAIL                        |
|  * Zero Data Retention Guarantee (Embargoed draft content never leaves browser)   |
|  * Rule-to-Source Citation Index                                                  |
|  * Revision Snapshots & Cryptographic Compliance Certificates                     |
+-----------------------------------------------------------------------------------+
```

---

## ⚡ Quickstart Guide

### Prerequisites
- Node.js `v18.0+` or `v20.18+`
- npm `v9+` or `v10+`

### Installation & Run

1. Clone or open the repository:
   ```bash
   cd c:\Users\VISHAL\OneDrive\Desktop\Inkloom-AI-BrandForge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   Open your browser at: `http://localhost:5173/` (or `http://127.0.0.1:5173/`)

4. Validate production build:
   ```bash
   npm run build
   ```

---

## 🎮 Interactive Demonstration Walkthrough

When evaluating BrandForge, test these key scenarios:

1. **Test Scenario 1 (Violations & Real-Time Linting)**:
   - Select **"⚠️ Problematic Press Release"** in the *Load Demo* dropdown in the top header.
   - Observe the initial compliance score (~42%) and review the 6-pillar cards on the right.
   - Click **"Guideline Rule: RULE-TERM-02"** to inspect the official rule excerpt.
   - Click **"Apply All Safe Fixes"** to watch the text automatically update and the compliance score climb to 100%.

2. **Test Scenario 2 (Visual WCAG & Accessibility Audit)**:
   - Click the **"Visual & Asset Inspector"** tab.
   - Inspect the interactive OpenGraph banner graphic, logo safe-zone guide, and WCAG 2.1 AA/AAA contrast analysis.
   - Click on any approved color swatch to test real-time contrast calculations.

3. **Test Scenario 3 (Collaborative Review & Cryptographic Seal)**:
   - Click the **"Review & Approvals Hub"** tab.
   - In the top header, switch the Role selector to **"Legal / Compliance"**.
   - Click **"Approve & Issue Compliance Seal"** to trigger celebration confetti and generate an immutable SHA-256 compliance certificate.

4. **Test Scenario 4 (Governance Analytics & Ambiguity Radar)**:
   - Click the **"Governance Analytics"** tab.
   - Explore the Brand Health Index (94%), Repeated Brand Inconsistencies chart, and the **Guideline Ambiguity & Friction Radar**.

5. **Test Scenario 5 (Zero-Retention Privacy Sandbox)**:
   - Click the **"Zero-Retention Guard"** button in the top header to inspect the AI Ethics & Privacy Disclosure.
   - Test the live Web Crypto SHA-256 verifier with any custom phrase.

---

## 🛡️ Privacy, Security & AI Disclosure

- **Zero Data Retention:** Content drafted inside BrandForge is analyzed client-side in an in-memory browser sandbox. Embargoed product announcements and confidential marketing drafts are never shared with or used to train third-party public foundation models.
- **Explainability Standard:** Every flag identifies the specific guideline rule ID, rationale, and approved source excerpt.
- **Human Authority:** The platform never automatically overrides human creative decisions without author review.

---

## 👥 Authors & Contribution

- **Vishal** — Full-Stack Engineer, Brand Systems Architect & System Designer.
