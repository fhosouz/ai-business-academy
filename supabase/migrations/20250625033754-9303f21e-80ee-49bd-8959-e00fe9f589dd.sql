
-- Fix RLS policy issues and enhance security

-- 1. Remove duplicate and conflicting policies on profiles table
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create proper consolidated policies for profiles
CREATE POLICY "Users can manage their own profile" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 2. Fix articles table policy - add missing WITH CHECK clause
DROP POLICY IF EXISTS "Authenticated users can insert articles" ON public.articles;
CREATE POLICY "Authenticated users can insert articles" 
ON public.articles 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 3. Fix lessons table policies - remove conflicting policies and consolidate
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Authenticated users can insert lessons" ON public.lessons;
DROP POLICY IF EXISTS "Authenticated users can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Authenticated users can delete lessons" ON public.lessons;

-- Create consolidated lessons policies
CREATE POLICY "Users can view appropriate lessons based on plan" 
ON public.lessons 
FOR SELECT 
TO authenticated
USING (
  is_free = true OR 
  public.can_access_premium(auth.uid())
);

CREATE POLICY "Admins can manage all lessons" 
ON public.lessons 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Add security function for password strength validation
CREATE OR REPLACE FUNCTION public.validate_password_strength(password_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check minimum length (8 characters)
  IF length(password_text) < 8 THEN
    RETURN false;
  END IF;
  
  -- Check for at least one uppercase letter
  IF password_text !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one lowercase letter
  IF password_text !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one number
  IF password_text !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 5. Create audit log table for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_user_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.admin_audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 6. Add function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type TEXT,
  target_user UUID DEFAULT NULL,
  action_details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (admin_user_id, action, target_user_id, details)
  VALUES (auth.uid(), action_type, target_user, action_details);
END;
$$;
