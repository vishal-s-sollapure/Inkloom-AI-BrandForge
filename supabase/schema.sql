-- ==============================================================================
-- BrandForge Round 3: Supabase PostgreSQL Schema & Row Level Security (RLS)
-- Participant: Vishal S Sollapure | Challenge: Inkloom AI Brand Governance
-- Fully Idempotent Script: Safe to execute repeatedly without duplicate errors
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES & ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('creator', 'custodian', 'legal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM (
        'drafting', 
        'in_review', 
        'changes_requested', 
        'brand_approved', 
        'legally_cleared'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_event_type AS ENUM (
        'review_run',
        'status_change',
        'comment_added',
        'comment_resolved',
        'seal_generated',
        'revision_applied'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. CORE TABLES

-- 3.1 Organizations (Multi-tenant Workspace)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.2 User Profiles (Linked to Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'creator',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.3 Brand Guidelines
CREATE TABLE IF NOT EXISTS public.brand_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    version TEXT NOT NULL DEFAULT '1.0',
    title TEXT NOT NULL,
    voice_principles JSONB NOT NULL DEFAULT '[]'::jsonb,
    avoided_terms JSONB NOT NULL DEFAULT '[]'::jsonb,
    factual_claims JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.4 Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_custodian_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_legal_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL,
    target_audience TEXT,
    current_status campaign_status NOT NULL DEFAULT 'drafting',
    current_version_num INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.5 Campaign Revisions (Immutable snapshots of every version)
CREATE TABLE IF NOT EXISTS public.campaign_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    version_num INTEGER NOT NULL,
    content TEXT NOT NULL,
    compliance_score INTEGER NOT NULL CHECK (compliance_score >= 0 AND compliance_score <= 100),
    findings JSONB NOT NULL DEFAULT '[]'::jsonb,
    factual_claims JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggested_revision TEXT,
    applied_changes JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_campaign_version UNIQUE (campaign_id, version_num)
);

-- 3.6 In-line Review Comments
CREATE TABLE IF NOT EXISTS public.review_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    revision_id UUID NOT NULL REFERENCES public.campaign_revisions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_role user_role NOT NULL,
    selected_text TEXT,
    start_offset INTEGER,
    end_offset INTEGER,
    comment_text TEXT NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.7 Append-Only Audit Events
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_role user_role NOT NULL,
    event_type audit_event_type NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.8 Cryptographic Compliance Seals
CREATE TABLE IF NOT EXISTS public.compliance_seals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    revision_id UUID NOT NULL REFERENCES public.campaign_revisions(id) ON DELETE CASCADE,
    content_sha256 CHAR(64) NOT NULL,
    brand_approved_by UUID NOT NULL REFERENCES public.profiles(id),
    brand_approved_at TIMESTAMPTZ NOT NULL,
    legally_cleared_by UUID NOT NULL REFERENCES public.profiles(id),
    legally_cleared_at TIMESTAMPTZ NOT NULL,
    verification_receipt JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_campaign_seal UNIQUE (campaign_id, revision_id)
);

-- 4. HELPER FUNCTIONS FOR ROW LEVEL SECURITY (RLS)

-- Get current authenticated user's organization ID
CREATE OR REPLACE FUNCTION public.get_auth_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- Get current authenticated user's role
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- 5. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_seals ENABLE ROW LEVEL SECURITY;

-- 6. ROW LEVEL SECURITY POLICIES (Idempotent: Drops existing policy before creating)

-- 6.1 Organizations: Users can view their own organization
DROP POLICY IF EXISTS "org_select_own" ON public.organizations;
CREATE POLICY "org_select_own" ON public.organizations
    FOR SELECT USING (id = public.get_auth_org_id());

-- 6.2 Profiles: Users can view profiles in their own organization; edit their own profile
DROP POLICY IF EXISTS "profiles_select_org" ON public.profiles;
CREATE POLICY "profiles_select_org" ON public.profiles
    FOR SELECT USING (organization_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
CREATE POLICY "profiles_update_self" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

-- 6.3 Brand Guidelines: Read-accessible to all org members; editable by Brand Custodians
DROP POLICY IF EXISTS "guidelines_select_org" ON public.brand_guidelines;
CREATE POLICY "guidelines_select_org" ON public.brand_guidelines
    FOR SELECT USING (organization_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "guidelines_modify_custodian" ON public.brand_guidelines;
CREATE POLICY "guidelines_modify_custodian" ON public.brand_guidelines
    FOR ALL USING (
        organization_id = public.get_auth_org_id() 
        AND public.get_auth_role() = 'custodian'
    );

-- 6.4 Campaigns:
-- Members of the same organization can view campaigns
DROP POLICY IF EXISTS "campaigns_select_org" ON public.campaigns;
CREATE POLICY "campaigns_select_org" ON public.campaigns
    FOR SELECT USING (organization_id = public.get_auth_org_id());

-- Creators can insert campaigns within their organization
DROP POLICY IF EXISTS "campaigns_insert_creator" ON public.campaigns;
CREATE POLICY "campaigns_insert_creator" ON public.campaigns
    FOR INSERT WITH CHECK (
        organization_id = public.get_auth_org_id() 
        AND created_by = auth.uid()
    );

-- Update permissions based on role and lifecycle status:
DROP POLICY IF EXISTS "campaigns_update_role" ON public.campaigns;
CREATE POLICY "campaigns_update_role" ON public.campaigns
    FOR UPDATE USING (
        organization_id = public.get_auth_org_id()
        AND (
            -- Creators can update when drafting or changes requested
            (public.get_auth_role() = 'creator' AND current_status IN ('drafting', 'changes_requested'))
            OR
            -- Custodians can update when in_review or changes_requested
            (public.get_auth_role() = 'custodian' AND current_status IN ('in_review', 'changes_requested'))
            OR
            -- Legal officers can update when brand_approved or in_review
            (public.get_auth_role() = 'legal' AND current_status IN ('brand_approved', 'in_review'))
        )
    );

-- 6.5 Campaign Revisions:
-- Read for org members
DROP POLICY IF EXISTS "revisions_select_org" ON public.campaign_revisions;
CREATE POLICY "revisions_select_org" ON public.campaign_revisions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c 
            WHERE c.id = campaign_revisions.campaign_id 
            AND c.organization_id = public.get_auth_org_id()
        )
    );

-- Insert permitted for org members working on campaign
DROP POLICY IF EXISTS "revisions_insert_org" ON public.campaign_revisions;
CREATE POLICY "revisions_insert_org" ON public.campaign_revisions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns c 
            WHERE c.id = campaign_revisions.campaign_id 
            AND c.organization_id = public.get_auth_org_id()
        )
    );

-- 6.6 Review Comments:
DROP POLICY IF EXISTS "comments_select_org" ON public.review_comments;
CREATE POLICY "comments_select_org" ON public.review_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c 
            WHERE c.id = review_comments.campaign_id 
            AND c.organization_id = public.get_auth_org_id()
        )
    );

DROP POLICY IF EXISTS "comments_insert_org" ON public.review_comments;
CREATE POLICY "comments_insert_org" ON public.review_comments
    FOR INSERT WITH CHECK (
        author_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.campaigns c 
            WHERE c.id = review_comments.campaign_id 
            AND c.organization_id = public.get_auth_org_id()
        )
    );

DROP POLICY IF EXISTS "comments_update_resolution" ON public.review_comments;
CREATE POLICY "comments_update_resolution" ON public.review_comments
    FOR UPDATE USING (
        -- Author can resolve, or Custodian / Legal can resolve
        (author_id = auth.uid() OR public.get_auth_role() IN ('custodian', 'legal'))
        AND EXISTS (
            SELECT 1 FROM public.campaigns c 
            WHERE c.id = review_comments.campaign_id 
            AND c.organization_id = public.get_auth_org_id()
        )
    );

-- 6.7 Audit Events: APPEND-ONLY! Strictly no UPDATE or DELETE allowed.
DROP POLICY IF EXISTS "audit_events_select_org" ON public.audit_events;
CREATE POLICY "audit_events_select_org" ON public.audit_events
    FOR SELECT USING (organization_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "audit_events_insert_org" ON public.audit_events;
CREATE POLICY "audit_events_insert_org" ON public.audit_events
    FOR INSERT WITH CHECK (
        organization_id = public.get_auth_org_id()
        AND actor_id = auth.uid()
    );

-- 6.8 Compliance Seals:
-- Viewable by anyone in the organization
DROP POLICY IF EXISTS "seals_select_org" ON public.compliance_seals;
CREATE POLICY "seals_select_org" ON public.compliance_seals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c 
            WHERE c.id = compliance_seals.campaign_id 
            AND c.organization_id = public.get_auth_org_id()
        )
    );

-- Only Legal officers can record the final compliance seal upon legal clearance
DROP POLICY IF EXISTS "seals_insert_legal" ON public.compliance_seals;
CREATE POLICY "seals_insert_legal" ON public.compliance_seals
    FOR INSERT WITH CHECK (
        public.get_auth_role() = 'legal'
        AND legally_cleared_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.campaigns c 
            WHERE c.id = compliance_seals.campaign_id 
            AND c.organization_id = public.get_auth_org_id()
        )
    );

-- 7. PROFILE SECURITY & TRIGGERS

-- 7.1 Auto-create profile on signup (Default 'creator' role, never trust metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_org_id UUID;
    user_initial_role user_role;
BEGIN
    -- Ensure default workspace exists
    SELECT id INTO default_org_id FROM public.organizations WHERE slug = 'inkloom-workspace' LIMIT 1;
    IF default_org_id IS NULL THEN
        INSERT INTO public.organizations (name, slug)
        VALUES ('Inkloom Brand Studio', 'inkloom-workspace')
        RETURNING id INTO default_org_id;
    END IF;

    -- Security fix: Always assign default 'creator' role. Never trust client-supplied user metadata.
    user_initial_role := 'creator'::user_role;

    INSERT INTO public.profiles (id, organization_id, email, full_name, role)
    VALUES (
        NEW.id,
        default_org_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        user_initial_role
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Drop if already exists to ensure idempotent re-runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7.2 Prevent role and organization escalation on profile updates
CREATE OR REPLACE FUNCTION public.prevent_profile_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- Block client-side authenticated users from modifying their own role or organization
    IF auth.uid() IS NOT NULL AND auth.role() = 'authenticated' THEN
        IF NEW.role <> OLD.role THEN
            RAISE EXCEPTION 'Modifying profile role directly is forbidden. Roles must be assigned by workspace administrator.';
        END IF;

        IF NEW.organization_id <> OLD.organization_id THEN
            RAISE EXCEPTION 'Modifying profile organization directly is forbidden.';
        END IF;
    END IF;

    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_profile_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_escalation();

-- 8. DEFAULT SEED DATA
INSERT INTO public.organizations (name, slug)
VALUES ('Inkloom Brand Studio', 'inkloom-workspace')
ON CONFLICT (slug) DO NOTHING;
