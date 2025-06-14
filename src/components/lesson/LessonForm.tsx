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
  editingLesson?: any;
  onEditComplete?: () => void;
}

const LessonForm = ({ courseId, categories, onLessonCreated, lessonsCount, editingLesson, onEditComplete }: LessonFormProps) => {
  const [isOpen, setIsOpen] = useState(!!editingLesson);
  const [newLesson, setNewLesson] = useState({
    title: editingLesson?.title || "",
    description: editingLesson?.description || "",
    video_url: editingLesson?.video_url || "",
    is_free: editingLesson?.is_free || false,
    category_id: editingLesson?.category_id || 1,
    order_index: editingLesson?.order_index ?? lessonsCount,
  });
  const { toast } = useToast();

  const handleVideoUploaded = (videoUrl: string, fileName: string) => {
    setNewLesson(prev => ({
      ...prev,
      video_url: videoUrl,
      title: prev.title || fileName.replace(/\.[^/.]+$/, ""),
    }));
  };

  const createOrUpdateLesson = async () => {
    if (!newLesson.title.trim()) {
      toast({
        title: "Erro",
        description: "Título da aula é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingLesson) {
        // Update existing lesson
        const { error } = await supabase
          .from('lessons')
          .update({
            title: newLesson.title,
            description: newLesson.description,
            video_url: newLesson.video_url,
            is_free: newLesson.is_free,
            category_id: newLesson.category_id,
            order_index: newLesson.order_index,
          })
          .eq('id', editingLesson.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Aula atualizada com sucesso.",
        });
        
        if (onEditComplete) {
          onEditComplete();
        }
      } else {
        // Create new lesson
        const { error } = await supabase
          .from('lessons')
          .insert({
            course_id: courseId,
            title: newLesson.title,
            description: newLesson.description,
            video_url: newLesson.video_url,
            is_free: newLesson.is_free,
            category_id: newLesson.category_id,
            order_index: newLesson.order_index,
          });

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Aula criada com sucesso.",
        });
      }

      setNewLesson({
        title: "",
        description: "",
        video_url: "",
        is_free: false,
        category_id: 1,
        order_index: lessonsCount,
      });
      setIsOpen(false);
      onLessonCreated();
    } catch (error) {
      console.error('Error creating/updating lesson:', error);
      toast({
        title: "Erro",
        description: editingLesson ? "Erro ao atualizar aula." : "Erro ao criar aula.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {!editingLesson && (
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
      )}

      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingLesson ? 'Editar Aula' : 'Nova Aula'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <VideoUpload onVideoUploaded={handleVideoUploaded} courseId={courseId} />
            
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
                name="category"
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

            <div>
              <Label htmlFor="lesson-order">Ordem da Aula</Label>
              <Input
                id="lesson-order"
                type="number"
                value={newLesson.order_index}
                onChange={(e) => setNewLesson(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                placeholder="Ordem da aula (0, 1, 2...)"
                min="0"
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
              <Button onClick={createOrUpdateLesson} className="flex-1">
                {editingLesson ? 'Salvar Alterações' : 'Criar Aula'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  if (onEditComplete) {
                    onEditComplete();
                  }
                }}
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