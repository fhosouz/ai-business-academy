import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Lock, Sparkles, TrendingUp, Users, Clock } from "lucide-react";

interface PremiumTeaserProps {
  type: 'course' | 'lesson' | 'progress' | 'feature';
  title: string;
  description: string;
  onUpgrade: () => void;
  previewContent?: React.ReactNode;
  stats?: {
    studentsCount?: number;
    completionRate?: number;
    avgTime?: string;
  };
}

const PremiumTeaser = ({ 
  type, 
  title, 
  description, 
  onUpgrade, 
  previewContent,
  stats 
}: PremiumTeaserProps) => {
  const getTeaserConfig = () => {
    switch (type) {
      case 'course':
        return {
          icon: <Crown className="w-5 h-5 text-yellow-500" />,
          badge: "Conteúdo Premium",
          color: "from-yellow-50 to-orange-50",
          borderColor: "border-yellow-200",
          urgency: "Apenas 3 vagas para turma de hoje"
        };
      case 'lesson':
        return {
          icon: <Lock className="w-5 h-5 text-red-500" />,
          badge: "Aula Premium",
          color: "from-red-50 to-pink-50",
          borderColor: "border-red-200",
          urgency: "Desbloqueie esta aula e continue aprendendo"
        };
      case 'progress':
        return {
          icon: <TrendingUp className="w-5 h-5 text-green-500" />,
          badge: "Acelere Progresso",
          color: "from-green-50 to-emerald-50",
          borderColor: "border-green-200",
          urgency: "Alunos premium aprendem 3x mais rápido"
        };
      case 'feature':
        return {
          icon: <Sparkles className="w-5 h-5 text-purple-500" />,
          badge: "Recurso Exclusivo",
          color: "from-purple-50 to-indigo-50",
          borderColor: "border-purple-200",
          urgency: "Experimente este recurso premium"
        };
      default:
        return {
          icon: <Crown className="w-5 h-5 text-yellow-500" />,
          badge: "Premium",
          color: "from-blue-50 to-indigo-50",
          borderColor: "border-blue-200",
          urgency: "Desbloqueie com Premium"
        };
    }
  };

  const config = getTeaserConfig();

  return (
    <Card className={`relative overflow-hidden border-2 ${config.borderColor} bg-gradient-to-br ${config.color}`}>
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {config.icon}
            <Badge variant="secondary" className="text-xs">
              {config.badge}
            </Badge>
          </div>
          <div className="text-xs text-gray-500">
            <Users className="w-3 h-3 inline mr-1" />
            {stats?.studentsCount || 2_847} alunos
          </div>
        </div>
        
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      </div>

      {/* Preview Content */}
      {previewContent && (
        <div className="px-4 pb-3">
          <div className="bg-white/70 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xs text-gray-500 mb-1">Preview do conteúdo:</div>
            {previewContent}
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="px-4 pb-3">
          <div className="grid grid-cols-3 gap-2 text-xs">
            {stats.completionRate && (
              <div className="text-center">
                <div className="font-semibold text-green-600">{stats.completionRate}%</div>
                <div className="text-gray-500">concluem</div>
              </div>
            )}
            {stats.avgTime && (
              <div className="text-center">
                <div className="font-semibold text-blue-600">{stats.avgTime}</div>
                <div className="text-gray-500">média</div>
              </div>
            )}
            <div className="text-center">
              <div className="font-semibold text-purple-600">3x</div>
              <div className="text-gray-500">mais rápido</div>
            </div>
          </div>
        </div>
      )}

      {/* Urgency Message */}
      <div className="px-4 pb-3">
        <div className="bg-orange-100 rounded-lg p-2">
          <p className="text-xs text-orange-800 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {config.urgency}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="p-4 pt-2">
        <Button 
          onClick={onUpgrade}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
        >
          <Crown className="w-4 h-4 mr-2" />
          Desbloquear Agora
        </Button>
        
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            Cancelamento a qualquer momento • Garantia de 7 dias
          </p>
        </div>
      </div>

      {/* Social Proof */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
          <div className="flex -space-x-1">
            {[1,2,3].map(i => (
              <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 border border-white flex items-center justify-center text-white text-[10px] font-bold">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <span>234 iniciantes upgrade hoje</span>
        </div>
      </div>
    </Card>
  );
};

export default PremiumTeaser;
