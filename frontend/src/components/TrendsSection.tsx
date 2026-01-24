
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BookOpen, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ArticleDetail from "./ArticleDetail";

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

const TrendsSection = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, excerpt, content, category, author, published_at, thumbnail_url')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setArticles((data || []).map(article => ({
        ...article,
        image_url: article.thumbnail_url || ''
      })));
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar artigos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    const readTime = Math.ceil(words / wordsPerMinute);
    return `${readTime} min`;
  };

  if (selectedArticle) {
    return (
      <ArticleDetail 
        article={selectedArticle} 
        onBack={() => setSelectedArticle(null)} 
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tendências em IA</h1>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Artigos em Destaque
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => (
              <Card key={index} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-lg"></div>
                <CardHeader className="pb-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-6 bg-muted rounded"></div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tendências em IA</h1>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          Artigos em Destaque
        </h2>
        {articles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum artigo disponível</h3>
              <p className="text-muted-foreground">
                Os artigos estão sendo carregados ou ainda não foram publicados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card 
                key={article.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  <img 
                    src={article.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop'}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop';
                    }}
                  />
                </div>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{article.category}</Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(article.published_at), 'dd \'de\' MMM, yyyy', { locale: ptBR })}
                      <Clock className="w-3 h-3" />
                      {calculateReadTime(article.content)}
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Por {article.author}
                    </span>
                    <Button variant="ghost" size="sm" className="group-hover:bg-blue-50">
                      <Eye className="w-4 h-4 mr-2" />
                      Ler mais
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendsSection;
