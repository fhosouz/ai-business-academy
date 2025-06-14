-- Criar tabela para armazenar avaliações CSAT das aulas
CREATE TABLE public.lesson_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.lesson_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own ratings" 
ON public.lesson_ratings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ratings" 
ON public.lesson_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.lesson_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can view all ratings
CREATE POLICY "Admins can view all ratings" 
ON public.lesson_ratings 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_lesson_ratings_updated_at
BEFORE UPDATE ON public.lesson_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela para analytics de acesso às páginas
CREATE TABLE public.page_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  page_path TEXT NOT NULL,
  session_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_analytics ENABLE ROW LEVEL SECURITY;

-- Admins can view all analytics
CREATE POLICY "Admins can view all analytics" 
ON public.page_analytics 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow anonymous users to insert analytics
CREATE POLICY "Anyone can insert analytics" 
ON public.page_analytics 
FOR INSERT 
WITH CHECK (true);