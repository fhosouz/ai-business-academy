-- Create the course-videos storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-videos', 'course-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Remove any existing conflicting policies
DROP POLICY IF EXISTS "Allow authenticated users to upload course videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view course videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update course videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete course videos" ON storage.objects;

-- Create comprehensive policies for the course-videos bucket
CREATE POLICY "Public can view course videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-videos');

CREATE POLICY "Authenticated users can upload course videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-videos');

CREATE POLICY "Authenticated users can update course videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'course-videos');

CREATE POLICY "Authenticated users can delete course videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-videos');