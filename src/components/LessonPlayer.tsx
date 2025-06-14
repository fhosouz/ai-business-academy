import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  video_duration?: number;
  order_index: number;
  is_free: boolean;
}

interface LessonPlayerProps {
  lesson: Lesson;
  onBack: () => void;
}

const LessonPlayer = ({ lesson, onBack }: LessonPlayerProps) => {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  console.log('🎬 LessonPlayer recebeu lesson:', {
    id: lesson.id,
    title: lesson.title,
    video_url: lesson.video_url,
    hasVideo: !!lesson.video_url
  });

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [lesson.id, user]);

  const fetchProgress = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lesson.id)
        .maybeSingle();

      if (error) throw error;
      setProgress(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsInProgress = async () => {
    if (!user || progress?.status === 'in_progress' || progress?.status === 'completed') return;

    try {
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        });

      if (error) throw error;
      await fetchProgress();
    } catch (error) {
      console.error('Error marking as in progress:', error);
    }
  };

  const markAsCompleted = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          status: 'completed',
          started_at: progress?.started_at || new Date().toISOString(),
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast({
        title: "Parabéns!",
        description: "Aula concluída com sucesso.",
      });
      
      await fetchProgress();
    } catch (error) {
      console.error('Error marking as completed:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar aula como concluída.",
        variant: "destructive",
      });
    }
  };

  const handleVideoPlay = () => {
    markAsInProgress();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Aula {lesson.order_index + 1}</Badge>
            {lesson.is_free && <Badge variant="secondary">Gratuita</Badge>}
            {progress?.status === 'completed' && <Badge className="bg-green-600">Concluída</Badge>}
            {progress?.status === 'in_progress' && <Badge variant="secondary">Em Progresso</Badge>}
          </div>
          <CardTitle className="text-2xl">{lesson.title}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {lesson.video_url ? (
            <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
              <video 
                controls 
                className="w-full h-full"
                src={lesson.video_url}
                crossOrigin="anonymous"
                preload="metadata"
                onPlay={handleVideoPlay}
              >
                <source src={lesson.video_url} type="video/mp4" />
                <source src={lesson.video_url} type="video/webm" />
                <source src={lesson.video_url} type="video/ogg" />
                Seu navegador não suporta vídeos HTML5.
              </video>
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Vídeo não disponível</p>
              </div>
            </div>
          )}

          {lesson.description && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Descrição</h3>
              <p className="text-muted-foreground leading-relaxed">
                {lesson.description}
              </p>
            </div>
          )}

          {progress?.status !== 'completed' && (
            <div className="flex justify-end">
              <Button onClick={markAsCompleted} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar como Concluída
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonPlayer;