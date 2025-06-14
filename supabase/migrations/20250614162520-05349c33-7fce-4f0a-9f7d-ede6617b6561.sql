-- Insert a sample admin user (you'll need to replace the user_id with an actual user UUID from auth.users)
-- First, let's check if there are any users that need to be made admin
-- This is just a comment - you'll need to manually set a user as admin using the admin panel once you create one

-- Add a comment for future reference
COMMENT ON TABLE public.user_roles IS 'Table to store user roles. Default role is "user", admins have "admin" role.';