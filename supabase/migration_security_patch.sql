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

