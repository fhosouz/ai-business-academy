import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Settings, 
  BarChart3,
  FileText,
  Video,
  Award
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { permissions } = useUserRole();

  const stats = [
    {
      title: 'Total de Alunos',
      value: '2,847',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Cursos Ativos',
      value: '24',
      change: '+3',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 14.280',
      change: '+23%',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Taxa de Conversão',
      value: '8.4%',
      change: '+2.1%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const quickActions = [
    {
      title: 'Analytics',
      description: 'Estatísticas detalhadas',
      icon: BarChart3,
      href: '/admin/analytics',
      permission: 'canViewAnalytics' as const,
    },
    {
      title: 'Gerenciar Cursos',
      description: 'Criar e editar cursos',
      icon: BookOpen,
      href: '/admin/courses',
      permission: 'canManageCourses' as const,
    },
    {
      title: 'Gerenciar Usuários',
      description: 'Administração de alunos',
      icon: Users,
      href: '/admin/users',
      permission: 'canManageUsers' as const,
    },
    {
      title: 'Configurações',
      description: 'Configurações da plataforma',
      icon: Settings,
      href: '/admin/settings',
      permission: 'canManageSettings' as const,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'new_user',
      message: 'Novo aluno registrado: joao.silva@email.com',
      time: 'Há 5 minutos',
      icon: Users,
    },
    {
      id: 2,
      type: 'course_completion',
      message: 'Maria Santos completou o curso "Introdução à IA"',
      time: 'Há 15 minutos',
      icon: Award,
    },
    {
      id: 3,
      type: 'new_course',
      message: 'Novo curso publicado: "Avançado em Machine Learning"',
      time: 'Há 1 hora',
      icon: Video,
    },
    {
      id: 4,
      type: 'payment',
      message: 'Novo upgrade Premium: R$ 97.00',
      time: 'Há 2 horas',
      icon: DollarSign,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-sm text-gray-600">Gerenciamento da AutomatizeAI Academy</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Administrador
              </Badge>
              <span className="text-sm text-gray-600">{user?.email}</span>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>
                Acesso rápido às ferramentas administrativas
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <div key={index}>
                    {permissions[action.permission] ? (
                      <Button
                        variant="outline"
                        className="w-full h-auto p-4 flex flex-col items-start gap-2"
                        onClick={() => window.location.href = action.href}
                      >
                        <action.icon className="h-6 w-6" />
                        <div className="text-left">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-xs text-gray-600">{action.description}</div>
                        </div>
                      </Button>
                    ) : (
                      <div className="w-full h-auto p-4 flex flex-col items-start gap-2 opacity-50">
                        <action.icon className="h-6 w-6 text-gray-400" />
                        <div className="text-left">
                          <div className="font-medium text-gray-400">{action.title}</div>
                          <div className="text-xs text-gray-500">Sem permissão</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
              <CardDescription>
                Últimas atividades na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <activity.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
