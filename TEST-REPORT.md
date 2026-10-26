# Test Report — BrandForge | Inkloom AI Round 2 MVP
**Participant:** Vishal S Sollapure  
**Team:** BrandForge  
**Challenge:** Inkloom AI — Intelligent Brand Governance  
**Date:** October 26, 2026  
**Runtime Environment:** Node.js v20.18.0 / Modern Web Browser (HTML5, CSS3, ES2022 Vanilla JavaScript)  
**Verification Method:** Automated Node.js Test Suite (`node tests/rulesEngine.test.js`) + Local HTTP Server Integration

---

## 1. Test Summary Overview

| Category | Total Tests | Passed | Failed | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Input Validation** | 2 | 2 | 0 | **PASSED (100%)** |
| **Deterministic Rules Engine** | 4 | 4 | 0 | **PASSED (100%)** |
| **Accessibility & Readability** | 1 | 1 | 0 | **PASSED (100%)** |
| **Scoring Heuristics & Floor** | 1 | 1 | 0 | **PASSED (100%)** |
| **Suggested Revision Synthesis** | 1 | 1 | 0 | **PASSED (100%)** |
| **String & Regex Boundary Safety** | 1 | 1 | 0 | **PASSED (100%)** |
| **Total Automated Tests** | **10** | **10** | **0** | **100% PASS RATE** |

---

## 2. Detailed Test Results Matrix

| Test ID | Feature Under Test | Test Steps Executed | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Input Validation | Execute `validateInput("", "")` and `validateInput("Valid Title", "")`. | Returns `isValid: false` with specific error messages for empty title and draft. | Returned `isValid: false` with 2 errors for empty fields. | **PASS** |
| **TC-02** | Prohibited Terminology Detection | Match draft text containing `"cheap tool"`, `"foolproof"`, and `"bulletproof"`. | Flags 3 high-severity findings with exact matching quotes and suggested replacements. | 3 findings generated with exact quote evidence and guideline rationales. | **PASS** |
| **TC-03** | Superlative & Promissory Claims Verification | Match draft containing absolute guarantees (`"guaranteed"`, `"100%"`). | Flags findings with `isVerificationNeeded: true` and recommendation for human proof. | Flagged 2 verification claims; differentiated from rule violations. | **PASS** |
| **TC-04** | Tone & Aggressive Hype | Match marketing text containing `"literally magic"` and `"total dominance"`. | Flags medium-severity tone violations with softened enterprise alternatives. | Flagged 2 tone findings with recommendations for measured phrasing. | **PASS** |
| **TC-05** | Accessibility Sentence Length | Evaluate a complex compound sentence containing >30 words. | Triggers low-severity accessibility alert indicating cognitive load. | Detected sentence with 32 words; recommended splitting into 2 clauses. | **PASS** |
| **TC-06** | Compliant Draft Verification | Evaluate clean text containing approved terms and zero avoided phrases. | Returns 0 findings, 100% compliance score, and clean state message. | Returned 0 findings and 100% compliance score. | **PASS** |
| **TC-07** | Compliance Score Calculation | Input 2 high (-18 ea), 1 medium (-8), and 1 low (-3) finding. Test 10-point floor. | Calculates `100 - (18+18+8+3) = 53`. For 10 high findings, enforces floor of 10. | Computed score was exactly 53; floor clamped at 10. | **PASS** |
| **TC-08** | Deterministic Revision Synthesis | Run `generateSuggestedRevision` on dirty draft with avoided & hype terms. | Replaces `"cheap tool"`, `"bulletproof"`, and `"zero risk"` with brand-approved phrasing. | Output text contained `"cost-effective enterprise platform"`, `"resilient"`, and `"minimized operational risk"`. | **PASS** |
| **TC-09** | Word & Character Counter | Pass strings with irregular whitespace, leading/trailing spaces, and empty strings. | Accurately counts word boundaries without whitespace inflation. | Returned exact word counts (4 for padded string, 0 for empty string). | **PASS** |
| **TC-10** | Regex Special Character Escaping | Pass terms with regex metacharacters (`"C++"`, `"[PRO]"`, `"(Special)*"`). | Escapes characters safely; prevents regex syntax errors or injection. | Pattern compiled and matched exact input without throwing exceptions. | **PASS** |

---

## 3. Manual Workflow & UI Verification

The following end-to-end user workflows were verified via local static server (`http://127.0.0.1:5173/`):

1. **Load Sample Campaign:** Clicking *"Load Sample Campaign"* successfully populated the title, content type (`press_release`), and draft text into the editor. Word counter updated to 78 words.
2. **Run Brand Check:** Running the check evaluated the sample campaign in 280ms, displaying a score of **42% (Policy Blockers Detected)** and rendering 6 categorized findings.
3. **Filter Findings:** Clicking filter pills (`All (6)`, `High (4)`, `Medium (2)`, `Low (0)`) dynamically filtered the visible finding cards without page reload.
4. **Suggested Revision:** The suggested revision box generated a softened version replacing `"cheap tool"`, `"bulletproof"`, and `"literally magic"`. Clicking *"Use Suggested Revision"* replaced the left editor content and re-running the check elevated the score.
5. **Approve Version:** Clicking *"Approve This Version"* opened the accessible confirmation modal. Confirming the approval logged the record into `localStorage`.
6. **Review History & Search:** The approved review appeared immediately in the Review History table. Searching for `"Enterprise"` filtered the table accurately.
7. **Insights Update:** The Insights tab dynamically updated its charts to reflect the newly logged review, highlighting `"Prohibited Terminology: 'bulletproof'"` as the most frequent issue.
8. **Brand Guidelines Persistence:** Modifying the brand voice and saving updated `localStorage`. Refreshing the page verified that custom guidelines persisted safely. Clicking *"Restore Defaults"* successfully reset all fields.

---

## 4. Known Limitations & Not-Run Disclosures

- **Browser Automation Video:** Playwright driver binary download failed with an external CDN 404 (`playwright-1.57.0-win32_x64.zip`). Browser automated recording was therefore not executed; manual browser testing and Node.js unit tests were executed instead.
- **Server-Side Database:** As required for Round 2, data persistence relies on browser `localStorage` and is restricted to the local device.
- **Multilingual Support:** Rules and terminology dictionaries are currently optimized for English text.
