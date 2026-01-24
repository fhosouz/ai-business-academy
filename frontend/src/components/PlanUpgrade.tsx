import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap, Check } from "lucide-react";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useToast } from "@/hooks/use-toast";

const PlanUpgrade = () => {
  const { plan, loading } = useUserPlan();
  const { toast } = useToast();

  const handleUpgrade = (targetPlan: string) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: `O upgrade para o plano ${targetPlan} estará disponível em breve!`,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Star,
      description: 'Acesso básico à plataforma',
      features: [
        'Cursos e aulas gratuitos',
        'Progresso básico',
        'Certificados de conclusão'
      ],
      price: 'R$ 0',
      period: '/mês',
      current: plan === 'free'
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: Crown,
      description: 'Acesso completo aos recursos',
      features: [
        'Todos os cursos e aulas',
        'Suporte prioritário',
        'Certificados premium',
        'Downloads offline'
      ],
      price: 'R$ 29,90',
      period: '/mês',
      current: plan === 'premium'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Zap,
      description: 'Para empresas e equipes',
      features: [
        'Tudo do Premium',
        'Gerenciamento de equipes',
        'Relatórios avançados',
        'API personalizada'
      ],
      price: 'R$ 1,00',
      period: '/mês',
      current: plan === 'enterprise'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Seu Plano Atual</h2>
        <p className="text-muted-foreground">
          Você está no plano <strong>{plans.find(p => p.current)?.name || 'Free'}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((planInfo) => {
          const Icon = planInfo.icon;
          const isPremiumPlan = planInfo.id !== 'free';
          
          return (
            <Card key={planInfo.id} className={`relative ${planInfo.current ? 'ring-2 ring-primary' : ''}`}>
              {planInfo.current && (
                <Badge className="absolute -top-2 left-4 bg-primary">
                  Plano Atual
                </Badge>
              )}
              
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className={`w-6 h-6 ${
                    planInfo.id === 'free' ? 'text-gray-500' :
                    planInfo.id === 'premium' ? 'text-yellow-500' :
                    'text-purple-500'
                  }`} />
                  <CardTitle>{planInfo.name}</CardTitle>
                </div>
                <CardDescription>{planInfo.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center">
                  <span className="text-3xl font-bold">{planInfo.price}</span>
                  <span className="text-muted-foreground">{planInfo.period}</span>
                </div>
                
                <ul className="space-y-2">
                  {planInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {!planInfo.current && (
                  <Button 
                    className="w-full" 
                    variant={isPremiumPlan ? "default" : "outline"}
                    onClick={() => handleUpgrade(planInfo.name)}
                  >
                    {planInfo.id === 'free' ? 'Downgrade' : 'Fazer Upgrade'}
                  </Button>
                )}
                
                {planInfo.current && (
                  <Button className="w-full" variant="secondary" disabled>
                    Plano Ativo
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PlanUpgrade;