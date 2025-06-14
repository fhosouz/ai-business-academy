
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
import CategoryGrid from "@/components/CategoryGrid";
import CategoryLessons from "@/components/CategoryLessons";
import LessonPlayer from "@/components/LessonPlayer";
import ContinueLearning from "@/components/ContinueLearning";
import BadgesDisplay from "@/components/BadgesDisplay";
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
  const [adminView, setAdminView] = useState<'lessons' | 'admins'>('lessons');
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { user } = useAuth();
  const { userProgress, loading: progressLoading } = useUserProgress();

  useEffect(() => {
    fetchCategories();
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

  const handleCategorySelect = (categoryId: number, categoryName: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName });
    setCoursesView('lessons');
  };

  const handleContinueLearningSelect = (categoryId: number, categoryName: string) => {
    setActiveTab('courses');
    handleCategorySelect(categoryId, categoryName);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
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

            {/* Categories Grid */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Explore por Categoria</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                  <Card key={index} className="hover:scale-105 transition-transform cursor-pointer">
                    <CardContent className="p-4">
                      <div className={`w-12 h-12 rounded-xl ${category.color} mb-3 flex items-center justify-center`}>
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                      <p className="text-xs text-gray-600">{category.count} cursos</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                
                <Tabs value={adminView} onValueChange={(value) => setAdminView(value as 'lessons' | 'admins')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="lessons" className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Gerenciar Aulas
                    </TabsTrigger>
                    <TabsTrigger value="admins" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Gerenciar Administradores
                    </TabsTrigger>
                  </TabsList>

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
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Meu Perfil</CardTitle>
                  <CardDescription>Gerencie suas informações e preferências</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                       {getUserInitials()}
                     </div>
                     <div>
                       <h3 className="text-xl font-semibold">{getUserDisplayName()}</h3>
                       <p className="text-gray-600">{user?.email || "usuario@email.com"}</p>
                       <Badge className="mt-2">Plano Premium</Badge>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{userProgress.completedCourses}</div>
                      <div className="text-sm text-gray-600">Cursos Concluídos</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{userProgress.badges}</div>
                      <div className="text-sm text-gray-600">Badges Conquistadas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
