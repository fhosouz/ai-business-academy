
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calendar, Home, MessageSquare, Settings, Trophy, User } from "lucide-react";
import Header from "@/components/Header";
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
import { useUserRole } from "@/hooks/useUserRole";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useIndexData } from "@/hooks/useIndexData";
import { useIndexNavigation } from "@/hooks/useIndexNavigation";

const Index = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { userProgress } = useUserProgress();
  const { categories, courses } = useIndexData();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header onResultSelect={handleSearchResult} />
      
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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

            <CoursesGrid courses={courses} onCourseSelect={handleCourseSelect} />
          </TabsContent>

          <TabsContent value="courses" className="space-y-8">
            {coursesView === 'categories' && (
              <>
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold">Cursos Disponíveis</h1>
                </div>
                <CoursesByCategory onCourseSelect={handleCourseSelect} />
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
    </div>
  );
};

export default Index;
