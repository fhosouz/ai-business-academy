-- Create user lesson progress tracking table
CREATE TABLE public.user_lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create user badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL DEFAULT 'category_completion',
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id, badge_type)
);

-- Create user certificates table
CREATE TABLE public.user_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  certificate_url TEXT,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;

-- Create policies for user_lesson_progress
CREATE POLICY "Users can view their own lesson progress" 
ON public.user_lesson_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson progress" 
ON public.user_lesson_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" 
ON public.user_lesson_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for user_badges
CREATE POLICY "Users can view their own badges" 
ON public.user_badges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges" 
ON public.user_badges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for user_certificates
CREATE POLICY "Users can view their own certificates" 
ON public.user_certificates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own certificates" 
ON public.user_certificates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_lesson_progress_updated_at
BEFORE UPDATE ON public.user_lesson_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically award badge and certificate when category is completed
CREATE OR REPLACE FUNCTION public.check_category_completion()
RETURNS TRIGGER AS $$
DECLARE
  category_lesson_count INTEGER;
  user_completed_count INTEGER;
  target_category_id INTEGER;
BEGIN
  -- Get the category_id of the completed lesson
  SELECT category_id INTO target_category_id
  FROM public.lessons
  WHERE id = NEW.lesson_id;

  -- Count total lessons in the category
  SELECT COUNT(*) INTO category_lesson_count
  FROM public.lessons
  WHERE category_id = target_category_id;

  -- Count user's completed lessons in this category
  SELECT COUNT(*) INTO user_completed_count
  FROM public.user_lesson_progress ulp
  JOIN public.lessons l ON ulp.lesson_id = l.id
  WHERE ulp.user_id = NEW.user_id 
    AND l.category_id = target_category_id 
    AND ulp.status = 'completed';

  -- If user completed all lessons in category, award badge and certificate
  IF user_completed_count = category_lesson_count THEN
    -- Insert badge (ignore if already exists)
    INSERT INTO public.user_badges (user_id, category_id, badge_type)
    VALUES (NEW.user_id, target_category_id, 'category_completion')
    ON CONFLICT (user_id, category_id, badge_type) DO NOTHING;

    -- Insert certificate (ignore if already exists)
    INSERT INTO public.user_certificates (user_id, category_id)
    VALUES (NEW.user_id, target_category_id)
    ON CONFLICT (user_id, category_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check category completion
CREATE TRIGGER check_category_completion_trigger
AFTER UPDATE ON public.user_lesson_progress
FOR EACH ROW
WHEN (OLD.status != 'completed' AND NEW.status = 'completed')
EXECUTE FUNCTION public.check_category_completion();