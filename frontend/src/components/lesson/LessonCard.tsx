import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Video, Edit, Trash2 } from "lucide-react";
import { Lesson } from "./types";

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lessonId: string) => void;
}

const LessonCard = ({ lesson, index, onEdit, onDelete }: LessonCardProps) => {
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
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit(lesson)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a aula "{lesson.title}"? 
                    Esta ação não pode ser desfeita e todos os arquivos relacionados serão removidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(lesson.id)}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonCard;