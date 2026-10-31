/**
 * Automated Test Suite: Collaborative Governance Workflow (Improvement 2)
 * Tests RBAC permissions, state machine lifecycle, in-line comment threads,
 * and SHA-256 cryptographic compliance seals.
 */

import assert from 'node:assert';
import {
  ROLES,
  ROLE_LABELS,
  WORKFLOW_STATES,
  STATE_LABELS,
  canTransition,
  getAllowedTransitions,
  createComment,
  addCommentToRecord,
  toggleCommentResolution,
  generateComplianceSeal,
  verifyComplianceSeal
} from '../netlify/functions/governanceWorkflowCore.mjs';

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

console.log('\n--- BrandForge Collaborative Workflow Test Suite Execution ---\n');

// TC-WF-01: Role definition and labels
runTest('TC-WF-01: Three distinct stakeholder roles are defined with labels', () => {
  assert.strictEqual(ROLES.CREATOR, 'creator');
  assert.strictEqual(ROLES.CUSTODIAN, 'custodian');
  assert.strictEqual(ROLES.LEGAL, 'legal');

  assert.strictEqual(ROLE_LABELS[ROLES.CREATOR], 'Content Creator');
  assert.strictEqual(ROLE_LABELS[ROLES.CUSTODIAN], 'Brand Custodian');
  assert.strictEqual(ROLE_LABELS[ROLES.LEGAL], 'Legal & Compliance Officer');
});

// TC-WF-02: Content Creator workflow transitions
runTest('TC-WF-02: Content Creator can transition Drafting -> In Review and re-submit after changes', () => {
  // Creator can submit draft for review
  assert.strictEqual(canTransition(WORKFLOW_STATES.DRAFTING, WORKFLOW_STATES.IN_REVIEW, ROLES.CREATOR), true);

  // Creator can re-submit after changes requested
  assert.strictEqual(canTransition(WORKFLOW_STATES.CHANGES_REQUESTED, WORKFLOW_STATES.IN_REVIEW, ROLES.CREATOR), true);

  // Creator can withdraw back to drafting
  assert.strictEqual(canTransition(WORKFLOW_STATES.IN_REVIEW, WORKFLOW_STATES.DRAFTING, ROLES.CREATOR), true);
});

// TC-WF-03: Creator permission boundary restrictions
runTest('TC-WF-03: Content Creator cannot unilaterally grant Brand Approval or Legal Clearance', () => {
  assert.strictEqual(canTransition(WORKFLOW_STATES.IN_REVIEW, WORKFLOW_STATES.BRAND_APPROVED, ROLES.CREATOR), false);
  assert.strictEqual(canTransition(WORKFLOW_STATES.BRAND_APPROVED, WORKFLOW_STATES.LEGALLY_CLEARED, ROLES.CREATOR), false);
  assert.strictEqual(canTransition(WORKFLOW_STATES.DRAFTING, WORKFLOW_STATES.LEGALLY_CLEARED, ROLES.CREATOR), false);
});

// TC-WF-04: Brand Custodian transitions
runTest('TC-WF-04: Brand Custodian can approve brand voice or request changes on review queue', () => {
  // Custodian approves brand voice
  assert.strictEqual(canTransition(WORKFLOW_STATES.IN_REVIEW, WORKFLOW_STATES.BRAND_APPROVED, ROLES.CUSTODIAN), true);

  // Custodian requests changes
  assert.strictEqual(canTransition(WORKFLOW_STATES.IN_REVIEW, WORKFLOW_STATES.CHANGES_REQUESTED, ROLES.CUSTODIAN), true);

  // Custodian can change mind on previously approved draft
  assert.strictEqual(canTransition(WORKFLOW_STATES.BRAND_APPROVED, WORKFLOW_STATES.CHANGES_REQUESTED, ROLES.CUSTODIAN), true);
});

// TC-WF-05: Legal & Compliance Officer transitions
runTest('TC-WF-05: Legal Officer can grant legal clearance or request factual documentation', () => {
  // Legal clears brand-approved draft
  assert.strictEqual(canTransition(WORKFLOW_STATES.BRAND_APPROVED, WORKFLOW_STATES.LEGALLY_CLEARED, ROLES.LEGAL), true);

  // Legal requests documentation changes
  assert.strictEqual(canTransition(WORKFLOW_STATES.BRAND_APPROVED, WORKFLOW_STATES.CHANGES_REQUESTED, ROLES.LEGAL), true);
});

// TC-WF-06: Legal cannot bypass Brand Custodian approval
runTest('TC-WF-06: Legal Officer cannot bypass Brand Custodian approval directly from Drafting or In Review', () => {
  assert.strictEqual(canTransition(WORKFLOW_STATES.DRAFTING, WORKFLOW_STATES.LEGALLY_CLEARED, ROLES.LEGAL), false);
  assert.strictEqual(canTransition(WORKFLOW_STATES.IN_REVIEW, WORKFLOW_STATES.LEGALLY_CLEARED, ROLES.LEGAL), false);
});

// TC-WF-07: In-line comment creation and record attachment
runTest('TC-WF-07: In-line comment threads validate input and attach to review record', () => {
  const record = {
    title: 'Q3 PR Announcement',
    rawText: 'Inkloom AI announced a resilient platform today.',
    comments: []
  };

  addCommentToRecord(record, {
    authorRole: ROLES.CUSTODIAN,
    authorName: 'Alex Brand Lead',
    targetText: 'resilient platform',
    commentText: 'Great phrasing! Matches our approved positioning.'
  });

  assert.strictEqual(record.comments.length, 1);
  assert.strictEqual(record.comments[0].authorRole, ROLES.CUSTODIAN);
  assert.strictEqual(record.comments[0].authorRoleLabel, 'Brand Custodian');
  assert.strictEqual(record.comments[0].targetText, 'resilient platform');
  assert.strictEqual(record.comments[0].resolved, false);
});

// TC-WF-08: Comment resolution toggle
runTest('TC-WF-08: Comment resolution toggle toggles resolved state', () => {
  const record = {
    comments: [
      { id: 'cmt-1', commentText: 'Please update metric', resolved: false }
    ]
  };

  const flipped = toggleCommentResolution(record, 'cmt-1');
  assert.strictEqual(flipped, true);
  assert.strictEqual(record.comments[0].resolved, true);

  toggleCommentResolution(record, 'cmt-1');
  assert.strictEqual(record.comments[0].resolved, false);
});

// TC-WF-09: Cryptographic SHA-256 seal generation
runTest('TC-WF-09: generateComplianceSeal produces 64-char hex hash and binds dual sign-offs', () => {
  const record = {
    title: 'Enterprise Launch',
    type: 'press_release',
    rawText: 'Inkloom AI evaluates marketing copy with systematic verification.',
    score: 100,
    findings: [],
    brandCustodianSignoff: { name: 'Sarah Custodian', timestamp: '2026-10-31T20:00:00.000Z' },
    legalOfficerSignoff: { name: 'David Legal', timestamp: '2026-10-31T20:30:00.000Z' }
  };

  const seal = generateComplianceSeal(record);

  assert.strictEqual(typeof seal.sha256Hash, 'string');
  assert.strictEqual(seal.sha256Hash.length, 64);
  assert.ok(/^[0-9a-f]{64}$/.test(seal.sha256Hash));
  assert.ok(seal.sealId.startsWith('SEAL-'));
  assert.strictEqual(record.status, WORKFLOW_STATES.LEGALLY_CLEARED);
});

// TC-WF-10: Cryptographic seal verification & tamper detection
runTest('TC-WF-10: verifyComplianceSeal validates intact content and flags tampered drafts', () => {
  const record = {
    title: 'Enterprise Launch',
    type: 'press_release',
    rawText: 'Inkloom AI evaluates marketing copy with systematic verification.',
    score: 100,
    findings: []
  };

  // Generate seal
  generateComplianceSeal(record);

  // Intact record must verify
  const intactVerification = verifyComplianceSeal(record);
  assert.strictEqual(intactVerification.isValid, true);
  assert.ok(intactVerification.reason.includes('Cryptographic signature is valid'));

  // Tamper text by a single character
  record.rawText = 'Inkloom AI evaluates marketing copy with systematic verification!';
  const tamperedVerification = verifyComplianceSeal(record);
  assert.strictEqual(tamperedVerification.isValid, false);
  assert.ok(tamperedVerification.reason.includes('TAMPER DETECTED'));
});

// Summary
console.log('========================================');
console.log(`Collaborative Workflow Test Summary: ${passedCount} / ${passedCount + failedCount} PASSED (${Math.round((passedCount / (passedCount + failedCount)) * 100)}% Success Rate)`);
console.log('========================================\n');

if (failedCount > 0) {
  process.exit(1);
}

