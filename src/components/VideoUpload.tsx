import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube, Link, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoUploadProps {
  onVideoUploaded: (videoUrl: string, fileName: string) => void;
  courseId: number;
}

const VideoUpload = ({ onVideoUploaded, courseId }: VideoUploadProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[\w-]+(&.*)?$/;
    return youtubeRegex.test(url);
  };

  const extractVideoId = (url: string): string => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : "";
  };

  const handleUrlSubmit = async () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o link do YouTube.",
        variant: "destructive",
      });
      return;
    }

    if (!validateYouTubeUrl(youtubeUrl)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um link válido do YouTube.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      const videoId = extractVideoId(youtubeUrl);
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      const videoTitle = `Vídeo YouTube ${videoId}`;

      onVideoUploaded(embedUrl, videoTitle);
      setYoutubeUrl("");
      
      toast({
        title: "Sucesso!",
        description: "Link do YouTube adicionado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar o link do YouTube.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const clearUrl = () => {
    setYoutubeUrl("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="w-5 h-5" />
          Link do YouTube
        </CardTitle>
        <CardDescription>
          Insira o link do vídeo do YouTube (privado ou público)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="youtube-url">Link do YouTube</Label>
          <Input
            id="youtube-url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            disabled={isValidating}
          />
        </div>

        {youtubeUrl && validateYouTubeUrl(youtubeUrl) && (
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Link válido do YouTube</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearUrl}
              disabled={isValidating}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Button
          onClick={handleUrlSubmit}
          disabled={!youtubeUrl || !validateYouTubeUrl(youtubeUrl) || isValidating}
          className="w-full"
        >
          {isValidating ? (
            <>
              <Link className="w-4 h-4 mr-2 animate-spin" />
              Validando...
            </>
          ) : (
            <>
              <Youtube className="w-4 h-4 mr-2" />
              Adicionar Vídeo
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VideoUpload;