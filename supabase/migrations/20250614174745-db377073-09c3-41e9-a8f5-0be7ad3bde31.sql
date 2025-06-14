-- Create the Lessons-content storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('Lessons-content', 'Lessons-content', true)
ON CONFLICT (id) DO NOTHING;

-- Remove any existing conflicting policies
DROP POLICY IF EXISTS "Allow authenticated users to upload lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete lesson videos" ON storage.objects;

-- Create comprehensive policies for the Lessons-content bucket
CREATE POLICY "Public can view lesson videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'Lessons-content');

CREATE POLICY "Authenticated users can upload lesson videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'Lessons-content');

CREATE POLICY "Authenticated users can update lesson videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'Lessons-content');

CREATE POLICY "Authenticated users can delete lesson videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'Lessons-content');