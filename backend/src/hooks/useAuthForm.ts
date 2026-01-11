
import { useState } from 'react';
import { validateEmail, validatePassword, validateName, sanitizeInput } from '@/utils/inputValidation';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

interface FormErrors {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export const useAuthForm = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    const sanitizedValue = sanitizeInput(value, field === 'fullName' ? 50 : 255);
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (isSignUp: boolean = false) => {
    const errors: FormErrors = { email: '', password: '', confirmPassword: '', fullName: '' };
    let isValid = true;

    if (!formData.email) {
      errors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Email inválido';
      isValid = false;
    }

    if (isSignUp) {
      if (!formData.password) {
        errors.password = 'Senha é obrigatória';
        isValid = false;
      } else if (!validatePassword(formData.password)) {
        errors.password = 'Senha não atende aos critérios de segurança';
        isValid = false;
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'As senhas não coincidem';
        isValid = false;
      }

      if (!formData.fullName) {
        errors.fullName = 'Nome completo é obrigatório';
        isValid = false;
      } else if (!validateName(formData.fullName)) {
        errors.fullName = 'Nome deve ter entre 2 e 50 caracteres e conter apenas letras';
        isValid = false;
      }
    } else {
      if (!formData.password) {
        errors.password = 'Senha é obrigatória';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    });
    setFormErrors({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    });
  };

  return {
    formData,
    formErrors,
    handleInputChange,
    validateForm,
    resetForm
  };
};
