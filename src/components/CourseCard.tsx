
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, User, Check } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  progress: number;
  instructor: string;
  image: string;
  isPremium: boolean;
}

interface CourseCardProps {
  course: Course;
  showFullDetails?: boolean;
}

const CourseCard = ({ course, showFullDetails = false }: CourseCardProps) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Iniciante": return "bg-green-100 text-green-800";
      case "Intermediário": return "bg-yellow-100 text-yellow-800";
      case "Avançado": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden">
      {/* Course Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={`https://images.unsplash.com/${course.image}?w=400&h=200&fit=crop`}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
        </div>
        {course.isPremium && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              Premium
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
        </div>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {course.duration}
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {course.instructor}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {course.progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso</span>
              <span>{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        )}

        <div className="flex gap-2">
          {course.progress > 0 ? (
            <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Continuar
            </Button>
          ) : (
            <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Começar
            </Button>
          )}
          
          {showFullDetails && (
            <Button variant="outline" size="sm">
              Detalhes
            </Button>
          )}
        </div>

        {course.progress === 100 && (
          <div className="flex items-center justify-center gap-2 mt-3 text-green-600 text-sm font-medium">
            <Check className="w-4 h-4" />
            Curso Concluído
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCard;
