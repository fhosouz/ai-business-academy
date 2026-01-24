
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User } from 'lucide-react';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';

interface SignUpFormProps {
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
  };
  formErrors: {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
  };
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  isPasswordStrong: boolean;
  onPasswordStrengthChange: (isStrong: boolean) => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  formData,
  formErrors,
  onInputChange,
  onSubmit,
  isLoading,
  isPasswordStrong,
  onPasswordStrengthChange
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Nome Completo</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-name"
            type="text"
            placeholder="Seu nome completo"
            className={`pl-10 ${formErrors.fullName ? 'border-red-500' : ''}`}
            value={formData.fullName}
            onChange={(e) => onInputChange('fullName', e.target.value)}
            required
          />
        </div>
        {formErrors.fullName && <p className="text-sm text-red-500">{formErrors.fullName}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-email"
            type="email"
            placeholder="seu@email.com"
            className={`pl-10 ${formErrors.email ? 'border-red-500' : ''}`}
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            required
          />
        </div>
        {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-password"
            type="password"
            placeholder="Escolha uma senha"
            className={`pl-10 ${formErrors.password ? 'border-red-500' : ''}`}
            value={formData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            required
          />
        </div>
        {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
        <PasswordStrengthMeter 
          password={formData.password} 
          onStrengthChange={onPasswordStrengthChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-confirm">Confirmar Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-confirm"
            type="password"
            placeholder="Confirme sua senha"
            className={`pl-10 ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
            value={formData.confirmPassword}
            onChange={(e) => onInputChange('confirmPassword', e.target.value)}
            required
          />
        </div>
        {formErrors.confirmPassword && <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>}
      </div>
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        disabled={isLoading || !isPasswordStrong}
      >
        {isLoading ? 'Criando conta...' : 'Criar Conta'}
      </Button>
    </form>
  );
};
