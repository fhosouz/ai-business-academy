import { useState } from 'react';

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

interface AuthFormErrors {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

interface AuthFormReturn {
  formData: AuthFormData;
  formErrors: AuthFormErrors;
  handleInputChange: (field: string, value: string) => void;
  validateForm: (isSignUp: boolean) => boolean;
  resetForm: () => void;
}

export const useAuthForm = (): AuthFormReturn => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const [formErrors, setFormErrors] = useState<AuthFormErrors>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const handleInputChange = (field: string, value: string) => {
    // aceitar apenas campos conhecidos do formulário
    if (
      field !== 'email' &&
      field !== 'password' &&
      field !== 'confirmPassword' &&
      field !== 'fullName'
    ) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpar erro ao editar o campo
    setFormErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const validateForm = (isSignUp: boolean) => {
    const nextErrors: AuthFormErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    };

    const email = formData.email.trim();
    if (!email) {
      nextErrors.email = 'Email é obrigatório';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        nextErrors.email = 'Email inválido';
      }
    }

    if (!formData.password) {
      nextErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Mínimo de 6 caracteres';
    }

    if (isSignUp) {
      if (!formData.fullName.trim()) {
        nextErrors.fullName = 'Nome é obrigatório';
      }

      if (!formData.confirmPassword) {
        nextErrors.confirmPassword = 'Confirme sua senha';
      } else if (formData.confirmPassword !== formData.password) {
        nextErrors.confirmPassword = 'As senhas não conferem';
      }
    }

    setFormErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    });
    setFormErrors({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    });
  };

  return {
    formData,
    formErrors,
    handleInputChange,
    validateForm,
    resetForm,
  };
};
