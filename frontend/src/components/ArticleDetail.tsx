import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  published_at: string;
  image_url: string;
}

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
}

const ArticleDetail = ({ article, onBack }: ArticleDetailProps) => {
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    const readTime = Math.ceil(words / wordsPerMinute);
    return `${readTime} min`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Tendências
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{article.category}</Badge>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {article.author}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(article.published_at), 'dd \'de\' MMM, yyyy', { locale: ptBR })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {calculateReadTime(article.content)}
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl">{article.title}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img 
              src={article.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop'}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop';
              }}
            />
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-6">
              {article.excerpt}
            </p>
            
            <div className="space-y-4 text-foreground leading-relaxed">
              {article.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-base">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleDetail;