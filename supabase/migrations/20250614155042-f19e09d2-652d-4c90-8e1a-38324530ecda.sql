-- Create categories table
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the 3 categories
INSERT INTO public.categories (name, description) VALUES 
  ('Introdução a IA Generativa', 'Fundamentos e conceitos básicos sobre Inteligência Artificial Generativa'),
  ('Prompt Engineering', 'Técnicas e estratégias para criação de prompts eficazes'),
  ('Agentes de AI', 'Desenvolvimento e implementação de agentes inteligentes');

-- Add category_id to lessons table
ALTER TABLE public.lessons 
ADD COLUMN category_id INTEGER REFERENCES public.categories(id);

-- Set default category for existing lessons (first category)
UPDATE public.lessons 
SET category_id = 1 
WHERE category_id IS NULL;

-- Make category_id NOT NULL after setting defaults
ALTER TABLE public.lessons 
ALTER COLUMN category_id SET NOT NULL;

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (readable by everyone, manageable by authenticated users)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage categories" 
ON public.categories 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create trigger for categories timestamps
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();