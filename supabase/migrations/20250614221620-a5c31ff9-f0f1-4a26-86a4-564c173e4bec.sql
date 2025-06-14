-- Create sequence for courses first
CREATE SEQUENCE IF NOT EXISTS courses_id_seq;

-- Create courses table
CREATE TABLE public.courses (
  id INTEGER NOT NULL DEFAULT nextval('courses_id_seq'::regclass) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT,
  category_id INTEGER NOT NULL REFERENCES public.categories(id),
  instructor TEXT,
  image_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'))
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policies for courses
CREATE POLICY "Anyone can view published courses" 
ON public.courses 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Authenticated users can view all courses" 
ON public.courses 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage courses" 
ON public.courses 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update lessons table to reference courses instead of just category_id
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS course_id_ref INTEGER REFERENCES public.courses(id);

-- Create function to calculate course progress
CREATE OR REPLACE FUNCTION public.get_course_progress(p_course_id INTEGER, p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
BEGIN
  -- Get total lessons count for the course
  SELECT COUNT(*) INTO total_lessons
  FROM public.lessons
  WHERE course_id = p_course_id;
  
  -- Get completed lessons count for the user
  SELECT COUNT(*) INTO completed_lessons
  FROM public.lessons l
  JOIN public.user_lesson_progress ulp ON l.id = ulp.lesson_id
  WHERE l.course_id = p_course_id 
    AND ulp.user_id = p_user_id 
    AND ulp.status = 'completed';
  
  -- Return percentage
  IF total_lessons = 0 THEN
    RETURN 0;
  ELSE
    RETURN ROUND((completed_lessons::NUMERIC / total_lessons::NUMERIC) * 100, 2);
  END IF;
END;
$$;

-- Create function to calculate category progress
CREATE OR REPLACE FUNCTION public.get_category_progress(p_category_id INTEGER, p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
BEGIN
  -- Get total lessons count for the category
  SELECT COUNT(*) INTO total_lessons
  FROM public.lessons
  WHERE category_id = p_category_id;
  
  -- Get completed lessons count for the user
  SELECT COUNT(*) INTO completed_lessons
  FROM public.lessons l
  JOIN public.user_lesson_progress ulp ON l.id = ulp.lesson_id
  WHERE l.category_id = p_category_id 
    AND ulp.user_id = p_user_id 
    AND ulp.status = 'completed';
  
  -- Return percentage
  IF total_lessons = 0 THEN
    RETURN 0;
  ELSE
    RETURN ROUND((completed_lessons::NUMERIC / total_lessons::NUMERIC) * 100, 2);
  END IF;
END;
$$;