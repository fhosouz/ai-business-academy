import { useState } from "react";
import { Lesson } from "@/components/lesson/types";

export const useIndexNavigation = (courses: any[]) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [coursesView, setCoursesView] = useState<'categories' | 'lessons' | 'player'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string; courseId?: number } | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [adminView, setAdminView] = useState<'courses' | 'lessons' | 'admins' | 'analytics' | 'notifications' | 'articles'>('analytics');

  const handleCategorySelect = (categoryId: number, categoryName: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName });
    setCoursesView('lessons');
  };

  const handleContinueLearningSelect = (categoryId: number, categoryName: string) => {
    setActiveTab('courses');
    handleCategorySelect(categoryId, categoryName);
  };

  const handleCourseSelect = (courseId: number, courseName: string) => {
    // Buscar a categoria do curso para navegação específica do curso
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setActiveTab('courses');
      setSelectedCategory({ 
        id: course.category_id, 
        name: course.categories?.name || courseName, 
        courseId: courseId 
      });
      setCoursesView('lessons');
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'courses') {
      setCoursesView('categories');
      setSelectedCategory(null);
      setSelectedLesson(null);
    }
  };

  return {
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
  };
};