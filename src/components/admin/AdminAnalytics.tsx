import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, Users, Star, TrendingUp, Eye, Award, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalLessons: 0,
    totalRatings: 0,
    averageRating: 0,
    premiumUsers: 0,
    pageViews: [],
    usersByPlan: [],
    ratingDistribution: [],
    topRatedLessons: []
  });
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [userDetails, setUserDetails] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Buscar total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Buscar total de aulas
      const { count: totalLessons } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true });

      // Buscar estatísticas de avaliações
      const { data: ratingsData } = await supabase
        .from('lesson_ratings')
        .select('rating');

      const totalRatings = ratingsData?.length || 0;
      const averageRating = totalRatings > 0 
        ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
        : 0;

      // Buscar usuários por plano
      const { data: userPlans } = await supabase
        .from('user_roles')
        .select('plan_type');

      const planDistribution = userPlans?.reduce((acc, user) => {
        const plan = user.plan_type || 'free';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const usersByPlan = Object.entries(planDistribution).map(([plan, count]) => ({
        name: plan === 'free' ? 'Free' : plan === 'premium' ? 'Premium' : 'Enterprise',
        value: count
      }));

      const premiumUsers = (planDistribution.premium || 0) + (planDistribution.enterprise || 0);

      // Distribuição de avaliações
      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
        rating: `${rating} estrela${rating > 1 ? 's' : ''}`,
        count: ratingsData?.filter(r => r.rating === rating).length || 0
      }));

      // Buscar dados reais de visualização de páginas com user_id
      const { data: pageViewsData } = await supabase
        .from('page_analytics')
        .select('page_path, user_id, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const pageViewsCount = pageViewsData?.reduce((acc, view) => {
        let pageName = view.page_path;
        // Mapear paths para nomes amigáveis
        switch (view.page_path) {
          case '/':
            pageName = 'Dashboard';
            break;
          case '/courses':
            pageName = 'Cursos';
            break;
          case '/profile':
            pageName = 'Perfil';
            break;
          case '/admin':
            pageName = 'Admin';
            break;
          default:
            if (view.page_path.startsWith('/event/')) {
              pageName = view.page_path.replace('/event/', '');
            }
        }
        
        acc[pageName] = (acc[pageName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const pageViews = Object.entries(pageViewsCount)
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Top aulas mais bem avaliadas com dados reais
      const { data: ratingsWithLessons } = await supabase
        .from('lesson_ratings')
        .select('lesson_id, rating');

      const { data: allLessons } = await supabase
        .from('lessons')
        .select('id, title');

      const lessonAverages = ratingsWithLessons?.reduce((acc, rating) => {
        const lessonId = rating.lesson_id;
        const lesson = allLessons?.find(l => l.id === lessonId);
        if (!acc[lessonId]) {
          acc[lessonId] = {
            title: lesson?.title || 'Aula sem título',
            total: 0,
            count: 0
          };
        }
        acc[lessonId].total += rating.rating;
        acc[lessonId].count += 1;
        return acc;
      }, {} as Record<string, any>) || {};

      const topRatedLessons = Object.entries(lessonAverages)
        .map(([id, data]) => ({
          title: data.title,
          average: (data.total / data.count).toFixed(1),
          count: data.count
        }))
        .sort((a, b) => parseFloat(b.average) - parseFloat(a.average))
        .slice(0, 5);

      setAnalytics({
        totalUsers: totalUsers || 0,
        totalLessons: totalLessons || 0,
        totalRatings,
        averageRating: parseFloat(averageRating.toFixed(1)),
        premiumUsers,
        pageViews,
        usersByPlan,
        ratingDistribution,
        topRatedLessons
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar analytics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (type: string, planType?: string) => {
    setLoadingDetails(true);
    try {
      let userIds: string[] = [];
      
      // Primeiro buscar user_ids baseado no tipo de filtro
      switch (type) {
        case 'total':
          setModalTitle('Todos os Usuários');
          const { data: allUsers } = await supabase
            .from('user_roles')
            .select('user_id');
          userIds = allUsers?.map(u => u.user_id) || [];
          break;
          
        case 'premium':
          setModalTitle('Usuários Premium');
          const { data: premiumUsers } = await supabase
            .from('user_roles')
            .select('user_id')
            .in('plan_type', ['premium', 'enterprise']);
          userIds = premiumUsers?.map(u => u.user_id) || [];
          break;
          
        case 'plan':
          setModalTitle(`Usuários ${planType === 'free' ? 'Free' : planType === 'premium' ? 'Premium' : 'Enterprise'}`);
          if (planType && ['free', 'premium', 'enterprise'].includes(planType)) {
            const { data: planUsers } = await supabase
              .from('user_roles')
              .select('user_id')
              .eq('plan_type', planType as 'free' | 'premium' | 'enterprise');
            userIds = planUsers?.map(u => u.user_id) || [];
          }
          break;
          
        case 'page':
          setModalTitle(`Usuários que Acessaram ${planType}`);
          const { data: pageUsers } = await supabase
            .from('page_analytics')
            .select('user_id')
            .eq('page_path', planType === 'Dashboard' ? '/' : 
                 planType === 'Cursos' ? '/courses' : 
                 planType === 'Perfil' ? '/profile' : 
                 planType === 'Admin' ? '/admin' : planType)
            .not('user_id', 'is', null);
          
          const pageUserIds = [...new Set(pageUsers?.map(p => p.user_id))];
          // Filtrar apenas usuários que também estão na tabela user_roles
          const { data: validUsers } = await supabase
            .from('user_roles')
            .select('user_id')
            .in('user_id', pageUserIds);
          userIds = validUsers?.map(u => u.user_id) || [];
          break;
      }

      if (userIds.length === 0) {
        setUserDetails([]);
        return;
      }

      // Buscar profiles dos usuários
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, created_at, user_id')
        .in('user_id', userIds)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar roles dos usuários
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, plan_type, role')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Combinar os dados
      const combinedData = profiles?.map(profile => {
        const userRole = roles?.find(role => role.user_id === profile.user_id);
        return {
          ...profile,
          user_roles: userRole || { plan_type: 'free', role: 'user' }
        };
      }) || [];

      setUserDetails(combinedData);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar detalhes dos usuários.",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCardClick = (type: string, planType?: string) => {
    fetchUserDetails(type, planType);
    setShowDetailsModal(true);
  };

  const handlePieClick = (data: any) => {
    const planType = data.name === 'Free' ? 'free' : 
                     data.name === 'Premium' ? 'premium' : 'enterprise';
    fetchUserDetails('plan', planType);
    setShowDetailsModal(true);
  };

  const handleBarClick = (data: any) => {
    console.log('Clicou na página:', data.page);
    fetchUserDetails('page', data.page);
    setShowDetailsModal(true);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics da Plataforma</h1>
        <p className="text-muted-foreground">
          Acompanhe métricas importantes para medir o sucesso da plataforma
        </p>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('total')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">{analytics.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('premium')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuários Premium</p>
                <p className="text-2xl font-bold">{analytics.premiumUsers}</p>
              </div>
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfação Média</p>
                <p className="text-2xl font-bold">{analytics.averageRating}/5</p>
              </div>
              <Star className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Aulas</p>
                <p className="text-2xl font-bold">{analytics.totalLessons}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap de páginas mais acessadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Páginas Mais Acessadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.pageViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="page" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#8884d8" onClick={handleBarClick} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de usuários por plano */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Adoção de Planos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.usersByPlan}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={handlePieClick}
                  className="cursor-pointer"
                >
                  {analytics.usersByPlan.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de avaliações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Distribuição de Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top aulas mais bem avaliadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Aulas Mais Bem Avaliadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topRatedLessons.map((lesson, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{lesson.title}</p>
                    <p className="text-sm text-muted-foreground">{lesson.count} avaliações</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50">
                    <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {lesson.average}
                  </Badge>
                </div>
              ))}
              {analytics.topRatedLessons.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma avaliação encontrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalhes dos Usuários */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="mt-4">
              {userDetails.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userDetails.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt="Avatar" 
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="w-4 h-4 text-gray-500" />
                              </div>
                            )}
                            <span>{user.display_name || 'Usuário sem nome'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.user_roles.plan_type === 'free' ? 'secondary' : 'default'}>
                            {user.user_roles.plan_type === 'free' ? 'Free' : 
                             user.user_roles.plan_type === 'premium' ? 'Premium' : 'Enterprise'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.user_roles.role === 'admin' ? 'destructive' : 'outline'}>
                            {user.user_roles.role === 'admin' ? 'Admin' : 'Usuário'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado para esta categoria.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAnalytics;