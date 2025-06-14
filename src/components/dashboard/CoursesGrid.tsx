import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

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
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Explore por Categoria</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <Card 
            key={course.id} 
            className="hover:scale-105 transition-transform cursor-pointer overflow-hidden"
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
              <Badge className={`absolute top-2 right-2 ${course.is_premium ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}`}>
                {course.is_premium ? 'Premium' : 'Free'}
              </Badge>
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
        ))}
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