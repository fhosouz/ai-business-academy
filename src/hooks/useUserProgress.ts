import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserProgress {
  totalCourses: number;
  completedCourses: number;
  inProgress: number;
  totalXP: number;
  level: number;
  badges: number;
}

export const useUserProgress = () => {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalCourses: 0,
    completedCourses: 0,
    inProgress: 0,
    totalXP: 0,
    level: 1,
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
      
      // Calculate level and XP based on completed lessons
      const xpPerLesson = 100;
      const totalXP = completedLessons * xpPerLesson;
      const level = Math.floor(totalXP / 500) + 1; // Level up every 500 XP

      setUserProgress({
        totalCourses: totalCategories || 0,
        completedCourses,
        inProgress: inProgressLessons,
        badges: totalBadges || 0,
        level,
        totalXP,
      });
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  return { userProgress, loading, refetch: fetchUserProgress };
};