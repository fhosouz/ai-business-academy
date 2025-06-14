import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Shield, BarChart3 } from "lucide-react";
import CourseManager from "@/components/CourseManager";
import LessonManager from "@/components/LessonManager";
import AdminManager from "@/components/AdminManager";
import AdminAnalytics from "@/components/admin/AdminAnalytics";

interface AdminTabsContentProps {
  isAdmin: boolean;
  roleLoading: boolean;
  adminView: 'courses' | 'lessons' | 'admins' | 'analytics';
  setAdminView: (view: 'courses' | 'lessons' | 'admins' | 'analytics') => void;
}

const AdminTabsContent = ({ isAdmin, roleLoading, adminView, setAdminView }: AdminTabsContentProps) => {
  if (roleLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Verificando permissões...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta área. Entre em contato com um administrador.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Painel de Administração</h1>
      </div>
      
      <Tabs value={adminView} onValueChange={(value) => setAdminView(value as 'courses' | 'lessons' | 'admins' | 'analytics')} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Aulas
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Admins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AdminAnalytics />
        </TabsContent>

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
  );
};

export default AdminTabsContent;