import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import VideoUpload from "../VideoUpload";
import { Category } from "./types";

interface LessonFormProps {
  courseId: number;
  categories: Category[];
  onLessonCreated: () => void;
  lessonsCount: number;
}

const LessonForm = ({ courseId, categories, onLessonCreated, lessonsCount }: LessonFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    video_url: "",
    is_free: false,
    category_id: 1,
  });
  const { toast } = useToast();

  const handleVideoUploaded = (videoUrl: string, fileName: string) => {
    setNewLesson(prev => ({
      ...prev,
      video_url: videoUrl,
      title: prev.title || fileName.replace(/\.[^/.]+$/, ""),
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
          category_id: newLesson.category_id,
          order_index: lessonsCount,
        });

      if (error) throw error;

      setNewLesson({
        title: "",
        description: "",
        video_url: "",
        is_free: false,
        category_id: 1,
      });
      setIsOpen(false);
      onLessonCreated();

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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Aula</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setIsOpen(true)}
            className="w-full"
            disabled={isOpen}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Nova Aula
          </Button>
        </CardContent>
      </Card>

      {isOpen && (
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

            <div>
              <Label htmlFor="lesson-category">Categoria</Label>
              <Select 
                value={newLesson.category_id.toString()} 
                onValueChange={(value) => setNewLesson(prev => ({ ...prev, category_id: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default LessonForm;