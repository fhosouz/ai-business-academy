-- Fix storage bucket policies for video upload
DROP POLICY IF EXISTS "Allow authenticated users to upload course videos" ON storage.objects;

CREATE POLICY "Allow authenticated users to upload course videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-videos');

-- Add missing DELETE policy for lessons table
CREATE POLICY "Authenticated users can delete lessons"
ON public.lessons FOR DELETE
TO authenticated
USING (auth.role() = 'authenticated');