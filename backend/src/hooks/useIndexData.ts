import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useIndexData = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias.",
        variant: "destructive",
      });
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar cursos.",
        variant: "destructive",
      });
    }
  };

  const autoRegisterCourses = async () => {
    try {
      // Buscar categorias para mapear os nomes
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) throw categoriesError;

      const categoryMap: { [key: string]: number } = {};
      categoriesData?.forEach(cat => {
        categoryMap[cat.name] = cat.id;
      });

      // Buscar cursos existentes
      const { data: existingCourses, error: coursesError } = await supabase
        .from('courses')
        .select('title');

      if (coursesError) throw coursesError;

      const existingTitles = new Set(existingCourses?.map(course => course.title) || []);

      // Cursos hardcoded para cadastrar
      const coursesToRegister = [
        {
          title: "IA Generativa para Negócios",
          description: "Aprenda como aplicar IA generativa para resolver problemas reais em sua empresa",
          category_name: "Introdução a IA Generativa",
          instructor: "Dr. Maria Silva",
          image_url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
          is_premium: false
        },
        {
          title: "Prompt Engineering Avançado",
          description: "Técnicas avançadas para criar prompts eficazes e obter melhores resultados",
          category_name: "Prompt Engineering",
          instructor: "João Santos",
          image_url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
          is_premium: true
        },
        {
          title: "Automação Inteligente com IA",
          description: "Como automatizar processos empresariais usando inteligência artificial",
          category_name: "Agentes de AI",
          instructor: "Ana Costa",
          image_url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop",
          is_premium: true
        }
      ];

      // Cadastrar apenas cursos que ainda não existem
      for (const course of coursesToRegister) {
        if (!existingTitles.has(course.title)) {
          const category_id = categoryMap[course.category_name];
          if (category_id) {
            const { error } = await supabase
              .from('courses')
              .insert({
                title: course.title,
                description: course.description,
                category_id: category_id,
                instructor: course.instructor,
                image_url: course.image_url,
                is_premium: course.is_premium,
                status: 'published'
              });

            if (error) {
              console.error('Error inserting course:', course.title, error);
            }
          }
        }
      }

      // Recarregar cursos após o cadastro
      fetchCourses();
    } catch (error) {
      console.error('Error auto-registering courses:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCourses();
    autoRegisterCourses();
  }, []);

  return {
    categories,
    courses,
    fetchCategories,
    fetchCourses,
    autoRegisterCourses
  };
};