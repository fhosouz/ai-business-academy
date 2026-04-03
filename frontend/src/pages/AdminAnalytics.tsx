import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  BookOpen, 
  Clock,
  Award,
  Target,
  Eye,
  Calendar
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageCompletion: number;
  totalLessons: number;
  completedLessons: number;
  averageTimeSpent: number;
  recentSignups: Array<{
    id: string;
    email: string;
    created_at: string;
  }>;
  courseProgress: Array<{
    course_title: string;
    total_students: number;
    completion_rate: number;
    average_time: number;
  }>;
}

const AdminAnalytics: React.FC = () => {
  const { canViewAnalytics } = useUserRole();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (!canViewAnalytics()) return;
    fetchAnalytics();
  }, [canViewAnalytics, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Buscar dados de usuários
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, created_at')
        .order('created_at', { ascending: false });

      // Buscar roles para contar admin vs users
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role');

      // Buscar perfis com planos
      const { data: userProfiles } = await supabase
        .from('user_profiles')
        .select('plan');

      // Buscar cursos
      const { data: courses } = await supabase
        .from('courses')
        .select('is_published, title');

      // Buscar progresso dos usuários
      const { data: progress } = await supabase
        .from('user_lesson_progress')
        .select('user_id, completed, time_spent, lessons!inner(title, course_id)');

      // Buscar pagamentos
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, status, created_at')
        .eq('status', 'approved');

      // Calcular analytics
      const totalUsers = profiles?.length || 0;
      const adminCount = userRoles?.filter(r => r.role === 'admin').length || 0;
      const userCount = userRoles?.filter(r => r.role === 'user').length || 0;
      const premiumCount = userProfiles?.filter(p => p.plan === 'premium').length || 0;
      
      const publishedCourses = courses?.filter(c => c.is_published).length || 0;
      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      
      // Calcular revenue do mês atual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = payments?.filter(p => {
        const paymentDate = new Date(p.created_at);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      }).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Calcular métricas de progresso
      const totalLessons = progress?.length || 0;
      const completedLessons = progress?.filter(p => p.completed).length || 0;
      const averageCompletion = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const totalTime = progress?.reduce((sum, p) => sum + (p.time_spent || 0), 0) || 0;
      const averageTimeSpent = totalLessons > 0 ? totalTime / totalLessons : 0;

      // Recent signups (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSignups = profiles?.filter(p => 
        new Date(p.created_at) >= thirtyDaysAgo
      ).slice(0, 10) || [];

      // Agrupar progresso por curso
      const courseProgressMap = new Map();
      progress?.forEach(p => {
        if (p.lessons) {
          const courseTitle = p.lessons.title;
          if (!courseProgressMap.has(courseTitle)) {
            courseProgressMap.set(courseTitle, {
              total_students: 0,
              completed_lessons: 0,
              total_time: 0
            });
          }
          const courseData = courseProgressMap.get(courseTitle);
          courseData.total_students += 1;
          if (p.completed) courseData.completed_lessons += 1;
          courseData.total_time += p.time_spent || 0;
        }
      });

      const courseProgress = Array.from(courseProgressMap.entries()).map(([title, data]) => ({
        course_title: title,
        total_students: data.total_students,
        completion_rate: data.total_students > 0 ? (data.completed_lessons / data.total_students) * 100 : 0,
        average_time: data.total_students > 0 ? data.total_time / data.total_students : 0
      }));

      setAnalytics({
        totalUsers,
        activeUsers: userCount,
        premiumUsers: premiumCount,
        totalCourses: courses?.length || 0,
        publishedCourses,
        totalRevenue,
        monthlyRevenue,
        averageCompletion,
        totalLessons,
        completedLessons,
        averageTimeSpent,
        recentSignups,
        courseProgress
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!canViewAnalytics()) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Eye className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
          <p className="text-muted-foreground">
            Você não tem permissão para visualizar analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) return null;

  const stats = [
    {
      title: 'Total de Usuários',
      value: analytics.totalUsers.toLocaleString('pt-BR'),
      change: `+${analytics.recentSignups.length}`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Usuários Premium',
      value: analytics.premiumUsers.toLocaleString('pt-BR'),
      change: `${((analytics.premiumUsers / analytics.totalUsers) * 100).toFixed(1)}%`,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Cursos Publicados',
      value: analytics.publishedCourses.toLocaleString('pt-BR'),
      change: `+${analytics.publishedCourses}`,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Receita Total',
      value: `R$ ${analytics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: `R$ ${analytics.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const engagementStats = [
    {
      title: 'Taxa de Conclusão',
      value: `${analytics.averageCompletion.toFixed(1)}%`,
      icon: Target,
      color: 'text-indigo-600',
    },
    {
      title: 'Tempo Médio',
      value: `${Math.round(analytics.averageTimeSpent / 60)}min`,
      icon: Clock,
      color: 'text-cyan-600',
    },
    {
      title: 'Lições Concluídas',
      value: `${analytics.completedLessons}/${analytics.totalLessons}`,
      icon: Award,
      color: 'text-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-sm text-gray-600">Métricas da plataforma</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
              <Button onClick={fetchAnalytics} variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {engagementStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-gray-100`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Signups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Cadastros Recentes
              </CardTitle>
              <CardDescription>
                Últimos usuários cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {analytics.recentSignups.map((signup, index) => (
                  <div key={signup.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{signup.email}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(signup.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant="secondary">Novo</Badge>
                  </div>
                ))}
                {analytics.recentSignups.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Nenhum cadastro recente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Course Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Progresso por Curso
              </CardTitle>
              <CardDescription>
                Taxa de conclusão por curso
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {analytics.courseProgress.slice(0, 5).map((course, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{course.course_title}</p>
                      <p className="text-xs text-gray-500">
                        {course.total_students} alunos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {course.completion_rate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(course.average_time / 60)}min
                      </p>
                    </div>
                  </div>
                ))}
                {analytics.courseProgress.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Nenhum dado de progresso
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
