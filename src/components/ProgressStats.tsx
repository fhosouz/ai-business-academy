
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calendar, Clock, User } from "lucide-react";

interface UserProgress {
  totalCourses: number;
  completedCourses: number;
  inProgress: number;
  totalXP: number;
  level: number;
  badges: number;
}

interface ProgressStatsProps {
  userProgress: UserProgress;
}

const ProgressStats = ({ userProgress }: ProgressStatsProps) => {
  const completionRate = (userProgress.completedCourses / userProgress.totalCourses) * 100;
  const nextLevelXP = (userProgress.level + 1) * 500;
  const currentLevelProgress = ((userProgress.totalXP % 500) / 500) * 100;

  const stats = [
    {
      title: "Cursos Concluídos",
      value: userProgress.completedCourses,
      total: userProgress.totalCourses,
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Em Progresso",
      value: userProgress.inProgress,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Badges Conquistadas",
      value: userProgress.badges,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Experiência Total",
      value: userProgress.totalXP,
      suffix: "XP",
      icon: User,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {stat.value.toLocaleString()}
                  </span>
                  {stat.total && (
                    <span className="text-sm text-gray-500">/ {stat.total}</span>
                  )}
                  {stat.suffix && (
                    <span className="text-sm text-gray-500">{stat.suffix}</span>
                  )}
                </div>
                
                {stat.total && (
                  <div className="mt-3">
                    <Progress value={(stat.value / stat.total) * 100} className="h-2" />
                  </div>
                )}
              </div>
              
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Level Progress Card */}
      <Card className="md:col-span-2 lg:col-span-4 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Nível {userProgress.level}</h3>
              <p className="text-sm text-gray-600">
                {500 - (userProgress.totalXP % 500)} XP para o próximo nível
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {userProgress.totalXP} XP
              </div>
            </div>
          </div>
          <Progress value={currentLevelProgress} className="h-3" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressStats;
