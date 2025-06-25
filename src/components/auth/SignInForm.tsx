
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock } from 'lucide-react';

interface SignInFormProps {
  formData: {
    email: string;
    password: string;
  };
  formErrors: {
    email: string;
    password: string;
  };
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  formData,
  formErrors,
  onInputChange,
  onSubmit,
  isLoading
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="signin-email"
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
        <Label htmlFor="signin-password">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="signin-password"
            type="password"
            placeholder="Sua senha"
            className={`pl-10 ${formErrors.password ? 'border-red-500' : ''}`}
            value={formData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            required
          />
        </div>
        {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
      </div>
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        disabled={isLoading}
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
};
