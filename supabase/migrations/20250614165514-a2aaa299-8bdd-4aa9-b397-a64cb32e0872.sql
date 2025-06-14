-- Remove all existing policies for course-videos bucket
DROP POLICY IF EXISTS "Admins can upload course videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload course videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update course videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own course videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete course videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view course videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view course videos" ON storage.objects;

-- Create simplified and working policies for course-videos bucket
CREATE POLICY "Allow authenticated users to upload course videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-videos');

CREATE POLICY "Allow authenticated users to view course videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'course-videos');

CREATE POLICY "Allow authenticated users to update course videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'course-videos');

CREATE POLICY "Allow authenticated users to delete course videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-videos');