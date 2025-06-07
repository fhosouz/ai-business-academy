import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VideoPlayerProps {
  videoFileName: string;
  title: string;
  onClose: () => void;
}

const VideoPlayer = ({ videoFileName, title, onClose }: VideoPlayerProps) => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVideo();
  }, [videoFileName]);

  const loadVideo = async () => {
    try {
      setIsLoading(true);
      
      // First try to list files in the bucket to find matching video
      const { data: files, error: listError } = await supabase.storage
        .from('course-videos')
        .list('lessons/', {
          limit: 100,
          search: 'introducao'
        });

      if (listError) {
        console.error('Error listing files:', listError);
      }

      let actualFileName = videoFileName;
      
      // If we found files, try to match one with "introducao" in the name
      if (files && files.length > 0) {
        const matchingFile = files.find(file => 
          file.name.toLowerCase().includes('introducao') ||
          file.name.toLowerCase().includes('inteligencia') ||
          file.name.toLowerCase().includes('artificial')
        );
        
        if (matchingFile) {
          actualFileName = matchingFile.name;
          console.log('Found matching video file:', actualFileName);
        }
      }
      
      // Get the video URL from storage
      const { data: { publicUrl } } = supabase.storage
        .from('course-videos')
        .getPublicUrl(`lessons/${actualFileName}`);
      
      setVideoUrl(publicUrl);
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    const video = document.getElementById('course-video') as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const video = document.getElementById('course-video') as HTMLVideoElement;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const video = document.getElementById('course-video') as HTMLVideoElement;
    if (video) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        video.requestFullscreen();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando vídeo...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>
        
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            id="course-video"
            src={videoUrl}
            className="w-full aspect-video"
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onVolumeChange={(e) => setIsMuted((e.target as HTMLVideoElement).muted)}
          >
            Seu navegador não suporta reprodução de vídeo.
          </video>
          
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black bg-opacity-50 p-2 rounded">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={togglePlay}>
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white" />
                )}
              </Button>
              
              <Button variant="ghost" size="sm" onClick={toggleMute}>
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
              <Maximize className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;