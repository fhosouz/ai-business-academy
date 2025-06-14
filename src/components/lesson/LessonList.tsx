import { Card, CardContent } from "@/components/ui/card";
import { Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LessonCard from "./LessonCard";
import { Lesson } from "./types";

interface LessonListProps {
  lessons: Lesson[];
  onLessonDeleted: () => void;
  isAddingLesson: boolean;
}

const LessonList = ({ lessons, onLessonDeleted, isAddingLesson }: LessonListProps) => {
  const { toast } = useToast();

  const deleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
      
      onLessonDeleted();
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Aulas Existentes ({lessons.length})</h3>
      
      {lessons.map((lesson, index) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          index={index}
          onDelete={deleteLesson}
        />
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
  );
};

export default LessonList;