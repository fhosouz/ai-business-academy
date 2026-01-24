import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap } from "lucide-react";
import { PlanType } from "@/hooks/useUserPlan";

interface PlanBadgeProps {
  plan: PlanType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const PlanBadge = ({ plan, size = 'md', showIcon = true }: PlanBadgeProps) => {
  const getVariant = () => {
    switch (plan) {
      case 'free':
        return 'secondary';
      case 'premium':
        return 'default';
      case 'enterprise':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;
    
    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    
    switch (plan) {
      case 'free':
        return <Star className={`${iconSize} mr-1`} />;
      case 'premium':
        return <Crown className={`${iconSize} mr-1`} />;
      case 'enterprise':
        return <Zap className={`${iconSize} mr-1`} />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (plan) {
      case 'free':
        return 'Free';
      case 'premium':
        return 'Premium';
      case 'enterprise':
        return 'Enterprise';
      default:
        return 'Free';
    }
  };

  return (
    <Badge variant={getVariant()} className={`
      ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}
      ${size === 'lg' ? 'text-sm px-3 py-1' : ''}
    `}>
      {getIcon()}
      {getLabel()}
    </Badge>
  );
};

export default PlanBadge;