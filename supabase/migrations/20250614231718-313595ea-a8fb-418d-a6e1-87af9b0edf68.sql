-- Add display_order column to courses table for ordering courses within categories
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create index for better performance on ordering
CREATE INDEX IF NOT EXISTS idx_courses_display_order ON public.courses(category_id, display_order);