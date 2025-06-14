import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  video_duration?: number;
  order_index: number;
  is_free: boolean;
}

interface CategoryLessonsProps {
  categoryId: number;
  categoryName: string;
  onBack: () => void;
  onLessonSelect: (lesson: Lesson) => void;
}

const CategoryLessons = ({ categoryId, categoryName, onBack, onLessonSelect }: CategoryLessonsProps) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLessons();
  }, [categoryId]);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar aulas da categoria.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Carregando aulas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">{categoryName}</h1>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhuma aula disponível nesta categoria ainda.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => (
            <Card 
              key={lesson.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onLessonSelect(lesson)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">Aula {index + 1}</Badge>
                  {lesson.is_free && <Badge variant="secondary">Gratuita</Badge>}
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{lesson.title}</h3>
                
                {lesson.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {lesson.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {lesson.video_duration && (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>{Math.round(lesson.video_duration / 60)} min</span>
                      </>
                    )}
                  </div>
                  
                  <Button size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Assistir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryLessons;