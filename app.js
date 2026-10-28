/**
 * BrandForge — Pre-Publication Brand Governance Platform (Vanilla JS)
 * Inkloom AI Brand Governance Challenge — Round 2 Functional MVP
 * Participant: Vishal S Sollapure | Team: BrandForge
 */

(function () {
  'use strict';

  /* ===================================================================
     1. Storage Keys & Default Configuration
     =================================================================== */
  const STORAGE_KEYS = {
    GUIDELINES: 'brandforge_guidelines_v2',
    HISTORY: 'brandforge_history_v2',
    ONBOARDING_SEEN: 'brandforge_onboarding_dismissed_v2'
  };

  // Default brand guidelines conforming to Inkloom AI's problem statement
  const DEFAULT_GUIDELINES = {
    brandName: 'Inkloom AI',
    brandVoice: 'Authoritative, Empathetic, Forward-Looking, Clear, and Honest',
    preferredTerms: [
      'BrandForge platform',
      'intelligent brand-governance engine',
      'resilient and battle-tested',
      'statistically verified precision',
      'cost-effective solution',
      'empowers creators'
    ],
    avoidTerms: [
      { term: 'bulletproof', replacement: 'resilient and battle-tested', reason: 'Misleading engineering absolute; creates legal liability.' },
      { term: 'foolproof', replacement: 'rigorously validated', reason: 'Patronizing tone; implies impossibility of error.' },
      { term: 'cheap tool', replacement: 'cost-effective enterprise platform', reason: 'Degrades brand equity and perceived quality.' },
      { term: 'our bot', replacement: 'BrandForge engine', reason: 'Associated with low-quality conversational spam.' },
      { term: 'guarantees 100% success', replacement: 'delivers statistically verified 99.4% precision', reason: 'Unsubstantiated promissory guarantee creating legal exposure.' },
      { term: 'eliminates human', replacement: 'empowers human creators and reviewers', reason: 'Violates our ethical AI commitment to human-in-the-loop oversight.' },
      { term: 'literally magic', replacement: 'engineered with precision', reason: 'Unprofessional hyperbole; degrades technical authority.' }
    ],
    approvedFacts: [
      'Inkloom AI evaluates over 45 million brand governance checks monthly across 1,200+ enterprise teams.',
      'Certified under ISO/IEC 27001:2022 with a zero-retention policy for draft enterprise content.',
      'Achieves 99.4% precision in deterministic guideline adherence benchmarking.',
      'Accelerates manual review turnaround cycles from 4.8 business days to under 4 hours.'
    ],
    verificationClaims: [
      'best',
      'guaranteed',
      '100% effective',
      '100 billion dollars',
      'zero risk',
      'unbreakable',
      'revolutionary',
      'overnight growth'
    ],
    accessibilityRules: 'Keep sentences under 30 words. Ensure inclusive language. Define technical acronyms upon first usage.',
    visualRules: 'Headings must use Title Case. Official brand mark clear space: minimum 16px. Trademark ® symbol required on first mention.'
  };

  // Sample marketing draft loaded with intentional brand discrepancies
  const SAMPLE_CAMPAIGN = {
    title: 'BrandForge 2.0 Enterprise Launch Announcement',
    type: 'press_release',
    content: `Inkloom AI today announced its completely foolproof and bulletproof AI bot that guarantees 100% success for all marketing teams.

Our cheap tool eliminates every single competitor in the market with zero risk. Independent pilot tests show 100 billion dollars in customer cost savings.

With this release, our system eliminates human managers and editorial review because our bot is literally magic and delivers 10x your growth overnight without any effort! Organizations that utilize this architecture will achieve total dominance across every communication touchpoint.`
  };

  // Pre-configured sample data for demonstrating insights when history is empty
  const SAMPLE_INSIGHTS_HISTORY = [
    {
      id: 'demo-1',
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      title: 'Q3 Enterprise Product Newsletter',
      type: 'email_newsletter',
      score: 64,
      findings: [
        { ruleTitle: 'Avoided Term: "bulletproof"', severity: 'high', type: 'term_avoid' },
        { ruleTitle: 'Promissory Claim Requiring Verification: "guaranteed"', severity: 'high', type: 'claim_verification' },
        { ruleTitle: 'Readability: Sentence exceeds 30 words', severity: 'low', type: 'accessibility' }
      ],
      status: 'flagged'
    },
    {
      id: 'demo-2',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      title: 'Social Thought Leadership Thread',
      type: 'social_post',
      score: 82,
      findings: [
        { ruleTitle: 'Avoided Term: "our bot"', severity: 'medium', type: 'term_avoid' }
      ],
      status: 'approved'
    },
    {
      id: 'demo-3',
      timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
      title: 'Homepage Hero Value Proposition',
      type: 'landing_page',
      score: 95,
      findings: [],
      status: 'approved'
    }
  ];

  /* ===================================================================
     2. Application State
     =================================================================== */
  let currentGuidelines = loadGuidelines();
  let currentReviewHistory = loadHistory();
  let latestCheckResults = null;
  let useDemoInsights = false;
  let currentHistoryStatusFilter = 'all';
  let currentInspectedRecord = null;

  /* ===================================================================
     3. DOM Elements Cache
     =================================================================== */
  const DOM = {
    // Navigation
    navBtns: document.querySelectorAll('.nav-btn'),
    tabViews: document.querySelectorAll('.tab-view'),
    navHistoryCount: document.getElementById('nav-history-count'),
    onboardingBanner: document.getElementById('onboarding-banner'),
    btnDismissOnboarding: document.getElementById('btn-dismiss-onboarding'),
    btnQuickSample: document.getElementById('btn-quick-sample'),

    // Overview KPIs
    metricTotalReviews: document.getElementById('metric-total-reviews'),
    metricApprovedReviews: document.getElementById('metric-approved-reviews'),
    metricFlaggedReviews: document.getElementById('metric-flagged-reviews'),
    metricOutstandingItems: document.getElementById('metric-outstanding-items'),

    // Checker Form & Inputs
    contentTitle: document.getElementById('content-title'),
    contentType: document.getElementById('content-type'),
    draftInput: document.getElementById('draft-input'),
    editorWordCount: document.getElementById('editor-word-count'),
    editorCharCount: document.getElementById('editor-char-count'),
    btnLoadSample: document.getElementById('btn-load-sample'),
    btnClearDraft: document.getElementById('btn-clear-draft'),
    btnRunCheck: document.getElementById('btn-run-check'),
    checkProgress: document.getElementById('check-progress'),

    // Checker Results
    complianceScoreBadge: document.getElementById('compliance-score-badge'),
    scoreStatusText: document.getElementById('score-status-text'),
    scoreSubtext: document.getElementById('score-subtext'),
    findingsFilters: document.getElementById('findings-filters'),
    filterBtns: document.querySelectorAll('.filter-pill'),
    filterAllCount: document.getElementById('filter-all-count'),
    filterHighCount: document.getElementById('filter-high-count'),
    filterMedCount: document.getElementById('filter-med-count'),
    filterLowCount: document.getElementById('filter-low-count'),
    findingsList: document.getElementById('findings-list'),

    // Suggested Revision
    suggestedRevisionSection: document.getElementById('suggested-revision-section'),
    suggestedRevisionText: document.getElementById('suggested-revision-text'),
    btnUseSuggestion: document.getElementById('btn-use-suggestion'),
    btnCompareDiff: document.getElementById('btn-compare-diff'),
    btnCopySuggestion: document.getElementById('btn-copy-suggestion'),
    btnExportAudit: document.getElementById('btn-export-audit'),
    copyTextLabel: document.getElementById('copy-text-label'),
    btnRerunCheck: document.getElementById('btn-rerun-check'),
    btnRejectVersion: document.getElementById('btn-reject-version'),
    btnApproveVersion: document.getElementById('btn-approve-version'),

    // Guidelines Form
    glBrandName: document.getElementById('gl-brand-name'),
    glBrandVoice: document.getElementById('gl-brand-voice'),
    glPreferredTerms: document.getElementById('gl-preferred-terms'),
    glAvoidTerms: document.getElementById('gl-avoid-terms'),
    glApprovedFacts: document.getElementById('gl-approved-facts'),
    glVerificationClaims: document.getElementById('gl-verification-claims'),
    glAccessibilityRules: document.getElementById('gl-accessibility-rules'),
    glVisualRules: document.getElementById('gl-visual-rules'),
    btnSaveGuidelines: document.getElementById('btn-save-guidelines'),
    btnRestoreGuidelines: document.getElementById('btn-restore-guidelines'),

    // History Table & Controls
    historySearchInput: document.getElementById('history-search-input'),
    historyTableBody: document.getElementById('history-table-body'),
    historyEmptyState: document.getElementById('history-empty-state'),
    btnClearHistory: document.getElementById('btn-clear-history'),
    btnExportHistory: document.getElementById('btn-export-history'),
    hfilterAllCount: document.getElementById('hfilter-all-count'),
    hfilterAppCount: document.getElementById('hfilter-app-count'),
    hfilterRejCount: document.getElementById('hfilter-rej-count'),
    historyStatusBtns: document.querySelectorAll('.history-status-btn'),

    // Insights
    insightsFrequentRules: document.getElementById('insights-frequent-rules'),
    insightsHighRisks: document.getElementById('insights-high-risks'),
    insightsDistributionBars: document.getElementById('insights-distribution-bars'),
    insightsGuidelineAdvice: document.getElementById('insights-guideline-advice'),
    insightsContentArea: document.getElementById('insights-content-area'),
    insightsEmptyState: document.getElementById('insights-empty-state'),
    btnToggleDemoInsights: document.getElementById('btn-toggle-demo-insights'),

    // Modals
    modalApprove: document.getElementById('modal-approve'),
    modalApproveDocTitle: document.getElementById('modal-approve-doc-title'),
    modalApproveScore: document.getElementById('modal-approve-score'),
    modalApproveIssues: document.getElementById('modal-approve-issues'),
    modalConfirmApproveBtn: document.getElementById('modal-confirm-approve-btn'),

    modalReject: document.getElementById('modal-reject'),
    modalRejectDocTitle: document.getElementById('modal-reject-doc-title'),
    modalRejectScore: document.getElementById('modal-reject-score'),
    modalRejectIssues: document.getElementById('modal-reject-issues'),
    rejectReviewerNotes: document.getElementById('reject-reviewer-notes'),
    modalConfirmRejectBtn: document.getElementById('modal-confirm-reject-btn'),

    modalCompareDiff: document.getElementById('modal-compare-diff'),
    diffChangesCount: document.getElementById('diff-changes-count'),
    diffOriginalContent: document.getElementById('diff-original-content'),
    diffRevisedContent: document.getElementById('diff-revised-content'),
    diffApplyAndCloseBtn: document.getElementById('diff-apply-and-close-btn'),

    modalExport: document.getElementById('modal-export'),
    exportPreviewArea: document.getElementById('export-preview-area'),
    btnCopyExportJson: document.getElementById('btn-copy-export-json'),
    btnDownloadExportMd: document.getElementById('btn-download-export-md'),
    btnDownloadExportJson: document.getElementById('btn-download-export-json'),

    modalHistoryDetail: document.getElementById('modal-history-detail'),
    detailDate: document.getElementById('detail-date'),
    detailType: document.getElementById('detail-type'),
    detailStatus: document.getElementById('detail-status'),
    detailScore: document.getElementById('detail-score'),
    detailContentText: document.getElementById('detail-content-text'),
    detailFindingsCount: document.getElementById('detail-findings-count'),
    detailFindingsList: document.getElementById('detail-findings-list'),
    btnExportSingleRecord: document.getElementById('btn-export-single-record'),

    modalClearHistory: document.getElementById('modal-clear-history'),
    modalConfirmClearHistoryBtn: document.getElementById('modal-confirm-clear-history-btn'),

    // Toast Container
    toastContainer: document.getElementById('toast-container')
  };

  /* ===================================================================
     4. Safe Storage Helpers (with fallback to defaults)
     =================================================================== */
  function loadGuidelines() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GUIDELINES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.brandName && Array.isArray(parsed.avoidTerms)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read guidelines from localStorage. Falling back to defaults.', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_GUIDELINES));
  }

  function saveGuidelines(guidelines) {
    currentGuidelines = guidelines;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.GUIDELINES, JSON.stringify(guidelines));
      }
      return true;
    } catch (e) {
      console.warn('localStorage is unavailable; guidelines preserved in-memory for this session.', e);
      return true;
    }
  }

  function loadHistory() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read history from localStorage.', e);
    }
    return [];
  }

  function saveHistory(history) {
    currentReviewHistory = history;
    updateOverviewMetrics();
    renderHistoryTable();
    renderInsights();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      }
      return true;
    } catch (e) {
      console.warn('localStorage is unavailable; review history preserved in-memory for this session.', e);
      return true;
    }
  }

  /* ===================================================================
     5. Toast Notification System (DOM-safe, accessible)
     =================================================================== */
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    // Add icon based on type
    const iconSpan = document.createElement('span');
    if (type === 'success') {
      iconSpan.textContent = '✓ ';
      iconSpan.style.color = 'var(--status-success-text)';
    } else if (type === 'error') {
      iconSpan.textContent = '⚠️ ';
      iconSpan.style.color = 'var(--sev-high-text)';
    } else {
      iconSpan.textContent = 'ℹ️ ';
      iconSpan.style.color = 'var(--accent-rose)';
    }

    const textSpan = document.createElement('span');
    textSpan.textContent = message;

    toast.appendChild(iconSpan);
    toast.appendChild(textSpan);
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.25s ease-out';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 3200);
  }

  /* ===================================================================
     6. Safe String & Regex Utilities
     =================================================================== */
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function countWords(str) {
    if (!str || !str.trim()) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ===================================================================
     7. Deterministic Rules Engine (Vanilla JS Core)
     =================================================================== */

  /**
   * Validates title and content draft inputs
   */
  function validateInput(title, text) {
    const errors = [];
    if (!title || !title.trim()) {
      errors.push('Content title is required.');
    } else if (title.trim().length > 120) {
      errors.push('Content title exceeds 120 characters.');
    }

    if (!text || !text.trim()) {
      errors.push('Content draft is empty. Please enter copy to review.');
    } else {
      const words = countWords(text);
      if (words < 4) {
        errors.push('Content draft is too brief for an audit (minimum 4 words required).');
      } else if (text.length > 25000) {
        errors.push('Content draft exceeds maximum recommended length of 25,000 characters.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Evaluates draft text against active brand guidelines across 5 rule categories:
   * 1. Avoided Terminology
   * 2. Unsupported Superlatives & Promissory Claims (Verification Needed)
   * 3. Tone & Aggressive Hype
   * 4. Missing Preferred Terminology
   * 5. Accessibility & Sentence Length
   */
  function matchGuidelines(text, guidelines) {
    const findings = [];
    const lowerText = text.toLowerCase();

    // 1. Check Avoided Terminology
    if (Array.isArray(guidelines.avoidTerms)) {
      guidelines.avoidTerms.forEach((item, index) => {
        if (!item || !item.term) return;
        const termToFind = item.term.trim().toLowerCase();
        if (!termToFind) return;

        // Use word boundary if alphanumeric
        const pattern = new RegExp(`\\b${escapeRegExp(termToFind)}\\b`, 'gi');
        let match;
        while ((match = pattern.exec(text)) !== null) {
          findings.push({
            id: `rule-avoid-${index}-${match.index}`,
            type: 'avoided_term',
            severity: 'high',
            ruleTitle: `Prohibited Terminology: "${item.term}"`,
            guidelineSection: 'Prohibited Terminology',
            evidence: match[0],
            locationIndex: match.index,
            explanation: item.reason || 'This term is explicitly marked as avoided under active brand guidelines.',
            recommendation: item.replacement ? `Replace with: "${item.replacement}"` : 'Remove or rephrase this term.',
            suggestedReplacement: item.replacement || '',
            isVerificationNeeded: false
          });
        }
      });
    }

    // 2. Check Unsupported Superlatives & Promissory Claims (Verification Needed)
    if (Array.isArray(guidelines.verificationClaims)) {
      guidelines.verificationClaims.forEach((claim, index) => {
        const cleanClaim = claim.trim().toLowerCase();
        if (!cleanClaim) return;

        const leftBoundary = /^\w/.test(cleanClaim) ? '\\b' : '';
        const rightBoundary = /\w$/.test(cleanClaim) ? '\\b' : '(?=[\\s.,!?;:]|$)';
        const pattern = new RegExp(`${leftBoundary}${escapeRegExp(cleanClaim)}${rightBoundary}`, 'gi');
        let match;
        while ((match = pattern.exec(text)) !== null) {
          // Check if this claim is already covered by an approved fact
          const isApproved = guidelines.approvedFacts && guidelines.approvedFacts.some(fact =>
            fact.toLowerCase().includes(cleanClaim)
          );

          if (!isApproved) {
            findings.push({
              id: `rule-verify-${index}-${match.index}`,
              type: 'claim_verification',
              severity: 'high',
              ruleTitle: `Claim Requiring Verification: "${cleanClaim}"`,
              guidelineSection: 'Factual Claims & Verification',
              evidence: match[0],
              locationIndex: match.index,
              explanation: `The claim "${match[0]}" is an absolute assertion or high-risk promotional superlative that requires verified supporting evidence before publication.`,
              recommendation: 'Verify against approved statistical sources, or soften to measured language (e.g. "designed to achieve high reliability").',
              suggestedReplacement: '',
              isVerificationNeeded: true
            });
          }
        }
      });
    }

    // 3. Check Tone & Aggressive Hype Keywords
    const toneHypeRules = [
      { trigger: 'zero risk', replacement: 'verifiably mitigated operational risk', reason: 'Claims of "zero risk" violate truth-in-advertising guidelines.' },
      { trigger: 'literally magic', replacement: 'engineered with precision', reason: 'Unprofessional juvenile hyperbole; degrades enterprise brand credibility.' },
      { trigger: 'overnight without any effort', replacement: 'with structured automated assistance', reason: 'Unrealistic promise that diminishes customer strategic contribution.' },
      { trigger: 'total dominance', replacement: 'verified market leadership', reason: 'Overly aggressive militaristic tone out of alignment with brand demeanor.' }
    ];

    toneHypeRules.forEach((rule, idx) => {
      const pattern = new RegExp(`\\b${escapeRegExp(rule.trigger)}\\b`, 'gi');
      let match;
      while ((match = pattern.exec(text)) !== null) {
        // Prevent duplicate if already caught by avoided terms
        const alreadyCaught = findings.some(f => f.locationIndex === match.index);
        if (!alreadyCaught) {
          findings.push({
            id: `rule-tone-${idx}-${match.index}`,
            type: 'tone_style',
            severity: 'medium',
            ruleTitle: `Tone & Voice Mismatch: "${match[0]}"`,
            guidelineSection: 'Voice, Tone & Demeanor',
            evidence: match[0],
            locationIndex: match.index,
            explanation: rule.reason,
            recommendation: `Softened alternative: "${rule.replacement}"`,
            suggestedReplacement: rule.replacement,
            isVerificationNeeded: false
          });
        }
      }
    });

    // 4. Missing Preferred Terminology where generic alternatives are used
    if (lowerText.includes('the tool') || lowerText.includes('our software') || lowerText.includes('the system')) {
      if (!lowerText.includes(guidelines.brandName.toLowerCase())) {
        findings.push({
          id: 'rule-preferred-brand-name',
          type: 'missing_preferred',
          severity: 'low',
          ruleTitle: `Consider Using Official Brand Name: "${guidelines.brandName}"`,
          guidelineSection: 'Official Nomenclature',
          evidence: 'Generic terms: "the tool" / "the software"',
          locationIndex: 0,
          explanation: `Draft relies on generic nouns without reinforcing the official brand identity "${guidelines.brandName}".`,
          recommendation: `Incorporate "${guidelines.brandName}" in the introductory positioning statement.`,
          suggestedReplacement: guidelines.brandName,
          isVerificationNeeded: false
        });
      }
    }

    // 5. Accessibility & Sentence Length Check (> 30 words)
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    sentences.forEach((sentence, idx) => {
      const wordsInSentence = sentence.split(/\s+/).filter(Boolean);
      if (wordsInSentence.length > 30) {
        findings.push({
          id: `rule-access-length-${idx}`,
          type: 'accessibility',
          severity: 'low',
          ruleTitle: `High Cognitive Load: Sentence Exceeds 30 Words (${wordsInSentence.length} words)`,
          guidelineSection: 'Cognitive Accessibility',
          evidence: sentence.substring(0, 50) + '...',
          locationIndex: text.indexOf(sentence),
          explanation: 'Long multi-clause sentences reduce reader comprehension by up to 40% across digital and mobile displays.',
          recommendation: 'Break this complex sentence into two shorter declarative statements.',
          suggestedReplacement: '',
          isVerificationNeeded: false
        });
      }
    });

    return findings;
  }

  /**
   * Computes heuristic compliance score (0-100)
   * High: -18 pts, Medium: -8 pts, Low: -3 pts. Minimum floor: 10.
   */
  function calculateScore(findings) {
    if (!findings || findings.length === 0) {
      return 100;
    }

    let deduction = 0;
    findings.forEach(f => {
      if (f.severity === 'high') deduction += 18;
      else if (f.severity === 'medium') deduction += 8;
      else deduction += 3;
    });

    return Math.max(10, 100 - deduction);
  }

  /**
   * Generates a deterministic suggested revision using configured replacement rules
   */
  function generateSuggestedRevision(text, findings, guidelines) {
    let revised = text;

    // 1. Apply avoided terminology replacements
    if (Array.isArray(guidelines.avoidTerms)) {
      guidelines.avoidTerms.forEach(item => {
        if (item.term && item.replacement) {
          const pattern = new RegExp(`\\b${escapeRegExp(item.term)}\\b`, 'gi');
          revised = revised.replace(pattern, item.replacement);
        }
      });
    }

    // 2. Apply known tone replacements
    const toneReplacements = [
      { from: 'zero risk', to: 'verifiably minimized operational risk' },
      { from: 'literally magic', to: 'engineered with verified precision' },
      { from: '10x your growth overnight without any effort', to: 'streamline your workflow velocity sustainably' },
      { from: '100 billion dollars', to: 'measurable operational cost efficiencies' },
      { from: 'total dominance', to: 'verified market consistency' }
    ];

    toneReplacements.forEach(tr => {
      const pattern = new RegExp(escapeRegExp(tr.from), 'gi');
      revised = revised.replace(pattern, tr.to);
    });

    return revised;
  }

  /* ===================================================================
     8. Rendering & UI Updates (DOM-Safe)
     =================================================================== */

  function updateOverviewMetrics() {
    const list = currentReviewHistory;
    const total = list.length;
    const approved = list.filter(item => item.status === 'approved').length;
    const flagged = list.filter(item => item.status === 'flagged' || item.status === 'rejected').length;

    // Calculate unresolved findings across flagged / rejected items
    let outstanding = 0;
    list.filter(item => item.status !== 'approved').forEach(item => {
      outstanding += (item.findings ? item.findings.length : 0);
    });

    DOM.metricTotalReviews.textContent = total.toString();
    DOM.metricApprovedReviews.textContent = approved.toString();
    DOM.metricFlaggedReviews.textContent = flagged.toString();
    DOM.metricOutstandingItems.textContent = outstanding.toString();
    DOM.navHistoryCount.textContent = total.toString();
  }

  function renderFindings(findings, filter = 'all') {
    DOM.findingsList.innerHTML = '';

    const filtered = findings.filter(f => {
      if (filter === 'all') return true;
      return f.severity === filter;
    });

    // Update filter counts
    const highCount = findings.filter(f => f.severity === 'high').length;
    const medCount = findings.filter(f => f.severity === 'medium').length;
    const lowCount = findings.filter(f => f.severity === 'low').length;

    DOM.filterAllCount.textContent = findings.length.toString();
    DOM.filterHighCount.textContent = highCount.toString();
    DOM.filterMedCount.textContent = medCount.toString();
    DOM.filterLowCount.textContent = lowCount.toString();
    DOM.findingsFilters.style.display = 'flex';

    if (filtered.length === 0) {
      if (findings.length === 0) {
        // Clean result!
        const cleanState = document.createElement('div');
        cleanState.className = 'clean-result-state';

        const icon = document.createElement('div');
        icon.innerHTML = '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';

        const h4 = document.createElement('h4');
        h4.textContent = 'Brand Compliance Verified';

        const p = document.createElement('p');
        p.textContent = 'No rule mismatches, prohibited terminology, or unverified superlatives were triggered. Content is ready for human approval.';

        cleanState.appendChild(icon);
        cleanState.appendChild(h4);
        cleanState.appendChild(p);
        DOM.findingsList.appendChild(cleanState);
      } else {
        // No findings for selected filter
        const emptyFilter = document.createElement('div');
        emptyFilter.className = 'empty-state';
        emptyFilter.innerHTML = '<p>No findings match the selected severity filter.</p>';
        DOM.findingsList.appendChild(emptyFilter);
      }
      return;
    }

    // Render individual finding cards safely
    filtered.forEach(finding => {
      const card = document.createElement('div');
      card.className = `finding-item severity-${finding.severity}`;

      const header = document.createElement('div');
      header.className = 'finding-item-header';

      const title = document.createElement('span');
      title.className = 'finding-title';
      title.textContent = finding.ruleTitle;

      const pill = document.createElement('span');
      pill.className = `finding-pill ${finding.severity}`;
      pill.textContent = finding.severity;

      header.appendChild(title);
      header.appendChild(pill);

      // Explicit Guideline Citation Tag
      const citationTag = document.createElement('div');
      citationTag.className = 'guideline-citation-tag';
      citationTag.textContent = `Rule Section: ${finding.guidelineSection || 'Brand Standards'}`;

      // Evidence snippet
      const evidence = document.createElement('div');
      evidence.className = 'finding-evidence';
      evidence.textContent = `Evidence: "${finding.evidence}"`;

      // Verification note if applicable
      let verifyBadge = null;
      if (finding.isVerificationNeeded) {
        verifyBadge = document.createElement('div');
        verifyBadge.className = 'verification-badge';
        verifyBadge.textContent = '⚠️ Claim Requires Supporting Evidence';
      }

      // Explanation
      const explanation = document.createElement('div');
      explanation.className = 'finding-explanation';
      explanation.textContent = finding.explanation;

      // Recommendation
      const rec = document.createElement('div');
      rec.className = 'finding-recommendation';
      rec.textContent = `Action: ${finding.recommendation}`;

      card.appendChild(header);
      card.appendChild(citationTag);
      card.appendChild(evidence);
      if (verifyBadge) card.appendChild(verifyBadge);
      card.appendChild(explanation);
      card.appendChild(rec);

      DOM.findingsList.appendChild(card);
    });
  }

  function renderScoreBadge(score, findingsCount) {
    DOM.complianceScoreBadge.textContent = score.toString();
    DOM.complianceScoreBadge.className = 'score-badge';

    if (score >= 90) {
      DOM.complianceScoreBadge.classList.add('score-high');
      DOM.scoreStatusText.textContent = 'High Compliance';
      DOM.scoreStatusText.style.color = 'var(--status-success-text)';
      DOM.scoreSubtext.textContent = `${findingsCount} minor issue(s) detected. Content is well-aligned with guidelines.`;
    } else if (score >= 70) {
      DOM.complianceScoreBadge.classList.add('score-medium');
      DOM.scoreStatusText.textContent = 'Moderate Revisions Needed';
      DOM.scoreStatusText.style.color = 'var(--sev-med-text)';
      DOM.scoreSubtext.textContent = `${findingsCount} issue(s) flagged. Review highlighted findings before sign-off.`;
    } else {
      DOM.complianceScoreBadge.classList.add('score-low');
      DOM.scoreStatusText.textContent = 'Policy Blockers Detected';
      DOM.scoreStatusText.style.color = 'var(--sev-high-text)';
      DOM.scoreSubtext.textContent = `${findingsCount} policy violation(s). Revisions required prior to publication.`;
    }
  }

  function renderHistoryTable(searchTerm = '') {
    const list = currentReviewHistory;
    DOM.historyTableBody.innerHTML = '';

    const allCount = list.length;
    const appCount = list.filter(item => item.status === 'approved').length;
    const rejCount = list.filter(item => item.status === 'rejected' || item.status === 'flagged').length;

    if (DOM.hfilterAllCount) DOM.hfilterAllCount.textContent = allCount.toString();
    if (DOM.hfilterAppCount) DOM.hfilterAppCount.textContent = appCount.toString();
    if (DOM.hfilterRejCount) DOM.hfilterRejCount.textContent = rejCount.toString();

    const filtered = list.filter(item => {
      // 1. Status Filter
      if (currentHistoryStatusFilter === 'approved' && item.status !== 'approved') return false;
      if (currentHistoryStatusFilter === 'rejected' && item.status !== 'rejected' && item.status !== 'flagged') return false;

      // 2. Search Filter
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (item.title && item.title.toLowerCase().includes(term)) ||
             (item.type && item.type.toLowerCase().includes(term)) ||
             (item.reviewerNotes && item.reviewerNotes.toLowerCase().includes(term));
    });

    if (filtered.length === 0) {
      DOM.historyEmptyState.style.display = 'block';
      return;
    } else {
      DOM.historyEmptyState.style.display = 'none';
    }

    filtered.forEach(item => {
      const tr = document.createElement('tr');

      // Date
      const tdDate = document.createElement('td');
      const dateObj = new Date(item.timestamp);
      tdDate.textContent = isNaN(dateObj.getTime()) ? 'Recently' : dateObj.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

      // Title
      const tdTitle = document.createElement('td');
      tdTitle.style.fontWeight = '600';
      tdTitle.style.color = 'var(--text-primary)';
      tdTitle.textContent = item.title || 'Untitled Draft';

      // Type
      const tdType = document.createElement('td');
      tdType.textContent = (item.type || 'General').replace('_', ' ');

      // Score
      const tdScore = document.createElement('td');
      const scoreBadge = document.createElement('span');
      scoreBadge.className = 'font-mono';
      scoreBadge.style.fontWeight = '700';
      scoreBadge.style.color = item.score >= 90 ? 'var(--status-success-text)' : item.score >= 70 ? 'var(--sev-med-text)' : 'var(--sev-high-text)';
      scoreBadge.textContent = `${item.score}%`;
      tdScore.appendChild(scoreBadge);

      // Findings
      const tdFindings = document.createElement('td');
      tdFindings.textContent = `${item.findings ? item.findings.length : 0} items`;

      // Status
      const tdStatus = document.createElement('td');
      const statusPill = document.createElement('span');
      const isRejected = item.status === 'rejected';
      statusPill.className = `status-pill ${item.status || 'draft'}`;
      statusPill.textContent = isRejected ? 'CHANGES REQUESTED' : (item.status || 'draft').toUpperCase();
      tdStatus.appendChild(statusPill);

      // Actions
      const tdAction = document.createElement('td');
      tdAction.style.textAlign = 'right';
      const inspectBtn = document.createElement('button');
      inspectBtn.className = 'btn btn-secondary btn-sm';
      inspectBtn.textContent = 'Inspect';
      inspectBtn.addEventListener('click', () => openHistoryDetail(item));
      tdAction.appendChild(inspectBtn);

      tr.appendChild(tdDate);
      tr.appendChild(tdTitle);
      tr.appendChild(tdType);
      tr.appendChild(tdScore);
      tr.appendChild(tdFindings);
      tr.appendChild(tdStatus);
      tr.appendChild(tdAction);

      DOM.historyTableBody.appendChild(tr);
    });
  }

  function renderInsights() {
    const list = useDemoInsights ? SAMPLE_INSIGHTS_HISTORY : currentReviewHistory;

    if (list.length === 0) {
      DOM.insightsContentArea.style.display = 'none';
      DOM.insightsEmptyState.style.display = 'block';
      return;
    }

    DOM.insightsContentArea.style.display = 'block';
    DOM.insightsEmptyState.style.display = 'none';

    // 1. Aggregate rule frequencies
    const ruleCounts = {};
    const highRisks = [];
    let approvedCount = 0;
    let flaggedCount = 0;

    list.forEach(review => {
      if (review.status === 'approved') approvedCount++;
      if (review.status === 'flagged') flaggedCount++;

      if (Array.isArray(review.findings)) {
        review.findings.forEach(f => {
          ruleCounts[f.ruleTitle] = (ruleCounts[f.ruleTitle] || 0) + 1;
          if (f.severity === 'high' && !highRisks.some(hr => hr.ruleTitle === f.ruleTitle)) {
            highRisks.push(f);
          }
        });
      }
    });

    // Render frequent rules
    DOM.insightsFrequentRules.innerHTML = '';
    const sortedRules = Object.entries(ruleCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (sortedRules.length === 0) {
      DOM.insightsFrequentRules.innerHTML = '<p class="font-hint">No rule violations recorded.</p>';
    } else {
      sortedRules.forEach(([ruleTitle, count]) => {
        const item = document.createElement('div');
        item.className = 'insight-list-item';

        const spanTitle = document.createElement('span');
        spanTitle.textContent = ruleTitle;
        spanTitle.style.fontWeight = '500';

        const spanCount = document.createElement('span');
        spanCount.className = 'badge';
        spanCount.textContent = `${count}x`;

        item.appendChild(spanTitle);
        item.appendChild(spanCount);
        DOM.insightsFrequentRules.appendChild(item);
      });
    }

    // Render high risks
    DOM.insightsHighRisks.innerHTML = '';
    if (highRisks.length === 0) {
      DOM.insightsHighRisks.innerHTML = '<p style="color: var(--status-success-text); font-size: 0.8rem;">No high-priority unresolved risks detected in review history.</p>';
    } else {
      highRisks.slice(0, 4).forEach(f => {
        const item = document.createElement('div');
        item.className = 'insight-list-item';
        item.style.borderColor = 'var(--sev-high-border)';

        const text = document.createElement('span');
        text.textContent = f.ruleTitle;
        text.style.color = 'var(--sev-high-text)';

        item.appendChild(text);
        DOM.insightsHighRisks.appendChild(item);
      });
    }

    // Render distribution bars
    DOM.insightsDistributionBars.innerHTML = '';
    const total = list.length;
    const approvedPct = Math.round((approvedCount / total) * 100) || 0;
    const flaggedPct = Math.round((flaggedCount / total) * 100) || 0;

    const createBar = (label, count, pct, color) => {
      const container = document.createElement('div');
      container.className = 'insight-bar-container';

      const header = document.createElement('div');
      header.className = 'insight-bar-header';
      header.innerHTML = `<span>${label} (${count})</span><strong>${pct}%</strong>`;

      const track = document.createElement('div');
      track.className = 'insight-bar-track';

      const fill = document.createElement('div');
      fill.className = 'insight-bar-fill';
      fill.style.width = `${pct}%`;
      fill.style.backgroundColor = color;

      track.appendChild(fill);
      container.appendChild(header);
      container.appendChild(track);
      return container;
    };

    DOM.insightsDistributionBars.appendChild(createBar('Approved for Publication', approvedCount, approvedPct, 'var(--status-success-text)'));
    DOM.insightsDistributionBars.appendChild(createBar('Flagged for Revision', flaggedCount, flaggedPct, 'var(--sev-high-text)'));

    // Render guideline gap advice
    DOM.insightsGuidelineAdvice.innerHTML = '';
    const adviceP = document.createElement('p');

    if (sortedRules.length > 0) {
      const topRule = sortedRules[0][0];
      const strong = document.createElement('strong');
      strong.textContent = 'High Friction Area Detected: ';
      const em = document.createElement('em');
      em.textContent = `"${topRule}"`;
      const textAfter = document.createTextNode(` is your organization's most repeated brand inconsistency (${sortedRules[0][1]} times). Consider refining guidelines to provide clearer copy examples or distributing an approved facts cheat-sheet.`);
      adviceP.appendChild(strong);
      adviceP.appendChild(em);
      adviceP.appendChild(textAfter);
    } else {
      adviceP.textContent = 'Guidelines are performing effectively with minimal repeated discrepancies across reviews.';
    }
    DOM.insightsGuidelineAdvice.appendChild(adviceP);
  }

  function populateGuidelinesForm() {
    DOM.glBrandName.value = currentGuidelines.brandName || '';
    DOM.glBrandVoice.value = currentGuidelines.brandVoice || '';
    DOM.glPreferredTerms.value = (currentGuidelines.preferredTerms || []).join('\n');

    // Format avoided terms as term -> replacement
    const avoidLines = (currentGuidelines.avoidTerms || []).map(item => {
      if (item.replacement) {
        return `${item.term} -> ${item.replacement}`;
      }
      return item.term;
    });
    DOM.glAvoidTerms.value = avoidLines.join('\n');

    DOM.glApprovedFacts.value = (currentGuidelines.approvedFacts || []).join('\n');
    DOM.glVerificationClaims.value = (currentGuidelines.verificationClaims || []).join(', ');
    DOM.glAccessibilityRules.value = currentGuidelines.accessibilityRules || '';
    if (DOM.glVisualRules) {
      DOM.glVisualRules.value = currentGuidelines.visualRules || '';
    }
  }

  function readGuidelinesFromForm() {
    const brandName = DOM.glBrandName.value.trim() || 'Inkloom AI';
    const brandVoice = DOM.glBrandVoice.value.trim();

    const preferredTerms = DOM.glPreferredTerms.value
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean);

    const avoidLines = DOM.glAvoidTerms.value.split('\n').filter(Boolean);
    const avoidTerms = avoidLines.map(line => {
      if (line.includes('->')) {
        const parts = line.split('->').map(p => p.trim());
        return {
          term: parts[0],
          replacement: parts[1] || '',
          reason: 'Configured under avoided terms.'
        };
      }
      return {
        term: line.trim(),
        replacement: '',
        reason: 'Configured under avoided terms.'
      };
    });

    const approvedFacts = DOM.glApprovedFacts.value.split('\n').map(f => f.trim()).filter(Boolean);
    const verificationClaims = DOM.glVerificationClaims.value.split(',').map(c => c.trim()).filter(Boolean);
    const accessibilityRules = DOM.glAccessibilityRules.value.trim();
    const visualRules = DOM.glVisualRules ? DOM.glVisualRules.value.trim() : '';

    return {
      brandName,
      brandVoice,
      preferredTerms,
      avoidTerms,
      approvedFacts,
      verificationClaims,
      accessibilityRules,
      visualRules
    };
  }

  /* ===================================================================
     9. Event Handlers & Workflow Steps
     =================================================================== */

  // Tab Navigation
  function switchTab(targetId) {
    DOM.navBtns.forEach(btn => {
      const isTarget = btn.getAttribute('data-target') === targetId;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget.toString());
    });

    DOM.tabViews.forEach(view => {
      view.classList.toggle('active', view.id === targetId);
    });

    if (targetId === 'view-history') {
      renderHistoryTable(DOM.historySearchInput.value);
    } else if (targetId === 'view-insights') {
      renderInsights();
    }
  }

  // Run Brand Check Handler
  function handleRunCheck() {
    const title = DOM.contentTitle.value;
    const text = DOM.draftInput.value;
    const contentType = DOM.contentType.value;

    const validation = validateInput(title, text);
    if (!validation.isValid) {
      showToast(validation.errors[0], 'error');
      return;
    }

    // Show progress feedback
    DOM.btnRunCheck.disabled = true;
    DOM.checkProgress.style.display = 'block';

    setTimeout(() => {
      const findings = matchGuidelines(text, currentGuidelines);
      const score = calculateScore(findings);
      const suggestedRevision = generateSuggestedRevision(text, findings, currentGuidelines);

      latestCheckResults = {
        title,
        type: contentType,
        rawText: text,
        findings,
        score,
        suggestedRevision,
        timestamp: new Date().toISOString()
      };

      // Render findings & score
      renderFindings(findings);
      renderScoreBadge(score, findings.length);

      // Populate suggested revision box
      DOM.suggestedRevisionText.value = suggestedRevision;
      DOM.suggestedRevisionSection.style.display = 'flex';

      DOM.checkProgress.style.display = 'none';
      DOM.btnRunCheck.disabled = false;

      showToast(`Brand Check complete. Score: ${score}% (${findings.length} findings)`, score >= 70 ? 'success' : 'error');
    }, 280);
  }

  // Copy Suggested Revision Handler
  function handleCopySuggestion() {
    const textToCopy = DOM.suggestedRevisionText.value;
    if (!textToCopy) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        DOM.copyTextLabel.textContent = 'Copied!';
        showToast('Suggested revision copied to clipboard.', 'success');
        setTimeout(() => {
          DOM.copyTextLabel.textContent = 'Copy Text';
        }, 2000);
      }).catch(() => fallbackCopy(textToCopy));
    } else {
      fallbackCopy(textToCopy);
    }
  }

  function fallbackCopy(text) {
    DOM.suggestedRevisionText.select();
    document.execCommand('copy');
    DOM.copyTextLabel.textContent = 'Copied!';
    showToast('Suggested revision copied to clipboard.', 'success');
    setTimeout(() => {
      DOM.copyTextLabel.textContent = 'Copy Text';
    }, 2000);
  }

  // Open History Detail Modal
  function openHistoryDetail(record) {
    currentInspectedRecord = record;
    DOM.detailDate.textContent = new Date(record.timestamp).toLocaleString();
    DOM.detailType.textContent = (record.type || 'General').replace('_', ' ');
    const displayStatus = record.status === 'rejected' ? 'CHANGES REQUESTED' : (record.status || 'draft').toUpperCase();
    DOM.detailStatus.textContent = displayStatus;
    DOM.detailScore.textContent = `${record.score}%`;
    DOM.detailContentText.textContent = record.rawText || '(No content preserved)';

    DOM.detailFindingsCount.textContent = (record.findings ? record.findings.length : 0).toString();
    DOM.detailFindingsList.innerHTML = '';

    if (record.reviewerNotes) {
      const notesBlock = document.createElement('div');
      notesBlock.style.background = 'rgba(201, 74, 91, 0.14)';
      notesBlock.style.border = '1px solid var(--sev-high-border)';
      notesBlock.style.borderRadius = 'var(--radius-sm)';
      notesBlock.style.padding = '8px 10px';
      notesBlock.style.fontSize = '0.8rem';
      notesBlock.style.color = 'var(--sev-high-text)';
      notesBlock.style.marginBottom = '6px';
      notesBlock.innerHTML = `<strong>Reviewer Feedback:</strong> ${escapeHtml(record.reviewerNotes)}`;
      DOM.detailFindingsList.appendChild(notesBlock);
    }

    if (!record.findings || record.findings.length === 0) {
      const cleanSpan = document.createElement('span');
      cleanSpan.style.color = 'var(--status-success-text)';
      cleanSpan.style.fontSize = '0.8rem';
      cleanSpan.textContent = '✓ No policy issues detected.';
      DOM.detailFindingsList.appendChild(cleanSpan);
    } else {
      record.findings.forEach(f => {
        const item = document.createElement('div');
        item.style.padding = '6px 8px';
        item.style.borderRadius = 'var(--radius-sm)';
        item.style.background = 'var(--bg-surface)';
        item.style.border = '1px solid var(--border-subtle)';
        item.style.fontSize = '0.775rem';

        const strong = document.createElement('strong');
        strong.textContent = `${f.severity.toUpperCase()}: `;

        const titleText = document.createTextNode(`${f.ruleTitle} `);

        const em = document.createElement('em');
        em.textContent = `(${f.evidence})`;

        const secBadge = document.createElement('span');
        secBadge.className = 'guideline-citation-tag';
        secBadge.style.marginLeft = '6px';
        secBadge.textContent = f.guidelineSection || 'Policy';

        item.appendChild(strong);
        item.appendChild(titleText);
        item.appendChild(em);
        item.appendChild(secBadge);
        DOM.detailFindingsList.appendChild(item);
      });
    }

    openModal('modal-history-detail');
  }

  /* ===================================================================
     Diff Comparison & Export Generators
     =================================================================== */

  /**
   * Builds visual diff markup for original draft vs suggested revision
   */
  function buildDiffData(originalText, suggestedText, findings, guidelines) {
    let originalHtml = escapeHtml(originalText);
    let revisedHtml = escapeHtml(suggestedText);
    let changesCount = 0;

    // 1. Highlight avoided terms in original and replacements in suggested
    if (Array.isArray(guidelines.avoidTerms)) {
      guidelines.avoidTerms.forEach(item => {
        if (!item || !item.term) return;
        const pattern = new RegExp(`\\b(${escapeRegExp(escapeHtml(item.term))})\\b`, 'gi');
        if (pattern.test(originalHtml)) {
          changesCount++;
          originalHtml = originalHtml.replace(pattern, '<span class="diff-del">$1</span>');
        }
        if (item.replacement) {
          const repPattern = new RegExp(`\\b(${escapeRegExp(escapeHtml(item.replacement))})\\b`, 'gi');
          revisedHtml = revisedHtml.replace(repPattern, '<span class="diff-ins">$1</span>');
        }
      });
    }

    // 2. Highlight known tone replacements
    const toneReplacements = [
      { from: 'zero risk', to: 'verifiably minimized operational risk' },
      { from: 'literally magic', to: 'engineered with verified precision' },
      { from: '10x your growth overnight without any effort', to: 'streamline your workflow velocity sustainably' },
      { from: '100 billion dollars', to: 'measurable operational cost efficiencies' },
      { from: 'total dominance', to: 'verified market consistency' }
    ];

    toneReplacements.forEach(tr => {
      const fromPat = new RegExp(`(${escapeRegExp(escapeHtml(tr.from))})`, 'gi');
      if (fromPat.test(originalHtml)) {
        changesCount++;
        originalHtml = originalHtml.replace(fromPat, '<span class="diff-del">$1</span>');
      }
      const toPat = new RegExp(`(${escapeRegExp(escapeHtml(tr.to))})`, 'gi');
      revisedHtml = revisedHtml.replace(toPat, '<span class="diff-ins">$1</span>');
    });

    return {
      originalHtml,
      revisedHtml,
      changesCount: Math.max(changesCount, 1)
    };
  }

  /**
   * Generates structured audit JSON
   */
  function generateAuditJson(record) {
    return JSON.stringify({
      brandForgeAuditVersion: '2.0-MVP',
      engine: 'BrandForge Deterministic Rules Engine',
      auditTimestamp: record.timestamp || new Date().toISOString(),
      documentTitle: record.title || 'Untitled',
      contentType: record.type || 'general',
      complianceScore: record.score,
      status: record.status || 'draft',
      reviewerNotes: record.reviewerNotes || null,
      findingsCount: record.findings ? record.findings.length : 0,
      findings: record.findings || [],
      contentSnapshot: record.rawText || '',
      governanceNotice: 'Verified via BrandForge Deterministic Rules Engine. Client-side evaluation.'
    }, null, 2);
  }

  /**
   * Generates formatted audit Markdown
   */
  function generateAuditMarkdown(record) {
    const dateStr = record.timestamp ? new Date(record.timestamp).toLocaleString() : 'N/A';
    const findingsList = record.findings || [];
    let md = `# BrandForge Governance Audit Report\n\n`;
    md += `- **Document Title:** ${record.title || 'Untitled'}\n`;
    md += `- **Content Type:** ${(record.type || 'General').replace('_', ' ')}\n`;
    md += `- **Audit Date & Time:** ${dateStr}\n`;
    md += `- **Compliance Score:** ${record.score}%\n`;
    md += `- **Review Status:** ${(record.status || 'draft').toUpperCase()}\n`;
    if (record.reviewerNotes) {
      md += `- **Reviewer Notes:** ${record.reviewerNotes}\n`;
    }
    md += `- **Governance Engine:** Deterministic Policy Index (Inkloom AI)\n\n`;
    md += `## Findings & Policy Citations (${findingsList.length} items)\n\n`;
    if (findingsList.length === 0) {
      md += `*No brand rule violations or unverified claims detected. Content is 100% compliant with active guidelines.*\n\n`;
    } else {
      md += `| Severity | Policy Section | Trigger / Evidence | Recommendation |\n`;
      md += `| :--- | :--- | :--- | :--- |\n`;
      findingsList.forEach(f => {
        const sec = f.guidelineSection || 'Brand Standards';
        const ev = (f.evidence || '').replace(/\|/g, '\\|');
        const rec = (f.recommendation || '').replace(/\|/g, '\\|');
        md += `| **${f.severity.toUpperCase()}** | ${sec} | \`${ev}\` | ${rec} |\n`;
      });
      md += `\n`;
    }
    md += `## Content Snapshot\n\n\`\`\`\n${record.rawText || ''}\n\`\`\`\n\n`;
    md += `*Report generated by BrandForge • Inkloom AI Brand Governance Challenge (Round 2 MVP)*\n`;
    return md;
  }

  /**
   * Helper to trigger client-side file downloads
   */
  function triggerDownload(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Modal Helpers
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }

  /* ===================================================================
     10. Event Listeners Setup
     =================================================================== */
  function setupEventListeners() {
    // Tab switching
    DOM.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        switchTab(target);
      });
    });

    // Dismiss onboarding
    DOM.btnDismissOnboarding.addEventListener('click', () => {
      DOM.onboardingBanner.style.display = 'none';
      try {
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_SEEN, 'true');
      } catch (e) { /* ignore */ }
    });

    // Word and character counters
    DOM.draftInput.addEventListener('input', () => {
      const text = DOM.draftInput.value;
      DOM.editorWordCount.textContent = countWords(text).toString();
      DOM.editorCharCount.textContent = text.length.toString();
    });

    // Load sample campaign
    const loadSample = () => {
      DOM.contentTitle.value = SAMPLE_CAMPAIGN.title;
      DOM.contentType.value = SAMPLE_CAMPAIGN.type;
      DOM.draftInput.value = SAMPLE_CAMPAIGN.content;
      DOM.editorWordCount.textContent = countWords(SAMPLE_CAMPAIGN.content).toString();
      DOM.editorCharCount.textContent = SAMPLE_CAMPAIGN.content.length.toString();
      switchTab('view-checker');
      showToast('Sample marketing campaign loaded.', 'info');
    };

    DOM.btnLoadSample.addEventListener('click', loadSample);
    DOM.btnQuickSample.addEventListener('click', loadSample);

    // Clear Draft
    DOM.btnClearDraft.addEventListener('click', () => {
      DOM.contentTitle.value = '';
      DOM.draftInput.value = '';
      DOM.editorWordCount.textContent = '0';
      DOM.editorCharCount.textContent = '0';
      DOM.suggestedRevisionSection.style.display = 'none';
      DOM.findingsFilters.style.display = 'none';
      DOM.findingsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>
          <h4>No Findings to Display Yet</h4>
          <p>Enter your content or load the sample draft on the left, then click <strong>Run Brand Check</strong>.</p>
        </div>
      `;
      DOM.complianceScoreBadge.textContent = '--';
      DOM.complianceScoreBadge.className = 'score-badge score-high';
      DOM.scoreStatusText.textContent = 'Ready for Check';
      DOM.scoreSubtext.textContent = 'Click "Run Brand Check" to analyze draft content.';
      showToast('Draft editor cleared.', 'info');
    });

    // Run Brand Check
    DOM.btnRunCheck.addEventListener('click', handleRunCheck);

    // Filter Findings by Severity
    DOM.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        if (latestCheckResults && latestCheckResults.findings) {
          renderFindings(latestCheckResults.findings, filter);
        }
      });
    });

    // Use Suggested Revision
    DOM.btnUseSuggestion.addEventListener('click', () => {
      const suggested = DOM.suggestedRevisionText.value;
      if (!suggested) return;
      DOM.draftInput.value = suggested;
      DOM.editorWordCount.textContent = countWords(suggested).toString();
      DOM.editorCharCount.textContent = suggested.length.toString();
      showToast('Applied suggested revision to active draft.', 'success');
      // Automatically re-run check
      handleRunCheck();
    });

    // Copy Suggested Revision
    DOM.btnCopySuggestion.addEventListener('click', handleCopySuggestion);

    // Compare with Original (Visual Diff)
    if (DOM.btnCompareDiff) {
      DOM.btnCompareDiff.addEventListener('click', () => {
        if (!latestCheckResults) {
          showToast('Please run a brand check before comparing versions.', 'error');
          return;
        }
        const originalText = latestCheckResults.rawText;
        const suggestedText = DOM.suggestedRevisionText.value || latestCheckResults.suggestedRevision;
        const diff = buildDiffData(originalText, suggestedText, latestCheckResults.findings, currentGuidelines);
        DOM.diffOriginalContent.innerHTML = diff.originalHtml;
        DOM.diffRevisedContent.innerHTML = diff.revisedHtml;
        DOM.diffChangesCount.textContent = `${diff.changesCount} Policy Replacement(s)`;
        openModal('modal-compare-diff');
      });
    }

    // Apply Revision from Diff Modal
    if (DOM.diffApplyAndCloseBtn) {
      DOM.diffApplyAndCloseBtn.addEventListener('click', () => {
        const suggested = DOM.suggestedRevisionText.value;
        if (suggested) {
          DOM.draftInput.value = suggested;
          DOM.editorWordCount.textContent = countWords(suggested).toString();
          DOM.editorCharCount.textContent = suggested.length.toString();
          closeModal('modal-compare-diff');
          showToast('Applied suggested revision to draft and updated check.', 'success');
          handleRunCheck();
        } else {
          closeModal('modal-compare-diff');
        }
      });
    }

    // Export Audit Report from Checker
    if (DOM.btnExportAudit) {
      DOM.btnExportAudit.addEventListener('click', () => {
        if (!latestCheckResults) {
          showToast('Please run a brand check before exporting.', 'error');
          return;
        }
        const record = {
          timestamp: new Date().toISOString(),
          title: (DOM.contentTitle && DOM.contentTitle.value.trim()) || latestCheckResults.title,
          type: latestCheckResults.type,
          score: latestCheckResults.score,
          findings: latestCheckResults.findings,
          rawText: DOM.suggestedRevisionText.value || latestCheckResults.rawText,
          status: 'evaluated'
        };
        currentInspectedRecord = record;
        DOM.exportPreviewArea.value = generateAuditJson(record);
        openModal('modal-export');
      });
    }

    // Export Modal Actions
    if (DOM.btnCopyExportJson) {
      DOM.btnCopyExportJson.addEventListener('click', () => {
        if (!currentInspectedRecord) return;
        const json = generateAuditJson(currentInspectedRecord);
        navigator.clipboard.writeText(json).then(() => {
          showToast('Audit JSON copied to clipboard.', 'success');
        }).catch(() => {
          DOM.exportPreviewArea.select();
          document.execCommand('copy');
          showToast('Audit JSON copied to clipboard.', 'success');
        });
      });
    }

    if (DOM.btnDownloadExportJson) {
      DOM.btnDownloadExportJson.addEventListener('click', () => {
        if (!currentInspectedRecord) return;
        const json = generateAuditJson(currentInspectedRecord);
        const slug = (currentInspectedRecord.title || 'draft').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
        triggerDownload(`brandforge-audit-${slug}-${Date.now()}.json`, json, 'application/json');
        showToast('Downloaded audit report JSON.', 'success');
      });
    }

    if (DOM.btnDownloadExportMd) {
      DOM.btnDownloadExportMd.addEventListener('click', () => {
        if (!currentInspectedRecord) return;
        const md = generateAuditMarkdown(currentInspectedRecord);
        const slug = (currentInspectedRecord.title || 'draft').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
        triggerDownload(`brandforge-audit-${slug}-${Date.now()}.md`, md, 'text/markdown');
        showToast('Downloaded audit report Markdown.', 'success');
      });
    }

    // Re-run Check
    DOM.btnRerunCheck.addEventListener('click', handleRunCheck);

    // Request Changes / Reject Version Button
    if (DOM.btnRejectVersion) {
      DOM.btnRejectVersion.addEventListener('click', () => {
        if (!latestCheckResults) {
          showToast('Please run a brand check before requesting changes.', 'error');
          return;
        }
        DOM.modalRejectDocTitle.textContent = latestCheckResults.title;
        DOM.modalRejectScore.textContent = `${latestCheckResults.score}%`;
        DOM.modalRejectIssues.textContent = `${latestCheckResults.findings.length} findings (${latestCheckResults.findings.filter(f => f.severity === 'high').length} high risk)`;
        DOM.rejectReviewerNotes.value = '';
        openModal('modal-reject');
      });
    }

    // Confirm Rejection Button
    if (DOM.modalConfirmRejectBtn) {
      DOM.modalConfirmRejectBtn.addEventListener('click', () => {
        if (!latestCheckResults) return;

        const record = {
          id: `rev-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: (DOM.contentTitle && DOM.contentTitle.value.trim()) || latestCheckResults.title,
          type: latestCheckResults.type,
          score: latestCheckResults.score,
          findings: latestCheckResults.findings,
          rawText: (DOM.draftInput && DOM.draftInput.value.trim()) || latestCheckResults.rawText,
          status: 'rejected',
          reviewerNotes: DOM.rejectReviewerNotes.value.trim() || 'Author revision required to address flagged policy findings.'
        };

        const updatedHistory = [record, ...currentReviewHistory];
        saveHistory(updatedHistory);

        closeModal('modal-reject');
        showToast('Draft recorded as Changes Requested in Review History.', 'error');
      });
    }

    // Approve Version Button -> Opens Confirmation Modal
    DOM.btnApproveVersion.addEventListener('click', () => {
      if (!latestCheckResults) {
        showToast('Please run a brand check before approving.', 'error');
        return;
      }
      DOM.modalApproveDocTitle.textContent = latestCheckResults.title;
      DOM.modalApproveScore.textContent = `${latestCheckResults.score}%`;
      DOM.modalApproveIssues.textContent = `${latestCheckResults.findings.length} findings (${latestCheckResults.findings.filter(f => f.severity === 'high').length} high risk)`;
      openModal('modal-approve');
    });

    // Confirm Approval Button
    DOM.modalConfirmApproveBtn.addEventListener('click', () => {
      if (!latestCheckResults) return;

      const approvedContent = (DOM.suggestedRevisionText && DOM.suggestedRevisionText.value.trim()) || latestCheckResults.rawText;
      const record = {
        id: `rev-${Date.now()}`,
        timestamp: new Date().toISOString(),
        title: (DOM.contentTitle && DOM.contentTitle.value.trim()) || latestCheckResults.title,
        type: latestCheckResults.type,
        score: latestCheckResults.score,
        findings: latestCheckResults.findings,
        rawText: approvedContent,
        status: 'approved',
        reviewerNotes: null
      };

      const updatedHistory = [record, ...currentReviewHistory];
      saveHistory(updatedHistory);

      closeModal('modal-approve');
      showToast('Version officially approved and logged in Review History.', 'success');
    });

    // Save Guidelines
    DOM.btnSaveGuidelines.addEventListener('click', () => {
      const updated = readGuidelinesFromForm();
      if (saveGuidelines(updated)) {
        showToast('Brand Guidelines saved successfully.', 'success');
      } else {
        showToast('Failed to save guidelines.', 'error');
      }
    });

    // Restore Guidelines to Defaults
    DOM.btnRestoreGuidelines.addEventListener('click', () => {
      if (confirm('Are you sure you want to restore the default guidelines? Any custom terms will be overwritten.')) {
        currentGuidelines = JSON.parse(JSON.stringify(DEFAULT_GUIDELINES));
        saveGuidelines(currentGuidelines);
        populateGuidelinesForm();
        showToast('Brand Guidelines restored to defaults.', 'info');
      }
    });

    // History Search
    DOM.historySearchInput.addEventListener('input', () => {
      renderHistoryTable(DOM.historySearchInput.value);
    });

    // History Status Filters
    if (DOM.historyStatusBtns) {
      DOM.historyStatusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          DOM.historyStatusBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentHistoryStatusFilter = btn.getAttribute('data-status') || 'all';
          renderHistoryTable(DOM.historySearchInput ? DOM.historySearchInput.value : '');
        });
      });
    }

    // Export All History Button
    if (DOM.btnExportHistory) {
      DOM.btnExportHistory.addEventListener('click', () => {
        if (currentReviewHistory.length === 0) {
          showToast('No review history available to export.', 'info');
          return;
        }
        const fullJson = JSON.stringify({
          brandForgeExportVersion: '2.0',
          exportedAt: new Date().toISOString(),
          totalRecords: currentReviewHistory.length,
          records: currentReviewHistory
        }, null, 2);
        triggerDownload(`brandforge-all-history-${Date.now()}.json`, fullJson, 'application/json');
        showToast('Exported full review history (JSON).', 'success');
      });
    }

    // Export Single Record from Inspect Modal
    if (DOM.btnExportSingleRecord) {
      DOM.btnExportSingleRecord.addEventListener('click', () => {
        if (!currentInspectedRecord) return;
        const json = generateAuditJson(currentInspectedRecord);
        const slug = (currentInspectedRecord.title || 'draft').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
        triggerDownload(`brandforge-record-${slug}-${Date.now()}.json`, json, 'application/json');
        showToast('Exported review record (JSON).', 'success');
      });
    }

    // Clear History Button -> Opens Confirmation Modal
    DOM.btnClearHistory.addEventListener('click', () => {
      openModal('modal-clear-history');
    });

    // Confirm Clear History
    DOM.modalConfirmClearHistoryBtn.addEventListener('click', () => {
      saveHistory([]);
      closeModal('modal-clear-history');
      showToast('Review history cleared.', 'info');
    });

    // Toggle Demo Analytics
    DOM.btnToggleDemoInsights.addEventListener('click', () => {
      useDemoInsights = !useDemoInsights;
      DOM.btnToggleDemoInsights.textContent = useDemoInsights ? 'Showing Sample Data (Click for Real)' : 'Toggle Demo Analytics Data';
      renderInsights();
      showToast(useDemoInsights ? 'Displaying sample insights data.' : 'Displaying real review data.', 'info');
    });

    // Generic Modal Close Buttons
    document.querySelectorAll('.modal-close-btn, [data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close');
        if (modalId) closeModal(modalId);
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });
    });

    // Keyboard Accessibility: Close open modals on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(modal => {
          modal.classList.remove('open');
        });
      }
    });
  }

  /* ===================================================================
     11. App Initialization
     =================================================================== */
  function init() {
    // Populate form with current guidelines
    populateGuidelinesForm();

    // Check if onboarding was dismissed previously
    try {
      if (localStorage.getItem(STORAGE_KEYS.ONBOARDING_SEEN) === 'true') {
        DOM.onboardingBanner.style.display = 'none';
      }
    } catch (e) { /* ignore */ }

    // Initial table and metric render
    updateOverviewMetrics();
    renderHistoryTable();
    renderInsights();

    // Setup events
    setupEventListeners();

    console.log('BrandForge v2.0 MVP initialized successfully. Local deterministic rules engine ready.');
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
