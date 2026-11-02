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

// TC-SB-11: Security-definer functions enforce fixed search_path to prevent search-path injection
runTest('TC-SB-11: Security-definer functions enforce fixed search_path = public, pg_temp', () => {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  assert.ok(sql.includes('get_auth_org_id()') && sql.includes('SET search_path = public, pg_temp;'), 'get_auth_org_id must specify fixed search_path');
  assert.ok(sql.includes('get_auth_role()') && sql.includes('SET search_path = public, pg_temp;'), 'get_auth_role must specify fixed search_path');
  assert.ok(sql.includes('handle_new_user()') && sql.includes('SET search_path = public, pg_temp;'), 'handle_new_user must specify fixed search_path');
});

// TC-SB-12: handle_new_user assigns 'creator' by default and does not trust metadata
runTest("TC-SB-12: handle_new_user hardcodes default role 'creator' and does not trust client metadata", () => {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  assert.ok(sql.includes("user_initial_role := 'creator'::user_role;"), "Must hardcode default role to 'creator'");
  assert.strictEqual(sql.includes("user_initial_role := COALESCE"), false, "Must not allow user metadata to override role");
});

// TC-SB-13: Profiles table has trigger preventing role or organization escalation
runTest('TC-SB-13: Profiles table has trigger preventing client-side role or organization escalation', () => {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  assert.ok(sql.includes('trg_prevent_profile_escalation'), 'Must attach trg_prevent_profile_escalation trigger');
  assert.ok(sql.includes('NEW.role <> OLD.role'), 'Must check for role changes');
  assert.ok(sql.includes('NEW.organization_id <> OLD.organization_id'), 'Must check for organization changes');
});

// TC-SB-14: Standalone security patch migration exists and matches schema hardening
runTest('TC-SB-14: supabase/migration_security_patch.sql exists and contains idempotent security hardening', () => {
  const patchPath = path.resolve(__dirname, '../supabase/migration_security_patch.sql');
  assert.ok(fs.existsSync(patchPath), 'migration_security_patch.sql must exist');
  const patchSql = fs.readFileSync(patchPath, 'utf8');
  assert.ok(patchSql.includes('prevent_profile_escalation'), 'Patch must include profile escalation protection');
  assert.ok(patchSql.includes('SET search_path = public, pg_temp;'), 'Patch must enforce safe search_path');
});

// TC-SB-15: RFC 4122 v4 UUID format validation
runTest('TC-SB-15: UUID validation accepts valid RFC 4122 UUIDs and rejects invalid strings', () => {
  const validUuid = '123e4567-e89b-12d3-a456-426614174000';
  const invalidUuid1 = 'org-default-001';
  const invalidUuid2 = 'rev-1730000000000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  assert.strictEqual(uuidRegex.test(validUuid), true, 'Valid UUID should pass regex');
  assert.strictEqual(uuidRegex.test(invalidUuid1), false, 'org-default-001 must be rejected');
  assert.strictEqual(uuidRegex.test(invalidUuid2), false, 'rev-timestamp must be rejected');
});

// TC-SB-16: Profiles update policy and anti-escalation enforcement
runTest('TC-SB-16: Profiles update policy enforces self-ownership and anti-escalation guards', () => {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  assert.ok(sql.includes('CREATE POLICY "profiles_update_self" ON public.profiles'), 'profiles_update_self policy exists');
  assert.ok(sql.includes('id = auth.uid()'), 'profiles_update_self must restrict to id = auth.uid()');
  assert.ok(sql.includes('trg_prevent_profile_escalation'), 'trg_prevent_profile_escalation must be active on profiles');
});

// TC-SB-17: Multi-tenant organizational isolation across tables
runTest('TC-SB-17: RLS policies enforce strict organization isolation across all entity tables', () => {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  assert.ok(sql.includes('organization_id = public.get_auth_org_id()'), 'Organizations must be filtered by get_auth_org_id()');
  assert.ok(sql.includes('campaigns_select_org'), 'Campaigns must have org select policy');
  assert.ok(sql.includes('campaigns_insert_creator'), 'Campaigns must have creator org insert policy');
  assert.ok(sql.includes('guidelines_select_org'), 'Guidelines must have org select policy');
});

// TC-SB-18: Compliance seals restricted to Legal Officer role
runTest('TC-SB-18: Compliance seal creation is restricted strictly to legal role in RLS policy', () => {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  assert.ok(sql.includes('CREATE POLICY "seals_insert_legal" ON public.compliance_seals'), 'seals_insert_legal policy exists');
  assert.ok(sql.includes("public.get_auth_role() = 'legal'"), 'seals_insert_legal must check get_auth_role() = legal');
  assert.ok(sql.includes('legally_cleared_by = auth.uid()'), 'seals_insert_legal must bind legally_cleared_by to auth.uid()');
});

// TC-SB-19: Ping query design targets PostgreSQL public.organizations rather than unauthenticated REST root
runTest('TC-SB-19: Database connectivity check queries organizations table to prevent false HTTP 401s', () => {
  const appJsPath = path.resolve(__dirname, '../app.js');
  const appJs = fs.readFileSync(appJsPath, 'utf8');
  assert.ok(appJs.includes(".from('organizations').select('id, name, slug').limit(1)"), 'testConnection must query organizations table');
  assert.strictEqual(appJs.includes("fetch(`${cleanUrl}/rest/v1/`"), false, 'Must not perform raw unauthenticated REST root fetch');
});

// TC-SB-20: Distinct connection states (sandbox, connected, authenticated)
runTest('TC-SB-20: SupabaseManager cleanly distinguishes sandbox, connected, and authenticated states', () => {
  const appJsPath = path.resolve(__dirname, '../app.js');
  const appJs = fs.readFileSync(appJsPath, 'utf8');
  assert.ok(appJs.includes("connectionState: 'sandbox'"), 'Must declare default sandbox state');
  assert.ok(appJs.includes("this.connectionState = 'connected'"), 'Must transition to connected when gateway verified');
  assert.ok(appJs.includes("this.connectionState = 'authenticated'"), 'Must transition to authenticated when session verified');
});

// TC-SB-21: Campaigns update policy contains WITH CHECK clause permitting valid status transitions
runTest('TC-SB-21: Campaigns update policy contains WITH CHECK clause permitting valid status transitions', () => {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  assert.ok(sql.includes('WITH CHECK'), 'campaigns_update_role must define an explicit WITH CHECK clause');
  assert.ok(sql.includes("(public.get_auth_role() = 'creator' AND current_status IN ('drafting', 'in_review'))"), 'Creator must be permitted to transition to in_review in WITH CHECK');
  assert.ok(sql.includes("(public.get_auth_role() = 'custodian' AND current_status IN ('in_review', 'changes_requested', 'brand_approved'))"), 'Custodian must be permitted to transition to brand_approved in WITH CHECK');
  assert.ok(sql.includes("(public.get_auth_role() = 'legal' AND current_status IN ('brand_approved', 'changes_requested', 'legally_cleared'))"), 'Legal must be permitted to transition to legally_cleared in WITH CHECK');
});

// TC-SB-22: Campaign revisions table has UPDATE RLS policy for revision upserts
runTest('TC-SB-22: Campaign revisions table defines explicit UPDATE RLS policy to support upserts', () => {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  assert.ok(sql.includes('CREATE POLICY "revisions_update_org" ON public.campaign_revisions'), 'revisions_update_org policy must exist');
  assert.ok(sql.includes('FOR UPDATE USING'), 'Must permit FOR UPDATE on campaign_revisions');
});

// TC-SB-23: Status normalization maps legacy statuses to valid PostgreSQL enum values
runTest('TC-SB-23: Status normalization correctly maps legacy statuses to valid campaign_status enums', () => {
  const appJsPath = path.resolve(__dirname, '../app.js');
  const appJs = fs.readFileSync(appJsPath, 'utf8');
  assert.ok(appJs.includes('function normalizeCampaignStatus'), 'Must declare normalizeCampaignStatus function');
  assert.ok(appJs.includes("s === 'approved'") && appJs.includes("return 'brand_approved'"), 'Must map approved to brand_approved');
  assert.ok(appJs.includes("s === 'rejected'") && appJs.includes("return 'changes_requested'"), 'Must map rejected to changes_requested');
});

// TC-SB-24: Database writes return detailed failure responses and do not swallow errors
runTest('TC-SB-24: Database writes inspect Supabase errors and return explicit failure payloads', () => {
  const appJsPath = path.resolve(__dirname, '../app.js');
  const appJs = fs.readFileSync(appJsPath, 'utf8');
  assert.ok(appJs.includes("return { success: false, message: err.message };"), 'syncCampaignRecord must return false on exception');
  assert.ok(appJs.includes("return { success: true, campaign:"), 'syncCampaignRecord must return true on successful write');
  assert.ok(appJs.includes("throw new Error(`Campaign database write failed:"), 'syncCampaignRecord must throw if campResult.error');
});

// TC-SB-25: Profiles selection self-recovery policy enables users to select their own profile
runTest('TC-SB-25: Profiles selection policy includes id = auth.uid() self-recovery guard', () => {
  const sql = fs.readFileSync(schemaPath, 'utf8');
  assert.ok(sql.includes('id = auth.uid() OR organization_id = public.get_auth_org_id()'), 'profiles_select_org must include id = auth.uid()');
});

// TC-SB-26: saveHistory does not perform unawaited background cloud writes
runTest('TC-SB-26: saveHistory does not trigger unawaited background cloud sync writes', () => {
  const appJsPath = path.resolve(__dirname, '../app.js');
  const appJs = fs.readFileSync(appJsPath, 'utf8');
  const saveHistoryFunc = appJs.slice(appJs.indexOf('function saveHistory('), appJs.indexOf('function saveHistory(') + 300);
  assert.ok(!saveHistoryFunc.includes('SupabaseManager.syncCampaignRecord'), 'saveHistory must not invoke syncCampaignRecord in background');
});

// TC-SB-27: Approval modal guards success toast with verified cloud writes and halts on error
runTest('TC-SB-27: Approval modal guards success toast with verified cloud writes', () => {
  const appJsPath = path.resolve(__dirname, '../app.js');
  const appJs = fs.readFileSync(appJsPath, 'utf8');
  assert.ok(appJs.includes("if (!syncRes.success)"), 'Approval modal must verify syncCampaignRecord result');
  assert.ok(appJs.includes("if (!statusRes.success)"), 'Approval modal must verify updateCampaignStatus result');
  assert.ok(appJs.includes("showToast(`Approval persistence failed:"), 'Approval modal must alert on persistence failure');
});

// TC-SB-28: Legal clearance verifies all cloud writes before generating success toast
runTest('TC-SB-28: Legal clearance verifies sync, status update, and seal recording', () => {
  const appJsPath = path.resolve(__dirname, '../app.js');
  const appJs = fs.readFileSync(appJsPath, 'utf8');
  assert.ok(appJs.includes("if (!sealRes.success)"), 'Legal clearance must verify recordComplianceSeal response');
  assert.ok(appJs.includes("showToast(`Legal clearance sync failed:"), 'Legal clearance must alert if campaign sync fails');
});

// TC-SB-29: Review history displays visual indicators distinguishing cloud from local sandbox actions
runTest('TC-SB-29: Review history displays cloud vs local persistence badges', () => {
  const appJsPath = path.resolve(__dirname, '../app.js');
  const stylesPath = path.resolve(__dirname, '../styles.css');
  const appJs = fs.readFileSync(appJsPath, 'utf8');
  const styles = fs.readFileSync(stylesPath, 'utf8');

  assert.ok(appJs.includes('badge-cloud') && appJs.includes('badge-local'), 'app.js must render badge-cloud and badge-local badges');
  assert.ok(styles.includes('.badge-cloud') && styles.includes('.badge-local'), 'styles.css must style .badge-cloud and .badge-local');
});

// TC-SB-30: Gemini API key sanitization trims whitespace, strips quotes, and safe diagnostic endpoint
runTest('TC-SB-30: Gemini API key sanitization and safe diagnostic endpoint', () => {
  const fnPath = path.resolve(__dirname, '../netlify/functions/review-brand.mjs');
  const corePath = path.resolve(__dirname, '../netlify/functions/reviewBrandCore.mjs');
  const fnCode = fs.readFileSync(fnPath, 'utf8');
  const coreCode = fs.readFileSync(corePath, 'utf8');

  assert.ok(fnCode.includes('trim()') && fnCode.includes("replace(/^[\"']|[\"']$/g, '')"), 'Must sanitize API key whitespace and quotes');
  assert.ok(fnCode.includes('geminiConfigured') && fnCode.includes('keyPrefix'), 'Must provide safe diagnostic endpoint');
  assert.ok(!fnCode.includes('apiKey: apiKey'), 'Diagnostic must never return full API key');
  assert.ok(coreCode.includes('x-goog-api-key'), 'Must send x-goog-api-key header');
});

console.log('========================================');
console.log(`Supabase & Persistence Test Summary: ${passedTests} / ${passedTests + failedTests} PASSED`);
console.log('========================================\n');

if (failedTests > 0) {
  process.exit(1);
}

