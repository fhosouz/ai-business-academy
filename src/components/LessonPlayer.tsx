import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play } from "lucide-react";

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
          </div>
          <CardTitle className="text-2xl">{lesson.title}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {lesson.video_url ? (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <video 
                controls 
                className="w-full h-full rounded-lg"
                src={lesson.video_url}
              >
                Seu navegador não suporta vídeos HTML5.
              </video>
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Vídeo não disponível</p>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonPlayer;