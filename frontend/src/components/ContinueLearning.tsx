import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Play, Clock, Crown, Lock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { useUserPlan } from "@/hooks/useUserPlan";
import PremiumTeaser from "./PremiumTeaser";

interface LessonWithProgress {
  id: string;
  title: string;
  description: string;
  category_name: string;
  category_id: string;
  order_index: number;
  duration_minutes?: number;
  status?: string;
  is_premium?: boolean;
  is_free?: boolean;
}

interface ContinueLearningProps {
  onLessonSelect: (categoryId: string, categoryName: string) => void;
  onUpgrade?: () => void;
}

const ContinueLearning = ({ onLessonSelect, onUpgrade }: ContinueLearningProps) => {
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { canAccessPremium } = useUserPlan();

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
            is_premium,
            is_free,
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
            video_duration,
            is_premium,
            is_free,
            category_id,
            categories (
              id,
              name
            )
          `)
          .eq('category_id', categoryId)
          .order('order_index', { ascending: true });

        if (!categoryLessons) continue;

        // Find the next lesson to continue
        let nextLesson = null;
        for (const lesson of categoryLessons) {
          const progress = progressData.find(p => p.lesson_id === lesson.id);
          if (!progress || progress.status === 'in_progress') {
            nextLesson = lesson;
            break;
          }
        }

        if (nextLesson) {
          continueLessons.push({
            id: nextLesson.id,
            title: nextLesson.title,
            description: nextLesson.description,
            category_name: nextLesson.categories?.name || '',
            category_id: nextLesson.category_id,
            order_index: nextLesson.order_index,
            duration_minutes: nextLesson.video_duration ? Math.round(nextLesson.video_duration / 60) : undefined,
            status: progressData.find(p => p.lesson_id === nextLesson.id)?.status,
            is_premium: nextLesson.is_premium,
            is_free: nextLesson.is_free
          });
        }
      }

      setLessons(continueLessons);
    } catch (error) {
      console.error('Error fetching in-progress lessons:', error);
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
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Comece sua jornada em IA</h3>
            <p className="text-muted-foreground mb-4">
              Escolha um curso e comece a aprender com nossas aulas interativas.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
              <TrendingUp className="w-4 h-4" />
              <span>2.847 iniciantes estão aprendendo agora</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Premium Teaser for new users */}
        {!canAccessPremium && (
          <PremiumTeaser
            type="progress"
            title="Acelere seu aprendizado"
            description="Alunos premium aprendem 3x mais rápido com mentoria personalizada e projetos práticos"
            onUpgrade={onUpgrade || (() => {})}
            previewContent={
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span>Mentoria 1-on-1 com especialistas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span>Projetos práticos com feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span>Certificado reconhecido</span>
                </div>
              </div>
            }
            stats={{
              studentsCount: 2847,
              completionRate: 87,
              avgTime: "2.5h"
            }}
          />
        )}
      </div>
    );
  }

  // Separar lições gratuitas e premium
  const freeLessons = lessons.filter(lesson => !lesson.is_premium || lesson.is_free);
  const premiumLessons = lessons.filter(lesson => lesson.is_premium && !lesson.is_free);

  return (
    <div className="space-y-8">
      {/* Free Lessons */}
      {freeLessons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-700 flex items-center gap-2">
            🎓 Continue Aprendendo ({freeLessons.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeLessons.map((lesson) => (
              <Card key={lesson.id} className="hover:shadow-lg transition-shadow border-green-200">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      {lesson.category_name}
                    </Badge>
                    {lesson.status === 'in_progress' && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
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
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {lesson.status === 'in_progress' ? 'Continuar' : 'Iniciar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Premium Lessons */}
      {premiumLessons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-yellow-700 flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Aulas Premium ({premiumLessons.length})
            {!canAccessPremium && (
              <Badge className="bg-yellow-100 text-yellow-800 ml-2">
                Desbloqueie para acessar
              </Badge>
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumLessons.map((lesson) => {
              const canAccess = canAccessPremium;
              
              return (
                <Card 
                  key={lesson.id} 
                  className={`hover:shadow-lg transition-shadow ${
                    !canAccess ? 'opacity-75 relative border-yellow-200' : 'border-yellow-400'
                  }`}
                >
                  {!canAccess && (
                    <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                        <p className="text-white font-semibold">Aula Premium</p>
                        <p className="text-yellow-300 text-sm">Clique para desbloquear</p>
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                        {lesson.category_name}
                      </Badge>
                      <Badge className="bg-yellow-500 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
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
                        onClick={() => canAccess ? onLessonSelect(lesson.category_id, lesson.category_name) : (onUpgrade?.() || null)}
                        className={`w-full ${canAccess ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        disabled={!canAccess}
                      >
                        {canAccess ? (
                          lesson.status === 'in_progress' ? 'Continuar' : 'Iniciar'
                        ) : (
                          <>
                            <Crown className="w-4 h-4 mr-2" />
                            Desbloquear
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Premium Teaser between sections */}
      {!canAccessPremium && premiumLessons.length > 0 && (
        <PremiumTeaser
          type="lesson"
          title="Continue com conteúdo premium"
          description="Você tem {premiumLessons.length} aulas avançadas esperando por você. Desbloqueie agora e não perca o ritmo!"
          onUpgrade={onUpgrade || (() => {})}
          previewContent={
            <div className="space-y-2 text-sm">
              {premiumLessons.slice(0, 3).map((lesson) => (
                <div key={lesson.id} className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span>{lesson.title}</span>
                </div>
              ))}
            </div>
          }
          stats={{
            studentsCount: 2847,
            completionRate: 87,
            avgTime: "2.5h"
          }}
        />
      )}
    </div>
  );
};

export default ContinueLearning;