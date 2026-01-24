export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateInput = (value: string, rules: ValidationRule): ValidationResult => {
  // Required validation
  if (rules.required && !value.trim()) {
    return { isValid: false, error: 'Este campo é obrigatório' };
  }

  // Email validation
  if (rules.email && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { isValid: false, error: 'Email inválido' };
    }
  }

  // Min length validation
  if (rules.minLength && value.length < rules.minLength) {
    return { 
      isValid: false, 
      error: `Mínimo de ${rules.minLength} caracteres` 
    };
  }

  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength) {
    return { 
      isValid: false, 
      error: `Máximo de ${rules.maxLength} caracteres` 
    };
  }

  // Pattern validation
  if (rules.pattern && value) {
    if (!rules.pattern.test(value)) {
      return { isValid: false, error: 'Formato inválido' };
    }
  }

  return { isValid: true };
};

export const validateEmail = (email: string): ValidationResult => {
  return validateInput(email, { required: true, email: true });
};

export const validatePassword = (password: string): ValidationResult => {
  return validateInput(password, { 
    required: true, 
    minLength: 6 
  });
};

export const validateName = (name: string): ValidationResult => {
  return validateInput(name, { 
    required: true, 
    minLength: 2, 
    maxLength: 50 
  });
};

export const sanitizeInput = (input: string, maxLength?: number): string => {
  return sanitizeInputWithMaxLength(input, maxLength);
};

export const sanitizeInputWithMaxLength = (input: string, maxLength?: number): string => {
  const sanitized = input
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers

  if (typeof maxLength === 'number' && maxLength > 0) {
    return sanitized.slice(0, maxLength);
  }

  return sanitized;
};
