import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Edit, Trash2 } from "lucide-react";
import { Lesson } from "./types";

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  onDelete: (lessonId: string) => void;
}

const LessonCard = ({ lesson, index, onDelete }: LessonCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Aula {index + 1}</Badge>
              {lesson.is_free && <Badge>Gratuita</Badge>}
              {lesson.categories && <Badge variant="secondary">{lesson.categories.name}</Badge>}
              {lesson.video_url && <Video className="w-4 h-4 text-green-600" />}
            </div>
            <h4 className="font-semibold">{lesson.title}</h4>
            {lesson.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {lesson.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(lesson.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonCard;