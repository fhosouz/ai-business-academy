import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Clock, CheckCircle, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
  const [lessonsProgress, setLessonsProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchLessons();
    if (user) {
      fetchLessonsProgress();
    }
  }, [categoryId, user]);

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

  const fetchLessonsProgress = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, status')
        .eq('user_id', user.id);

      if (error) throw error;
      setLessonsProgress(data || []);
    } catch (error) {
      console.error('Error fetching lessons progress:', error);
    }
  };

  const getLessonProgress = (lessonId: string) => {
    return lessonsProgress.find(p => p.lesson_id === lessonId);
  };

  const getLessonImage = (lesson: Lesson) => {
    // Simple algorithm to assign images based on lesson content
    const images = [
      'photo-1488590528505-98d2b5aba04b',
      'photo-1461749280684-dccba630e2f6', 
      'photo-1486312338219-ce68d2c6f44d',
      'photo-1581091226825-a6a2a5aee158',
      'photo-1498050108023-c5249f4df085'
    ];
    
    // Use lesson order_index to cycle through images
    return `https://images.unsplash.com/${images[lesson.order_index % images.length]}?w=300&h=200&fit=crop`;
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
          {lessons.map((lesson, index) => {
            const progress = getLessonProgress(lesson.id);
            const status = progress?.status || 'not_started';
            
            return (
              <Card 
                key={lesson.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                onClick={() => onLessonSelect(lesson)}
              >
                {/* Lesson Image */}
                <div className="relative h-40 bg-gradient-to-br from-blue-100 to-purple-100">
                  <img 
                    src={getLessonImage(lesson)}
                    alt={lesson.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100%" height="100%" fill="#f3f4f6"/>
                          <g transform="translate(150,100)">
                            <circle cx="0" cy="-20" r="15" fill="#9ca3af"/>
                            <rect x="-25" y="0" width="50" height="30" rx="5" fill="#9ca3af"/>
                          </g>
                        </svg>
                      `)}`;
                    }}
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    {status === 'completed' && (
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Concluída
                      </Badge>
                    )}
                    {status === 'in_progress' && (
                      <Badge variant="secondary">
                        <Play className="w-3 h-3 mr-1" />
                        Em Progresso
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">Aula {index + 1}</Badge>
                    {lesson.is_free && <Badge variant="secondary">Gratuita</Badge>}
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{lesson.title}</h3>
                  
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
                    
                    <Button size="sm" variant={status === 'completed' ? 'secondary' : 'default'}>
                      {status === 'completed' ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Revisar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          {status === 'in_progress' ? 'Continuar' : 'Assistir'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryLessons;