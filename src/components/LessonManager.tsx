import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import LessonForm from "./lesson/LessonForm";
import LessonList from "./lesson/LessonList";
import { Lesson } from "./lesson/types";

interface LessonManagerProps {
  courseId: number;
  courseName: string;
}

const LessonManager = ({ courseId, courseName }: LessonManagerProps) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<{id: number; title: string; category_id: number}[]>([]);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    fetchLessons();
    fetchCourses();
  }, [courseId]);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*, categories(id, name)')
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

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, category_id')
        .eq('status', 'published')
        .order('title');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Erro", 
        description: "Erro ao carregar cursos.",
        variant: "destructive",
      });
    }
  };

  const handleLessonCreated = () => {
    fetchLessons();
  };

  const handleLessonDeleted = () => {
    fetchLessons();
  };

  const handleLessonEdit = (lesson: any) => {
    console.log('Edit lesson clicked:', lesson);
    setEditingLesson(lesson);
  };

  const handleEditComplete = () => {
    setEditingLesson(null);
    fetchLessons();
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
          <p className="text-muted-foreground">
            Você não tem permissão para gerenciar aulas.
          </p>
        </CardContent>
      </Card>
    );
  }

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
      </Card>

      <LessonForm
        courseId={courseId}
        courses={courses}
        onLessonCreated={handleLessonCreated}
        lessonsCount={lessons.length}
        editingLesson={editingLesson}
        onEditComplete={handleEditComplete}
      />

      <LessonList
        lessons={lessons}
        onLessonDeleted={handleLessonDeleted}
        onLessonEdit={handleLessonEdit}
        isAddingLesson={isAddingLesson}
      />
    </div>
  );
};

export default LessonManager;