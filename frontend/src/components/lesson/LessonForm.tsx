import { useState, useEffect } from "react";
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
interface Course {
  id: string;
  title: string;
  category_id?: string;
}

interface LessonFormProps {
  courseId?: string;
  courses: Course[];
  onLessonCreated: () => void;
  lessonsCount: number;
  editingLesson?: any;
  onEditComplete?: () => void;
}

const LessonForm = ({ courseId, courses, onLessonCreated, lessonsCount, editingLesson, onEditComplete }: LessonFormProps) => {
  const [isOpen, setIsOpen] = useState(!!editingLesson);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [newLesson, setNewLesson] = useState({
    title: editingLesson?.title || "",
    description: editingLesson?.description || "",
    video_url: editingLesson?.video_url || "",
    is_free: editingLesson?.is_free || false,
    course_id: editingLesson?.course_id || courseId,
    order_index: editingLesson?.order_index ?? lessonsCount,
    plan_type: editingLesson?.plan_type || "free",
  });
  const { toast } = useToast();

  // Buscar detalhes do curso quando courseId ou courses mudam
  useEffect(() => {
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course || null);
  }, [courseId, courses]);

  // Sync form state when editingLesson changes
  useEffect(() => {
    console.log('EditingLesson changed:', editingLesson);
    if (editingLesson) {
      console.log('Setting form to edit mode');
      setIsOpen(true);
      setNewLesson({
        title: editingLesson.title || "",
        description: editingLesson.description || "",
        video_url: editingLesson.video_url || "",
        is_free: editingLesson.is_free || false,
        course_id: editingLesson.course_id || courseId,
        order_index: editingLesson.order_index ?? lessonsCount,
        plan_type: editingLesson.plan_type || "free",
      });
    } else {
      setIsOpen(false);
    }
  }, [editingLesson, lessonsCount]);

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

    // Buscar category_id do curso selecionado
    const selectedCourseData = courses.find(c => c.id === newLesson.course_id);
    if (!selectedCourseData) {
      toast({
        title: "Erro",
        description: "Curso selecionado não encontrado.",
        variant: "destructive",
      });
      return;
    }

    // Buscar category_id do curso
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('category_id')
      .eq('id', newLesson.course_id)
      .single();

    if (courseError || !courseData) {
      toast({
        title: "Erro",
        description: "Erro ao buscar dados do curso.",
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
            course_id: newLesson.course_id,
            category_id: courseData.category_id,
            order_index: newLesson.order_index,
            plan_type: newLesson.plan_type,
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
            course_id: newLesson.course_id,
            title: newLesson.title,
            description: newLesson.description,
            video_url: newLesson.video_url,
            is_free: newLesson.is_free,
            category_id: courseData.category_id,
            order_index: newLesson.order_index,
            plan_type: newLesson.plan_type,
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
        course_id: courseId,
        order_index: lessonsCount,
        plan_type: "free",
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
              <Label htmlFor="lesson-course">Curso</Label>
              <Select 
                name="course"
                value={newLesson.course_id.toString()} 
                onValueChange={(value) => setNewLesson(prev => ({ ...prev, course_id: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
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

            <div>
              <Label htmlFor="plan-type">Tipo de Plano</Label>
              <Select 
                name="plan_type"
                value={newLesson.plan_type} 
                onValueChange={(value) => setNewLesson(prev => ({ ...prev, plan_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratuito</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
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