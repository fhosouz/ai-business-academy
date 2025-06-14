-- Ensure the Lessons-content storage bucket exists with correct configuration
INSERT INTO storage.buckets (id, name, public) 
VALUES ('Lessons-content', 'Lessons-content', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- Remove any conflicting policies first
DROP POLICY IF EXISTS "Public can view lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete lesson videos" ON storage.objects;

-- Create comprehensive policies for the Lessons-content bucket
CREATE POLICY "Public can view lesson content"
ON storage.objects FOR SELECT
USING (bucket_id = 'Lessons-content');

CREATE POLICY "Authenticated users can upload lesson content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'Lessons-content');

CREATE POLICY "Authenticated users can update lesson content"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'Lessons-content');

CREATE POLICY "Authenticated users can delete lesson content"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'Lessons-content');