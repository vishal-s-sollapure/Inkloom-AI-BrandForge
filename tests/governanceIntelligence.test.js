/**
 * BrandForge — Governance Intelligence & Policy Friction Radar Test Suite
 * Validates analytical calculations, recurring violation detection, review efficiency,
 * policy ambiguity/conflict scanning, and non-destructive recommendation generation.
 */

import assert from 'node:assert';
import {
  normalizeCampaignStatus,
  filterCampaignsByDate,
  analyzeGovernanceMetrics,
  detectRecurringViolations,
  computeReviewEfficiency,
  runPolicyFrictionRadar,
  generateGovernanceRecommendations,
  generateGovernanceReport
} from '../src/services/governanceIntelligenceCore.mjs';

let passedTests = 0;
let failedTests = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${testName}`);
    console.error(`       Error: ${err.message}`);
    failedTests++;
  }
}

console.log('--- BrandForge Governance Intelligence & Policy Friction Radar Test Suite Execution ---\n');

const MOCK_CAMPAIGNS = [
  {
    id: 'camp-001',
    title: 'Q3 Enterprise Product Newsletter',
    type: 'email_newsletter',
    status: 'changes_requested',
    workflowStage: 'changes_requested',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    findings: [
      { ruleTitle: 'Avoided Term: "bulletproof"', severity: 'high', type: 'term_avoid', guidelineSection: 'Prohibited Terminology', evidence: 'bulletproof' },
      { ruleTitle: 'Promissory Claim Requiring Verification: "guaranteed"', severity: 'high', type: 'claim_verification', guidelineSection: 'Regulatory Compliance', evidence: 'guaranteed' },
      { ruleTitle: 'Readability: Sentence exceeds 30 words', severity: 'low', type: 'accessibility', guidelineSection: 'Accessibility' }
    ]
  },
  {
    id: 'camp-002',
    title: 'Social Thought Leadership Thread',
    type: 'social_post',
    status: 'brand_approved',
    workflowStage: 'brand_approved',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    brandCustodianSignoff: {
      name: 'Sarah Chen (Brand Custodian)',
      timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString()
    },
    findings: [
      { ruleTitle: 'Avoided Term: "bulletproof"', severity: 'high', type: 'term_avoid', guidelineSection: 'Prohibited Terminology', evidence: 'bulletproof' }
    ]
  },
  {
    id: 'camp-003',
    title: 'Homepage Hero Value Proposition',
    type: 'landing_page',
    status: 'legally_cleared',
    workflowStage: 'legally_cleared',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    legalOfficerSignoff: {
      name: 'David Marcus, Esq. (Legal Counsel)',
      timestamp: new Date(Date.now() - 86400000 * 0.5).toISOString()
    },
    findings: []
  },
  {
    id: 'camp-004',
    title: 'Pending Partner Announcement',
    type: 'press_release',
    status: 'in_review',
    workflowStage: 'in_review',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    findings: [
      { ruleTitle: 'Tone & Voice Mismatch: "total dominance"', severity: 'medium', type: 'tone_style', guidelineSection: 'Brand Voice' }
    ]
  }
];

const TEST_GUIDELINES = {
  brandName: 'Inkloom AI',
  brandVoice: 'Authoritative, modern, appropriate, and professional in every communication touchpoint.',
  preferredTerms: ['BrandForge platform', 'intelligent brand-governance engine'],
  avoidTerms: [
    { term: 'bulletproof', replacement: 'resilient and battle-tested', reason: 'Misleading engineering absolute.' },
    { term: 'cheap tool', replacement: 'cost-effective solution', reason: 'Degrades brand equity.' }
  ],
  verificationClaims: ['best', 'guaranteed', '100% effective', 'zero risk', 'unbreakable'],
  accessibilityRules: 'Keep sentences under 25 words. Ensure inclusive language.',
  visualRules: 'Visual assets must look attractive and clean. Minimum 16px clear space.'
};

// TC-GI-01: Status normalizer maps all inputs to the 5 strict enum values
runTest('TC-GI-01: Status normalizer strictly maps legacy and variant statuses to enum values', () => {
  assert.strictEqual(normalizeCampaignStatus('in_review'), 'in_review');
  assert.strictEqual(normalizeCampaignStatus('review'), 'in_review');
  assert.strictEqual(normalizeCampaignStatus('submitted'), 'in_review');
  assert.strictEqual(normalizeCampaignStatus('brand_approved'), 'brand_approved');
  assert.strictEqual(normalizeCampaignStatus('approved'), 'brand_approved');
  assert.strictEqual(normalizeCampaignStatus('legally_cleared'), 'legally_cleared');
  assert.strictEqual(normalizeCampaignStatus('cleared'), 'legally_cleared');
  assert.strictEqual(normalizeCampaignStatus('changes_requested'), 'changes_requested');
  assert.strictEqual(normalizeCampaignStatus('rejected'), 'changes_requested');
  assert.strictEqual(normalizeCampaignStatus('unknown_status'), 'drafting');
  assert.strictEqual(normalizeCampaignStatus(null), 'drafting');
});

// TC-GI-02: Date range filtering correctly scopes campaign records
runTest('TC-GI-02: Date range filtering scopes records by time window', () => {
  const all = filterCampaignsByDate(MOCK_CAMPAIGNS, 'all');
  assert.strictEqual(all.length, 4);

  const last7d = filterCampaignsByDate(MOCK_CAMPAIGNS, '7d');
  assert.strictEqual(last7d.length, 4);

  const emptyCampaigns = filterCampaignsByDate([], '7d');
  assert.strictEqual(emptyCampaigns.length, 0);
});

// TC-GI-03: Primary governance metrics calculation accurately computes totals and compliance rate
runTest('TC-GI-03: Governance metrics calculates accurate counts and compliance rate', () => {
  const metrics = analyzeGovernanceMetrics(MOCK_CAMPAIGNS, 'all');

  assert.strictEqual(metrics.totalCampaigns, 4);
  assert.strictEqual(metrics.inReviewCount, 1);
  assert.strictEqual(metrics.brandApprovedCount, 1);
  assert.strictEqual(metrics.legallyClearedCount, 1);
  assert.strictEqual(metrics.changesRequestedCount, 1);
  assert.strictEqual(metrics.totalViolations, 5);
  assert.strictEqual(metrics.highSeverityViolations, 3);

  // 2 compliant (brand_approved + legally_cleared) out of 3 resolved (changes_requested + brand_approved + legally_cleared) = 67%
  assert.strictEqual(metrics.complianceRate, 67);
  assert.strictEqual(metrics.topViolatedRule.ruleTitle, 'Avoided Term: "bulletproof"');
  assert.strictEqual(metrics.topViolatedRule.count, 2);
});

// TC-GI-04: Graceful empty state handling when no campaigns exist
runTest('TC-GI-04: Returns meaningful empty states when dataset is empty', () => {
  const metrics = analyzeGovernanceMetrics([], 'all');

  assert.strictEqual(metrics.totalCampaigns, 0);
  assert.strictEqual(metrics.complianceRate, null);
  assert.strictEqual(metrics.topViolatedRule, null);
  assert.strictEqual(metrics.hasSufficientData, false);
});

// TC-GI-05: Recurring violation detector groups and ranks violations by frequency
runTest('TC-GI-05: Recurring violation detector groups and ranks violations', () => {
  const recurring = detectRecurringViolations(MOCK_CAMPAIGNS);

  assert.ok(Array.isArray(recurring));
  assert.strictEqual(recurring.length, 4);

  // Top rule should be "bulletproof" with 2 occurrences across 2 campaigns
  const top = recurring[0];
  assert.strictEqual(top.ruleTitle, 'Avoided Term: "bulletproof"');
  assert.strictEqual(top.totalCount, 2);
  assert.strictEqual(top.affectedCampaignCount, 2);
  assert.strictEqual(top.categoryId, 'term_avoid');
});

// TC-GI-06: Review efficiency calculates turnaround time and pending queue age
runTest('TC-GI-06: Review efficiency accurately computes turnaround and pending queue age', () => {
  const efficiency = computeReviewEfficiency(MOCK_CAMPAIGNS);

  assert.strictEqual(efficiency.hasTurnaroundData, true);
  assert.ok(efficiency.averageTurnaroundHours > 0);
  assert.ok(efficiency.pendingQueueAgeHours > 0);
  assert.strictEqual(efficiency.inReviewCount, 1);
  assert.strictEqual(efficiency.bottleneck.severity, 'normal');
});

// TC-GI-07: Review efficiency flags bottleneck when in_review queue exceeds threshold
runTest('TC-GI-07: Bottleneck detector flags warning when review backlog grows', () => {
  const backlogged = [
    ...MOCK_CAMPAIGNS,
    { id: 'camp-005', status: 'in_review', workflowStage: 'in_review', timestamp: new Date().toISOString() },
    { id: 'camp-006', status: 'in_review', workflowStage: 'in_review', timestamp: new Date().toISOString() }
  ];

  const efficiency = computeReviewEfficiency(backlogged);
  assert.strictEqual(efficiency.inReviewCount, 3);
  assert.strictEqual(efficiency.bottleneck.stage, 'in_review');
  assert.strictEqual(efficiency.bottleneck.severity, 'warning');
  assert.ok(efficiency.bottleneck.message.includes('Brand Custodian Triage Backlog'));
});

// TC-GI-08: Policy Friction Radar detects subjective qualitative terms lacking criteria
runTest('TC-GI-08: Policy Friction Radar detects subjective adjectives ("modern", "appropriate", "professional", "attractive", "clean")', () => {
  const friction = runPolicyFrictionRadar(TEST_GUIDELINES, MOCK_CAMPAIGNS);

  assert.ok(Array.isArray(friction));
  const vagueFindings = friction.filter(f => f.frictionType.includes('Subjective Ambiguity'));

  // Should have detected: 'modern', 'appropriate', 'professional', 'attractive', 'clean'
  assert.ok(vagueFindings.length >= 3, `Expected at least 3 vague findings, got ${vagueFindings.length}`);
  const detectedWords = vagueFindings.map(f => f.detectedWord);
  assert.ok(detectedWords.includes('professional'), 'Should detect "professional"');
  assert.ok(detectedWords.includes('modern'), 'Should detect "modern"');
  assert.ok(detectedWords.includes('appropriate'), 'Should detect "appropriate"');
  assert.ok(detectedWords.includes('attractive'), 'Should detect "attractive"');
  assert.ok(detectedWords.includes('clean'), 'Should detect "clean"');
});

// TC-GI-09: Policy Friction Radar detects contradictory rules between brevity and mandatory legal qualifiers
runTest('TC-GI-09: Policy Friction Radar identifies conflict between sentence limits and legal disclosures', () => {
  const friction = runPolicyFrictionRadar(TEST_GUIDELINES, MOCK_CAMPAIGNS);
  const conflictFindings = friction.filter(f => f.frictionType.includes('Potential Rule Contradiction'));

  assert.ok(conflictFindings.length > 0, 'Must detect sentence brevity vs promissory claim contradiction');
  assert.ok(conflictFindings[0].whyFriction.includes('cannot include legally mandated qualification statements'));
  assert.ok(conflictFindings[0].proposedRuleRewrite.includes('Structured disclaimers'));
});

// TC-GI-10: Policy Friction Radar flags empirical review blockers from real campaign history
runTest('TC-GI-10: Policy Friction Radar flags rules with empirical review disagreement history', () => {
  const friction = runPolicyFrictionRadar(TEST_GUIDELINES, MOCK_CAMPAIGNS);
  const empiricalFindings = friction.filter(f => f.frictionType.includes('High Disagreement Rate'));

  assert.ok(empiricalFindings.length > 0, 'Must flag rules violated across multiple campaigns');
  assert.ok(empiricalFindings[0].detectedWord.includes('bulletproof'));
  assert.ok(empiricalFindings[0].empiricalEvidence.includes('Empirically verified across'));
});

// TC-GI-11: Policy Friction Radar provides actionable, measurable rewrite suggestions
runTest('TC-GI-11: Every friction finding provides a concrete proposed rule rewrite and recommendation', () => {
  const friction = runPolicyFrictionRadar(TEST_GUIDELINES, MOCK_CAMPAIGNS);

  friction.forEach(f => {
    assert.ok(f.recommendation && f.recommendation.length > 10, 'Recommendation must be substantive');
    assert.ok(f.proposedRuleRewrite && f.proposedRuleRewrite.length > 15, 'Proposed rewrite must be actionable');
    assert.ok(f.quotedGuideline, 'Must cite quoted guideline');
    assert.ok(f.whyFriction, 'Must explain why the rule causes friction');
  });
});

// TC-GI-12: Actionable governance recommendations are prioritized by impact
runTest('TC-GI-12: Synthesizes prioritized governance recommendations', () => {
  const metrics = analyzeGovernanceMetrics(MOCK_CAMPAIGNS);
  const recurring = detectRecurringViolations(MOCK_CAMPAIGNS);
  const friction = runPolicyFrictionRadar(TEST_GUIDELINES, MOCK_CAMPAIGNS);

  const recs = generateGovernanceRecommendations(metrics, recurring, friction);

  assert.ok(Array.isArray(recs));
  assert.ok(recs.length > 0);

  const highPriority = recs.filter(r => r.priority === 'high');
  assert.ok(highPriority.length > 0, 'Must generate at least one high priority recommendation');
  assert.ok(highPriority[0].actionItem, 'Must provide an actionable next step');
});

// TC-GI-13: Governance report serializes to clean, valid Markdown and JSON
runTest('TC-GI-13: Serializes comprehensive report to Markdown and JSON formats', () => {
  const metrics = analyzeGovernanceMetrics(MOCK_CAMPAIGNS);
  const recurring = detectRecurringViolations(MOCK_CAMPAIGNS);
  const efficiency = computeReviewEfficiency(MOCK_CAMPAIGNS);
  const friction = runPolicyFrictionRadar(TEST_GUIDELINES, MOCK_CAMPAIGNS);
  const recs = generateGovernanceRecommendations(metrics, recurring, friction);

  const mdReport = generateGovernanceReport(metrics, recurring, efficiency, friction, recs, 'markdown');
  assert.ok(mdReport.includes('# BrandForge Governance Intelligence & Policy Friction Report'));
  assert.ok(mdReport.includes('## 1. Executive Summary & Governance KPIs'));
  assert.ok(mdReport.includes('## 4. Policy Friction Radar'));

  const jsonReport = generateGovernanceReport(metrics, recurring, efficiency, friction, recs, 'json');
  const parsed = JSON.parse(jsonReport);
  assert.strictEqual(parsed.platform, 'BrandForge Intelligent Brand Governance');
  assert.strictEqual(parsed.metrics.totalCampaigns, 4);
});

// TC-GI-14: Guidelines are not destructively modified by the radar engine
runTest('TC-GI-14: Engine is strictly non-destructive and preserves original guidelines object', () => {
  const cloned = JSON.parse(JSON.stringify(TEST_GUIDELINES));
  runPolicyFrictionRadar(cloned, MOCK_CAMPAIGNS);
  assert.deepStrictEqual(cloned, TEST_GUIDELINES, 'Original guidelines object must remain completely untouched');
});

// TC-GI-15: Conflicting duplicate terms detection (term in avoid and preferred lists)
runTest('TC-GI-15: Detects conflicting terms listed in both avoid and preferred lists', () => {
  const contradictoryGuidelines = {
    ...TEST_GUIDELINES,
    preferredTerms: ['bulletproof', 'BrandForge engine'],
    avoidTerms: [{ term: 'bulletproof', replacement: 'resilient' }]
  };

  const friction = runPolicyFrictionRadar(contradictoryGuidelines, []);
  const dupConflict = friction.find(f => f.frictionType === 'Conflicting Terminology Rule');

  assert.ok(dupConflict, 'Must detect duplicate contradictory term');
  assert.strictEqual(dupConflict.detectedWord, 'bulletproof');
});

console.log('========================================');
console.log(`Governance Intelligence Test Summary: ${passedTests} / ${passedTests + failedTests} PASSED`);
console.log('========================================\n');

if (failedTests > 0) {
  process.exit(1);
}
