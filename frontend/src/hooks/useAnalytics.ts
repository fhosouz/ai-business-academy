interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

export const useAnalytics = () => {
  const trackEvent = (event: string, properties?: Record<string, any>) => {
    // Simulação - em produção, enviar para analytics service
    console.log('Analytics Event:', { event, properties });
    
    // Exemplo de implementação real:
    // analytics.track(event, properties);
  };

  const trackPageView = (page: string) => {
    trackEvent('page_view', { page });
  };

  const trackUserAction = (action: string, details?: Record<string, any>) => {
    trackEvent('user_action', { action, ...details });
  };

  return {
    trackEvent,
    trackPageView,
    trackUserAction
  };
};
