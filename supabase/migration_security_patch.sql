-- ==============================================================================
-- BrandForge Round 3: Supabase Security Hardening Migration
-- Participant: Vishal S Sollapure | Challenge: Inkloom AI Brand Governance
-- Non-destructive security patch: Fixes role escalation, search_path, and metadata trust
-- ==============================================================================

-- 1. SECURE SEARCH_PATH ON HELPER FUNCTIONS (Mitigates search-path hijacking)
CREATE OR REPLACE FUNCTION public.get_auth_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- 2. HARDEN USER REGISTRATION (Force default 'creator' role, never trust metadata)
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

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. PREVENT ROLE AND ORGANIZATION ESCALATION ON PROFILE UPDATES
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

-- 4. RE-ASSERT STRICT APPEND-ONLY SECURITY FOR AUDIT EVENTS
REVOKE UPDATE, DELETE ON public.audit_events FROM authenticated, anon, public;

-- 5. PROFILES SELECT SELF-RECOVERY (Ensures users can always load their own profile)
DROP POLICY IF EXISTS "profiles_select_org" ON public.profiles;
CREATE POLICY "profiles_select_org" ON public.profiles
    FOR SELECT USING (id = auth.uid() OR organization_id = public.get_auth_org_id());

-- 6. CAMPAIGNS UPDATE WITH CHECK (Permits valid state-machine lifecycle transitions)
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
    )
    WITH CHECK (
        organization_id = public.get_auth_org_id()
        AND (
            -- Creators can keep in drafting or submit to in_review
            (public.get_auth_role() = 'creator' AND current_status IN ('drafting', 'in_review'))
            OR
            -- Custodians can transition to in_review, changes_requested, or brand_approved
            (public.get_auth_role() = 'custodian' AND current_status IN ('in_review', 'changes_requested', 'brand_approved'))
            OR
            -- Legal officers can transition to brand_approved, changes_requested, or legally_cleared
            (public.get_auth_role() = 'legal' AND current_status IN ('brand_approved', 'changes_requested', 'legally_cleared'))
        )
    );

-- 7. CAMPAIGN REVISIONS UPDATE PERMISSION (Enables upserts and revisions updates)
DROP POLICY IF EXISTS "revisions_update_org" ON public.campaign_revisions;
CREATE POLICY "revisions_update_org" ON public.campaign_revisions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c 
            WHERE c.id = campaign_revisions.campaign_id 
            AND c.organization_id = public.get_auth_org_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns c 
            WHERE c.id = campaign_revisions.campaign_id 
            AND c.organization_id = public.get_auth_org_id()
        )
    );


