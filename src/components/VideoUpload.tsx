import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Video, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VideoUploadProps {
  onVideoUploaded: (videoUrl: string, fileName: string) => void;
}

const VideoUpload = ({ onVideoUploaded }: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de vídeo.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "O arquivo deve ter no máximo 100MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadVideo = async () => {
    if (!selectedFile) {
      console.log('❌ No file selected');
      return;
    }

    setUploading(true);
    console.log('🔄 Starting video upload...', {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type
    });

    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🔐 Auth check:', { user: user?.id, authError });
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Clean filename and add timestamp
      const fileExtension = selectedFile.name.split('.').pop();
      const cleanFileName = selectedFile.name
        .replace(/\.[^/.]+$/, "") // Remove extension
        .replace(/[^a-zA-Z0-9]/g, '-') // Replace special chars with dash
        .toLowerCase();
      const fileName = `${Date.now()}-${cleanFileName}.${fileExtension}`;
      const filePath = `lessons/${fileName}`;

      console.log('📁 Upload path:', filePath);
      console.log('📊 File details:', {
        originalName: selectedFile.name,
        cleanName: fileName,
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        type: selectedFile.type
      });

      // Check if bucket exists
      console.log('🪣 Checking bucket access...');
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      console.log('🪣 Available buckets:', buckets?.map(b => b.name), bucketError);

      // Attempt upload
      console.log('⬆️ Starting upload to bucket...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-videos')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      console.log('✅ Upload result:', { uploadData, uploadError });

      if (uploadError) {
        console.error('❌ Upload error details:', {
          message: uploadError.message,
          name: uploadError.name,
          uploadError
        });
        throw uploadError;
      }

      // Generate public URL
      console.log('🔗 Generating public URL...');
      const { data: { publicUrl } } = supabase.storage
        .from('course-videos')
        .getPublicUrl(filePath);

      console.log('🔗 Public URL generated:', publicUrl);
      
      // Verify the file was uploaded by listing it
      console.log('🔍 Verifying upload...');
      const { data: files, error: listError } = await supabase.storage
        .from('course-videos')
        .list('lessons/', {
          limit: 100,
          search: cleanFileName
        });
      
      console.log('📋 Files in bucket after upload:', files?.map(f => f.name), listError);

      onVideoUploaded(publicUrl, selectedFile.name);
      setSelectedFile(null);
      
      toast({
        title: "Sucesso!",
        description: "Vídeo enviado com sucesso.",
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Erro",
        description: `Erro ao enviar vídeo: ${error.message || 'Tente novamente.'}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Upload de Vídeo
        </CardTitle>
        <CardDescription>
          Envie o vídeo da aula (máximo 100MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="video-upload">Selecionar Vídeo</Label>
          <Input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span className="text-sm font-medium">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Button
          onClick={uploadVideo}
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Enviar Vídeo
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VideoUpload;