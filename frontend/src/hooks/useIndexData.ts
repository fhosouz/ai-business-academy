import { useState, useEffect } from 'react';

interface Course {
  id: number;
  title: string;
  description: string;
  is_premium: boolean;
  category: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  courseId: number;
}

interface IndexData {
  categories: Category[];
  courses: Course[];
  loading: boolean;
}

export const useIndexData = (): IndexData => {
  const [data, setData] = useState({
    categories: [],
    courses: [],
    loading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulação - em produção, buscaria do backend
        const mockCategories: Category[] = [
          { id: 1, name: "Fundamentos", description: "Básico de IA", courseId: 1 },
          { id: 2, name: "Avançado", description: "Técnicas avançadas", courseId: 2 }
        ];

        const mockCourses: Course[] = [
          { id: 1, title: "Introdução à IA", description: "Curso básico", is_premium: false, category: "Fundamentos" },
          { id: 2, title: "Machine Learning", description: "Curso avançado", is_premium: true, category: "Avançado" }
        ];

        setData({
          categories: mockCategories,
          courses: mockCourses,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching index data:', error);
        setData({
          categories: [],
          courses: [],
          loading: false
        });
      }
    };

    fetchData();
  }, []);

  return data;
};
