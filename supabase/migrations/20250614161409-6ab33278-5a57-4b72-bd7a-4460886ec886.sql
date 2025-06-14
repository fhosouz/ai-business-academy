-- Create policies for course video uploads (admin only)
CREATE POLICY "Admins can upload course videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'course-videos' AND auth.uid() IS NOT NULL);

-- Create policy for viewing course videos (authenticated users)
CREATE POLICY "Authenticated users can view course videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-videos' AND auth.uid() IS NOT NULL);

-- Create policy for admins to update videos
CREATE POLICY "Admins can update course videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'course-videos' AND auth.uid() IS NOT NULL);

-- Create policy for admins to delete videos
CREATE POLICY "Admins can delete course videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'course-videos' AND auth.uid() IS NOT NULL);