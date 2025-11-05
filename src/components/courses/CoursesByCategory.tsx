import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserPlan } from "@/hooks/useUserPlan";

interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  is_premium: boolean;
  instructor?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface CoursesByCategory {
  category: Category;
  courses: Course[];
}

interface CoursesByCategoryProps {
  onCourseSelect: (courseId: string, courseName: string) => void;
}

const CoursesByCategory = ({ onCourseSelect }: CoursesByCategoryProps) => {
  const [coursesByCategory, setCoursesByCategory] = useState<CoursesByCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { canAccessPremium } = useUserPlan();

  useEffect(() => {
    fetchCoursesByCategory();
  }, []);

  const fetchCoursesByCategory = async () => {
    try {
      // Buscar categorias ordenadas por ID
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('id');

      if (categoriesError) throw categoriesError;

      // Buscar cursos para cada categoria
      const coursesByCategoryData: CoursesByCategory[] = [];

      for (const category of categories || []) {
        const { data: courses, error: coursesError} = await supabase
          .from('courses')
          .select('*')
          .eq('category_id', category.id)
          .eq('is_published', true)
          .order('created_at');

        if (coursesError) throw coursesError;

        if (courses && courses.length > 0) {
          coursesByCategoryData.push({
            category,
            courses
          });
        }
      }

      setCoursesByCategory(coursesByCategoryData);
    } catch (error) {
      console.error('Error fetching courses by category:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar cursos por categoria.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((index) => (
          <div key={index} className="animate-pulse">
            <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((courseIndex) => (
                <Card key={courseIndex}>
                  <div className="h-32 bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="flex justify-between">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (coursesByCategory.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhum curso disponível</h3>
          <p className="text-muted-foreground">
            Os cursos estão sendo carregados ou ainda não foram cadastrados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {coursesByCategory.map(({ category, courses }) => (
        <div key={category.id}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
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
                      <Badge variant="outline">{category.name}</Badge>
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
      ))}
    </div>
  );
};

export default CoursesByCategory;