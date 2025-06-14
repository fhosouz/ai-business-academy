import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, BookOpen, Play, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'category';
  category_name?: string;
  category_id?: number;
  order_index?: number;
  video_duration?: number;
}

interface SearchProps {
  onResultSelect: (result: SearchResult) => void;
}

const SearchComponent = ({ onResultSelect }: SearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        performSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const performSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      // Search lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          description,
          order_index,
          video_duration,
          category_id,
          categories (
            name
          )
        `)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(10);

      if (lessonsError) throw lessonsError;

      // Search categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, description')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(5);

      if (categoriesError) throw categoriesError;

      const searchResults: SearchResult[] = [
        ...(categoriesData?.map(category => ({
          id: category.id.toString(),
          title: category.name,
          description: category.description || "",
          type: 'category' as const,
          category_id: category.id,
        })) || []),
        ...(lessonsData?.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description || "",
          type: 'lesson' as const,
          category_name: lesson.categories?.name,
          category_id: lesson.category_id,
          order_index: lesson.order_index,
          video_duration: lesson.video_duration,
        })) || []),
      ];

      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: "Erro",
        description: "Erro ao realizar busca.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result);
    setShowResults(false);
    setSearchTerm("");
  };

  const clearSearch = () => {
    setSearchTerm("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar aulas e categorias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {isSearching ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Buscando...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Nenhum resultado encontrado</p>
              </div>
            ) : (
              <div className="divide-y">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="p-4 hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        {result.type === 'category' ? (
                          <BookOpen className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Play className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{result.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {result.type === 'category' ? 'Categoria' : 'Aula'}
                          </Badge>
                        </div>
                        
                        {result.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {result.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 mt-2">
                          {result.category_name && (
                            <span className="text-xs text-muted-foreground">
                              {result.category_name}
                            </span>
                          )}
                          
                          {result.video_duration && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {Math.floor(result.video_duration / 60)}min
                            </div>
                          )}
                          
                          {result.order_index !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              Aula {result.order_index + 1}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchComponent;