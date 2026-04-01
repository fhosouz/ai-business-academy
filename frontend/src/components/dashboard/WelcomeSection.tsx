import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, TrendingUp, Target, Zap } from "lucide-react";

interface WelcomeSectionProps {
  userProgress: {
    level: number;
    levelName?: string;
    totalXP: number;
    totalPoints?: number;
  };
  onUpgrade?: () => void;
  canAccessPremium?: boolean;
}

const WelcomeSection = ({ userProgress, onUpgrade, canAccessPremium = false }: WelcomeSectionProps) => {
  const { user } = useAuth();

  // Verificação de segurança para evitar erros de undefined
  if (!userProgress) {
    return (
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded mb-2 w-1/3"></div>
          <div className="h-6 bg-white/20 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Função para extrair nome do usuário
  const getUserDisplayName = () => {
    if (!user) return "Usuário";
    
    // Tenta primeiro o display_name dos metadados
    const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name;
    if (displayName) return displayName;
    
    // Se não tem, usa a primeira parte do email
    if (user.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    return "Usuário";
  };

  // Determinar mensagem baseada no progresso
  const getProgressMessage = () => {
    if (userProgress.level === 1) {
      return {
        title: "Comece sua jornada em IA!",
        subtitle: "Dê o primeiro passo para se tornar um profissional em Inteligência Artificial",
        action: "Começar Agora",
        urgency: "234 iniciantes começaram esta semana"
      };
    } else if (userProgress.level <= 3) {
      return {
        title: "Ótimo progresso, continue assim!",
        subtitle: "Você está no caminho certo. Acelere seu aprendizado com conteúdo premium.",
        action: "Acelerar Aprendizado",
        urgency: "Alunos no seu nível avançam 3x mais rápido com premium"
      };
    } else {
      return {
        title: "Você está quase lá!",
        subtitle: "Domine as técnicas avançadas e torne-se um especialista em IA.",
        action: "Tornar-se Especialista",
        urgency: "Últimos 12% dos alunos alcançam este nível"
      };
    }
  };

  const progressMessage = getProgressMessage();

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/20 rounded-full -ml-24 -mb-24"></div>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <h1 className="text-3xl font-bold">Bem-vindo de volta, {getUserDisplayName()}!</h1>
              {userProgress.level > 1 && (
                <Badge className="bg-yellow-500 text-white">
                  Nível {userProgress.level}
                </Badge>
              )}
            </div>
            
            <p className="text-blue-100 text-lg mb-6">{progressMessage.subtitle}</p>

            {/* Progress Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Seu Progresso</span>
                </div>
                <div className="text-2xl font-bold">Nível {userProgress.level}</div>
                <div className="text-xs text-blue-200">{userProgress.totalXP} XP</div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Próximo Objetivo</span>
                </div>
                <div className="text-2xl font-bold">Nível {userProgress.level + 1}</div>
                <div className="text-xs text-blue-200">Continue aprendendo!</div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">Ranking</span>
                </div>
                <div className="text-2xl font-bold">Top 25%</div>
                <div className="text-xs text-blue-200">dos iniciantes</div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!canAccessPremium ? (
                <Button 
                  onClick={onUpgrade}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {progressMessage.action}
                </Button>
              ) : (
                <Button 
                  className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Continuar Aprendendo
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3"
              >
                Ver Meu Progresso
              </Button>
            </div>

            {/* Urgency/Social Proof */}
            <div className="mt-4 text-sm text-blue-100">
              <p>🔥 {progressMessage.urgency}</p>
            </div>
          </div>

          {/* Side Illustration */}
          <div className="hidden lg:block ml-8">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Crown className="w-16 h-16 text-yellow-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;