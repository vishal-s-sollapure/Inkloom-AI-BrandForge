/**
 * BrandForge Automated Test Suite: Evidence-Backed AI Brand Review
 * Tests server-side review engine, schema validation, guideline grounding, and fallback behavior.
 */

import assert from 'node:assert';
import {
  validateInput,
  runDeterministicReview,
  buildGeminiPrompt,
  reviewBrand,
  GEMINI_REVIEW_SCHEMA
} from '../netlify/functions/reviewBrandCore.mjs';

const TEST_GUIDELINES = {
  brandName: 'Inkloom AI',
  brandVoice: 'Authoritative, Empathetic, Forward-Looking, Clear, and Honest',
  preferredTerms: ['BrandForge platform', 'intelligent brand-governance engine'],
  avoidTerms: [
    { term: 'bulletproof', replacement: 'resilient and battle-tested', reason: 'Misleading engineering absolute.' },
    { term: 'foolproof', replacement: 'rigorously validated', reason: 'Patronizing tone.' },
    { term: 'cheap tool', replacement: 'cost-effective enterprise platform', reason: 'Degrades brand equity.' }
  ],
  approvedFacts: [
    'Inkloom AI evaluates draft marketing copy using deterministic brand rule matching.',
    'Operates client-side with a strict zero-retention policy.'
  ],
  verificationClaims: ['guaranteed', '100% success', '100 billion dollars', 'zero risk'],
  accessibilityRules: 'Keep sentences under 30 words.',
  visualRules: 'Headings must use Title Case.'
};

let passedCount = 0;
let failedCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    failedCount++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    failedCount++;
  }
}

console.log('\n--- BrandForge AI Review Engine Test Suite Execution ---\n');

// TC-AI-01: Validation boundaries
runTest('TC-AI-01: Input validation rejects empty title, title > 120 chars, and brief content', () => {
  const emptyTitle = validateInput('', 'Valid marketing draft with sufficient words.');
  assert.strictEqual(emptyTitle.isValid, false);
  assert.ok(emptyTitle.errors[0].includes('Content title is required'));

  const longTitle = validateInput('A'.repeat(125), 'Valid draft content for checking.');
  assert.strictEqual(longTitle.isValid, false);
  assert.ok(longTitle.errors[0].includes('exceeds 120 characters'));

  const shortContent = validateInput('Valid Title', 'Too brief');
  assert.strictEqual(shortContent.isValid, false);
  assert.ok(shortContent.errors[0].includes('minimum 4 words required'));

  const valid = validateInput('Enterprise Announcement', 'This is a valid compliant draft with enough words.');
  assert.strictEqual(valid.isValid, true);
  assert.strictEqual(valid.errors.length, 0);
});

// TC-AI-02: Grounding prompt assembly
runTest('TC-AI-02: Grounding prompt ingests active guidelines, avoided terms, and facts', () => {
  const { systemInstruction, userPrompt } = buildGeminiPrompt(
    'Q3 Launch',
    'press_release',
    'Sample marketing copy text.',
    TEST_GUIDELINES
  );

  assert.ok(systemInstruction.includes('Inkloom AI'), 'Must include brand name');
  assert.ok(systemInstruction.includes('bulletproof'), 'Must include avoided terms');
  assert.ok(systemInstruction.includes('zero-retention policy'), 'Must include approved facts');
  assert.ok(systemInstruction.includes('SEPARATE CLAIMS FROM VIOLATIONS'), 'Must instruct claim separation');
  assert.ok(userPrompt.includes('Q3 Launch'));
  assert.ok(userPrompt.includes('Sample marketing copy text.'));
});

// TC-AI-03: Structured JSON schema definition integrity
runTest('TC-AI-03: GEMINI_REVIEW_SCHEMA enforces required findings and suggested revision keys', () => {
  assert.strictEqual(GEMINI_REVIEW_SCHEMA.type, 'object');
  assert.ok(GEMINI_REVIEW_SCHEMA.required.includes('complianceScore'));
  assert.ok(GEMINI_REVIEW_SCHEMA.required.includes('findings'));
  assert.ok(GEMINI_REVIEW_SCHEMA.required.includes('suggestedRevision'));

  const findingProps = GEMINI_REVIEW_SCHEMA.properties.findings.items.properties;
  assert.ok(findingProps.findingId);
  assert.ok(findingProps.guidelineSection);
  assert.ok(findingProps.ruleCitation);
  assert.ok(findingProps.isVerificationNeeded);
  assert.ok(findingProps.confidence);
});

// TC-AI-04: Claim verification tagging (distinguishing unverified claims from policy violations)
runTest('TC-AI-04: Deterministic fallback separates factual claims requiring evidence from violations', () => {
  const draftWithClaim = 'Inkloom AI guarantees 100% success with zero risk for all enterprise users.';
  const review = runDeterministicReview(draftWithClaim, TEST_GUIDELINES);

  const factualClaims = review.findings.filter(f => f.isVerificationNeeded);
  const brandViolations = review.findings.filter(f => !f.isVerificationNeeded);

  assert.ok(factualClaims.length > 0, 'Must detect claims requiring evidence');
  assert.strictEqual(factualClaims[0].type, 'claim_verification');
  assert.strictEqual(factualClaims[0].guidelineSection, 'Factual Claims & Verification');
  assert.strictEqual(factualClaims[0].isVerificationNeeded, true);
  assert.ok(review.claimsRequiringEvidenceCount > 0);
});

// TC-AI-05: Prohibited terminology detection
runTest('TC-AI-05: Flags prohibited terminology with exact replacement and high severity', () => {
  const draft = 'Our bulletproof architecture eliminates downtime.';
  const review = runDeterministicReview(draft, TEST_GUIDELINES);

  const termFinding = review.findings.find(f => f.evidence.toLowerCase() === 'bulletproof');
  assert.ok(termFinding, 'Must flag "bulletproof"');
  assert.strictEqual(termFinding.severity, 'high');
  assert.strictEqual(termFinding.isVerificationNeeded, false);
  assert.strictEqual(termFinding.suggestedReplacement, 'resilient and battle-tested');
  assert.strictEqual(termFinding.guidelineSection, 'Prohibited Terminology');
});

// TC-AI-06: Context-preserving revision synthesis
runTest('TC-AI-06: Suggested revision substitutes avoided terms and preserves grammar', () => {
  const draft = 'Our bulletproof software is a cheap tool that delivers results.';
  const review = runDeterministicReview(draft, TEST_GUIDELINES);

  assert.ok(!review.suggestedRevision.includes('bulletproof'), 'Must not contain avoided term');
  assert.ok(!review.suggestedRevision.includes('cheap tool'), 'Must not contain cheap tool');
  assert.ok(review.suggestedRevision.includes('resilient and battle-tested'));
  assert.ok(review.suggestedRevision.includes('cost-effective enterprise platform'));
});

// TC-AI-07: Heuristic compliance score floor
runTest('TC-AI-07: Heuristic score deducts by severity and respects minimum floor of 10', () => {
  // Heavy violations
  const heavyViolations = 'bulletproof foolproof cheap tool zero risk literally magic total dominance';
  const review = runDeterministicReview(heavyViolations, TEST_GUIDELINES);
  assert.ok(review.complianceScore >= 10, 'Score must never drop below floor 10');

  // Compliant draft
  const cleanDraft = 'Inkloom AI evaluates draft marketing copy using systematic guideline verification with human confirmation.';
  const cleanReview = runDeterministicReview(cleanDraft, TEST_GUIDELINES);
  assert.strictEqual(cleanReview.complianceScore, 100);
  assert.strictEqual(cleanReview.findings.length, 0);
});

// TC-AI-08: Master reviewBrand() with forced deterministic engine
await runAsyncTest('TC-AI-08: reviewBrand() with forceEngine="deterministic" succeeds with full payload', async () => {
  const result = await reviewBrand({
    title: 'Product Launch',
    contentType: 'press_release',
    rawText: 'Inkloom AI announced a foolproof update today.',
    guidelines: TEST_GUIDELINES,
    forceEngine: 'deterministic'
  });

  assert.strictEqual(result.status, 200);
  assert.strictEqual(result.data.engine, 'deterministic');
  assert.strictEqual(result.data.title, 'Product Launch');
  assert.ok(Array.isArray(result.data.findings));
  assert.ok(result.data.findings.length > 0);
  assert.ok(result.data.suggestedRevision);
});

// TC-AI-09: reviewBrand() automatic fallback when API key is missing
await runAsyncTest('TC-AI-09: reviewBrand() cleanly falls back to deterministic engine when API key is unset', async () => {
  const result = await reviewBrand({
    title: 'Customer Advisory',
    contentType: 'email_newsletter',
    rawText: 'Our platform provides zero risk migration.',
    guidelines: TEST_GUIDELINES,
    apiKey: undefined
  });

  assert.strictEqual(result.status, 200);
  assert.strictEqual(result.data.engine, 'deterministic');
  assert.strictEqual(result.data.isFallback, true);
  assert.ok(result.data.notice.includes('Gemini API key not configured'));
  assert.ok(result.data.findings.length > 0);
});

// TC-AI-10: Error response on boundary validation failure
await runAsyncTest('TC-AI-10: reviewBrand() returns status 400 when title or content violates bounds', async () => {
  const result = await reviewBrand({
    title: '',
    contentType: 'press_release',
    rawText: 'No title given.',
    guidelines: TEST_GUIDELINES
  });

  assert.strictEqual(result.status, 400);
  assert.ok(result.error.includes('Content title is required'));
});

// Summary
console.log('========================================');
console.log(`AI Review Test Execution Summary: ${passedCount} / ${passedCount + failedCount} PASSED (${Math.round((passedCount / (passedCount + failedCount)) * 100)}% Success Rate)`);
console.log('========================================\n');

if (failedCount > 0) {
  process.exit(1);
}

