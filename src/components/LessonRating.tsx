import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface LessonRatingProps {
  lessonId: string;
  lessonTitle: string;
}

const LessonRating = ({ lessonId, lessonTitle }: LessonRatingProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [existingRating, setExistingRating] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchExistingRating();
    }
  }, [lessonId, user]);

  const fetchExistingRating = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lesson_ratings')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingRating(data);
        setRating(data.rating);
        setComment(data.comment || "");
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  const handleSubmitRating = async () => {
    if (!user || rating === 0) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('lesson_ratings')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          rating,
          comment: comment.trim() || null,
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;

      toast({
        title: "Avaliação enviada!",
        description: "Obrigado pelo seu feedback.",
      });

      await fetchExistingRating();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar avaliação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">
          {existingRating ? 'Sua Avaliação' : 'Avalie esta Aula'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Como você avalia a aula "{lessonTitle}"?
          </p>
          
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 hover:scale-110 transition-transform"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                {rating} de 5 estrelas
              </span>
            )}
          </div>
        </div>

        <div>
          <Textarea
            placeholder="Deixe seu comentário sobre a aula (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>

        <Button 
          onClick={handleSubmitRating}
          disabled={rating === 0 || loading}
          className="w-full"
        >
          {loading ? 'Enviando...' : existingRating ? 'Atualizar Avaliação' : 'Enviar Avaliação'}
        </Button>

        {existingRating && (
          <p className="text-xs text-muted-foreground text-center">
            Avaliação enviada em {new Date(existingRating.created_at).toLocaleDateString('pt-BR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default LessonRating;