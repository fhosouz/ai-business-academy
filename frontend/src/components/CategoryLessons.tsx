import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Clock, CheckCircle, BookOpen, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import BadgeGenerator from "@/components/BadgeGenerator";

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
  categoryId: string;
  categoryName: string;
  courseId?: string;
  onBack: () => void;
  onLessonSelect: (lesson: Lesson) => void;
  onPremiumRequired?: (lesson: Lesson) => void;
  isCourseFree?: boolean;
}

const CategoryLessons = ({ categoryId, categoryName, courseId, onBack, onLessonSelect, onPremiumRequired, isCourseFree = false }: CategoryLessonsProps) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsProgress, setLessonsProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canAccessPremium } = useUserPlan();

  useEffect(() => {
    fetchLessons();
    if (user) {
      fetchLessonsProgress();
      fetchUserProfile();
    }
  }, [categoryId, courseId, user]);

  // Buscar progresso sempre que voltar para a página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchLessonsProgress();
      }
    };

    const handleLessonProgressUpdate = () => {
      if (user) {
        fetchLessonsProgress();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('lesson-progress-updated', handleLessonProgressUpdate);
    window.addEventListener('user-progress-updated', handleLessonProgressUpdate);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('lesson-progress-updated', handleLessonProgressUpdate);
      window.removeEventListener('user-progress-updated', handleLessonProgressUpdate);
    };
  }, [user]);

  const fetchLessons = async () => {
    try {
      let query = supabase
        .from('lessons')
        .select('*');

      // Se courseId foi fornecido, buscar aulas do curso específico
      if (courseId) {
        query = query.eq('course_id', courseId);
      } else {
        // Caso contrário, buscar por categoria
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('order_index');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Erro",
        description: `Erro ao carregar aulas ${courseId ? 'do curso' : 'da categoria'}.`,
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

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
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

  // Check if all lessons are completed
  const isCoursesCompleted = () => {
    if (lessons.length === 0) return false;
    const completedLessons = lessons.filter(lesson => {
      const progress = getLessonProgress(lesson.id);
      return progress?.status === 'completed';
    });
    return completedLessons.length === lessons.length;
  };

  // Get course skills based on category
  const getCourseSkills = () => {
    const skillsMap: { [key: string]: string[] } = {
      'IA Generativa': ['Prompt Engineering', 'ChatGPT', 'Geração de Conteúdo', 'IA Conversacional'],
      'Machine Learning': ['Algoritmos ML', 'Análise de Dados', 'Python', 'Estatística'],
      'Deep Learning': ['Redes Neurais', 'TensorFlow', 'PyTorch', 'Visão Computacional'],
      'Automação': ['RPA', 'Fluxos de Trabalho', 'Integração de Sistemas', 'Otimização de Processos']
    };
    return skillsMap[categoryName] || ['Inteligência Artificial', 'Tecnologia', 'Inovação'];
  };

  const handleLessonClick = (lesson: Lesson) => {
    const canAccess = isCourseFree || lesson.is_free || canAccessPremium;
    // Check if lesson is premium and user has free plan
    if (!canAccess) {
      if (onPremiumRequired) {
        onPremiumRequired(lesson);
      } else {
        toast({
          title: "Conteúdo Premium",
          description: "Esta aula está disponível apenas para usuários premium.",
          variant: "destructive",
        });
      }
      return;
    }
    
    onLessonSelect(lesson);
  };

  if (loading) {
    return <div className="text-center">Carregando aulas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">{categoryName}</h1>
        </div>
        
        {isCoursesCompleted() && user && userProfile && (
          <BadgeGenerator
            courseName={categoryName}
            completionDate={new Date().toLocaleDateString('pt-BR')}
            userName={userProfile.display_name || user.email?.split('@')[0] || 'Usuário'}
            skills={getCourseSkills()}
          />
        )}
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
            const isPremium = !lesson.is_free;
            const canAccess = isCourseFree || lesson.is_free || canAccessPremium;
            
            return (
              <Card 
                key={lesson.id} 
                className={`hover:shadow-lg transition-shadow cursor-pointer overflow-hidden ${
                  !canAccess ? 'opacity-75 relative' : ''
                }`}
                onClick={() => handleLessonClick(lesson)}
              >
                {!canAccess && (
                  <div className="absolute inset-0 bg-black/10 z-10 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-gray-600" />
                  </div>
                )}
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
                    {lesson.is_free ? (
                      <Badge className="bg-green-500 text-white">Free</Badge>
                    ) : (
                      <Badge className="bg-yellow-500 text-white">Premium</Badge>
                    )}
                    {!canAccess && (
                      <Badge className="bg-gray-600 text-white">
                        <Lock className="w-3 h-3 mr-1" />
                        Bloqueado
                      </Badge>
                    )}
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