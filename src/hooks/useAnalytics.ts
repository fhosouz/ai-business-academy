import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Generate a unique session ID
const generateSessionId = () => {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Get or create session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export const useAnalytics = () => {
  const { user } = useAuth();

  // Track page view
  const trackPageView = useCallback(async (path: string) => {
    try {
      const sessionId = getSessionId();
      
      await supabase.from('page_analytics').insert({
        user_id: user?.id || null,
        page_path: path,
        session_id: sessionId,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null
      });

      // Update or create session
      const { data: existingSession } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (existingSession) {
        await supabase
          .from('user_sessions')
          .update({
            last_activity: new Date().toISOString(),
            pages_visited: existingSession.pages_visited + 1
          })
          .eq('session_id', sessionId);
      } else {
        await supabase.from('user_sessions').insert({
          user_id: user?.id || null,
          session_id: sessionId,
          pages_visited: 1
        });
      }
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }, [user]);

  // Track user engagement events
  const trackEvent = useCallback(async (eventType: string, eventData?: any) => {
    if (!user) return;

    try {
      await supabase.from('user_engagement').insert({
        user_id: user.id,
        event_type: eventType,
        event_data: eventData || null
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [user]);

  // Track page view on route changes
  useEffect(() => {
    const path = window.location.pathname;
    trackPageView(path);

    // Listen to route changes (for SPA)
    const handleRouteChange = () => {
      trackPageView(window.location.pathname);
    };

    // Listen to browser navigation
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [trackPageView]);

  return {
    trackPageView,
    trackEvent
  };
};

// Helper functions for common tracking events
export const trackCourseView = (courseId: number, courseName: string) => {
  return {
    event_type: 'course_view',
    event_data: { course_id: courseId, course_name: courseName }
  };
};

export const trackLessonStart = (lessonId: string, lessonName: string) => {
  return {
    event_type: 'lesson_start',
    event_data: { lesson_id: lessonId, lesson_name: lessonName }
  };
};

export const trackLessonComplete = (lessonId: string, lessonName: string) => {
  return {
    event_type: 'lesson_complete',
    event_data: { lesson_id: lessonId, lesson_name: lessonName }
  };
};

export const trackSearch = (query: string, results: number) => {
  return {
    event_type: 'search',
    event_data: { query, results_count: results }
  };
};