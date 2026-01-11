import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserProgress {
  totalCourses: number;
  completedCourses: number;
  inProgress: number;
  totalXP: number; // Keeping for compatibility
  totalPoints: number;
  level: number;
  levelName: string;
  nextLevelPoints: number;
  progressToNext: number;
  badges: number;
}

export const useUserProgress = () => {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalCourses: 0,
    completedCourses: 0,
    inProgress: 0,
    totalXP: 0,
    totalPoints: 0,
    level: 1,
    levelName: "Iniciante",
    nextLevelPoints: 800,
    progressToNext: 0,
    badges: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  // Listen for progress updates
  useEffect(() => {
    const handleProgressUpdate = () => {
      if (user) {
        fetchUserProgress();
      }
    };

    window.addEventListener('user-progress-updated', handleProgressUpdate);
    window.addEventListener('lesson-progress-updated', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('user-progress-updated', handleProgressUpdate);
      window.removeEventListener('lesson-progress-updated', handleProgressUpdate);
    };
  }, [user]);

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      // Get all lessons count
      const { count: totalLessons } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true });

      // Get user progress
      const { data: progressData } = await supabase
        .from('user_lesson_progress')
        .select('status')
        .eq('user_id', user.id);

      // Get user badges
      const { count: totalBadges } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get completed categories (courses) count - categories where all lessons are completed
      const { data: categories } = await supabase
        .from('categories')
        .select('id');

      let completedCourses = 0;
      if (categories) {
        for (const category of categories) {
          const { data: categoryProgress } = await supabase.rpc('get_category_progress', {
            p_category_id: category.id,
            p_user_id: user.id
          });
          if (categoryProgress === 100) {
            completedCourses++;
          }
        }
      }

      // Get total categories (courses) count
      const { count: totalCategories } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      const completedLessons = progressData?.filter(p => p.status === 'completed').length || 0;
      const inProgressLessons = progressData?.filter(p => p.status === 'in_progress').length || 0;
      
      // Calculate points and level based on completed lessons
      const pointsPerLesson = 50;
      const totalPoints = completedLessons * pointsPerLesson;
      
      // Level calculation with descriptive names
      let level = 1;
      let levelName = "Iniciante";
      
      if (totalPoints >= 2000) {
        level = 3;
        levelName = "Avançado";
      } else if (totalPoints >= 800) {
        level = 2;
        levelName = "Intermediário";
      }
      
      const levelProgress = {
        level,
        levelName,
        totalPoints,
        nextLevelPoints: level === 1 ? 800 : level === 2 ? 2000 : totalPoints,
        progressToNext: level === 1 ? (totalPoints / 800) * 100 : 
                       level === 2 ? ((totalPoints - 800) / 1200) * 100 : 100
      };

      setUserProgress({
        totalCourses: totalCategories || 0,
        completedCourses,
        inProgress: inProgressLessons,
        badges: totalBadges || 0,
        level: levelProgress.level,
        levelName: levelProgress.levelName,
        totalXP: totalPoints, // Renaming to maintain compatibility
        totalPoints: totalPoints,
        nextLevelPoints: levelProgress.nextLevelPoints,
        progressToNext: levelProgress.progressToNext,
      });
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  return { userProgress, loading, refetch: fetchUserProgress };
};