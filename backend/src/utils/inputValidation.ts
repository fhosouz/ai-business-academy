
export const sanitizeHtml = (input: string): string => {
  // Remove potential XSS vectors
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Check minimum length (8 characters)
  if (password.length < 8) return false;
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) return false;
  
  // Check for at least one number
  if (!/[0-9]/.test(password)) return false;
  
  return true;
};

export const validateName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 50 && /^[a-zA-ZÀ-ÿ\s'-]+$/.test(name);
};

export const sanitizeInput = (input: string, maxLength: number = 255): string => {
  return sanitizeHtml(input).substring(0, maxLength);
};
