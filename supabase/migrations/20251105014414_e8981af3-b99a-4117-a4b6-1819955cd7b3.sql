-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for categories
CREATE POLICY "Anyone can view categories"
  ON public.categories
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert the 3 modules/categories
INSERT INTO public.categories (name, description, icon) VALUES
  ('Ciclo básico e fundamentos da IA', 'Aprenda os fundamentos da Inteligência Artificial', '🎓'),
  ('Gestão de produtos e Gestão Comercial', 'Domine a gestão de produtos e processos comerciais com IA', '📊'),
  ('Automações com IA', 'Automatize processos usando Inteligência Artificial', '🤖')
ON CONFLICT DO NOTHING;

-- Update courses table to use category as UUID reference
ALTER TABLE public.courses 
  DROP COLUMN IF EXISTS category CASCADE;

ALTER TABLE public.courses 
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON public.courses(category_id);

-- Update lessons table structure
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id);

-- Add instructor and image_url columns to courses if missing
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS instructor text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';

-- Add author column to articles if missing
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Assign first category to existing courses if any
UPDATE public.courses 
SET category_id = (SELECT id FROM public.categories LIMIT 1)
WHERE category_id IS NULL;

-- Create user_lesson_progress table if not exists
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  status text DEFAULT 'not_started',
  progress_percentage integer DEFAULT 0,
  last_watched_position integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own progress"
  ON public.user_lesson_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_lesson_progress
  FOR ALL
  USING (auth.uid() = user_id);

-- Create RPC function for category progress
CREATE OR REPLACE FUNCTION public.get_category_progress(category_id uuid, user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_lessons integer;
  completed_lessons integer;
BEGIN
  -- Count total lessons in category
  SELECT COUNT(*)
  INTO total_lessons
  FROM lessons l
  JOIN courses c ON l.course_id = c.id
  WHERE c.category_id = get_category_progress.category_id;
  
  IF total_lessons = 0 THEN
    RETURN 0;
  END IF;
  
  -- Count completed lessons
  SELECT COUNT(*)
  INTO completed_lessons
  FROM user_lesson_progress ulp
  JOIN lessons l ON ulp.lesson_id = l.id
  JOIN courses c ON l.course_id = c.id
  WHERE c.category_id = get_category_progress.category_id
    AND ulp.user_id = get_category_progress.user_id
    AND ulp.status = 'completed';
  
  RETURN (completed_lessons * 100 / total_lessons);
END;
$$;