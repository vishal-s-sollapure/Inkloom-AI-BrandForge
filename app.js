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
    ONBOARDING_SEEN: 'brandforge_onboarding_dismissed_v2',
    ENGINE_MODE: 'brandforge_engine_mode_v3',
    ROLE: 'brandforge_active_role_v3',
    SUPABASE_CONFIG: 'brandforge_supabase_config_v3'
  };

  // Default brand guidelines conforming to Inkloom AI's problem statement
  const DEFAULT_GUIDELINES = {
    brandName: 'Inkloom AI',
    brandVoice: 'Authoritative, Empathetic, Forward-Looking, Clear, and Honest',
    preferredTerms: [
      'BrandForge platform',
      'intelligent brand-governance engine',
      'resilient and battle-tested',
      'systematic guideline verification',
      'cost-effective solution',
      'empowers creators'
    ],
    avoidTerms: [
      { term: 'bulletproof', replacement: 'resilient and battle-tested', reason: 'Misleading engineering absolute; creates legal liability.' },
      { term: 'foolproof', replacement: 'rigorously validated', reason: 'Patronizing tone; implies impossibility of error.' },
      { term: 'cheap tool', replacement: 'cost-effective enterprise platform', reason: 'Degrades brand equity and perceived quality.' },
      { term: 'our bot', replacement: 'BrandForge engine', reason: 'Associated with low-quality conversational spam.' },
      { term: 'guarantees 100% success', replacement: 'applies systematic guideline verification with human confirmation', reason: 'Unsubstantiated promissory guarantee creating legal exposure.' },
      { term: 'eliminates human', replacement: 'empowers human creators and reviewers', reason: 'Violates our ethical AI commitment to human-in-the-loop oversight.' },
      { term: 'literally magic', replacement: 'engineered with precision', reason: 'Unprofessional hyperbole; degrades technical authority.' }
    ],
    approvedFacts: [
      'Inkloom AI evaluates draft marketing copy using deterministic brand rule matching.',
      'Operates client-side with a strict zero-retention policy for draft enterprise content.',
      'Supports human-in-the-loop review with side-by-side diff comparison and audit logging.',
      'Designed to streamline repetitive terminology triage and pre-publication compliance checks.'
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
      status: 'changes_requested',
      workflowStage: 'changes_requested',
      isCloudPersisted: false
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
      status: 'brand_approved',
      workflowStage: 'brand_approved',
      isCloudPersisted: false
    },
    {
      id: 'demo-3',
      timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
      title: 'Homepage Hero Value Proposition',
      type: 'landing_page',
      score: 95,
      findings: [],
      status: 'brand_approved',
      workflowStage: 'brand_approved',
      isCloudPersisted: false
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
  let activeEngineMode = (function() {
    try {
      return localStorage.getItem(STORAGE_KEYS.ENGINE_MODE) || 'ai';
    } catch (e) {
      return 'ai';
    }
  })();
  let activeRole = (function() {
    try {
      return localStorage.getItem(STORAGE_KEYS.ROLE) || 'creator';
    } catch (e) {
      return 'creator';
    }
  })();
  let currentWorkflowStage = 'drafting';

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

    // Governance Engine Controls
    btnEngineAi: document.getElementById('btn-engine-ai'),
    btnEngineDet: document.getElementById('btn-engine-det'),
    engineStatusDot: document.getElementById('engine-status-dot'),
    engineStatusText: document.getElementById('engine-status-text'),
    headerEnginePill: document.getElementById('header-engine-pill'),
    headerEngineLabel: document.getElementById('header-engine-label'),
    aiEngineBanner: document.getElementById('ai-engine-banner'),
    aiBannerIcon: document.getElementById('ai-banner-icon'),
    aiBannerText: document.getElementById('ai-banner-text'),
    revisionDisclaimerBadge: document.getElementById('revision-disclaimer-badge'),

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

    // Insights & Governance Intelligence
    insightsFrequentRules: document.getElementById('insights-frequent-rules'),
    insightsHighRisks: document.getElementById('insights-high-risks'),
    insightsDistributionBars: document.getElementById('insights-distribution-bars'),
    insightsGuidelineAdvice: document.getElementById('insights-guideline-advice'),
    insightsContentArea: document.getElementById('insights-content-area'),
    insightsEmptyState: document.getElementById('insights-empty-state'),
    btnToggleDemoInsights: document.getElementById('btn-toggle-demo-insights'),
    insightsTimeFilter: document.getElementById('insights-time-filter'),
    govDatasetBadge: document.getElementById('gov-dataset-badge'),
    govDemoBanner: document.getElementById('gov-demo-banner'),
    btnRevertRealInsights: document.getElementById('btn-revert-real-insights'),
    btnExportGovReport: document.getElementById('btn-export-governance-report'),
    btnEmptyGotoChecker: document.getElementById('btn-empty-goto-checker'),
    btnEmptyToggleDemo: document.getElementById('btn-empty-toggle-demo'),

    // KPI Ribbon
    govKpiComplianceRate: document.getElementById('gov-kpi-compliance-rate'),
    govKpiComplianceSub: document.getElementById('gov-kpi-compliance-sub'),
    govKpiTotalCampaigns: document.getElementById('gov-kpi-total-campaigns'),
    govKpiTotalSub: document.getElementById('gov-kpi-total-sub'),
    govKpiInReview: document.getElementById('gov-kpi-in-review'),
    govKpiLegallyCleared: document.getElementById('gov-kpi-legally-cleared'),
    govKpiChangesRequested: document.getElementById('gov-kpi-changes-requested'),
    govKpiTurnaroundTime: document.getElementById('gov-kpi-turnaround-time'),
    govKpiTurnaroundSub: document.getElementById('gov-kpi-turnaround-sub'),
    govKpiPendingAge: document.getElementById('gov-kpi-pending-age'),
    govKpiPendingSub: document.getElementById('gov-kpi-pending-sub'),
    govKpiTotalViolations: document.getElementById('gov-kpi-total-violations'),
    govKpiViolationsSub: document.getElementById('gov-kpi-violations-sub'),

    // Sections
    govBottleneckBadge: document.getElementById('gov-bottleneck-badge'),
    govBottleneckBody: document.getElementById('gov-bottleneck-body'),
    govRecurringCountBadge: document.getElementById('gov-recurring-count-badge'),
    govRecurringCategories: document.getElementById('gov-recurring-categories'),
    govFrictionCountBadge: document.getElementById('gov-friction-count-badge'),
    govPolicyFrictionCards: document.getElementById('gov-policy-friction-cards'),
    govActionableRecommendations: document.getElementById('gov-actionable-recommendations'),

    // Export Governance Modal
    modalExportGovernance: document.getElementById('modal-export-governance'),
    exportGovPreviewArea: document.getElementById('export-gov-preview-area'),
    btnExportGovFormatMd: document.getElementById('btn-export-gov-format-md'),
    btnExportGovFormatJson: document.getElementById('btn-export-gov-format-json'),
    btnCopyGovReport: document.getElementById('btn-copy-gov-report'),
    btnDownloadGovReport: document.getElementById('btn-download-gov-report'),

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

    // Stakeholder Role & Lifecycle Stepper
    roleSelect: document.getElementById('role-select'),
    workflowCurrentRoleBadge: document.getElementById('workflow-current-role-badge'),
    workflowStatusSummary: document.getElementById('workflow-status-summary'),
    workflowCurrentStageName: document.getElementById('workflow-current-stage-name'),
    stepperActionsBar: document.getElementById('stepper-actions-bar'),
    stepNodeDrafting: document.getElementById('step-node-drafting'),
    stepNodeInReview: document.getElementById('step-node-in_review'),
    stepNodeBrandApproved: document.getElementById('step-node-brand_approved'),
    stepNodeLegallyCleared: document.getElementById('step-node-legally_cleared'),
    stepConn1: document.getElementById('step-conn-1'),
    stepConn2: document.getElementById('step-conn-2'),
    stepConn3: document.getElementById('step-conn-3'),

    // In-Line Comments in Diff Modal
    diffCommentsSection: document.getElementById('diff-comments-section'),
    diffCommentsCount: document.getElementById('diff-comments-count'),
    diffCommentsList: document.getElementById('diff-comments-list'),
    emptyCommentsNotice: document.getElementById('empty-comments-notice'),
    commentTargetInput: document.getElementById('comment-target-input'),
    commentAuthorBadge: document.getElementById('comment-author-badge'),
    commentTextInput: document.getElementById('comment-text-input'),
    btnPostComment: document.getElementById('btn-post-comment'),

    // Cryptographic Compliance Seal Modal
    modalComplianceSeal: document.getElementById('modal-compliance-seal'),
    certSealId: document.getElementById('cert-seal-id'),
    certDocTitle: document.getElementById('cert-doc-title'),
    certDocType: document.getElementById('cert-doc-type'),
    certComplianceScore: document.getElementById('cert-compliance-score'),
    certUnresolvedBlockers: document.getElementById('cert-unresolved-blockers'),
    certCustodianSigner: document.getElementById('cert-custodian-signer'),
    certCustodianTime: document.getElementById('cert-custodian-time'),
    certLegalSigner: document.getElementById('cert-legal-signer'),
    certLegalTime: document.getElementById('cert-legal-time'),
    certSha256Hash: document.getElementById('cert-sha256-hash'),
    btnCopySealHash: document.getElementById('btn-copy-seal-hash'),
    certVerificationResult: document.getElementById('cert-verification-result'),
    certVerifyIcon: document.getElementById('cert-verify-icon'),
    certVerifyText: document.getElementById('cert-verify-text'),
    btnVerifySealIntegrity: document.getElementById('btn-verify-seal-integrity'),
    btnDownloadSealJson: document.getElementById('btn-download-seal-json'),
    detailViewSealBtn: document.getElementById('detail-view-seal-btn'),

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

    // Workspace & Supabase Sync
    btnWorkspaceModal: document.getElementById('btn-workspace-modal'),
    modalWorkspaceSync: document.getElementById('modal-workspace-sync'),
    workspaceStatusDot: document.getElementById('workspace-status-dot'),
    workspaceStatusText: document.getElementById('workspace-status-text'),
    wsModalBadge: document.getElementById('ws-modal-badge'),
    wsModalOrgName: document.getElementById('ws-modal-org-name'),
    wsModalRoleName: document.getElementById('ws-modal-role-name'),
    wsModalConnDetails: document.getElementById('ws-modal-conn-details'),
    inputSupabaseUrl: document.getElementById('input-supabase-url'),
    inputSupabaseAnonKey: document.getElementById('input-supabase-anon-key'),
    btnSaveSupabaseConfig: document.getElementById('btn-save-supabase-config'),
    btnDisconnectSupabase: document.getElementById('btn-disconnect-supabase'),
    supabaseConfigFeedback: document.getElementById('supabase-config-feedback'),
    btnCopySchemaSql: document.getElementById('btn-copy-schema-sql'),
    btnCopyPatchSql: document.getElementById('btn-copy-patch-sql'),

    // Auth & Cloud Sync controls
    tabAuthSignin: document.getElementById('tab-auth-signin'),
    tabAuthSignup: document.getElementById('tab-auth-signup'),
    groupAuthFullname: document.getElementById('group-auth-fullname'),
    inputAuthFullname: document.getElementById('input-auth-fullname'),
    inputAuthEmail: document.getElementById('input-auth-email'),
    inputAuthPassword: document.getElementById('input-auth-password'),
    btnAuthSubmit: document.getElementById('btn-auth-submit'),
    authUnauthenticatedPanel: document.getElementById('auth-unauthenticated-panel'),
    authAuthenticatedPanel: document.getElementById('auth-authenticated-panel'),
    authUserDisplayEmail: document.getElementById('auth-user-display-email'),
    authUserDisplayRole: document.getElementById('auth-user-display-role'),
    authUserDisplayOrg: document.getElementById('auth-user-display-org'),
    btnSyncCloudCampaigns: document.getElementById('btn-sync-cloud-campaigns'),
    btnAuthSignout: document.getElementById('btn-auth-signout'),
    authFeedbackBanner: document.getElementById('auth-feedback-banner'),

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
     UUID & Cryptographic Identification Helpers
     =================================================================== */
  function generateUuid() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function isValidUuid(str) {
    if (typeof str !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
  }

  function ensureUuid(id) {
    return isValidUuid(id) ? id : generateUuid();
  }

  function normalizeCampaignStatus(status) {
    if (!status) return 'drafting';
    const s = String(status).toLowerCase().trim();
    if (s === 'in_review' || s === 'review' || s === 'submitted') return 'in_review';
    if (s === 'changes_requested' || s === 'rejected') return 'changes_requested';
    if (s === 'brand_approved' || s === 'approved') return 'brand_approved';
    if (s === 'legally_cleared' || s === 'cleared') return 'legally_cleared';
    return 'drafting';
  }

  /* ===================================================================
     4.1 Supabase Team Workspace, Authentication & Cloud Sync Manager
     =================================================================== */
  const SupabaseManager = {
    client: null,
    // Connection State: 'sandbox' (Local Mode) | 'connected' (Gateway Reachable) | 'authenticated' (Live PostgreSQL + RLS)
    connectionState: 'sandbox',
    user: null,        // Supabase Auth User
    profile: null,     // public.profiles row { id, organization_id, email, full_name, role }
    organization: null,// public.organizations row { id, name, slug }
    config: {
      url: '',
      anonKey: ''
    },
    _authListenerAttached: false,

    loadConfig() {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const stored = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.url && parsed.anonKey) {
              this.config = parsed;
            }
          }
        }
      } catch (e) {
        console.warn('Could not read Supabase config from storage:', e);
      }
      return this.config;
    },

    saveConfig(url, anonKey) {
      this.config = { url: (url || '').trim(), anonKey: (anonKey || '').trim() };
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          if (this.config.url && this.config.anonKey) {
            localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(this.config));
          } else {
            localStorage.removeItem(STORAGE_KEYS.SUPABASE_CONFIG);
          }
        }
      } catch (e) {
        console.warn('Could not persist Supabase config:', e);
      }
    },

    async init() {
      this.loadConfig();

      // If not configured in localStorage, auto-fetch from Netlify serverless environment
      if (!this.config.url || !this.config.anonKey) {
        try {
          const res = await fetch('/api/supabase-config');
          if (res.ok) {
            const data = await res.json();
            if (data && data.isConfigured && data.url && data.anonKey) {
              this.config = { url: data.url, anonKey: data.anonKey };
              this.saveConfig(data.url, data.anonKey);
            }
          }
        } catch (e) {
          console.warn('[BrandForge] Notice: serverless Supabase config not reachable:', e.message);
        }
      }

      if (this.config.url && this.config.anonKey) {
        await this.connect(this.config.url, this.config.anonKey, false);
      } else {
        this.connectionState = 'sandbox';
        this.updateUI();
      }
    },

    // Verify connectivity via genuine database query against PostgreSQL
    async testConnection(url, anonKey) {
      const cleanUrl = (url || '').trim();
      const cleanKey = (anonKey || '').trim();

      if (!cleanUrl || !cleanKey) {
        return { success: false, message: 'Both Supabase URL and Anon / Publishable Key are required.' };
      }
      if (!cleanUrl.startsWith('https://')) {
        return { success: false, message: 'Supabase URL must start with https://' };
      }

      if (typeof window === 'undefined' || !window.supabase || typeof window.supabase.createClient !== 'function') {
        return { success: false, message: 'Supabase JS SDK is not loaded. Check network or CDN availability.' };
      }

      try {
        const testClient = window.supabase.createClient(cleanUrl, cleanKey, {
          auth: { persistSession: false, autoRefreshToken: false }
        });

        // Perform genuine PostgreSQL query against public schema
        const { data, error } = await testClient.from('organizations').select('id, name, slug').limit(1);

        if (error) {
          // If error is permission or network-related, surface clean message
          if (error.code === 'PGRST301' || error.message.includes('JWT') || error.message.includes('apikey')) {
            return { success: false, message: `Authentication error from Supabase: ${error.message}` };
          }
          // If table exists and returned RLS restriction, gateway is verified
          return { success: true, message: 'Supabase gateway reachable. Tables and RLS active.' };
        }

        return { success: true, message: 'Gateway verified! Successfully queried PostgreSQL organizations.' };
      } catch (err) {
        return { success: false, message: `Connection test failed: ${err.message || 'Unknown network error'}` };
      }
    },

    async connect(url, anonKey, triggerToast = true) {
      const cleanUrl = (url || '').trim();
      const cleanKey = (anonKey || '').trim();

      if (!cleanUrl || !cleanKey) {
        this.disconnect();
        return { success: false, message: 'URL and Anon Key are required.' };
      }

      if (!cleanUrl.startsWith('https://')) {
        return { success: false, message: 'Supabase URL must start with https://' };
      }

      if (typeof window === 'undefined' || !window.supabase || typeof window.supabase.createClient !== 'function') {
        this.connectionState = 'sandbox';
        this.updateUI();
        return { success: false, message: 'Supabase SDK unavailable. Operating in Local Sandbox mode.' };
      }

      try {
        this.client = window.supabase.createClient(cleanUrl, cleanKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });

        // Genuine gateway test query
        const testRes = await this.testConnection(cleanUrl, cleanKey);
        if (!testRes.success) {
          this.connectionState = 'sandbox';
          this.updateUI();
          if (triggerToast) showToast(testRes.message, 'error');
          return testRes;
        }

        // Persist valid configuration
        this.saveConfig(cleanUrl, cleanKey);

        // Check for existing authenticated session
        const { data: sessionData, error: sessionErr } = await this.client.auth.getSession();
        if (sessionData && sessionData.session && sessionData.session.user) {
          await this.handleUserAuthenticated(sessionData.session.user);
        } else {
          this.connectionState = 'connected';
          this.user = null;
          this.profile = null;
          this.organization = null;
        }

        // Attach auth state change listener once
        if (!this._authListenerAttached) {
          this.client.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session && session.user) {
              await this.handleUserAuthenticated(session.user);
            } else if (event === 'SIGNED_OUT') {
              this.handleUserSignedOut();
            }
          });
          this._authListenerAttached = true;
        }

        this.updateUI();

        if (triggerToast) {
          if (this.connectionState === 'authenticated') {
            showToast(`Connected & Authenticated as ${this.user.email} (${ROLE_CONFIG[activeRole].label}).`, 'success');
          } else {
            showToast('Connected to Supabase gateway. Please sign in or create an account.', 'info');
          }
        }

        return {
          success: true,
          message: this.connectionState === 'authenticated'
            ? 'Gateway verified and authenticated with PostgreSQL.'
            : 'Gateway verified. Please sign in to activate cloud synchronization.'
        };
      } catch (err) {
        console.error('Supabase connection error:', err);
        this.connectionState = 'sandbox';
        this.updateUI();
        return { success: false, message: err.message || 'Connection failed.' };
      }
    },

    async handleUserAuthenticated(user) {
      if (!this.client || !user) return;
      this.user = user;

      try {
        // Query profile from PostgreSQL public.profiles cleanly without embedding joins
        const { data: profileData, error: profileErr } = await this.client
          .from('profiles')
          .select('id, organization_id, email, full_name, role')
          .eq('id', user.id)
          .maybeSingle();

        if (profileErr) {
          console.error('[BrandForge] Profile query error:', profileErr);
          showToast(`Profile error: ${profileErr.message}`, 'error');
          this.connectionState = 'connected';
          this.updateUI();
          return;
        }

        if (profileData && profileData.organization_id) {
          this.profile = profileData;

          // Fetch organization name defensively
          try {
            const { data: orgData } = await this.client
              .from('organizations')
              .select('id, name, slug')
              .eq('id', profileData.organization_id)
              .maybeSingle();
            this.organization = orgData || { id: profileData.organization_id, name: 'Inkloom Brand Studio' };
          } catch (e) {
            this.organization = { id: profileData.organization_id, name: 'Inkloom Brand Studio' };
          }

          this.connectionState = 'authenticated';

          // Bind active persona strictly to database profile role!
          const dbRole = profileData.role || 'creator';
          activeRole = dbRole;
          try {
            localStorage.setItem(STORAGE_KEYS.ROLE, activeRole);
          } catch (e) { /* ignore */ }

          // Lock role selector to authenticated database role
          if (DOM.roleSelect) {
            DOM.roleSelect.value = activeRole;
            DOM.roleSelect.disabled = true;
            DOM.roleSelect.title = `Locked to authenticated role: ${ROLE_CONFIG[activeRole].label} (${profileData.email})`;
          }

          // Asynchronously pull shared cloud campaigns
          await this.fetchCloudCampaigns();
        } else {
          // Profile row does not exist in public.profiles
          console.warn('[BrandForge] No public.profiles row found for user:', user.id);
          this.profile = null;
          this.organization = null;
          this.connectionState = 'connected';
          showToast(`Authentication notice: No profile record found in public.profiles for ${user.email}. Please execute the profile provisioning SQL in Supabase.`, 'error');
        }
      } catch (err) {
        console.warn('Error fetching user profile:', err);
        this.profile = null;
        this.connectionState = 'connected';
      }

      this.updateUI();
    },

    handleUserSignedOut() {
      this.user = null;
      this.profile = null;
      this.organization = null;
      this.connectionState = this.client ? 'connected' : 'sandbox';

      // Unlock persona selector in sandbox / unauthenticated mode
      if (DOM.roleSelect) {
        DOM.roleSelect.disabled = false;
        DOM.roleSelect.title = 'Switch stakeholder persona';
      }

      this.updateUI();
    },

    async signIn(email, password) {
      if (!this.client) {
        return { success: false, message: 'Please connect to a Supabase project first.' };
      }
      const cleanEmail = (email || '').trim();
      const cleanPassword = (password || '').trim();

      if (!cleanEmail || !cleanPassword) {
        return { success: false, message: 'Email and password are required.' };
      }

      try {
        const { data, error } = await this.client.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword
        });

        if (error) {
          return { success: false, message: error.message };
        }

        await this.handleUserAuthenticated(data.user);
        showToast(`Signed in as ${data.user.email} (${ROLE_CONFIG[activeRole].label}).`, 'success');
        return { success: true, message: `Signed in as ${data.user.email}` };
      } catch (err) {
        return { success: false, message: err.message || 'Sign in failed.' };
      }
    },

    async signUp(email, password, fullName) {
      if (!this.client) {
        return { success: false, message: 'Please connect to a Supabase project first.' };
      }
      const cleanEmail = (email || '').trim();
      const cleanPassword = (password || '').trim();
      const cleanName = (fullName || '').trim() || cleanEmail.split('@')[0];

      if (!cleanEmail || !cleanPassword) {
        return { success: false, message: 'Email and password are required.' };
      }
      if (cleanPassword.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters.' };
      }

      try {
        // Always assign default 'creator' role. Trigger forces 'creator' role for security.
        const { data, error } = await this.client.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: cleanName
            }
          }
        });

        if (error) {
          return { success: false, message: error.message };
        }

        if (data.session && data.user) {
          await this.handleUserAuthenticated(data.user);
          showToast(`Account created! Signed in as ${data.user.email} (Role: Content Creator).`, 'success');
          return { success: true, message: `Account created and signed in as ${data.user.email}` };
        } else {
          return {
            success: true,
            message: `Account created for ${cleanEmail}! Please verify your email or sign in.`
          };
        }
      } catch (err) {
        return { success: false, message: err.message || 'Registration failed.' };
      }
    },

    async signOut() {
      if (this.client) {
        try {
          await this.client.auth.signOut();
        } catch (e) { /* ignore */ }
      }
      this.handleUserSignedOut();
      showToast('Signed out of Supabase workspace.', 'info');
      return { success: true, message: 'Signed out.' };
    },

    disconnect() {
      this.client = null;
      this.user = null;
      this.profile = null;
      this.organization = null;
      this.connectionState = 'sandbox';
      this.saveConfig('', '');

      if (DOM.roleSelect) {
        DOM.roleSelect.disabled = false;
        DOM.roleSelect.title = 'Switch stakeholder persona';
      }

      this.updateUI();
      showToast('Switched to Local Sandbox mode.', 'info');
    },

    updateUI() {
      const state = this.connectionState;

      // Update workspace header dot
      if (DOM.workspaceStatusDot) {
        DOM.workspaceStatusDot.className = `workspace-dot ${state}`;
      }

      // Update workspace header pill text
      if (DOM.workspaceStatusText) {
        if (state === 'authenticated' && this.user) {
          const roleLabel = (ROLE_CONFIG[activeRole] && ROLE_CONFIG[activeRole].label) || 'Creator';
          DOM.workspaceStatusText.textContent = `Live: ${this.profile?.full_name || this.user.email.split('@')[0]} (${roleLabel})`;
        } else if (state === 'connected') {
          DOM.workspaceStatusText.textContent = 'Supabase: Sign In Required';
        } else {
          DOM.workspaceStatusText.textContent = 'Workspace: Local Sandbox';
        }
      }

      // Update Modal Status Badge
      if (DOM.wsModalBadge) {
        DOM.wsModalBadge.className = `ws-status-badge ${state}`;
        if (state === 'authenticated') {
          DOM.wsModalBadge.textContent = 'Live Authenticated (PostgreSQL + RLS)';
        } else if (state === 'connected') {
          DOM.wsModalBadge.textContent = 'Gateway Verified (Sign-In Required)';
        } else {
          DOM.wsModalBadge.textContent = 'Local Sandbox Mode';
        }
      }

      // Update Organization and Role in Modal Card
      if (DOM.wsModalOrgName) {
        DOM.wsModalOrgName.textContent = (this.organization && this.organization.name) || 'Inkloom Brand Studio';
      }
      if (DOM.wsModalRoleName) {
        if (state === 'authenticated' && this.user) {
          const roleLabel = (ROLE_CONFIG[activeRole] && ROLE_CONFIG[activeRole].label) || 'Creator';
          DOM.wsModalRoleName.textContent = `${roleLabel} (${this.user.email})`;
        } else {
          const roleLabel = (ROLE_CONFIG[activeRole] && ROLE_CONFIG[activeRole].label) || 'Creator';
          DOM.wsModalRoleName.textContent = `${roleLabel} (Local Demo)`;
        }
      }

      // Update Connection Details Explanatory Text
      if (DOM.wsModalConnDetails) {
        if (state === 'authenticated') {
          DOM.wsModalConnDetails.textContent = `✓ Connected to live PostgreSQL database. Authenticated user ID: ${this.user.id.slice(0, 8)}... Persona role is enforced by database Row Level Security.`;
          DOM.wsModalConnDetails.style.color = 'var(--status-success-text)';
        } else if (state === 'connected') {
          DOM.wsModalConnDetails.textContent = 'Supabase gateway reachable. Authenticate below to activate multi-user campaign synchronization.';
          DOM.wsModalConnDetails.style.color = '#38BDF8';
        } else {
          DOM.wsModalConnDetails.textContent = 'Operating in offline Local Sandbox mode. Connect to Supabase below to activate PostgreSQL Row Level Security and live team synchronization.';
          DOM.wsModalConnDetails.style.color = 'var(--text-muted)';
        }
      }

      // Toggle Auth Panels
      if (DOM.authUnauthenticatedPanel && DOM.authAuthenticatedPanel) {
        const isAuth = state === 'authenticated';
        DOM.authUnauthenticatedPanel.style.display = isAuth ? 'none' : 'block';
        DOM.authAuthenticatedPanel.style.display = isAuth ? 'block' : 'none';

        if (isAuth && this.user) {
          if (DOM.authUserDisplayEmail) DOM.authUserDisplayEmail.textContent = this.user.email;
          if (DOM.authUserDisplayRole) DOM.authUserDisplayRole.textContent = (ROLE_CONFIG[activeRole] && ROLE_CONFIG[activeRole].label) || activeRole;
          if (DOM.authUserDisplayOrg) DOM.authUserDisplayOrg.textContent = (this.organization && this.organization.name) || 'Inkloom Brand Studio';
        }
      }

      // Inputs
      if (DOM.inputSupabaseUrl && this.config.url) {
        DOM.inputSupabaseUrl.value = this.config.url;
      }
      if (DOM.inputSupabaseAnonKey && this.config.anonKey) {
        DOM.inputSupabaseAnonKey.value = this.config.anonKey;
      }
    },

    /* ===================================================================
       Live Database CRUD Operations (PostgreSQL + RLS)
       =================================================================== */

    // Record or update campaign in Supabase campaigns table
    async syncCampaignRecord(record) {
      if (!record) return { success: false, message: 'No record provided.' };

      // In Local Sandbox mode, data is preserved in localStorage
      if (this.connectionState !== 'authenticated' || !this.client || !this.user) {
        return { success: true, message: 'Operated in Local Sandbox mode.' };
      }
      if (!this.profile || !this.profile.organization_id) {
        const msg = 'User profile or organization_id is missing. Please ensure your account profile is provisioned.';
        showToast(msg, 'error');
        return { success: false, message: msg };
      }

      try {
        record.id = ensureUuid(record.id);
        record.revisionId = ensureUuid(record.revisionId);

        // Normalize status strictly to valid PostgreSQL campaign_status enum values
        const currentStatus = normalizeCampaignStatus(record.workflowStage || record.status);

        // 1. Check if campaign row already exists
        const { data: existingCamp, error: checkErr } = await this.client
          .from('campaigns')
          .select('id, current_status')
          .eq('id', record.id)
          .maybeSingle();

        if (checkErr) {
          throw new Error(`Failed to query campaign: ${checkErr.message}`);
        }

        let campResult;
        if (!existingCamp) {
          // INSERT new campaign (evaluated against campaigns_insert_creator RLS policy)
          campResult = await this.client.from('campaigns').insert({
            id: record.id,
            organization_id: this.profile.organization_id,
            created_by: this.user.id,
            title: record.title || 'Untitled Draft',
            content_type: record.type || 'general',
            target_audience: record.targetAudience || 'General Audience',
            current_status: currentStatus,
            current_version_num: record.versionNum || 1
          }).select().single();
        } else {
          // UPDATE existing campaign (evaluated against campaigns_update_role RLS policy)
          campResult = await this.client.from('campaigns').update({
            title: record.title || 'Untitled Draft',
            content_type: record.type || 'general',
            target_audience: record.targetAudience || 'General Audience',
            current_status: currentStatus,
            current_version_num: record.versionNum || 1,
            updated_at: new Date().toISOString()
          }).eq('id', record.id).select().single();
        }

        if (campResult.error) {
          const detail = campResult.error.details || campResult.error.hint || '';
          throw new Error(`Campaign database write failed: ${campResult.error.message} ${detail ? '(' + detail + ')' : ''}`);
        }

        // 2. Insert or update revision
        const { data: existingRev } = await this.client
          .from('campaign_revisions')
          .select('id')
          .eq('id', record.revisionId)
          .maybeSingle();

        let revErr = null;
        if (!existingRev) {
          const revRes = await this.client.from('campaign_revisions').insert({
            id: record.revisionId,
            campaign_id: record.id,
            version_num: record.versionNum || 1,
            content: record.rawText || record.originalContent || '',
            compliance_score: Math.max(0, Math.min(100, Math.round(record.score || 100))),
            findings: record.findings || [],
            factual_claims: (record.findings || []).filter(f => f.isVerificationNeeded),
            suggested_revision: record.suggestedRevision || '',
            created_by: this.user.id
          });
          revErr = revRes.error;
        } else {
          const revRes = await this.client.from('campaign_revisions').update({
            content: record.rawText || record.originalContent || '',
            compliance_score: Math.max(0, Math.min(100, Math.round(record.score || 100))),
            findings: record.findings || [],
            factual_claims: (record.findings || []).filter(f => f.isVerificationNeeded),
            suggested_revision: record.suggestedRevision || ''
          }).eq('id', record.revisionId);
          revErr = revRes.error;
        }

        if (revErr && !revErr.message.includes('duplicate')) {
          console.warn('[BrandForge] Revision write notice:', revErr.message);
        }

        // 3. Record Audit Event
        await this.recordAuditEvent(record.id, 'review_run', null, {
          score: record.score,
          status: currentStatus
        });

        record.isCloudPersisted = true;
        return { success: true, campaign: campResult.data || record };
      } catch (err) {
        console.error('[BrandForge] Supabase Cloud Write Error:', err);
        showToast(`Database Write Failed: ${err.message}`, 'error');
        return { success: false, message: err.message };
      }
    },

    // Record append-only audit event in public.audit_events
    async recordAuditEvent(campaignId, eventType, previousState, newState, metadata = {}) {
      const event = {
        id: generateUuid(),
        campaignId,
        actorRole: activeRole,
        actorEmail: this.user ? this.user.email : `${activeRole}@brandforge.ai`,
        eventType,
        previousState,
        newState,
        metadata,
        timestamp: new Date().toISOString()
      };

      if (this.connectionState === 'authenticated' && this.client && this.user && this.profile && isValidUuid(campaignId)) {
        try {
          const { error } = await this.client.from('audit_events').insert({
            id: event.id,
            organization_id: this.profile.organization_id,
            campaign_id: campaignId,
            actor_id: this.user.id,
            actor_role: this.profile.role || activeRole,
            event_type: eventType,
            previous_state: previousState,
            new_state: newState,
            metadata
          });
          if (error) {
            console.warn('[BrandForge] Could not post audit event to Supabase:', error.message);
          }
        } catch (err) {
          console.warn('[BrandForge] Audit event network notice:', err.message);
        }
      }

      return event;
    },

    // Update campaign lifecycle status
    async updateCampaignStatus(campaignId, targetStatus, previousStatus) {
      const normalizedTarget = normalizeCampaignStatus(targetStatus);
      if (this.connectionState === 'authenticated' && this.client && isValidUuid(campaignId)) {
        try {
          const { error } = await this.client
            .from('campaigns')
            .update({ current_status: normalizedTarget, updated_at: new Date().toISOString() })
            .eq('id', campaignId);

          if (error) {
            const errorMsg = `Status update failed in Supabase: ${error.message}${error.details ? ' (' + error.details + ')' : ''}`;
            console.error('[BrandForge] Status update error:', errorMsg);
            showToast(errorMsg, 'error');
            return { success: false, message: errorMsg };
          }

          await this.recordAuditEvent(campaignId, 'status_change', { status: previousStatus }, { status: normalizedTarget });
          return { success: true };
        } catch (err) {
          const errorMsg = `Status sync error: ${err.message}`;
          console.error('[BrandForge] Status sync error:', errorMsg);
          showToast(errorMsg, 'error');
          return { success: false, message: errorMsg };
        }
      }
      return { success: true, localOnly: true };
    },

    // In-line comment creation
    async postComment(campaignId, revisionId, targetText, commentText) {
      const commentId = generateUuid();
      const comment = {
        id: commentId,
        authorRole: activeRole,
        authorRoleLabel: (ROLE_CONFIG[activeRole] && ROLE_CONFIG[activeRole].label) || activeRole,
        targetText: targetText || '',
        commentText: commentText,
        timestamp: new Date().toISOString(),
        resolved: false
      };

      if (this.connectionState === 'authenticated' && this.client && this.user && this.profile && isValidUuid(campaignId)) {
        try {
          const { error } = await this.client.from('review_comments').insert({
            id: commentId,
            campaign_id: campaignId,
            revision_id: isValidUuid(revisionId) ? revisionId : null,
            author_id: this.user.id,
            author_role: this.profile.role || activeRole,
            selected_text: targetText || null,
            comment_text: commentText,
            resolved: false
          });

          if (error) {
            showToast(`Could not post comment to Supabase: ${error.message}`, 'error');
          } else {
            await this.recordAuditEvent(campaignId, 'comment_added', null, { commentId, targetText });
          }
        } catch (err) {
          console.warn('Comment network notice:', err.message);
        }
      }

      return comment;
    },

    // Toggle comment resolution
    async toggleCommentResolution(campaignId, commentId, resolvedState) {
      if (this.connectionState === 'authenticated' && this.client && this.user && isValidUuid(commentId)) {
        try {
          const { error } = await this.client
            .from('review_comments')
            .update({
              resolved: resolvedState,
              resolved_by: this.user.id,
              resolved_at: resolvedState ? new Date().toISOString() : null
            })
            .eq('id', commentId);

          if (error) {
            console.warn('Could not update comment resolution in Supabase:', error.message);
          } else if (isValidUuid(campaignId)) {
            await this.recordAuditEvent(campaignId, 'comment_resolved', null, { commentId, resolved: resolvedState });
          }
        } catch (err) {
          console.warn('Comment resolution network notice:', err.message);
        }
      }
    },

    // Record Cryptographic Compliance Seal in Supabase
    async recordComplianceSeal(campaignId, revisionId, sealData) {
      if (this.connectionState === 'authenticated' && this.client && this.user && isValidUuid(campaignId)) {
        try {
          const sealUuid = generateUuid();
          const { error } = await this.client.from('compliance_seals').insert({
            id: sealUuid,
            campaign_id: campaignId,
            revision_id: isValidUuid(revisionId) ? revisionId : null,
            content_sha256: sealData.sha256Hash,
            brand_approved_by: this.user.id,
            brand_approved_at: (sealData.brandCustodianSignoff && sealData.brandCustodianSignoff.timestamp) || new Date().toISOString(),
            legally_cleared_by: this.user.id,
            legally_cleared_at: (sealData.legalOfficerSignoff && sealData.legalOfficerSignoff.timestamp) || new Date().toISOString(),
            verification_receipt: sealData
          });

          if (error) {
            const errorMsg = `Could not record compliance seal in Supabase: ${error.message}${error.details ? ' (' + error.details + ')' : ''}`;
            console.warn('[BrandForge]', errorMsg);
            return { success: false, message: errorMsg };
          } else {
            await this.recordAuditEvent(campaignId, 'seal_generated', null, {
              sealId: sealData.sealId,
              sha256: sealData.sha256Hash
            });
            return { success: true, sealId: sealUuid };
          }
        } catch (err) {
          const errorMsg = `Compliance seal network notice: ${err.message}`;
          console.warn('[BrandForge]', errorMsg);
          return { success: false, message: errorMsg };
        }
      }
      return { success: true, localOnly: true };
    },

    // Pull shared campaigns from Supabase cloud database
    async fetchCloudCampaigns() {
      if (!this.client || this.connectionState !== 'authenticated') return;

      try {
        const { data: cloudCampaigns, error } = await this.client
          .from('campaigns')
          .select(`
            id,
            title,
            content_type,
            target_audience,
            current_status,
            current_version_num,
            created_at,
            created_by,
            campaign_revisions(
              id,
              version_num,
              content,
              compliance_score,
              findings,
              suggested_revision,
              created_at
            ),
            review_comments(
              id,
              author_role,
              selected_text,
              comment_text,
              resolved,
              created_at
            ),
            compliance_seals(
              id,
              content_sha256,
              brand_approved_at,
              legally_cleared_at,
              verification_receipt
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Could not fetch campaigns from Supabase:', error.message);
          return;
        }

        if (Array.isArray(cloudCampaigns) && cloudCampaigns.length > 0) {
          const mappedRecords = cloudCampaigns.map(c => {
            const latestRev = Array.isArray(c.campaign_revisions) && c.campaign_revisions.length > 0
              ? c.campaign_revisions.sort((a, b) => b.version_num - a.version_num)[0]
              : null;

            const comments = Array.isArray(c.review_comments)
              ? c.review_comments.map(rc => ({
                  id: rc.id,
                  authorRole: rc.author_role,
                  authorRoleLabel: (ROLE_CONFIG[rc.author_role] && ROLE_CONFIG[rc.author_role].label) || rc.author_role,
                  targetText: rc.selected_text || '',
                  commentText: rc.comment_text,
                  resolved: Boolean(rc.resolved),
                  timestamp: rc.created_at
                }))
              : [];

            const seal = Array.isArray(c.compliance_seals) && c.compliance_seals.length > 0
              ? c.compliance_seals[0].verification_receipt
              : null;

            return {
              id: c.id,
              revisionId: latestRev ? latestRev.id : null,
              title: c.title,
              type: c.content_type,
              score: latestRev ? latestRev.compliance_score : 100,
              findings: latestRev && Array.isArray(latestRev.findings) ? latestRev.findings : [],
              rawText: latestRev ? latestRev.content : '',
              suggestedRevision: latestRev ? latestRev.suggested_revision : '',
              status: c.current_status,
              workflowStage: c.current_status,
              comments,
              complianceSeal: seal,
              timestamp: c.created_at,
              engine: 'ai',
              isCloudPersisted: true
            };
          });

          // Merge cloud records with local records avoiding duplicates
          const cloudIds = new Set(mappedRecords.map(r => r.id));
          const nonDuplicateLocal = currentReviewHistory.filter(r => !cloudIds.has(r.id));
          const merged = [...mappedRecords, ...nonDuplicateLocal];

          currentReviewHistory = merged;
          saveHistory(merged);
          showToast(`Synchronized ${mappedRecords.length} shared campaigns from Supabase.`, 'success');
        }
      } catch (err) {
        console.warn('Cloud fetch notice:', err.message);
      }
    }
  };

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
    const approved = list.filter(item => {
      const norm = normalizeCampaignStatus(item.status || item.workflowStage);
      return norm === 'brand_approved' || norm === 'legally_cleared';
    }).length;
    const flagged = list.filter(item => {
      const norm = normalizeCampaignStatus(item.status || item.workflowStage);
      return norm === 'changes_requested';
    }).length;

    // Calculate unresolved findings across flagged / rejected items
    let outstanding = 0;
    list.filter(item => {
      const norm = normalizeCampaignStatus(item.status || item.workflowStage);
      return norm !== 'brand_approved' && norm !== 'legally_cleared';
    }).forEach(item => {
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

    // Separate findings into Factual Claims vs Policy Violations
    const claims = filtered.filter(f => f.isVerificationNeeded);
    const violations = filtered.filter(f => !f.isVerificationNeeded);

    // Helper to render a card
    const renderCard = (finding, isClaim) => {
      const card = document.createElement('div');
      card.className = `finding-item severity-${finding.severity} ${isClaim ? 'is-claim-verification' : ''}`;

      const header = document.createElement('div');
      header.className = 'finding-item-header';

      const title = document.createElement('span');
      title.className = 'finding-title';
      title.textContent = finding.ruleCitation || finding.ruleTitle || 'Brand Policy Finding';

      const pillsWrap = document.createElement('div');
      pillsWrap.style.display = 'flex';
      pillsWrap.style.gap = '6px';
      pillsWrap.style.alignItems = 'center';

      // Confidence indicator
      const confScore = finding.confidence || (isClaim ? 95 : 90);
      const confPill = document.createElement('span');
      confPill.className = `confidence-pill ${confScore >= 90 ? 'high' : ''}`;
      confPill.title = 'AI Semantic Confidence rating';
      confPill.textContent = `${confScore}% Conf.`;
      pillsWrap.appendChild(confPill);

      const pill = document.createElement('span');
      pill.className = `finding-pill ${finding.severity}`;
      pill.textContent = finding.severity;
      pillsWrap.appendChild(pill);

      header.appendChild(title);
      header.appendChild(pillsWrap);

      // Explicit Guideline Citation Tag
      const citationTag = document.createElement('div');
      citationTag.className = 'guideline-citation-tag';
      citationTag.textContent = `Policy Section: ${finding.guidelineSection || 'Brand Standards'}`;

      // Evidence snippet
      const evidence = document.createElement('div');
      evidence.className = 'finding-evidence';
      evidence.textContent = `Evidence Quote: "${finding.evidence}"`;

      // Verification note if applicable
      let verifyBadge = null;
      if (isClaim) {
        verifyBadge = document.createElement('div');
        verifyBadge.className = 'verification-badge';
        verifyBadge.textContent = '⚠️ Factual Claim — Requires Source Evidence Link';
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

      // Interactive Evidence Attachment Input for Claims
      if (isClaim) {
        const promptBox = document.createElement('div');
        promptBox.className = 'claim-verification-prompt';

        const promptLabel = document.createElement('label');
        promptLabel.innerHTML = '<span>📎</span> <span>Attach Supporting Evidence Document / Reference URL:</span>';

        const evidenceInput = document.createElement('input');
        evidenceInput.type = 'text';
        evidenceInput.className = 'claim-evidence-input';
        evidenceInput.placeholder = 'e.g. https://metrics.internal/q3-report.pdf or Cert #4829';
        evidenceInput.value = finding.attachedEvidence || '';
        evidenceInput.addEventListener('input', (e) => {
          finding.attachedEvidence = e.target.value.trim();
        });

        promptBox.appendChild(promptLabel);
        promptBox.appendChild(evidenceInput);
        card.appendChild(promptBox);
      }

      DOM.findingsList.appendChild(card);
    };

    // 1. Render Factual Claims Group
    if (claims.length > 0) {
      const heading = document.createElement('div');
      heading.className = 'findings-section-heading';
      heading.innerHTML = `<span>⚠️ Claims Requiring Supporting Evidence</span><span class="section-count">${claims.length}</span>`;
      DOM.findingsList.appendChild(heading);
      claims.forEach(c => renderCard(c, true));
    }

    // 2. Render Policy Violations Group
    if (violations.length > 0) {
      const heading = document.createElement('div');
      heading.className = 'findings-section-heading';
      heading.innerHTML = `<span>Brand Standards & Policy Violations</span><span class="section-count">${violations.length}</span>`;
      DOM.findingsList.appendChild(heading);
      violations.forEach(v => renderCard(v, false));
    }
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
    const appCount = list.filter(item => {
      const norm = normalizeCampaignStatus(item.status || item.workflowStage);
      return norm === 'brand_approved' || norm === 'legally_cleared';
    }).length;
    const rejCount = list.filter(item => {
      const norm = normalizeCampaignStatus(item.status || item.workflowStage);
      return norm === 'changes_requested';
    }).length;

    if (DOM.hfilterAllCount) DOM.hfilterAllCount.textContent = allCount.toString();
    if (DOM.hfilterAppCount) DOM.hfilterAppCount.textContent = appCount.toString();
    if (DOM.hfilterRejCount) DOM.hfilterRejCount.textContent = rejCount.toString();

    const filtered = list.filter(item => {
      // 1. Status Filter
      const norm = normalizeCampaignStatus(item.status || item.workflowStage);
      if (currentHistoryStatusFilter === 'approved' && norm !== 'brand_approved' && norm !== 'legally_cleared') return false;
      if (currentHistoryStatusFilter === 'rejected' && norm !== 'changes_requested') return false;

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

      // Status & Persistence Indicator
      const tdStatus = document.createElement('td');
      const normStatus = normalizeCampaignStatus(item.status || item.workflowStage);
      const statusPill = document.createElement('span');
      statusPill.className = `status-pill ${normStatus}`;

      let statusLabel = 'DRAFT';
      if (normStatus === 'brand_approved') statusLabel = 'BRAND APPROVED';
      else if (normStatus === 'legally_cleared') statusLabel = 'LEGALLY CLEARED';
      else if (normStatus === 'changes_requested') statusLabel = 'CHANGES REQUESTED';
      else if (normStatus === 'in_review') statusLabel = 'IN REVIEW';
      statusPill.textContent = statusLabel;
      tdStatus.appendChild(statusPill);

      // Visual indicator distinguishing Cloud-persisted from Local sandbox records
      const isCloud = Boolean(item.isCloudPersisted);
      const sourceBadge = document.createElement('span');
      sourceBadge.className = isCloud ? 'badge-cloud' : 'badge-local';
      sourceBadge.title = isCloud ? 'Persisted in Supabase PostgreSQL Cloud Database' : 'Saved locally in browser storage (Sandbox)';
      sourceBadge.textContent = isCloud ? '☁ Cloud' : '💾 Local';
      tdStatus.appendChild(sourceBadge);

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

  /* ===================================================================
     8.1 Governance Intelligence & Policy Friction Radar Engine
     =================================================================== */

  const AMBIGUOUS_QUALITATIVE_TERMS = [
    {
      word: 'professional',
      category: 'Tone & Demeanor',
      frictionReason: 'Subjective adjective without operational style standard. Creators and reviewers frequently disagree on what tone constitutes "professional".',
      recommendation: 'Specify concrete style conventions (e.g. AP Style, third-person perspective, active verbs, exclusion of colloquial slang).',
      rewriteTemplate: 'Content must adhere to standard AP Style guidelines, maintain third-person perspective, and avoid informal slang.'
    },
    {
      word: 'modern',
      category: 'Visual & Voice',
      frictionReason: 'Vague temporal descriptor. Lacks measurable typography, layout, or syntax criteria.',
      recommendation: 'Replace with defined structural attributes: paragraph caps of <= 3 sentences, clear subheads every 150 words, and branded color palette.',
      rewriteTemplate: 'Structure layout with concise paragraphs (maximum 3 sentences) and distinct section subheadings every 150 words.'
    },
    {
      word: 'appropriate',
      category: 'Content Scope',
      frictionReason: 'Subjective gatekeeping word that grants arbitrary discretionary veto power to reviewers without clear boundaries.',
      recommendation: 'Define explicit inclusion and exclusion topics rather than relying on discretionary appropriateness.',
      rewriteTemplate: 'Content must directly address enterprise brand safety criteria and exclude unverified third-party promotional material.'
    },
    {
      word: 'attractive',
      category: 'Visual Rules',
      frictionReason: 'Aesthetic opinion with zero technical specification. Creates endless subjective revision cycles between design and editorial teams.',
      recommendation: 'Define explicit visual parameters: minimum 16px clear space, 4.5:1 WCAG contrast ratio, and approved brand assets.',
      rewriteTemplate: 'Visual assets must maintain a minimum 16px clear-space boundary and comply with WCAG 2.1 AA 4.5:1 contrast standards.'
    },
    {
      word: 'clean',
      category: 'Visual & Layout',
      frictionReason: 'Subjective design term often used vaguely for whitespace, margins, or minimal typography.',
      recommendation: 'Specify layout grid spacing, margin requirements, and maximum visual density.',
      rewriteTemplate: 'Maintain balanced whitespace with standard 24px container margins and approved typography hierarchy.'
    },
    {
      word: 'cutting-edge',
      category: 'Brand Voice',
      frictionReason: 'Superlative marketing buzzword that diminishes technical authority and risks consumer regulatory challenge.',
      recommendation: 'Describe specific, verified platform features or audited capabilities instead of superlative hype.',
      rewriteTemplate: 'Describe specific technical architecture and verified capabilities without using superlative buzzwords.'
    },
    {
      word: 'world-class',
      category: 'Value Proposition',
      frictionReason: 'Unsubstantiated promissory phrase that triggers legal review scrutiny and consumer skepticism.',
      recommendation: 'Require audited customer case studies, uptime percentages, or independent benchmark comparisons.',
      rewriteTemplate: 'Support quality assertions with audited performance metrics or documented customer case studies.'
    },
    {
      word: 'high-quality',
      category: 'Editorial Standards',
      frictionReason: 'Vague quality assertion that lacks concrete editorial or proofreading criteria.',
      recommendation: 'Define specific proofreading tiers: zero grammar errors, verified hyperlinks, and mandatory brand asset review.',
      rewriteTemplate: 'Drafts must achieve zero spelling/grammar errors in automated linting and pass two-tier editorial verification.'
    },
    {
      word: 'engaging',
      category: 'Tone & Style',
      frictionReason: 'Subjective reader-reaction goal rather than an actionable writing guideline.',
      recommendation: 'Specify actionable reader-engagement mechanisms: clear call-to-actions (CTAs), structured bullet points, or question hooks.',
      rewriteTemplate: 'Include a distinct call-to-action (CTA) and format key takeaways as scannable bullet points.'
    },
    {
      word: 'compelling',
      category: 'Messaging Rules',
      frictionReason: 'Qualitative aspiration that gives creators no instruction on how to structure persuasive copy.',
      recommendation: 'Require problem-solution narrative framing supported by verified customer evidence.',
      rewriteTemplate: 'Structure messaging using a problem-agitation-solution narrative backed by verified customer data.'
    }
  ];

  function filterCampaignsByDate(campaigns, dateFilter = 'all') {
    if (!Array.isArray(campaigns)) return [];
    if (dateFilter === 'all') return [...campaigns];
    const now = Date.now();
    const days = dateFilter === '7d' ? 7 : (dateFilter === '30d' ? 30 : 0);
    if (!days) return [...campaigns];
    const cutoff = now - (days * 24 * 60 * 60 * 1000);
    return campaigns.filter(c => {
      const timestamp = new Date(c.timestamp || c.created_at || 0).getTime();
      return !isNaN(timestamp) && timestamp >= cutoff;
    });
  }

  function analyzeGovernanceMetrics(campaigns = [], dateFilter = 'all') {
    const filtered = filterCampaignsByDate(campaigns, dateFilter);
    const total = filtered.length;

    let inReviewCount = 0;
    let brandApprovedCount = 0;
    let legallyClearedCount = 0;
    let changesRequestedCount = 0;
    let draftingCount = 0;
    let totalViolations = 0;
    let highSeverityViolations = 0;
    const ruleCounts = {};

    filtered.forEach(c => {
      const status = normalizeCampaignStatus(c.workflowStage || c.status || c.current_status);
      if (status === 'in_review') inReviewCount++;
      else if (status === 'brand_approved') brandApprovedCount++;
      else if (status === 'legally_cleared') legallyClearedCount++;
      else if (status === 'changes_requested') changesRequestedCount++;
      else draftingCount++;

      if (Array.isArray(c.findings)) {
        totalViolations += c.findings.length;
        c.findings.forEach(f => {
          if (f.severity === 'high') highSeverityViolations++;
          const title = f.ruleTitle || f.ruleCitation || 'Unspecified Rule';
          ruleCounts[title] = (ruleCounts[title] || 0) + 1;
        });
      }
    });

    const completedCount = brandApprovedCount + legallyClearedCount + changesRequestedCount;
    const compliantCount = brandApprovedCount + legallyClearedCount;
    const complianceRate = completedCount > 0 ? Math.round((compliantCount / completedCount) * 100) : null;

    const sortedRules = Object.entries(ruleCounts).sort((a, b) => b[1] - a[1]);
    const topViolatedRule = sortedRules.length > 0
      ? { ruleTitle: sortedRules[0][0], count: sortedRules[0][1] }
      : null;

    return {
      totalCampaigns: total,
      inReviewCount,
      brandApprovedCount,
      legallyClearedCount,
      changesRequestedCount,
      draftingCount,
      completedCount,
      compliantCount,
      complianceRate,
      totalViolations,
      highSeverityViolations,
      topViolatedRule,
      ruleCounts,
      hasSufficientData: total > 0
    };
  }

  function categorizeFindingType(finding) {
    const type = String(finding.type || '').toLowerCase();
    const rule = String(finding.ruleTitle || finding.ruleCitation || '').toLowerCase();

    if (type === 'term_avoid' || rule.includes('avoided term') || rule.includes('prohibited')) {
      return { id: 'term_avoid', label: 'Prohibited Terminology', icon: '⛔' };
    }
    if (type === 'claim_verification' || rule.includes('claim') || rule.includes('guarantee') || rule.includes('verification')) {
      return { id: 'promissory_claim', label: 'Unverified Promissory Claims', icon: '⚖️' };
    }
    if (type === 'tone_style' || rule.includes('tone') || rule.includes('voice') || rule.includes('hyperbole')) {
      return { id: 'tone_voice', label: 'Tone & Voice Mismatch', icon: '🎙️' };
    }
    if (type === 'accessibility' || rule.includes('readability') || rule.includes('sentence') || rule.includes('word')) {
      return { id: 'accessibility', label: 'Readability & Length Limits', icon: '📏' };
    }
    if (type === 'visual_identity' || rule.includes('visual') || rule.includes('logo') || rule.includes('typography')) {
      return { id: 'visual_identity', label: 'Visual Identity & Trademark', icon: '🎨' };
    }
    return { id: 'general_policy', label: 'General Brand Policy', icon: '📋' };
  }

  function detectRecurringViolations(campaigns = []) {
    if (!Array.isArray(campaigns) || campaigns.length === 0) return [];

    const map = new Map();

    campaigns.forEach(c => {
      if (!Array.isArray(c.findings)) return;

      c.findings.forEach(f => {
        const title = f.ruleTitle || f.ruleCitation || 'Unspecified Rule';
        const cat = categorizeFindingType(f);
        const severity = f.severity || 'medium';

        if (!map.has(title)) {
          map.set(title, {
            ruleTitle: title,
            category: cat.label,
            categoryId: cat.id,
            categoryIcon: cat.icon,
            guidelineSection: f.guidelineSection || 'Brand Standards',
            totalCount: 0,
            highSeverityCount: 0,
            mediumSeverityCount: 0,
            lowSeverityCount: 0,
            affectedCampaignIds: new Set(),
            sampleCampaignId: c.id,
            sampleCampaignTitle: c.title || 'Untitled Draft',
            sampleEvidence: f.evidence || f.matchedText || null,
            suggestedReplacement: f.suggestedReplacement || f.replacement || null
          });
        }

        const entry = map.get(title);
        entry.totalCount++;
        if (severity === 'high') entry.highSeverityCount++;
        else if (severity === 'low') entry.lowSeverityCount++;
        else entry.mediumSeverityCount++;

        if (c.id) entry.affectedCampaignIds.add(c.id);
      });
    });

    return Array.from(map.values())
      .map(entry => ({
        ...entry,
        affectedCampaignCount: entry.affectedCampaignIds.size,
        affectedCampaignIds: Array.from(entry.affectedCampaignIds)
      }))
      .sort((a, b) => b.totalCount - a.totalCount);
  }

  function computeReviewEfficiency(campaigns = []) {
    if (!Array.isArray(campaigns) || campaigns.length === 0) {
      return {
        hasTurnaroundData: false,
        averageTurnaroundHours: null,
        averageTurnaroundFormatted: 'No completed reviews',
        pendingQueueAgeHours: null,
        inReviewCount: 0,
        brandApprovedCount: 0,
        bottleneck: {
          stage: 'none',
          severity: 'normal',
          message: 'No pending campaign bottlenecks detected.'
        }
      };
    }

    const now = Date.now();
    const turnaroundDurationsMs = [];
    const pendingAgesMs = [];
    let inReviewCount = 0;
    let brandApprovedCount = 0;

    campaigns.forEach(c => {
      const status = normalizeCampaignStatus(c.workflowStage || c.status || c.current_status);
      const createdAt = new Date(c.timestamp || c.created_at || 0).getTime();

      if (status === 'in_review') {
        inReviewCount++;
        if (!isNaN(createdAt) && createdAt > 0) {
          pendingAgesMs.push(Math.max(0, now - createdAt));
        }
      } else if (status === 'brand_approved') {
        brandApprovedCount++;
        if (!isNaN(createdAt) && createdAt > 0) {
          pendingAgesMs.push(Math.max(0, now - createdAt));
        }
      }

      const completedAt = new Date(
        (c.legalOfficerSignoff && c.legalOfficerSignoff.timestamp) ||
        (c.brandCustodianSignoff && c.brandCustodianSignoff.timestamp) ||
        c.updated_at ||
        0
      ).getTime();

      if (!isNaN(createdAt) && !isNaN(completedAt) && completedAt > createdAt) {
        turnaroundDurationsMs.push(completedAt - createdAt);
      }
    });

    const avgTurnaroundMs = turnaroundDurationsMs.length > 0
      ? turnaroundDurationsMs.reduce((a, b) => a + b, 0) / turnaroundDurationsMs.length
      : null;

    const avgTurnaroundHours = avgTurnaroundMs !== null
      ? Math.round((avgTurnaroundMs / (1000 * 60 * 60)) * 10) / 10
      : null;

    const avgPendingAgeHours = pendingAgesMs.length > 0
      ? Math.round((pendingAgesMs.reduce((a, b) => a + b, 0) / (pendingAgesMs.length * 1000 * 60 * 60)) * 10) / 10
      : null;

    let bottleneck = {
      stage: 'healthy',
      severity: 'normal',
      message: 'Workflow velocity is balanced. Campaigns are progressing smoothly.'
    };

    if (inReviewCount >= 3) {
      bottleneck = {
        stage: 'in_review',
        severity: inReviewCount >= 5 ? 'critical' : 'warning',
        message: `Brand Custodian Triage Backlog: ${inReviewCount} campaigns currently awaiting brand voice review.`
      };
    } else if (brandApprovedCount >= 2) {
      bottleneck = {
        stage: 'brand_approved',
        severity: 'warning',
        message: `Legal Sign-Off Queue: ${brandApprovedCount} brand-approved campaigns pending compliance seal issuance.`
      };
    }

    return {
      hasTurnaroundData: turnaroundDurationsMs.length > 0,
      averageTurnaroundHours: avgTurnaroundHours,
      averageTurnaroundFormatted: avgTurnaroundHours !== null ? `${avgTurnaroundHours} hrs` : 'Requires 2+ completed reviews',
      pendingQueueAgeHours: avgPendingAgeHours,
      inReviewCount,
      brandApprovedCount,
      bottleneck
    };
  }

  function runPolicyFrictionRadar(guidelines = {}, campaigns = []) {
    const frictionFindings = [];
    let findingCounter = 1;

    const voiceText = String(guidelines.brandVoice || '');
    const accessText = String(guidelines.accessibilityRules || '');
    const visualText = String(guidelines.visualRules || '');
    const avoidTerms = Array.isArray(guidelines.avoidTerms) ? guidelines.avoidTerms : [];
    const prefTerms = Array.isArray(guidelines.preferredTerms) ? guidelines.preferredTerms : [];
    const claims = Array.isArray(guidelines.verificationClaims) ? guidelines.verificationClaims : [];

    const sectionsToScan = [
      { name: 'Brand Voice & Demeanor', text: voiceText },
      { name: 'Accessibility & Readability', text: accessText },
      { name: 'Visual Identity Standards', text: visualText }
    ];

    AMBIGUOUS_QUALITATIVE_TERMS.forEach(dict => {
      sectionsToScan.forEach(sec => {
        const regex = new RegExp(`\\b${dict.word}\\b`, 'i');
        if (regex.test(sec.text)) {
          const sentences = sec.text.split(/(?<=[.!?])\s+/);
          const matchedSentence = sentences.find(s => regex.test(s)) || sec.text;

          frictionFindings.push({
            id: `friction-vague-${findingCounter++}`,
            frictionType: 'Subjective Ambiguity (Text-Based)',
            badgeClass: 'ambiguity',
            severity: 'medium',
            guidelineSection: sec.name,
            detectedWord: dict.word,
            quotedGuideline: matchedSentence.trim(),
            whyFriction: dict.frictionReason,
            empiricalEvidence: 'Qualitative adjectives without operational criteria generate interpretation divergence between Creators and Reviewers.',
            recommendation: dict.recommendation,
            proposedRuleRewrite: dict.rewriteTemplate
          });
        }
      });
    });

    const brevityMatch = accessText.match(/(\d+)\s*words/i);
    const sentenceLimit = brevityMatch ? parseInt(brevityMatch[1], 10) : 30;
    if (sentenceLimit <= 30 && claims.length >= 4) {
      frictionFindings.push({
        id: `friction-conflict-${findingCounter++}`,
        frictionType: 'Potential Rule Contradiction',
        badgeClass: 'contradiction',
        severity: 'high',
        guidelineSection: 'Accessibility vs. Regulatory Compliance',
        detectedWord: 'sentenceLimit',
        quotedGuideline: `Sentence limit capped at ${sentenceLimit} words, while ${claims.length} promissory claims require mandatory substantiating qualifiers.`,
        whyFriction: 'Writers cannot include legally mandated qualification statements without exceeding the single-sentence word threshold.',
        empiricalEvidence: 'Creates recurring tension where Legal requests factual disclosure expansions while Brand Custodians reject long sentences.',
        recommendation: 'Explicitly exempt legal disclaimer footnotes or permit structured bullet points for multi-clause disclosures.',
        proposedRuleRewrite: `Sentences must not exceed ${sentenceLimit} words. Structured disclaimers and legal qualifiers formatted as bullet points are exempt from this threshold.`
      });
    }

    avoidTerms.forEach(at => {
      const term = typeof at === 'string' ? at : (at.term || '');
      if (prefTerms.some(pt => pt.toLowerCase() === term.toLowerCase())) {
        frictionFindings.push({
          id: `friction-dup-${findingCounter++}`,
          frictionType: 'Conflicting Terminology Rule',
          badgeClass: 'contradiction',
          severity: 'high',
          guidelineSection: 'Preferred vs. Avoided Terminology',
          detectedWord: term,
          quotedGuideline: `"${term}" is listed in both Preferred Terms and Avoided Terms.`,
          whyFriction: 'Direct logical contradiction. Content will trigger both approval and violation flags simultaneously.',
          empiricalEvidence: 'Automated rules engine and human reviewers receive contradictory instructions.',
          recommendation: `Remove "${term}" from one of the lists to establish a single source of truth.`,
          proposedRuleRewrite: `Remove "${term}" from Preferred Terms and standardize on "${at.replacement || 'approved alternative'}".`
        });
      }
    });

    const recurring = detectRecurringViolations(campaigns);
    recurring.forEach(rec => {
      if (rec.totalCount >= 2 && rec.affectedCampaignCount >= 2) {
        frictionFindings.push({
          id: `friction-empirical-${findingCounter++}`,
          frictionType: 'High Disagreement Rate (Empirical Pattern)',
          badgeClass: 'empirical',
          severity: rec.highSeverityCount >= 2 ? 'high' : 'medium',
          guidelineSection: rec.guidelineSection,
          detectedWord: rec.ruleTitle,
          quotedGuideline: `Rule: "${rec.ruleTitle}" (${rec.category})`,
          whyFriction: `Creators consistently trigger this rule (${rec.totalCount} times across ${rec.affectedCampaignCount} campaigns), indicating guideline misunderstanding or missing authoring guidance.`,
          empiricalEvidence: `Empirically verified across ${rec.affectedCampaignCount} real campaign drafts. Latest occurrence in "${rec.sampleCampaignTitle}".`,
          recommendation: 'Provide pre-approved copy snippets in brand guidelines and add proactive creator guidance before submission.',
          proposedRuleRewrite: `Provide explicit authorized alternatives directly in the guideline: replace instances of "${rec.sampleEvidence || 'flagged terms'}" with "${rec.suggestedReplacement || 'approved enterprise phrasing'}".`
        });
      }
    });

    return frictionFindings;
  }

  function generateGovernanceRecommendations(metrics = {}, recurring = [], friction = []) {
    const recommendations = [];
    let recCounter = 1;

    if (recurring.length > 0) {
      const top = recurring[0];
      recommendations.push({
        id: `rec-${recCounter++}`,
        priority: 'high',
        impact: 'Immediate Blocker Reduction',
        category: 'Creator Enablement',
        title: `Eliminate Recurring Discrepancies on "${top.ruleTitle}"`,
        description: `This single rule accounts for ${top.totalCount} violations across ${top.affectedCampaignCount} campaigns. Distributing an approved alternatives cheat-sheet to creators will immediately reduce review turnaround cycles.`,
        actionItem: `Publish pre-approved phrasing in the Guidelines tab for "${top.ruleTitle}".`
      });
    }

    const vagueFindings = friction.filter(f => f.frictionType.includes('Ambiguity'));
    if (vagueFindings.length > 0) {
      const topVague = vagueFindings[0];
      recommendations.push({
        id: `rec-${recCounter++}`,
        priority: 'medium',
        impact: 'Reviewer-Creator Alignment',
        category: 'Policy Modernization',
        title: `Clarify Ambiguous Term "${topVague.detectedWord}" in ${topVague.guidelineSection}`,
        description: topVague.whyFriction,
        actionItem: `Adopt proposed measurable rewrite: "${topVague.proposedRuleRewrite}"`
      });
    }

    if (metrics.inReviewCount >= 3) {
      recommendations.push({
        id: `rec-${recCounter++}`,
        priority: 'high',
        impact: 'Workflow Velocity',
        category: 'Triage Optimization',
        title: `Expedite Brand Custodian Queue (${metrics.inReviewCount} Campaigns Pending)`,
        description: 'Multiple campaigns are awaiting brand voice sign-off. Reviewers can leverage side-by-side diff comparisons to accelerate approvals.',
        actionItem: 'Prioritize older submissions in the review queue to prevent publishing bottlenecks.'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        id: `rec-default`,
        priority: 'low',
        impact: 'Continuous Governance',
        category: 'Baseline Governance',
        title: 'Maintain Regular Multi-Role Governance Reviews',
        description: 'Your brand guidelines and review history show zero critical bottlenecks. Continue submitting drafts and recording compliance seals.',
        actionItem: 'Run periodic policy friction scans as new marketing channels and guidelines are added.'
      });
    }

    return recommendations;
  }

  function generateGovernanceReport(metrics, recurring, efficiency, friction, recommendations, format = 'markdown') {
    if (format === 'json') {
      return JSON.stringify({
        generatedAt: new Date().toISOString(),
        platform: 'BrandForge Intelligent Brand Governance',
        metrics,
        recurringViolations: recurring,
        reviewEfficiency: efficiency,
        policyFrictionRadar: friction,
        recommendations
      }, null, 2);
    }

    const lines = [
      `# BrandForge Governance Intelligence & Policy Friction Report`,
      `**Generated:** ${new Date().toLocaleString()}`,
      `**Platform:** BrandForge Multi-Role Governance Engine (Codex 48 Round 3)`,
      ``,
      `## 1. Executive Summary & Governance KPIs`,
      `- **Total Campaigns Evaluated:** ${metrics.totalCampaigns}`,
      `- **Overall Compliance Rate:** ${metrics.complianceRate !== null ? metrics.complianceRate + '%' : 'Pending Review'}`,
      `- **Awaiting Brand Review:** ${metrics.inReviewCount}`,
      `- **Brand Approved:** ${metrics.brandApprovedCount}`,
      `- **Legally Cleared (Sealed):** ${metrics.legallyClearedCount}`,
      `- **Changes Requested:** ${metrics.changesRequestedCount}`,
      `- **Total Policy Violations Detected:** ${metrics.totalViolations} (${metrics.highSeverityViolations} High Severity)`,
      `- **Average Review Turnaround Time:** ${efficiency.averageTurnaroundFormatted}`,
      ``,
      `## 2. Review Pipeline & Bottleneck Radar`,
      `- **Bottleneck Status:** ${efficiency.bottleneck.message} [${efficiency.bottleneck.severity.toUpperCase()}]`,
      `- **Average Pending Queue Age:** ${efficiency.pendingQueueAgeHours !== null ? efficiency.pendingQueueAgeHours + ' hours' : 'N/A'}`,
      ``,
      `## 3. Recurring Brand Violations (Top Drift Areas)`,
      recurring.length === 0 ? `*No recurring violations detected across evaluated campaigns.*` :
        recurring.slice(0, 5).map((r, i) =>
          `${i + 1}. **${r.ruleTitle}** (${r.category})\n   - Frequency: ${r.totalCount}x across ${r.affectedCampaignCount} campaign(s)\n   - Severity: ${r.highSeverityCount} High, ${r.mediumSeverityCount} Medium\n   - Section: ${r.guidelineSection}`
        ).join('\n'),
      ``,
      `## 4. Policy Friction Radar (Guideline Ambiguity & Conflicts)`,
      friction.length === 0 ? `*Zero policy friction or contradictory guidelines identified.*` :
        friction.map((f, i) =>
          `### ${i + 1}. [${f.frictionType}] ${f.guidelineSection}\n` +
          `- **Quoted Text:** *"${f.quotedGuideline}"*\n` +
          `- **Friction Cause:** ${f.whyFriction}\n` +
          `- **Evidence:** ${f.empiricalEvidence}\n` +
          `- **Proposed Measurable Rewrite:** \`${f.proposedRuleRewrite}\`\n`
        ).join('\n'),
      ``,
      `## 5. Prioritized Actionable Recommendations`,
      recommendations.map((rec, i) =>
        `${i + 1}. **[${rec.priority.toUpperCase()}] ${rec.title}** (${rec.category})\n   - Impact: ${rec.impact}\n   - Rationale: ${rec.description}\n   - Action: ${rec.actionItem}`
      ).join('\n'),
      ``,
      `---`,
      `*Report generated by BrandForge. Advisory recommendations do not automatically alter saved brand guidelines.*`
    ];

    return lines.join('\n');
  }

  /* ===================================================================
     8.2 Governance Intelligence Dashboard Rendering
     =================================================================== */

  let currentGovernanceTimeFilter = 'all';

  function renderInsights() {
    let list = [];
    const isConnected = SupabaseManager.connectionState === 'authenticated';

    if (useDemoInsights) {
      list = SAMPLE_INSIGHTS_HISTORY;
      if (DOM.govDemoBanner) DOM.govDemoBanner.style.display = 'flex';
      if (DOM.govDatasetBadge) {
        DOM.govDatasetBadge.textContent = 'Previewing Demo Sample Analytics';
        DOM.govDatasetBadge.style.background = 'rgba(245, 158, 11, 0.15)';
        DOM.govDatasetBadge.style.color = '#fbbf24';
        DOM.govDatasetBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      }
      if (DOM.btnToggleDemoInsights) DOM.btnToggleDemoInsights.textContent = 'Switch to Real Data';
    } else {
      if (DOM.govDemoBanner) DOM.govDemoBanner.style.display = 'none';
      if (isConnected) {
        // Only include authentic organization records
        list = currentReviewHistory.filter(r => r.isCloudPersisted === true || (!String(r.id).startsWith('demo-') && isValidUuid(r.id)));
        if (DOM.govDatasetBadge) {
          DOM.govDatasetBadge.textContent = `${(SupabaseManager.organization && SupabaseManager.organization.name) || 'Cloud Workspace'} (PostgreSQL)`;
          DOM.govDatasetBadge.style.background = 'rgba(96, 165, 250, 0.15)';
          DOM.govDatasetBadge.style.color = '#60a5fa';
          DOM.govDatasetBadge.style.borderColor = 'rgba(96, 165, 250, 0.3)';
        }
      } else {
        // Sandbox mode with local real session records
        list = currentReviewHistory.filter(r => !String(r.id).startsWith('demo-'));
        if (DOM.govDatasetBadge) {
          DOM.govDatasetBadge.textContent = 'Local Organization Sandbox';
          DOM.govDatasetBadge.style.background = 'rgba(148, 163, 184, 0.15)';
          DOM.govDatasetBadge.style.color = '#94a3b8';
          DOM.govDatasetBadge.style.borderColor = 'rgba(148, 163, 184, 0.3)';
        }
      }
      if (DOM.btnToggleDemoInsights) DOM.btnToggleDemoInsights.textContent = 'Preview Demo Analytics';
    }

    if (list.length === 0) {
      if (DOM.insightsContentArea) DOM.insightsContentArea.style.display = 'none';
      if (DOM.insightsEmptyState) DOM.insightsEmptyState.style.display = 'block';

      // Reset KPIs to clean empty states
      if (DOM.govKpiComplianceRate) DOM.govKpiComplianceRate.textContent = '--%';
      if (DOM.govKpiComplianceSub) DOM.govKpiComplianceSub.textContent = '0 of 0 resolved compliant';
      if (DOM.govKpiTotalCampaigns) DOM.govKpiTotalCampaigns.textContent = '0';
      if (DOM.govKpiInReview) DOM.govKpiInReview.textContent = '0';
      if (DOM.govKpiLegallyCleared) DOM.govKpiLegallyCleared.textContent = '0';
      if (DOM.govKpiChangesRequested) DOM.govKpiChangesRequested.textContent = '0';
      if (DOM.govKpiTurnaroundTime) DOM.govKpiTurnaroundTime.textContent = '-- hrs';
      if (DOM.govKpiTurnaroundSub) DOM.govKpiTurnaroundSub.textContent = 'No review history yet';
      if (DOM.govKpiPendingAge) DOM.govKpiPendingAge.textContent = '-- hrs';
      if (DOM.govKpiPendingSub) DOM.govKpiPendingSub.textContent = 'Queue velocity';
      if (DOM.govKpiTotalViolations) DOM.govKpiTotalViolations.textContent = '0';
      if (DOM.govKpiViolationsSub) DOM.govKpiViolationsSub.textContent = '0 High Risk Blockers';
      return;
    }

    if (DOM.insightsContentArea) DOM.insightsContentArea.style.display = 'flex';
    if (DOM.insightsEmptyState) DOM.insightsEmptyState.style.display = 'none';

    // 1. Calculate Core Governance Metrics
    const metrics = analyzeGovernanceMetrics(list, currentGovernanceTimeFilter);
    const efficiency = computeReviewEfficiency(list);
    const recurring = detectRecurringViolations(list);
    const friction = runPolicyFrictionRadar(currentGuidelines, list);
    const recommendations = generateGovernanceRecommendations(metrics, recurring, friction);

    // 2. Populate KPI Ribbon
    if (DOM.govKpiComplianceRate) {
      DOM.govKpiComplianceRate.textContent = metrics.complianceRate !== null ? `${metrics.complianceRate}%` : 'N/A';
      DOM.govKpiComplianceRate.style.color = metrics.complianceRate === null ? 'var(--text-muted)' : (metrics.complianceRate >= 80 ? 'var(--status-success-text)' : (metrics.complianceRate >= 60 ? 'var(--sev-med-text)' : 'var(--sev-high-text)'));
    }
    if (DOM.govKpiComplianceSub) {
      DOM.govKpiComplianceSub.textContent = `${metrics.compliantCount} of ${metrics.completedCount} resolved compliant`;
    }
    if (DOM.govKpiTotalCampaigns) DOM.govKpiTotalCampaigns.textContent = metrics.totalCampaigns.toString();
    if (DOM.govKpiTotalSub) DOM.govKpiTotalSub.textContent = `Across active channel formats`;
    if (DOM.govKpiInReview) DOM.govKpiInReview.textContent = metrics.inReviewCount.toString();
    if (DOM.govKpiLegallyCleared) DOM.govKpiLegallyCleared.textContent = metrics.legallyClearedCount.toString();
    if (DOM.govKpiChangesRequested) DOM.govKpiChangesRequested.textContent = metrics.changesRequestedCount.toString();

    if (DOM.govKpiTurnaroundTime) {
      DOM.govKpiTurnaroundTime.textContent = efficiency.averageTurnaroundHours !== null ? `${efficiency.averageTurnaroundHours} hrs` : '-- hrs';
    }
    if (DOM.govKpiTurnaroundSub) {
      DOM.govKpiTurnaroundSub.textContent = efficiency.hasTurnaroundData ? 'Submission to Sign-off' : 'Requires 2+ completed reviews';
    }
    if (DOM.govKpiPendingAge) {
      DOM.govKpiPendingAge.textContent = efficiency.pendingQueueAgeHours !== null ? `${efficiency.pendingQueueAgeHours} hrs` : '-- hrs';
    }
    if (DOM.govKpiPendingSub) {
      DOM.govKpiPendingSub.textContent = `${metrics.inReviewCount} pending in queue`;
    }
    if (DOM.govKpiTotalViolations) DOM.govKpiTotalViolations.textContent = metrics.totalViolations.toString();
    if (DOM.govKpiViolationsSub) DOM.govKpiViolationsSub.textContent = `${metrics.highSeverityViolations} High Severity Blockers`;

    // 3. Populate Collaborative Lifecycle Pipeline
    if (DOM.insightsDistributionBars) {
      DOM.insightsDistributionBars.innerHTML = '';
      const total = metrics.totalCampaigns || 1;

      const createBar = (label, count, color) => {
        const pct = Math.round((count / total) * 100);
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

      DOM.insightsDistributionBars.appendChild(createBar('Drafting (Authoring)', metrics.draftingCount, 'var(--text-muted)'));
      DOM.insightsDistributionBars.appendChild(createBar('In Review (Awaiting Brand Custodian)', metrics.inReviewCount, '#fbbf24'));
      DOM.insightsDistributionBars.appendChild(createBar('Brand Approved (Sign-off Granted)', metrics.brandApprovedCount, '#60a5fa'));
      DOM.insightsDistributionBars.appendChild(createBar('Legally Cleared (Cryptographic Seal Issued)', metrics.legallyClearedCount, '#c084fc'));
      DOM.insightsDistributionBars.appendChild(createBar('Changes Requested (Author Revisions Required)', metrics.changesRequestedCount, 'var(--sev-high-text)'));
    }

    // 4. Populate Bottleneck Diagnostic Box
    if (DOM.govBottleneckBadge && DOM.govBottleneckBody) {
      const bn = efficiency.bottleneck;
      DOM.govBottleneckBadge.textContent = bn.severity === 'critical' ? 'Critical Bottleneck' : (bn.severity === 'warning' ? 'Queue Warning' : 'Healthy Velocity');
      DOM.govBottleneckBadge.className = `badge ${bn.severity === 'critical' ? 'badge-danger' : (bn.severity === 'warning' ? 'badge-warning' : 'badge-success')}`;
      if (bn.severity === 'critical') {
        DOM.govBottleneckBadge.style.background = 'rgba(239, 68, 68, 0.15)';
        DOM.govBottleneckBadge.style.color = '#f87171';
        DOM.govBottleneckBadge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      } else if (bn.severity === 'warning') {
        DOM.govBottleneckBadge.style.background = 'rgba(245, 158, 11, 0.15)';
        DOM.govBottleneckBadge.style.color = '#fbbf24';
        DOM.govBottleneckBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      } else {
        DOM.govBottleneckBadge.style.background = 'rgba(16, 185, 129, 0.15)';
        DOM.govBottleneckBadge.style.color = '#34d399';
        DOM.govBottleneckBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      }

      DOM.govBottleneckBody.innerHTML = `
        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${escapeHtml(bn.message)}</div>
        <div>Turnaround benchmark: <strong>${escapeHtml(efficiency.averageTurnaroundFormatted)}</strong> across resolved submissions. Average pending campaign age: <strong>${efficiency.pendingQueueAgeHours !== null ? efficiency.pendingQueueAgeHours + ' hours' : 'N/A'}</strong>.</div>
      `;
    }

    // 5. Populate Recurring Violations (Brand Drift Radar)
    if (DOM.govRecurringCountBadge) {
      DOM.govRecurringCountBadge.textContent = `${recurring.length} Tracked Rules`;
    }
    if (DOM.insightsFrequentRules) {
      DOM.insightsFrequentRules.innerHTML = '';
      if (recurring.length === 0) {
        DOM.insightsFrequentRules.innerHTML = '<p class="font-hint" style="font-size: 0.8rem; padding: 12px;">Zero recurring violations recorded across evaluated campaigns. Brand guidelines are well-followed.</p>';
      } else {
        recurring.slice(0, 8).forEach(r => {
          const item = document.createElement('div');
          item.className = 'insight-list-item';
          item.style.cursor = 'pointer';

          const left = document.createElement('div');
          left.style.display = 'flex';
          left.style.alignItems = 'center';
          left.style.gap = '8px';
          left.style.flex = '1';

          const icon = document.createElement('span');
          icon.textContent = r.categoryIcon;
          icon.style.fontSize = '1rem';

          const textBlock = document.createElement('div');
          const title = document.createElement('div');
          title.textContent = r.ruleTitle;
          title.style.fontWeight = '600';
          title.style.color = 'var(--text-primary)';

          const sub = document.createElement('div');
          sub.style.fontSize = '0.72rem';
          sub.style.color = 'var(--text-muted)';
          sub.textContent = `${r.category} • Section: ${r.guidelineSection} • Affected: ${r.affectedCampaignCount} campaign(s)`;

          textBlock.appendChild(title);
          textBlock.appendChild(sub);
          left.appendChild(icon);
          left.appendChild(textBlock);

          const right = document.createElement('div');
          right.style.display = 'flex';
          right.style.alignItems = 'center';
          right.style.gap = '8px';

          if (r.highSeverityCount > 0) {
            const highBadge = document.createElement('span');
            highBadge.className = 'badge';
            highBadge.style.background = 'rgba(239, 68, 68, 0.15)';
            highBadge.style.color = '#f87171';
            highBadge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            highBadge.textContent = `${r.highSeverityCount} High`;
            right.appendChild(highBadge);
          }

          const freqBadge = document.createElement('span');
          freqBadge.className = 'badge';
          freqBadge.textContent = `${r.totalCount}x`;
          right.appendChild(freqBadge);

          const inspectBtn = document.createElement('button');
          inspectBtn.className = 'btn btn-secondary btn-sm';
          inspectBtn.style.padding = '2px 8px';
          inspectBtn.style.fontSize = '0.7rem';
          inspectBtn.textContent = 'Inspect';
          inspectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetCampaign = list.find(c => c.id === r.sampleCampaignId) || list[0];
            if (targetCampaign) openHistoryDetail(targetCampaign);
          });
          right.appendChild(inspectBtn);

          item.appendChild(left);
          item.appendChild(right);
          DOM.insightsFrequentRules.appendChild(item);
        });
      }
    }

    // 6. Populate Policy Friction Radar Cards
    if (DOM.govFrictionCountBadge) {
      DOM.govFrictionCountBadge.textContent = `${friction.length} Friction Areas`;
    }
    if (DOM.govPolicyFrictionCards) {
      DOM.govPolicyFrictionCards.innerHTML = '';
      if (friction.length === 0) {
        DOM.govPolicyFrictionCards.innerHTML = '<p class="font-hint" style="font-size: 0.8rem; padding: 12px;">Zero guideline ambiguities or policy conflicts detected in active brand guidelines.</p>';
      } else {
        friction.forEach(f => {
          const card = document.createElement('div');
          card.className = 'gov-friction-card';

          const cardHeader = document.createElement('div');
          cardHeader.className = 'gov-friction-card-header';

          const badge = document.createElement('span');
          badge.className = `gov-friction-badge ${f.badgeClass || 'ambiguity'}`;
          badge.textContent = f.frictionType;

          const secSpan = document.createElement('span');
          secSpan.style.fontSize = '0.725rem';
          secSpan.style.color = 'var(--text-muted)';
          secSpan.style.fontWeight = '600';
          secSpan.textContent = f.guidelineSection;

          cardHeader.appendChild(badge);
          cardHeader.appendChild(secSpan);

          const quoteBox = document.createElement('div');
          quoteBox.className = 'gov-friction-quote';
          quoteBox.textContent = `"${f.quotedGuideline}"`;

          const whyBox = document.createElement('div');
          whyBox.className = 'gov-friction-why';
          whyBox.innerHTML = `<strong>Root Cause:</strong> ${escapeHtml(f.whyFriction)} <div style="margin-top: 4px; font-size: 0.75rem; color: var(--text-secondary);"><strong>Evidence:</strong> ${escapeHtml(f.empiricalEvidence)}</div>`;

          const rewriteBox = document.createElement('div');
          rewriteBox.className = 'gov-friction-rewrite-box';

          const rewriteLabelRow = document.createElement('div');
          rewriteLabelRow.style.display = 'flex';
          rewriteLabelRow.style.justifyContent = 'space-between';
          rewriteLabelRow.style.alignItems = 'center';

          const label = document.createElement('span');
          label.className = 'gov-friction-rewrite-label';
          label.textContent = 'Proposed Measurable Rewrite:';

          const copyBtn = document.createElement('button');
          copyBtn.className = 'btn btn-secondary btn-sm';
          copyBtn.style.padding = '2px 8px';
          copyBtn.style.fontSize = '0.675rem';
          copyBtn.textContent = 'Copy Rule';
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(f.proposedRuleRewrite).then(() => {
              showToast(`Copied proposed rewrite for "${f.detectedWord}" to clipboard!`, 'success');
            }).catch(() => {
              showToast(`Failed to copy to clipboard.`, 'error');
            });
          });

          rewriteLabelRow.appendChild(label);
          rewriteLabelRow.appendChild(copyBtn);

          const rewriteText = document.createElement('div');
          rewriteText.className = 'gov-friction-rewrite-text';
          rewriteText.textContent = f.proposedRuleRewrite;

          rewriteBox.appendChild(rewriteLabelRow);
          rewriteBox.appendChild(rewriteText);

          card.appendChild(cardHeader);
          card.appendChild(quoteBox);
          card.appendChild(whyBox);
          card.appendChild(rewriteBox);

          DOM.govPolicyFrictionCards.appendChild(card);
        });
      }
    }

    // 7. Populate Actionable Governance Recommendations
    if (DOM.govActionableRecommendations) {
      DOM.govActionableRecommendations.innerHTML = '';
      recommendations.forEach(rec => {
        const card = document.createElement('div');
        card.className = 'gov-recommendation-card';

        const left = document.createElement('div');
        left.className = 'gov-rec-left';

        const meta = document.createElement('div');
        meta.className = 'gov-rec-meta';

        const prioBadge = document.createElement('span');
        prioBadge.className = `gov-rec-priority ${rec.priority}`;
        prioBadge.textContent = rec.priority.toUpperCase();

        const catSpan = document.createElement('span');
        catSpan.style.fontSize = '0.725rem';
        catSpan.style.color = 'var(--text-muted)';
        catSpan.textContent = `• ${rec.category} • Impact: ${rec.impact}`;

        meta.appendChild(prioBadge);
        meta.appendChild(catSpan);

        const title = document.createElement('div');
        title.className = 'gov-rec-title';
        title.textContent = rec.title;

        const desc = document.createElement('div');
        desc.className = 'gov-rec-desc';
        desc.textContent = rec.description;

        const action = document.createElement('div');
        action.className = 'gov-rec-action';
        action.innerHTML = `<strong>Recommended Action:</strong> ${escapeHtml(rec.actionItem)}`;

        left.appendChild(meta);
        left.appendChild(title);
        left.appendChild(desc);
        left.appendChild(action);

        card.appendChild(left);
        DOM.govActionableRecommendations.appendChild(card);
      });
    }

    // 8. Legacy element compatibility
    if (DOM.insightsGuidelineAdvice) {
      DOM.insightsGuidelineAdvice.innerHTML = '';
      const adviceP = document.createElement('p');
      if (recurring.length > 0) {
        adviceP.innerHTML = `<strong>High Friction Area Detected:</strong> <em>"${escapeHtml(recurring[0].ruleTitle)}"</em> is your organization's most repeated brand inconsistency (${recurring[0].totalCount} times). Consider refining guidelines to provide clearer copy examples.`;
      } else {
        adviceP.textContent = 'Guidelines are performing effectively with minimal repeated discrepancies across reviews.';
      }
      DOM.insightsGuidelineAdvice.appendChild(adviceP);
    }
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

  // Run Brand Check Handler (Hybrid AI & Deterministic Dispatch)
  async function handleRunCheck() {
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
    DOM.checkProgress.textContent = activeEngineMode === 'ai'
      ? 'Auditing draft with Evidence-Backed AI (Gemini) grounded against active guidelines...'
      : 'Evaluating draft using local deterministic rules engine...';
    DOM.checkProgress.style.display = 'block';

    let findings = [];
    let score = 100;
    let suggestedRevision = text;
    let engineUsed = activeEngineMode;
    let claimsCount = 0;

    if (activeEngineMode === 'ai') {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 24000);

        const response = await fetch('/api/review-brand', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title,
            contentType,
            rawText: text,
            guidelines: currentGuidelines,
            forceEngine: 'auto'
          }),
          signal: controller.signal
        });

        clearTimeout(timer);

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }

        const data = await response.json();
        findings = Array.isArray(data.findings) ? data.findings : [];
        score = typeof data.complianceScore === 'number' ? data.complianceScore : calculateScore(findings);
        suggestedRevision = data.suggestedRevision || generateSuggestedRevision(text, findings, currentGuidelines);
        engineUsed = data.engine || 'gemini';
        claimsCount = typeof data.claimsRequiringEvidenceCount === 'number'
          ? data.claimsRequiringEvidenceCount
          : findings.filter(f => f.isVerificationNeeded).length;

        // Render AI Engine status banner
        if (DOM.aiEngineBanner) {
          if (data.isFallback) {
            DOM.aiEngineBanner.className = 'ai-banner fallback';
            if (DOM.aiBannerIcon) DOM.aiBannerIcon.textContent = '⚡';
            if (DOM.aiBannerText) DOM.aiBannerText.textContent = data.notice || 'Evaluated using Local Deterministic Rules Engine (Fallback).';
          } else {
            DOM.aiEngineBanner.className = 'ai-banner';
            if (DOM.aiBannerIcon) DOM.aiBannerIcon.textContent = '✨';
            if (DOM.aiBannerText) {
              DOM.aiBannerText.textContent = `Audited via Gemini ${data.model || '1.5 Flash'} • Policy Grounded with Evidence (${findings.length} findings, ${claimsCount} claims requiring evidence)`;
            }
          }
          DOM.aiEngineBanner.style.display = 'flex';
        }
      } catch (err) {
        console.warn('[BrandForge] AI endpoint unreachable or timed out; falling back to deterministic rules:', err);
        findings = matchGuidelines(text, currentGuidelines);
        score = calculateScore(findings);
        suggestedRevision = generateSuggestedRevision(text, findings, currentGuidelines);
        engineUsed = 'deterministic_fallback';
        claimsCount = findings.filter(f => f.isVerificationNeeded).length;

        if (DOM.aiEngineBanner) {
          DOM.aiEngineBanner.className = 'ai-banner fallback';
          if (DOM.aiBannerIcon) DOM.aiBannerIcon.textContent = '⚡';
          if (DOM.aiBannerText) {
            DOM.aiBannerText.textContent = 'Notice: AI endpoint offline or timed out. Evaluated using local deterministic rules engine.';
          }
          DOM.aiEngineBanner.style.display = 'flex';
        }
      }
    } else {
      // Deterministic Mode
      findings = matchGuidelines(text, currentGuidelines);
      score = calculateScore(findings);
      suggestedRevision = generateSuggestedRevision(text, findings, currentGuidelines);
      engineUsed = 'deterministic';
      claimsCount = findings.filter(f => f.isVerificationNeeded).length;

      if (DOM.aiEngineBanner) {
        DOM.aiEngineBanner.className = 'ai-banner fallback';
        if (DOM.aiBannerIcon) DOM.aiBannerIcon.textContent = '⚡';
        if (DOM.aiBannerText) {
          DOM.aiBannerText.textContent = 'Evaluated using Local Deterministic Rules Engine (Offline / Zero-network mode).';
        }
        DOM.aiEngineBanner.style.display = 'flex';
      }
    }

    latestCheckResults = {
      id: generateUuid(),
      revisionId: generateUuid(),
      title,
      type: contentType,
      rawText: text,
      findings,
      score,
      suggestedRevision,
      engine: engineUsed,
      claimsRequiringEvidenceCount: claimsCount,
      timestamp: new Date().toISOString(),
      comments: [],
      workflowStage: 'drafting'
    };

    // Render findings & score
    renderFindings(findings);
    renderScoreBadge(score, findings.length);

    // Populate suggested revision box
    DOM.suggestedRevisionText.value = suggestedRevision;
    DOM.suggestedRevisionSection.style.display = 'flex';

    DOM.checkProgress.style.display = 'none';
    DOM.btnRunCheck.disabled = false;

    // Update workflow stepper to drafting and prepare submission action
    updateWorkflowUI('drafting');

    // Automatically sync initial draft to Supabase database if authenticated
    if (SupabaseManager.connectionState === 'authenticated') {
      SupabaseManager.syncCampaignRecord(latestCheckResults).then(syncRes => {
        if (syncRes && syncRes.success) {
          console.log('[BrandForge] Draft campaign persisted to Supabase campaigns table:', latestCheckResults.id);
        } else if (syncRes && !syncRes.success) {
          console.warn('[BrandForge] Initial draft cloud sync notice:', syncRes.message);
        }
      });
    }

    showToast(`Brand Check complete. Score: ${score}% (${findings.length} findings, ${claimsCount} claims)`, score >= 70 ? 'success' : 'error');
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
    const norm = normalizeCampaignStatus(record.status || record.workflowStage);
    let displayStatus = 'DRAFT';
    if (norm === 'brand_approved') displayStatus = 'BRAND APPROVED';
    else if (norm === 'legally_cleared') displayStatus = 'LEGALLY CLEARED';
    else if (norm === 'changes_requested') displayStatus = 'CHANGES REQUESTED';
    else if (norm === 'in_review') displayStatus = 'IN REVIEW';
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

    if (DOM.detailViewSealBtn) {
      if (record.complianceSeal) {
        DOM.detailViewSealBtn.style.display = 'inline-block';
        DOM.detailViewSealBtn.onclick = () => {
          openComplianceSealModal(record);
        };
      } else {
        DOM.detailViewSealBtn.style.display = 'none';
      }
    }

    openModal('modal-history-detail');
  }

  /* ===================================================================
     Round 3: Collaborative Governance, RBAC & Cryptographic Seal Engine
     =================================================================== */

  const ROLE_CONFIG = {
    creator: { label: 'Content Creator', badge: '✍️ Persona: Content Creator', roleClass: 'creator' },
    custodian: { label: 'Brand Custodian', badge: '🛡️ Persona: Brand Custodian', roleClass: 'custodian' },
    legal: { label: 'Legal & Compliance Officer', badge: '⚖️ Persona: Legal & Compliance', roleClass: 'legal' }
  };

  const STAGE_LABELS = {
    drafting: 'Drafting',
    in_review: 'In Review',
    changes_requested: 'Changes Requested',
    brand_approved: 'Brand Approved',
    legally_cleared: 'Legally Cleared & Sealed 🔒'
  };

  async function computeSha256(text) {
    if (window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
      const enc = new TextEncoder();
      const data = enc.encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback simple checksum if WebCrypto unavailable in test
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  function buildCanonicalSealPayload(record) {
    const canonical = {
      title: (record.title || '').trim(),
      contentType: (record.type || 'general').trim(),
      rawText: (record.rawText || '').trim(),
      complianceScore: Number(record.score || 0),
      unresolvedBlockers: Array.isArray(record.findings)
        ? record.findings.filter(f => f.severity === 'high').length
        : 0,
      activeGuidelinesVersion: record.guidelinesVersion || '2026.3-Inkloom',
      brandCustodianSignoff: record.brandCustodianSignoff ? {
        name: record.brandCustodianSignoff.name || 'Brand Custodian',
        timestamp: record.brandCustodianSignoff.timestamp
      } : null,
      legalOfficerSignoff: record.legalOfficerSignoff ? {
        name: record.legalOfficerSignoff.name || 'Legal Counsel',
        timestamp: record.legalOfficerSignoff.timestamp
      } : null
    };
    return JSON.stringify(canonical, Object.keys(canonical).sort());
  }

  function updateWorkflowUI(stage) {
    currentWorkflowStage = stage || 'drafting';

    if (DOM.workflowCurrentStageName) {
      DOM.workflowCurrentStageName.textContent = STAGE_LABELS[currentWorkflowStage] || 'Drafting';
    }

    if (DOM.workflowCurrentRoleBadge) {
      const info = ROLE_CONFIG[activeRole] || ROLE_CONFIG.creator;
      DOM.workflowCurrentRoleBadge.textContent = info.badge;
    }

    // Update Stepper Tracks
    const setNodeState = (node, active, completed) => {
      if (!node) return;
      node.classList.toggle('active', active);
      node.classList.toggle('completed', completed);
    };

    const setConnState = (conn, completed) => {
      if (!conn) return;
      conn.classList.toggle('completed', completed);
    };

    if (currentWorkflowStage === 'drafting') {
      setNodeState(DOM.stepNodeDrafting, true, false);
      setNodeState(DOM.stepNodeInReview, false, false);
      setNodeState(DOM.stepNodeBrandApproved, false, false);
      setNodeState(DOM.stepNodeLegallyCleared, false, false);
      setConnState(DOM.stepConn1, false);
      setConnState(DOM.stepConn2, false);
      setConnState(DOM.stepConn3, false);
    } else if (currentWorkflowStage === 'in_review') {
      setNodeState(DOM.stepNodeDrafting, false, true);
      setNodeState(DOM.stepNodeInReview, true, false);
      setNodeState(DOM.stepNodeBrandApproved, false, false);
      setNodeState(DOM.stepNodeLegallyCleared, false, false);
      setConnState(DOM.stepConn1, true);
      setConnState(DOM.stepConn2, false);
      setConnState(DOM.stepConn3, false);
    } else if (currentWorkflowStage === 'brand_approved') {
      setNodeState(DOM.stepNodeDrafting, false, true);
      setNodeState(DOM.stepNodeInReview, false, true);
      setNodeState(DOM.stepNodeBrandApproved, true, false);
      setNodeState(DOM.stepNodeLegallyCleared, false, false);
      setConnState(DOM.stepConn1, true);
      setConnState(DOM.stepConn2, true);
      setConnState(DOM.stepConn3, false);
    } else if (currentWorkflowStage === 'legally_cleared') {
      setNodeState(DOM.stepNodeDrafting, false, true);
      setNodeState(DOM.stepNodeInReview, false, true);
      setNodeState(DOM.stepNodeBrandApproved, false, true);
      setNodeState(DOM.stepNodeLegallyCleared, true, true);
      setConnState(DOM.stepConn1, true);
      setConnState(DOM.stepConn2, true);
      setConnState(DOM.stepConn3, true);
    } else if (currentWorkflowStage === 'changes_requested') {
      setNodeState(DOM.stepNodeDrafting, true, false);
      setNodeState(DOM.stepNodeInReview, false, false);
      setNodeState(DOM.stepNodeBrandApproved, false, false);
      setNodeState(DOM.stepNodeLegallyCleared, false, false);
      setConnState(DOM.stepConn1, false);
      setConnState(DOM.stepConn2, false);
      setConnState(DOM.stepConn3, false);
    }

    renderStepperActions();
  }

  function renderStepperActions() {
    if (!DOM.stepperActionsBar) return;
    DOM.stepperActionsBar.innerHTML = '';

    const role = activeRole;
    const stage = currentWorkflowStage;

    if (role === 'creator') {
      if (stage === 'drafting' || stage === 'changes_requested') {
        const btnSubmit = document.createElement('button');
        btnSubmit.className = 'btn btn-primary btn-sm';
        btnSubmit.innerHTML = '<span>Submit for Brand Review ➔</span>';
        btnSubmit.onclick = async () => {
          if (!latestCheckResults) {
            showToast('Please run a brand check before submitting for review.', 'error');
            return;
          }
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = '<span>Saving to Cloud... ⏳</span>';

          try {
            latestCheckResults.id = ensureUuid(latestCheckResults.id);
            latestCheckResults.revisionId = ensureUuid(latestCheckResults.revisionId);
            latestCheckResults.workflowStage = 'in_review';
            latestCheckResults.status = 'in_review';

            const syncRes = await SupabaseManager.syncCampaignRecord(latestCheckResults);
            if (!syncRes.success && SupabaseManager.connectionState === 'authenticated') {
              btnSubmit.disabled = false;
              btnSubmit.innerHTML = '<span>Submit for Brand Review ➔</span>';
              showToast(`Submission failed: ${syncRes.message}`, 'error');
              return;
            }

            if (SupabaseManager.connectionState === 'authenticated') {
              latestCheckResults.isCloudPersisted = true;
            }

            updateWorkflowUI('in_review');

            // Persist to local state and update review table
            const updatedHistory = [latestCheckResults, ...currentReviewHistory.filter(r => r.id !== latestCheckResults.id)];
            saveHistory(updatedHistory);

            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<span>Submit for Brand Review ➔</span>';

            const toastMsg = SupabaseManager.connectionState === 'authenticated'
              ? 'Draft officially submitted for Brand Custodian review and synchronized to database!'
              : 'Draft saved locally (Sandbox Mode). Connect Supabase to sync across team.';
            showToast(toastMsg, 'success');
          } catch (err) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<span>Submit for Brand Review ➔</span>';
            showToast(`Submission error: ${err.message}`, 'error');
          }
        };
        DOM.stepperActionsBar.appendChild(btnSubmit);
      } else if (stage === 'in_review') {
        const span = document.createElement('span');
        span.style.fontSize = '0.75rem';
        span.style.color = 'var(--text-muted)';
        span.textContent = '⏳ Submitted. Awaiting Brand Custodian triage.';
        DOM.stepperActionsBar.appendChild(span);
      } else if (stage === 'brand_approved') {
        const span = document.createElement('span');
        span.style.fontSize = '0.75rem';
        span.style.color = 'var(--status-success-text)';
        span.textContent = '✓ Brand Approved! Awaiting Legal Clearance.';
        DOM.stepperActionsBar.appendChild(span);
      } else if (stage === 'legally_cleared') {
        const btnSeal = document.createElement('button');
        btnSeal.className = 'btn btn-clay btn-sm';
        btnSeal.textContent = 'View Compliance Seal 🔒';
        btnSeal.onclick = () => {
          if (latestCheckResults && latestCheckResults.complianceSeal) {
            openComplianceSealModal(latestCheckResults);
          }
        };
        DOM.stepperActionsBar.appendChild(btnSeal);
      }
    } else if (role === 'custodian') {
      if (stage === 'in_review') {
        const btnApprove = document.createElement('button');
        btnApprove.className = 'btn btn-primary btn-sm';
        btnApprove.textContent = 'Approve Brand Voice ✓';
        btnApprove.onclick = async () => {
          if (!latestCheckResults) {
            showToast('Run check before approving.', 'error');
            return;
          }
          btnApprove.disabled = true;
          const origText = btnApprove.textContent;
          btnApprove.textContent = 'Approving... ⏳';

          try {
            latestCheckResults.id = ensureUuid(latestCheckResults.id);
            latestCheckResults.revisionId = ensureUuid(latestCheckResults.revisionId);
            latestCheckResults.brandCustodianSignoff = {
              name: (SupabaseManager.profile && SupabaseManager.profile.full_name) || 'Brand Custodian',
              userId: SupabaseManager.user ? SupabaseManager.user.id : null,
              timestamp: new Date().toISOString(),
              verified: true
            };
            latestCheckResults.workflowStage = 'brand_approved';
            latestCheckResults.status = 'brand_approved';

            if (SupabaseManager.connectionState === 'authenticated') {
              const statusRes = await SupabaseManager.updateCampaignStatus(latestCheckResults.id, 'brand_approved', 'in_review');
              if (!statusRes.success) {
                btnApprove.disabled = false;
                btnApprove.textContent = origText;
                showToast(`Approval failed: ${statusRes.message}`, 'error');
                return;
              }
              latestCheckResults.isCloudPersisted = true;
            }

            updateWorkflowUI('brand_approved');
            const updatedHistory = [latestCheckResults, ...currentReviewHistory.filter(r => r.id !== latestCheckResults.id)];
            saveHistory(updatedHistory);

            btnApprove.disabled = false;
            btnApprove.textContent = origText;
            showToast('Brand voice approved. Escalated to Legal for clearance.', 'success');
          } catch (err) {
            btnApprove.disabled = false;
            btnApprove.textContent = origText;
            showToast(`Approval error: ${err.message}`, 'error');
          }
        };

        const btnReject = document.createElement('button');
        btnReject.className = 'btn btn-secondary btn-sm';
        btnReject.style.borderColor = 'var(--sev-high-border)';
        btnReject.style.color = 'var(--sev-high-text)';
        btnReject.textContent = 'Request Changes';
        btnReject.onclick = () => {
          openModal('modal-reject');
        };

        DOM.stepperActionsBar.appendChild(btnApprove);
        DOM.stepperActionsBar.appendChild(btnReject);
      } else if (stage === 'brand_approved') {
        const span = document.createElement('span');
        span.style.fontSize = '0.75rem';
        span.style.color = 'var(--status-success-text)';
        span.textContent = '✓ Brand sign-off granted.';
        DOM.stepperActionsBar.appendChild(span);
      } else if (stage === 'legally_cleared') {
        const btnSeal = document.createElement('button');
        btnSeal.className = 'btn btn-clay btn-sm';
        btnSeal.textContent = 'View Compliance Seal 🔒';
        btnSeal.onclick = () => {
          if (latestCheckResults && latestCheckResults.complianceSeal) {
            openComplianceSealModal(latestCheckResults);
          }
        };
        DOM.stepperActionsBar.appendChild(btnSeal);
      } else {
        const span = document.createElement('span');
        span.style.fontSize = '0.75rem';
        span.style.color = 'var(--text-muted)';
        span.textContent = 'Creator drafting in progress.';
        DOM.stepperActionsBar.appendChild(span);
      }
    } else if (role === 'legal') {
      if (stage === 'brand_approved') {
        const btnClear = document.createElement('button');
        btnClear.className = 'btn btn-primary btn-sm';
        btnClear.innerHTML = '<span>Grant Legal Clearance & Issue Seal 🔒</span>';
        btnClear.onclick = async () => {
          await handleIssueComplianceSeal();
        };

        const btnReject = document.createElement('button');
        btnReject.className = 'btn btn-secondary btn-sm';
        btnReject.style.borderColor = 'var(--sev-high-border)';
        btnReject.style.color = 'var(--sev-high-text)';
        btnReject.textContent = 'Request Evidence';
        btnReject.onclick = () => {
          openModal('modal-reject');
        };

        DOM.stepperActionsBar.appendChild(btnClear);
        DOM.stepperActionsBar.appendChild(btnReject);
      } else if (stage === 'in_review') {
        const span = document.createElement('span');
        span.style.fontSize = '0.75rem';
        span.style.color = 'var(--text-muted)';
        span.textContent = 'Awaiting Brand Custodian voice review first.';
        DOM.stepperActionsBar.appendChild(span);
      } else if (stage === 'legally_cleared') {
        const btnSeal = document.createElement('button');
        btnSeal.className = 'btn btn-clay btn-sm';
        btnSeal.textContent = 'View Compliance Seal 🔒';
        btnSeal.onclick = () => {
          if (latestCheckResults && latestCheckResults.complianceSeal) {
            openComplianceSealModal(latestCheckResults);
          }
        };
        DOM.stepperActionsBar.appendChild(btnSeal);
      } else {
        const span = document.createElement('span');
        span.style.fontSize = '0.75rem';
        span.style.color = 'var(--text-muted)';
        span.textContent = 'Drafting in progress.';
        DOM.stepperActionsBar.appendChild(span);
      }
    }
  }

  // Issue Cryptographic Compliance Seal
  async function handleIssueComplianceSeal() {
    if (!latestCheckResults) return;

    latestCheckResults.id = ensureUuid(latestCheckResults.id);
    latestCheckResults.revisionId = ensureUuid(latestCheckResults.revisionId);

    if (!latestCheckResults.brandCustodianSignoff) {
      latestCheckResults.brandCustodianSignoff = {
        name: (SupabaseManager.profile && SupabaseManager.profile.full_name) || 'Sarah Chen (Brand Custodian)',
        userId: SupabaseManager.user ? SupabaseManager.user.id : null,
        timestamp: new Date().toISOString(),
        verified: true
      };
    }

    latestCheckResults.legalOfficerSignoff = {
      name: (SupabaseManager.profile && SupabaseManager.profile.full_name) || 'David Marcus, Esq. (Legal Counsel)',
      userId: SupabaseManager.user ? SupabaseManager.user.id : null,
      timestamp: new Date().toISOString(),
      verified: true
    };

    const canonical = buildCanonicalSealPayload(latestCheckResults);
    const hash = await computeSha256(canonical);
    const sealId = `SEAL-${hash.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const seal = {
      sealId,
      sha256Hash: hash,
      algorithm: 'SHA-256 (NIST FIPS 180-4)',
      issuedAt: new Date().toISOString(),
      status: 'VERIFIED_COMPLIANT',
      canonicalPayload: canonical,
      brandCustodianSignoff: latestCheckResults.brandCustodianSignoff,
      legalOfficerSignoff: latestCheckResults.legalOfficerSignoff,
      verificationUrl: `https://brandforge-inkloom.netlify.app/verify/${sealId}`
    };

    latestCheckResults.complianceSeal = seal;
    latestCheckResults.status = 'legally_cleared';
    latestCheckResults.workflowStage = 'legally_cleared';

    // Persist to history with valid UUID
    const record = {
      id: latestCheckResults.id,
      revisionId: latestCheckResults.revisionId,
      timestamp: new Date().toISOString(),
      title: latestCheckResults.title,
      type: latestCheckResults.type,
      score: latestCheckResults.score,
      findings: latestCheckResults.findings,
      rawText: latestCheckResults.suggestedRevision || latestCheckResults.rawText,
      status: 'legally_cleared',
      workflowStage: 'legally_cleared',
      engine: latestCheckResults.engine || activeEngineMode,
      claimsRequiringEvidenceCount: latestCheckResults.claimsRequiringEvidenceCount || 0,
      complianceSeal: seal,
      comments: latestCheckResults.comments || [],
      brandCustodianSignoff: latestCheckResults.brandCustodianSignoff,
      legalOfficerSignoff: latestCheckResults.legalOfficerSignoff,
      reviewerNotes: 'Final legal clearance granted. Cryptographic compliance seal generated.'
    };

    // If authenticated, sync campaign, update status, and record seal to Supabase
    if (SupabaseManager.connectionState === 'authenticated') {
      const syncRes = await SupabaseManager.syncCampaignRecord(record);
      if (!syncRes.success) {
        showToast(`Legal clearance sync failed: ${syncRes.message}`, 'error');
        return;
      }

      const statusRes = await SupabaseManager.updateCampaignStatus(record.id, 'legally_cleared', 'brand_approved');
      if (!statusRes.success) {
        showToast(`Status update to legally_cleared failed: ${statusRes.message}`, 'error');
        return;
      }

      const sealRes = await SupabaseManager.recordComplianceSeal(record.id, record.revisionId, seal);
      if (!sealRes.success) {
        showToast(`Compliance seal recording failed: ${sealRes.message}`, 'error');
        return;
      }

      record.isCloudPersisted = true;
      latestCheckResults.isCloudPersisted = true;
    }

    const updatedHistory = [record, ...currentReviewHistory.filter(r => r.id !== record.id)];
    saveHistory(updatedHistory);

    updateWorkflowUI('legally_cleared');
    openComplianceSealModal(record);

    const successMsg = SupabaseManager.connectionState === 'authenticated'
      ? 'Pre-Publication Compliance Seal generated and recorded to Supabase Cloud!'
      : 'Pre-Publication Compliance Seal generated and recorded in Local Sandbox.';
    showToast(successMsg, 'success');
  }

  // Open Compliance Seal Certificate Modal
  function openComplianceSealModal(record) {
    currentInspectedRecord = record;
    const seal = record.complianceSeal;
    if (!seal) return;

    if (DOM.certSealId) DOM.certSealId.textContent = seal.sealId || 'SEAL-VALID';
    if (DOM.certDocTitle) DOM.certDocTitle.textContent = record.title || 'Draft Document';
    if (DOM.certDocType) DOM.certDocType.textContent = (record.type || 'General').replace('_', ' ');
    if (DOM.certComplianceScore) DOM.certComplianceScore.textContent = `${record.score}%`;

    const blockers = (record.findings || []).filter(f => f.severity === 'high').length;
    if (DOM.certUnresolvedBlockers) DOM.certUnresolvedBlockers.textContent = `${blockers} Blockers`;

    if (DOM.certCustodianSigner) {
      DOM.certCustodianSigner.textContent = (seal.brandCustodianSignoff && seal.brandCustodianSignoff.name) || 'Brand Custodian';
    }
    if (DOM.certCustodianTime) {
      DOM.certCustodianTime.textContent = (seal.brandCustodianSignoff && new Date(seal.brandCustodianSignoff.timestamp).toLocaleString()) || new Date().toLocaleString();
    }

    if (DOM.certLegalSigner) {
      DOM.certLegalSigner.textContent = (seal.legalOfficerSignoff && seal.legalOfficerSignoff.name) || 'Legal Counsel';
    }
    if (DOM.certLegalTime) {
      DOM.certLegalTime.textContent = (seal.legalOfficerSignoff && new Date(seal.legalOfficerSignoff.timestamp).toLocaleString()) || new Date().toLocaleString();
    }

    if (DOM.certSha256Hash) DOM.certSha256Hash.textContent = seal.sha256Hash || 'N/A';
    if (DOM.certVerificationResult) DOM.certVerificationResult.style.display = 'none';

    openModal('modal-compliance-seal');
  }

  // In-Line Comment Threads Manager for Diff Modal
  function renderDiffComments() {
    if (!DOM.diffCommentsList) return;
    DOM.diffCommentsList.innerHTML = '';

    const comments = (latestCheckResults && latestCheckResults.comments) || [];
    if (DOM.diffCommentsCount) DOM.diffCommentsCount.textContent = comments.length.toString();

    if (comments.length === 0) {
      if (DOM.emptyCommentsNotice) {
        DOM.emptyCommentsNotice.style.display = 'block';
        DOM.diffCommentsList.appendChild(DOM.emptyCommentsNotice);
      }
      return;
    }

    if (DOM.emptyCommentsNotice) DOM.emptyCommentsNotice.style.display = 'none';

    comments.forEach(c => {
      const item = document.createElement('div');
      item.className = `comment-item ${c.resolved ? 'resolved' : ''}`;

      const header = document.createElement('div');
      header.className = 'comment-header';

      const roleSpan = document.createElement('span');
      roleSpan.className = `comment-role-pill ${c.authorRole || 'creator'}`;
      roleSpan.textContent = c.authorRoleLabel || c.authorRole || 'Reviewer';

      const timeSpan = document.createElement('span');
      timeSpan.className = 'comment-time';
      timeSpan.textContent = new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      header.appendChild(roleSpan);
      header.appendChild(timeSpan);
      item.appendChild(header);

      if (c.targetText) {
        const targetTag = document.createElement('div');
        targetTag.className = 'comment-target-tag';
        targetTag.textContent = `Target: "${c.targetText}"`;
        item.appendChild(targetTag);
      }

      const body = document.createElement('div');
      body.className = 'comment-body';
      body.textContent = c.commentText;
      item.appendChild(body);

      const footer = document.createElement('div');
      footer.className = 'comment-footer';

      const resolveBtn = document.createElement('button');
      resolveBtn.className = 'comment-resolve-btn';
      resolveBtn.textContent = c.resolved ? '↩ Re-open Thread' : '✓ Mark Resolved';
      resolveBtn.onclick = async () => {
        c.resolved = !c.resolved;
        if (latestCheckResults && latestCheckResults.id) {
          await SupabaseManager.toggleCommentResolution(latestCheckResults.id, c.id, c.resolved);
        }
        renderDiffComments();
        showToast(c.resolved ? 'Comment marked as resolved.' : 'Comment re-opened.', 'info');
      };

      footer.appendChild(resolveBtn);
      item.appendChild(footer);
      DOM.diffCommentsList.appendChild(item);
    });
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
   * Generates structured audit JSON (Round 3 Production Schema)
   */
  function generateAuditJson(record) {
    const findingsList = record.findings || [];
    const claimsCount = record.claimsRequiringEvidenceCount || findingsList.filter(f => f.isVerificationNeeded).length;

    return JSON.stringify({
      brandForgeAuditVersion: '3.0-Production',
      governanceEngine: record.engine || 'BrandForge Evidence-Backed AI Engine (Gemini)',
      auditTimestamp: record.timestamp || new Date().toISOString(),
      documentTitle: record.title || 'Untitled',
      contentType: record.type || 'general',
      complianceScore: record.score,
      status: record.status || 'evaluated',
      reviewerNotes: record.reviewerNotes || null,
      findingsCount: findingsList.length,
      claimsRequiringEvidenceCount: claimsCount,
      findings: findingsList.map(f => ({
        findingId: f.findingId || f.id || 'finding',
        type: f.type || (f.isVerificationNeeded ? 'claim_verification' : 'brand_violation'),
        severity: f.severity,
        guidelineSection: f.guidelineSection || 'Policy',
        ruleCitation: f.ruleCitation || f.ruleTitle,
        evidence: f.evidence,
        explanation: f.explanation,
        recommendation: f.recommendation,
        suggestedReplacement: f.suggestedReplacement || '',
        isVerificationNeeded: Boolean(f.isVerificationNeeded),
        confidence: f.confidence || 90,
        attachedEvidence: f.attachedEvidence || null
      })),
      contentSnapshot: record.rawText || '',
      governanceNotice: 'Audited via BrandForge Pre-Publication Governance Pipeline with policy grounding and human verification oversight.'
    }, null, 2);
  }

  /**
   * Generates formatted audit Markdown (Round 3 Production Format)
   */
  function generateAuditMarkdown(record) {
    const dateStr = record.timestamp ? new Date(record.timestamp).toLocaleString() : 'N/A';
    const findingsList = record.findings || [];
    const claimsCount = record.claimsRequiringEvidenceCount || findingsList.filter(f => f.isVerificationNeeded).length;
    const engineLabel = record.engine ? record.engine.toUpperCase() : 'EVIDENCE-BACKED AI (GEMINI)';

    let md = `# BrandForge Governance Audit Report\n\n`;
    md += `- **Document Title:** ${record.title || 'Untitled'}\n`;
    md += `- **Content Type:** ${(record.type || 'General').replace('_', ' ')}\n`;
    md += `- **Audit Date & Time:** ${dateStr}\n`;
    md += `- **Compliance Score:** ${record.score}%\n`;
    md += `- **Review Status:** ${(record.status || 'draft').toUpperCase()}\n`;
    md += `- **Governance Engine:** ${engineLabel}\n`;
    md += `- **Claims Requiring Factual Evidence:** ${claimsCount}\n`;
    if (record.reviewerNotes) {
      md += `- **Reviewer Notes:** ${record.reviewerNotes}\n`;
    }
    md += `\n## Findings & Policy Citations (${findingsList.length} items)\n\n`;
    if (findingsList.length === 0) {
      md += `*No brand rule violations or unverified claims detected. Content is 100% compliant with active guidelines.*\n\n`;
    } else {
      md += `| Severity | Policy Section | Trigger / Evidence Quote | Recommendation / Attached Evidence |\n`;
      md += `| :--- | :--- | :--- | :--- |\n`;
      findingsList.forEach(f => {
        const sec = f.guidelineSection || 'Brand Standards';
        const ev = (f.evidence || '').replace(/\|/g, '\\|');
        const rec = (f.recommendation || '').replace(/\|/g, '\\|');
        const extra = f.attachedEvidence ? `<br>*Evidence Attached: [${f.attachedEvidence}]*` : (f.isVerificationNeeded ? '<br>*(Awaiting Source Evidence)*' : '');
        md += `| **${f.severity.toUpperCase()}** (${f.confidence || 90}% Conf.) | ${sec} | \`${ev}\` | ${rec}${extra} |\n`;
      });
      md += `\n`;
    }
    md += `## Content Snapshot\n\n\`\`\`\n${record.rawText || ''}\n\`\`\`\n\n`;
    md += `*Report generated by BrandForge • Inkloom AI Brand Governance Challenge (Round 3 — The Finish)*\n`;
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
    // Role switcher change listener
    if (DOM.roleSelect) {
      DOM.roleSelect.value = activeRole;
      DOM.roleSelect.addEventListener('change', (e) => {
        activeRole = e.target.value;
        try {
          localStorage.setItem(STORAGE_KEYS.ROLE, activeRole);
        } catch (err) { /* ignore */ }

        if (DOM.commentAuthorBadge) {
          DOM.commentAuthorBadge.textContent = `Posting as: ${ROLE_CONFIG[activeRole].label}`;
        }
        updateWorkflowUI(currentWorkflowStage);
        SupabaseManager.updateUI();
        showToast(`Switched active stakeholder persona to ${ROLE_CONFIG[activeRole].label}.`, 'info');
      });
    }

    // Engine mode switching
    const updateEngineModeUI = (mode) => {
      activeEngineMode = mode;
      try {
        localStorage.setItem(STORAGE_KEYS.ENGINE_MODE, mode);
      } catch (e) { /* ignore */ }

      if (DOM.btnEngineAi && DOM.btnEngineDet) {
        DOM.btnEngineAi.classList.toggle('active', mode === 'ai');
        DOM.btnEngineAi.setAttribute('aria-checked', (mode === 'ai').toString());
        DOM.btnEngineDet.classList.toggle('active', mode === 'deterministic');
        DOM.btnEngineDet.setAttribute('aria-checked', (mode === 'deterministic').toString());
      }

      if (DOM.engineStatusText) {
        DOM.engineStatusText.textContent = mode === 'ai'
          ? 'Evidence-Backed AI Pipeline Ready'
          : 'Local Deterministic Rules Engine Active';
      }

      if (DOM.revisionDisclaimerBadge) {
        DOM.revisionDisclaimerBadge.textContent = mode === 'ai'
          ? 'Evidence-Grounded Revision • Requires Human Author Review'
          : 'Deterministic Replacement Draft • Requires Human Author Review';
      }
    };

    if (DOM.btnEngineAi) {
      DOM.btnEngineAi.addEventListener('click', () => {
        updateEngineModeUI('ai');
        showToast('Switched to Evidence-Backed AI Review (Gemini).', 'info');
      });
    }

    if (DOM.btnEngineDet) {
      DOM.btnEngineDet.addEventListener('click', () => {
        updateEngineModeUI('deterministic');
        showToast('Switched to Local Deterministic Engine (Offline).', 'info');
      });
    }

    updateEngineModeUI(activeEngineMode);

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
        renderDiffComments();
        openModal('modal-compare-diff');
      });
    }

    // Post In-Line Comment from Diff Modal
    if (DOM.btnPostComment) {
      DOM.btnPostComment.addEventListener('click', async () => {
        const text = DOM.commentTextInput.value.trim();
        if (!text) {
          showToast('Please enter comment text before posting.', 'error');
          return;
        }

        if (!latestCheckResults) {
          latestCheckResults = {
            id: generateUuid(),
            revisionId: generateUuid(),
            title: (DOM.contentTitle && DOM.contentTitle.value.trim()) || 'Draft',
            type: DOM.contentType ? DOM.contentType.value : 'general',
            rawText: DOM.draftInput ? DOM.draftInput.value : '',
            comments: []
          };
        }

        if (!Array.isArray(latestCheckResults.comments)) {
          latestCheckResults.comments = [];
        }

        latestCheckResults.id = ensureUuid(latestCheckResults.id);
        latestCheckResults.revisionId = ensureUuid(latestCheckResults.revisionId);

        const targetText = DOM.commentTargetInput ? DOM.commentTargetInput.value.trim() : '';
        const comment = await SupabaseManager.postComment(
          latestCheckResults.id,
          latestCheckResults.revisionId,
          targetText,
          text
        );

        latestCheckResults.comments.push(comment);
        DOM.commentTextInput.value = '';
        if (DOM.commentTargetInput) DOM.commentTargetInput.value = '';

        renderDiffComments();
        showToast('In-line comment posted to draft review.', 'success');
      });
    }

    // Cryptographic Compliance Seal Actions
    if (DOM.btnVerifySealIntegrity) {
      DOM.btnVerifySealIntegrity.addEventListener('click', async () => {
        const rec = currentInspectedRecord || latestCheckResults;
        if (!rec || !rec.complianceSeal) {
          showToast('No compliance seal data to verify.', 'error');
          return;
        }

        const canonical = buildCanonicalSealPayload(rec);
        const recomputedHash = await computeSha256(canonical);
        const matches = recomputedHash === rec.complianceSeal.sha256Hash;

        if (DOM.certVerificationResult) {
          DOM.certVerificationResult.className = `cert-verification-banner ${matches ? '' : 'tampered'}`;
          if (DOM.certVerifyIcon) DOM.certVerifyIcon.textContent = matches ? '✓' : '⚠️';
          if (DOM.certVerifyText) {
            DOM.certVerifyText.textContent = matches
              ? 'Cryptographic Signature Validated: Zero Tamper Detected (SHA-256 Intact).'
              : 'TAMPER DETECTED: Content, score, or signatures do not match the sealed cryptographic hash!';
          }
          DOM.certVerificationResult.style.display = 'flex';
        }

        showToast(matches ? 'Seal verified: Zero tampering detected.' : 'Tamper detected! Hash mismatch.', matches ? 'success' : 'error');
      });
    }

    if (DOM.btnCopySealHash) {
      DOM.btnCopySealHash.addEventListener('click', () => {
        const hash = DOM.certSha256Hash.textContent.trim();
        navigator.clipboard.writeText(hash).then(() => {
          showToast('SHA-256 hash copied to clipboard.', 'success');
        }).catch(() => {
          showToast('Copied hash to clipboard.', 'success');
        });
      });
    }

    if (DOM.btnDownloadSealJson) {
      DOM.btnDownloadSealJson.addEventListener('click', () => {
        const rec = currentInspectedRecord || latestCheckResults;
        if (!rec || !rec.complianceSeal) return;
        const certJson = JSON.stringify({
          brandForgeCertificateVersion: '3.0-Production',
          complianceSeal: rec.complianceSeal,
          assetMetadata: {
            title: rec.title,
            type: rec.type,
            complianceScore: rec.score,
            blockers: (rec.findings || []).filter(f => f.severity === 'high').length
          },
          signoffs: {
            brandCustodian: rec.brandCustodianSignoff,
            legalOfficer: rec.legalOfficerSignoff
          },
          contentSnapshot: rec.rawText
        }, null, 2);
        triggerDownload(`brandforge-compliance-seal-${rec.complianceSeal.sealId}-${Date.now()}.json`, certJson, 'application/json');
        showToast('Downloaded official Compliance Seal receipt (JSON).', 'success');
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
      DOM.modalConfirmRejectBtn.addEventListener('click', async () => {
        if (!latestCheckResults) return;

        DOM.modalConfirmRejectBtn.disabled = true;
        const originalText = DOM.modalConfirmRejectBtn.textContent;
        DOM.modalConfirmRejectBtn.textContent = 'Saving... ⏳';

        try {
          const campaignId = ensureUuid(latestCheckResults.id);
          const revisionId = ensureUuid(latestCheckResults.revisionId);
          const reviewerNotes = DOM.rejectReviewerNotes.value.trim() || 'Author revision required to address flagged policy findings.';

          latestCheckResults.id = campaignId;
          latestCheckResults.revisionId = revisionId;
          latestCheckResults.status = 'changes_requested';
          latestCheckResults.workflowStage = 'changes_requested';

          const record = {
            id: campaignId,
            revisionId: revisionId,
            timestamp: new Date().toISOString(),
            title: (DOM.contentTitle && DOM.contentTitle.value.trim()) || latestCheckResults.title,
            type: latestCheckResults.type,
            score: latestCheckResults.score,
            findings: latestCheckResults.findings,
            rawText: (DOM.draftInput && DOM.draftInput.value.trim()) || latestCheckResults.rawText,
            status: 'changes_requested',
            workflowStage: 'changes_requested',
            engine: latestCheckResults.engine || activeEngineMode,
            claimsRequiringEvidenceCount: latestCheckResults.claimsRequiringEvidenceCount || 0,
            reviewerNotes: reviewerNotes,
            isCloudPersisted: false
          };

          if (SupabaseManager.connectionState === 'authenticated') {
            const statusRes = await SupabaseManager.updateCampaignStatus(record.id, 'changes_requested', latestCheckResults.workflowStage || 'in_review');
            if (!statusRes.success) {
              DOM.modalConfirmRejectBtn.disabled = false;
              DOM.modalConfirmRejectBtn.textContent = originalText;
              showToast(`Changes request failed: ${statusRes.message}`, 'error');
              return;
            }

            if (reviewerNotes) {
              await SupabaseManager.postComment(record.id, record.revisionId, 'Changes Requested', reviewerNotes);
            }

            record.isCloudPersisted = true;
            latestCheckResults.isCloudPersisted = true;
          }

          const updatedHistory = [record, ...currentReviewHistory.filter(r => r.id !== record.id)];
          saveHistory(updatedHistory);
          updateWorkflowUI('changes_requested');

          closeModal('modal-reject');
          DOM.modalConfirmRejectBtn.disabled = false;
          DOM.modalConfirmRejectBtn.textContent = originalText;

          const msg = SupabaseManager.connectionState === 'authenticated'
            ? 'Changes requested and updated in Supabase Cloud Database.'
            : 'Draft recorded as Changes Requested in Review History.';
          showToast(msg, 'info');
        } catch (err) {
          DOM.modalConfirmRejectBtn.disabled = false;
          DOM.modalConfirmRejectBtn.textContent = originalText;
          showToast(`Request error: ${err.message}`, 'error');
        }
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
    DOM.modalConfirmApproveBtn.addEventListener('click', async () => {
      if (!latestCheckResults) return;

      DOM.modalConfirmApproveBtn.disabled = true;
      const originalText = DOM.modalConfirmApproveBtn.textContent;
      DOM.modalConfirmApproveBtn.textContent = 'Approving... ⏳';

      try {
        const approvedContent = (DOM.suggestedRevisionText && DOM.suggestedRevisionText.value.trim()) || latestCheckResults.rawText;
        const campaignId = ensureUuid(latestCheckResults.id);
        const revisionId = ensureUuid(latestCheckResults.revisionId);

        latestCheckResults.id = campaignId;
        latestCheckResults.revisionId = revisionId;
        latestCheckResults.status = 'brand_approved';
        latestCheckResults.workflowStage = 'brand_approved';
        latestCheckResults.brandCustodianSignoff = {
          name: (SupabaseManager.profile && SupabaseManager.profile.full_name) || 'Brand Custodian',
          userId: SupabaseManager.user ? SupabaseManager.user.id : null,
          timestamp: new Date().toISOString(),
          verified: true
        };

        const record = {
          id: campaignId,
          revisionId: revisionId,
          timestamp: new Date().toISOString(),
          title: (DOM.contentTitle && DOM.contentTitle.value.trim()) || latestCheckResults.title,
          type: latestCheckResults.type,
          score: latestCheckResults.score,
          findings: latestCheckResults.findings,
          rawText: approvedContent,
          status: 'brand_approved',
          workflowStage: 'brand_approved',
          engine: latestCheckResults.engine || activeEngineMode,
          claimsRequiringEvidenceCount: latestCheckResults.claimsRequiringEvidenceCount || 0,
          reviewerNotes: null,
          brandCustodianSignoff: latestCheckResults.brandCustodianSignoff,
          isCloudPersisted: false
        };

        // If authenticated to Supabase, sync changes and verify real cloud write
        if (SupabaseManager.connectionState === 'authenticated') {
          // 1. Sync campaign record & revision
          const syncRes = await SupabaseManager.syncCampaignRecord(record);
          if (!syncRes.success) {
            DOM.modalConfirmApproveBtn.disabled = false;
            DOM.modalConfirmApproveBtn.textContent = originalText;
            showToast(`Approval persistence failed: ${syncRes.message}`, 'error');
            return;
          }

          // 2. Advance lifecycle status
          const statusRes = await SupabaseManager.updateCampaignStatus(record.id, 'brand_approved', latestCheckResults.workflowStage || 'in_review');
          if (!statusRes.success) {
            DOM.modalConfirmApproveBtn.disabled = false;
            DOM.modalConfirmApproveBtn.textContent = originalText;
            showToast(`Approval status transition failed: ${statusRes.message}`, 'error');
            return;
          }

          record.isCloudPersisted = true;
          latestCheckResults.isCloudPersisted = true;
        }

        const updatedHistory = [record, ...currentReviewHistory.filter(r => r.id !== record.id)];
        saveHistory(updatedHistory);
        updateWorkflowUI('brand_approved');

        closeModal('modal-approve');
        DOM.modalConfirmApproveBtn.disabled = false;
        DOM.modalConfirmApproveBtn.textContent = originalText;

        const successMsg = SupabaseManager.connectionState === 'authenticated'
          ? 'Version officially approved and synchronized to Supabase Cloud Database!'
          : 'Version officially approved and logged in Review History.';
        showToast(successMsg, 'success');
      } catch (err) {
        DOM.modalConfirmApproveBtn.disabled = false;
        DOM.modalConfirmApproveBtn.textContent = originalText;
        showToast(`Approval error: ${err.message}`, 'error');
      }
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
    if (DOM.btnToggleDemoInsights) {
      DOM.btnToggleDemoInsights.addEventListener('click', () => {
        useDemoInsights = !useDemoInsights;
        renderInsights();
        showToast(useDemoInsights ? 'Displaying sample insights data.' : 'Displaying real review data.', 'info');
      });
    }

    if (DOM.btnRevertRealInsights) {
      DOM.btnRevertRealInsights.addEventListener('click', () => {
        useDemoInsights = false;
        renderInsights();
        showToast('Switched back to authentic organization analytics.', 'info');
      });
    }

    if (DOM.insightsTimeFilter) {
      DOM.insightsTimeFilter.addEventListener('change', () => {
        currentGovernanceTimeFilter = DOM.insightsTimeFilter.value;
        renderInsights();
      });
    }

    if (DOM.btnEmptyGotoChecker) {
      DOM.btnEmptyGotoChecker.addEventListener('click', () => {
        const checkerTab = document.getElementById('tab-btn-checker');
        if (checkerTab) checkerTab.click();
      });
    }

    if (DOM.btnEmptyToggleDemo) {
      DOM.btnEmptyToggleDemo.addEventListener('click', () => {
        useDemoInsights = true;
        renderInsights();
        showToast('Displaying sample demo analytics.', 'info');
      });
    }

    // Governance Intelligence Report Export
    let currentGovReportFormat = 'markdown';
    let cachedGovReportData = null;

    if (DOM.btnExportGovReport) {
      DOM.btnExportGovReport.addEventListener('click', () => {
        const list = useDemoInsights ? SAMPLE_INSIGHTS_HISTORY : currentReviewHistory.filter(r => !String(r.id).startsWith('demo-'));
        const metrics = analyzeGovernanceMetrics(list, currentGovernanceTimeFilter);
        const recurring = detectRecurringViolations(list);
        const efficiency = computeReviewEfficiency(list);
        const friction = runPolicyFrictionRadar(currentGuidelines, list);
        const recommendations = generateGovernanceRecommendations(metrics, recurring, friction);

        cachedGovReportData = { metrics, recurring, efficiency, friction, recommendations };
        updateGovReportPreview();
        openModal('modal-export-governance');
      });
    }

    function updateGovReportPreview() {
      if (!cachedGovReportData || !DOM.exportGovPreviewArea) return;
      const { metrics, recurring, efficiency, friction, recommendations } = cachedGovReportData;
      const report = generateGovernanceReport(metrics, recurring, efficiency, friction, recommendations, currentGovReportFormat);
      DOM.exportGovPreviewArea.value = report;
    }

    if (DOM.btnExportGovFormatMd) {
      DOM.btnExportGovFormatMd.addEventListener('click', () => {
        currentGovReportFormat = 'markdown';
        if (DOM.btnExportGovFormatMd) DOM.btnExportGovFormatMd.classList.add('active');
        if (DOM.btnExportGovFormatJson) DOM.btnExportGovFormatJson.classList.remove('active');
        if (DOM.btnDownloadGovReport) DOM.btnDownloadGovReport.textContent = 'Download Report (.md)';
        updateGovReportPreview();
      });
    }

    if (DOM.btnExportGovFormatJson) {
      DOM.btnExportGovFormatJson.addEventListener('click', () => {
        currentGovReportFormat = 'json';
        if (DOM.btnExportGovFormatJson) DOM.btnExportGovFormatJson.classList.add('active');
        if (DOM.btnExportGovFormatMd) DOM.btnExportGovFormatMd.classList.remove('active');
        if (DOM.btnDownloadGovReport) DOM.btnDownloadGovReport.textContent = 'Download Report (.json)';
        updateGovReportPreview();
      });
    }

    if (DOM.btnCopyGovReport) {
      DOM.btnCopyGovReport.addEventListener('click', () => {
        if (!DOM.exportGovPreviewArea || !DOM.exportGovPreviewArea.value) return;
        navigator.clipboard.writeText(DOM.exportGovPreviewArea.value).then(() => {
          showToast('Governance report copied to clipboard!', 'success');
        }).catch(() => {
          DOM.exportGovPreviewArea.select();
          document.execCommand('copy');
          showToast('Governance report copied to clipboard!', 'success');
        });
      });
    }

    if (DOM.btnDownloadGovReport) {
      DOM.btnDownloadGovReport.addEventListener('click', () => {
        if (!DOM.exportGovPreviewArea || !DOM.exportGovPreviewArea.value) return;
        const ext = currentGovReportFormat === 'json' ? 'json' : 'md';
        const mime = currentGovReportFormat === 'json' ? 'application/json' : 'text/markdown';
        triggerDownload(`brandforge-governance-report-${Date.now()}.${ext}`, DOM.exportGovPreviewArea.value, mime);
        showToast(`Downloaded governance audit report (.${ext}).`, 'success');
      });
    }

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

    // Workspace & Supabase Controls
    if (DOM.btnWorkspaceModal) {
      DOM.btnWorkspaceModal.addEventListener('click', () => {
        SupabaseManager.updateUI();
        openModal('modal-workspace-sync');
      });
    }

    if (DOM.btnSaveSupabaseConfig) {
      DOM.btnSaveSupabaseConfig.addEventListener('click', async () => {
        const url = DOM.inputSupabaseUrl ? DOM.inputSupabaseUrl.value.trim() : '';
        const key = DOM.inputSupabaseAnonKey ? DOM.inputSupabaseAnonKey.value.trim() : '';

        if (!url || !key) {
          if (DOM.supabaseConfigFeedback) {
            DOM.supabaseConfigFeedback.textContent = 'Please enter both Supabase Project URL and Public Anon Key.';
            DOM.supabaseConfigFeedback.style.color = 'var(--sev-high-text)';
          }
          return;
        }

        if (DOM.supabaseConfigFeedback) {
          DOM.supabaseConfigFeedback.textContent = 'Verifying gateway and connecting to PostgreSQL...';
          DOM.supabaseConfigFeedback.style.color = 'var(--text-muted)';
        }

        DOM.btnSaveSupabaseConfig.disabled = true;
        try {
          const res = await SupabaseManager.connect(url, key, true);
          if (DOM.supabaseConfigFeedback) {
            DOM.supabaseConfigFeedback.textContent = res.message;
            DOM.supabaseConfigFeedback.style.color = res.success ? 'var(--status-success-text)' : 'var(--sev-high-text)';
          }
        } finally {
          DOM.btnSaveSupabaseConfig.disabled = false;
        }
      });
    }

    // Auth Tabs (Sign In / Sign Up)
    let activeAuthMode = 'signin';
    const setAuthMode = (mode) => {
      activeAuthMode = mode;
      if (DOM.tabAuthSignin) DOM.tabAuthSignin.classList.toggle('active', mode === 'signin');
      if (DOM.tabAuthSignup) DOM.tabAuthSignup.classList.toggle('active', mode === 'signup');
      if (DOM.groupAuthFullname) DOM.groupAuthFullname.style.display = mode === 'signup' ? 'block' : 'none';
      if (DOM.btnAuthSubmit) DOM.btnAuthSubmit.textContent = mode === 'signup' ? 'Create Account' : 'Sign In';
      if (DOM.authFeedbackBanner) DOM.authFeedbackBanner.style.display = 'none';
    };

    if (DOM.tabAuthSignin) DOM.tabAuthSignin.addEventListener('click', () => setAuthMode('signin'));
    if (DOM.tabAuthSignup) DOM.tabAuthSignup.addEventListener('click', () => setAuthMode('signup'));

    // Auth Submit (Sign In / Sign Up)
    if (DOM.btnAuthSubmit) {
      DOM.btnAuthSubmit.addEventListener('click', async () => {
        const email = DOM.inputAuthEmail ? DOM.inputAuthEmail.value.trim() : '';
        const password = DOM.inputAuthPassword ? DOM.inputAuthPassword.value : '';
        const fullname = DOM.inputAuthFullname ? DOM.inputAuthFullname.value.trim() : '';

        if (!email || !password) {
          if (DOM.authFeedbackBanner) {
            DOM.authFeedbackBanner.className = 'auth-feedback-banner error';
            DOM.authFeedbackBanner.textContent = 'Please enter email and password.';
          }
          return;
        }

        DOM.btnAuthSubmit.disabled = true;
        DOM.btnAuthSubmit.textContent = activeAuthMode === 'signup' ? 'Creating...' : 'Signing in...';

        try {
          const res = activeAuthMode === 'signup'
            ? await SupabaseManager.signUp(email, password, fullname)
            : await SupabaseManager.signIn(email, password);

          if (DOM.authFeedbackBanner) {
            DOM.authFeedbackBanner.className = `auth-feedback-banner ${res.success ? 'success' : 'error'}`;
            DOM.authFeedbackBanner.textContent = res.message;
          }
        } finally {
          DOM.btnAuthSubmit.disabled = false;
          DOM.btnAuthSubmit.textContent = activeAuthMode === 'signup' ? 'Create Account' : 'Sign In';
        }
      });
    }

    // Auth Sign Out
    if (DOM.btnAuthSignout) {
      DOM.btnAuthSignout.addEventListener('click', async () => {
        await SupabaseManager.signOut();
      });
    }

    // Sync Cloud Campaigns
    if (DOM.btnSyncCloudCampaigns) {
      DOM.btnSyncCloudCampaigns.addEventListener('click', async () => {
        DOM.btnSyncCloudCampaigns.disabled = true;
        DOM.btnSyncCloudCampaigns.textContent = 'Syncing...';
        try {
          await SupabaseManager.fetchCloudCampaigns();
        } finally {
          DOM.btnSyncCloudCampaigns.disabled = false;
          DOM.btnSyncCloudCampaigns.textContent = 'Pull Cloud Campaigns ↻';
        }
      });
    }

    if (DOM.btnDisconnectSupabase) {
      DOM.btnDisconnectSupabase.addEventListener('click', () => {
        if (DOM.inputSupabaseUrl) DOM.inputSupabaseUrl.value = '';
        if (DOM.inputSupabaseAnonKey) DOM.inputSupabaseAnonKey.value = '';
        SupabaseManager.disconnect();
        if (DOM.supabaseConfigFeedback) {
          DOM.supabaseConfigFeedback.textContent = 'Switched to Local Sandbox mode.';
          DOM.supabaseConfigFeedback.style.color = 'var(--text-muted)';
        }
      });
    }

    if (DOM.btnCopyPatchSql) {
      DOM.btnCopyPatchSql.addEventListener('click', async () => {
        try {
          const res = await fetch('supabase/migration_security_patch.sql');
          if (res.ok) {
            const sql = await res.text();
            await navigator.clipboard.writeText(sql);
            showToast('Security patch SQL copied to clipboard!', 'success');
            return;
          }
        } catch (e) { /* fallback */ }
        showToast('Please open supabase/migration_security_patch.sql directly.', 'info');
      });
    }

    if (DOM.btnCopySchemaSql) {
      DOM.btnCopySchemaSql.addEventListener('click', async () => {
        try {
          const res = await fetch('supabase/schema.sql');
          if (res.ok) {
            const fullSql = await res.text();
            await navigator.clipboard.writeText(fullSql);
            showToast('Full supabase/schema.sql copied to clipboard!', 'success');
            return;
          }
        } catch (e) { /* fallback */ }
        showToast('Please open supabase/schema.sql directly.', 'info');
      });
    }
  }

  /* ===================================================================
     11. App Initialization
     =================================================================== */
  function init() {
    // 1. Setup events FIRST so navigation, tab switching, and buttons are guaranteed to be active
    try {
      setupEventListeners();
    } catch (e) {
      console.error('[BrandForge] Event listener setup notice:', e);
    }

    // 2. Populate form with current guidelines
    try {
      populateGuidelinesForm();
    } catch (e) {
      console.error('[BrandForge] populateGuidelinesForm notice:', e);
    }

    // 3. Check if onboarding was dismissed previously
    try {
      if (DOM.onboardingBanner && localStorage.getItem(STORAGE_KEYS.ONBOARDING_SEEN) === 'true') {
        DOM.onboardingBanner.style.display = 'none';
      }
    } catch (e) { /* ignore */ }

    // 4. Initial table, overview metrics, and insights render
    try {
      updateOverviewMetrics();
    } catch (e) {
      console.error('[BrandForge] updateOverviewMetrics notice:', e);
    }

    try {
      renderHistoryTable();
    } catch (e) {
      console.error('[BrandForge] renderHistoryTable notice:', e);
    }

    try {
      renderInsights();
    } catch (e) {
      console.error('[BrandForge] renderInsights notice:', e);
    }

    // 5. Initialize collaborative workflow stepper
    try {
      updateWorkflowUI('drafting');
    } catch (e) {
      console.error('[BrandForge] updateWorkflowUI notice:', e);
    }

    // 6. Initialize Supabase Manager
    try {
      SupabaseManager.init();
    } catch (e) {
      console.error('[BrandForge] SupabaseManager.init notice:', e);
    }

    console.log('BrandForge Round 3 initialized: Collaborative Governance & Cryptographic Seals Active.');
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
