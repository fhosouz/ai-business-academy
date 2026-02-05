import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserProgress {
  totalCourses: number;
  completedCourses: number;
  inProgress: number;
  totalXP: number;
  totalPoints?: number;
  level: number;
  levelName?: string;
  nextLevelPoints?: number;
  progressToNext?: number;
  badges: number;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  loading: boolean;
}

export const useUserProgress = (): UserProgress => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>({
    totalCourses: 0,
    completedCourses: 0,
    inProgress: 0,
    totalXP: 0,
    totalPoints: 0,
    level: 1,
    levelName: 'Iniciante',
    nextLevelPoints: 100,
    progressToNext: 0,
    badges: 0,
    completedLessons: 0,
    totalLessons: 0,
    progressPercentage: 0,
    loading: true
  });

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        setProgress(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Simulação - em produção, buscaria do backend
        const mockProgress: UserProgress = {
          totalCourses: 5,
          completedCourses: 1,
          inProgress: 2,
          totalXP: 25,
          totalPoints: 25,
          level: 1,
          levelName: 'Iniciante',
          nextLevelPoints: 100,
          progressToNext: 25,
          badges: 1,
          completedLessons: 5,
          totalLessons: 20,
          progressPercentage: 25
        };
        setProgress(mockProgress);
      } catch (error) {
        console.error('Error fetching user progress:', error);
      } finally {
        setProgress(prev => ({ ...prev, loading: false }));
      }
    };

    fetchProgress();
  }, [user]);

  return progress;
};
