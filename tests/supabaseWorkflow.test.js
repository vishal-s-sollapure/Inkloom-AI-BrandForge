// tests/supabaseWorkflow.test.js
// Automated Test Suite for Supabase Schema, RLS, and Persistence Layer
// Participant: Vishal S Sollapure | Challenge: Inkloom AI Brand Governance

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getSupabaseConfig,
  LocalFallbackStore,
  localFallbackStore
} from '../netlify/functions/supabaseClient.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, '../supabase/schema.sql');

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    failedTests++;
  }
}

console.log('\n--- BrandForge Supabase & Persistence Test Suite Execution ---\n');

// TC-SB-01: Schema file existence and non-empty size
runTest('TC-SB-01: supabase/schema.sql exists and is non-empty', () => {
  assert.ok(fs.existsSync(schemaPath), 'schema.sql file should exist');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  assert.ok(sql.length > 500, 'schema.sql should contain comprehensive SQL definitions');
});

// TC-SB-02: Schema defines all 8 required tables
runTest('TC-SB-02: Schema defines all 8 required relational tables', () => {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const requiredTables = [
    'public.organizations',
    'public.profiles',
    'public.brand_guidelines',
    'public.campaigns',
    'public.campaign_revisions',
    'public.review_comments',
    'public.audit_events',
    'public.compliance_seals'
  ];
  for (const tbl of requiredTables) {
    assert.ok(sql.includes(`CREATE TABLE IF NOT EXISTS ${tbl}`), `Schema must define ${tbl}`);
  }
});

// TC-SB-03: Schema defines custom enums and RLS enablement
runTest('TC-SB-03: Schema enables RLS and configures user roles and lifecycle enums', () => {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  assert.ok(sql.includes("CREATE TYPE user_role AS ENUM ('creator', 'custodian', 'legal')"), 'Should declare user_role enum');
  assert.ok(sql.includes("CREATE TYPE campaign_status AS ENUM"), 'Should declare campaign_status enum');
  assert.ok(sql.includes("CREATE TYPE audit_event_type AS ENUM"), 'Should declare audit_event_type enum');
  assert.ok(sql.includes("ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY"), 'Organizations RLS enabled');
  assert.ok(sql.includes("ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY"), 'Campaigns RLS enabled');
  assert.ok(sql.includes("ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY"), 'Audit events RLS enabled');
  assert.ok(sql.includes("ALTER TABLE public.compliance_seals ENABLE ROW LEVEL SECURITY"), 'Compliance seals RLS enabled');
});

// TC-SB-04: Schema enforces append-only security for audit_events (No UPDATE or DELETE policies)
runTest('TC-SB-04: Schema enforces append-only security for audit_events with no update/delete policies', () => {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  assert.ok(sql.includes('CREATE POLICY "audit_events_select_org" ON public.audit_events'), 'Audit select policy exists');
  assert.ok(sql.includes('CREATE POLICY "audit_events_insert_org" ON public.audit_events'), 'Audit insert policy exists');
  assert.strictEqual(sql.includes('UPDATE ON public.audit_events'), false, 'Strictly no UPDATE policy allowed on audit_events');
  assert.strictEqual(sql.includes('DELETE ON public.audit_events'), false, 'Strictly no DELETE policy allowed on audit_events');
});

// TC-SB-05: getSupabaseConfig detects valid HTTPS credentials vs placeholder
runTest('TC-SB-05: getSupabaseConfig accurately evaluates environment credentials', () => {
  const emptyConf = getSupabaseConfig({});
  assert.strictEqual(emptyConf.isConfigured, false);

  const placeholderConf = getSupabaseConfig({
    SUPABASE_URL: 'https://placeholder.supabase.co',
    SUPABASE_ANON_KEY: 'placeholder_key'
  });
  assert.strictEqual(placeholderConf.isConfigured, false);

  const validConf = getSupabaseConfig({
    SUPABASE_URL: 'https://xyzproject.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.validkey'
  });
  assert.strictEqual(validConf.isConfigured, true);
  assert.strictEqual(validConf.url, 'https://xyzproject.supabase.co');
});

// TC-SB-06: LocalFallbackStore creates campaign with proper defaults
runTest('TC-SB-06: LocalFallbackStore inserts campaign with status "drafting" and version 1', () => {
  const store = new LocalFallbackStore();
  const camp = store.insertCampaign({
    title: 'Q4 Product Launch Announcement',
    content_type: 'Email Newsletter'
  });
  assert.ok(camp.id.startsWith('camp-'));
  assert.strictEqual(camp.title, 'Q4 Product Launch Announcement');
  assert.strictEqual(camp.current_status, 'drafting');
  assert.strictEqual(camp.current_version_num, 1);
  assert.strictEqual(camp.organization_id, 'org-default-001');
});

// TC-SB-07: LocalFallbackStore records audit events with actor attribution
runTest('TC-SB-07: LocalFallbackStore records append-only audit event with actor role and state transitions', () => {
  const store = new LocalFallbackStore();
  const event = store.recordAuditEvent({
    campaignId: 'camp-123',
    actorId: 'user-creator-001',
    actorRole: 'creator',
    eventType: 'status_change',
    previousState: { status: 'drafting' },
    newState: { status: 'in_review' },
    metadata: { note: 'Ready for Brand Custodian review' }
  });

  assert.ok(event.id.startsWith('audit-'));
  assert.strictEqual(event.actor_role, 'creator');
  assert.strictEqual(event.event_type, 'status_change');
  assert.strictEqual(event.new_state.status, 'in_review');
  assert.strictEqual(store.auditEvents.length, 1);
});

// TC-SB-08: LocalFallbackStore rejects audit event missing required fields
runTest('TC-SB-08: LocalFallbackStore rejects audit event missing required fields', () => {
  const store = new LocalFallbackStore();
  assert.throws(() => {
    store.recordAuditEvent({ campaignId: '' });
  }, /Missing required audit event attributes/);
});

// TC-SB-09: LocalFallbackStore records cryptographic compliance seal with dual sign-offs
runTest('TC-SB-09: LocalFallbackStore records compliance seal with SHA-256 hash and dual sign-offs', () => {
  const store = new LocalFallbackStore();
  const sampleHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const seal = store.recordComplianceSeal({
    campaignId: 'camp-456',
    revisionId: 'rev-001',
    contentSha256: sampleHash,
    brandApprovedBy: 'user-custodian-001',
    legallyClearedBy: 'user-legal-001',
    verificationReceipt: { testKey: 'verified' }
  });

  assert.ok(seal.id.startsWith('seal-'));
  assert.strictEqual(seal.content_sha256, sampleHash);
  assert.strictEqual(seal.brand_approved_by, 'user-custodian-001');
  assert.strictEqual(seal.legally_cleared_by, 'user-legal-001');
  assert.strictEqual(store.complianceSeals.length, 1);
});

// TC-SB-10: LocalFallbackStore rejects compliance seal missing approvals
runTest('TC-SB-10: LocalFallbackStore rejects compliance seal when signatures or hash are missing', () => {
  const store = new LocalFallbackStore();
  assert.throws(() => {
    store.recordComplianceSeal({
      campaignId: 'camp-999',
      contentSha256: '',
      brandApprovedBy: 'user-custodian-001'
    });
  }, /Cannot issue compliance seal/);
});

console.log('========================================');
console.log(`Supabase & Persistence Test Summary: ${passedTests} / ${passedTests + failedTests} PASSED`);
console.log('========================================\n');

if (failedTests > 0) {
  process.exit(1);
}
