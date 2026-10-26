import { BrandProfile, ContentItem } from '../types';

export const mockBrandProfiles: BrandProfile[] = [
  {
    id: 'inkloom-ai-official',
    name: 'Inkloom AI',
    tagline: 'Intelligent Brand Governance for the Modern Enterprise',
    industry: 'Enterprise AI & Governance Software',
    description: 'Empowering organizations to publish consistent, high-trust content across global teams, agencies, and generative AI tools.',
    version: '2026.4-LTS',
    voiceAttributes: {
      tone: ['Authoritative', 'Empathetic', 'Forward-Looking', 'Clarity-First', 'Transparent'],
      avoid: ['Hyperbole', 'Aggressive Hype', 'Patronizing Slang', 'Unsubstantiated Absolutes', 'Robotic Jargon'],
      targetAudience: 'Chief Marketing Officers, Brand Directors, Enterprise Legal Counsel, Content Operations Leads'
    },
    rules: [
      {
        id: 'RULE-TONE-01',
        pillar: 'tone',
        title: 'Avoid Unsubstantiated Superlatives & Hype',
        summary: 'Never use empty marketing buzzwords such as "100% foolproof", "revolutionary", "literally magic", or "game-changing".',
        sourceText: 'Inkloom Global Voice Guidelines Section 2.1: "Our brand builds trust through measured, verifiable precision. We let our architectural metrics speak for themselves rather than resorting to sensationalist hyperbole."',
        severity: 'critical',
        frictionCount: 28
      },
      {
        id: 'RULE-TONE-02',
        pillar: 'tone',
        title: 'Empowering, Collaborative Demeanor',
        summary: 'Position AI as an assistant to human ingenuity, not a replacement that eliminates human roles.',
        sourceText: 'Inkloom Ethical AI Principles Section 1.4: "We never claim to eliminate human talent or render creators obsolete. Inkloom AI augments human judgment; humans retain editorial control."',
        severity: 'warning',
        frictionCount: 14
      },
      {
        id: 'RULE-TERM-01',
        pillar: 'terminology',
        title: 'Approved Nomenclature for BrandForge Engine',
        summary: 'Refer to our system as "BrandForge platform" or "intelligent brand-governance engine", never as a "cheap tool" or "simple bot".',
        sourceText: 'Inkloom Trademark & Product Nomenclature Guide Section 3: "BrandForge is an enterprise-grade governance platform. Demeaning references like \'our bot\' or \'cheap tool\' diminish perceived enterprise value."',
        severity: 'critical',
        frictionCount: 35
      },
      {
        id: 'RULE-TERM-02',
        pillar: 'terminology',
        title: 'Prohibited Reliability Claims ("Bulletproof" / "Unbreakable")',
        summary: 'Engineering terminology must reflect statistical probability ("resilient", "fault-tolerant") rather than impossible absolutes.',
        sourceText: 'Inkloom Engineering Communications Policy Section 4: "Software is never \'bulletproof\' or \'infallible\'. Use \'resilient and battle-tested\' or \'statistically verified 99.4% precision\'."',
        severity: 'warning',
        frictionCount: 19
      },
      {
        id: 'RULE-CLAIM-01',
        pillar: 'claim',
        title: 'Substantiation Required for Performance & ROI Figures',
        summary: 'Any statistical claim or monetary savings figure must be backed by an approved fact in the Brand Vault.',
        sourceText: 'Inkloom Legal & Compliance Charter Section 7.2: "All numerical assertions (e.g. user counts, cost savings, latency metrics) must map to an active verified source in the approved claims repository."',
        severity: 'critical',
        frictionCount: 42
      },
      {
        id: 'RULE-CLAIM-02',
        pillar: 'claim',
        title: 'Mandatory ISO Certification Reference',
        summary: 'When discussing enterprise data privacy and security, reference ISO/IEC 27001:2022 and our zero-retention policy.',
        sourceText: 'Inkloom Security Whitepaper: "Enterprise buyers require explicit assurance that draft content is never retained or used to train public foundation models."',
        severity: 'suggestion',
        frictionCount: 9
      },
      {
        id: 'RULE-ACCESS-01',
        pillar: 'accessibility',
        title: 'Readability & Jargon Density',
        summary: 'Keep readability grade level between 8th and 11th grade (Flesch-Kincaid) for general public releases.',
        sourceText: 'Inkloom Accessibility & Inclusive Communications Standard: "Complex multi-clause sentences with dense passive voice alienate non-native English enterprise buyers."',
        severity: 'suggestion',
        frictionCount: 22
      },
      {
        id: 'RULE-VISUAL-01',
        pillar: 'visual',
        title: 'WCAG 2.1 AA Contrast Ratio Minimum',
        summary: 'All text over background colors or imagery must meet a minimum contrast ratio of 4.5:1 (3:1 for large display headers).',
        sourceText: 'Inkloom Visual Identity System Section 5.3: "Ensure maximum legibility across mobile devices, high-glare environments, and assistive display readers."',
        severity: 'critical',
        frictionCount: 16
      }
    ],
    forbiddenTerms: [
      {
        id: 'TERM-01',
        term: 'bulletproof',
        category: 'hyperbole',
        reason: 'Misleading absolute claim; violates legal advertising guidelines.',
        suggestedReplacement: 'resilient and battle-tested',
        guidelineRuleId: 'RULE-TERM-02'
      },
      {
        id: 'TERM-02',
        term: 'foolproof',
        category: 'hyperbole',
        reason: 'Implies impossibility of error; patronizing tone.',
        suggestedReplacement: 'rigorously validated',
        guidelineRuleId: 'RULE-TONE-01'
      },
      {
        id: 'TERM-03',
        term: 'cheap tool',
        category: 'deprecated',
        reason: 'Diminishes enterprise brand equity; implies low quality.',
        suggestedReplacement: 'cost-effective enterprise platform',
        guidelineRuleId: 'RULE-TERM-01'
      },
      {
        id: 'TERM-04',
        term: 'AI bot',
        category: 'deprecated',
        reason: 'Associated with low-tier conversational spam; inaccurate.',
        suggestedReplacement: 'intelligent brand-governance engine',
        guidelineRuleId: 'RULE-TERM-01'
      },
      {
        id: 'TERM-05',
        term: 'guarantees 100% success',
        category: 'prohibited',
        reason: 'Unsubstantiated promissory guarantee creating severe legal exposure.',
        suggestedReplacement: 'delivers statistically verified 99.4% precision',
        guidelineRuleId: 'RULE-CLAIM-01'
      },
      {
        id: 'TERM-06',
        term: 'eliminates human',
        category: 'prohibited',
        reason: 'Contradicts our core value of augmenting human creativity and oversight.',
        suggestedReplacement: 'empowers human creators and reviewers',
        guidelineRuleId: 'RULE-TONE-02'
      },
      {
        id: 'TERM-07',
        term: 'literally magic',
        category: 'hyperbole',
        reason: 'Unprofessional hyperbole; degrades technical authority.',
        suggestedReplacement: 'seamlessly automated',
        guidelineRuleId: 'RULE-TONE-01'
      },
      {
        id: 'TERM-08',
        term: '100 billion dollars',
        category: 'prohibited',
        reason: 'Fabricated unverified financial metric not in Approved Facts repository.',
        suggestedReplacement: 'measured 85% editorial turnaround acceleration',
        guidelineRuleId: 'RULE-CLAIM-01'
      }
    ],
    approvedFacts: [
      {
        id: 'FACT-01',
        claim: 'Inkloom AI evaluates over 45 million brand governance checks monthly across 1,200+ enterprise teams.',
        category: 'Usage & Scale',
        source: 'Inkloom Q4 Operations Telemetry Report 2026',
        dateVerified: '2026-09-15',
        confidence: 0.99
      },
      {
        id: 'FACT-02',
        claim: 'ISO/IEC 27001:2022 certified with zero data retention for draft enterprise content.',
        category: 'Security & Compliance',
        source: 'BSI Audit Certificate #IS-992014',
        dateVerified: '2026-08-01',
        confidence: 1.0
      },
      {
        id: 'FACT-03',
        claim: 'Delivers 99.4% precision in guideline compliance checks backed by verified deterministic heuristics.',
        category: 'AI Performance',
        source: 'Stanford HAI Brand Governance Evaluation Benchmark 2026',
        dateVerified: '2026-07-20',
        confidence: 0.98
      },
      {
        id: 'FACT-04',
        claim: 'Reduces manual marketing review turnaround cycles from 4.8 business days to under 4 hours.',
        category: 'Productivity Impact',
        source: 'Forrester Total Economic Impact Study for Inkloom AI',
        dateVerified: '2026-09-01',
        confidence: 0.96
      }
    ],
    colors: [
      { id: 'C-01', name: 'Inkloom Indigo', hex: '#6366F1', usage: 'Primary Brand & CTAs', minContrastRatio: 4.5 },
      { id: 'C-02', name: 'Emerald Trust', hex: '#10B981', usage: 'Compliance & Verification Badges', minContrastRatio: 4.5 },
      { id: 'C-03', name: 'Obsidian Slate', hex: '#0F172A', usage: 'Dark Mode Background Canvas', minContrastRatio: 7.0 },
      { id: 'C-04', name: 'Surface Slate', hex: '#1E293B', usage: 'Container & Card Backgrounds', minContrastRatio: 4.5 },
      { id: 'C-05', name: 'Amber Alert', hex: '#F59E0B', usage: 'Governance Warnings', minContrastRatio: 4.5 },
      { id: 'C-06', name: 'Crimson Blocker', hex: '#F43F5E', usage: 'Critical Policy Violations', minContrastRatio: 4.5 }
    ]
  },
  {
    id: 'aegis-financial',
    name: 'Aegis Financial Health',
    tagline: 'Precision Banking and Capital Governance',
    industry: 'Regulated FinTech & Wealth Management',
    description: 'Strict regulatory posture with mandatory SEC/FINRA disclosures, conservative tonal guidelines, and strict claim substantiation.',
    version: '2026.1-REG',
    voiceAttributes: {
      tone: ['Conservative', 'Fiduciary', 'Objective', 'Reassuring', 'Transparent'],
      avoid: ['Promissory Guarantees', 'Casual Slang', 'FOMO Language', 'Speculative Growth Forecasts'],
      targetAudience: 'Institutional Investors, High Net Worth Individuals, Compliance Auditors'
    },
    rules: [
      {
        id: 'AEGIS-RULE-01',
        pillar: 'claim',
        title: 'Strict Prohibition on Financial Guarantees',
        summary: 'Never promise guaranteed returns, risk-free yields, or certain profits.',
        sourceText: 'SEC Compliance Policy Rule 156: Unsubstantiated performance projections are strictly illegal under securities law.',
        severity: 'critical',
        frictionCount: 31
      }
    ],
    forbiddenTerms: [
      {
        id: 'AEGIS-TERM-01',
        term: 'guaranteed returns',
        category: 'prohibited',
        reason: 'Illegal promissory language under FINRA Rule 2210.',
        suggestedReplacement: 'historical risk-adjusted yields',
        guidelineRuleId: 'AEGIS-RULE-01'
      }
    ],
    approvedFacts: [
      {
        id: 'AEGIS-FACT-01',
        claim: 'Aegis safeguards over $14.2 Billion in regulated assets with multi-signature cold storage.',
        category: 'Financial Assets',
        source: 'PwC Independent Audit Report FY25',
        dateVerified: '2026-06-30',
        confidence: 1.0
      }
    ],
    colors: [
      { id: 'AF-01', name: 'Navy Trust', hex: '#0A2540', usage: 'Brand Identity', minContrastRatio: 7.0 },
      { id: 'AF-02', name: 'Gold Capital', hex: '#D4AF37', usage: 'Accents & Milestones', minContrastRatio: 4.5 }
    ]
  }
];

export const sampleContentDrafts: ContentItem[] = [
  {
    id: 'draft-01',
    title: 'Product Launch Announcement: BrandForge 2.0',
    format: 'press_release',
    channel: 'press',
    rawText: `Inkloom AI today announced its completely foolproof and bulletproof AI bot that guarantees 100% success for all marketing teams. 

Our cheap tool eliminates every single competitor in the market with zero risk. Independent tests show 100 billion dollars in savings across early pilot customers.

With this release, creators no longer need human managers or editorial review. Our bot is literally magic and will 10x your growth overnight without any effort!`,
    author: {
      name: 'Alex Rivera',
      role: 'creator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
    },
    status: 'draft',
    complianceScore: 42,
    findings: [],
    comments: [
      {
        id: 'comm-1',
        authorName: 'Marcus Vance',
        authorRole: 'brand_manager',
        text: 'Alex, this draft contains several severe compliance red flags. The legal department will reject "guarantees 100% success" immediately. Please check against our Approved Facts in the Brand Vault.',
        timestamp: '10 mins ago',
        resolved: false
      }
    ],
    revisions: [
      {
        version: 1,
        timestamp: '2 hours ago',
        author: 'Alex Rivera',
        role: 'creator',
        summary: 'Initial draft submitted for pre-publication brand check',
        contentSnapshot: 'Inkloom AI today announced its completely foolproof and bulletproof AI bot...'
      }
    ],
    createdAt: '2026-10-26T18:00:00Z',
    updatedAt: '2026-10-26T20:15:00Z'
  },
  {
    id: 'draft-02',
    title: 'Executive Thought Leadership LinkedIn Post',
    format: 'social_post',
    channel: 'linkedin',
    rawText: `Excited to unveil how Inkloom AI is transforming enterprise brand governance! 

Traditional review cycles take 4.8 days and cost organizations up to 23% in brand equity dilution. BrandForge delivers 99.4% precision in guideline compliance checks backed by verified deterministic heuristics.

By augmenting creators with real-time explainability, we help organizations protect brand trust without slowing down content velocity.`,
    author: {
      name: 'Elena Rostova',
      role: 'brand_manager',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces'
    },
    status: 'approved',
    complianceScore: 98,
    findings: [],
    comments: [
      {
        id: 'comm-2',
        authorName: 'Sarah Jenkins',
        authorRole: 'legal_compliance',
        text: 'All statistics verified against Forrester TEI and Stanford HAI benchmark reports. Cleared for publication.',
        timestamp: '30 mins ago',
        resolved: true
      }
    ],
    revisions: [
      {
        version: 1,
        timestamp: 'Yesterday',
        author: 'Elena Rostova',
        role: 'brand_manager',
        summary: 'Incorporated verified Forrester and Stanford metrics',
        contentSnapshot: 'Excited to unveil how Inkloom AI is transforming enterprise brand governance...'
      }
    ],
    certificate: {
      certificateId: 'CERT-INKLOOM-2026-99482',
      sha256Hash: 'a8b79e2c4f1d39e8027b49463cba5e91f6d72491b9c8e1e770f3f2d658b9a114',
      documentTitle: 'Executive Thought Leadership LinkedIn Post',
      approvedBy: 'Sarah Jenkins (Esq.)',
      approverRole: 'legal_compliance',
      timestamp: '2026-10-26T21:40:00Z',
      brandVaultVersion: '2026.4-LTS',
      rulesEvaluatedCount: 8,
      complianceScore: 98,
      isImmutable: true
    },
    createdAt: '2026-10-25T14:30:00Z',
    updatedAt: '2026-10-26T21:40:00Z'
  },
  {
    id: 'draft-03',
    title: 'Brand Hero Promotional Banner Graphic',
    format: 'visual_asset',
    channel: 'website',
    rawText: 'Inkloom AI: Enterprise Brand Governance Built for Scale. Review text, assets, and claims with verified AI and human-in-the-loop control.',
    author: {
      name: 'Liam Chen',
      role: 'creator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
    },
    status: 'in_review',
    complianceScore: 84,
    findings: [],
    comments: [],
    revisions: [
      {
        version: 1,
        timestamp: '1 hour ago',
        author: 'Liam Chen',
        role: 'creator',
        summary: 'Visual banner graphic asset uploaded for WCAG contrast and safe-zone audit',
        contentSnapshot: 'Banner visual'
      }
    ],
    imageAsset: {
      url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=630&fit=crop',
      altText: 'Inkloom AI brand governance dashboard preview on laptop display with team analytics',
      foregroundHex: '#FFFFFF',
      backgroundHex: '#0F172A',
      contrastRatio: 16.1,
      wcagRating: 'AAA',
      hasLogoSafeZone: true
    },
    createdAt: '2026-10-26T19:30:00Z',
    updatedAt: '2026-10-26T20:00:00Z'
  }
];

export const mockAnalyticsData = {
  healthIndex: 94,
  totalAuditsThisMonth: 12480,
  preventedHighRiskViolations: 432,
  avgReviewTurnaroundHours: 3.4,
  turnaroundReductionPercent: 86,
  repeatedMistakesByCategory: [
    { category: 'Unsupported Claims & Metrics', count: 184, percentage: 38, color: '#F43F5E' },
    { category: 'Prohibited & Deprecated Terms', count: 122, percentage: 25, color: '#F59E0B' },
    { category: 'Tone Hyperbole & Hype', count: 96, percentage: 20, color: '#6366F1' },
    { category: 'WCAG Contrast & Alt-Text', count: 52, percentage: 11, color: '#10B981' },
    { category: 'Messaging Positioning Drift', count: 28, percentage: 6, color: '#8B5CF6' }
  ],
  frictionRadar: [
    {
      ruleId: 'RULE-CLAIM-01',
      ruleTitle: 'Substantiation Required for Performance & ROI Figures',
      frictionScore: 88,
      status: 'High Ambiguity',
      recommendation: 'Creators frequently lack easy access to newly verified Q3 metrics. Add a one-click "Insert Approved Fact" shortcut.'
    },
    {
      ruleId: 'RULE-TERM-01',
      ruleTitle: 'Approved Nomenclature for BrandForge Engine',
      frictionScore: 72,
      status: 'Moderate Confusion',
      recommendation: 'Agencies still refer to "our bot". Distribute updated nomenclature flashcard to external agency partners.'
    },
    {
      ruleId: 'RULE-TONE-01',
      ruleTitle: 'Avoid Unsubstantiated Superlatives & Hype',
      frictionScore: 56,
      status: 'Healthy Compliance',
      recommendation: 'Creators understand this well; continue reinforcing in-editor context suggestions.'
    },
    {
      ruleId: 'RULE-VISUAL-01',
      ruleTitle: 'WCAG 2.1 AA Contrast Ratio Minimum',
      frictionScore: 34,
      status: 'Clear & Enforced',
      recommendation: 'Automated color picker has eliminated manual contrast confusion.'
    }
  ],
  departmentCompliance: [
    { department: 'Product Marketing', score: 96, auditsCount: 420 },
    { department: 'Growth & Social Ops', score: 87, auditsCount: 840 },
    { department: 'PR Agency Partners', score: 79, auditsCount: 310 },
    { department: 'Developer Relations', score: 93, auditsCount: 260 }
  ]
};
