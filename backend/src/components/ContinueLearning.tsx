import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Play, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

interface LessonWithProgress {
  id: string;
  title: string;
  description: string;
  category_name: string;
  category_id: string;
  order_index: number;
  duration_minutes?: number;
  status?: string;
}

interface ContinueLearningProps {
  onLessonSelect: (categoryId: string, categoryName: string) => void;
}

const ContinueLearning = ({ onLessonSelect }: ContinueLearningProps) => {
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchInProgressLessons();
    }
  }, [user]);

  const fetchInProgressLessons = async () => {
    if (!user) return;

    try {
      // Get categories that have started lessons
      const { data: progressData } = await supabase
        .from('user_lesson_progress')
        .select(`
          lesson_id,
          status,
          lessons (
            id,
            title,
            description,
            order_index,
            video_duration,
            category_id,
            categories (
              id,
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['in_progress', 'completed']);

      if (!progressData) {
        setLessons([]);
        setLoading(false);
        return;
      }

      // Get unique categories that user has started
      const startedCategoryIds = [...new Set(progressData.map(p => p.lessons?.category_id))];

      // For each started category, get the next lesson to continue
      const continueLessons: LessonWithProgress[] = [];

      for (const categoryId of startedCategoryIds) {
        if (!categoryId) continue;

        // Get all lessons in this category ordered by index
        const { data: categoryLessons } = await supabase
          .from('lessons')
          .select(`
            id,
            title,
            description,
            order_index,
            duration_minutes,
            category_id,
            categories (
              id,
              name
            )
          `)
          .eq('category_id', categoryId)
          .order('order_index');

        if (!categoryLessons) continue;

        // Find the first lesson that's not completed
        const userProgressInCategory = progressData.filter(p => p.lessons?.category_id === categoryId);
        const completedLessonIds = userProgressInCategory
          .filter(p => p.status === 'completed')
          .map(p => p.lesson_id);

        const nextLesson = categoryLessons.find(lesson => 
          !completedLessonIds.includes(lesson.id)
        );

        if (nextLesson && nextLesson.categories) {
          const lessonProgress = userProgressInCategory.find(p => p.lesson_id === nextLesson.id);
          continueLessons.push({
            ...nextLesson,
            category_name: nextLesson.categories.name,
            status: lessonProgress?.status || 'not_started'
          });
        }
      }

      setLessons(continueLessons);
    } catch (error) {
      console.error('Error fetching continue learning lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma aula em progresso</h3>
          <p className="text-muted-foreground">
            Comece uma nova categoria para ver suas aulas aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map((lesson) => (
        <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{lesson.category_name}</Badge>
              {lesson.status === 'in_progress' && (
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  Em Progresso
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">{lesson.title}</CardTitle>
            <CardDescription>{lesson.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lesson.duration_minutes && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Play className="w-4 h-4" />
                  {lesson.duration_minutes}min
                </div>
              )}
              <Button 
                onClick={() => onLessonSelect(lesson.category_id, lesson.category_name)}
                className="w-full"
              >
                {lesson.status === 'in_progress' ? 'Continuar' : 'Iniciar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ContinueLearning;