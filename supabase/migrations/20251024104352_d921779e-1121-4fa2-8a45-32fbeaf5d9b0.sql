-- Create recipes table to store all generated recipes
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  servings INTEGER NOT NULL DEFAULT 2,
  prep_time TEXT,
  cook_time TEXT,
  protein INTEGER NOT NULL DEFAULT 0,
  carbs INTEGER NOT NULL DEFAULT 0,
  calories INTEGER NOT NULL DEFAULT 0,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view recipes (public recipe list)
CREATE POLICY "Anyone can view recipes" 
ON public.recipes 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert recipes
CREATE POLICY "Anyone can insert recipes" 
ON public.recipes 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to delete recipes
CREATE POLICY "Anyone can delete recipes" 
ON public.recipes 
FOR DELETE 
USING (true);

-- Create index for search performance
CREATE INDEX idx_recipes_name ON public.recipes USING gin(to_tsvector('english', name));