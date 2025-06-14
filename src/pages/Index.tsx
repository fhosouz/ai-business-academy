
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Calendar, Clock, Home, Search, User, MessageSquare, Check, Settings, Shield, Trophy, Award } from "lucide-react";
import Header from "@/components/Header";
import CourseCard from "@/components/CourseCard";
import ProgressStats from "@/components/ProgressStats";
import TrendsSection from "@/components/TrendsSection";
import ChatSupport from "@/components/ChatSupport";
import LessonManager from "@/components/LessonManager";
import AdminManager from "@/components/AdminManager";
import CourseManager from "@/components/CourseManager";
import CategoryGrid from "@/components/CategoryGrid";
import CategoryLessons from "@/components/CategoryLessons";
import LessonPlayer from "@/components/LessonPlayer";
import ContinueLearning from "@/components/ContinueLearning";
import BadgesDisplay from "@/components/BadgesDisplay";
import UserProfile from "@/components/UserProfile";
import { Lesson } from "@/components/lesson/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProgress } from "@/hooks/useUserProgress";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [coursesView, setCoursesView] = useState<'categories' | 'lessons' | 'player'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string } | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [adminView, setAdminView] = useState<'courses' | 'lessons' | 'admins'>('courses');
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { user } = useAuth();
  const { userProgress, loading: progressLoading } = useUserProgress();

  useEffect(() => {
    fetchCategories();
    fetchCourses();
    autoRegisterCourses();
  }, []);

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

  const handleCategorySelect = (categoryId: number, categoryName: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName });
    setCoursesView('lessons');
  };

  const handleContinueLearningSelect = (categoryId: number, categoryName: string) => {
    setActiveTab('courses');
    handleCategorySelect(categoryId, categoryName);
  };

  const handleCourseSelect = (courseId: number, courseName: string) => {
    // Buscar a categoria do curso para navegação
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setActiveTab('courses');
      handleCategorySelect(course.category_id, course.categories?.name || 'Curso');
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    console.log('📥 handleLessonSelect recebeu:', {
      id: lesson.id,
      title: lesson.title,
      video_url: lesson.video_url,
      hasVideo: !!lesson.video_url
    });
    setSelectedLesson(lesson);
    setCoursesView('player');
  };

  const handleBackToCategories = () => {
    setCoursesView('categories');
    setSelectedCategory(null);
  };

  const handleBackToLessons = () => {
    setCoursesView('lessons');
    setSelectedLesson(null);
  };

  // Função para extrair nome do usuário
  const getUserDisplayName = () => {
    if (!user) return "Usuário";
    
    // Tenta primeiro o display_name dos metadados
    const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name;
    if (displayName) return displayName;
    
    // Se não tem, usa a primeira parte do email
    if (user.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    return "Usuário";
  };

  // Função para extrair iniciais do usuário
  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    if (displayName === "Usuário") return "U";
    
    const names = displayName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  };


  const featuredCourses = [
    {
      id: 1,
      title: "IA Generativa para Negócios",
      description: "Aprenda como aplicar IA generativa para resolver problemas reais em sua empresa",
      category: "IA Generativa",
      level: "Iniciante",
      duration: "4h 30min",
      progress: 65,
      instructor: "Dr. Maria Silva",
      image: "photo-1488590528505-98d2b5aba04b",
      isPremium: false
    },
    {
      id: 2,
      title: "Prompt Engineering Avançado",
      description: "Técnicas avançadas para criar prompts eficazes e obter melhores resultados",
      category: "Prompt Engineering",
      level: "Intermediário",
      duration: "6h 15min",
      progress: 30,
      instructor: "João Santos",
      image: "photo-1461749280684-dccba630e2f6",
      isPremium: true
    },
    {
      id: 3,
      title: "Automação Inteligente com IA",
      description: "Como automatizar processos empresariais usando inteligência artificial",
      category: "Automação",
      level: "Avançado",
      duration: "8h 45min",
      progress: 0,
      instructor: "Ana Costa",
      image: "photo-1486312338219-ce68d2c6f44d",
      isPremium: true
    }
  ];

  const handleSearchResult = (result: any) => {
    if (result.type === 'category') {
      setActiveTab('courses');
      handleCategorySelect(result.category_id, result.title);
    } else if (result.type === 'lesson') {
      setActiveTab('courses');
      handleCategorySelect(result.category_id, result.category_name);
      // Find and select the lesson
      setTimeout(() => {
        // This would require additional logic to automatically select the lesson
        console.log('Navigate to lesson:', result);
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header onResultSelect={handleSearchResult} />
      
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          if (value === 'courses') {
            setCoursesView('categories');
            setSelectedCategory(null);
            setSelectedLesson(null);
          }
        }} className="w-full">
          <TabsList className={`grid w-full mb-8 ${isAdmin ? 'grid-cols-7' : 'grid-cols-6'}`}>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Cursos
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Tendências
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Admin
              </TabsTrigger>
            )}
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Suporte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Bem-vindo de volta, {getUserDisplayName()}!</h1>
                  <p className="text-blue-100 text-lg">Continue sua jornada no mundo da Inteligência Artificial</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">Nível {userProgress.level}</div>
                  <div className="text-blue-200">{userProgress.totalXP} XP</div>
                </div>
              </div>
            </div>

            <ProgressStats userProgress={userProgress} />

            {/* Continue Learning Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Continue Aprendendo
              </h2>
              <ContinueLearning onLessonSelect={handleContinueLearningSelect} />
            </div>

            {/* Courses Grid */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Explore por Categoria</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                  <Card 
                    key={course.id} 
                    className="hover:scale-105 transition-transform cursor-pointer overflow-hidden"
                    onClick={() => handleCourseSelect(course.id, course.title)}
                  >
                    <div className="relative h-32">
                      <img 
                        src={course.image_url || `https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop`}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop`;
                        }}
                      />
                      {course.is_premium && (
                        <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{course.categories?.name}</Badge>
                        {course.instructor && (
                          <span className="text-xs text-muted-foreground">{course.instructor}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {courses.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum curso disponível</h3>
                    <p className="text-muted-foreground">
                      Os cursos estão sendo carregados ou ainda não foram cadastrados.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-8">
            {coursesView === 'categories' && (
              <>
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold">Categorias de Cursos</h1>
                </div>
                <CategoryGrid 
                  categories={categories} 
                  onCategorySelect={handleCategorySelect} 
                />
              </>
            )}

            {coursesView === 'lessons' && selectedCategory && (
              <CategoryLessons
                categoryId={selectedCategory.id}
                categoryName={selectedCategory.name}
                onBack={handleBackToCategories}
                onLessonSelect={handleLessonSelect}
              />
            )}

            {coursesView === 'player' && selectedLesson && (
              <LessonPlayer
                lesson={selectedLesson}
                onBack={handleBackToLessons}
              />
            )}
          </TabsContent>

          <TabsContent value="trends">
            <TrendsSection />
          </TabsContent>

          <TabsContent value="admin" className="space-y-8">
            {roleLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Verificando permissões...</p>
              </div>
            ) : !isAdmin ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
                  <p className="text-muted-foreground">
                    Você não tem permissão para acessar esta área. Entre em contato com um administrador.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold">Painel de Administração</h1>
                </div>
                
                <Tabs value={adminView} onValueChange={(value) => setAdminView(value as 'courses' | 'lessons' | 'admins')} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="courses" className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Gerenciar Cursos
                    </TabsTrigger>
                    <TabsTrigger value="lessons" className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Gerenciar Aulas
                    </TabsTrigger>
                    <TabsTrigger value="admins" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Gerenciar Administradores
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="courses">
                    <CourseManager />
                  </TabsContent>

                  <TabsContent value="lessons">
                    <LessonManager 
                      courseId={1} 
                      courseName="IA Generativa para Negócios" 
                    />
                  </TabsContent>

                  <TabsContent value="admins">
                    <AdminManager />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>

          <TabsContent value="badges">
            <BadgesDisplay />
          </TabsContent>

          <TabsContent value="support">
            <ChatSupport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
