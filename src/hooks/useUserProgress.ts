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

      // Get completed categories count
      const { count: completedCategories } = await supabase
        .from('user_certificates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const completedLessons = progressData?.filter(p => p.status === 'completed').length || 0;
      const inProgressLessons = progressData?.filter(p => p.status === 'in_progress').length || 0;
      
      // Calculate level and XP based on completed lessons
      const xpPerLesson = 100;
      const totalXP = completedLessons * xpPerLesson;
      const level = Math.floor(totalXP / 500) + 1; // Level up every 500 XP

      setUserProgress({
        totalCourses: completedCategories || 0,
        completedCourses: completedCategories || 0,
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