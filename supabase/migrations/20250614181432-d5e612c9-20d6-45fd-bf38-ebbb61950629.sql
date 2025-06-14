-- Atualizar o video_url da lição existente para apontar para o arquivo correto no bucket
UPDATE lessons 
SET video_url = 'https://llqunjamfzknowdzqqkv.supabase.co/storage/v1/object/public/Lessons-content/Introducao Inteligencia Artificial.mp4'
WHERE id = 'e1192506-35a2-480a-adce-44a4c40cd5e1' AND video_url IS NULL;