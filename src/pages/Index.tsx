
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Calendar, Clock, Home, Search, User, MessageSquare, Check, Settings } from "lucide-react";
import Header from "@/components/Header";
import CourseCard from "@/components/CourseCard";
import ProgressStats from "@/components/ProgressStats";
import TrendsSection from "@/components/TrendsSection";
import ChatSupport from "@/components/ChatSupport";
import LessonManager from "@/components/LessonManager";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const userProgress = {
    totalCourses: 12,
    completedCourses: 4,
    inProgress: 3,
    totalXP: 2450,
    level: 8,
    badges: 12
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

  const categories = [
    { name: "Introdução a IA Generativa", count: 8, color: "bg-gradient-to-r from-purple-500 to-pink-500" },
    { name: "Prompt Engineering", count: 12, color: "bg-gradient-to-r from-blue-500 to-cyan-500" },
    { name: "Agentes de AI", count: 6, color: "bg-gradient-to-r from-green-500 to-emerald-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
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
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Admin
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
                  <h1 className="text-3xl font-bold mb-2">Bem-vindo de volta, João!</h1>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
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
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Catálogo de Cursos</h1>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} showFullDetails />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <TrendsSection />
          </TabsContent>

          <TabsContent value="admin" className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Administração de Conteúdo</h1>
            </div>
            
            <LessonManager 
              courseId={1} 
              courseName="IA Generativa para Negócios" 
            />
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
                      JS
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">João Santos</h3>
                      <p className="text-gray-600">joao.santos@email.com</p>
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

          <TabsContent value="support">
            <ChatSupport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
