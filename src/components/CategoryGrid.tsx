import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string;
}

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: number, categoryName: string) => void;
}

const CategoryGrid = ({ categories, onCategorySelect }: CategoryGridProps) => {
  const getGradientColor = (index: number) => {
    const gradients = [
      "bg-gradient-to-r from-purple-500 to-pink-500",
      "bg-gradient-to-r from-blue-500 to-cyan-500", 
      "bg-gradient-to-r from-green-500 to-emerald-500"
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {categories.map((category, index) => (
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
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CategoryGrid;