import { useState } from 'react';

interface Course {
  id: number;
  title: string;
  is_premium: boolean;
}

interface Category {
  id: number;
  name: string;
  courseId: number;
}

interface Lesson {
  id: string;
  title: string;
  is_free: boolean;
}

interface IndexNavigationState {
  activeTab: string;
  coursesView: 'categories' | 'lessons' | 'player';
  selectedCategory: Category | null;
  selectedLesson: Lesson | null;
  adminView: string;
  setAdminView: (view: string) => void;
  handleCategorySelect: (category: Category) => void;
  handleContinueLearningSelect: (lesson: Lesson) => void;
  handleCourseSelect: (courseId: number, courseName: string) => void;
  handleLessonSelect: (lesson: Lesson) => void;
  handleBackToCategories: () => void;
  handleBackToLessons: () => void;
  handleSearchResult: (result: any) => void;
  handleTabChange: (tab: string) => void;
}

export const useIndexNavigation = (courses: Course[]): IndexNavigationState => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [coursesView, setCoursesView] = useState<'categories' | 'lessons' | 'player'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [adminView, setAdminView] = useState('overview');

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setCoursesView('lessons');
  };

  const handleContinueLearningSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCoursesView('player');
  };

  const handleCourseSelect = (courseId: number, courseName: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      const mockCategory: Category = {
        id: 1,
        name: course.category,
        courseId: courseId
      };
      handleCategorySelect(mockCategory);
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCoursesView('player');
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedLesson(null);
    setCoursesView('categories');
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
    setCoursesView('lessons');
  };

  const handleSearchResult = (result: any) => {
    // Implementar lógica de busca
    console.log('Search result:', result);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
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
