
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  onStrengthChange: (isStrong: boolean) => void;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  password, 
  onStrengthChange 
}) => {
  const checks = [
    { label: "Mínimo 8 caracteres", test: password.length >= 8 },
    { label: "Pelo menos uma letra maiúscula", test: /[A-Z]/.test(password) },
    { label: "Pelo menos uma letra minúscula", test: /[a-z]/.test(password) },
    { label: "Pelo menos um número", test: /[0-9]/.test(password) }
  ];

  const passedChecks = checks.filter(check => check.test).length;
  const strength = (passedChecks / checks.length) * 100;
  const isStrong = passedChecks === checks.length;

  React.useEffect(() => {
    onStrengthChange(isStrong);
  }, [isStrong, onStrengthChange]);

  const getStrengthColor = () => {
    if (strength < 50) return "bg-red-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (strength < 50) return "Fraca";
    if (strength < 75) return "Média";
    return "Forte";
  };

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Força da senha:</span>
        <span className={`font-medium ${isStrong ? 'text-green-600' : 'text-orange-600'}`}>
          {getStrengthLabel()}
        </span>
      </div>
      <Progress value={strength} className="h-2" />
      <div className="space-y-1">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center text-xs">
            {check.test ? (
              <Check className="w-3 h-3 text-green-500 mr-2" />
            ) : (
              <X className="w-3 h-3 text-red-500 mr-2" />
            )}
            <span className={check.test ? 'text-green-600' : 'text-red-500'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
