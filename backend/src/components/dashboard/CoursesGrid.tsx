import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Lock } from "lucide-react";
import { useUserPlan } from "@/hooks/useUserPlan";

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
}

interface CoursesGridProps {
  courses: Course[];
  onCourseSelect: (courseId: number, courseName: string) => void;
}

const CoursesGrid = ({ courses, onCourseSelect }: CoursesGridProps) => {
  const { canAccessPremium } = useUserPlan();
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Explore por Categoria</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => {
          const isPremium = course.is_premium;
          const canAccess = !isPremium || canAccessPremium;
          
          return (
            <Card 
              key={course.id} 
              className={`hover:scale-105 transition-transform cursor-pointer overflow-hidden ${
                !canAccess ? 'opacity-75 relative' : ''
              }`}
              onClick={() => onCourseSelect(course.id, course.title)}
            >
              {!canAccess && (
                <div className="absolute inset-0 bg-black/10 z-10 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-gray-600" />
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
                <Badge className={`absolute top-2 right-2 ${
                  isPremium ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                }`}>
                  {isPremium ? 'Premium' : 'Free'}
                </Badge>
                {!canAccess && (
                  <Badge className="absolute top-2 left-2 bg-gray-600 text-white">
                    <Lock className="w-3 h-3 mr-1" />
                    Bloqueado
                  </Badge>
                )}
              </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
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