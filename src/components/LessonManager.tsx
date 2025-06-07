import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Video, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import VideoUpload from "./VideoUpload";

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  video_duration?: number;
  order_index: number;
  is_free: boolean;
  course_id: number;
}

interface LessonManagerProps {
  courseId: number;
  courseName: string;
}

const LessonManager = ({ courseId, courseName }: LessonManagerProps) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    video_url: "",
    is_free: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar aulas.",
        variant: "destructive",
      });
    }
  };

  const handleVideoUploaded = (videoUrl: string, fileName: string) => {
    setNewLesson(prev => ({
      ...prev,
      video_url: videoUrl,
      title: prev.title || fileName.replace(/\.[^/.]+$/, ""), // Remove extension if title is empty
    }));
  };

  const createLesson = async () => {
    if (!newLesson.title.trim()) {
      toast({
        title: "Erro",
        description: "Título da aula é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('lessons')
        .insert({
          course_id: courseId,
          title: newLesson.title,
          description: newLesson.description,
          video_url: newLesson.video_url,
          is_free: newLesson.is_free,
          order_index: lessons.length,
        });

      if (error) throw error;

      setNewLesson({
        title: "",
        description: "",
        video_url: "",
        is_free: false,
      });
      setIsAddingLesson(false);
      fetchLessons();

      toast({
        title: "Sucesso!",
        description: "Aula criada com sucesso.",
      });
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar aula.",
        variant: "destructive",
      });
    }
  };

  const deleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
      
      fetchLessons();
      toast({
        title: "Sucesso!",
        description: "Aula removida com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover aula.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Gerenciar Aulas - {courseName}
          </CardTitle>
          <CardDescription>
            Adicione e gerencie as aulas do curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setIsAddingLesson(true)}
            className="w-full"
            disabled={isAddingLesson}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Nova Aula
          </Button>
        </CardContent>
      </Card>

      {isAddingLesson && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Aula</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <VideoUpload onVideoUploaded={handleVideoUploaded} />
            
            <div>
              <Label htmlFor="lesson-title">Título da Aula</Label>
              <Input
                id="lesson-title"
                value={newLesson.title}
                onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Introdução à IA Generativa"
              />
            </div>

            <div>
              <Label htmlFor="lesson-description">Descrição</Label>
              <Textarea
                id="lesson-description"
                value={newLesson.description}
                onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o conteúdo da aula..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-free"
                checked={newLesson.is_free}
                onCheckedChange={(checked) => setNewLesson(prev => ({ ...prev, is_free: checked }))}
              />
              <Label htmlFor="is-free">Aula gratuita</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={createLesson} className="flex-1">
                Criar Aula
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddingLesson(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Aulas Existentes ({lessons.length})</h3>
        {lessons.map((lesson, index) => (
          <Card key={lesson.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Aula {index + 1}</Badge>
                    {lesson.is_free && <Badge>Gratuita</Badge>}
                    {lesson.video_url && <Video className="w-4 h-4 text-green-600" />}
                  </div>
                  <h4 className="font-semibold">{lesson.title}</h4>
                  {lesson.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {lesson.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteLesson(lesson.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {lessons.length === 0 && !isAddingLesson && (
          <Card>
            <CardContent className="p-8 text-center">
              <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhuma aula criada ainda. Adicione a primeira aula para começar!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LessonManager;