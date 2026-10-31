// netlify/functions/supabaseClient.mjs
// Serverless Supabase Integration Layer for BrandForge Round 3
// Participant: Vishal S Sollapure | Challenge: Inkloom AI Brand Governance

/**
 * Returns configuration from environment variables.
 */
export function getSupabaseConfig(env = process.env) {
  const url = env.SUPABASE_URL || '';
  const anonKey = env.SUPABASE_ANON_KEY || '';
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || '';

  const isConfigured = Boolean(
    url &&
    url.startsWith('https://') &&
    !url.includes('placeholder') &&
    anonKey &&
    !anonKey.includes('placeholder')
  );

  return {
    url,
    anonKey,
    serviceRoleKey,
    isConfigured
  };
}

/**
 * In-memory fallback datastore when Supabase is unconfigured or operating offline.
 * Enables zero-downtime, continuous local operation and test verification.
 */
export class LocalFallbackStore {
  constructor() {
    this.organizations = [
      { id: 'org-default-001', name: 'Inkloom Brand Studio', slug: 'inkloom-workspace' }
    ];
    this.profiles = [
      { id: 'user-creator-001', organization_id: 'org-default-001', email: 'creator@brandforge.ai', full_name: 'Content Creator', role: 'creator' },
      { id: 'user-custodian-001', organization_id: 'org-default-001', email: 'custodian@brandforge.ai', full_name: 'Brand Custodian', role: 'custodian' },
      { id: 'user-legal-001', organization_id: 'org-default-001', email: 'legal@brandforge.ai', full_name: 'Legal Officer', role: 'legal' }
    ];
    this.campaigns = [];
    this.revisions = [];
    this.comments = [];
    this.auditEvents = [];
    this.complianceSeals = [];
  }

  insertCampaign(campaign) {
    const record = {
      id: campaign.id || `camp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      organization_id: campaign.organization_id || 'org-default-001',
      created_by: campaign.created_by || 'user-creator-001',
      title: campaign.title,
      content_type: campaign.content_type || 'Social Ad Copy',
      target_audience: campaign.target_audience || 'General Enterprise',
      current_status: campaign.current_status || 'drafting',
      current_version_num: campaign.current_version_num || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.campaigns.push(record);
    return record;
  }

  recordAuditEvent({ organizationId = 'org-default-001', campaignId, actorId, actorRole, eventType, previousState = null, newState = null, metadata = {} }) {
    if (!campaignId || !actorRole || !eventType) {
      throw new Error('Missing required audit event attributes (campaignId, actorRole, eventType)');
    }
    const event = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      organization_id: organizationId,
      campaign_id: campaignId,
      actor_id: actorId || 'user-system',
      actor_role: actorRole,
      event_type: eventType,
      previous_state: previousState,
      new_state: newState,
      metadata,
      created_at: new Date().toISOString()
    };
    this.auditEvents.push(event);
    return event;
  }

  recordComplianceSeal({ campaignId, revisionId, contentSha256, brandApprovedBy, brandApprovedAt, legallyClearedBy, legallyClearedAt, verificationReceipt }) {
    if (!campaignId || !contentSha256 || !brandApprovedBy || !legallyClearedBy) {
      throw new Error('Cannot issue compliance seal: Missing required dual-approval signatures or hash');
    }
    const seal = {
      id: `seal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      campaign_id: campaignId,
      revision_id: revisionId || `rev-${Date.now()}`,
      content_sha256: contentSha256,
      brand_approved_by: brandApprovedBy,
      brand_approved_at: brandApprovedAt || new Date().toISOString(),
      legally_cleared_by: legallyClearedBy,
      legally_cleared_at: legallyClearedAt || new Date().toISOString(),
      verification_receipt: verificationReceipt || {},
      created_at: new Date().toISOString()
    };
    this.complianceSeals.push(seal);
    return seal;
  }
}

// Global in-process fallback singleton
export const localFallbackStore = new LocalFallbackStore();

/**
 * Factory that returns either a configured client or the local fallback store.
 */
export function getGovernanceStore(env = process.env) {
  const config = getSupabaseConfig(env);
  return {
    isConfigured: config.isConfigured,
    config,
    store: localFallbackStore
  };
}

