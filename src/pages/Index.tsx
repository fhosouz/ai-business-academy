
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calendar, Home, MessageSquare, Settings, Trophy, User } from "lucide-react";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProgressStats from "@/components/ProgressStats";
import TrendsSection from "@/components/TrendsSection";
import ChatSupport from "@/components/ChatSupport";
import CategoryGrid from "@/components/CategoryGrid";
import CategoryLessons from "@/components/CategoryLessons";
import LessonPlayer from "@/components/LessonPlayer";
import CoursesByCategory from "@/components/courses/CoursesByCategory";
import ContinueLearning from "@/components/ContinueLearning";
import BadgesDisplay from "@/components/BadgesDisplay";
import UserProfile from "@/components/UserProfile";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import CoursesGrid from "@/components/dashboard/CoursesGrid";
import AdminTabsContent from "@/components/admin/AdminTabsContent";
import PremiumUpgradeModal from "@/components/PremiumUpgradeModal-v2";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useIndexData } from "@/hooks/useIndexData";
import { useIndexNavigation } from "@/hooks/useIndexNavigation";
import { useAnalytics } from "@/hooks/useAnalytics";

const Index = () => {
  console.log('=== INDEX COMPONENT RENDER ===');
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { userProgress } = useUserProgress();
  const { plan, canAccessPremium } = useUserPlan();
  const { categories, courses } = useIndexData();
  const { trackEvent } = useAnalytics();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  
  console.log('=== INDEX STATE ===');
  console.log('plan:', plan);
  console.log('canAccessPremium:', canAccessPremium);
  console.log('showPremiumModal:', showPremiumModal);
  console.log('selectedCourse:', selectedCourse);
  
  const {
    activeTab,
    coursesView,
    selectedCategory,
    selectedLesson,
    adminView,
    setAdminView,
    handleCategorySelect,
    handleContinueLearningSelect,
    handleCourseSelect,
    handleLessonSelect,
    handleBackToCategories,
    handleBackToLessons,
    handleSearchResult,
    handleTabChange
  } = useIndexNavigation(courses);

  // Get course data to check if it's free
  const selectedCourseData = selectedCategory?.courseId 
    ? courses.find((c) => c.id === selectedCategory.courseId)
    : null;

  // Enhanced event handlers with analytics tracking and premium restriction
  const handleCourseSelectWithTracking = (courseId: number, courseName: string) => {
    const course = courses.find(c => c.id === courseId);
    
    console.log('=== DEBUG PREMIUM MODAL ===');
    console.log('Course:', course);
    console.log('Course is_premium:', course?.is_premium);
    console.log('Can access premium:', canAccessPremium);
    console.log('User plan:', plan);
    
    // Check if course is premium and user has free plan
    if (course?.is_premium && !canAccessPremium) {
      console.log('=== ABRINDO MODAL PREMIUM ===');
      setSelectedCourse(courseName);
      setShowPremiumModal(true);
      trackEvent('premium_course_blocked', { course_id: courseId, course_name: courseName });
      return;
    }
    
    trackEvent('course_view', { course_id: courseId, course_name: courseName });
    handleCourseSelect(courseId, courseName);
  };

  const handleLessonSelectWithTracking = (lesson: any) => {
    const isCourseFree = selectedCourseData ? !selectedCourseData.is_premium : false;
    const canAccess = isCourseFree || lesson.is_free || canAccessPremium;
    
    console.log('=== DEBUG PREMIUM MODAL LESSON ===');
    console.log('Lesson:', lesson);
    console.log('Lesson is_free:', lesson.is_free);
    console.log('Selected course data:', selectedCourseData);
    console.log('Is course free:', isCourseFree);
    console.log('Can access:', canAccess);
    console.log('Can access premium:', canAccessPremium);
    console.log('User plan:', plan);
    
    // Check if lesson is premium and user has free plan
    if (!canAccess) {
      console.log('=== ABRINDO MODAL PREMIUM LESSON ===');
      setSelectedCourse(lesson.title);
      setShowPremiumModal(true);
      trackEvent('premium_lesson_blocked', { lesson_id: lesson.id, lesson_name: lesson.title });
      return;
    }
    
    trackEvent('lesson_start', { lesson_id: lesson.id, lesson_name: lesson.title });
    handleLessonSelect(lesson);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header onResultSelect={handleSearchResult} />
      
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className={`grid w-full mb-6 md:mb-8 text-xs md:text-sm h-auto overflow-x-auto ${isAdmin ? 'grid-cols-4 md:grid-cols-7' : 'grid-cols-3 md:grid-cols-6'}`}>
            <TabsTrigger value="dashboard" className="flex flex-col items-center gap-1 md:gap-2 px-2 md:px-3 py-2 md:py-3" title="Visão geral do seu progresso e atividades">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Dashboard</span>
              <span className="text-xs text-muted-foreground hidden lg:block">Progresso geral</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex flex-col items-center gap-1 md:gap-2 px-2 md:px-3 py-2 md:py-3" title="Explore todos os cursos disponíveis">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Cursos</span>
              <span className="text-xs text-muted-foreground hidden lg:block">Conteúdo educacional</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex flex-col items-center gap-1 md:gap-2 px-2 md:px-3 py-2 md:py-3" title="Acompanhe as tendências em IA">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Tendências</span>
              <span className="text-xs text-muted-foreground hidden lg:block">Novidades em IA</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex flex-col items-center gap-1 md:gap-2 px-2 md:px-3 py-2 md:py-3" title="Gerenciar plataforma e usuários">
                <Settings className="w-4 h-4" />
                <span className="hidden md:inline text-xs">Admin</span>
                <span className="text-xs text-muted-foreground hidden lg:block">Administração</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="badges" className="flex flex-col items-center gap-1 md:gap-2 px-2 md:px-3 py-2 md:py-3" title="Suas conquistas e certificados">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Badges</span>
              <span className="text-xs text-muted-foreground hidden lg:block">Conquistas</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col items-center gap-1 md:gap-2 px-2 md:px-3 py-2 md:py-3" title="Configurações da sua conta">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Perfil</span>
              <span className="text-xs text-muted-foreground hidden lg:block">Minha conta</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex flex-col items-center gap-1 md:gap-2 px-2 md:px-3 py-2 md:py-3" title="Obtenha ajuda e suporte">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline text-xs">Suporte</span>
              <span className="text-xs text-muted-foreground hidden lg:block">Ajuda</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <WelcomeSection userProgress={userProgress} />
            <ProgressStats userProgress={userProgress} />

            {/* Continue Learning Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Continue Aprendendo
              </h2>
              <ContinueLearning onLessonSelect={handleContinueLearningSelect} />
            </div>

            <CoursesGrid courses={courses} onCourseSelect={handleCourseSelectWithTracking} />
          </TabsContent>

          <TabsContent value="courses" className="space-y-8">
            {coursesView === 'categories' && (
              <>
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold">Cursos Disponíveis</h1>
                </div>
                <CoursesByCategory onCourseSelect={handleCourseSelectWithTracking} />
              </>
            )}

            {coursesView === 'lessons' && selectedCategory && (
              <CategoryLessons
                categoryId={selectedCategory.id}
                categoryName={selectedCategory.name}
                courseId={selectedCategory.courseId}
                onBack={handleBackToCategories}
                onLessonSelect={handleLessonSelectWithTracking}
                onPremiumRequired={(lesson) => {
                  setSelectedCourse(lesson.title);
                  setShowPremiumModal(true);
                }}
                isCourseFree={selectedCourseData ? !selectedCourseData.is_premium : false}
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
            <AdminTabsContent 
              isAdmin={isAdmin}
              roleLoading={roleLoading}
              adminView={adminView}
              setAdminView={setAdminView}
            />
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
      
      <PremiumUpgradeModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        courseName={selectedCourse}
        currentPlan={plan}
      />
      
      {/* Debug Modal State - Remover em produção */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ position: 'fixed', bottom: 10, right: 10, background: 'black', color: 'white', padding: '10px', fontSize: '12px' }}>
          Modal: {showPremiumModal ? 'OPEN' : 'CLOSED'} | Plan: {plan} | CanAccess: {canAccessPremium ? 'YES' : 'NO'}
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
};

export default Index;
