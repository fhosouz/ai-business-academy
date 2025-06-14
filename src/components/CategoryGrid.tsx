import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Category {
  id: number;
  name: string;
  description: string;
}

interface CategoryProgress {
  [categoryId: number]: number;
}

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: number, categoryName: string) => void;
}

const CategoryGrid = ({ categories, onCategorySelect }: CategoryGridProps) => {
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user && categories.length > 0) {
      fetchCategoryProgress();
    } else {
      setLoading(false);
    }
  }, [user, categories]);

  const fetchCategoryProgress = async () => {
    if (!user) return;

    try {
      const progressPromises = categories.map(async (category) => {
        const { data } = await supabase.rpc('get_category_progress', {
          p_category_id: category.id,
          p_user_id: user.id
        });
        return { categoryId: category.id, progress: data || 0 };
      });

      const results = await Promise.all(progressPromises);
      const progressMap: CategoryProgress = {};
      results.forEach(({ categoryId, progress }) => {
        progressMap[categoryId] = progress;
      });
      setCategoryProgress(progressMap);
    } catch (error) {
      console.error('Error fetching category progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradientColor = (index: number) => {
    const gradients = [
      "bg-gradient-to-r from-purple-500 to-pink-500",
      "bg-gradient-to-r from-blue-500 to-cyan-500", 
      "bg-gradient-to-r from-green-500 to-emerald-500"
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <Card key={category.id} className="animate-pulse">
            <CardContent className="p-6">
              <div className="w-16 h-16 rounded-xl bg-gray-200 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {categories.map((category, index) => {
        const progress = categoryProgress[category.id] || 0;
        
        return (
          <Card 
            key={category.id} 
            className="hover:scale-105 transition-transform cursor-pointer"
            onClick={() => onCategorySelect(category.id, category.name)}
          >
            <CardContent className="p-6">
              <div className={`w-16 h-16 rounded-xl ${getGradientColor(index)} mb-4 flex items-center justify-center`}>
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
              
              {user && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CategoryGrid;