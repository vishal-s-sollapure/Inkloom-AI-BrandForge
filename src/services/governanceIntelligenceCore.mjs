/**
 * BrandForge — Governance Intelligence & Policy Friction Radar Engine
 * Core analytical algorithms for compliance metrics, recurring violation detection,
 * review efficiency bottlenecks, and empirical guideline friction diagnosis.
 *
 * Designed to evaluate authentic organization data without mock contamination.
 */

// Known qualitative words that lack operational criteria and cause review friction
export const AMBIGUOUS_QUALITATIVE_TERMS = [
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

/**
 * Strict status normalizer matching the PostgreSQL enum
 */
export function normalizeCampaignStatus(status) {
  if (!status) return 'drafting';
  const s = String(status).toLowerCase().trim();
  if (s === 'in_review' || s === 'review' || s === 'submitted') return 'in_review';
  if (s === 'changes_requested' || s === 'rejected') return 'changes_requested';
  if (s === 'brand_approved' || s === 'approved') return 'brand_approved';
  if (s === 'legally_cleared' || s === 'cleared') return 'legally_cleared';
  return 'drafting';
}

/**
 * Filter campaigns by time range window
 */
export function filterCampaignsByDate(campaigns, dateFilter = 'all') {
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

/**
 * Compute primary governance metrics from authentic campaign records
 */
export function analyzeGovernanceMetrics(campaigns = [], dateFilter = 'all') {
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

  // Compliance rate: percentage of resolved campaigns that reached approval or legal clearance
  const completedCount = brandApprovedCount + legallyClearedCount + changesRequestedCount;
  const compliantCount = brandApprovedCount + legallyClearedCount;
  const complianceRate = completedCount > 0 ? Math.round((compliantCount / completedCount) * 100) : null;

  // Most frequently violated rule
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

/**
 * Categorize findings into standardized brand governance dimensions
 */
export function categorizeFindingType(finding) {
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

/**
 * Detect recurring violations and brand drift patterns across campaigns
 */
export function detectRecurringViolations(campaigns = []) {
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

/**
 * Compute review turnaround time, pending ages, and bottleneck diagnostics
 */
export function computeReviewEfficiency(campaigns = [], auditEvents = []) {
  if (!Array.isArray(campaigns) || campaigns.length === 0) {
    return {
      hasTurnaroundData: false,
      averageTurnaroundHours: null,
      averageTurnaroundFormatted: 'No completed reviews',
      pendingQueueAgeHours: null,
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
        // Awaiting legal clearance
        pendingAgesMs.push(Math.max(0, now - createdAt));
      }
    }

    // Measure completed turnaround if updated_at or signoff timestamp exists
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

  // Bottleneck detection logic
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

/**
 * Policy Friction Radar:
 * Scans active brand guidelines for ambiguous qualitative terms, potential contradictory rules,
 * and high-disagreement empirical review blockers.
 */
export function runPolicyFrictionRadar(guidelines = {}, campaigns = []) {
  const frictionFindings = [];
  let findingCounter = 1;

  const voiceText = String(guidelines.brandVoice || '');
  const accessText = String(guidelines.accessibilityRules || '');
  const visualText = String(guidelines.visualRules || '');
  const avoidTerms = Array.isArray(guidelines.avoidTerms) ? guidelines.avoidTerms : [];
  const prefTerms = Array.isArray(guidelines.preferredTerms) ? guidelines.preferredTerms : [];
  const claims = Array.isArray(guidelines.verificationClaims) ? guidelines.verificationClaims : [];

  // 1. Scan for Ambiguous & Subjective Terms across guideline text fields
  const sectionsToScan = [
    { name: 'Brand Voice & Demeanor', text: voiceText },
    { name: 'Accessibility & Readability', text: accessText },
    { name: 'Visual Identity Standards', text: visualText }
  ];

  AMBIGUOUS_QUALITATIVE_TERMS.forEach(dict => {
    sectionsToScan.forEach(sec => {
      const regex = new RegExp(`\\b${dict.word}\\b`, 'i');
      if (regex.test(sec.text)) {
        // Extract surrounding sentence
        const sentences = sec.text.split(/(?<=[.!?])\s+/);
        const matchedSentence = sentences.find(s => regex.test(s)) || sec.text;

        frictionFindings.push({
          id: `friction-vague-${findingCounter++}`,
          frictionType: 'Subjective Ambiguity (Text-Based)',
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

  // 2. Scan for Contradictory Rules
  // Brevity vs Extensive Disclosures conflict
  const brevityMatch = accessText.match(/(\d+)\s*words/i);
  const sentenceLimit = brevityMatch ? parseInt(brevityMatch[1], 10) : 30;
  if (sentenceLimit <= 30 && claims.length >= 4) {
    frictionFindings.push({
      id: `friction-conflict-${findingCounter++}`,
      frictionType: 'Potential Rule Contradiction',
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

  // Duplicate / Overlapping Term Check
  avoidTerms.forEach(at => {
    const term = typeof at === 'string' ? at : (at.term || '');
    if (prefTerms.some(pt => pt.toLowerCase() === term.toLowerCase())) {
      frictionFindings.push({
        id: `friction-dup-${findingCounter++}`,
        frictionType: 'Conflicting Terminology Rule',
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

  // 3. Scan for Empirical Review Disagreements from Campaign History
  const recurring = detectRecurringViolations(campaigns);
  recurring.forEach(rec => {
    if (rec.totalCount >= 2 && rec.affectedCampaignCount >= 2) {
      frictionFindings.push({
        id: `friction-empirical-${findingCounter++}`,
        frictionType: 'High Disagreement Rate (Empirical Pattern)',
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

/**
 * Generate actionable, prioritized governance recommendations
 */
export function generateGovernanceRecommendations(metrics = {}, recurring = [], frictionOrEfficiency = [], maybeFriction = []) {
  // Support both (metrics, recurring, friction) and (metrics, recurring, efficiency, friction)
  const friction = Array.isArray(frictionOrEfficiency) ? frictionOrEfficiency : (Array.isArray(maybeFriction) ? maybeFriction : []);
  const recommendations = [];
  let recCounter = 1;

  // 1. Recommendations based on Empirical Recurring Violations
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

  // 2. Recommendations based on Policy Friction Radar
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

  // 3. Recommendations based on Workflow Efficiency
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

  // Fallback recommendation if workspace is brand new or clean
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

/**
 * Format governance intelligence report as structured Markdown or JSON
 */
export function generateGovernanceReport(metricsOrCampaigns, recurringOrGuidelines, efficiencyOrFormat, friction, recommendations, format = 'markdown') {
  let metrics, recurring, efficiency, frictionFindings, recs, fmt;

  // Support both (metrics, recurring, efficiency, friction, recommendations, format)
  // and convenient shorthand (campaigns, guidelines, { format: 'markdown' })
  if (Array.isArray(metricsOrCampaigns)) {
    const campaigns = metricsOrCampaigns;
    const guidelines = recurringOrGuidelines || {};
    metrics = analyzeGovernanceMetrics(campaigns);
    recurring = detectRecurringViolations(campaigns);
    efficiency = computeReviewEfficiency(campaigns);
    frictionFindings = runPolicyFrictionRadar(guidelines, campaigns);
    recs = generateGovernanceRecommendations(metrics, recurring, efficiency, frictionFindings);
    fmt = (efficiencyOrFormat && typeof efficiencyOrFormat === 'object' && efficiencyOrFormat.format) || (typeof efficiencyOrFormat === 'string' ? efficiencyOrFormat : 'markdown');
  } else {
    metrics = metricsOrCampaigns || {};
    recurring = recurringOrGuidelines || [];
    efficiency = efficiencyOrFormat || {};
    frictionFindings = friction || [];
    recs = recommendations || [];
    fmt = format || 'markdown';
  }

  if (fmt === 'json') {
    return JSON.stringify({
      generatedAt: new Date().toISOString(),
      platform: 'BrandForge Intelligent Brand Governance',
      metrics,
      recurringViolations: recurring,
      reviewEfficiency: efficiency,
      policyFrictionRadar: frictionFindings,
      recommendations: recs
    }, null, 2);
  }

  const bottleneckMessage = (efficiency.bottleneck && efficiency.bottleneck.message) || 'No workflow bottlenecks detected.';
  const bottleneckSeverity = (efficiency.bottleneck && efficiency.bottleneck.severity) ? efficiency.bottleneck.severity.toUpperCase() : 'NORMAL';

  const lines = [
    `# BrandForge Governance Intelligence & Policy Friction Report`,
    `**Generated:** ${new Date().toLocaleString()}`,
    `**Platform:** BrandForge Multi-Role Governance Engine (Codex 48 Round 3)`,
    ``,
    `## 1. Executive Summary & Governance KPIs`,
    `- **Total Campaigns Evaluated:** ${metrics.totalCampaigns || 0}`,
    `- **Overall Compliance Rate:** ${metrics.complianceRate !== null && metrics.complianceRate !== undefined ? metrics.complianceRate + '%' : 'Pending Review'}`,
    `- **Awaiting Brand Review:** ${metrics.inReviewCount || 0}`,
    `- **Brand Approved:** ${metrics.brandApprovedCount || 0}`,
    `- **Legally Cleared (Sealed):** ${metrics.legallyClearedCount || 0}`,
    `- **Changes Requested:** ${metrics.changesRequestedCount || 0}`,
    `- **Total Policy Violations Detected:** ${metrics.totalViolations || 0} (${metrics.highSeverityViolations || 0} High Severity)`,
    `- **Average Review Turnaround Time:** ${efficiency.averageTurnaroundFormatted || 'N/A'}`,
    ``,
    `## 2. Review Pipeline & Bottleneck Radar`,
    `- **Bottleneck Status:** ${bottleneckMessage} [${bottleneckSeverity}]`,
    `- **Average Pending Queue Age:** ${efficiency.pendingQueueAgeHours !== null && efficiency.pendingQueueAgeHours !== undefined ? efficiency.pendingQueueAgeHours + ' hours' : 'N/A'}`,
    ``,
    `## 3. Recurring Brand Violations (Top Drift Areas)`,
    recurring.length === 0 ? `*No recurring violations detected across evaluated campaigns.*` :
      recurring.slice(0, 5).map((r, i) =>
        `${i + 1}. **${r.ruleTitle || r.ruleName}** (${r.category || 'General'})\n   - Frequency: ${r.totalCount || r.occurrences || 1}x across ${r.affectedCampaignCount || 1} campaign(s)\n   - Severity: ${r.highSeverityCount || 0} High, ${r.mediumSeverityCount || 0} Medium\n   - Section: ${r.guidelineSection || 'Brand Policy'}`
      ).join('\n'),
    ``,
    `## 4. Policy Friction Radar (Guideline Ambiguity & Conflicts)`,
    frictionFindings.length === 0 ? `*Zero policy friction or contradictory guidelines identified.*` :
      frictionFindings.map((f, i) =>
        `### ${i + 1}. [${f.frictionType || f.severity || 'Friction'}] ${f.guidelineSection || f.title}\n` +
        `- **Quoted Text:** *"${f.quotedGuideline || f.issue}"*\n` +
        `- **Ambiguity / Conflict:** ${f.ambiguityAnalysis || f.recommendation}\n` +
        `- **Proposed Objective Rewrite:** *"${f.proposedRewrite}"*`
      ).join('\n\n'),
    ``,
    `## 5. Prioritized Governance Recommendations`,
    recs.length === 0 ? `*All active governance policies performing within target thresholds.*` :
      recs.map((r, i) =>
        `### ${i + 1}. [Priority ${r.priority}] ${r.title}\n` +
        `- **Action:** ${r.action}\n` +
        `- **Target Stakeholder:** ${r.targetRole}\n` +
        `- **Expected Impact:** ${r.expectedImpact}`
      ).join('\n\n')
  ];

  return lines.join('\n');
}

