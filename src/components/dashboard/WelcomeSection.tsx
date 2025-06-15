import { useAuth } from "@/contexts/AuthContext";

interface WelcomeSectionProps {
  userProgress: {
    level: number;
    levelName?: string;
    totalXP: number;
    totalPoints?: number;
  };
}

const WelcomeSection = ({ userProgress }: WelcomeSectionProps) => {
  const { user } = useAuth();

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

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bem-vindo de volta, {getUserDisplayName()}!</h1>
          <p className="text-blue-100 text-lg">Continue sua jornada no mundo da Inteligência Artificial</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{userProgress.levelName || 'Iniciante'}</div>
          <div className="text-lg">Nível {userProgress.level}</div>
          <div className="text-blue-200">{userProgress.totalPoints || userProgress.totalXP} pontos</div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;