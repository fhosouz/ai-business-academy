import { Card, CardContent } from "@/components/ui/card";
import { Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LessonCard from "./LessonCard";
import { Lesson } from "./types";

interface LessonListProps {
  lessons: Lesson[];
  onLessonDeleted: () => void;
  onLessonEdit: (lesson: Lesson) => void;
  isAddingLesson: boolean;
}

const LessonList = ({ lessons, onLessonDeleted, onLessonEdit, isAddingLesson }: LessonListProps) => {
  const { toast } = useToast();

  const deleteLesson = async (lessonId: string) => {
    try {
      // Get lesson data to extract video file path
      const { data: lesson } = await supabase
        .from('lessons')
        .select('video_url')
        .eq('id', lessonId)
        .single();

      // Delete the lesson from database
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      // If lesson had a video, try to delete it from storage
      if (lesson?.video_url) {
        try {
          // Extract file path from URL
          const url = new URL(lesson.video_url);
          const pathSegments = url.pathname.split('/');
          const bucketIndex = pathSegments.findIndex(segment => segment === 'Lessons-content');
          
          if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
            const filePath = pathSegments.slice(bucketIndex + 1).join('/');
            
            await supabase.storage
              .from('Lessons-content')
              .remove([filePath]);
          }
        } catch (storageError) {
          console.warn('Error deleting video file:', storageError);
          // Don't fail the entire operation if storage deletion fails
        }
      }
      
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
          onEdit={onLessonEdit}
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