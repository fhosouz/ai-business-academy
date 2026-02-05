// Cliente API para comunicação com o backend
// Todas as requisições passam pelo backend - arquitetura profissional

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ai-business-academy-backend.onrender.com/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Adicionar token de autenticação se disponível
    const token = localStorage.getItem('supabase_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Cursos
  async getCourses() {
    return this.request('/courses');
  }

  async getCourse(id: string) {
    return this.request(`/courses/${id}`);
  }

  // Perfil do usuário
  async getUserProfile(userId: string) {
    return this.request(`/users/${userId}/profile`);
  }

  async updateUserProfile(userId: string, data: any) {
    return this.request(`/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Progresso
  async getUserProgress(userId: string) {
    return this.request(`/users/${userId}/progress`);
  }

  async updateLessonProgress(userId: string, lessonId: string, progress: any) {
    return this.request(`/users/${userId}/progress/${lessonId}`, {
      method: 'POST',
      body: JSON.stringify(progress),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Exportar instância única
export const apiClient = new ApiClient();
export default apiClient;
