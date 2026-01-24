import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserProgress {
  completedLessons: number;
  totalLessons: number;
  completedCourses: number;
  totalCourses: number;
  progressPercentage: number;
  loading: boolean;
}

export const useUserProgress = (): UserProgress => {
  const { user } = useAuth();
  const [progress, setProgress] = useState({
    completedLessons: 0,
    totalLessons: 0,
    completedCourses: 0,
    totalCourses: 0,
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
        const mockProgress = {
          completedLessons: 5,
          totalLessons: 20,
          completedCourses: 1,
          totalCourses: 5,
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
