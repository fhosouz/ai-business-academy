import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Lock, Crown, Users, Clock, Star } from "lucide-react";
import { useUserPlan } from "@/hooks/useUserPlan";
import PremiumTeaser from "../PremiumTeaser";

interface Course {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  is_premium: boolean;
  instructor?: string;
  categories?: {
    name: string;
  };
  students_count?: number;
  duration_hours?: number;
  rating?: number;
}

interface CoursesGridProps {
  courses: Course[];
  onCourseSelect: (courseId: number, courseName: string) => void;
  onUpgrade?: () => void;
}

const CoursesGrid = ({ courses, onCourseSelect, onUpgrade }: CoursesGridProps) => {
  const { canAccessPremium } = useUserPlan();
  
  // Separar cursos gratuitos e premium
  const freeCourses = courses.filter(course => !course.is_premium);
  const premiumCourses = courses.filter(course => course.is_premium);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Explore por Categoria</h2>
        {!canAccessPremium && premiumCourses.length > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-blue-600">{premiumCourses.length}</span> cursos premium disponíveis
          </div>
        )}
      </div>
      
      {/* Premium Teaser Section */}
      {!canAccessPremium && premiumCourses.length > 0 && (
        <div className="mb-8">
          <PremiumTeaser
            type="course"
            title="Conteúdo Premium Exclusivo"
            description="Desbloqueie {premiumCourses.length} cursos avançados com projetos práticos e mentoria especializada"
            onUpgrade={onUpgrade || (() => {})}
            previewContent={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {premiumCourses.slice(0, 4).map((course) => (
                  <div key={course.id} className="flex items-center gap-2 text-sm">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{course.title}</span>
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
        </div>
      )}

      {/* Free Courses Section */}
      {freeCourses.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-green-700">
            🎓 Cursos Gratuitos ({freeCourses.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeCourses.map((course) => (
              <Card 
                key={course.id} 
                className="hover:scale-105 transition-transform cursor-pointer overflow-hidden border-green-200"
                onClick={() => onCourseSelect(course.id, course.title)}
              >
                <div className="relative h-32">
                  <img 
                    src={course.image_url || `https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop`}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop`;
                    }}
                  />
                  <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                    Free
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                  
                  {/* Course Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-gray-600">
                    {course.students_count && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{course.students_count}</span>
                      </div>
                    )}
                    {course.duration_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{course.duration_hours}h</span>
                      </div>
                    )}
                    {course.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current text-yellow-500" />
                        <span>{course.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{course.categories?.name}</Badge>
                    {course.instructor && (
                      <span className="text-xs text-muted-foreground">{course.instructor}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Premium Courses Section */}
      {premiumCourses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-yellow-700 flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Cursos Premium ({premiumCourses.length})
            {!canAccessPremium && (
              <Badge className="bg-yellow-100 text-yellow-800 ml-2">
                Desbloqueie para acessar
              </Badge>
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumCourses.map((course) => {
              const canAccess = canAccessPremium;
              
              return (
                <Card 
                  key={course.id} 
                  className={`hover:scale-105 transition-transform cursor-pointer overflow-hidden ${
                    !canAccess ? 'opacity-75 relative border-yellow-200' : 'border-yellow-400'
                  }`}
                  onClick={() => canAccess ? onCourseSelect(course.id, course.title) : (onUpgrade?.() || null)}
                >
                  {!canAccess && (
                    <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                        <p className="text-white font-semibold">Conteúdo Premium</p>
                        <p className="text-yellow-300 text-sm">Clique para desbloquear</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="relative h-32">
                    <img 
                      src={course.image_url || `https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop`}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop`;
                      }}
                    />
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                    
                    {/* Premium Benefits */}
                    <div className="bg-yellow-50 rounded-lg p-2 mb-3">
                      <p className="text-xs text-yellow-800 font-medium">
                        ✅ Projetos práticos • ✅ Mentoria • ✅ Certificado
                      </p>
                    </div>
                    
                    {/* Course Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-gray-600">
                      {course.students_count && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{course.students_count}</span>
                        </div>
                      )}
                      {course.duration_hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{course.duration_hours}h</span>
                        </div>
                      )}
                      {course.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          <span>{course.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{course.categories?.name}</Badge>
                      {course.instructor && (
                        <span className="text-xs text-muted-foreground">{course.instructor}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      
      {courses.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum curso disponível</h3>
            <p className="text-muted-foreground">
              Os cursos estão sendo carregados ou ainda não foram cadastrados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoursesGrid;