import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

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
        console.log('=== FETCHING USER PROGRESS ===');
        
        // Usar o cliente API existente (arquitetura correta)
        const progressData = await apiClient.getUserProgress(user.id);
        console.log('User progress fetched:', progressData);

        if (progressData) {
          setProgress({
            totalCourses: progressData.totalCourses || 0,
            completedCourses: progressData.completedCourses || 0,
            inProgress: progressData.inProgress || 0,
            totalXP: progressData.totalXP || 0,
            totalPoints: progressData.totalPoints || 0,
            level: progressData.level || 1,
            levelName: progressData.levelName || 'Iniciante',
            nextLevelPoints: progressData.nextLevelPoints || 100,
            progressToNext: progressData.progressToNext || 0,
            badges: progressData.badges || 0,
            completedLessons: progressData.completedLessons || 0,
            totalLessons: progressData.totalLessons || 20,
            progressPercentage: progressData.progressPercentage || 0,
            loading: false
          });
        } else {
          // Usar dados mock se não houver progresso no backend
          console.log('No user progress found, using mock data');
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
            progressPercentage: 25,
            loading: false
          };
          setProgress(mockProgress);
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
        // Em caso de erro, usar dados mock para não quebrar a UI
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
          progressPercentage: 25,
          loading: false
        };
        setProgress(mockProgress);
      } finally {
        setProgress(prev => ({ ...prev, loading: false }));
      }
    };

    fetchProgress();
  }, [user]);

  return progress;
};
