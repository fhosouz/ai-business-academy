-- Enable RLS on achievements table
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Achievements policies - only admins can manage
CREATE POLICY "Admins can manage achievements"
ON public.achievements
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view achievements"
ON public.achievements
FOR SELECT
USING (true);

-- Add missing policy for user_achievements inserts
CREATE POLICY "System can insert user achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (true);