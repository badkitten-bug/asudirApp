export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  if (!value || value.toString().trim() === '') {
    return {
      isValid: false,
      errors: [`${fieldName} es requerido`],
    };
  }
  return { isValid: true, errors: [] };
};

export const validateNumeric = (value: any, fieldName: string): ValidationResult => {
  if (isNaN(Number(value)) || Number(value) < 0) {
    return {
      isValid: false,
      errors: [`${fieldName} debe ser un número válido mayor a 0`],
    };
  }
  return { isValid: true, errors: [] };
};

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      errors: ['El formato del email no es válido'],
    };
  }
  return { isValid: true, errors: [] };
};

export const validateLength = (value: string, min: number, max: number, fieldName: string): ValidationResult => {
  if (value.length < min) {
    return {
      isValid: false,
      errors: [`${fieldName} debe tener al menos ${min} caracteres`],
    };
  }
  if (value.length > max) {
    return {
      isValid: false,
      errors: [`${fieldName} debe tener máximo ${max} caracteres`],
    };
  }
  return { isValid: true, errors: [] };
};

export const combineValidations = (...validations: ValidationResult[]): ValidationResult => {
  const allErrors = validations.flatMap(v => v.errors);
  const isValid = validations.every(v => v.isValid);
  
  return {
    isValid,
    errors: allErrors,
  };
}; 